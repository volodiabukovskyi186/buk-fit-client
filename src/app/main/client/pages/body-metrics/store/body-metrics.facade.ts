import { Injectable, OnDestroy, computed, signal } from '@angular/core';
import { Subject, combineLatest } from 'rxjs';
import { take, takeUntil } from 'rxjs/operators';
import { BodyMetricsEntry, BodyMetricsEntryCreate, BodyMetricsEntryUpdate, ChartDataPoint, ChartRange } from '../models/body-metrics.models';
import { BodyMetricsService, SurveyDefaults } from '../services/body-metrics.service';
import { GOAL_ENUM } from '../../../../../core/enums/goal.enum';

const MS_PER_DAY = 86_400_000;

@Injectable()
export class BodyMetricsFacade implements OnDestroy {

  private readonly destroy$ = new Subject<void>();

  // ─── Private State ──────────────────────────────────────────────────────────

  private readonly _loading = signal(false);
  private readonly _error = signal<string | null>(null);
  private readonly _entries = signal<BodyMetricsEntry[]>([]);
  private readonly _chartRange = signal<ChartRange>('30d');
  private readonly _surveyDefaults = signal<SurveyDefaults>({});

  // ─── Public Readonly Signals ─────────────────────────────────────────────────

  readonly loading = this._loading.asReadonly();
  readonly error = this._error.asReadonly();
  readonly entries = this._entries.asReadonly();
  readonly chartRange = this._chartRange.asReadonly();
  readonly surveyDefaults = this._surveyDefaults.asReadonly();
  readonly surveyGoal = computed<GOAL_ENUM>(() => {
    const goal = this._surveyDefaults().goal;
    const valid = Object.values(GOAL_ENUM) as string[];
    return (goal && valid.includes(goal)) ? goal : GOAL_ENUM.LOSE_WEIGHT;
  });

  readonly latestEntry = computed<BodyMetricsEntry | null>(() => this._entries()[0] ?? null);
  readonly previousEntry = computed<BodyMetricsEntry | null>(() => this._entries()[1] ?? null);

  readonly weightDelta = computed<number | null>(() => {
    const cur = this.latestEntry();
    const prev = this.previousEntry();
    if (!cur || !prev) return null;
    return +(cur.weightKg - prev.weightKg).toFixed(2);
  });

  readonly best30dWeight = computed<number | null>(() => {
    const cutoff = Date.now() - 30 * MS_PER_DAY;
    const recent = this._entries().filter(e => e.createdAt.toMillis() >= cutoff);
    if (!recent.length) return null;
    const goal = this._surveyDefaults().goal ?? GOAL_ENUM.LOSE_WEIGHT;
    return goal === GOAL_ENUM.GAIN_WEIGHT
      ? Math.max(...recent.map(e => e.weightKg))
      : Math.min(...recent.map(e => e.weightKg));
  });

  readonly best30dLabel = computed<string>(() => {
    const goal = this._surveyDefaults().goal ?? GOAL_ENUM.LOSE_WEIGHT;
    if (goal === GOAL_ENUM.GAIN_WEIGHT) return 'Макс. за 30 днів';
    if (goal === GOAL_ENUM.TONE_BODY)   return 'Мін. за 30 днів';
    return 'Мін. за 30 днів';
  });

  readonly best30dSubLabel = computed<string>(() => {
    const goal = this._surveyDefaults().goal ?? GOAL_ENUM.LOSE_WEIGHT;
    return goal === GOAL_ENUM.GAIN_WEIGHT ? 'найбільша вага' : 'найменша вага';
  });

  /** Weight change over the last 7 days: percent + absolute kg delta */
  readonly weight7dChange = computed<{ percent: number; kg: number } | null>(() => {
    const entries = this._entries(); // newest first
    if (entries.length < 2) return null;

    const latest = entries[0];
    const cutoff = latest.createdAt.toMillis() - 7 * MS_PER_DAY;
    const within7d = entries.filter(e => e.createdAt.toMillis() >= cutoff);

    if (within7d.length < 2) return null;

    const oldest = within7d[within7d.length - 1];
    const kg = +(latest.weightKg - oldest.weightKg).toFixed(2);
    const percent = +((kg / oldest.weightKg) * 100).toFixed(1);
    return { percent, kg };
  });

  readonly chartData = computed<ChartDataPoint[]>(() => {
    const range = this._chartRange();
    const entries = this._entries();
    const now = Date.now();

    const daysMap: Record<Exclude<ChartRange, 'all'>, number> = {
      '7d': 7,
      '30d': 30,
      '90d': 90,
    };

    const filtered =
      range === 'all'
        ? entries
        : entries.filter(
            e => e.createdAt.toMillis() >= now - daysMap[range] * MS_PER_DAY,
          );

    // chart expects ascending order
    return [...filtered].reverse().map(e => ({
      date: e.createdAt.toDate(),
      weightKg: e.weightKg,
    }));
  });

  // ─── Derived height for BMI ─────────────────────────────────────────────────
  // Returns the last known heightCm from any entry (or undefined).
  readonly lastKnownHeightCm = computed<number | undefined>(() =>
    this._entries().find(e => e.heightCm != null)?.heightCm,
  );

  // ─── Lifecycle ───────────────────────────────────────────────────────────────

  private userId?: string;

  constructor(private service: BodyMetricsService) {}

  load(userId: string): void {
    this.userId = userId;
    this._loading.set(true);
    this._error.set(null);

    combineLatest([
      this.service.getSurveyDefaults(userId),
      this.service.getClientWeight(userId),
    ]).pipe(take(1)).subscribe(([survey, clientWeight]) => {
      this._surveyDefaults.set({
        ...survey,
        // client profile weight is last-resort fallback if survey has no weight
        weightKg: survey.weightKg ?? (clientWeight ?? undefined),
      });
    });

    this.service
      .getEntries(userId)
      .pipe(takeUntil(this.destroy$))
      .subscribe({
        next: entries => {
          this._entries.set(entries);
          this._loading.set(false);
        },
        error: (err: Error) => {
          this._error.set(err?.message ?? 'Помилка завантаження даних');
          this._loading.set(false);
        },
      });
  }

  setRange(range: ChartRange): void {
    this._chartRange.set(range);
  }

  async addEntry(payload: BodyMetricsEntryCreate, photoFile?: File): Promise<void> {
    if (!this.userId) return;
    this._error.set(null);
    try {
      await this.service.addEntry(this.userId, payload, photoFile);
    } catch (err: any) {
      this._error.set(err?.message ?? 'Не вдалось зберегти запис');
      throw err;
    }
  }

  async updateEntry(id: string, payload: BodyMetricsEntryUpdate, photoFile?: File): Promise<void> {
    if (!this.userId) return;
    this._error.set(null);
    try {
      await this.service.updateEntry(this.userId, id, payload, photoFile);
    } catch (err: any) {
      this._error.set(err?.message ?? 'Не вдалось оновити запис');
      throw err;
    }
  }

  async deleteEntry(id: string): Promise<void> {
    if (!this.userId) return;
    this._error.set(null);
    try {
      await this.service.deleteEntry(this.userId, id);
    } catch (err: any) {
      this._error.set(err?.message ?? 'Не вдалось видалити запис');
      throw err;
    }
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}

import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
} from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Timestamp } from 'firebase/firestore';
import { BodyMetricsFacade } from '../../store/body-metrics.facade';
import {
  BodyMetricsEntryCreate,
  EntryDialogData,
  EntryDialogResult,
} from '../../models/body-metrics.models';
import { BodyMetricsEntryDialogComponent } from '../body-metrics-entry-dialog/body-metrics-entry-dialog.component';
import { ConfirmDeleteDialogComponent } from '../confirm-delete-dialog/confirm-delete-dialog.component';
import { formatWeight, weightDeltaSign } from '../../utils/bmi.utils';
import { GOAL_ENUM } from '../../../../../../core/enums/goal.enum';

@Component({
  selector: 'bk-body-metrics-details',
  templateUrl: './body-metrics-details.component.html',
  styleUrls: ['./body-metrics-details.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
  standalone: false,
})
export class BodyMetricsDetailsComponent {

  readonly facade = inject(BodyMetricsFacade);
  private readonly dialog = inject(MatDialog);

  // ─── Derived view data ────────────────────────────────────────────────────

  readonly heightCm = computed<number | undefined>(() =>
    this.facade.latestEntry()?.heightCm ?? this.facade.lastKnownHeightCm(),
  );

  readonly deltaDisplay = computed<string | null>(() => {
    const d = this.facade.weightDelta();
    return d != null ? weightDeltaSign(d) : null;
  });

  readonly prevEntryDate = computed<string | null>(() => {
    const p = this.facade.previousEntry();
    if (!p) return null;
    return p.createdAt.toDate().toLocaleDateString('uk-UA', {
      day: '2-digit', month: 'long', year: 'numeric',
    });
  });

  readonly latestEntryDatetime = computed<string>(() => {
    const e = this.facade.latestEntry();
    if (!e) return '';
    const d = e.createdAt.toDate();
    return d.toLocaleDateString('uk-UA', {
      day: '2-digit', month: 'long', year: 'numeric',
    }) + ' · ' + d.toLocaleTimeString('uk-UA', { hour: '2-digit', minute: '2-digit' });
  });

  readonly weightFormatted = computed<string>(() => {
    const e = this.facade.latestEntry();
    return e ? formatWeight(e.weightKg) : '—';
  });

  readonly best30dFormatted = computed<string>(() => {
    const v = this.facade.best30dWeight();
    return v != null ? `${formatWeight(v)} кг` : '—';
  });

  /** Full motivational block for 7-day weight change — goal-aware */
  readonly weight7dLevel = computed(() => {
    const c = this.facade.weight7dChange();
    if (!c) return null;

    const { kg, percent } = c;
    const goal = this.facade.surveyGoal();

    let emoji: string;
    let headline: string;
    let subtext: string;
    let accentColor: string;
    let accentBg: string;
    let level: string;
    let markerPercent: number;
    let exceedsLeft = false;
    let exceedsRight = false;
    let goalType: 'lose' | 'gain' | 'tone';
    let barLabels: string[];

    if (goal === GOAL_ENUM.GAIN_WEIGHT) {
      // ── Набір маси: хороше = позитивний %  ─────────────────────────────
      goalType = 'gain';
      barLabels = ['-1.5%', '-0.5%', '0%', '+0.5%', '+1.5%'];

      const clamped = Math.max(-1.5, Math.min(1.5, percent));
      markerPercent = Math.round((clamped + 1.5) / 3.0 * 100);
      exceedsLeft  = percent < -1.5;
      exceedsRight = percent > 1.5;

      if (percent > 1.5) {
        level = 'fast'; emoji = '🚀';
        headline = 'Швидкий набір!';
        subtext = 'Чудовий результат — стеж за якістю харчування';
        accentColor = '#27AE60'; accentBg = '#E6F7EE';
      } else if (percent >= 0.25) {
        level = 'perfect'; emoji = '🔥';
        headline = 'Ідеальний темп набору!';
        subtext = 'Саме такий ритм — безпечний та ефективний';
        accentColor = '#27AE60'; accentBg = '#E6F7EE';
      } else if (percent > 0) {
        level = 'slow'; emoji = '💪';
        headline = 'Є невеликий прогрес!';
        subtext = 'Збільш калорійність раціону та навантаження';
        accentColor = '#F2AF4A'; accentBg = '#FEF6E7';
      } else {
        level = 'loss'; emoji = '😤';
        headline = 'Вага знижується!';
        subtext = 'Перевір харчування — потрібно більше калорій';
        accentColor = '#E95032'; accentBg = '#FDECEA';
      }

    } else if (goal === GOAL_ENUM.TONE_BODY) {
      // ── Підтягування тіла: хороше = стабільна вага ±0.4%  ───────────────
      goalType = 'tone';
      barLabels = ['-1.5%', '-0.5%', '0%', '+0.5%', '+1.5%'];

      const clamped = Math.max(-1.5, Math.min(1.5, percent));
      markerPercent = Math.round((clamped + 1.5) / 3.0 * 100);
      exceedsLeft  = percent < -1.5;
      exceedsRight = percent > 1.5;

      const abs = Math.abs(percent);
      if (abs <= 0.4) {
        level = 'ideal'; emoji = '🔥';
        headline = 'Вага стабільна!';
        subtext = 'Ідеально для тонусу — тіло змінює склад';
        accentColor = '#27AE60'; accentBg = '#E6F7EE';
      } else if (abs <= 0.9) {
        level = 'moderate'; emoji = '💪';
        headline = 'Незначна зміна';
        subtext = 'Невеликі коливання — слідкуй за тренуваннями та харчуванням';
        accentColor = '#F2AF4A'; accentBg = '#FEF6E7';
      } else {
        level = 'extreme'; emoji = '⚠️';
        headline = 'Значна зміна ваги';
        subtext = percent < 0
          ? 'Вага суттєво знизилась — перевір калорійність раціону'
          : 'Вага суттєво зросла — переглянь харчування';
        accentColor = '#E95032'; accentBg = '#FDECEA';
      }

    } else {
      // ── Схуднення (LOSE_WEIGHT): хороше = негативний %  ─────────────────
      goalType = 'lose';
      barLabels = ['+1.5%', '+0.5%', '0%', '-0.5%', '-1.5%'];

      const clamped = Math.max(-1.5, Math.min(1.5, percent));
      markerPercent = Math.round((1.5 - clamped) / 3.0 * 100);
      exceedsLeft  = percent > 1.5;
      exceedsRight = percent < -1.5;

      if (percent < -1.5) {
        level = 'fast'; emoji = '🚀';
        headline = 'Швидке схуднення!';
        subtext = 'Чудовий результат — стеж за самопочуттям та харчуванням';
        accentColor = '#27AE60'; accentBg = '#E6F7EE';
      } else if (percent <= -0.5) {
        level = 'perfect'; emoji = '🔥';
        headline = 'Ідеальний темп!';
        subtext = 'Саме такий ритм — безпечний та ефективний';
        accentColor = '#27AE60'; accentBg = '#E6F7EE';
      } else if (percent < 0) {
        level = 'slow'; emoji = '💪';
        headline = 'Є рух вперед!';
        subtext = 'Маленькі кроки — теж перемога. Додай активності';
        accentColor = '#F2AF4A'; accentBg = '#FEF6E7';
      } else {
        level = 'gain'; emoji = '😤';
        headline = 'Не здавайся!';
        subtext = 'Цей тиждень не вдався — але ти можеш переломити тренд';
        accentColor = '#E95032'; accentBg = '#FDECEA';
      }
    }

    return {
      level, emoji, headline, subtext, accentColor, accentBg,
      markerPercent, exceedsLeft, exceedsRight,
      goalType, barLabels,
      kg: (kg > 0 ? '+' : '') + kg.toFixed(1),
      percent: (percent > 0 ? '+' : '') + percent.toFixed(1) + '%',
    };
  });

  // ─── Template helpers ─────────────────────────────────────────────────────

  readonly deltaIsPositive = computed(() => (this.facade.weightDelta() ?? 0) > 0);
  readonly deltaIsNegative = computed(() => (this.facade.weightDelta() ?? 0) < 0);

  /** For GAIN_WEIGHT goal — positive delta is good (green), negative is bad (red) */
  readonly deltaIsGood = computed(() => {
    const d = this.facade.weightDelta() ?? 0;
    const goal = this.facade.surveyGoal();
    if (goal === GOAL_ENUM.GAIN_WEIGHT) return d > 0;
    return d < 0; // LOSE_WEIGHT / TONE_BODY: down is good
  });
  readonly deltaIsBad = computed(() => {
    const d = this.facade.weightDelta() ?? 0;
    const goal = this.facade.surveyGoal();
    if (goal === GOAL_ENUM.GAIN_WEIGHT) return d < 0;
    return d > 0;
  });

  readonly hasSurveyData = computed(() => !!this.facade.surveyDefaults().weightKg);

  readonly surveyWeightFormatted = computed(() => {
    const w = this.facade.surveyDefaults().weightKg;
    return w ? formatWeight(w) : '—';
  });

  quickSaving = signal(false);

  // ─── Actions ──────────────────────────────────────────────────────────────

  async quickAddFromSurvey(): Promise<void> {
    const survey = this.facade.surveyDefaults();
    if (!survey.weightKg) { this.openAddDialog(); return; }
    this.quickSaving.set(true);
    try {
      const payload: BodyMetricsEntryCreate = {
        weightKg: survey.weightKg,
        createdAt: Timestamp.now(),
        ...(survey.waistCm  ? { waistCm:  survey.waistCm  } : {}),
        ...(survey.hipsCm   ? { hipsCm:   survey.hipsCm   } : {}),
        ...(survey.chestCm  ? { chestCm:  survey.chestCm  } : {}),
      };
      await this.facade.addEntry(payload);
    } finally {
      this.quickSaving.set(false);
    }
  }

  openAddDialog(): void {
    const latest = this.facade.latestEntry();
    const survey = this.facade.surveyDefaults();
    const data: EntryDialogData = {
      mode: 'create',
      defaultHeightCm: this.heightCm()   ?? survey.heightCm,
      defaultWeightKg: latest?.weightKg  ?? survey.weightKg,
      defaultWaistCm:  latest?.waistCm   ?? survey.waistCm,
      defaultHipsCm:   latest?.hipsCm    ?? survey.hipsCm,
      defaultChestCm:  latest?.chestCm   ?? survey.chestCm,
    };
    this.dialog
      .open(BodyMetricsEntryDialogComponent, {
        data,
        maxWidth: '100vw',
        width: '480px',
        panelClass: ['bk-dialog', 'bm-entry-dialog'],
        backdropClass: 'bm-backdrop-light',
      })
      .afterClosed()
      .subscribe((result: EntryDialogResult | null) => {
        if (result) {
          this.facade.addEntry(result.payload, result.photoFile);
        }
      });
  }

  openEditDialog(): void {
    const entry = this.facade.latestEntry();
    if (!entry) return;

    const data: EntryDialogData = {
      mode: 'edit',
      entry,
      defaultHeightCm: this.heightCm(),
    };
    this.dialog
      .open(BodyMetricsEntryDialogComponent, {
        data,
        maxWidth: '100vw',
        width: '480px',
        panelClass: ['bk-dialog', 'bm-entry-dialog'],
        backdropClass: 'bm-backdrop-light',
      })
      .afterClosed()
      .subscribe((result: EntryDialogResult | null) => {
        if (result && entry) {
          this.facade.updateEntry(entry.id, result.payload, result.photoFile);
        }
      });
  }

  openDeleteDialog(): void {
    const entry = this.facade.latestEntry();
    if (!entry) return;

    this.dialog
      .open(ConfirmDeleteDialogComponent, {
        data: {},
        width: '320px',
        panelClass: 'bk-dialog',
        backdropClass: 'bm-backdrop-light',
      })
      .afterClosed()
      .subscribe((confirmed: boolean) => {
        if (confirmed && entry) {
          this.facade.deleteEntry(entry.id);
        }
      });
  }
}

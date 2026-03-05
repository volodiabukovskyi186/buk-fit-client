import { Timestamp } from 'firebase/firestore';

// ─── Entry Model ────────────────────────────────────────────────────────────

export interface BodyMetricsEntry {
  id: string;
  userId: string;
  createdAt: Timestamp;
  weightKg: number;
  heightCm?: number;       // fallback to userProfile.heightCm if absent
  waistCm?: number;
  hipsCm?: number;
  chestCm?: number;
  photoUrl?: string;
  note?: string;
}

export type BodyMetricsEntryCreate = Omit<BodyMetricsEntry, 'id' | 'userId' | 'createdAt'> & {
  createdAt?: Timestamp;
};

export type BodyMetricsEntryUpdate = Partial<
  Omit<BodyMetricsEntry, 'id' | 'userId' | 'createdAt'>
>;

// ─── Chart ──────────────────────────────────────────────────────────────────

export type ChartRange = '7d' | '30d' | '90d' | 'all';

export interface ChartDataPoint {
  date: Date;
  weightKg: number;
}

// ─── BMI ────────────────────────────────────────────────────────────────────

export type BmiCategory = 'underweight' | 'healthy' | 'overweight' | 'obese';

export interface BmiStatus {
  bmi: number;
  category: BmiCategory;
  label: string;
  emoji: string;
  color: string;
  badgeBg: string;
}

// ─── Dialog ─────────────────────────────────────────────────────────────────

export interface EntryDialogData {
  mode: 'create' | 'edit';
  entry?: BodyMetricsEntry;
  defaultHeightCm?: number;
  defaultWeightKg?: number;
  defaultWaistCm?: number;
  defaultHipsCm?: number;
  defaultChestCm?: number;
}

export interface EntryDialogResult {
  payload: BodyMetricsEntryCreate;
  photoFile?: File;
}

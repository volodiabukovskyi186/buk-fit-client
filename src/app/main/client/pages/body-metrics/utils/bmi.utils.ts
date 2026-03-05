import { BmiCategory, BmiStatus } from '../models/body-metrics.models';

// BMI scale: visual range 15–40 (25 units total)
const BMI_SCALE_MIN = 15;
const BMI_SCALE_MAX = 40;

const BMI_THRESHOLDS = {
  healthy: 18.5,
  overweight: 25.0,
  obese: 30.0,
};

export function calcBmi(weightKg: number, heightCm: number): number {
  if (heightCm <= 0 || weightKg <= 0) return 0;
  const heightM = heightCm / 100;
  return weightKg / (heightM * heightM);
}

export function getBmiCategory(bmi: number): BmiCategory {
  if (bmi < BMI_THRESHOLDS.healthy) return 'underweight';
  if (bmi < BMI_THRESHOLDS.overweight) return 'healthy';
  if (bmi < BMI_THRESHOLDS.obese) return 'overweight';
  return 'obese';
}

const CATEGORY_META: Record<
  BmiCategory,
  { label: string; emoji: string; color: string; badgeBg: string }
> = {
  underweight: {
    label: 'Низький',
    emoji: '😟',
    color: '#3FA1FB',
    badgeBg: '#E8F4FF',
  },
  healthy: {
    label: 'Здоровий',
    emoji: '😊',
    color: '#27AE60',
    badgeBg: '#E6F7EE',
  },
  overweight: {
    label: 'Високий',
    emoji: '🙂',
    color: '#F2AF4A',
    badgeBg: '#FEF6E7',
  },
  obese: {
    label: 'Ожиріння',
    emoji: '😔',
    color: '#E95032',
    badgeBg: '#FDECEA',
  },
};

export function getBmiStatus(weightKg: number, heightCm: number): BmiStatus {
  const bmi = calcBmi(weightKg, heightCm);
  const category = getBmiCategory(bmi);
  return {
    bmi,
    category,
    ...CATEGORY_META[category],
  };
}

/**
 * Returns marker position 0–100 (%) on the BMI visual scale [15, 40].
 */
export function bmiToScalePercent(bmi: number): number {
  const clamped = Math.max(BMI_SCALE_MIN, Math.min(BMI_SCALE_MAX, bmi));
  return ((clamped - BMI_SCALE_MIN) / (BMI_SCALE_MAX - BMI_SCALE_MIN)) * 100;
}

/**
 * Returns widths (%) for each segment on the 15–40 scale.
 * Segments: underweight [15,18.5), healthy [18.5,25), overweight [25,30), obese [30,40]
 */
export function getBmiSegmentWidths(): {
  underweight: number;
  healthy: number;
  overweight: number;
  obese: number;
} {
  const total = BMI_SCALE_MAX - BMI_SCALE_MIN; // 25
  return {
    underweight: ((BMI_THRESHOLDS.healthy - BMI_SCALE_MIN) / total) * 100,    // 14%
    healthy: ((BMI_THRESHOLDS.overweight - BMI_THRESHOLDS.healthy) / total) * 100,  // 26%
    overweight: ((BMI_THRESHOLDS.obese - BMI_THRESHOLDS.overweight) / total) * 100, // 20%
    obese: ((BMI_SCALE_MAX - BMI_THRESHOLDS.obese) / total) * 100,                  // 40%
  };
}

export function formatBmi(bmi: number): string {
  return bmi.toFixed(1);
}

export function formatWeight(kg: number): string {
  return kg % 1 === 0 ? `${kg}` : kg.toFixed(1);
}

export function weightDeltaSign(delta: number): string {
  if (delta > 0) return `+${delta.toFixed(1)}`;
  if (delta < 0) return delta.toFixed(1);
  return '0';
}


// Constants
export const EARLY_RETIREMENT_AGE = 62;
export const WAGE_INDEX_CUTOFF = 2023;
export const MAX_RETIREMENT_AGE = 70;
export const LOOKBACK_YEARS = 35;

export const BEND_POINT_DIVISOR = 9779.44;
export const FIRST_BEND_POINT_MULTIPLIER = 180;
export const SECOND_BEND_POINT_MULTIPLIER = 1085;

export const PIA_PERCENTAGES = {
  FIRST_BRACKET: 0.9,
  SECOND_BRACKET: 0.32,
  THIRD_BRACKET: 0.15
} as const;

export const EARLY_RETIREMENT_REDUCTION_RATES = {
  FIRST_36_MONTHS: 5 / 9 * 0.01, // 5/9 of 1%
  ADDITIONAL_MONTHS: 5 / 12 * 0.01 // 5/12 of 1%
} as const;

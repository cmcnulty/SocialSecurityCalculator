
// Constants
export const EARLY_RETIREMENT_AGE = 62;
export const WAGE_INDEX_CUTOFF = 2024;
export const MAX_RETIREMENT_AGE = 70;
// LOOKBACK_YEARS This represents the working years between 22 and 62,
// but it does not filter out the wages of years before and after that range.
// There is also a drop out of 5 years, to intentionally ignore the lowest 5 years of earnings.
// Therefore the effective lookback years for Reitirement AIME is 35 years (62 - 22 = 40, minus 5 drop out = 35).
export const LOOKBACK_YEARS = 40;
export const MAX_DROP_OUT_YEARS = 5; // Number of years to drop out for AIME calculation
export const DROP_OUT_YEARS_DIVISOR = 5; // Number of years to divide by for AIME calculation
export const ELAPSED_YEARS_START_AGE = 22;

export const BEND_POINT_DIVISOR = 9779.44; // 1977's AWI - used by dividing against current AWI
export const FIRST_BEND_POINT_MULTIPLIER = 180;
export const SECOND_BEND_POINT_MULTIPLIER = 1085;
export const FAM_MAX_BASES = [230, 332, 433];

export const CHILD_SURVIVOR_BENEFIT_PERCENTAGE = 0.75; // 75% of PIA for child survivor benefits

export const PIA_PERCENTAGES = {
  FIRST_BRACKET: 0.9,
  SECOND_BRACKET: 0.32,
  THIRD_BRACKET: 0.15
} as const;

export const EARLY_RETIREMENT_REDUCTION = {
  FIRST_MONTHS: 36,
  FIRST_MONTHS_RATE: 5 / 9 * 0.01, // 5/9 of 1%
  ADDITIONAL_MONTHS_RATE: 5 / 12 * 0.01 // 5/12 of 1%
} as const;

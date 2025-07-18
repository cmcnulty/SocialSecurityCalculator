import { BenefitCalculationResult, RetirementDates, Wages, Earnings } from './model';
import { wageIndex } from './wage-index';
import {
  EARLY_RETIREMENT_AGE,
  WAGE_INDEX_CUTOFF,
  MAX_RETIREMENT_AGE,
  LOOKBACK_YEARS,
  BEND_POINT_DIVISOR,
  FIRST_BEND_POINT_MULTIPLIER,
  SECOND_BEND_POINT_MULTIPLIER,
  PIA_PERCENTAGES,
  EARLY_RETIREMENT_REDUCTION_RATES
} from './constants';

// Main calculation function
export function calc(birthday: Date, retirementDate: Date, earnings: Earnings): BenefitCalculationResult {
  // Validation
  if (!birthday || !retirementDate) {
    throw new Error('Birthday and retirement date are required');
  }

  if (!earnings || earnings.length === 0) {
    throw new Error('Earnings history cannot be empty');
  }

  if (retirementDate < birthday) {
    throw new Error('Retirement date cannot be before birthday');
  }

  const lastYearEarnings = earnings
    .filter(wage => wage.earnings > 0)
    .reduce((max, wage) => Math.max(max, wage.year), 0);

  const yearAge60 = birthday.getFullYear() + 60;
  const averageIndexedMonthlyEarnings = calculateAIME(earnings, yearAge60);
  const results = calcRetirementBenefit(birthday, lastYearEarnings, retirementDate, averageIndexedMonthlyEarnings);

  return results;
}

export function calcRetirementBenefit(
  birthday: Date,
  lastYearEarnings: number,
  retirementDate: Date,
  AIME: number
): BenefitCalculationResult {
  const dates = calculateRetirementDates(birthday, retirementDate);
  const age60Year = dates.eclBirthDate.getFullYear() + 60;
  const primaryInsuranceAmount = calculatePIA(AIME, age60Year);

  // Calculate COLA adjustments
  const colaAdjustedPIA = calculateCOLAAdjustments(primaryInsuranceAmount, age60Year + 2);

  // Calculate early/delayed retirement adjustments
  const earlyRetireMonths = monthsDifference(dates.adjusted, dates.fullRetirement);
  let adjustedBenefits = colaAdjustedPIA;

  if (retirementDate < dates.earliestRetirement) {
    adjustedBenefits = 0;
  } else if (earlyRetireMonths < 0) {
    adjustedBenefits = calculateEarlyRetirementReduction(colaAdjustedPIA, Math.abs(earlyRetireMonths));
  } else if (earlyRetireMonths > 0) {
    adjustedBenefits = calculateDelayedRetirementIncrease(dates.eclBirthDate, colaAdjustedPIA, earlyRetireMonths);
  }

  const monthlyBenefit = Math.floor(adjustedBenefits);

  return {
    AIME: AIME,
    NormalMonthlyBenefit: monthlyBenefit,
  };
}

function calculateRetirementDates(birthday: Date, retirementDate: Date): RetirementDates & { eclBirthDate: Date } {
  const eclBirthDate = getEnglishCommonLawDate(birthday);
  const fraMonths = getFullRetirementMonths(eclBirthDate);

  const earliestRetirement = new Date(
    eclBirthDate.getFullYear() + EARLY_RETIREMENT_AGE,
    eclBirthDate.getMonth(),
    eclBirthDate.getDate()
  );

  const fullRetirement = new Date(
    eclBirthDate.getFullYear(),
    eclBirthDate.getMonth() + fraMonths,
    eclBirthDate.getDate()
  );

  const maxRetirement = new Date(
    eclBirthDate.getFullYear() + MAX_RETIREMENT_AGE,
    eclBirthDate.getMonth(),
    eclBirthDate.getDate()
  );

  const adjusted = retirementDate > maxRetirement ? maxRetirement : retirementDate;

  return {
    earliestRetirement,
    fullRetirement,
    maxRetirement,
    adjusted,
    eclBirthDate
  };
}

function calculateCOLAAdjustments(PIA: number, startYear: number): number {
  const currentYear = new Date().getFullYear();
  const colaRates = wageIndex
    .filter(wage => wage.year >= startYear && wage.year < currentYear)
    .map(wage => wage.cola);

  return colaRates.reduce((adjustedAmount, rate) => {
    const multiplier = 1 + (rate / 100);
    return roundToFloorTenCents(adjustedAmount * multiplier);
  }, PIA);
}

export function calculatePIA(AIME: number, baseYear?: number): number {
  const effectiveYear = baseYear ? Math.min(baseYear, WAGE_INDEX_CUTOFF) : WAGE_INDEX_CUTOFF;

  const wageIndexEntry = wageIndex.find(val => val.year === effectiveYear);
  if (!wageIndexEntry) {
    throw new Error(`No wage index data found for year ${effectiveYear}`);
  }

  const wageIndexLastYear = wageIndexEntry.awi;

  // Calculate bend points (rounded to nearest dollar per SSA rules)
  const firstBendPoint = Math.round(FIRST_BEND_POINT_MULTIPLIER * wageIndexLastYear / BEND_POINT_DIVISOR);
  const secondBendPoint = Math.round(SECOND_BEND_POINT_MULTIPLIER * wageIndexLastYear / BEND_POINT_DIVISOR);

  let monthlyBenefit: number;

  if (AIME <= firstBendPoint) {
    monthlyBenefit = PIA_PERCENTAGES.FIRST_BRACKET * AIME;
  } else if (AIME <= secondBendPoint) {
    monthlyBenefit =
      PIA_PERCENTAGES.FIRST_BRACKET * firstBendPoint +
      PIA_PERCENTAGES.SECOND_BRACKET * (AIME - firstBendPoint);
  } else {
    monthlyBenefit =
      PIA_PERCENTAGES.FIRST_BRACKET * firstBendPoint +
      PIA_PERCENTAGES.SECOND_BRACKET * (secondBendPoint - firstBendPoint) +
      PIA_PERCENTAGES.THIRD_BRACKET * (AIME - secondBendPoint);
  }

  return roundToFloorTenCents(monthlyBenefit);
}

export function calculateAIME(earnings: Earnings, baseYear?: number): number {
  if (!earnings || earnings.length === 0) {
    return 0;
  }

  const effectiveYear = baseYear ? Math.min(baseYear, WAGE_INDEX_CUTOFF) : WAGE_INDEX_CUTOFF;

  const wageIndexEntry = wageIndex.find(val => val.year === effectiveYear);
  if (!wageIndexEntry) {
    throw new Error(`No wage index data found for year ${effectiveYear}`);
  }

  const wageIndexLastYear = wageIndexEntry.awi;
  const futureYearsFactor = 1;

  // Calculate wage index factors
  const wageIndexFactors = wageIndex.reduce((acc, { year, awi }) => {
    acc[year] = 1 + (Math.max(0, wageIndexLastYear - awi)) / awi;
    return acc;
  }, {} as Record<number, number>);

  // Adjust earnings according to wage index factor
  const adjustedEarnings = earnings.reduce((acc, { year, earnings }) => {
    acc[year] = earnings * (wageIndexFactors[year] || futureYearsFactor);
    return acc;
  }, {} as Record<number, number>);

  // Get top 35 years of earnings
  const top35YearsEarningsArr = Object.values(adjustedEarnings)
    .sort((a, b) => b - a)
    .slice(0, LOOKBACK_YEARS);

  const totalEarnings = top35YearsEarningsArr.reduce((sum, earnings) => sum + earnings, 0);

  // Calculate AIME (rounded down to next lower dollar)
  const averageIndexedMonthlyEarnings = Math.floor(totalEarnings / (12 * LOOKBACK_YEARS));
  return averageIndexedMonthlyEarnings;
}

function calculateEarlyRetirementReduction(amount: number, months: number): number {
  if (months <= 0) return amount;

  let reduction: number;

  if (months <= 36) {
    reduction = months * EARLY_RETIREMENT_REDUCTION_RATES.FIRST_36_MONTHS;
  } else {
    reduction =
      36 * EARLY_RETIREMENT_REDUCTION_RATES.FIRST_36_MONTHS +
      (months - 36) * EARLY_RETIREMENT_REDUCTION_RATES.ADDITIONAL_MONTHS;
  }

  return amount * (1 - reduction);
}

function calculateDelayedRetirementIncrease(birthday: Date, initialAmount: number, numberOfMonths: number): number {
  if (numberOfMonths <= 0) return initialAmount;

  const birthYear = birthday.getFullYear();
  const monthlyRate = getDelayedRetirementRate(birthYear);

  const totalIncrease = monthlyRate * numberOfMonths;
  return initialAmount * (1 + totalIncrease);
}

function getDelayedRetirementRate(birthYear: number): number {
  if (birthYear < 1933) {
    throw new Error(`Invalid birth year for delayed retirement: ${birthYear}`);
  }

  // Rates based on SSA rules
  if (birthYear <= 1934) return 11 / 24 / 100;  // 11/24 of 1%
  if (birthYear <= 1936) return 0.005;           // 1/2 of 1%
  if (birthYear <= 1938) return 13 / 24 / 100;  // 13/24 of 1%
  if (birthYear <= 1940) return 7 / 12 / 100;   // 7/12 of 1%
  if (birthYear <= 1942) return 5 / 8 / 100;    // 5/8 of 1%
  return 2 / 3 / 100;                            // 2/3 of 1%
}

function roundToFloorTenCents(amount: number): number {
  // Convert to dimes, floor, then convert back to dollars
  return Math.floor(amount * 10) / 10;
}

export function getEnglishCommonLawDate(date: Date): Date {
  // Create a new date to avoid mutating the original
  const eclDate = new Date(date);
  eclDate.setDate(eclDate.getDate() - 1);
  return eclDate;
}

export function getFullRetirementMonths(commonLawBirthDate: Date): number {
  const year = commonLawBirthDate.getFullYear();

  if (year <= 1937) {
    return 65 * 12;
  } else if (year <= 1942) {
    // Gradual increase from 65 years to 65 years 10 months
    return ((year - 1937) * 2) + (65 * 12);
  } else if (year <= 1954) {
    return 66 * 12;
  } else if (year <= 1959) {
    // Gradual increase from 66 years to 66 years 10 months
    return ((year - 1954) * 2) + (66 * 12);
  } else if (year >= 1960) {
    return 67 * 12;
  } else {
    throw new Error(`Invalid birth year: ${year}`);
  }
}

function monthsDifference(date1: Date, date2: Date): number {
  const months1 = date1.getFullYear() * 12 + date1.getMonth();
  const months2 = date2.getFullYear() * 12 + date2.getMonth();
  return months1 - months2;
}

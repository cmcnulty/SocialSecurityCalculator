import { BenefitCalculationResult, RetirementDates, WageIndex, Earnings } from './model';
import { wageIndex } from './wage-index';
import {
  EARLY_RETIREMENT_AGE,
  WAGE_INDEX_CUTOFF,
  MAX_RETIREMENT_AGE,
  MAX_DROP_OUT_YEARS,
  DROP_OUT_YEARS_DIVISOR,
  BEND_POINT_DIVISOR,
  FIRST_BEND_POINT_MULTIPLIER,
  SECOND_BEND_POINT_MULTIPLIER,
  PIA_PERCENTAGES,
  EARLY_RETIREMENT_REDUCTION,
  ELAPSED_YEARS_START_AGE,
  LOOKBACK_YEARS,
  CHILD_SURVIVOR_BENEFIT_PERCENTAGE,
  FAM_MAX_BASES
} from './constants';

// Core calculation context that holds common data
interface CalculationContext {
  birthday: Date;
  retirementDate: Date;
  earnings: Earnings;
  dates: RetirementDates;
  yearAge60: number;
  yearStartCounting: number;
  dateStartCounting: Date;
  totalYears: number;
}

// Main entry point
export function calc(birthday: Date, retirementDate: Date, earnings: Earnings): BenefitCalculationResult {
  const retirementCalc = calcRetirement(birthday, retirementDate, earnings);
  const survivorCalc = calcSurvivor(birthday, retirementDate, earnings);

  retirementCalc.SurvivorBenefits = survivorCalc;
  return retirementCalc as BenefitCalculationResult;
}

// Benefit calculation pipeline
interface BenefitCalculation {
  aime: number;
  pia: number;
  colaAdjustedPIA: number;
}

// Core retirement calculation
export function calcRetirement(birthday: Date, retirementDate: Date, earnings: Earnings): Partial<BenefitCalculationResult> {
  const context = createCalculationContext(birthday, retirementDate, earnings);

  const regularBenefit = calculateBenefitPipeline(earnings, context.yearAge60, getLookbackYears(context.totalYears));
  const disabilityBenefit = calculateBenefitPipeline(earnings, context.yearAge60, getLookbackYearsDisability(context.totalYears));

  const monthlyBenefit = retirementDateAdjustedPayment(context.dates, regularBenefit.colaAdjustedPIA);
  const disabilityPIAFloored = context.retirementDate > context.dates.fullRetirement ? 0 : Math.floor(disabilityBenefit.colaAdjustedPIA);

  return {
    AIME: regularBenefit.aime,
    PIA: regularBenefit.pia,
    NormalMonthlyBenefit: monthlyBenefit,
    DisabilityEarnings: disabilityPIAFloored,
  };
}

// Reusable benefit calculation pipeline
function calculateBenefitPipeline(earnings: Earnings, yearAge60: number, lookbackYears: number): BenefitCalculation {
  const aime = calculateAIME(earnings, lookbackYears, yearAge60);
  const pia = calculatePIA(aime, yearAge60);
  const colaAdjustedPIA = calculateCOLAAdjustments(pia, yearAge60 + 2);

  return { aime, pia, colaAdjustedPIA };
}

// Survivor benefits calculation
function calcSurvivor(birthday: Date, retirementDate: Date, earnings: Earnings) {
  const context = createCalculationContext(birthday, retirementDate, earnings);
  const benefit = calculateBenefitPipeline(earnings, context.yearAge60, getLookbackYears(context.totalYears));
  const survivorPIA = Math.floor(benefit.colaAdjustedPIA * CHILD_SURVIVOR_BENEFIT_PERCENTAGE);
  const effectiveYear = Math.min(context.yearAge60, WAGE_INDEX_CUTOFF);
  const wageIndexEntry = getWageIndexEntry(effectiveYear);
  const wageIndexLastYear = wageIndexEntry.awi;
  const familyMax = calculateFamilyMaximum(benefit.pia, getFamilyMaxBendPoints(wageIndexLastYear));
  const colaAdjustedFamMax = calculateCOLAAdjustments(familyMax, context.yearAge60 + 2);

  return {
    survivingChild: survivorPIA,
    careGivingSpouse: survivorPIA,
    normalRetirementSpouse: Math.floor(benefit.colaAdjustedPIA),
    familyMaximum: colaAdjustedFamMax
  };
}

// Create shared calculation context to avoid duplication
function createCalculationContext(birthday: Date, retirementDate: Date, earnings: Earnings): CalculationContext {
  validateInputs(birthday, retirementDate, earnings);
  const dates = calculateRetirementDates(birthday, retirementDate);
  const yearAge60 = birthday.getFullYear() + 60;
  const yearStartCounting = birthday.getFullYear() + ELAPSED_YEARS_START_AGE - 1;
  const dateStartCounting = new Date(birthday);
  dateStartCounting.setFullYear(yearStartCounting);

  const monthsDiff = monthsDifference(retirementDate, dateStartCounting) / 12;
  const totalYears = Math.min(LOOKBACK_YEARS, monthsDiff);

  return {
    birthday,
    retirementDate,
    earnings,
    dates,
    yearAge60,
    yearStartCounting,
    dateStartCounting,
    totalYears
  };
}

// Extracted validation logic
function validateInputs(birthday: Date, retirementDate: Date, earnings: Earnings): void {
  if (!birthday || !retirementDate) {
    throw new Error('Birthday and retirement date are required');
  }

  if (!earnings || earnings.length === 0) {
    throw new Error('Earnings history cannot be empty');
  }

  if (retirementDate < birthday) {
    throw new Error('Retirement date cannot be before birthday');
  }
}

// Retirement date calculations
function calculateRetirementDates(birthday: Date, retirementDate: Date): RetirementDates {
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
    eclBirthDate,
    retirementDate
  };
}

// Benefit amount calculations
function retirementDateAdjustedPayment(dates: RetirementDates, colaAdjustedPIA: number): number {
  const earlyRetireMonths = monthsDifference(dates.adjusted, dates.fullRetirement);
  let adjustedBenefits = colaAdjustedPIA;

  if (dates.retirementDate < dates.earliestRetirement) {
    adjustedBenefits = 0;
  } else if (earlyRetireMonths < 0) {
    adjustedBenefits = calculateEarlyRetirementReduction(colaAdjustedPIA, Math.abs(earlyRetireMonths));
  } else if (earlyRetireMonths > 0) {
    adjustedBenefits = calculateDelayedRetirementIncrease(dates.eclBirthDate, colaAdjustedPIA, earlyRetireMonths);
  }

  return Math.floor(adjustedBenefits);
}

// COLA adjustments
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

// PIA calculation
export function calculatePIA(AIME: number, baseYear?: number): number {
  const effectiveYear = baseYear ? Math.min(baseYear, WAGE_INDEX_CUTOFF) : WAGE_INDEX_CUTOFF;
  const wageIndexEntry = getWageIndexEntry(effectiveYear);
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

// AIME calculation
export function calculateAIME(earnings: Earnings, lookbackYears: number, baseYear?: number): number {
  if (!earnings || earnings.length === 0) {
    return 0;
  }
  const effectiveYear = baseYear ? Math.min(baseYear, WAGE_INDEX_CUTOFF) : WAGE_INDEX_CUTOFF;
  const wageIndexEntry = getWageIndexEntry(effectiveYear);
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

  // Get top years of earnings based on lookback period
  const topYearsEarningsArr = Object.values(adjustedEarnings)
    .sort((a, b) => b - a)
    .slice(0, lookbackYears);

  const totalEarnings = topYearsEarningsArr.reduce((sum, earnings) => sum + earnings, 0);

  // Calculate AIME (rounded down to next lower dollar)
  return Math.floor(totalEarnings / (12 * lookbackYears));
}

// Lookback year calculations
function getLookbackYears(elapsedYears: number): number {
  const minComputationYears = 2;
  const adjustedLookbackYears = Math.floor(elapsedYears) - 5;
  return Math.max(minComputationYears, adjustedLookbackYears);
}

function getLookbackYearsDisability(elapsedYears: number): number {
  const minComputationYears = 2;
  const dropOutYears = Math.min(Math.floor(elapsedYears / DROP_OUT_YEARS_DIVISOR), MAX_DROP_OUT_YEARS);
  const adjustedLookbackYears = elapsedYears - dropOutYears;
  return Math.max(minComputationYears, adjustedLookbackYears);
}

// Early retirement reduction
function calculateEarlyRetirementReduction(amount: number, months: number): number {
  if (months <= 0) return amount;

  let reduction: number;

  if (months <= EARLY_RETIREMENT_REDUCTION.FIRST_MONTHS) {
    reduction = months * EARLY_RETIREMENT_REDUCTION.FIRST_MONTHS_RATE;
  } else {
    reduction =
      EARLY_RETIREMENT_REDUCTION.FIRST_MONTHS * EARLY_RETIREMENT_REDUCTION.FIRST_MONTHS_RATE +
      (months - EARLY_RETIREMENT_REDUCTION.FIRST_MONTHS) * EARLY_RETIREMENT_REDUCTION.ADDITIONAL_MONTHS_RATE;
  }

  return amount * (1 - reduction);
}

// Delayed retirement increase
function calculateDelayedRetirementIncrease(birthday: Date, initialAmount: number, numberOfMonths: number): number {
  if (numberOfMonths <= 0) return initialAmount;

  const birthYear = birthday.getFullYear();
  const monthlyRate = getDelayedRetirementRate(birthYear);
  const totalIncrease = monthlyRate * numberOfMonths;

  return initialAmount * (1 + totalIncrease);
}

// Delayed retirement rate lookup
function getDelayedRetirementRate(birthYear: number): number {
  if (birthYear < 1933) {
    throw new Error(`Invalid birth year for delayed retirement: ${birthYear}`);
  }

  if (birthYear <= 1934) return 11 / 24 / 100;  // 11/24 of 1%
  if (birthYear <= 1936) return 0.005;           // 1/2 of 1%
  if (birthYear <= 1938) return 13 / 24 / 100;  // 13/24 of 1%
  if (birthYear <= 1940) return 7 / 12 / 100;   // 7/12 of 1%
  if (birthYear <= 1942) return 5 / 8 / 100;    // 5/8 of 1%
  return 2 / 3 / 100;                            // 2/3 of 1%
}

// Full retirement age calculation
function getFullRetirementMonths(commonLawBirthDate: Date): number {
  const year = commonLawBirthDate.getFullYear();

  if (year <= 1937) {
    return 65 * 12;
  } else if (year <= 1942) {
    return ((year - 1937) * 2) + (65 * 12);
  } else if (year <= 1954) {
    return 66 * 12;
  } else if (year <= 1959) {
    return ((year - 1954) * 2) + (66 * 12);
  } else if (year >= 1960) {
    return 67 * 12;
  } else {
    throw new Error(`Invalid birth year: ${year}`);
  }
}

/** Compute Family-Max bend points for an eligibility year given AWI_{year-2}. */
function getFamilyMaxBendPoints(baseYear: number): [number, number, number] {
  const [f1, f2, f3] = FAM_MAX_BASES.map(b => Math.round((b * baseYear / BEND_POINT_DIVISOR)));
  return [f1, f2, f3];
}

/** Apply the family-maximum formula to a PIA using already-computed bend points. */
function calculateFamilyMaximum(pia: number, [bp1, bp2, bp3]: [number, number, number]): number {
  let max = 0;
  max += 1.50 * Math.min(pia, bp1);
  if (pia > bp1) max += 2.72 * (Math.min(pia, bp2) - bp1);
  if (pia > bp2) max += 1.34 * (Math.min(pia, bp3) - bp2);
  if (pia > bp3) max += 1.75 * (pia - bp3);
  // SSA: round total down to next lower $0.10
  return Math.floor(max * 10) / 10;
}

// Utility functions
export function getEnglishCommonLawDate(date: Date): Date {
  const eclDate = new Date(date);
  eclDate.setDate(eclDate.getDate() - 1);
  return eclDate;
}

function monthsDifference(date1: Date, date2: Date): number {
  const months1 = date1.getFullYear() * 12 + date1.getMonth();
  const months2 = date2.getFullYear() * 12 + date2.getMonth();
  return months1 - months2;
}

function roundToFloorTenCents(amount: number): number {
  return Math.floor(amount * 10) / 10;
}

function getWageIndexEntry(effectiveYear: number): WageIndex {
  const wageIndexEntry = wageIndex.find(val => val.year === effectiveYear);
  if (!wageIndexEntry) {
    throw new Error(`No wage index data found for year ${effectiveYear}`);
  }
  return wageIndexEntry;
}

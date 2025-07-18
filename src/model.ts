export type Earnings = {
    year: number,
    earnings: number,
}[];

export type Wage = {
    year: number,
    retirement: number,
    disability: number,
    survivors: number,
    taxMax: number,
    cola: number,
    awi: number
}

export type Wages = Wage[];

export interface BenefitCalculationResult {
  AIME: number;
  NormalMonthlyBenefit: number;
}

export interface RetirementDates {
  earliestRetirement: Date;
  fullRetirement: Date;
  maxRetirement: Date;
  adjusted: Date;
}

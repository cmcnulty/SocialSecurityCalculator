export type Earnings = {
    year: number,
    earnings: number,
}[];

export type WageIndex = {
    year: number,
    taxMax: number,
    cola: number,
    awi: number
}

// export type Wages = WageIndex[];

export interface BenefitCalculationResult {
  AIME: number;
  PIA: number;
  NormalMonthlyBenefit: number;
  DisabilityEarnings: number;
}

export interface RetirementDates {
  earliestRetirement: Date;
  fullRetirement: Date;
  maxRetirement: Date;
  adjusted: Date;
  eclBirthDate: Date;
  retirementDate: Date;
}

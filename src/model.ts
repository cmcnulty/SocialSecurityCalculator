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
  SurvivorBenefits: any; // Adjust this type based on your actual structure
}

export interface RetirementDates {
  earliestRetirement: Date;
  fullRetirement: Date;
  maxRetirement: Date;
  adjusted: Date;
  eclBirthDate: Date;
  retirementDate: Date;
}

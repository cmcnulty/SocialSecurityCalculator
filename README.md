# Social Security Benefits Calculator

A TypeScript library for calculating Social Security retirement benefits based on official SSA formulas. This calculator handles Average Indexed Monthly Earnings (AIME), Primary Insurance Amount (PIA), and adjustments for early or delayed retirement.

## Credits

This project is forked from [Ryan Antkowiak's SocialSecurityCalculator](https://github.com/antkowiak/SocialSecurityCalculator) python implementation. The original implementation has been refactored with COLA adjustments to bring it into alignment with SSA's Quick Calculator.

## Features

- Calculate Average Indexed Monthly Earnings (AIME) based on earnings history
- Determine Primary Insurance Amount (PIA) using current bend points
- Apply Cost of Living Adjustments (COLA)
- Handle early retirement reductions
- Calculate delayed retirement credits
- Full TypeScript support with comprehensive type definitions

## Installation

```bash
npm install social-security-calculator
```

## Usage

### Quick Start

```typescript
import { calc } from 'social-security-calculator';

const result = calc(
  new Date(1960, 0, 15),     // Birthday: January 15, 1960
  new Date(2027, 0, 15),     // Retirement: January 15, 2027
  [
    { year: 1982, earnings: 12000 },
    { year: 1983, earnings: 15000 },
    // ... add more years of earnings
    { year: 2025, earnings: 87000 }
  ]
);

console.log(`Monthly benefit: ${result.NormalMonthlyBenefit}`);
```

### Early Retirement Example

```typescript
const birthDate = new Date(1965, 5, 1); // June 1, 1965
const earlyRetirement = new Date(2027, 5, 1); // June 1, 2027 (at age 62)

const result = calc(birthDate, earlyRetirement, earnings);
// Benefits will be reduced for early retirement
```

### Delayed Retirement Example

```typescript
const birthDate = new Date(1955, 2, 15); // March 15, 1955
const delayedRetirement = new Date(2025, 2, 15); // March 15, 2025 (at age 70)

const result = calc(birthDate, delayedRetirement, earnings);
// Benefits will include delayed retirement credits
```

## API Reference

### Main Functions

#### `calc(birthday: Date, retirementDate: Date, earnings: Earnings): BenefitCalculationResult`

Calculates Social Security retirement benefits.

**Parameters:**
- `birthday`: Date of birth
- `retirementDate`: Planned retirement date
- `earnings`: Array of yearly earnings records

**Returns:**
- `BenefitCalculationResult` object containing:
  - `AIME`: Average Indexed Monthly Earnings
  - `NormalMonthlyBenefit`: Monthly benefit amount (in dollars)

#### `calculatePIA(AIME: number, baseYear?: number): number`

Calculates the Primary Insurance Amount based on AIME.

**Parameters:**
- `AIME`: Average Indexed Monthly Earnings
- `baseYear`: Optional base year for calculations (defaults to 2023)

#### `calculateAIME(earnings: Earnings, baseYear?: number): number`

Calculates Average Indexed Monthly Earnings from earnings history.

**Parameters:**
- `earnings`: Array of yearly earnings
- `baseYear`: Optional base year for wage indexing

### Type Definitions

```typescript
interface Wage {
  year: number;
  earnings: number;
}

type Earnings = Wage[];

interface BenefitCalculationResult {
  AIME: number;
  NormalMonthlyBenefit: number;
}
```

## How It Works

1. **AIME Calculation**: The calculator indexes historical earnings to account for wage inflation, selects the highest 35 years of indexed earnings, and computes the monthly average.

2. **PIA Calculation**: Applies SSA bend points to determine the Primary Insurance Amount from the AIME.

3. **Retirement Age Adjustments**:
   - Early retirement (age 62-66): Benefits are reduced by 5/9 of 1% for each of the first 36 months and 5/12 of 1% for additional months
   - Delayed retirement (age 67-70): Benefits increase by 2/3 of 1% per month (8% per year) for those born after 1943

4. **COLA Adjustments**: Annual Cost of Living Adjustments are applied starting at age 62.

## Important Notes

- The calculator uses the most recent wage indexes as published by the SSA as of 2025
- It is designed and tested to exactly align with the [SSA Quick Calculator](https://www.ssa.gov/OACT/quickcalc/index.html)
- It always uses current dollar value, and does not predict future inflation amounts

## Contributing

Contributions are welcome! Please feel free to submit issues or pull requests.

## License

This project maintains the same license as the original repository. Please refer to the LICENSE file for details.
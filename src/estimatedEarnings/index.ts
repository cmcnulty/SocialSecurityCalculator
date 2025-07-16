import { Wages } from '../model';
import { wageIndex, wageIndexFuture, taxableMaximum,  } from '../wage-index';
import { getEnglishCommonLawDate } from '../index';
const YOUTH_FACTOR = 8;
const YOUTH_FACTOR_AGE = 21;
const WORK_START_AGE = 18;
const CURRENT_YEAR = new Date().getFullYear();

export function getEstimatedEarnings(birthDate: Date, lastWage: number, lastYearWorked: number = CURRENT_YEAR, earningGrowthRate: number = 0) {
    const birthDateMinusOneDay = getEnglishCommonLawDate(birthDate);
    const age = CURRENT_YEAR - birthDateMinusOneDay.getFullYear();
    if (age <= 22) {
        // return zero
    }
    if (lastYearWorked > CURRENT_YEAR) {
        throw new Error('Last year worked cannot be in the future');
    }
    const workStartYear = CURRENT_YEAR - age + WORK_START_AGE;
    const yearTurned22 = CURRENT_YEAR - age + YOUTH_FACTOR_AGE;

    const wageResults: Wages = [];
    for (let i = lastYearWorked; i >= workStartYear; i--) {
        const year = i;
        const nextYear = (i + 1);
        // one-time age adjustment for youth
        const youthAdjustment = (i === yearTurned22 ? YOUTH_FACTOR : 1);

        wageResults.push({
          year,
          earnings: (i === lastYearWorked)
              ? lastWage
              : (wageResults.find((entry) => entry.year === nextYear)?.earnings as number) * getReductionFactor(i) / (1 + earningGrowthRate) / youthAdjustment
        })
    }

    // Cap wages at taxable maximum
    wageResults.forEach(({year, earnings}) => {
        const maxTaxable = taxableMaximum.find((entry) => entry.year === year)!.earnings;
        const currentEarnings = wageResults.find((entry) => entry.year === year)!.earnings;
        const maxEarnings = Math.min(currentEarnings, maxTaxable);
        wageResults.find((entry) => entry.year === year)!.earnings = maxEarnings;
    });

    return wageResults;
}

function getReductionFactor(year: number): number {
    const allIndexes = wageIndex.concat(wageIndexFuture);
    const lastYear = year - 1;
    const nextYear = year + 1;
    if (year === CURRENT_YEAR && !allIndexes.find((entry) => entry.year === lastYear)) {
        throw new Error(`Wage index for previous year (${lastYear}) is required`);
    }
    if (year === CURRENT_YEAR) {
        return 1;
    } else {
        return ((allIndexes.find((entry) => entry.year === year)!.earnings) / (allIndexes.find((entry) => entry.year === nextYear)!.earnings));
    }
}

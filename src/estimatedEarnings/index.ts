import { Wages } from '../model';
import { wageIndex, quickCalcProjections, taxableMaximum } from '../wage-index';

const YOUTH_FACTOR = 8;
const YOUTH_FACTOR_AGE = 21;
const WORK_START_AGE = 18;
const CURRENT_YEAR = new Date().getFullYear();

export function getEstimatedEarnings(age: number, lastWage: number, lastYearWorked: number = CURRENT_YEAR, earningGrowthRate: number = 0){
    if (age <= 22) {
        throw new Error('Age must be greater than 22');
    }
    if (lastYearWorked > CURRENT_YEAR) {
        throw new Error('Last year worked cannot be in the future');
    }
    const workStartYear = CURRENT_YEAR - age + WORK_START_AGE;
    const yearTurned22 = CURRENT_YEAR - age + YOUTH_FACTOR_AGE;

    const wageResults: Wages = {};
    for (let i = lastYearWorked as keyof Wages; i >= workStartYear; i--) {
        const year = i as keyof Wages;
        const nextYear = (i + 1) as keyof Wages;
        const youthAdjustment = (i === yearTurned22 ? YOUTH_FACTOR : 1);

        wageResults[year] = (i === lastYearWorked)
            ? lastWage
            : (wageResults[nextYear] as number) * getReductionFactor(i) / (1 + earningGrowthRate) / youthAdjustment;
    }

    // Cap wages at taxable maximum
    Object.keys(wageResults).forEach(strYear => {
        const year = parseInt(strYear) as keyof Wages;
        const maxTaxable = taxableMaximum[year] as number;
        wageResults[year] = Math.min(wageResults[year] as number, maxTaxable);
    });

    return wageResults;
}

function getReductionFactor(year: keyof Wages) {
    const allIndexes = {...wageIndex, ...quickCalcProjections};
    const lastYear = year - 1 as keyof Wages;
    const nextYear = year + 1 as keyof Wages;
    if (year === CURRENT_YEAR && !allIndexes[lastYear]) {
        throw new Error(`Wage index for previous year (${lastYear}) is required`);
    }
    if (year === CURRENT_YEAR) {
        return 1;
    } else {
        return ((allIndexes[year] as number) / (allIndexes[nextYear] as number));
    }
}

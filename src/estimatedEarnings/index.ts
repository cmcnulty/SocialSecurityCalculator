import { Wages } from '../model';
import {wageIndex} from '../wage-index.js';

const YOUTH_FACTOR = 8;
const YOUTH_FACTOR_AGE = 21;
const WORK_START_AGE = 18;
const CURRENT_YEAR_INCREASE = .96;
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
    let i = lastYearWorked as keyof Wages;
    for(; i >= workStartYear; i--){
        const reductionFactor = getReductionFactor(i) / (1 + earningGrowthRate);
        const youthFactor = i === yearTurned22 ? YOUTH_FACTOR : 1;
        const year = i as keyof Wages;
        const nextYear = (i + 1) as keyof Wages;
        if(i === lastYearWorked){
            wageResults[year] = lastWage;
        } else {
            wageResults[year] = ((wageResults[nextYear] as number) * reductionFactor)/youthFactor;
        }
    }
    return wageResults;
}

function getReductionFactor(year: keyof Wages) {
    const lastYear = year - 1 as keyof Wages;
    const nextYear = year + 1 as keyof Wages;
    if (year === CURRENT_YEAR && !wageIndex[lastYear]) {
        throw new Error('Wage index for previous year is required');
    }
    if (year === CURRENT_YEAR) {
        return 1;
    } else if (year === CURRENT_YEAR - 1) {
        return CURRENT_YEAR_INCREASE
    } else {
        return ((wageIndex[year] as number) / (wageIndex[nextYear] as number));
    }
}

// console.log(getEstimatedEarnings(70, 100000, 2020, .02));
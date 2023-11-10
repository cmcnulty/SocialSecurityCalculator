import { Wages } from './model';
import {wageIndex} from './wage-index';

export const calc = (earnings: Wages) => {
    const lookbackYears = 35;
    const futureYearsFactor = 1;
    const bendPointDivisor = 9779.44;
    const firstBendPointMultiplier = 180;
    const secondBendPointMultiplier = 1085;
    const averageWageLastYear = Math.max(...Object.keys(wageIndex).map( val => parseInt(val))) as keyof Wages;
    const wageIndexLastYear = wageIndex[averageWageLastYear] as number;

    // https://www.ssa.gov/oact/COLA/piaformula.html
    // Per examples, bend points are rounded to the nearest dollar
    const firstBendPoint = Math.round(firstBendPointMultiplier * wageIndexLastYear / bendPointDivisor);
    const secondBendPoint = Math.round(secondBendPointMultiplier * wageIndexLastYear / bendPointDivisor);

    // calculate the wage index factors
    const wageIndexFactors: Wages = Object.entries(wageIndex).reduce(( acc, [i, val], ) => (
        (acc[parseInt(i) as keyof Wages] = 1 + (wageIndexLastYear - val) / val), acc) as Wages
    , {} as Wages);

    // adjust the earnings according to the wage index factor,
    // factor is 1 for any earnings record without a wage-factor
    const adjustedEarnings: Wages = Object.entries(earnings).reduce(( acc, [i, val], ) => (
        (acc[parseInt(i) as keyof Wages] = val * (wageIndexFactors[parseInt(i) as keyof Wages] || futureYearsFactor)) , acc ) as Wages
    , {} as Wages);

    const top35YearsEarnings = Object.values(adjustedEarnings)
        .sort((a,b) => b - a) // sort the earnings from highest to lowest amount
        .slice(0,lookbackYears) // grab the highest 35 earnings years
        .reduce((partialSum, a) => partialSum + a, 0); // and finally sum them


    // https://www.ssa.gov/oact/cola/Benefits.html
    // "We then round the resulting average amount down to the next lower dollar amount"
    const AIME = Math.floor(top35YearsEarnings / (12 * lookbackYears));


    // https://www.ssa.gov/OP_Home/handbook/handbook.07/handbook-0738.html
    // Calculations that are not a multiple of 10 cents are rounded to the next lower multiple of 10 cents. For example, $100.18 is rounded down to $100.10.
    const PIA = (()=>{
        let monthlyBenefit = 0;
        if (AIME <= firstBendPoint) {
            monthlyBenefit = 0.9 * AIME;
        } else {
            if (AIME > firstBendPoint && AIME <= secondBendPoint) {
                monthlyBenefit = 0.9 * firstBendPoint + 0.32 * (AIME - firstBendPoint);
            } else {
                monthlyBenefit = 0.9 * firstBendPoint + 0.32 * (secondBendPoint - firstBendPoint) + 0.15 * (AIME - secondBendPoint);
            }
        }
        return roundToFloorTenCents(monthlyBenefit);
    })();

    const reducedMonthlyBenefit = Math.floor(0.7 * PIA);
    const normalMonthlyBenefit = Math.floor(PIA);
    const results = {
        "Top35YearsEarnings": top35YearsEarnings,
        "AIME": AIME,
        "FirstBendPoint": firstBendPoint,
        "SecondBendPoint": secondBendPoint,
        "NormalMonthlyBenefit": normalMonthlyBenefit,
        "NormalAnnualBenefit": PIA * 12,
        "ReducedMonthlyBenefit": reducedMonthlyBenefit,
        "ReducedAnnualBenefit": reducedMonthlyBenefit * 12,
    }

    return results;
}

function roundToFloorTenCents(amount: number): number {
    // Convert the amount to fractional dimes
    let dimes = amount * 10;

    // floor to only whole dimes
    dimes = Math.floor(dimes)

    // Convert back to dollars and return
    return (dimes / 10);
}

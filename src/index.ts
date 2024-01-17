import { Wages } from './model';
import { wageIndex } from './wage-index';

export function calc(birthday: Date, retirementDate: Date, earnings: Wages) {
    const AIME = calculateAIME(earnings);
    const results = calcRetirementBenefit(birthday, retirementDate, AIME);
    return results;
}

export function calcRetirementBenefit (birthday: Date, retirementDate: Date, AIME: number) {
    const eclBirthDate = getEnglishCommonLawDate(birthday);
    const fullRetirementMonths = getFullRetirementMonths(eclBirthDate);
    const PIA = calculatePIA(AIME);

    const benefitAt62 = calculateSocialSecurityReduction(PIA, 60);
    const normalMonthlyBenefit = Math.floor(PIA);
    const results = {
        "AIME": AIME,
        "NormalMonthlyBenefit": normalMonthlyBenefit,
        "NormalAnnualBenefit": PIA * 12,
        "ReducedMonthlyBenefit": benefitAt62,
        "ReducedAnnualBenefit": benefitAt62 * 12,
    }

    return results;
}

function calculatePIA(AIME: number) {
    const averageWageLastYear = Math.max(...Object.keys(wageIndex).map( val => parseInt(val))) as keyof Wages;
    const wageIndexLastYear = wageIndex[averageWageLastYear] as number;

    const bendPointDivisor = 9779.44;
    const firstBendPointMultiplier = 180;
    const secondBendPointMultiplier = 1085;

    // https://www.ssa.gov/oact/COLA/piaformula.html
    // Per examples, bend points are rounded to the nearest dollar
    const firstBendPoint = Math.round(firstBendPointMultiplier * wageIndexLastYear / bendPointDivisor);
    const secondBendPoint = Math.round(secondBendPointMultiplier * wageIndexLastYear / bendPointDivisor);

    // https://www.ssa.gov/OP_Home/handbook/handbook.07/handbook-0738.html
    // Calculations that are not a multiple of 10 cents are rounded to the next lower multiple of 10 cents. For example, $100.18 is rounded down to $100.10.
    const PIA = (()=>{
        let monthlyBenefit = 0;
        if (AIME <= firstBendPoint) {
            monthlyBenefit = 0.9 * AIME;
        } else {
            if (AIME > firstBendPoint && AIME <= secondBendPoint) {
                monthlyBenefit = (0.9 * firstBendPoint) + (0.32 * (AIME - firstBendPoint));
            } else {
                monthlyBenefit = (0.9 * firstBendPoint) + (0.32 * (secondBendPoint - firstBendPoint)) + (0.15 * (AIME - secondBendPoint));
            }
        }
        return roundToFloorTenCents(monthlyBenefit);
    })();
    return PIA;
}

function calculateAIME(earnings: Wages) {
    const lookbackYears = 35;
    const averageWageLastYear = Math.max(...Object.keys(wageIndex).map( val => parseInt(val))) as keyof Wages;
    const wageIndexLastYear = wageIndex[averageWageLastYear] as number;

    const futureYearsFactor = 1;
    // calculate the wage index factors
    const wageIndexFactors: Wages = Object.entries(wageIndex).reduce(( acc, [i, val], ) => (
    (acc[parseInt(i) as keyof Wages] = 1 + (wageIndexLastYear - val) / val), acc) as Wages
    , {} as Wages);

    // adjust the earnings according to the wage index factor,
    // factor is 1 for any earnings record without a wage-factor
    const adjustedEarnings: Wages = Object.entries(earnings).reduce(( acc, [i, val], ) => (
        (acc[parseInt(i) as keyof Wages] = val * (wageIndexFactors[parseInt(i) as keyof Wages] || futureYearsFactor)) , acc ) as Wages
    , {} as Wages);

    const top35YearsEarningsArr = Object.values(adjustedEarnings)
        .sort((a,b) => b - a) // sort the earnings from highest to lowest amount
        .slice(0,lookbackYears) // grab the highest 35 earnings years

    const top35YearsEarnings = top35YearsEarningsArr.reduce((partialSum, a) => partialSum + a, 0); // and finally sum them

    // https://www.ssa.gov/oact/cola/Benefits.html
    // "We then round the resulting average amount down to the next lower dollar amount"
    const AIME = Math.floor(top35YearsEarnings / (12 * lookbackYears));
    return AIME;
}

function calculateSocialSecurityReduction(amount: number, months: number): number {
    const first36Rate = 5 / 9 * 0.01; // 5/9 of 1%
    const additionalRate = 5 / 12 * 0.01; // 5/12 of 1%
    let reduction = 0;

    if (months <= 36) {
        reduction = months * first36Rate;
    } else {
        // 36 months times 5/9 of 1 percent plus 24 months times 5/12 of 1 percent.
        reduction = 36 * first36Rate + (months - 36) * additionalRate;
    }

    return amount - amount * reduction;
}

function roundToFloorTenCents(amount: number): number {
    // Convert the amount to fractional dimes
    let dimes = amount * 10;

    // floor to only whole dimes
    dimes = Math.floor(dimes)

    // Convert back to dollars and return
    return (dimes / 10);
}

function getEnglishCommonLawDate(date: Date): Date {
    const year = date.getFullYear();
    const month = date.getMonth();
    const day = date.getDate();
    const englishCommonLawDate = new Date(year, month, day-1);
    return englishCommonLawDate;
}

export function getFullRetirementMonths(commonLawBirthDate: Date): number {
    const year = commonLawBirthDate.getFullYear();

    switch (true) {
        case (year >= 1943 && year <= 1954):
            return 66 * 12;
        case (year >= 1955 && year <= 1959):
            const fra = ((year - 1954) * 2) + (66 * 12);
            return fra;
        case (year >= 1960):
            return  67 * 12
        default:
            throw new Error('Invalid birth year');
    }
}

/*
1943-1954 	66 	                48 	$750 	25.00% 	$350 	30.00%
1955 	    66 and 2 months 	50 	$741 	25.83% 	$345 	30.83%
1956 	    66 and 4 months 	52 	$733 	26.67% 	$341 	31.67%
1957 	    66 and 6 months 	54 	$725 	27.50% 	$337 	32.50%
1958 	    66 and 8 months 	56 	$716 	28.33% 	$333 	33.33%
1959 	    66 and 10 months 	58 	$708 	29.17% 	$329 	34.17%
1960+ 	    67 	                60 	$700 	30.00% 	$325 	35.00%
*/


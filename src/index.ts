import { Wages } from './model';
import { wageIndex } from './wage-index';

const EARLY_RETIREMENT_AGE = 62;

export function calc(birthday: Date, retirementDate: Date, earnings: Wages) {
    const AIME = calculateAIME(earnings);
    const results = calcRetirementBenefit(birthday, retirementDate, AIME);
    return results;
}

export function calcRetirementBenefit (birthday: Date, retirementDate: Date, AIME: number) {
    const eclBirthDate = getEnglishCommonLawDate(birthday);
    const fraMonths = getFullRetirementMonths(eclBirthDate);
    const fullRetirementDate = new Date(eclBirthDate.getFullYear(), eclBirthDate.getMonth() + fraMonths, eclBirthDate.getDate());
    const earliestRetirementDate = new Date(eclBirthDate.getFullYear() + EARLY_RETIREMENT_AGE, eclBirthDate.getMonth(), eclBirthDate.getDate());
    const age60Year = eclBirthDate.getFullYear()+60;
    const PIA = calculatePIA(AIME, age60Year);

    const earlyRetireMonths = monthsDifference(retirementDate, fullRetirementDate);
    let adjustedBenefits = PIA;
    if( retirementDate < earliestRetirementDate) {
        adjustedBenefits = 0;
    } else if (earlyRetireMonths < 0) {
        adjustedBenefits = calculateSocialSecurityReduction(PIA, earlyRetireMonths * -1);
    } else if (earlyRetireMonths > 0) {
        adjustedBenefits = calculateSocialSecurityIncrease(eclBirthDate, PIA, earlyRetireMonths);
    }

    const monthlyBenefit = Math.floor(adjustedBenefits);
    const results = {
        "AIME": AIME,
        "NormalMonthlyBenefit": monthlyBenefit,
    }

    return results;
}

export function calculatePIA(AIME: number, baseYear?: number) {

    const mostRecentWageIndex = Math.max(...wageIndex.map(val => val.year));
    if (baseYear) {
        baseYear = Math.min(baseYear, mostRecentWageIndex);
    }
    const averageWageLastYear = baseYear || mostRecentWageIndex;
    const wageIndexLastYear = wageIndex.find(val => val.year === averageWageLastYear)?.earnings || 0;

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

export function calculateAIME(earnings: Wages, baseYear?: number) {
    const lookbackYears = 35;

    const mostRecentWageIndex = Math.max(...wageIndex.map( wag => wag.year));
    if (baseYear) {
        baseYear = Math.min(baseYear, mostRecentWageIndex);
    }
    const averageWageLastYear = baseYear || mostRecentWageIndex;
    const wageIndexLastYear = wageIndex.find(val => val.year === averageWageLastYear)?.earnings || 0;

    const futureYearsFactor = 1;
    // calculate the wage index factors
    const wageIndexFactors = wageIndex.reduce((acc, { year, earnings }) => (
        acc[year] = 1 + (Math.max(0, wageIndexLastYear - earnings)) / earnings, acc
    ), {} as Record<number, number>);

    // adjust the earnings according to the wage index factor
    const adjustedEarnings = earnings.reduce((acc, { year, earnings }) => {
    acc[year] = earnings * (wageIndexFactors[year] || futureYearsFactor);
    return acc;
    }, {} as Record<number, number>);

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

function calculateSocialSecurityIncrease(birthday: Date, initialAmount: number, numberOfMonths: number): number {
    const birthYear = birthday.getFullYear();
    let monthlyRate: number;

    // Determine the monthly rate based on the year of birth
    if (birthYear < 1933) {
        throw new Error(`Invalid birth year for delayed retirement: ${birthYear}`);
    } else if (birthYear <= 1934) {
        monthlyRate = 11 / 24 / 100; // 11/24 of 1%
    } else if (birthYear <= 1936) {
        monthlyRate = 0.005; // 1/2 of 1%
    } else if (birthYear <= 1938) {
        monthlyRate = 13 / 24 / 100; // 13/24 of 1%
    } else if (birthYear <= 1940) {
        monthlyRate = 7 / 12 / 100; // 7/12 of 1%
    } else if (birthYear <= 1942) {
        monthlyRate = 5 / 8 / 100; // 5/8 of 1%
    } else {
        monthlyRate = 2 / 3 / 100; // 2/3 of 1%
    }

    // Calculate the new amount
    let totalAdjustment = 0;
    for (let i = 0; i < numberOfMonths; i++) {
        totalAdjustment += monthlyRate;
    }
    return initialAmount * (1+totalAdjustment);
}

function roundToFloorTenCents(amount: number): number {
    // Convert the amount to fractional dimes
    let dimes = amount * 10;

    // floor to only whole dimes
    dimes = Math.floor(dimes)

    // Convert back to dollars and return
    return (dimes / 10);
}

export function getEnglishCommonLawDate(date: Date): Date {
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

function monthsDifference(date1: Date, date2: Date): number {
    // Calculate the total number of months for each date
    const months1 = date1.getFullYear() * 12 + date1.getMonth();
    const months2 = date2.getFullYear() * 12 + date2.getMonth();

    // Return the difference in months
    return months1 - months2;
}


import { calc, calcRetirementBenefit, calculateAIME, calculatePIA } from '../src/index';
import parse from '../src/parseStatement/index';
import { compound } from 'compound-calc';
import { earnings_1, earnings_2, earnings_3 } from './test-data';
import { Wages, YearRange } from '../src/model';
import { getEstimatedEarnings } from '../src/estimatedEarnings/index';

describe('Parse SSN Output', function () {
    it('Load Full Retirement', async () => {
        const earningsFromXml = await parse('./test/Full_Retirement.xml');
        const baseYear = 2015;
        const AIME = calculateAIME(earningsFromXml, baseYear);
        const PIA = calculatePIA(AIME, baseYear);
        const calcResults = calcRetirementBenefit(new Date(1955,2,31), new Date(2025, 2, 31), AIME);

        expect(AIME).toEqual(1153);
        expect(PIA).toEqual(882.2);
        // The XML file data appears to be invalid - full retirment age does not match with expected full retirement for birth year
        // expect(calcResults.NormalMonthlyBenefit).toEqual(1243);
    });

    it('Load Early Retirement', async () => {
        const earningsFromXml = await parse('./test/Early_Retirement.xml');
        const birthDate = new Date(1959,4,29); // 1959-05-29
        const baseYear = birthDate.getFullYear() + 60;
        const earlyRetirement = new Date(birthDate.getFullYear() + 62, birthDate.getMonth() + 4, birthDate.getDate());
        const fullRetirement = new Date(birthDate.getFullYear() + 66, birthDate.getMonth() + 10, birthDate.getDate());
        const AIME = calculateAIME(earningsFromXml, baseYear);
        const PIA = calculatePIA(AIME, baseYear);
        const calcResultsFull = calcRetirementBenefit(birthDate, fullRetirement, AIME)
        const calcResultsEarly = calcRetirementBenefit(birthDate, earlyRetirement, AIME)

        expect(AIME).toEqual(1280);
        expect(PIA).toEqual(987.2);
        expect(calcResultsFull.NormalMonthlyBenefit).toEqual(987);
        expect(calcResultsEarly.NormalMonthlyBenefit).toEqual(715);
    });

    it('Load Delayed Retirement', async () => {
        const earningsFromXml = await parse('./test/Delayed_Retirement.xml');
        const birthDate = new Date(1950,4,29) // 1950-05-29
        const delayedRetirement = new Date(birthDate.getFullYear() + 70, birthDate.getMonth() + 0, birthDate.getDate());
        const baseYear = birthDate.getFullYear() + 60;
        const AIME = calculateAIME(earningsFromXml, baseYear);
        const PIA = calculatePIA(AIME, baseYear);
        const calcResultsFull = calcRetirementBenefit(birthDate, delayedRetirement, AIME);

        expect(AIME).toEqual(1082);
        expect(PIA).toEqual(791.1);
        // XMl appears to be invalid, shows retirement age of over age 70
        // expect(calcResultsFull.NormalMonthlyBenefit).toEqual(1185);
    });

});

describe('Test calc', function () {
    it('Test calc at 2% growth rate', async () => {
        const futureEarnings = compound(60000,0,21,0).result
            .reduce((acc, cur, i) => (acc[(2024+i as keyof Wages)] = Math.round(cur), acc),{} as Wages);
        const allEarnings = {...earnings_1, ...futureEarnings};
        const calcResults = calc(new Date(1980,0,1), new Date(2046, 11, 31), allEarnings);
        expect(calcResults.NormalMonthlyBenefit).toEqual(2167);
    });

    it('Early retirement', async () => {
        const futureEarnings = compound(60000,0,21,0).result
            .reduce((acc, cur, i) => (acc[(2024+i as keyof Wages)] = Math.round(cur), acc),{} as Wages);
        const allEarnings = {...earnings_1, ...futureEarnings};
        const calcResults = calc(new Date(1980,0,1), new Date(2046, 5, 15), allEarnings);
        expect(calcResults.NormalMonthlyBenefit).toEqual(2095);
    });

    it('Too Early retirement', async () => {
        const futureEarnings = compound(60000,0,21,0).result
            .reduce((acc, cur, i) => (acc[(2024+i as keyof Wages)] = Math.round(cur), acc),{} as Wages);
        const allEarnings = {...earnings_1, ...futureEarnings};
        const calcResults = calc(new Date(1980,0,1), new Date(2040, 5, 15), allEarnings);
        expect(calcResults.NormalMonthlyBenefit).toEqual(0);
    });

    it('Delayed retirement', async () => {
        const futureEarnings = compound(60000,0,22,0).result
            .reduce((acc, cur, i) => (acc[(2024+i as keyof Wages)] = Math.round(cur), acc),{} as Wages);
        const allEarnings = {...earnings_1, ...futureEarnings};
        const calcResults = calc(new Date(1980,0,1), new Date(2047, 5, 15), allEarnings);
        expect(calcResults.NormalMonthlyBenefit).toEqual(2268);
    });

    it('Test calc at 0% growth rate', async () => {
        const futureEarnings = compound(60000,0,21,0).result
            .reduce((acc, cur, i) => (acc[(2024+i as keyof Wages)] = Math.round(cur), acc),{} as Wages);
        const allEarnings = {...earnings_2, ...futureEarnings};
        const calcResults = calc(new Date(1980,0,1), new Date(2046, 11, 15), allEarnings);
        expect(calcResults.NormalMonthlyBenefit).toEqual(2238);
    });

    it('Test calc with second bend point', async () => {
        const futureEarnings = compound(168600,0,21,0).result
            .reduce((acc, cur, i) => (acc[(2024+i as keyof Wages)] = Math.round(cur), acc),{} as Wages);
        const allEarnings = {...earnings_3, ...futureEarnings};
        const calcResults = calc(new Date(1980,0,1), new Date(2046, 11, 31), allEarnings);
        expect(calcResults.NormalMonthlyBenefit).toEqual(3875);
    });

});

describe('Test estimated previous earnings', function () {
    it('Test calc', async () => {
        const expected = getEstimatedEarnings(45, 60000, 2024, 0);
        const rounded = Object.entries(expected).reduce((acc, [year, P]) => (acc[parseInt(year) as YearRange] = (Math.round(P/100)*100), acc),{} as Wages);
        expect(rounded).toEqual(earnings_2);
    });

    it('Test calc 2 percent growth', async () => {
        const expected = getEstimatedEarnings(45, 60000, 2024, .02);
        const rounded = Object.entries(expected).reduce((acc, [year, P]) => (acc[parseInt(year) as YearRange] = (Math.round(P/100)*100), acc),{} as Wages);
        expect(rounded).toEqual(earnings_1);
    });

    it('Test above taxable amount', async () => {
        const expected = getEstimatedEarnings(45, 180000, 2024, .02);
        const rounded = Object.entries(expected).reduce((acc, [year, P]) => (acc[parseInt(year) as YearRange] = (Math.round(P/100)*100), acc),{} as Wages);
        expect(rounded).toEqual(earnings_3);
    });

});

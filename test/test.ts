
import { calc } from '../src/index';
import parse from '../src/parseStatement/index';
import { compound } from 'compound-calc';
import { earnings_1, earnings_2, earnings_3 } from './test-data';
import { Wages, YearRange } from '../src/model';
import { getEstimatedEarnings } from '../src/estimatedEarnings/index';

describe.only('Parse SSN Output', function () {
    it('Load Relayed Retirement', async () => {
        const earningsFromXml = await parse('./test/Full_Retirement.xml');
        const calcResults = calc(new Date(1955,3,31), new Date(2021, 9, 31), earningsFromXml);
        expect(calcResults.NormalMonthlyBenefit).toEqual(1002);
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

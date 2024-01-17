
import {calc} from '../src/index';
import parse from '../src/parseStatement/index';
import { compound } from 'compound-calc';
import { earnings_1, earnings_2, earnings_3 } from './test-data';
import { Wages, YearRange } from '../src/model';
import { getEstimatedEarnings } from '../src/estimatedEarnings/index';
/*
const earningsFromXml = await parse('social-security-statement-2023.xml');
console.log( calc(earningsFromXml) );

const start = 2023;
const years = 67-(start-1977);
const rate = 0.02;

const missing = (earnings, start, years, rate) =>
    // merges the passed in earnings with the results of compound.reduce()
    ({...earnings, ...compound(Object.values(earnings).at(-1),0,years,rate).result
        .slice(1) // slice off the first result, which is a duplicate of last earnings
        // use reduce to return object which continues the year series
        .reduce((acc, cur, i) => (acc[start+i] = Math.round(cur), acc),{})
    });


const predicted = missing(earningsFromXml, start, years, rate);

console.log(calc(predicted));
*/



describe('Parse SSN Output', function () {

    it('Load Relayed Retirement', async () => {
        const earningsFromXml = await parse('./test/Full_Retirement.xml');
        console.log(earningsFromXml);
        const calcResults = calc(new Date(1980,0,1), new Date(2047, 0, 1), earningsFromXml);
        console.log(calcResults)
        expect(1).toEqual(parseInt('1'));
    });
});

describe('Test calc', function () {
    it('Test calc at 2% growth rate', async () => {
        const futureEarnings = compound(60000,0,21,0).result
            .reduce((acc, cur, i) => (acc[(2024+i as keyof Wages)] = Math.round(cur), acc),{} as Wages);
        const allEarnings = {...earnings_1, ...futureEarnings};
        const calcResults = calc(new Date(1980,0,1), new Date(2047, 0, 1), allEarnings);
        expect(calcResults.NormalMonthlyBenefit).toEqual(2167);
    });

    it('Test calc at 0% growth rate', async () => {
        const futureEarnings = compound(60000,0,21,0).result
            .reduce((acc, cur, i) => (acc[(2024+i as keyof Wages)] = Math.round(cur), acc),{} as Wages);
        const allEarnings = {...earnings_2, ...futureEarnings};
        const calcResults = calc(new Date(1980,0,1), new Date(2047, 0, 1), allEarnings);
        expect(calcResults.NormalMonthlyBenefit).toEqual(2238);
    });

    it('Test calc at 2% growth rate', async () => {
        const futureEarnings = compound(60000,0,21,0).result
            .reduce((acc, cur, i) => (acc[(2024+i as keyof Wages)] = Math.round(cur), acc),{} as Wages);
        const allEarnings = {...earnings_1, ...futureEarnings};
        const calcResults = calc(new Date(1980,0,1), new Date(2047, 0, 1), allEarnings);
        expect(calcResults.NormalMonthlyBenefit).toEqual(2167);
    });

    it('Test calc with second bend point', async () => {
        const futureEarnings = compound(168600,0,21,0).result
            .reduce((acc, cur, i) => (acc[(2024+i as keyof Wages)] = Math.round(cur), acc),{} as Wages);
        const allEarnings = {...earnings_3, ...futureEarnings};
        const calcResults = calc(new Date(1980,0,1), new Date(2047, 0, 1), allEarnings);
        /*
        <!--fra: Base year for indexing is 2022.  Bend points are 1174 & 7078-->
        <!--  AIME = 13275 & PIA in 2041 is 3875.4. -->
        <!--  PIA in 2041 after COLAs is $3,875.40. -->
        <!-- -->*/
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
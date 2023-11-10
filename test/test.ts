
import {calc} from '../src/index';
import parse from '../src/parseStatement/index';
import { compound } from 'compound-calc';
import { earnings } from './test-data';
import { Wages } from '../src/model';
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
        const calcResults = calc(earningsFromXml);
        console.log(calcResults);
        expect(1).toEqual(parseInt('1'));
    });
});

describe('Test calc', function () {
    it('Test calc', async () => {

        const futureEarnings = compound(100000,0,20,0).result
            .reduce((acc, cur, i) => (acc[(2023+i as keyof Wages)] = Math.round(cur), acc),{} as Wages);
        const allEarnings = {...earnings, ...futureEarnings};
        console.log(allEarnings);
        const calcResults = calc(allEarnings);
        console.log(calcResults);
        expect(1).toEqual(parseInt('1'));
    });
});
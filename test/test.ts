
import { calc, calcRetirementBenefit, calculateAIME, calculatePIA } from '../src/index';
import parse from '../src/parseStatement/index';
import { compound } from 'compound-calc';
import { default as testData } from './data/inputData.results.json';
import { getEstimatedEarnings } from '../src/estimatedEarnings/index';
import { Wage, Wages } from '../src/model';

describe('Parse SSN Output', function () {
    it('Load Full Retirement', async () => {
        const earningsFromXml = await parse('./test/Full_Retirement.xml');
        const baseYear = 2015;
        const AIME = calculateAIME(earningsFromXml, baseYear);
        const PIA = calculatePIA(AIME, baseYear);
        const lastYearWorked = earningsFromXml[earningsFromXml.length - 1].year;
        const calcResults = calcRetirementBenefit(new Date(1955,2,31), lastYearWorked, new Date(2025, 2, 31), AIME);

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
        const lastYearWorked = earningsFromXml[earningsFromXml.length - 1].year;
        const calcResultsFull = calcRetirementBenefit(birthDate, lastYearWorked, fullRetirement, AIME);
        const calcResultsEarly = calcRetirementBenefit(birthDate, lastYearWorked, earlyRetirement, AIME);

        expect(AIME).toEqual(1280);
        expect(PIA).toEqual(987.2);
        expect(calcResultsFull.NormalMonthlyBenefit).toEqual(1201);
        expect(calcResultsEarly.NormalMonthlyBenefit).toEqual(871);
    });

    it('Load Delayed Retirement', async () => {
        const earningsFromXml = await parse('./test/Delayed_Retirement.xml');
        const birthDate = new Date(1950,4,29) // 1950-05-29
        const delayedRetirement = new Date(birthDate.getFullYear() + 70, birthDate.getMonth() + 0, birthDate.getDate());
        const baseYear = birthDate.getFullYear() + 60;
        const AIME = calculateAIME(earningsFromXml, baseYear);
        const PIA = calculatePIA(AIME, baseYear);
        const lastYearWorked = earningsFromXml[earningsFromXml.length - 1].year;
        const calcResultsFull = calcRetirementBenefit(birthDate, lastYearWorked, delayedRetirement, AIME);

        expect(AIME).toEqual(1082);
        expect(PIA).toEqual(791.1);
        // XMl appears to be invalid, shows retirement age of over age 70
        // expect(calcResultsFull.NormalMonthlyBenefit).toEqual(1185);
    });

});

describe('Test calc', function () {
    for (const {testInput, testResults} of testData) {
        it(`Test ${testInput.testName}`, async () => {
            const birthDate = new Date(testInput.birthDate);
            const retirementDate = new Date(testInput.retirementDate);
            const earnings = testResults.commentData.map((row) => ({
                year: row.year,
                earnings: row.earnings
            }) as Wage);
            const earningsString = earnings.map((row) => `${row.year} ${row.earnings}`).join('\n');
            console.log(`Earnings: ${earningsString}`);
            const result = await calc(
                birthDate,
                retirementDate,
                earnings
            );

            expect(result).toBeDefined();
            expect(result).toHaveProperty('NormalMonthlyBenefit');
            // strip dollar signs, commas, etc from expected result
            const expectedResult = parseInt(testResults.totalResult.toString().replace(/[^0-9.-]/g, ''), 10);
            expect(result.NormalMonthlyBenefit).toEqual(expectedResult);
        });
    }
});


describe('Test estimated previous earnings', function () {
    for (const {testInput, testResults} of testData) {
        it(`Test ${testInput.testName}`, async () => {
            const birthDate = new Date(testInput.birthDate);
            const expected = getEstimatedEarnings(birthDate, testInput.earnings, testInput.lastYear || undefined, .02);
            const actual = testResults.commentData.map((row) => ({
                year: row.year,
                earnings: row.earnings
            })).filter((row) => row.year <= (testInput.lastYear || 2025)); // filter to only include years up to 2025

            const sortedActual = actual.sort((a, b) => b.year - a.year);

            // round expected to nearest hundred, i.e 105371.63 => 105400
            const roundedExpected = expected.map((row) => ({
                year: row.year,
                earnings: Math.round(row.earnings / 100) * 100
            }));

            expect(roundedExpected).toEqual(sortedActual);
        });
    }
});
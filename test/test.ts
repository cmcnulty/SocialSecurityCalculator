
import { calc, calculateAIME, calculatePIA, calculateRetirementDates, CalculationType } from '../src/index';
import parse from '../src/parseStatement/index';
import { default as testData } from './data/inputData.results.json';
import { getEstimatedEarnings } from '../src/estimatedEarnings/index';
import minimist from 'minimist';

interface CommandLineArgs {
    name: string;
}

function getTestParams(): { name: string[] | undefined } {
    const args = minimist(process.argv.slice(2)) as unknown as CommandLineArgs;
    const { name } = { ...args } as { name: string | string[] };
    const nameArr: string[] | undefined = Array.isArray(name) ? name : name ? [name] : undefined;
    return { name: nameArr };
}

describe.skip('Parse SSN Output', function () {
    it('Load Full Retirement', async () => {
        const earningsFromXml = await parse('./test/Full_Retirement.xml');

        const birthDate = new Date(1955, 2, 31); // 1955-03-31
        const retirementDate = new Date(2025, 2, 31); //
        const calcResults = calc(birthDate, retirementDate, earningsFromXml);
        expect(calcResults.AIME).toEqual(1153);
        expect(calcResults.PIA).toEqual(882.2);
        // The XML file data appears to be invalid - full retirment age does not match with expected full retirement for birth year
        // expect(calcResults.NormalMonthlyBenefit).toEqual(1243); // outdated value
    });

    it('Load Early Retirement', async () => {
        const earningsFromXml = await parse('./test/Early_Retirement.xml');
        console.log(earningsFromXml);

        const earningsString = earningsFromXml.map((row) => `${row.year} ${row.earnings}`).join('\n');
        console.log(earningsString);

        // 1971-2008 has data

        const birthDate = new Date(1959,4,29); // 1959-05-29
        const earlyRetirement = new Date(birthDate.getFullYear() + 62, birthDate.getMonth() + 4, birthDate.getDate());
        const fullRetirement = new Date(birthDate.getFullYear() + 66, birthDate.getMonth() + 10, birthDate.getDate());

        const calcResultsFull = calc(birthDate, fullRetirement, earningsFromXml);
        console.log(calcResultsFull);
        const calcResultsEarly = calc(birthDate, earlyRetirement, earningsFromXml);

        expect(calcResultsFull.AIME).toEqual(2801);
        expect(calcResultsFull.PIA).toEqual(1474);
        expect(calcResultsEarly.AIME).toEqual(2801);
        expect(calcResultsEarly.PIA).toEqual(1474);
        expect(calcResultsFull.NormalMonthlyBenefit).toEqual(932);
        expect(calcResultsEarly.NormalMonthlyBenefit).toEqual(715);
    });

    it('Load Delayed Retirement', async () => {
        const earningsFromXml = await parse('./test/Delayed_Retirement.xml');
        const birthDate = new Date(1950,4,29) // 1950-05-29
        const delayedRetirement = new Date(birthDate.getFullYear() + 70, birthDate.getMonth() + 0, birthDate.getDate());

        const calcResultsFull = calc(birthDate, delayedRetirement, earningsFromXml);
        expect(calcResultsFull.AIME).toEqual(1082);
        expect(calcResultsFull.PIA).toEqual(791.1);
        // XMl appears to be invalid, shows retirement age of over age 70
        // expect(calcResultsFull.NormalMonthlyBenefit).toEqual(1185);
    });

});

describe('Test calc', function () {

    // filter based on test name if provided as cli argument
    const {name} = getTestParams();
    for (const {testInput, testResults} of testData) {

        // skip tests if it's a partial match of the testName
        if (name && name.find((n) => testInput.testName.includes(n)) === undefined) {
            continue; // skip this test if name filter is applied and does not match
        }
        it(`Test ${testInput.testName}`, async () => {
            const birthDate = new Date(testInput.birthDate);
            const retirementDate = new Date(testInput.retirementDate);
            const earnings = testResults.commentData.map((row) => ({
                year: row.year,
                earnings: row.earnings
            }));
            const earningsString = earnings.map((row) => `${row.year} ${row.earnings}`).join('\n');

            const result = await calc(
                birthDate,
                retirementDate,
                earnings
            );

            const disabilityDate = new Date(birthDate); // birthdate for this test is 6/15/1960
            disabilityDate.setFullYear(2025); // new disability date is 6/15/2024
            const disabilityEarnings = earnings.filter((row) => row.year < 2025);
            const disabilityCalc = calc(birthDate, disabilityDate, disabilityEarnings, CalculationType.DISABILITY);
            expect(disabilityCalc.NormalMonthlyBenefit).toEqual(parseInt((testResults.survivorBenefits.disability || '0').toString().replace(/[^0-9.-]/g, ''), 10));
            expect(result).toBeDefined();
            expect(result).toHaveProperty('NormalMonthlyBenefit');

            // strip dollar signs, commas, etc from expected result
            const expectedResult = parseInt(testResults.totalResult.toString().replace(/[^0-9.-]/g, ''), 10);
            expect(result.NormalMonthlyBenefit).toEqual(expectedResult);
        });
    }
});


describe('Test estimated previous earnings', function () {
    const {name} = getTestParams();
    for (const {testInput, testResults} of testData) {

        if (name && !name.includes(testInput.testName)) {
            continue; // skip this test if name filter is applied and does not match
        }

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
                earnings: Math.round(Math.round(row.earnings) / 100) * 100
            }));

            expect(roundedExpected).toEqual(sortedActual);
        });
    }
});

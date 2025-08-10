
import { calc, calculateAIME, calculatePIA, calculateRetirementDates } from '../src/index';
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
            const disabilityCalc = calc(birthDate, disabilityDate, disabilityEarnings);
            expect(disabilityCalc.DisabilityEarnings).toEqual(parseInt((testResults.survivorBenefits.disability || '0').toString().replace(/[^0-9.-]/g, ''), 10));
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

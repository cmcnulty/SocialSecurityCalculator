
import { calc } from '../src/index';
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
    for (const {testInput, testResults, scrapedDate} of testData) {

        // skip tests if it's a partial match of the testName
        if (name && name.find((n) => testInput.testName.includes(n)) === undefined) {
            continue; // skip this test if name filter is applied and does not match
        }

        const earnings = testResults.commentData.map((row) => ({
            year: row.year,
            earnings: row.earnings
        }));
        const birthDate = new Date(testInput.birthDate);
        const retirementDate = new Date(testInput.retirementDate);
        // if retirementDate is not a valid date, default it to January 1, 2026
        if (isNaN(retirementDate.getTime())) {
            retirementDate.setFullYear(2026, 0, 1);
        }

        // Use scrapedDate for disability/survivor calculations
        const testDate = new Date(scrapedDate);
        const testYear = testDate.getFullYear();

        it(`Test retirement: ${testInput.testName}`, async () => {
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

        it(`Test Disability: ${testInput.testName}`, async () => {
            const disabilityDate = testDate;
            const disabilityEarnings = earnings.filter((row) => row.year < testYear);
            const disabilityCalc = calc(birthDate, disabilityDate, disabilityEarnings);
            expect(disabilityCalc.DisabilityEarnings).toEqual(parseInt((testResults.survivorBenefits.disability || '0').toString().replace(/[^0-9.-]/g, ''), 10));
        });

        it(`Test survivor earnings for ${testInput.testName}`, async () => {
            // SSA calculates survivor benefits using only complete years of earnings
            // Same as disability calculation - exclude current year
            const survivorDate = testDate;
            const survivorEarnings = earnings.filter((row) => row.year < testYear);

            const survivorCalc = calc(birthDate, survivorDate, survivorEarnings);
            expect(survivorCalc.SurvivorBenefits.survivingChild).toEqual(parseInt((testResults.survivorBenefits.survivingChild || '0').toString().replace(/[^0-9.-]/g, ''), 10));
            expect(survivorCalc.SurvivorBenefits.familyMaximum).toEqual(parseFloat((testResults.survivorBenefits.familyMaximum || '0').toString().replace(/[^0-9.-]/g, '')));
            expect(survivorCalc.SurvivorBenefits.careGivingSpouse).toEqual(parseInt((testResults.survivorBenefits.careGivingSpouse || '0').toString().replace(/[^0-9.-]/g, ''), 10));
            expect(survivorCalc.SurvivorBenefits.normalRetirementSpouse).toEqual(parseInt((testResults.survivorBenefits.normalRetirementSpouse || '0').toString().replace(/[^0-9.-]/g, ''), 10));
        });
    }
});


describe('Test estimated previous earnings', function () {
    const {name} = getTestParams();
    for (const {testInput, testResults, scrapedDate} of testData) {

        if (name && !name.includes(testInput.testName)) {
            continue; // skip this test if name filter is applied and does not match
        }

        it(`Test ${testInput.testName}`, async () => {
            const birthDate = new Date(testInput.birthDate);
            const testYear = new Date(scrapedDate).getFullYear();
            const expected = getEstimatedEarnings(birthDate, testInput.earnings, testInput.lastYear || undefined, .02);
            const actual = testResults.commentData.map((row) => ({
                year: row.year,
                earnings: row.earnings
            })).filter((row) => row.year <= (testInput.lastYear || testYear));

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

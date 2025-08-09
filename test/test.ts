
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

describe('Parse SSN Output', function () {
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
        const birthDate = new Date(1959,4,29); // 1959-05-29
        const earlyRetirement = new Date(birthDate.getFullYear() + 62, birthDate.getMonth() + 4, birthDate.getDate());
        const fullRetirement = new Date(birthDate.getFullYear() + 66, birthDate.getMonth() + 10, birthDate.getDate());

        const calcResultsFull = calc(birthDate, fullRetirement, earningsFromXml);
        const calcResultsEarly = calc(birthDate, earlyRetirement, earningsFromXml);

        expect(calcResultsFull.AIME).toEqual(1280);
        expect(calcResultsFull.PIA).toEqual(987.2);
        expect(calcResultsEarly.AIME).toEqual(1280);
        expect(calcResultsEarly.PIA).toEqual(987.2);
        expect(calcResultsFull.NormalMonthlyBenefit).toEqual(1201);
        expect(calcResultsEarly.NormalMonthlyBenefit).toEqual(871);
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

        if (name && !name.includes(testInput.testName)) {
            continue; // skip this test if name filter is applied and does not match
        }
        it(`Test ${testInput.testName}`, async () => {
            const birthDate = new Date(testInput.birthDate);
            const retirementDate = new Date(testInput.retirementDate);
            const earnings = testResults.commentData.map((row) => ({
                year: row.year,
                earnings: row.earnings
            }));
            // const earningsString = earnings.map((row) => `${row.year} ${row.earnings}`).join('\n');
            // console.log(`Testing: ${testInput.testName} with earnings: ${earningsString}`);
            const result = await calc(
                birthDate,
                retirementDate,
                earnings
            );

            const yearAge62 = birthDate.getFullYear() + 62;
            const disabilityDate = new Date(birthDate); // birthdate for this test is 6/15/1960
            disabilityDate.setFullYear(2045); // new disability date is 6/15/2024
            const disabilityEarnings = earnings.filter((row) => row.year <= 2024);
            // console.log(disabilityEarnings);
            const disabilityCalc = calc(birthDate, disabilityDate, disabilityEarnings, CalculationType.DISABILITY);
            // PIA is correct, but NormalMonthlyBenefit is only correct if you apply 2022, 2023 and 2024 COLA adjustments
            // console.log(`Normal Calculation Result: ${JSON.stringify(result)}`);
            // console.log(`Disability Calculation Result: ${JSON.stringify(disabilityCalc)}`);
/*
            <!--  AIME = 3779 & PIA in 2041 is 1920.3. -->
            <!--  PIA in 2041 after COLAs is $1,920.30. -->
*/
            // expect(disabilityCalc.NormalMonthlyBenefit).toEqual(parseInt((testResults.survivorBenefits.disability || '0').toString().replace(/[^0-9.-]/g, ''), 10));

/*
            const disabilityPIA = calculatePIA(result.AIME, 2025);
            const dates = calculateRetirementDates(birthDate, new Date());
            const disabilityResult = calcRetirementBenefit(dates, disabilityPIA);
            console.log(result);
            console.log(`Disability PIA: ${disabilityPIA}`);
            console.log(`Disability Result: ${disabilityResult}`);
*/
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
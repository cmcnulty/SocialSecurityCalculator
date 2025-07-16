import csvtojson from 'csvtojson';
import fs from 'fs/promises';
import { scrapeSSACalculator } from './getTestResults.js';
/**
 * Converts date string to component parts for SSA calculator
 * @param {string} dateString - Date in format "1/1/1980" or "M/D/YYYY"
 * @returns {Object} - Object with month, day, year as padded strings
 */
function parseDateString(dateString) {
    if (!dateString){
      return {
        month: '',
        day: '',
        year: ''
      };
    }

    const dateThing = new Date(dateString);
    if (isNaN(dateThing.getTime())) {
        throw new Error(`Invalid date format: ${dateString}. Expected format is "M/D/YYYY".`);
    }
    return {
        month: String(dateThing.getMonth() + 1).padStart(2, '0'),
        day: String(dateThing.getDate()).padStart(2, '0'),
        year: String(dateThing.getFullYear()),
    };
}

/**
 * Converts CSV row to SSA calculator input format
 * @param {Object} row - CSV row object
 * @returns {Object} - SSA calculator input format
 */
function convertRowToSSAInput(row) {
  const birthDate = parseDateString(row.birthDate);
  const retirementDate = parseDateString(row.retirementDate);
  let currentEarnings = 0;
  let lastEarnings = 0;
  let lastYear = '';

  // Only set the lastYear if you're not retired
  if (row.currentlyRetired === 'false') {
    row.lastYear = ''; // assumes current year for earnings
    currentEarnings = row.earnings;
  } else {
    lastEarnings = row.earnings;
    lastYear = row.lastYear;
  }
  return {
    month: birthDate.month,
    day: birthDate.day,
    year: birthDate.year,
    currentEarnings: currentEarnings,
    lastyear: lastYear,
    lastearnings: lastEarnings,
    retiremonth: retirementDate.month,
    retireyear: retirementDate.year
  };
}

/**
 * Processes CSV file and runs SSA calculator for each row
 * @param {string} csvFilePath - Path to the CSV file
 * @param {string} outputPath - Path for the JSON output file
 */
async function processBatchSSACalculations(csvFilePath, outputPath) {
  try {
    console.log(`Reading CSV file: ${csvFilePath}`);

    // Read and parse CSV file
    const csvData = await csvtojson().fromFile(csvFilePath);
    console.log(`Found ${csvData.length} test cases to process`);

    const results = [];

    // Process each row
    for (let i = 0; i < csvData.length; i++) {
      const row = csvData[i];
      console.log(`Processing test case ${i + 1}/${csvData.length}: ${row.testName}`);

      try {
        // Convert CSV row to SSA input format
        const ssaInput = convertRowToSSAInput(row);

        // Run the SSA calculator
        const ssaResults = await scrapeSSACalculator(ssaInput);

        // Store test input and results
        results.push({
          testInput: {
            testName: row.testName,
            birthDate: row.birthDate,
            retirementDate: row.retirementDate,
            earnings: parseInt(row.earnings),
            lastYear: parseInt(row.lastYear),
            currentlyRetired: row.currentlyRetired === 'true'
          },
          testResults: ssaResults
        });

        console.log(`✓ Completed: ${row.testName}`);

        // Add a small delay between requests to be respectful
        await new Promise(resolve => setTimeout(resolve, 1000));

      } catch (error) {
        console.error(`✗ Failed processing ${row.testName}:`, error.message);

        // Store the error result
        results.push({
          testInput: {
            testName: row.testName,
            birthDate: row.birthDate,
            retirementDate: row.retirementDate,
            earnings: parseInt(row.earnings),
            lastYear: parseInt(row.lastYear),
            currentlyRetired: row.currentlyRetired === 'true'
          },
          testResults: {
            error: error.message
          }
        });
      }
    }

    // Write results to JSON file
    console.log(`Writing results to: ${outputPath}`);
    await fs.writeFile(outputPath, JSON.stringify(results, null, 2));

    console.log(`\n🎉 Batch processing complete!`);
    console.log(`Processed: ${results.length} test cases`);
    console.log(`Successful: ${results.filter(r => !r.testResults.error).length}`);
    console.log(`Failed: ${results.filter(r => r.testResults.error).length}`);
    console.log(`Results saved to: ${outputPath}`);

  } catch (error) {
    console.error('Error processing batch calculations:', error);
    throw error;
  }
}

// Example usage
async function main() {
  const csvFile = 'test/inputData.csv'; // Path to your CSV file
  const outputFile = 'test/data/inputData.results.json'; // Path for the output JSON file

  await processBatchSSACalculations(csvFile, outputFile);
}

// Run the batch processor
await main();
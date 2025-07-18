import { chromium } from 'playwright';

/**
 * Scrapes SSA Quick Calculator with provided input values
 * @param {Object} input - Input object containing form values
 * @param {string} input.month - Birth month (MM format)
 * @param {string} input.day - Birth day (DD format)
 * @param {string} input.year - Birth year (YYYY format)
 * @param {string} input.currentEarnings - Current earnings amount
 * @param {string} input.lastyear - Last year of earnings (YYYY format)
 * @param {string} input.lastearnings - Last year earnings amount
 * @param {string} input.retiremonth - Retirement month (MM format)
 * @param {string} input.retireyear - Retirement year (YYYY format)
 * @returns {Promise<Object>} - Object containing total result, survivor benefits, earnings history, and comment data
 */
export async function scrapeSSACalculator(input) {
  const browser = await chromium.launch({ headless: true }); // Headless by default
  const page = await browser.newPage();

  try {
    // Navigate to the SSA Quick Calculator
    await page.goto('https://www.ssa.gov/OACT/quickcalc/');

    // Wait for the form to load
    await page.waitForSelector('#month');

    // If current earnings are not provided, last year and lastearnings are required
    if (!input.currentEarnings && (!input.lastyear || !input.lastearnings)) {
      throw new Error('Current earnings are required unless last year and lastearnings are provided.');
    }

    // Fill in the form fields
    await page.fill('#month', input.month);
    await page.fill('#day', input.day);
    await page.fill('#year', input.year);
    await page.fill('#earnings', input.currentEarnings || ''); // Current earnings is required
    await page.fill('#lastyear', input.lastyear || ''); // Optional field, can be empty
    await page.fill('#lastearnings', input.lastearnings || ''); // Optional field, can be empty
    await page.fill('#retiremonth', input.retiremonth);
    await page.fill('#retireyear', input.retireyear);

    // Click the correct submit button (not the "GO" button)
    await page.click('input[type="submit"][value="Submit request"]');

    // Wait for the results table to appear
    await page.waitForSelector('table[summary="inputs"]');

    // Extract the result value using the specified CSS selector
    const totalResult = await page.textContent('span#ret_amount').catch(() => null);
    const elementTimeoutOptions = { timeout: 1_000 };
    // Extract survivor benefits from the same page
    const survivorBenefits = {
      disability: await page.locator('//td[normalize-space(.)="You"]/following-sibling::td[1]').textContent(elementTimeoutOptions).catch(() => null),
      survivingChild: await page.locator('//td[normalize-space(.)="Your child"]/following-sibling::td[1]').textContent(elementTimeoutOptions).catch(() => null),
      careGivingSpouse: await page.locator('//td[normalize-space(.)="Your spouse caring for your child"]/following-sibling::td[1]').textContent(elementTimeoutOptions).catch(() => null),
      normalRetirementSpouse: await page.locator('//td[normalize-space(.)="Your spouse at normal retirement age"]/following-sibling::td[1]').textContent(elementTimeoutOptions).catch(() => null),
      familyMaximum: await page.locator('//td[normalize-space(.)="Family maximum"]/following-sibling::td[1]').textContent(elementTimeoutOptions).catch(() => null)
    };

    // Click the "See the earnings we used" button
    await page.click('input[type="submit"][value*="See the earnings we used"]');

    // Wait for the earnings table to appear
    await page.waitForSelector('table[summary="past earnings"]');

    // Extract all the earnings inputs from the table
    const earningsHistory = await page.evaluate(() => {
      const table = document.querySelector('table[summary="past earnings"]');
      const inputs = table.querySelectorAll('input[type="text"]');

      return Array.from(inputs).map(input => ({
        year: parseInt(input.name),
        earnings: parseInt(input.value.replace(/,/g, ''))
      }));
    });

    // Extract comment nodes containing indexed earnings data
    const commentData = await page.evaluate(() => {
      // Function to recursively find all comment nodes in the document
      function getCommentNodes(node) {
        const comments = [];
        const walker = document.createTreeWalker(
          node,
          NodeFilter.SHOW_COMMENT,
          null,
          false
        );

        let currentNode;
        while (currentNode = walker.nextNode()) {
          comments.push(currentNode.textContent);
        }
        return comments;
      }

      // Get all comment nodes
      const allComments = getCommentNodes(document);

      // Filter for comments that contain earnings data (lines with years and numbers)
      const earningsComments = allComments.filter(comment => {
        // Look for comments that match the pattern: year, earnings, and other numerical data
        return /^\s*\d{4}\s+[\d.]+/.test(comment.trim());
      });

      // Parse the earnings data from comments
      return earningsComments.map(comment => {
        const parts = comment.trim().split(/\s+/);
        if (parts.length >= 6) {
          return {
            year: parseInt(parts[0]),
            earnings: parseFloat(parts[1]),
            retirement: parseFloat(parts[2]),
            disability: parseFloat(parts[3]),
            survivors: parseFloat(parts[4]),
            taxMax: parseInt(parts[5]),
            cola: parts[6] ? parseFloat(parts[6]) : null,
            awi: parts[7] ? parseFloat(parts[7]) : null
          };
        }
        return null;
      }).filter(item => item !== null);
    });



    return {
      totalResult,
      survivorBenefits,
      earningsHistory,
      commentData
    };

  } catch (error) {
    console.error('Error scraping SSA calculator:', error);
    throw error;
  } finally {
    await browser.close();
  }
}

import xml2js from 'xml2js';
import fs from 'fs/promises';
import { Earnings } from '../model';

const NS = 'OSSS';
// strict false because attribute is unquoted: <osss:OnlineSocialSecurityStatementData xmlns:osss=http://ssa.gov/osss/schemas/2.0>
// could fix the XML, but better to keep file unchanged so that we can drop in relacement files from SSA
const parser = new xml2js.Parser({strict: false});
const supportedVersion = "http://ssa.gov/osss/schemas/2.0";

async function getWages(fileName: string): Promise<Earnings> {
    const data = await fs.readFile(fileName);
    const result = await parser.parseStringPromise( data );
    const schema = result[`${NS}:ONLINESOCIALSECURITYSTATEMENTDATA`]['$'][`XMLNS:${NS}`];
    if (schema !== supportedVersion) {
        throw `${schema} is not supported (${supportedVersion})`;
    }
    const results: any[]  = result[`${NS}:ONLINESOCIALSECURITYSTATEMENTDATA`][`${NS}:EARNINGSRECORD`][0][`${NS}:EARNINGS`];

    const earnings: Earnings = results.reduce((acc, earn: any) => (
        earn[`${NS}:FICAEARNINGS`][0] === '-1' ? acc : acc.push({year: [earn['$'].STARTYEAR], earnings: parseInt(earn[`${NS}:FICAEARNINGS`][0])}), acc
    ), [] as Earnings);
    return earnings;
}

export default getWages;
import { Wage, Wages } from './model';

// https://www.ssa.gov/OACT/COLA/awiseries.html
export const wageIndex: Wages = [
        {
          "year": 1951,
          "retirement": 1802.95,
          "disability": 1802.95,
          "survivors": 1802.95,
          "taxMax": 3600,
          "cola": 0,
          "awi": 2799.16
        },
        {
          "year": 1952,
          "retirement": 1697.35,
          "disability": 1697.35,
          "survivors": 1697.35,
          "taxMax": 3600,
          "cola": 0,
          "awi": 2973.32
        },
        {
          "year": 1953,
          "retirement": 1607.53,
          "disability": 1607.53,
          "survivors": 1607.53,
          "taxMax": 3600,
          "cola": 0,
          "awi": 3139.44
        },
        {
          "year": 1954,
          "retirement": 1599.28,
          "disability": 1599.28,
          "survivors": 1599.28,
          "taxMax": 3600,
          "cola": 0,
          "awi": 3155.64
        },
        {
          "year": 1955,
          "retirement": 13757.87,
          "disability": 13757.87,
          "survivors": 13757.87,
          "taxMax": 4200,
          "cola": 0,
          "awi": 3301.44
        },
        {
          "year": 1956,
          "retirement": 13810.96,
          "disability": 13810.96,
          "survivors": 13810.96,
          "taxMax": 4200,
          "cola": 0,
          "awi": 3532.36
        },
        {
          "year": 1957,
          "retirement": 14320.1,
          "disability": 14320.1,
          "survivors": 14320.1,
          "taxMax": 4200,
          "cola": 0,
          "awi": 3641.72
        },
        {
          "year": 1958,
          "retirement": 14195.05,
          "disability": 14195.05,
          "survivors": 14195.05,
          "taxMax": 4200,
          "cola": 0,
          "awi": 3673.8
        },
        {
          "year": 1959,
          "retirement": 14833.9,
          "disability": 14833.9,
          "survivors": 14833.9,
          "taxMax": 4800,
          "cola": 0,
          "awi": 3855.8
        },
        {
          "year": 1960,
          "retirement": 15113.36,
          "disability": 15113.36,
          "survivors": 15113.36,
          "taxMax": 4800,
          "cola": 0,
          "awi": 4007.12
        },
        {
          "year": 1961,
          "retirement": 15230.47,
          "disability": 15230.47,
          "survivors": 15230.47,
          "taxMax": 4800,
          "cola": 0,
          "awi": 4086.76
        },
        {
          "year": 1962,
          "retirement": 15680.21,
          "disability": 15680.21,
          "survivors": 15680.21,
          "taxMax": 4800,
          "cola": 0,
          "awi": 4291.4
        },
        {
          "year": 1963,
          "retirement": 16070.12,
          "disability": 16070.12,
          "survivors": 16070.12,
          "taxMax": 4800,
          "cola": 0,
          "awi": 4396.64
        },
        {
          "year": 1964,
          "retirement": 16174.36,
          "disability": 16174.36,
          "survivors": 16174.36,
          "taxMax": 4800,
          "cola": 0,
          "awi": 4576.32
        },
        {
          "year": 1965,
          "retirement": 16610.47,
          "disability": 16610.47,
          "survivors": 16610.47,
          "taxMax": 4800,
          "cola": 0,
          "awi": 4658.72
        },
        {
          "year": 1966,
          "retirement": 17032.49,
          "disability": 17032.49,
          "survivors": 17032.49,
          "taxMax": 6600,
          "cola": 0,
          "awi": 4938.36
        },
        {
          "year": 1967,
          "retirement": 17101.82,
          "disability": 17101.82,
          "survivors": 17101.82,
          "taxMax": 6600,
          "cola": 0,
          "awi": 5213.44
        },
        {
          "year": 1968,
          "retirement": 17511.62,
          "disability": 17511.62,
          "survivors": 17511.62,
          "taxMax": 7800,
          "cola": 0,
          "awi": 5571.76
        },
        {
          "year": 1969,
          "retirement": 17982.04,
          "disability": 17982.04,
          "survivors": 17982.04,
          "taxMax": 7800,
          "cola": 0,
          "awi": 5893.76
        },
        {
          "year": 1970,
          "retirement": 18219.6,
          "disability": 18219.6,
          "survivors": 18219.6,
          "taxMax": 7800,
          "cola": 0,
          "awi": 6186.24
        },
        {
          "year": 1971,
          "retirement": 18642.54,
          "disability": 18642.54,
          "survivors": 18642.54,
          "taxMax": 7800,
          "cola": 0,
          "awi": 6497.08
        },
        {
          "year": 1972,
          "retirement": 19100.95,
          "disability": 19100.95,
          "survivors": 19100.95,
          "taxMax": 9000,
          "cola": 0,
          "awi": 7133.8
        },
        {
          "year": 1973,
          "retirement": 19307.75,
          "disability": 19307.75,
          "survivors": 19307.75,
          "taxMax": 10800,
          "cola": 0,
          "awi": 7580.16
        },
        {
          "year": 1974,
          "retirement": 19690.74,
          "disability": 19690.74,
          "survivors": 19690.74,
          "taxMax": 13200,
          "cola": 0,
          "awi": 8030.76
        },
        {
          "year": 1975,
          "retirement": 20270.62,
          "disability": 20270.62,
          "survivors": 20270.62,
          "taxMax": 14100,
          "cola": 8,
          "awi": 8630.92
        },
        {
          "year": 1976,
          "retirement": 20603.13,
          "disability": 20603.13,
          "survivors": 20603.13,
          "taxMax": 15300,
          "cola": 6.4,
          "awi": 9226.48
        },
        {
          "year": 1977,
          "retirement": 20986.34,
          "disability": 20986.34,
          "survivors": 20986.34,
          "taxMax": 16500,
          "cola": 5.9,
          "awi": 9779.44
        },
        {
          "year": 1978,
          "retirement": 21354.77,
          "disability": 21354.77,
          "survivors": 21354.77,
          "taxMax": 17700,
          "cola": 6.5,
          "awi": 10556.03
        },
        {
          "year": 1979,
          "retirement": 21835.12,
          "disability": 21835.12,
          "survivors": 21835.12,
          "taxMax": 22900,
          "cola": 9.9,
          "awi": 11479.46
        },
        {
          "year": 1980,
          "retirement": 22316.26,
          "disability": 22316.26,
          "survivors": 22316.26,
          "taxMax": 25900,
          "cola": 14.3,
          "awi": 12513.46
        },
        {
          "year": 1981,
          "retirement": 22718.1,
          "disability": 22718.1,
          "survivors": 22718.1,
          "taxMax": 29700,
          "cola": 11.2,
          "awi": 13773.1
        },
        {
          "year": 1982,
          "retirement": 23153.42,
          "disability": 23153.42,
          "survivors": 23153.42,
          "taxMax": 32400,
          "cola": 7.4,
          "awi": 14531.34
        },
        {
          "year": 1983,
          "retirement": 23623.34,
          "disability": 23623.34,
          "survivors": 23623.34,
          "taxMax": 35700,
          "cola": 3.5,
          "awi": 15239.24
        },
        {
          "year": 1984,
          "retirement": 24084.18,
          "disability": 24084.18,
          "survivors": 24084.18,
          "taxMax": 37800,
          "cola": 3.5,
          "awi": 16135.07
        },
        {
          "year": 1985,
          "retirement": 24600,
          "disability": 24600,
          "survivors": 24600,
          "taxMax": 39600,
          "cola": 3.1,
          "awi": 16822.51
        },
        {
          "year": 1986,
          "retirement": 25800,
          "disability": 25800,
          "survivors": 25800,
          "taxMax": 42000,
          "cola": 1.3,
          "awi": 17321.82
        },
        {
          "year": 1987,
          "retirement": 28000,
          "disability": 28000,
          "survivors": 28000,
          "taxMax": 43800,
          "cola": 4.2,
          "awi": 18426.51
        },
        {
          "year": 1988,
          "retirement": 30000,
          "disability": 30000,
          "survivors": 30000,
          "taxMax": 45000,
          "cola": 4,
          "awi": 19334.04
        },
        {
          "year": 1989,
          "retirement": 31800,
          "disability": 31800,
          "survivors": 31800,
          "taxMax": 48000,
          "cola": 4.7,
          "awi": 20099.55
        },
        {
          "year": 1990,
          "retirement": 34000,
          "disability": 34000,
          "survivors": 34000,
          "taxMax": 51300,
          "cola": 5.4,
          "awi": 21027.98
        },
        {
          "year": 1991,
          "retirement": 35900,
          "disability": 35900,
          "survivors": 35900,
          "taxMax": 53400,
          "cola": 3.7,
          "awi": 21811.6
        },
        {
          "year": 1992,
          "retirement": 38500,
          "disability": 38500,
          "survivors": 38500,
          "taxMax": 55500,
          "cola": 3,
          "awi": 22935.42
        },
        {
          "year": 1993,
          "retirement": 39600,
          "disability": 39600,
          "survivors": 39600,
          "taxMax": 57600,
          "cola": 2.6,
          "awi": 23132.67
        },
        {
          "year": 1994,
          "retirement": 41500,
          "disability": 41500,
          "survivors": 41500,
          "taxMax": 60600,
          "cola": 2.8,
          "awi": 23753.53
        },
        {
          "year": 1995,
          "retirement": 44000,
          "disability": 44000,
          "survivors": 44000,
          "taxMax": 61200,
          "cola": 2.6,
          "awi": 24705.66
        },
        {
          "year": 1996,
          "retirement": 47100,
          "disability": 47100,
          "survivors": 47100,
          "taxMax": 62700,
          "cola": 2.9,
          "awi": 25913.9
        },
        {
          "year": 1997,
          "retirement": 50900,
          "disability": 50900,
          "survivors": 50900,
          "taxMax": 65400,
          "cola": 2.1,
          "awi": 27426
        },
        {
          "year": 1998,
          "retirement": 54600,
          "disability": 54600,
          "survivors": 54600,
          "taxMax": 68400,
          "cola": 1.3,
          "awi": 28861.44
        },
        {
          "year": 1999,
          "retirement": 58800,
          "disability": 58800,
          "survivors": 58800,
          "taxMax": 72600,
          "cola": 2.5,
          "awi": 30469.84
        },
        {
          "year": 2000,
          "retirement": 63300,
          "disability": 63300,
          "survivors": 63300,
          "taxMax": 76200,
          "cola": 3.5,
          "awi": 32154.82
        },
        {
          "year": 2001,
          "retirement": 66100,
          "disability": 66100,
          "survivors": 66100,
          "taxMax": 80400,
          "cola": 2.6,
          "awi": 32921.92
        },
        {
          "year": 2002,
          "retirement": 68100,
          "disability": 68100,
          "survivors": 68100,
          "taxMax": 84900,
          "cola": 1.4,
          "awi": 33252.09
        },
        {
          "year": 2003,
          "retirement": 71200,
          "disability": 71200,
          "survivors": 71200,
          "taxMax": 87000,
          "cola": 2.1,
          "awi": 34064.95
        },
        {
          "year": 2004,
          "retirement": 76000,
          "disability": 76000,
          "survivors": 76000,
          "taxMax": 87900,
          "cola": 2.7,
          "awi": 35648.55
        },
        {
          "year": 2005,
          "retirement": 80300,
          "disability": 80300,
          "survivors": 80300,
          "taxMax": 90000,
          "cola": 4.1,
          "awi": 36952.94
        },
        {
          "year": 2006,
          "retirement": 85700,
          "disability": 85700,
          "survivors": 85700,
          "taxMax": 94200,
          "cola": 3.3,
          "awi": 38651.41
        },
        {
          "year": 2007,
          "retirement": 91400,
          "disability": 91400,
          "survivors": 91400,
          "taxMax": 97500,
          "cola": 2.3,
          "awi": 40405.48
        },
        {
          "year": 2008,
          "retirement": 95300,
          "disability": 95300,
          "survivors": 95300,
          "taxMax": 102000,
          "cola": 5.8,
          "awi": 41334.97
        },
        {
          "year": 2009,
          "retirement": 95800,
          "disability": 95800,
          "survivors": 95800,
          "taxMax": 106800,
          "cola": 0,
          "awi": 40711.61
        },
        {
          "year": 2010,
          "retirement": 100000,
          "disability": 100000,
          "survivors": 100000,
          "taxMax": 106800,
          "cola": 0,
          "awi": 41673.83
        },
        {
          "year": 2011,
          "retirement": 0,
          "disability": 0,
          "survivors": 0,
          "taxMax": 106800,
          "cola": 3.6,
          "awi": 42979.61
        },
        {
          "year": 2012,
          "retirement": 0,
          "disability": 0,
          "survivors": 0,
          "taxMax": 110100,
          "cola": 1.7,
          "awi": 44321.67
        },
        {
          "year": 2013,
          "retirement": 0,
          "disability": 0,
          "survivors": 0,
          "taxMax": 113700,
          "cola": 1.5,
          "awi": 44888.16
        },
        {
          "year": 2014,
          "retirement": 0,
          "disability": 0,
          "survivors": 0,
          "taxMax": 117000,
          "cola": 1.7,
          "awi": 46481.52
        },
        {
          "year": 2015,
          "retirement": 0,
          "disability": 0,
          "survivors": 0,
          "taxMax": 118500,
          "cola": 0,
          "awi": 48098.63
        },
        {
          "year": 2016,
          "retirement": 0,
          "disability": 0,
          "survivors": 0,
          "taxMax": 118500,
          "cola": 0.3,
          "awi": 48642.15
        },
        {
          "year": 2017,
          "retirement": 0,
          "disability": 0,
          "survivors": 0,
          "taxMax": 127200,
          "cola": 2,
          "awi": 50321.89
        },
        {
          "year": 2018,
          "retirement": 0,
          "disability": 0,
          "survivors": 0,
          "taxMax": 128400,
          "cola": 2.8,
          "awi": 52145.8
        },
        {
          "year": 2019,
          "retirement": 0,
          "disability": 0,
          "survivors": 0,
          "taxMax": 132900,
          "cola": 1.6,
          "awi": 54099.99
        },
        {
          "year": 2020,
          "retirement": 0,
          "disability": 0,
          "survivors": 0,
          "taxMax": 137700,
          "cola": 1.3,
          "awi": 55628.6
        },
        {
          "year": 2021,
          "retirement": 0,
          "disability": 0,
          "survivors": 0,
          "taxMax": 142800,
          "cola": 5.9,
          "awi": 60575.07
        },
        {
          "year": 2022,
          "retirement": 0,
          "disability": 0,
          "survivors": 0,
          "taxMax": 147000,
          "cola": 8.7,
          "awi": 63795.13
        },
        {
          "year": 2023,
          "retirement": 0,
          "disability": 0,
          "survivors": 0,
          "taxMax": 160200,
          "cola": 3.2,
          "awi": 66621.8
        },
        {
          "year": 2024,
          "retirement": 0,
          "disability": 0,
          "survivors": 0,
          "taxMax": 168600,
          "cola": 2.5,
          "awi": 69472.44
        },
        {
          "year": 2025,
          "retirement": 0,
          "disability": 0,
          "survivors": 0,
          "taxMax": 176100,
          "cola": 2.7,
          "awi": 72255.52
        }
      ];

export const wageIndexFuture: Partial<Wage>[] = [
  { year: 2024, awi: 69472.44 },
  { year: 2025, awi: 72255.52 },
  { year: 2026, awi: 75264.81 },
  { year: 2027, awi: 78304.32 },
  { year: 2028, awi: 81522.64 },
  { year: 2029, awi: 84736.18 },
  { year: 2030, awi: 88030.45 },
  { year: 2031, awi: 91479.46 },
  { year: 2032, awi: 95090.94 },
  { year: 2033, awi: 98856.61 },
  { year: 2034, awi: 102670.10 },
  { year: 2035, awi: 106494.41 },
  { year: 2036, awi: 110382.54 },
  { year: 2037, awi: 114421.90 },
  { year: 2038, awi: 118616.20 },
  { year: 2039, awi: 122981.73 },
  { year: 2040, awi: 127479.70 },
  { year: 2041, awi: 132110.84 },
  { year: 2042, awi: 136899.00 },
  { year: 2043, awi: 141834.11 },
  { year: 2044, awi: 146908.25 },
  { year: 2045, awi: 152129.95 },
  { year: 2046, awi: 157512.41 },
  { year: 2047, awi: 163082.20 },
  { year: 2048, awi: 168837.13 },
  { year: 2049, awi: 174786.94 }
];

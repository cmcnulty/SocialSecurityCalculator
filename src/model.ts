export type Wage = {
    year: number,
    earnings: number,
    retirement: number,
    disability: number,
    survivors: number,
    taxMax: number,
    cola: number,
    awi: number
}

export type Wages = Wage[];
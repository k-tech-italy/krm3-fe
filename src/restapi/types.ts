
export enum Role {
    ADMIN = 'admin',
    SUPERADMIN = 'superadmin',
    USER = 'user',
}

export interface Category {
    active: boolean,
    id: number,
    str: string,
    parent?: Category,
    title: string,
}

export interface City {
    id: number,
    name: string,
    country: Country,
}

export interface Country {
    id: number,
    name: string,
}

export interface Client {
    id: number,
    name: string,
}

export interface Currency {
    iso3: string,
    title: string,
    symbol: string,
    decimals?: string,
    fractionalUnit: string,
    base: number,
    active: boolean,
}

export interface Page<T> {
    count: number,
    next: string,
    previous: string,
    results: T[],
}

export interface Project {
    id: number
    name: string
    notes: string
    client: Client
}

export interface ExpenseError {
    amountCurrency: string[] | undefined,
    category: string[] | undefined,
    documentType: string[] | undefined,
    paymentType: string[] | undefined,
    currency: string[] | undefined,
}


// Interface for component
export interface ExpenseInterface {
    id: number,
    day: string,
    amountCurrency?: string,
    amountBase?: string,
    amountReimbursement?: string,
    detail: string,
    documentType: TypeOfDocument
    image: string,
    createdTs: string,
    modifiedTs: string,
    mission: number,
    currency: string,
    category: Category,
    paymentType: TypeOfPayment,
    reimbursement: number,
}
export interface LimitBudget {
    vitto: number,
    viaggi: number,
    varie: number,
}


export interface MissionInterface {
    city: City,
    defaultCurrency: Currency,
    fromDate: string,
    id: number,
    number: number,
    title?: string,
    project: Project,
    resource: Resource,
    toDate: string,
    year: number,
    expenses: ExpenseInterface[],
}

export interface Resource {
    id: number,
    firstName: string,
    lastName: string,
    profile: ProfileInterface,
}

export interface ProfileInterface {
    id: number,
    picture: string,
    socialProfile?: string,
    user: number,
}

export interface TypeOfPayment {
    active: true,
    id: number,
    parent?: TypeOfPayment,
    title: string,
    str: string,
}

export interface TypeOfDocument {
    active: boolean,
    default: boolean,
    id: number,
    title: string,
}

export interface User {
    id: number,
    email: string,

}


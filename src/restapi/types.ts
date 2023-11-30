
export enum Role {
    ADMIN = 'admin',
    SUPERADMIN = 'superadmin',
    USER = 'user',
}

export interface Category {
    active: boolean,
    id: number,
    __str__: string,
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
    fractional_unit: string,
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
    amount_currency: string[] | undefined,
    category: string[] | undefined,
    document_type: string[] | undefined,
    payment_type: string[] | undefined,
    currency: string[] | undefined,
}


// Interface for component
export interface ExpenseInterface {
    id: number,
    day: string,
    amount_currency?: string,
    amount_base?: string,
    amount_reimbursement?: string,
    detail: string,
    document_type: TypeOfDocument
    image: string,
    created_ts: string,
    modified_ts: string,
    mission: number,
    currency: string,
    category: Category,
    payment_type: TypeOfPayment,
    reimbursement: number,
}
export interface LimitBudget {
    vitto: number,
    viaggi: number,
    varie: number,
}


export interface MissionInterface {
    city: City,
    default_currency: Currency,
    from_date: string,
    id: number,
    number: number,
    title?: string,
    project: Project,
    resource: Resource,
    to_date: string,
    year: number,
    expenses: ExpenseInterface[],
}

export interface Resource {
    id: number,
    first_name: string,
    last_name: string,
    profile: ProfileInterface,
}

export interface ProfileInterface {
    id: number,
    picture: string,
    social_profile?: string,
    user: number,
}

export interface TypeOfPayment {
    active: true,
    id: number,
    parent?: TypeOfPayment,
    title: string,
    __str__: string,
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


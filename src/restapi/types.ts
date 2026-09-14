export enum Role {
  ADMIN = "admin",
  SUPERADMIN = "superadmin",
  USER = "user",
}

export interface Category {
  active: boolean;
  id: number;
  str: string;
  parent?: Category;
  title: string;
}

export interface City {
  id: number;
  name: string;
  country: Country | number; //type problem?
}

export interface Country {
  id: number;
  name: string;
}

export interface Client {
  id: number;
  name: string;
  picture?: string;
}

export interface Currency {
  iso3: string;
  title: string;
  symbol: string;
  decimals?: string;
  fractionalUnit: string;
  base: number;
  active: boolean;
}

export interface Page<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}

export interface Project {
  id: number;
  name: string;
  notes: string;
  client: Client | number;
}

export interface ExpenseError {
  day: string[] | undefined;
  amountCurrency: string[] | undefined;
  category: string[] | undefined;
  documentType: string[] | undefined;
  paymentType: string[] | undefined;
  currency: string[] | undefined;
}

// Interface for component
export interface ExpenseInterface {
  id: number;
  day: string;
  amountCurrency?: string;
  amountBase?: string;
  amountReimbursement?: string;
  detail: string;
  documentType: TypeOfDocument;
  image: string;
  createdTs: string;
  modifiedTs: string;
  mission: number;
  currency: string;
  category: Category;
  paymentType: TypeOfPayment;
  reimbursement: number;
}
export interface LimitBudget {
  vitto: number;
  viaggi: number;
  varie: number;
}

export interface MissionError {
  //need to finish
  title: string[] | undefined;
  fromDate: string[] | undefined;
  toDate: string[] | undefined;
  project: string[] | undefined;
  resource: string[] | undefined;
  city: string[] | undefined;
  defaultCurrency: string[] | undefined;
}

export interface MissionInterface {
  city: City;
  defaultCurrency: Currency;
  fromDate: string;
  id: number;
  number: number;
  title: string;
  project: Project;
  resource: Resource;
  toDate: string;
  year: number;
  expenses: ExpenseInterface[];
}

export interface Resource {
  id: number;
  firstName: string;
  lastName: string;
  profile: ProfileInterface;
}

export interface ProfileInterface {
  id: number;
  picture: string;
  socialProfile?: string;
  user: number;
}

export interface TypeOfPayment {
  active: true;
  id: number;
  parent?: TypeOfPayment;
  title: string;
  str: string;
}

export interface TypeOfDocument {
  active: boolean;
  default: boolean;
  id: number;
  title: string;
}

interface module {
  flag: string;
  url: string;
  label: string;
}

export interface User {
  id: number;
  email: string;
  firstName: string;
  lastName: string;
  isSuperuser: boolean;
  isStaff: boolean;
  isActive: boolean;
  lastLogin: string;
  resource: Resource;
  profile: ProfileInterface;
  username: string;
  cid: string;
  permissions: string[] | null;
  flags: {
    [key in FlagsType]?: boolean;
  };
  config: {
    modules: module[];
    defaultModule?: string;
  };
}

export const enum FlagsType {
  TRASFERTE_ENABLED = "trasferteEnabled",
  TIMESHEET_ENABLED = "timesheetEnabled",
}

export interface Task {
  id: number;
  title: string;
  basketTitle?: string;
  color?: string;
  startDate: Date | string;
  endDate?: Date | string;
  workPrice?: number;
  onCallPrice?: number;
  travelPrice?: number;
  projectName?: string;
  clientName?: string;
  adminUrl?: string;
}
export interface Schedule {
  [date: string]: number;
}

export interface DayEntry {
  id: number;
  day: string;
  lastModified: string;
  closed: boolean;
  comment: string | null;
  contract: number;
  timesheet: number | null;
  resource: number;
  bank: DecimalValue;
  dueHours: DecimalValue;
  travelHours: DecimalValue;
  dayHours: DecimalValue;
  nightHours: DecimalValue;
  onCallHours: DecimalValue;
  isHoliday: boolean;
  askedHoliday: boolean;
  leaveHours: DecimalValue;
  specialLeaveHours: DecimalValue;
  specialLeaveReason: number | null;
  protocolNumber: string | null;
  isSick: boolean;
  restHours: DecimalValue;
  overtimeHours: DecimalValue;
  mealVoucher: number;
}
export interface TaskEntry {
  id: number;
  task: number;
  taskTitle?: string | null;
  dayEntry: number;
  dayShiftHours: DecimalValue;
  onCallHours: DecimalValue;
  travelHours: DecimalValue;
  nightShiftHours: DecimalValue;
  comment: string | null;
  metadata: Record<string, unknown>;
}
export interface Timesheet {
  tasks: Task[];
  dayEntries?: DayEntry[];
  taskEntries?: TaskEntry[];
  days: string[];
  schedule?: Schedule;
  bankHours: number;
  timesheetColors?: HeaderColors;
}
export interface Phone {
  number: string;
  kind?: string;
}
export interface Address {
  address: string;
  kind?: string;
}
export interface Email {
  address: string;
  kind?: string;
}
export interface Website {
  url: string;
}
export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  isActive: boolean;
  internalNotes: string;
  jobTitle: string;
  title?: string;
  picture?: string;
  taxId?: string;
  company?: Client;
  phones: Phone[];
  addresses: Address[];
  emails: Email[];
  websites: Website[];
}
export interface HeaderColors {
  lessThanScheduleColorBrightTheme: string;
  exactScheduleColorBrightTheme: string;
  moreThanScheduleColorBrightTheme: string;
  lessThanScheduleColorDarkTheme: string;
  exactScheduleColorDarkTheme: string;
  moreThanScheduleColorDarkTheme: string;
}

// TODO: Remove this interface once the backend is updated to return days in the correct format.//verify is not used anymore
export interface Days {
  [key: string]: { hol: boolean; nwd: boolean; closed: boolean };
}
export interface SpecialReason {
  id: number;
  title: string;
  description: string;
  fromDate: string;
  toDate: string;
}
export const enum TaskEntryCellType {
  TASK = "task",
  HOLIDAY = "holiday",
  SICK = "sick",
  FINISHED = "finished",
  BANK_HOLIDAY = "bank_holiday",
  CLOSED = "closed",
}
//if is nwd true and hol false is nwd
//if is nwd ture adn hol true is bank holiday
//if is nwd false and hol true is bank holiday

export const enum DayType {
  WORK_DAY = "work",
  NO_WORK_DAY = "nwd",
  BANK_HOLIDAY = "hol",
  CLOSED_DAY = "closed",
}
export type WeekRange = "whole" | "startOfWeek" | "endOfWeek";

export interface LanguageMap {
  languageCode: string;
  language: string;
}

export interface TitleChoice {
  value: string;
  label: string;
}

export interface TaskEntryPayload {
  resourceId: number;
  taskId: number;
  dates: string[];
  dayShiftHours?: number;
  nightShiftHours?: number;
  onCallHours?: number;
  travelHours?: number;
  comment?: string;
  autofill?: boolean;
  metadata?: Record<string, unknown>;
}

export interface DayEntriesPayload {
  resourceId: number;
  dates: string[];
  bank?: number;
  askedHoliday?: boolean;
  leaveHours?: number;
  specialLeaveHours?: number;
  specialLeaveReason?: string | null;
  isSick?: boolean;
  restHours?: number;
  comment?: string;
  protocolNumber?: string | null;
}

export interface TaskPeriod {
  bounds: string;
  lower: string;
  upper: string | null;
}
export type DecimalValue = string | number;
export interface ApiErrorData {
  error?: string;
}

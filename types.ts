export enum View {
  CALENDAR = 'CALENDAR',
  SCHOOL = 'SCHOOL',
  DUTIES = 'DUTIES',
  SERVICE_LOG = 'SERVICE_LOG',
}

export enum Shift {
  MORNING = 'MORNING',
  AFTERNOON = 'AFTERNOON',
}

// Base interface for any schedulable item
interface Schedulable {
  id: string;
  date: string; // YYYY-MM-DD format
  reminder?: string; // ISO string for datetime-local
}

export interface MinistryActivity extends Schedulable {
  territory: string;
  leader: string;
  shift: Shift;
  description?: string;
}

export interface SchoolAssignment extends Schedulable {
  student: string;
  assignment: string;
  endDate?: string;
  completed?: boolean;
}

export interface MeetingDuty extends Schedulable {
  person: string;
  duty: string;
  endDate?: string;
  completed?: boolean;
}

export interface ServiceEntry {
  id: string; // Will be the same as the date YYYY-MM-DD
  date: string;
  hours: number;
  placements?: number;
  videos?: number;
  returnVisits?: number;
}

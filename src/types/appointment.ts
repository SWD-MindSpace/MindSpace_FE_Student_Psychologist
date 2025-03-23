export interface Appointment {
  date: string;
  startTime: string;
  endTime: string;
  psychologistName: string;
  isUpcoming: boolean;
  meetUrl: string | null;
}

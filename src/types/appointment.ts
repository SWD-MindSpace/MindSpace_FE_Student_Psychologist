export interface Appointment {
  date: string;
  startTime: string;
  endTime: string;
  psychologistName: string | null;
  studentName: string | null;
  isUpcoming: boolean;
  meetUrl: string | null;
}

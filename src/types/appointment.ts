export interface Appointment {
  id: string | null;
  date: string;
  startTime: string;
  endTime: string;
  psychologistName: string | null;
  studentName: string | null;
  isUpcoming: boolean;
  meetUrl: string | null;
}

export interface AppointmentNotes {
  appointmentId: number;
  notesTitle: string;
  keyIssues: string;
  suggestions: string;
  otherNotes: string | null;
  isNoteShown: boolean;
  psychologistId: number;
  studentId: number;
  psychologistName: string;
  studentName: string;
  psychologistImageUrl: string | null;
  studentImageUrl: string | null;
}
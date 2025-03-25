export interface AppointmentFilter {
  psychologistName?: string;
  startDate?: string;
  endDate?: string;
  sort?: "dateAsc" | "dateDesc";
  pageIndex?: number;
  pageSize?: number;
}

// Interface cho TimeSlot lấy từ API
export interface TimeSlotFromApi {
  id: number;
  startTime: string;
  endTime: string;
  date: string;
  psychologistId: number;
  status: number; // 0 = Available, 1 hoặc 2 = Booked
}

// Interface cho dữ liệu ngày
export interface ScheduleDay {
  psychologistId: number;
  date: string;
  weekDay: string;
  timeSlots: TimeSlotFromApi[];
}

// Interface dữ liệu API
export interface ScheduleResponse extends Array<ScheduleDay> {}

// Interface cho TimeSlot gửi qua pop-up
export interface TimeSlotToApi {
  id?: number;
  startTime: string;
  endTime: string;
  date: string;
  status?: number;
}

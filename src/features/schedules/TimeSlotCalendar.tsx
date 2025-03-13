'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './styles/TimeslotCalendar.module.css';
import { TimeSlotFromApi, ScheduleResponse, TimeSlotToApi } from './schemas/ScheduleSchemas'
import ConfirmAppointmentPopup from './components/BookingConfirmPopup';

const baseUrl = `https://localhost:7096/api/v1/psychologist-schedules`;

export default function TimeSlotCalendar() {
  const psychologistId = 8; // thay bằng get từ url gì đó bên list qua

  const getDate = (fromDate?: Date): Date => {
    const date = fromDate ? new Date(fromDate) : new Date();
    date.setHours(0, 0, 0, 0);
    date.setMinutes(date.getMinutes() + 7 * 60); // Adjust for timezone if needed
    return date;
  };

  // Parse URL params for dates on component mount
  const parseUrlParams = (): { startDate: Date | null } => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const minDateParam = urlParams.get('minDate');

      if (minDateParam) {
        const parsedDate = new Date(minDateParam);
        // Check if valid date
        if (!isNaN(parsedDate.getTime())) {
          return { startDate: getDate(parsedDate) };
        }
      }
    }
    return { startDate: null };
  };

  const [selectedDay, setSelectedDay] = useState<Date>(getDate());
  const [slotsFromApi, setSlotsFromApi] = useState<TimeSlotFromApi[]>([]);
  const [selectedTimeslot, setSelectedTimeslot] = useState<TimeSlotToApi>();
  const [isConfirmPopupOpen, setIsConfirmPopupOpen] = useState(false);

  // Initialize dates from URL params if available
  useEffect(() => {
    const { startDate: urlStartDate } = parseUrlParams();
    if (urlStartDate) {
      setSelectedDay(urlStartDate);
    }
  }, []);

  // Fetch slots from API for the chosen date
  useEffect(() => {
    if (selectedDay) {
      const startDateStr = selectedDay.toISOString().split('T')[0];

      // Log the fetch request
      console.log(`Fetching data for date: ${startDateStr}`);

      fetch(`${baseUrl}?PsychologistId=${psychologistId}&MinDate=${startDateStr}&MaxDate=${startDateStr}&Status=0`) // Put 0 to the constants PsychologistScheduleStatus
        .then((response) => response.json())
        .then((data: ScheduleResponse) => {
          const allSlots = data.flatMap((item) => item.timeSlots);
          setSlotsFromApi(allSlots);
          console.log(`Fetched slots for date ${startDateStr}`, allSlots);
        })
        .catch((error) => console.error('Error fetching schedule:', error));
    }
  }, [selectedDay, psychologistId]);

  // Kiểm tra slot book lịch mới (ít nhất 15 phút sau hiện tại, GMT+7)
  const isTimeValidForScheduling = (dateStr: string, startTime: string): boolean => {
    const now = new Date();
    const minimumScheduleTime = new Date(now.getTime() + 15 * 60 * 1000);
    const [hours, minutes] = startTime.split(':').map(Number);
    const slotTime = new Date(dateStr);
    slotTime.setHours(hours, minutes, 0, 0);
    return slotTime >= minimumScheduleTime;
  };

  // Tạo danh sách slot tĩnh từ 00:00 đến 23:30
  const generateSlots = (date: Date): { startTime: string; endTime: string; status?: number }[] => {
    const slots: { startTime: string; endTime: string; status?: number }[] = [];
    let currentHour = 0;
    let currentMinute = 0;

    while (currentHour < 24) {
      const startHour = currentHour.toString().padStart(2, '0');
      const startMinute = currentMinute.toString().padStart(2, '0');
      const startTime = `${startHour}:${startMinute}`;

      let endHour = currentHour;
      let endMinute = currentMinute + 30;
      if (endMinute >= 60) {
        endHour += 1;
        endMinute -= 60;
      }
      if (endHour >= 24) {
        endHour = 23;
        endMinute = 59;
      }
      const endTime = `${endHour.toString().padStart(2, '0')}:${endMinute.toString().padStart(2, '0')}`;
      const dateStr = date.toISOString().split('T')[0];

      const apiSlot = slotsFromApi.find(
        (s) => s.date === dateStr && s.startTime === startTime && s.endTime === endTime
      );
      const status = apiSlot ? apiSlot.status : undefined;

      slots.push({ startTime, endTime, status });

      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    return slots;
  };

  const handleSlotClick = (slot: { startTime: string; endTime: string; status?: number }) => {
    if (!selectedDay) {
      console.log(selectedDay);
      return;
    }

    const dateStr = selectedDay.toISOString().split('T')[0];
    if (slot.status !== undefined && slot.status > 0) {
      alert('This slot has been booked and cannot be selected.');
      return;
    }

    if (!isTimeValidForScheduling(dateStr, slot.startTime)) {
      alert('You can only schedule slots from 15 minutes after the current time.');
      return;
    }

    // Find the corresponding slot from API to get its ID
    const apiSlot = slotsFromApi.find(
      (s) => s.date === dateStr && s.startTime === slot.startTime && s.endTime === slot.endTime
    );

    const slotToBook = {
      id: apiSlot?.id,  // Include the id from the API data
      startTime: slot.startTime,
      endTime: slot.endTime,
      date: dateStr,
      status: slot.status
    };

    openConfirmPopup(slotToBook);
  };

  // Xử lý khi nhấp vào slot để đặt lịch => bấm vô hiện ra popup chọn specialization và thông tin lịch + confirm đặt lịch
  const openConfirmPopup = (slot: {
    startTime: string; endTime: string; date: string, status: number | undefined
  }) => {
    // Don't open popup if slot is already booked
    if (slot.status != undefined && slot.status > 0) {
      return;
    }

    setSelectedTimeslot(slot);
    setIsConfirmPopupOpen(true);
  }

  // Trong component TimeSlotCalendar
  const handleConfirmAppointment = (data: {
    slot: TimeSlotToApi | undefined;
    specialization: string
  }) => {
    if (!data.slot) {
      alert('Error: No time slot selected');
      return;
    }

    // Tạo object chứa tất cả thông tin đặt lịch
    const bookingData = {
      slotId: data.slot.id,
      date: data.slot.date,
      startTime: data.slot.startTime,
      endTime: data.slot.endTime,
      specialization: data.specialization,
      psychologistId: psychologistId
    };

    // Alert thông tin đặt lịch
    alert(
      'Booking Information:\n\n' +
      `Date: ${bookingData.date}\n` +
      `Time: ${bookingData.startTime} - ${bookingData.endTime}\n` +
      `Specialization ID: ${bookingData.specialization}\n` +
      `Psychologist ID: ${bookingData.psychologistId}\n` +
      `Slot ID: ${bookingData.slotId || 'Not available'}`
    );

    // Sau này khi tích hợp thanh toán, gọi API ở đây
    console.log('Booking data:', bookingData);

  };

  // Hàm xác định class style cho slot dựa trên trạng thái
  const getSlotClassName = (slot: { startTime: string; endTime: string; status?: number }, selectedDay: Date | null) => {
    if (!selectedDay) return styles.slotItem;

    const dateStr = selectedDay.toISOString().split('T')[0];

    const isSelected = (selectedTimeslot != null && selectedTimeslot.date === dateStr && selectedTimeslot.startTime === slot.startTime && selectedTimeslot.endTime === slot.endTime);

    if (slot.status !== undefined && slot.status > 0) {
      return `${styles.slotItem} ${styles.booked}`;
    }
    if (slot.status !== undefined && slot.status == 0) {
      return `${styles.slotItem} ${styles.available}`;
    }

    if (isSelected) {
      return `${styles.slotItem} ${styles.selected}`;
    }

    return `${styles.slotItem} ${styles.default}`;
  };

  return (
    <div className={styles.calendarContainer}>
      <h2 className={styles.calendarTitle}>Schedules</h2>

      <div className={styles.datePickerContainer}>
        <label className={styles.dateLabel}>Choose a date: </label>
        <DatePicker
          selected={selectedDay}
          onChange={(date: Date | null) => {
            if (date) {
              setSelectedDay(date);
              setSlotsFromApi([]);
              setSelectedTimeslot(undefined);
            } else {
              alert('Please select a day.');
            }
          }}
          dateFormat="dd/MM/yyyy"
          minDate={new Date()}
          className={styles.datePicker}
        />

      </div>

      <ConfirmAppointmentPopup
        isOpen={isConfirmPopupOpen}
        onClose={() => setIsConfirmPopupOpen(false)}
        selectedSlot={selectedTimeslot}
        onConfirm={handleConfirmAppointment}
      />

      <div className={styles.calendarContent}>
        {selectedDay && (
          <div className={styles.slotsContainer}>
            <h3 className={styles.slotsTitle}>
              Time Slots for {selectedDay.toLocaleDateString('en-US', { weekday: 'long', day: 'numeric', month: 'short' })}
            </h3>
            <div className={styles.slotsGrid}>
              {generateSlots(selectedDay).map((slot, index) => {
                const isBooked = slot.status !== undefined && slot.status > 0;
                return (
                  <div
                    key={index}
                    onClick={() => !isBooked && handleSlotClick(slot)}
                    className={getSlotClassName(slot, selectedDay)}
                    style={{ cursor: isBooked ? 'not-allowed' : 'pointer' }}
                  >
                    {slot.startTime} - {slot.endTime}
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
'use client';

import { useState, useEffect } from 'react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import styles from './styles/TimeslotCalendar.module.css';
import { post } from '@/lib/apiCaller';

const psychologistScheduleEndpoint = '/psychologist-schedules';
const baseUrl = process.env.NEXT_PUBLIC_API_URL + psychologistScheduleEndpoint;

// Interface cho TimeSlot lấy từ API
interface TimeSlotFromApi {
  id: number;
  startTime: string;
  endTime: string;
  date: string;
  psychologistId: number;
  status: number; // 0 = Available, 1 hoặc 2 = Booked
}

// Interface cho dữ liệu ngày
interface ScheduleDay {
  psychologistId: number;
  date: string;
  weekDay: string;
  timeSlots: TimeSlotFromApi[];
}

// Interface dữ liệu API
interface ScheduleResponse extends Array<ScheduleDay> { }

// Interface cho TimeSlot gửi đi API
interface TimeSlotToApi {
  startTime: string;
  endTime: string;
  date: string;
}

// Interface cho payload gửi API
interface SaveScheduleRequest {
  psychologistId: number;
  startDate: string;
  endDate: string;
  timeslots: TimeSlotToApi[];
}

export default function TimeSlotCalendar() {
  const psychologistId = localStorage.getItem('userId');
  const userRole = localStorage.getItem('userRole');

  if (psychologistId === null || userRole?.toLocaleLowerCase() !== 'psychologist') {
    alert('You must be a psychologist to access this page.');
    window.location.href = '/login';
  }
  const getNearestSunday = (fromDate?: Date): Date => {
    const date = fromDate ? new Date(fromDate) : new Date();
    date.setHours(0, 0, 0, 0);
    date.setMinutes(date.getMinutes() + 7 * 60); // Adjust for timezone if needed

    // If date is not Sunday, find the previous Sunday
    if (date.getDay() !== 0) {
      date.setDate(date.getDate() - date.getDay());
    }

    return date;
  };
  const [startDate, setStartDate] = useState<Date>(getNearestSunday());
  const [selectedDay, setSelectedDay] = useState<Date | null>(null);
  const [slotsFromApi, setSlotsFromApi] = useState<TimeSlotFromApi[]>([]);
  const [selectedTimeslots, setSelectedTimeslots] = useState<TimeSlotToApi[]>([]);
  const [showApplyButton, setShowApplyButton] = useState<boolean>(true);


  // Parse URL params for dates on component mount
  const parseUrlParams = (): { startDate: Date | null } => {
    if (typeof window !== 'undefined') {
      const urlParams = new URLSearchParams(window.location.search);
      const minDateParam = urlParams.get('minDate');

      if (minDateParam) {
        const parsedDate = new Date(minDateParam);
        // Check if valid date
        if (!isNaN(parsedDate.getTime())) {
          // Find the Sunday that begins the week containing this date
          return { startDate: getNearestSunday(parsedDate) };
        }
      }
    }
    return { startDate: null };
  };

  // Fetch slots from API for the entire week and initialize selectedTimeslots
  useEffect(() => {
    if (startDate) {
      const startDateStr = startDate.toISOString().split('T')[0];
      const endDate = new Date(startDate.getTime() + 6 * 86400000); // Add 6 days to get end of week
      const endDateStr = endDate.toISOString().split('T')[0];

      // Log the fetch request
      console.log(`Fetching data for week: ${startDateStr} to ${endDateStr}`);

      fetch(`${baseUrl}?PsychologistId=${psychologistId}&MinDate=${startDateStr}&MaxDate=${endDateStr}`)
        .then((response) => response.json())
        .then((data: ScheduleResponse) => {
          const allSlots = data.flatMap((item) => item.timeSlots);
          setSlotsFromApi(allSlots);
          console.log(`Fetched slots for week ${startDateStr} to ${endDateStr}:`, allSlots);

          // Initialize selectedTimeslots with available slots (status === 0)
          const availableSlots = allSlots
            .filter((slot) => slot.status === 0)
            .map((slot) => ({
              startTime: slot.startTime,
              endTime: slot.endTime,
              date: slot.date,
            }));

          setSelectedTimeslots(availableSlots);

          // Show Apply button only if the current week has no slots
          setShowApplyButton(true);
        })
        .catch((error) => console.error('Error fetching schedule:', error));
    }
  }, [startDate, psychologistId]);

  // Kiểm tra slot có thể set lịch mới (ít nhất 1 tiếng sau hiện tại, GMT+7)
  const isTimeValidForScheduling = (dateStr: string, startTime: string): boolean => {
    const now = new Date();
    const minimumScheduleTime = new Date(now.getTime() + 60 * 60 * 1000);
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

  // Xử lý khi nhấp vào slot để chọn/bỏ chọn
  const handleSlotClick = (slot: { startTime: string; endTime: string; status?: number }) => {
    if (!selectedDay) return;

    const dateStr = selectedDay.toISOString().split('T')[0];
    if (slot.status !== undefined && slot.status > 0) {
      alert('This slot has been booked and cannot be selected.');
      return;
    }

    if (!isTimeValidForScheduling(dateStr, slot.startTime)) {
      alert('You can only schedule slots from 1 hour after the current time.');
      return;
    }

    const slotToManage = { startTime: slot.startTime, endTime: slot.endTime, date: dateStr };
    const existingSlotIndex = selectedTimeslots.findIndex(
      (s) => s.date === dateStr && s.startTime === slot.startTime && s.endTime === slot.endTime
    );

    if (existingSlotIndex === -1) {
      setSelectedTimeslots((prev) => [...prev, slotToManage]);
    } else {
      setSelectedTimeslots((prev) => prev.filter((_, index) => index !== existingSlotIndex));
    }
  };

  // Hàm lưu lịch lên API
  const handleSave = async () => {
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDate = new Date(startDate.getTime() + 6 * 86400000);
    const endDateStr = endDate.toISOString().split('T')[0];

    try {
      // Remove duplicates from selectedTimeslots (in case of manual re-selection)
      const uniqueSlots = Array.from(
        new Set(selectedTimeslots.map((slot) => JSON.stringify({ date: slot.date, startTime: slot.startTime, endTime: slot.endTime })))
      ).map((json) => JSON.parse(json));
      console.log(uniqueSlots);
      // Prepare payload
      const payload: SaveScheduleRequest = {
        psychologistId,
        startDate: startDateStr,
        endDate: endDateStr,
        timeslots: uniqueSlots,
      };

      // Save to API
      const saveResponse = await post(psychologistScheduleEndpoint,
        payload,
      );
      console.log(saveResponse);
      if (saveResponse.status === 200 || saveResponse.status === 201 || saveResponse.status === 204) {
        // Update URL with the current week's start and end dates
        const url = new URL(window.location.href);
        url.searchParams.set('psychologistId', psychologistId.toString());
        url.searchParams.set('minDate', startDateStr);
        url.searchParams.set('maxDate', endDateStr);

        // Update URL without page reload
        window.history.pushState({}, '', url.toString());

        // Refresh the data for current week
        fetch(`${baseUrl}?PsychologistId=${psychologistId}&MinDate=${startDateStr}&MaxDate=${endDateStr}`)
          .then((response) => response.json())
          .then((data: ScheduleResponse) => {
            const allSlots = data.flatMap((item) => item.timeSlots);
            setSlotsFromApi(allSlots);

            // Initialize selectedTimeslots with available slots (status === 0)
            const availableSlots = allSlots
              .filter((slot) => slot.status === 0)
              .map((slot) => ({
                startTime: slot.startTime,
                endTime: slot.endTime,
                date: slot.date,
              }));

            setSelectedTimeslots(availableSlots);
            // Show Apply button only if the current week has no slots
            setShowApplyButton(true);
            alert('Schedule saved successfully!');
          })
          .catch((error) => {
            console.error('Error refreshing schedule:', error);
            alert('Schedule saved, but refreshing data failed. Please reload the page.');
          });
      }
    } catch (error) {
      console.error('Error saving schedule:', error);
    }
  };

  // Function to apply last week's schedule to current week
  const applyLastWeekSchedule = async () => {
    try {
      // Calculate last week's date range
      const lastWeekStartDate = new Date(startDate.getTime() - 7 * 86400000); // Subtract 7 days
      const lastWeekStartDateStr = lastWeekStartDate.toISOString().split('T')[0];
      const lastWeekEndDate = new Date(lastWeekStartDate.getTime() + 6 * 86400000); // Add 6 days
      const lastWeekEndDateStr = lastWeekEndDate.toISOString().split('T')[0];

      console.log(`Fetching last week data: ${lastWeekStartDateStr} to ${lastWeekEndDateStr}`);

      // Fetch last week's schedule
      const response = await fetch(
        `${baseUrl}?PsychologistId=${psychologistId}&MinDate=${lastWeekStartDateStr}&MaxDate=${lastWeekEndDateStr}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch last week's schedule: ${response.status}`);
      }

      const data: ScheduleResponse = await response.json();
      const lastWeekSlots = data.flatMap((item) => item.timeSlots);

      console.log('Last week slots:', lastWeekSlots);

      // If there are no slots from last week
      if (lastWeekSlots.length === 0) {
        alert('No schedule available from last week to apply.');
        return;
      }

      // Convert last week's slots to this week (adding 7 days to each date)
      const thisWeekSlots: TimeSlotToApi[] = lastWeekSlots
        .filter(slot => slot.status === 0) // Only get available slots from last week
        .map(slot => {
          // Parse the date from last week
          const slotDate = new Date(slot.date);
          // Add 7 days to get this week's date
          const newDate = new Date(slotDate.getTime() + 7 * 86400000);
          const newDateStr = newDate.toISOString().split('T')[0];

          return {
            startTime: slot.startTime,
            endTime: slot.endTime,
            date: newDateStr
          };
        });

      console.log('Converted to this week slots:', thisWeekSlots);

      // Set the new slots
      setSelectedTimeslots(thisWeekSlots);

      // Hide the apply button after applying
      setShowApplyButton(false);

      alert('Last week schedule applied successfully! Click Save to commit changes.');
    } catch (error) {
      console.error('Error applying last week schedule:', error);
      alert('Failed to apply last week schedule.');
    }
  };

  // Tạo danh sách 7 ngày dựa trên startDate
  const weekDays = Array.from({ length: 7 }, (_, i): Date => {
    const date = new Date(startDate);
    date.setDate(date.getDate() + i);
    return date;
  });

  // Hàm xác định class style cho slot dựa trên trạng thái
  const getSlotClassName = (slot: { startTime: string; endTime: string; status?: number }, selectedDay: Date | null) => {
    if (!selectedDay) return styles.slotItem;

    const dateStr = selectedDay.toISOString().split('T')[0];
    const isSelected = selectedTimeslots.some(
      (s) => s.date === dateStr && s.startTime === slot.startTime && s.endTime === slot.endTime
    );

    if (slot.status !== undefined && slot.status > 0) {
      return `${styles.slotItem} ${styles.booked}`;
    }

    if (isSelected) {
      return `${styles.slotItem} ${styles.selected}`;
    }

    return `${styles.slotItem} ${styles.available}`;
  };

  return (
    <div className={styles.calendarContainer}>
      <h2 className={styles.calendarTitle}>Manage Working Timetable</h2>

      <div className={styles.datePickerContainer}>
        <label className={styles.dateLabel}>Choose start date (any Sunday): </label>
        <DatePicker
          selected={startDate}
          onChange={(date: Date | null) => {
            if (date && date.getDay() === 0) {
              setStartDate(date);
              setSelectedDay(null);
              setSlotsFromApi([]);
              setSelectedTimeslots([]);
            } else {
              alert('Please select a Sunday.');
            }
          }}
          filterDate={(date: Date) => date.getDay() === 0}
          dateFormat="dd/MM/yyyy"
          className={styles.datePicker}
        />
        {/* Apply Last Week Schedule Button */}
        {showApplyButton && (
          <button
            onClick={applyLastWeekSchedule}
            className={styles.applyButton || `${styles.saveButton} ml-4`}
          >
            Apply schedule of last week
          </button>
        )}
      </div>


      <div className={styles.calendarContent}>
        <div className={styles.daysList}>
          <h3 className={styles.daysTitle}>Days of Week</h3>
          {weekDays.map((day, index) => (
            <div
              key={index}
              onClick={() => setSelectedDay(day)}
              className={`${styles.dayItem} ${selectedDay?.toDateString() === day.toDateString() ? styles.selected : ''}`}
            >
              {day.toLocaleDateString('en-US', { weekday: 'short', day: 'numeric', month: 'short' })}
            </div>
          ))}
        </div>

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

      <div className={styles.saveButtonContainer}>
        <button onClick={handleSave} className={styles.saveButton}>
          Save
        </button>
      </div>
    </div>
  );
}
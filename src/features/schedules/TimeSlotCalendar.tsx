"use client";

import { useState, useEffect } from "react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import styles from "./styles/TimeslotCalendar.module.css";
import {
  TimeSlotFromApi,
  ScheduleResponse,
  TimeSlotToApi,
} from "./schemas/ScheduleSchemas";
import ConfirmAppointmentPopup from "./components/BookingConfirmPopup";
import { useParams } from "next/navigation";
import { Button, Tooltip } from "@heroui/react";

const baseUrl = `${process.env.NEXT_PUBLIC_API_URL}/psychologist-schedules`;
const bookingUrl = `${process.env.NEXT_PUBLIC_API_URL}/appointments/booking/confirm`;

export default function TimeSlotCalendar() {
  // const psychologistId = 8; // thay bằng get từ url gì đó bên list qua
  const { id } = useParams();
  const psychologistId = Number(id);

  console.log("Raw id from useParams:", id);
  console.log("Parsed psychologistId:", psychologistId);

  const getDate = (fromDate?: Date): Date => {
    const date = fromDate ? new Date(fromDate) : new Date();
    date.setHours(0, 0, 0, 0);
    date.setMinutes(date.getMinutes() + 7 * 60); // Adjust for timezone if needed
    return date;
  };

  // Parse URL params for dates on component mount
  const parseUrlParams = (): { startDate: Date | null } => {
    if (typeof window !== "undefined") {
      const urlParams = new URLSearchParams(window.location.search);
      const minDateParam = urlParams.get("minDate");

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
      const startDateStr = selectedDay.toISOString().split("T")[0];

      // Log the fetch request
      console.log(`Fetching data for date: ${startDateStr}`);

      fetch(
        `${baseUrl}?psychologistId=${psychologistId}&minDate=${startDateStr}&maxDate=${startDateStr}`
      ) // Put 0 to the constants PsychologistScheduleStatus
        .then((response) => response.json())
        .then((data: ScheduleResponse) => {
          const allSlots = data.flatMap((item) => item.timeSlots);
          setSlotsFromApi(allSlots);
          console.log(`Fetched slots for date ${startDateStr}`, allSlots);
        })
        .catch((error) => console.error("Error fetching schedule:", error));
    }
  }, [selectedDay, psychologistId]);

  // Kiểm tra slot book lịch mới (ít nhất 15 phút sau hiện tại, GMT+7)
  const isTimeValidForScheduling = (
    dateStr: string,
    startTime: string
  ): boolean => {
    const now = new Date();
    const minimumScheduleTime = new Date(now.getTime() + 15 * 60 * 1000);
    const [hours, minutes] = startTime.split(":").map(Number);
    const slotTime = new Date(dateStr);
    slotTime.setHours(hours, minutes, 0, 0);
    return slotTime >= minimumScheduleTime;
    // return true;
  };

  // Tạo danh sách slot từ API và bổ sung các slots 30 phút chuẩn
  const generateSlots = (
    date: Date
  ): { startTime: string; endTime: string; status?: number }[] => {
    const dateStr = date.toISOString().split("T")[0];

    // First, gather all API-provided slots for this date
    const apiSlots = slotsFromApi
      .filter((s) => s.date === dateStr)
      .map((slot) => ({
        startTime: slot.startTime,
        endTime: slot.endTime,
        status: slot.status,
        id: slot.id,
      }));

    // If there are API slots, return them directly
    if (apiSlots.length > 0) {
      // Sort by startTime for better display
      return apiSlots.sort((a, b) => a.startTime.localeCompare(b.startTime));
    }

    // Otherwise, fallback to generating standard 30-minute slots
    const slots: { startTime: string; endTime: string; status?: number }[] = [];
    let currentHour = 0;
    let currentMinute = 0;

    while (currentHour < 24) {
      const startHour = currentHour.toString().padStart(2, "0");
      const startMinute = currentMinute.toString().padStart(2, "0");
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
      const endTime = `${endHour.toString().padStart(2, "0")}:${endMinute
        .toString()
        .padStart(2, "0")}`;

      slots.push({ startTime, endTime });

      currentMinute += 30;
      if (currentMinute >= 60) {
        currentHour += 1;
        currentMinute = 0;
      }
    }
    return slots;
  };

  const handleSlotClick = (slot: {
    startTime: string;
    endTime: string;
    status?: number;
    id?: number;
  }) => {
    if (!selectedDay) {
      console.log(selectedDay);
      return;
    }

    const dateStr = selectedDay.toISOString().split("T")[0];
    if (slot.status !== undefined && slot.status > 0) {
      alert("Khung giờ này đã được đặt nên bạn không thể đặt nữa!");
      return;
    }

    if (!isTimeValidForScheduling(dateStr, slot.startTime)) {
      alert(
        "Bạn chỉ có thể đặt lịch sau ít nhất 15 phút so với thời điểm hiện tại!"
      );
      return;
    }

    const slotToBook = {
      id: slot.id, // Use the id directly from the slot
      startTime: slot.startTime,
      endTime: slot.endTime,
      date: dateStr,
      status: slot.status,
    };

    openConfirmPopup(slotToBook);
  };

  // Xử lý khi nhấp vào slot để đặt lịch => bấm vô hiện ra popup chọn specialization và thông tin lịch + confirm đặt lịch
  const openConfirmPopup = (slot: {
    id?: number;
    startTime: string;
    endTime: string;
    date: string;
    status?: number;
  }) => {
    // Don't open popup if slot is already booked
    if (slot.status != undefined && slot.status > 0) {
      return;
    }

    setSelectedTimeslot(slot);
    setIsConfirmPopupOpen(true);
  };

  // Trong component TimeSlotCalendar
  const handleConfirmAppointment = async (data: {
    slot: TimeSlotToApi | undefined;
    specializationId: number;
  }) => {
    if (!data.slot) {
      alert("Lỗi: Không có khung giờ nào được chọn");
      return;
    }

    // Retrieve studentId from localStorage
    const studentId = localStorage.getItem("userId");
    if (!studentId) {
      alert("Lỗi: Không có studentId");
      return;
    }

    // Tạo object chứa tất cả thông tin đặt lịch
    const bookingData = {
      scheduleId: data.slot.id,
      date: data.slot.date,
      startTime: data.slot.startTime,
      endTime: data.slot.endTime,
      specializationId: data.specializationId,
      psychologistId: psychologistId,
      studentId: parseInt(studentId),
    };

    // Alert thông tin đặt lịch
    alert(
      "Booking Information:\n\n" +
        `Date: ${bookingData.date}\n` +
        `Time: ${bookingData.startTime} - ${bookingData.endTime}\n` +
        `Specialization ID: ${bookingData.specializationId}\n` +
        `Psychologist ID: ${bookingData.psychologistId}\n` +
        `Slot ID: ${bookingData.scheduleId || "Not available"}`
    );

    await handleStripePayment(bookingData);
    // Sau này khi tích hợp thanh toán, gọi API ở đây
    console.log("Booking data:", bookingData);
  };

  // Hàm xác định class style cho slot dựa trên trạng thái
  const getSlotClassName = (
    slot: { startTime: string; endTime: string; status?: number; id?: number },
    selectedDay: Date | null,
    isOverdue: boolean
  ) => {
    if (!selectedDay) return styles.slotItem;

    const dateStr = selectedDay.toISOString().split("T")[0];

    const isSelected =
      selectedTimeslot != null &&
      selectedTimeslot.date === dateStr &&
      selectedTimeslot.startTime === slot.startTime &&
      selectedTimeslot.endTime === slot.endTime;

    if (slot.status !== undefined && (slot.status > 0 || isOverdue)) {
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
      <h2 className={styles.calendarTitle}>Khung giờ làm việc</h2>

      <div className={styles.datePickerContainer}>
        <label className={styles.dateLabel}>Chọn 1 ngày: </label>
        <DatePicker
          selected={selectedDay}
          onChange={(date: Date | null) => {
            if (date) {
              setSelectedDay(date);
              setSlotsFromApi([]);
              setSelectedTimeslot(undefined);
            } else {
              alert("Vui lòng chọn 1 ngày cụ thể.");
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
              Các khung giờ trong ngày{" "}
              {selectedDay.toLocaleDateString("vi-VN", {
                weekday: "long",
                day: "numeric",
                month: "short",
              })}
            </h3>
            <div className={styles.slotsGrid}>
              {generateSlots(selectedDay).map((slot, index) => {
                const isBooked = slot.status !== undefined && slot.status > 0;
                const isOverdue =
                  new Date(
                    `${selectedDay.toISOString().split("T")[0]}T${
                      slot.startTime
                    }`
                  ) < new Date();
                return isOverdue ? (
                  <Tooltip
                    content={"Slot đã quá hạn"}
                    key={index}
                    color="primary"
                  >
                    <Button
                      onPress={() => handleSlotClick(slot)}
                      className={getSlotClassName(slot, selectedDay, isOverdue)}
                    >
                      {slot.startTime} - {slot.endTime}
                    </Button>
                  </Tooltip>
                ) : isBooked ? (
                  <Tooltip
                    content={"Slot đã được đặt trước"}
                    key={index}
                    color="primary"
                  >
                    <Button
                      onPress={() => handleSlotClick(slot)}
                      className={getSlotClassName(slot, selectedDay, isOverdue)}
                    >
                      {slot.startTime} - {slot.endTime}
                    </Button>
                  </Tooltip>
                ) : (
                  <Button
                    key={index}
                    onPress={() => handleSlotClick(slot)}
                    className={getSlotClassName(slot, selectedDay, isOverdue)}
                  >
                    {slot.startTime} - {slot.endTime}
                  </Button>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

async function handleStripePayment(bookingData: {
  scheduleId: number | undefined;
  date: string;
  startTime: string;
  endTime: string;
  specializationId: number;
  psychologistId: number;
  studentId: number;
}) {
  // temp variable, remove later
  const data = {
    scheduleId: bookingData.scheduleId,
    studentId: bookingData.studentId,
    specializationId: bookingData.specializationId,
    psychologistId: bookingData.psychologistId,
  };
  //
  console.log(data);

  const response = await fetch(`${bookingUrl}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(data),
  });
  const responseData: PaymentResponse = await response.json();

  localStorage.setItem("sessionId", responseData.sessionId);
  window.location.href = responseData.sessionUrl;
}

interface PaymentResponse {
  sessionUrl: string;
  sessionId: string;
}

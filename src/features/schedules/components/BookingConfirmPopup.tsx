import React, { useState, useEffect } from "react";
import styles from "./styles/ConfirmAppointmentPopup.module.css";
import { TimeSlotToApi } from "../schemas/ScheduleSchemas";

// Tạo interface cho props
interface ConfirmAppointmentPopupProps {
  isOpen: boolean;
  onClose: () => void;
  selectedSlot: TimeSlotToApi | undefined;
  onConfirm: (data: {
    slot: TimeSlotToApi | undefined;
    specializationId: number;
  }) => void;
}

interface Specialization {
  id: number;
  name: string;
}

// Sử dụng interface trong component
const ConfirmAppointmentPopup: React.FC<ConfirmAppointmentPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedSlot,
}) => {
  const [specializationId, setSpecializationId] = useState(0);
  const [specializations, setSpecializations] = useState<Specialization[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  // Fetch specializations from API
  useEffect(() => {
    const fetchSpecializations = async () => {
      try {
        setIsLoading(true);
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_API_URL}/specializations`
        );
        if (!response.ok) {
          throw new Error("Failed to fetch specializations");
        }
        const result = await response.json();
        setSpecializations(result.data || []);
      } catch (error) {
        console.error("Error fetching specializations:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isOpen) {
      fetchSpecializations();
    }
  }, [isOpen]);

  const handleConfirm = () => {
    if (!specializationId) {
      alert("Hãy chọn 1 lĩnh vực cụ thể");
      return;
    }
    onConfirm({
      slot: selectedSlot,
      specializationId,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupContent}>
        <h2>Xác nhận đặt lịch</h2>

        {selectedSlot && (
          <div className={styles.appointmentDetails}>
            <p>Ngày: {selectedSlot.date}</p>
            <p>
              Giờ: {selectedSlot.startTime} - {selectedSlot.endTime}
            </p>
          </div>
        )}

        <div className={styles.specializationSelector}>
          <label htmlFor="specialization">Chọn lĩnh vực cần tư vấn:</label>
          <select
            id="specialization"
            value={specializationId}
            onChange={(e) => setSpecializationId(parseInt(e.target.value))}
            disabled={isLoading}
          >
            <option value="">-- Chọn 1 lĩnh vực --</option>
            {specializations.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.name}
              </option>
            ))}
          </select>
          {isLoading && <span className={styles.loadingText}>Đang tải...</span>}
        </div>

        <div className={styles.popupButtons}>
          <button className={styles.cancelButton} onClick={onClose}>
            Đóng
          </button>
          <button className={styles.confirmButton} onClick={handleConfirm}>
            Xác nhận đặt lịch
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmAppointmentPopup;

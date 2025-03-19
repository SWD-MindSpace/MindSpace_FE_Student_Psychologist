import React, { useState } from "react";
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

// Sử dụng interface trong component
const ConfirmAppointmentPopup: React.FC<ConfirmAppointmentPopupProps> = ({
  isOpen,
  onClose,
  onConfirm,
  selectedSlot,
}) => {
  const [specializationId, setSpecializationId] = useState(0);

  // get from api
  // var results = fetch(`https://localhost:7096/api/v1/specializations`);
  const specializations = [
    { id: "1", name: "General Medicine" },
    { id: "2", name: "Cardiology" },
    { id: "3", name: "Dermatology" },
    { id: "4", name: "Neurology" },
    { id: "5", name: "Pediatrics" },
  ];

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
          >
            <option value="">-- Chọn 1 lĩnh vực --</option>
            {specializations.map((spec) => (
              <option key={spec.id} value={spec.id}>
                {spec.name}
              </option>
            ))}
          </select>
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

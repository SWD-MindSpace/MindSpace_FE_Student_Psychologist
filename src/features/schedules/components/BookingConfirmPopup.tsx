import React, { useState } from 'react';
import styles from './styles/ConfirmAppointmentPopup.module.css';
import { TimeSlotToApi } from '../schemas/ScheduleSchemas';

// Tạo interface cho props
interface ConfirmAppointmentPopupProps {
    isOpen: boolean;
    onClose: () => void;
    selectedSlot: TimeSlotToApi | undefined;
    onConfirm: (data: { slot: TimeSlotToApi | undefined; specialization: string }) => void;
}

// Sử dụng interface trong component
const ConfirmAppointmentPopup: React.FC<ConfirmAppointmentPopupProps> = ({
    isOpen,
    onClose,
    onConfirm,
    selectedSlot
}) => {
    const [specialization, setSpecialization] = useState('');

    // get from constants
    const specializations = [
        { id: '1', name: 'General Medicine' },
        { id: '2', name: 'Cardiology' },
        { id: '3', name: 'Dermatology' },
        { id: '4', name: 'Neurology' },
        { id: '5', name: 'Pediatrics' },
    ];

    const handleConfirm = () => {
        if (!specialization) {
            alert('Please select a specialization');
            return;
        }
        onConfirm({
            slot: selectedSlot,
            specialization
        });
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className={styles.popupOverlay}>
            <div className={styles.popupContent}>
                <h2>Confirm Appointment</h2>

                {selectedSlot && (
                    <div className={styles.appointmentDetails}>
                        <p>Date: {selectedSlot.date}</p>
                        <p>Time: {selectedSlot.startTime} - {selectedSlot.endTime}</p>
                    </div>
                )}

                <div className={styles.specializationSelector}>
                    <label htmlFor="specialization">Select Specialization:</label>
                    <select
                        id="specialization"
                        value={specialization}
                        onChange={(e) => setSpecialization(e.target.value)}
                    >
                        <option value="">-- Select a specialization --</option>
                        {specializations.map(spec => (
                            <option key={spec.id} value={spec.id}>
                                {spec.name}
                            </option>
                        ))}
                    </select>
                </div>

                <div className={styles.popupButtons}>
                    <button
                        className={styles.cancelButton}
                        onClick={onClose}
                    >
                        Cancel
                    </button>
                    <button
                        className={styles.confirmButton}
                        onClick={handleConfirm}
                    >
                        Confirm Appointment
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ConfirmAppointmentPopup;
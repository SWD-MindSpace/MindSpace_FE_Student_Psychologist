"use client";
import AppointmentNotesForm from "@/features/appointment-notes/components/AppointmentNotesForm";
import { Card } from '@heroui/react';

export default function AppointmentNotes() {
    return (
        <Card className="w-full max-w-4xl mx-auto mt-8 p-6 shadow-lg mb-24">
            <h2 className="text-2xl font-bold mb-4">Appointment Notes</h2>
            <div>
                <AppointmentNotesForm />
            </div>
        </Card>

    )
}
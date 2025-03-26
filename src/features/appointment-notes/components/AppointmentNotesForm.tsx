import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { Avatar } from '@heroui/react';
import AppointmentNotesFormBody from './AppointmentNotesFormBody';
import toast, { Toaster } from 'react-hot-toast';
import { AppointmentNotes } from '@/types/appointment';
import { getAppointmentNotesByAppointmentId, updateAppointmentNotes } from '../APIs';
import { useParams } from 'next/navigation';

interface User {
    id: number;
    name: string;
    avatar: string;
}

const AppointmentNotesForm: React.FC = () => {
    const userId = localStorage.getItem('userId');
    const userRole = localStorage.getItem('userRole');

    const { id } = useParams();
    if (!id) return null;

    const [displayedUser, setDisplayedUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [existingNote, setExistingNote] = useState<AppointmentNotes | null>(null);

    const {
        control,
        handleSubmit,
        reset,
        watch,
        formState
    } = useForm<AppointmentNotes>({
        defaultValues: {
            notesTitle: '',
            keyIssues: '',
            suggestions: '',
            otherNotes: '',
            isNoteShown: false
        }
    });

    // Fetch existing notes on component mount
    useEffect(() => {
        const fetchExistingNotes = async () => {
            try {
                const response = await getAppointmentNotesByAppointmentId(id);
                const existingNotes: AppointmentNotes | null = response.data;
                console.log('Fetched notes:', existingNotes); // Debug dữ liệu từ API

                if (existingNotes) {
                    // Hiển thị thông tin người kia dựa trên vai trò
                    if (userRole?.toLowerCase() === 'psychologist') {
                        setDisplayedUser({
                            id: existingNotes.studentId,
                            name: existingNotes.studentName,
                            avatar: existingNotes.studentImageUrl || '/default-avatar.png'
                        });
                    } else if (userRole?.toLowerCase() === 'student') {
                        setDisplayedUser({
                            id: existingNotes.psychologistId, // Giả sử API trả về
                            name: existingNotes.psychologistName, // Giả sử API trả về
                            avatar: existingNotes.psychologistImageUrl || '/default-avatar.png' // Giả sử API trả về
                        });
                    }

                    setExistingNote(existingNotes);
                    reset({
                        notesTitle: existingNotes.notesTitle || '',
                        keyIssues: existingNotes.keyIssues || '',
                        suggestions: existingNotes.suggestions || '',
                        otherNotes: existingNotes.otherNotes || '',
                        isNoteShown: existingNotes.isNoteShown ?? false
                    });
                }
            } catch (error) {
                console.error('Error fetching notes:', error);
                toast.error('Failed to fetch appointment notes');
            }
        };

        fetchExistingNotes();
    }, [reset, userRole, id]);

    const onSubmit = async (data: AppointmentNotes) => {
        data.appointmentId = parseInt(id as string); // important because notes must be associated with an appointment
        setIsLoading(true);
        try {
            await updateAppointmentNotes(data);
            toast.success(existingNote ? 'Appointment note updated successfully' : 'Appointment note created successfully');
            setExistingNote(data);
        } catch (error) {
            toast.error('Failed to save appointment note');
        } finally {
            setIsLoading(false);
        }
    };

    const handlePreview = () => {
        const formData = watch();
        toast(
            <div className="space-y-2">
                <h3 className="font-semibold text-gray-800">{formData.notesTitle || 'Untitled Note'}</h3>
                {Object.entries({
                    'Key Issues': formData.keyIssues,
                    'Suggestions': formData.suggestions,
                    'Other Notes': formData.otherNotes
                }).map(([key, value]) => value && (
                    <div key={key}>
                        <div className="font-medium text-gray-700">{key}:</div>
                        <p className="text-gray-600">{value}</p>
                    </div>
                ))}
            </div>,
            { duration: 4000 }
        );
    };

    const handleClearForm = () => {
        reset({
            notesTitle: '',
            keyIssues: '',
            suggestions: '',
            otherNotes: '',
            isNoteShown: false
        });
        toast.success('Form cleared', { duration: 2000 });
    };

    return (
        <div className="max-w-3xl mx-auto p-8 bg-white shadow-xl rounded-xl border border-gray-100">
            <Toaster position="top-right" />

            {/* Header */}
            <div className="flex items-center mb-8">
                {displayedUser && (
                    <div className="flex items-center">
                        <Avatar
                            src={displayedUser.avatar}
                            alt={displayedUser.name}
                            className="w-12 h-12 mr-4 rounded-full border-2 border-indigo-100"
                        />
                        <div>
                            <h2 className="text-2xl font-bold text-gray-800 ml-4">{displayedUser.name}</h2>
                        </div>
                    </div>
                )}
            </div>

            {userRole?.toLowerCase() === 'psychologist' ? (
                <AppointmentNotesFormBody
                    form={{ control, handleSubmit, watch, formState }}
                    isReadOnly={false}
                    isLoading={isLoading}
                    onSubmit={onSubmit}
                    onPreview={handlePreview}
                    onClear={handleClearForm}
                    showActions={true}
                />
            ) : userRole?.toLowerCase() === 'student' ? (
                <AppointmentNotesFormBody
                    form={{ control, handleSubmit, watch, formState }}
                    isReadOnly={true}
                    isLoading={false}
                    onSubmit={() => { }}
                    onPreview={() => { }}
                    onClear={() => { }}
                    showActions={false}
                />
            ) : (
                <div className="text-center text-gray-600">
                    You do not have permission to view this form.
                </div>
            )}
        </div>
    );
};

export default AppointmentNotesForm;
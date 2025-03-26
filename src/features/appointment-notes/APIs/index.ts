import { get, put } from '@/lib/apiCaller';
import { AppointmentNotes } from '@/types/appointment';

const appointmentNotesEndpoint = '/appointment-notes';
export type AppointmentNotesQueryParams = {
    AccountId: number,
    IsNoteShown?: boolean,
    PageSize?: number | 5,
    PageIndex?: number | 1,
}
export const getAppointmentNotesByAppointmentId = async (id: any) => {
    return get(`${appointmentNotesEndpoint}/${id}`);
}

export const getAppointmentNotes = async (params: AppointmentNotesQueryParams) => {
    return get(`${appointmentNotesEndpoint}`, params);
}

export const updateAppointmentNotes = async (appointmentNotes: AppointmentNotes) => {
    return put(`${appointmentNotesEndpoint}`, appointmentNotes);
}
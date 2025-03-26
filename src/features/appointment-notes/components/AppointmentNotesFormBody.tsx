import React from 'react';
import { Controller, UseFormReturn } from 'react-hook-form';
import {
    Input,
    Textarea,
    Button,
    Switch
} from '@heroui/react';
import {
    ListIcon,
    LightbulbIcon,
    MessageSquareIcon,
    EyeIcon,
    Trash2Icon,
    SaveIcon
} from 'lucide-react';
import { AppointmentNotes } from '@/types/appointment';

interface NotesFormProps {
    form: UseFormReturn<AppointmentNotes>;
    isReadOnly?: boolean;
    isLoading?: boolean;
    onSubmit: (data: AppointmentNotes) => void;
    onPreview: () => void;
    onClear: () => void;
    showActions?: boolean;
}

const AppointmentNotesFormBody: React.FC<NotesFormProps> = ({
    form,
    isReadOnly = false,
    isLoading = false,
    onSubmit,
    onPreview,
    onClear,
    showActions = true
}) => {
    const { control, handleSubmit, watch } = form;

    return (
        <div className="space-y-6">
            {/* Notes Title */}
            <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Notes Title
                </label>
                {isReadOnly ? (
                    <Input
                        value={watch('notesTitle') || ''}
                        readOnly
                        className="w-full px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600"
                    />
                ) : (
                    <Controller
                        name="notesTitle"
                        control={control}
                        render={({ field }) => (
                            <Input
                                {...field}
                                placeholder="Enter notes title"
                                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                            />
                        )}
                    />
                )}
            </div>

            {/* Key Issues */}
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Key Issues
                </label>
                <div className="relative">
                    {isReadOnly ? (
                        <Textarea
                            value={watch('keyIssues') || ''}
                            readOnly
                            className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 pr-12"
                        />
                    ) : (
                        <Controller
                            name="keyIssues"
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="Describe key issues discussed during the session"
                                    className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 pr-12"
                                />
                            )}
                        />
                    )}
                    <ListIcon className="absolute top-4 right-4 w-5 h-5 text-indigo-400 pointer-events-none" />
                </div>
            </div>

            {/* Suggestions & Recommendations */}
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Suggestions & Recommendations
                </label>
                <div className="relative">
                    {isReadOnly ? (
                        <Textarea
                            value={watch('suggestions') || ''}
                            readOnly
                            className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 pr-12"
                        />
                    ) : (
                        <Controller
                            name="suggestions"
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    placeholder="Enter suggestions and recommendations"
                                    className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 pr-12"
                                />
                            )}
                        />
                    )}
                    <LightbulbIcon className="absolute top-4 right-4 w-5 h-5 text-indigo-400 pointer-events-none" />
                </div>
            </div>

            {/* Other Notes */}
            <div className="relative">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Other Notes
                </label>
                <div className="relative">
                    {isReadOnly ? (
                        <Textarea
                            value={watch('otherNotes') || ''}
                            readOnly
                            className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg bg-gray-100 text-gray-600 pr-12"
                        />
                    ) : (
                        <Controller
                            name="otherNotes"
                            control={control}
                            render={({ field }) => (
                                <Textarea
                                    {...field}
                                    value={field.value || ''}
                                    placeholder="Additional observations or notes"
                                    className="w-full min-h-[120px] px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200 pr-12"
                                />
                            )}
                        />
                    )}
                    <MessageSquareIcon className="absolute top-4 right-4 w-5 h-5 text-indigo-400 pointer-events-none" />
                </div>
            </div>

            {/* Visibility Toggle */}
            {isReadOnly == false && <div className="flex justify-between items-center bg-gray-50 p-4 rounded-lg">
                <span className="text-sm font-medium text-gray-700">
                    Share notes with student
                </span>
                (
                <Controller
                    name="isNoteShown"
                    control={control}
                    render={({ field: { value, onChange } }) => (
                        <Switch
                            checked={value}
                            onChange={onChange}
                            className="text-indigo-600 focus:ring-indigo-500"
                        />
                    )}
                />
                )
            </div>}

            {/* Action Buttons (chỉ hiển thị nếu showActions là true) */}
            {showActions && (
                <div className="flex justify-end gap-3 pt-6 border-t border-gray-200">
                    <Button
                        variant="bordered"
                        onClick={onClear}
                        className="flex items-center gap-2 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100 transition-all duration-200"
                    >
                        <Trash2Icon size={16} />
                        Clear Form
                    </Button>
                    <Button
                        variant="bordered"
                        onClick={onPreview}
                        className="flex items-center gap-2 px-4 py-2 text-indigo-600 border border-indigo-300 rounded-lg hover:bg-indigo-50 transition-all duration-200"
                    >
                        <EyeIcon size={16} />
                        Preview
                    </Button>
                    <Button
                        color="primary"
                        onClick={handleSubmit(onSubmit)}
                        disabled={isLoading || !form.formState.isDirty}
                        className="flex items-center gap-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:bg-indigo-300 disabled:cursor-not-allowed transition-all duration-200"
                    >
                        <SaveIcon size={16} />
                        {isLoading ? 'Saving...' : 'Save Notes'}
                    </Button>
                </div>
            )}
        </div>
    );
};

export default AppointmentNotesFormBody;
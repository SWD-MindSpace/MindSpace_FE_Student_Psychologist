// components/list/ListActions.tsx
import React, { useState } from 'react';
import {
    DropdownTrigger,
    Dropdown,
    DropdownMenu,
    DropdownItem,
    Button
} from '@heroui/react';
import VerticalDotsIcon from '../icon/VerticalDotsIcon';
import { usePathname, useRouter } from 'next/navigation';
import DeleteConfirmationPopup from '../DeleteConfirmationPopup';

interface ListActionsProps {
    id?: number;
    onToggleStatus?: () => void;
    toggleStatusLabel?: {
        active: string;
        inactive: string;
    };
    entityName?: string;
    onDeleteItem?: (id: number) => Promise<any>;
    viewDetailHref?: string;
    editHref?: string;
    onView?: () => void;
    onEdit?: () => void;
}

export default function ListActions({
    id,
    onToggleStatus,
    toggleStatusLabel = {
        active: 'Vô hiệu hóa',
        inactive: 'Kích hoạt'
    },
    entityName,
    onDeleteItem,
    viewDetailHref,
    editHref
}: ListActionsProps) {
    const pathname = usePathname();
    const router = useRouter();
    const [isDeletePopupOpen, setIsDeletePopupOpen] = useState(false); // State để kiểm soát popup

    // Default view handler
    const handleView = () => {
        if (viewDetailHref) {
            window.open(viewDetailHref, '_blank');
        } else if (id !== undefined) {
            window.open(`${pathname}/detail/${id}`, '_blank');
        }
    };

    // Default edit handler
    const handleEdit = () => {
        if (editHref) {
            router.push(editHref);
        } else if (id !== undefined) {
            router.push(`${pathname}/edit/${id}`);
        }
    };

    // Default toggle status handler
    const handleToggleStatus = () => {
        if (onToggleStatus) {
            onToggleStatus();
        }
    };

    // Mở popup xóa
    const handleOpenDeletePopup = () => {
        setIsDeletePopupOpen(true);
    };

    return (
        <div className="relative flex justify-end items-center gap-2">
            <Dropdown>
                <DropdownTrigger>
                    <Button isIconOnly size="sm" variant="light">
                        <VerticalDotsIcon className="text-default-300" />
                    </Button>
                </DropdownTrigger>

                <DropdownMenu>
                    <DropdownItem
                        key="view"
                        color="primary"
                        onAction={handleView}
                    >
                        Xem
                    </DropdownItem>
                    {onToggleStatus ? (
                        <DropdownItem
                            key="toggle-status"
                            color="primary"
                            onAction={handleToggleStatus}
                        >
                            Chỉnh sửa trạng thái
                        </DropdownItem>
                    ) : null}
                    {onDeleteItem && id !== undefined && entityName ? (
                        <DropdownItem
                            key="delete"
                            color="danger"
                            onAction={handleOpenDeletePopup}
                        >
                            Xóa bỏ
                        </DropdownItem>
                    ) : null}
                    <DropdownItem
                        key="edit"
                        color="primary"
                        onAction={handleEdit}
                    >
                        Chỉnh sửa
                    </DropdownItem>
                </DropdownMenu>
            </Dropdown>

            {/* Hiển thị DeleteConfirmationPopup khi isDeletePopupOpen = true */}
            {isDeletePopupOpen && id !== undefined && entityName && onDeleteItem && (
                <DeleteConfirmationPopup
                    entityId={id}
                    entityName={entityName}
                    onDelete={onDeleteItem}
                >
                    <div className="hidden" /> {/* Trigger không cần hiển thị */}
                </DeleteConfirmationPopup>
            )}
        </div>
    );
}
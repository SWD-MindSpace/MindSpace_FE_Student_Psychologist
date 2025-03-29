import React from 'react'
import { Pagination as PaginationComponent } from "@heroui/react";
import { ReadonlyURLSearchParams } from 'next/navigation';

type Props = {
    searchParams: ReadonlyURLSearchParams,
    totalPages: number | null,
    totalItems: number | null,
    onInputChange: (key: string, value: number) => void
}

export default function Pagination({ searchParams, totalPages, totalItems, onInputChange }: Props) {

    const paginationItemStyle = {
        item: 'border-1 border-gray-200',
        cursor: 'bg-black text-white'
    }

    return (
        <div className='mt-8 flex justify-between items-start'>

            <div className='ml-3 font-semibold text-md'>Kết quả: {totalItems}</div>

            <PaginationComponent
                initialPage={1}
                page={searchParams.has('PageIndex') ? Number(searchParams.get('PageIndex')) : 1}
                total={totalPages as number}
                showControls
                showShadow
                variant="flat"
                classNames={paginationItemStyle}
                onChange={(selectedPage) => onInputChange('PageIndex', selectedPage)}
            />

        </div>
    )
}

import React from 'react'
import { Input } from "@heroui/react";
import { SearchIcon } from '../icon/SearchIcon';
import { ReadonlyURLSearchParams } from 'next/navigation';

type Props = {
    searchParams: ReadonlyURLSearchParams,
    searchBoxProps: { placeholder: string, searchField: string }
    onInputChange: (key: string, value: string) => void
}

export default function SearchBox({ searchParams, searchBoxProps, onInputChange }: Props) {

    const { placeholder, searchField } = searchBoxProps

    return (
        <Input
            variant="underlined"
            isClearable
            className="w-full"
            placeholder={placeholder}
            startContent={<SearchIcon />}
            defaultValue={searchParams.get(searchField) || ''}
            onValueChange={(text) => onInputChange(searchField, text)}
        />
    )
}

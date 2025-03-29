import React from 'react'
import {
    Table,
    TableHeader,
    TableColumn,
    TableBody,
    TableRow,
    TableCell,
} from '@heroui/react'
import { TableData as Data } from '@/types'
import { usePathname } from 'next/navigation'


type Props = {
    columns: Array<{ name: string, uid: string }>,
    data: Data[]
    renderCell: (data: Data, columnKey: React.Key) => React.JSX.Element | undefined,
    centerColumns: string[]
}


export default function TableData({ columns, data, renderCell, centerColumns }: Props) {

    const pathname = usePathname()

    const tableStyles = {
        th: 'text-center',
        td: 'py-4'
    }

    return (
        <div>
            <Table
                isHeaderSticky
                aria-label="Example table with custom cells, pagination and sorting"
                selectionMode="single"
                color="primary"
                isCompact
                classNames={tableStyles}
                onRowAction={(key) => window.open(`${pathname}/detail/${key}`, '_blank')}
            >
                <TableHeader columns={columns}>
                    {(columns) => (
                        <TableColumn
                            key={columns.uid}
                            align={centerColumns.includes(columns.uid) ? "center" : "start"}
                        >
                            {columns.name}
                        </TableColumn>
                    )}
                </TableHeader>
                <TableBody emptyContent={"No data found"} items={data}>
                    {(item) => (
                        <TableRow key={item.id}>
                            {(columnKey) => <TableCell>{renderCell(item, columnKey)}</TableCell>}
                        </TableRow>
                    )}
                </TableBody>
            </Table>
        </div>
    )
}

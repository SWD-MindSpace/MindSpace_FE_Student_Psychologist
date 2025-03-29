'use client';

import React, { useState, useEffect } from 'react';
import { Table, TableHeader, TableColumn, TableBody, TableRow, TableCell } from '@heroui/react';
import { Invoice, InvoiceQueryParams } from '@/types/invoice';
import InvoiceFilter from '@/features/invoices/components/InvoiceFilter';
import { getInvoiceList } from '@/features/invoices/APIs';
import { useRouter, useSearchParams } from 'next/navigation';
import Pagination from '@/components/list/Pagination';
import { formatPrice } from '@/lib/utils';

const ManageInvoiceListPage = () => {
    const [invoices, setInvoices] = useState<Invoice[]>([]);
    const [loading, setLoading] = useState(false);
    const [totalItems, setTotalItems] = useState<number | null>(null);
    const [totalPages, setTotalPages] = useState<number | null>(null);
    const [filters, setFilters] = useState<InvoiceQueryParams>({
        appointmentId: '',
        minAmount: '',
        maxAmount: '',
        transactionCode: '',
        provider: '',
        paymentMethod: '',
        paymentType: null,
        fromDate: null,
        toDate: null,
        accountName: ''
    });
    const searchParams = useSearchParams();
    const router = useRouter();
    const pageSize = 12;
    const fetchInvoices = async (filters: InvoiceQueryParams) => {
        setLoading(true);
        try {
            const queryParams: InvoiceQueryParams = {
                appointmentId: filters.appointmentId || '',
                minAmount: filters.minAmount || '',
                maxAmount: filters.maxAmount || '',
                transactionCode: filters.transactionCode || '',
                provider: filters.provider || '',
                paymentMethod: filters.paymentMethod || '',
                paymentType: filters.paymentType !== undefined ? filters.paymentType : null,
                fromDate: filters.fromDate || null,
                toDate: filters.toDate || null,
                accountName: filters.accountName || '',
                pageIndex: filters.pageIndex || 1,
                pageSize: pageSize
            };

            const response = await getInvoiceList(queryParams);
            setInvoices(response.data.data);
            setTotalItems(response.data.count || 0);
            setTotalPages(Math.ceil((response.data.count || 0) / pageSize));
        } catch (error) {
            console.error('Error fetching invoices:', error);
        } finally {
            setLoading(false);
        }
    };

    // Gọi API lần đầu khi trang được tải
    useEffect(() => {
        const pageIndex = searchParams.has('PageIndex') ? Number(searchParams.get('PageIndex')) : 1;
        const currentFilters = {
            ...filters,
            pageIndex: pageIndex,
            pageSize: pageSize
        };
        fetchInvoices(currentFilters);
    }, [searchParams]);

    // Xử lý khi người dùng áp dụng bộ lọc
    const handleFilter = (newFilters: InvoiceQueryParams) => {
        const updatedFilters = {
            ...newFilters,
            pageIndex: 1,
            pageSize: pageSize
        };
        fetchInvoices(updatedFilters);

        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set('PageIndex', '1');
        router.push(`?${newSearchParams.toString()}`);
    };

    const handleInputChange = (key: string, value: number) => {
        const newSearchParams = new URLSearchParams(searchParams.toString());
        newSearchParams.set(key, value.toString());
        router.push(`?${newSearchParams.toString()}`);
    };

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6">Quản lý lịch sử giao dịch</h1>

            <InvoiceFilter onFilter={handleFilter} />

            <div className="mt-6">
                {loading ? (
                    <div className="text-center text-gray-600">Loading...</div>
                ) : invoices.length === 0 ? (
                    <div className="text-center text-gray-600">Không tìm thấy giao dịch nào.</div>
                ) : (
                    <Table className="w-full border border-gray-200 rounded-lg">
                        <TableHeader>
                            <TableColumn>Appointment ID</TableColumn>
                            <TableColumn>Amount</TableColumn>
                            <TableColumn>Transaction Code</TableColumn>
                            <TableColumn>Provider</TableColumn>
                            <TableColumn>Payment Method</TableColumn>
                            <TableColumn>Payment Type</TableColumn>
                            <TableColumn>Transaction Time</TableColumn>
                            <TableColumn>User</TableColumn>
                        </TableHeader>
                        <TableBody>
                            {invoices.map((invoice, index) => (
                                <TableRow key={index}>
                                    <TableCell>{invoice.appointmentId}</TableCell>
                                    <TableCell>{formatPrice(invoice.amount)}</TableCell>
                                    <TableCell>{invoice.transactionCode}</TableCell>
                                    <TableCell>{invoice.provider}</TableCell>
                                    <TableCell>{invoice.paymentMethod}</TableCell>
                                    <TableCell>{invoice.paymentType}</TableCell>
                                    <TableCell>
                                        {new Date(invoice.transactionTime).toLocaleDateString('en-GB', {
                                            day: '2-digit',
                                            month: '2-digit',
                                            year: 'numeric'
                                        })}
                                    </TableCell>
                                    <TableCell>{invoice.accountName}</TableCell>
                                </TableRow>
                            ))}
                        </TableBody>
                    </Table>
                )}
            </div>
            <Pagination
                searchParams={searchParams}
                totalPages={totalPages}
                totalItems={totalItems}
                onInputChange={handleInputChange}
            />
        </div>
    );
};

export default ManageInvoiceListPage;
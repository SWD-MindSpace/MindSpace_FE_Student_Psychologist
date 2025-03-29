import React, { useState } from 'react';
import { Input, Select, SelectItem, Button } from '@heroui/react';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import { InvoiceQueryParams } from '@/types/invoice';

const InvoiceFilter: React.FC<{ onFilter: (filters: InvoiceQueryParams) => void }> = ({ onFilter }) => {
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

    const handleChange = (field: keyof InvoiceQueryParams, value: any) => {
        console.log("Status: ", value);
        setFilters((prev) => ({ ...prev, [field]: value }));
        console.log(filters)
    };

    const handleSubmit = () => {
        onFilter(filters);
    };

    const handleClear = () => {
        const clearedFilters: InvoiceQueryParams = {
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
        };
        setFilters(clearedFilters);
        onFilter(clearedFilters);
    };

    return (
        <div className="p-4 bg-gray-100 rounded-lg shadow-md space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">Bộ Lọc Giao Dịch</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Appointment ID */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã buổi tư vấn</label>
                    <Input
                        value={filters.appointmentId}
                        onChange={(e) => handleChange('appointmentId', e.target.value)}
                        placeholder="Nhập mã buổi tư vấn"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                </div>

                {/* Amount Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền giao dịch (cận dưới)</label>
                    <Input
                        type="number"
                        value={filters.minAmount}
                        onChange={(e) => handleChange('minAmount', e.target.value)}
                        placeholder="Nhập số tiền cận dưới"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Số tiền giao dịch (cận trên)</label>
                    <Input
                        type="number"
                        value={filters.maxAmount}
                        onChange={(e) => handleChange('maxAmount', e.target.value)}
                        placeholder="Nhập số tiền cận trên"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                </div>

                {/* Transaction Code */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Mã giao dịch</label>
                    <Input
                        value={filters.transactionCode}
                        onChange={(e) => handleChange('transactionCode', e.target.value)}
                        placeholder="Nhập mã giao dịch"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                </div>

                {/* Payment Provider */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đơn vị cung cấp DV thanh toán</label>
                    <Input
                        value={filters.provider}
                        onChange={(e) => handleChange('provider', e.target.value)}
                        placeholder="Nhập đơn vị cung cấp"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                </div>
                {/* Payment Type */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Loại giao dịch</label>
                    <Select
                        value={filters.paymentType !== null ? filters.paymentType.toString() : ''} // Đảm bảo value khớp với key
                        onSelectionChange={(selection) => {
                            const key = selection.currentKey;
                            handleChange('paymentType', (key || key === '0') ? parseInt(key) : null);
                        }} // Lấy key từ SelectItem
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        selectionMode="single" // Chỉ cho phép chọn một giá trị
                        placeholder="Chọn loại giao dịch"
                    >
                        <SelectItem key="">Tất cả các loại</SelectItem>
                        <SelectItem key="0">Khách hàng thanh toán (Purchase)</SelectItem>
                        <SelectItem key="1">Hệ thống hoàn tiền (Refund)</SelectItem>
                    </Select>
                </div>

                {/* Transaction Date Range */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Từ ngày</label>
                    <DatePicker
                        selected={filters.fromDate ? new Date(filters.fromDate) : null}
                        onChange={(date) => {
                            if (filters.toDate && date && date > new Date(filters.toDate)) {
                                alert('Ngày bắt đầu không thể sau ngày kết thúc');
                                return;
                            }
                            handleChange('fromDate', date);
                        }}
                        selectsStart
                        startDate={filters.fromDate ? new Date(filters.fromDate) : null}
                        endDate={filters.toDate ? new Date(filters.toDate) : null}
                        dateFormat="dd/MM/yyyy"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        placeholderText="Chọn ngày bắt đầu"
                    />
                </div>
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Đến ngày</label>
                    <DatePicker
                        selected={filters.toDate ? new Date(filters.toDate) : null}
                        onChange={(date) => {
                            if (filters.fromDate && date && date < new Date(filters.fromDate)) {
                                alert('Ngày kết thúc không thể trước ngày bắt đầu');
                                return;
                            }
                            handleChange('toDate', date);
                        }}
                        selectsEnd
                        startDate={filters.fromDate ? new Date(filters.fromDate) : null}
                        endDate={filters.toDate ? new Date(filters.toDate) : null}
                        dateFormat="dd/MM/yyyy"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                        placeholderText="Chọn ngày kết thúc"
                    />
                </div>

                {/* Account (User) */}
                <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Người thanh toán</label>
                    <Input
                        value={filters.accountName}
                        onChange={(e) => handleChange('accountName', e.target.value)}
                        placeholder="Nhập tên người thanh toán"
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all duration-200"
                    />
                </div>
            </div>

            <div className="flex justify-end gap-3">
                <Button
                    onClick={handleClear}
                    className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-all duration-200"
                >
                    Clear Filters
                </Button>
                <Button
                    onClick={handleSubmit}
                    className="px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 transition-all duration-200"
                >
                    Apply Filters
                </Button>
            </div>
        </div>
    );
};

export default InvoiceFilter;
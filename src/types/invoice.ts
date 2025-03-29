export interface Invoice {
    id: number;
    appointmentId: number;
    amount: number;
    transactionCode: string;
    provider: string;
    paymentMethod: string;
    paymentType: string;
    transactionTime: string;
    accountName: string;
}

export interface InvoiceQueryParams {
    appointmentId: string;
    minAmount: string;
    maxAmount: string;
    transactionCode: string;
    provider: string;
    paymentMethod: string;
    paymentType: number | null;
    fromDate: Date | null;
    toDate: Date | null;
    accountName: string;
    pageIndex?: number;
    pageSize?: number;
}
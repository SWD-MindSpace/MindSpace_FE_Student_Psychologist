import { get } from '@/lib/apiCaller';
import { InvoiceQueryParams } from '@/types/invoice';
const invoiceEndpoint = '/invoices';

export const getInvoiceList = async (searchParams: InvoiceQueryParams) => {
    return get(`${invoiceEndpoint}/user`, searchParams)
}
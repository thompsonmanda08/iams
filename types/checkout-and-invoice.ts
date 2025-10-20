export type InvoiceItem = {
  description: string;
  quantity: number;
  price: number;
  amount: number;
};

export type InvoiceFrom = {
  name: string;
  address: string;
  logo: string;
  city: string;
  email: string;
};

export type InvoiceBilledTo = {
  name: string;
  address: string;
  city: string;
  phone: string;
  email: string;
};

export type Invoice = {
  id: string | number;
  workspaceID: string | number;
  invoiceID: string | number;
  date: string | Date;
  from: InvoiceFrom;
  billedTo: InvoiceBilledTo;
  items: InvoiceItem[];
  taxRate: number;
  tax: number;
  total: number;
  dueAmount: number;
  status: string;
  note: string;
};

export type CheckoutData = {
  workspaceID: string;
  checkoutID: string;
  amount: string;
  transactionID: string;
  serviceID: string;
  logo?: string;
  city?: string;
  email?: string;
  display_name?: string;
  physical_address?: any;
  [s: string]: any;
};

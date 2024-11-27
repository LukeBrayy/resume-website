
import React from 'react';
import { InvoiceForm } from './InvoiceForm';
import { InvoiceList } from './InvoiceList';
import { useInvoices } from '../../hooks/useInvoices';
import './InvoiceGenerator.css';

const InvoiceGenerator = ({ assignments, companiesData, purchaseOrders, invoices, saveInvoices }) => {
    const { 
        handleCreateInvoice, 
        handleDeleteInvoice, 
        markAsSent, 
        markAsUnsent 
    } = useInvoices(invoices, saveInvoices);

    return (
        <div className="invoice-generator">
            <h3>Generate Invoice</h3>
            <InvoiceForm 
                assignments={assignments}
                companiesData={companiesData}
                purchaseOrders={purchaseOrders}
                onCreateInvoice={handleCreateInvoice}
            />
            <InvoiceList 
                invoices={invoices}
                onDelete={handleDeleteInvoice}
                onMarkSent={markAsSent}
                onMarkUnsent={markAsUnsent}
            />
        </div>
    );
};

export default InvoiceGenerator;
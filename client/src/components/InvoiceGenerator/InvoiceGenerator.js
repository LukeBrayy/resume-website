import React, { useState, useEffect } from 'react';
import { InvoiceForm } from './InvoiceForm';
import { InvoiceList } from './InvoiceList';
import { useInvoices } from '../../hooks/useInvoices';
import { getSetting } from '../../services/firebase';
import './InvoiceGenerator.css';

const InvoiceGenerator = ({ assignments, companiesData, purchaseOrders, invoices, saveInvoices }) => {
    const [paymentDetails, setPaymentDetails] = useState(null);
    const { 
        handleCreateInvoice, 
        handleDeleteInvoice, 
        markAsSent, 
        markAsUnsent,
        generateInvoicePreview 
    } = useInvoices(invoices, saveInvoices);

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            const doc = await getSetting('paymentDetails');
            if (doc.exists()) {
                setPaymentDetails(doc.data());
            }
        };
        fetchPaymentDetails();
    }, []);

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
                onPreview={(invoice) => generateInvoicePreview(
                    invoice, 
                    assignments, 
                    companiesData, 
                    purchaseOrders,
                    paymentDetails
                )}
            />
        </div>
    );
};

export default InvoiceGenerator;
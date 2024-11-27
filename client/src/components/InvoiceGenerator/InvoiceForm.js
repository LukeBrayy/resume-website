
import React, { useState } from 'react';

export const InvoiceForm = ({ assignments, companiesData, purchaseOrders, onCreateInvoice }) => {
    const [selectedCompany, setSelectedCompany] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');

    const handleSubmit = () => {
        onCreateInvoice({
            invoiceNumber,
            company: selectedCompany,
            dateRange,
            purchaseOrderId: selectedPurchaseOrder
        });
        // Reset form
        setInvoiceNumber('');
        setDateRange({ start: '', end: '' });
        setSelectedPurchaseOrder('');
    };

    return (
        <div className="invoice-controls">
            <input 
                type="number"
                value={invoiceNumber}
                onChange={(e) => setInvoiceNumber(e.target.value)}
                placeholder="Invoice Number"
            />
            <select 
                value={selectedCompany}
                onChange={(e) => setSelectedCompany(e.target.value)}
            >
                <option value="">Select Company</option>
                {Object.keys(companiesData).map(company => (
                    <option key={company} value={company}>{company}</option>
                ))}
            </select>
            <input 
                type="date"
                value={dateRange.start}
                onChange={(e) => setDateRange({...dateRange, start: e.target.value})}
            />
            <input 
                type="date"
                value={dateRange.end}
                onChange={(e) => setDateRange({...dateRange, end: e.target.value})}
            />
            <select 
                value={selectedPurchaseOrder}
                onChange={(e) => setSelectedPurchaseOrder(e.target.value)}
            >
                <option value="">Select Purchase Order</option>
                {Object.values(purchaseOrders)
                    .filter(po => po.company === selectedCompany)
                    .map(po => (
                        <option key={po.id} value={po.id}>{po.id} - {po.totalAmount}</option>
                ))}
            </select>
            <button onClick={handleSubmit}>Create Invoice</button>
        </div>
    );
};
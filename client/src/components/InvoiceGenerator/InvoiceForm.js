import React, { useState } from 'react';

export const InvoiceForm = ({ assignments, companiesData, purchaseOrders, onCreateInvoice }) => {
    const [selectedCompany, setSelectedCompany] = useState('');
    const [dateRange, setDateRange] = useState({ start: '', end: '' });
    const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState('');
    const [invoiceNumber, setInvoiceNumber] = useState('');
    const [includeGST, setIncludeGST] = useState(false);

    const handleSubmit = () => {
        onCreateInvoice({
            selectedCompany,                 // this matches the validation check
            dateRange,
            selectedPurchaseOrder,          // this matches the validation check
            invoiceNumber,
            assignments,
            companiesData,
            includeGST,                     // Add GST option
            setInvoiceNumber,
            setDateRange,
            setSelectedPurchaseOrder,
            setIncludeGST,                  // Add setter for GST
            company: selectedCompany        // adding this for backward compatibility
        });
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
            <div className="gst-checkbox">
                <input 
                    type="checkbox" 
                    id="includeGST" 
                    checked={includeGST} 
                    onChange={(e) => setIncludeGST(e.target.checked)} 
                />
                <label htmlFor="includeGST">Include GST (10%)</label>
            </div>
            <button onClick={handleSubmit}>Create Invoice</button>
        </div>
    );
};
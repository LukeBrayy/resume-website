
import React from 'react';
import { generateInvoicePreview } from '../../utils/invoiceGenerator';

export const InvoiceList = ({ invoices, onDelete, onMarkSent, onMarkUnsent }) => {
    return (
        <div className="invoice-list">
            <h4>Invoices</h4>
            {Object.values(invoices)
                .sort((a, b) => b.id.localeCompare(a.id))
                .map(invoice => (
                    <div key={invoice.id} className="invoice-item">
                        <span>{invoice.id}</span>
                        <span>{invoice.company}</span>
                        <span>
                            {new Date(invoice.dateRange.start).toLocaleDateString()} - 
                            {new Date(invoice.dateRange.end).toLocaleDateString()}
                        </span>
                        <span>{invoice.status}</span>
                        <span>${invoice.amount}</span>
                        <button onClick={() => generateInvoicePreview(invoice)}>View</button>
                        {invoice.status === 'draft' ? (
                            <>
                                <button onClick={() => onMarkSent(invoice.id)}>Mark as Sent</button>
                                <button 
                                    onClick={() => onDelete(invoice.id)}
                                    className="delete-button"
                                >
                                    Delete
                                </button>
                            </>
                        ) : (
                            <button onClick={() => onMarkUnsent(invoice.id)}>Mark as Unsent</button>
                        )}
                    </div>
                ))}
        </div>
    );
};

import { useCallback } from 'react';

export const useInvoices = (invoices, saveInvoices) => {
    const handleCreateInvoice = useCallback((invoiceData) => {
        if (!invoiceData.selectedCompany || !invoiceData.dateRange.start || !invoiceData.dateRange.end || !invoiceData.selectedPurchaseOrder || !invoiceData.invoiceNumber) {
            console.log('Validation failed:', { // Debug log
                selectedCompany: invoiceData.selectedCompany,
                dateRange: invoiceData.dateRange,
                selectedPurchaseOrder: invoiceData.selectedPurchaseOrder,
                invoiceNumber: invoiceData.invoiceNumber
            });
            alert('Please fill in all required fields');
            return;
        }
        
        // Get the selected days within the date range
        const selectedDays = Object.entries(invoiceData.assignments)
            .filter(([date, company]) => 
                company === invoiceData.selectedCompany &&
                date >= invoiceData.dateRange.start &&
                date <= invoiceData.dateRange.end
            )
            .map(([date]) => date);

        if (selectedDays.length === 0) {
            alert('No work days found in the selected date range');
            return;
        }

        // Calculate amount based on actual days worked
        const amount = selectedDays.length * (invoiceData.companiesData[invoiceData.selectedCompany]?.rate || 0);

        const newInvoice = {
            id: `HBD-${invoiceData.invoiceNumber}`,
            company: invoiceData.selectedCompany,
            purchaseOrderId: invoiceData.selectedPurchaseOrder,
            dateRange: {
                start: invoiceData.dateRange.start,
                end: invoiceData.dateRange.end
            },
            status: 'draft',
            amount: amount,
            createdAt: new Date().toISOString(),
            days: selectedDays
        };
        
        console.log('Creating new invoice:', newInvoice); // Debug log
        
        saveInvoices({
            ...invoices,
            [newInvoice.id]: newInvoice
        });

        // Reset form
        invoiceData.setInvoiceNumber('');
        invoiceData.setDateRange({ start: '', end: '' });
        invoiceData.setSelectedPurchaseOrder('');
        
        // Confirmation
        alert('Invoice created successfully!');
    }, [invoices, saveInvoices]);

    const handleDeleteInvoice = useCallback((invoiceId) => {
        // First confirmation
        if (!window.confirm(`Are you sure you want to delete invoice ${invoiceId}?`)) {
            return;
        }
        // Second confirmation
        if (!window.confirm('This action cannot be undone. Really delete this invoice?')) {
            return;
        }

        const updatedInvoices = { ...invoices };
        delete updatedInvoices[invoiceId];
        saveInvoices(updatedInvoices);
    }, [invoices, saveInvoices]);

    const markAsSent = useCallback((invoiceId) => {
        const updatedInvoices = {
            ...invoices,
            [invoiceId]: {
                ...invoices[invoiceId],
                status: 'sent',
                sentDate: new Date().toISOString()
            }
        };
        saveInvoices(updatedInvoices);
    }, [invoices, saveInvoices]);

    const markAsUnsent = useCallback((invoiceId) => {
        const updatedInvoices = {
            ...invoices,
            [invoiceId]: {
                ...invoices[invoiceId],
                status: 'draft',
                sentDate: null
            }
        };
        saveInvoices(updatedInvoices);
    }, [invoices, saveInvoices]);

    return {
        handleCreateInvoice,
        handleDeleteInvoice,
        markAsSent,
        markAsUnsent
    };
};
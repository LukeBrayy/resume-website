import React, { useState, useEffect } from 'react';
import { getDocument } from '../services/firebase';
import './InvoiceGenerator.css';
import { COMPANY_LABELS } from '../constants/companies';

const InvoiceGenerator = ({ assignments, companiesData, purchaseOrders, invoices, saveInvoices }) => {
    const [selectedCompany, setSelectedCompany] = useState('');
    const [dateRange, setDateRange] = useState({
        start: '',
        end: ''
    });
    const [selectedPurchaseOrder, setSelectedPurchaseOrder] = useState('');
    const [paymentDetails, setPaymentDetails] = useState(null);
    const [invoiceNumber, setInvoiceNumber] = useState('');

    useEffect(() => {
        const fetchPaymentDetails = async () => {
            const docSnap = await getDocument('settings', 'paymentDetails');
            if (docSnap.exists()) {
                setPaymentDetails(docSnap.data());
            }
        };
        fetchPaymentDetails();
    }, []);

    const groupConsecutiveDays = (items) => {
        // Sort items by date first
        const sortedItems = [...items].sort((a, b) => new Date(a.date) - new Date(b.date));
        
        return sortedItems.reduce((groups, item) => {
            const itemDate = new Date(item.date);
            const lastGroup = groups[groups.length - 1];
            
            // Get the start and end of the week containing this date
            const weekStart = new Date(itemDate);
            weekStart.setDate(weekStart.getDate() - weekStart.getDay()); // Sunday
            const weekEnd = new Date(weekStart);
            weekEnd.setDate(weekEnd.getDate() + 6); // Saturday

            if (!lastGroup || 
                new Date(item.date) < weekStart || 
                new Date(item.date) > weekEnd) {
                // Start a new group for a new week
                groups.push({
                    startDate: item.date,
                    endDate: item.date,
                    days: 1,
                    rate: item.rate,
                    amount: item.amount
                });
            } else {
                // Add to existing week group
                lastGroup.endDate = item.date;
                lastGroup.days += 1;
                lastGroup.amount += item.amount;
            }
            return groups;
        }, []);
    };

    const calculateAmount = () => {
        const relevantDays = Object.entries(assignments)
            .filter(([date, company]) => 
                company === selectedCompany &&
                date >= dateRange.start &&
                date <= dateRange.end
            );
        console.log('Calculating amount for days:', relevantDays); // Debug log
        return relevantDays.reduce((total, [_date, company]) => {
            const rate = companiesData[company]?.rate || 0;
            return total + rate;
        }, 0);
    };

    const markAsSent = (invoiceId) => {
        const updatedInvoices = {
            ...invoices,
            [invoiceId]: {
                ...invoices[invoiceId],
                status: 'sent',
                sentDate: new Date().toISOString()
            }
        };
        saveInvoices(updatedInvoices);
    };

    const markAsUnsent = (invoiceId) => {
        const updatedInvoices = {
            ...invoices,
            [invoiceId]: {
                ...invoices[invoiceId],
                status: 'draft',
                sentDate: null
            }
        };
        saveInvoices(updatedInvoices);
    };

    const handleDeleteInvoice = (invoiceId) => {
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
    };

    const handleCreateInvoice = () => {
        if (!selectedCompany || !dateRange.start || !dateRange.end || !selectedPurchaseOrder || !invoiceNumber) {
            console.log('Validation failed:', { // Debug log
                selectedCompany,
                dateRange,
                selectedPurchaseOrder,
                invoiceNumber
            });
            alert('Please fill in all required fields');
            return;
        }
        
        // Get the selected days within the date range
        const selectedDays = Object.entries(assignments)
            .filter(([date, company]) => 
                company === selectedCompany &&
                date >= dateRange.start &&
                date <= dateRange.end
            )
            .map(([date]) => date);

        if (selectedDays.length === 0) {
            alert('No work days found in the selected date range');
            return;
        }

        // Calculate amount based on actual days worked
        const amount = selectedDays.length * (companiesData[selectedCompany]?.rate || 0);

        const newInvoice = {
            id: `HBD-${invoiceNumber}`,
            company: selectedCompany,
            purchaseOrderId: selectedPurchaseOrder,
            dateRange: {
                start: dateRange.start,
                end: dateRange.end
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
        setInvoiceNumber('');
        setDateRange({ start: '', end: '' });
        setSelectedPurchaseOrder('');
        
        // Confirmation
        alert('Invoice created successfully!');
    };

    const generateInvoice = (invoice) => {
        // Use the invoice data instead of the form data
        const filteredAssignments = Object.fromEntries(
            Object.entries(assignments).filter(([date]) => 
                invoice.days.includes(date)
            )
        );

        // Add console logging for dates
        console.log('Invoice dates:', {
            invoiceNumber: invoice.id,
            dates: invoice.days,
            dateRange: invoice.dateRange,
            numberOfDays: invoice.days.length
        });

        const purchaseOrder = purchaseOrders[invoice.purchaseOrderId];
        const invoiceData = {
            invoiceNumber: invoice.id,
            company: COMPANY_LABELS[invoice.company] || invoice.company,
            dateRange: invoice.dateRange,
            assignments: filteredAssignments,
            items: groupConsecutiveDays(
                invoice.days.map(date => ({
                    date,
                    description: `8 Hour Day`,
                    rate: companiesData[invoice.company].rate,
                    amount: companiesData[invoice.company].rate
                }))
            ),
            purchaseOrder,
            paymentDetails
        };

        const invoiceWindow = window.open('', '_blank');
        invoiceWindow.document.write(generateInvoiceHTML(invoiceData));
    };

    return (
        <div className="invoice-generator">
            <h3>Generate Invoice</h3>
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
                <button onClick={handleCreateInvoice}>Create Invoice</button>
            </div>
            <div className="invoice-list">
                <h4>Invoices</h4>
                {Object.values(invoices)
                    .sort((a, b) => b.id.localeCompare(a.id))  // Sort by invoice number, newest first
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
                            <button onClick={() => generateInvoice(invoice)}>View</button>
                            {invoice.status === 'draft' ? (
                                <>
                                    <button onClick={() => markAsSent(invoice.id)}>Mark as Sent</button>
                                    <button 
                                        onClick={() => handleDeleteInvoice(invoice.id)}
                                        className="delete-button"
                                    >
                                        Delete
                                    </button>
                                </>
                            ) : (
                                <button onClick={() => markAsUnsent(invoice.id)}>Mark as Unsent</button>
                            )}
                        </div>
                    ))}
            </div>
        </div>
    );
};

const generateCalendarHTML = (dates) => {
    // Convert string dates to Date objects and sort them
    const workDates = dates.map(d => new Date(d)).sort((a, b) => a - b);
    
    // Get the first and last month/year
    const startDate = workDates[0];
    const endDate = workDates[workDates.length - 1];
    
    let currentDate = new Date(startDate.getFullYear(), startDate.getMonth(), 1);
    const lastDate = new Date(endDate.getFullYear(), endDate.getMonth() + 1, 0);
    
    let calendarsHTML = '';
    
    while (currentDate <= lastDate) {
        const year = currentDate.getFullYear();
        const month = currentDate.getMonth();
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const firstDayOfMonth = new Date(year, month, 1).getDay();
        
        calendarsHTML += `
            <div class="calendar-month">
                <h4>${new Date(year, month).toLocaleString('default', { month: 'long', year: 'numeric' })}</h4>
                <table class="calendar">
                    <tr>
                        <th>Sun</th><th>Mon</th><th>Tue</th><th>Wed</th><th>Thu</th><th>Fri</th><th>Sat</th>
                    </tr>
        `;
        
        let dayCount = 1;
        let calendarHTML = '';
        
        for (let i = 0; i < 6; i++) {
            let weekHTML = '<tr>';
            for (let j = 0; j < 7; j++) {
                if ((i === 0 && j < firstDayOfMonth) || dayCount > daysInMonth) {
                    weekHTML += '<td></td>';
                } else {
                    const currentDay = new Date(year, month, dayCount);
                    const isWorkDay = workDates.some(d => 
                        d.getDate() === currentDay.getDate() &&
                        d.getMonth() === currentDay.getMonth() &&
                        d.getFullYear() === currentDay.getFullYear()
                    );
                    weekHTML += `
                        <td class="${isWorkDay ? 'worked-day' : ''}">${dayCount}</td>
                    `;
                    dayCount++;
                }
            }
            weekHTML += '</tr>';
            calendarHTML += weekHTML;
            if (dayCount > daysInMonth) break;
        }
        
        calendarsHTML += calendarHTML + '</table></div>';
        currentDate.setMonth(currentDate.getMonth() + 1);
    }
    
    return `
        <div class="calendars-container">
            ${calendarsHTML}
        </div>
    `;
};

const generateInvoiceHTML = (data) => {
    const total = data.items.reduce((sum, item) => sum + item.amount, 0);

    // Sort items by date before generating HTML
    const sortedItems = [...data.items].sort(
        (a, b) => new Date(a.startDate) - new Date(b.startDate)
    );
    data.items = sortedItems;
    console.log(data.items);
    const poDetails = data.purchaseOrder;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice ${data.invoiceNumber}</title>
            <link rel="stylesheet" type="text/css" href="/styles/invoice.css">
        </head>
        <body>
            <button class="no-print" onclick="window.print()">Download PDF</button>
            <div class="invoice-header">
                <div>
                    <h1>INVOICE</h1>
                    <p>Invoice Number: ${data.invoiceNumber}</p>
                    <p>Date: ${new Date().toLocaleDateString()}</p>
                </div>
                <div>
                    <h2>HBD WA PTY LTD</h2>
                    <p>21 Bracadale Avenue</p>
                    <p>Duncraig, Perth, WA 6023</p>
                    <p>ACN: 640 722 014</p>
                    <p>Mobile: +61 466285956</p>
                </div>
            </div>
            
            <div class="main-content">
                <div class="bill-to">
                    <h3>Bill To:</h3>
                    <p>${poDetails.fullCompanyName}</p>
                    <p>${poDetails.address}</p>
                    <p>Contact: ${poDetails.contactName}</p>
                    <p>Phone: ${poDetails.contactNumber}</p>
                </div>
                <div class="payment-details">
                    <h3>Payment Details:</h3>
                    <p>Bank: ${data.paymentDetails?.bank}</p>
                    <p>BSB: ${data.paymentDetails?.bsb}</p>
                    <p>Account: ${data.paymentDetails?.account}</p>
                </div>
            </div>

            <table>
                <thead>
                    <tr>
                        <th>Period</th>
                        <th>Description</th>
                        <th>Days</th>
                        <th>Rate</th>
                        <th>Amount</th>
                    </tr>
                </thead>
                <tbody>
                    ${data.items.map(item => `
                        <tr>
                            <td>${new Date(item.startDate).toLocaleDateString()} - ${new Date(item.endDate).toLocaleDateString()}</td>
                            <td>Consulting Services</td>
                            <td>${item.days}</td>
                            <td>$${item.rate}</td>
                            <td>$${item.amount}</td>
                        </tr>
                    `).join('')}
                </tbody>
                <tfoot>
                    <tr class="table-footer">
                        <td colspan="2">Total</td>
                        <td>${data.items.reduce((sum, item) => sum + item.days, 0)}</td>
                        <td></td>
                        <td>$${total}</td>
                    </tr>
                </tfoot>
            </table>
            
            <div class="work-calendar">
                <h3>Days Worked</h3>
                ${generateCalendarHTML(data.items.reduce((dates, item) => {
                    const start = new Date(item.startDate);
                    const end = new Date(item.endDate);
                    const days = [];
                    for (let d = new Date(start); d <= end; d.setDate(d.getDate() + 1)) {
                        days.push(new Date(d));
                    }
                    console.log(dates, days);
                    return [...dates, ...days];
                }, []))}
            </div>
        </body>
        </html>
    `;
};

export default InvoiceGenerator;

import { generateCalendarHTML } from './calendarGenerator';

// Add these helper functions at the top of the file
const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-AU');
};

export const generateInvoiceHTML = (data) => {
    const total = data.items.reduce((sum, item) => sum + item.amount, 0);
    const poDetails = data.purchaseOrder;

    return `
        <!DOCTYPE html>
        <html>
        <head>
            <title>Invoice ${data.invoiceNumber}</title>
            <link rel="stylesheet" type="text/css" href="/styles/invoice.css">
        </head>
        <body>
            <div class="invoice-print-container">
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
                        <tr>
                            <td>${formatDate(data.dateRange.start)} - ${formatDate(data.dateRange.end)}</td>
                            <td>Consulting Services</td>
                            <td>${data.items[0].days}</td>
                            <td>$${data.items[0].rate}</td>
                            <td>$${data.items[0].amount}</td>
                        </tr>
                    </tbody>
                    <tfoot>
                        <tr class="table-footer">
                            <td colspan="2">Total</td>
                            <td>${data.items[0].days}</td>
                            <td></td>
                            <td>$${total}</td>
                        </tr>
                    </tfoot>
                </table>
                
                <div class="work-calendar">
                    <h3>Days Worked</h3>
                    ${generateCalendarHTML(data.items[0].dates.map(date => new Date(date)))}
                </div>
            </div>
        </body>
        </html>
    `;
};

export const prepareInvoiceData = (invoice, assignments, companiesData, purchaseOrders, paymentDetails) => {
    // Sort days and adjust dates by +1
    const sortedDays = [...invoice.days]
        .sort((a, b) => new Date(a) - new Date(b))
        .map(day => {
            const date = new Date(day);
            date.setDate(date.getDate() + 1);
            return date.toISOString().split('T')[0];
        });
    
    const filteredAssignments = Object.fromEntries(
        Object.entries(assignments).filter(([date]) => 
            invoice.days.includes(date)
        )
    );

    const purchaseOrder = purchaseOrders[invoice.purchaseOrderId];
    const rate = companiesData[invoice.company].rate;
    
    return {
        invoiceNumber: invoice.id,
        company: invoice.company,
        dateRange: {
            start: sortedDays[0],
            end: sortedDays[sortedDays.length - 1]
        },
        assignments: filteredAssignments,
        items: [{
            days: invoice.days.length,
            rate: rate,
            amount: rate * invoice.days.length,
            dates: sortedDays
        }],
        purchaseOrder,
        paymentDetails
    };
};

export const generateInvoicePreview = (invoice, assignments, companiesData, purchaseOrders, paymentDetails) => {
    const invoiceData = prepareInvoiceData(invoice, assignments, companiesData, purchaseOrders, paymentDetails);
    const invoiceWindow = window.open('', '_blank');
    invoiceWindow.document.write(generateInvoiceHTML(invoiceData));
};
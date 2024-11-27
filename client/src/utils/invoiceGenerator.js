import { generateCalendarHTML } from './calendarGenerator';

export const generateInvoiceHTML = (data) => {
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
            </div>
        </body>
        </html>
    `;
};

export const generateInvoicePreview = (invoice, assignments, companiesData, purchaseOrders, paymentDetails) => {
    const filteredAssignments = Object.fromEntries(
        Object.entries(assignments).filter(([date]) => 
            invoice.days.includes(date)
        )
    );

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
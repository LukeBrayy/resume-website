import React, { useRef } from 'react';
import { format, isValid } from 'date-fns';
import './PayslipPrint.css';

const PayslipPrint = ({ payslipData, companiesData, onPrint }) => {
  const printRef = useRef();

  const handlePrint = () => {
    const content = printRef.current;
    const originalContents = document.body.innerHTML;
    
    document.body.innerHTML = content.innerHTML;
    window.print();
    document.body.innerHTML = originalContents;
    
    if (onPrint) onPrint();
  };

  if (!payslipData) return null;

  // Safely format a date with fallback
  const safeFormatDate = (dateValue) => {
    if (!dateValue) return 'N/A';
    
    const date = new Date(dateValue);
    return isValid(date) ? format(date, 'dd MMM yyyy') : 'Invalid date';
  };

  return (
    <div className="payslip-print-container">
      <div className="print-controls">
        <button onClick={handlePrint} className="print-button">Print Payslip</button>
      </div>
      
      <div className="payslip-printable" ref={printRef}>
        <div className="payslip-header-print">
          <h2>PAYSLIP</h2>
          <div className="payslip-status">
            {payslipData.isPaid ? 
              <span className="paid-status">PAID</span> : 
              <span className="unpaid-status">UNPAID</span>
            }
          </div>
        </div>
        
        <div className="payslip-info">
          <div className="period-info">
            <p><strong>Pay Period:</strong> {safeFormatDate(payslipData.periodStart)} - {safeFormatDate(payslipData.periodEnd)}</p>
            <p><strong>Payslip ID:</strong> {payslipData.id}</p>
            {payslipData.isPaid && payslipData.paidAt && (
              <p><strong>Payment Date:</strong> {safeFormatDate(payslipData.paidAt)}</p>
            )}
          </div>
        </div>
        
        <div className="payslip-details-print">
          <h3>Earnings</h3>
          <table className="earnings-table-print">
            <thead>
              <tr>
                <th>Company</th>
                <th>Days</th>
                <th>Daily Rate</th>
                <th>Amount</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(payslipData.earnings).map(([company, data]) => (
                data.days > 0 ? (
                  <tr key={company}>
                    <td>{company}</td>
                    <td>{data.days}</td>
                    <td>${companiesData[company].rate.toFixed(2)}</td>
                    <td>${data.amount.toFixed(2)}</td>
                  </tr>
                ) : null
              ))}
            </tbody>
          </table>
          
          <div className="payslip-summary-print">
            <div className="summary-row">
              <div className="summary-label">Gross Pay:</div>
              <div className="summary-value">${payslipData.totalGross.toFixed(2)}</div>
            </div>
            <div className="summary-row">
              <div className="summary-label">Tax ({payslipData.taxPercentage}%):</div>
              <div className="summary-value">-${payslipData.taxAmount.toFixed(2)}</div>
            </div>
            <div className="summary-row">
              <div className="summary-label">Superannuation ({payslipData.superPercentage}%):</div>
              <div className="summary-value">-${payslipData.superAmount.toFixed(2)}</div>
            </div>
            <div className="summary-row net-pay">
              <div className="summary-label">Net Pay:</div>
              <div className="summary-value">${payslipData.netPay.toFixed(2)}</div>
            </div>
          </div>
        </div>
        
        <div className="payslip-footer">
          <p>This is an automatically generated payslip.</p>
        </div>
      </div>
    </div>
  );
};

export default PayslipPrint;

import React, { useState, useEffect } from 'react';
import { format, startOfYear, addDays, eachDayOfInterval, isSameDay } from 'date-fns';
import './PayslipManager.css';
import PayslipPrint from './PayslipPrint';

const PayslipManager = ({ assignments, companiesData, payslips, savePayslips }) => {
    const [selectedPeriod, setSelectedPeriod] = useState(null);
    const [taxPercentage, setTaxPercentage] = useState(32.5); // Default tax rate
    const [superPercentage, setSuperPercentage] = useState(10.5); // Default super rate
    const [periods, setPeriods] = useState([]);
    const [activePayslip, setActivePayslip] = useState(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showPrintView, setShowPrintView] = useState(false);

    // Generate fortnightly periods for the current year
    useEffect(() => {
        const generatePeriods = () => {
            const startDate = startOfYear(new Date());
            const endDate = new Date(startDate.getFullYear(), 11, 31);
            
            let currentDate = startDate;
            const newPeriods = [];
            
            while (currentDate <= endDate) {
                const periodEnd = addDays(currentDate, 13); // 14-day period (0-13 days)
                newPeriods.push({
                    startDate: new Date(currentDate),
                    endDate: new Date(periodEnd),
                    label: `${format(currentDate, 'dd MMM')} - ${format(periodEnd, 'dd MMM yyyy')}`
                });
                currentDate = addDays(periodEnd, 1);
            }
            return newPeriods;
        };
        
        setPeriods(generatePeriods());
    }, []);

    // Calculate payslip data for the selected period
    const calculatePayslipData = (periodStart, periodEnd) => {
        const daysInPeriod = eachDayOfInterval({ start: periodStart, end: periodEnd });
        
        // Initialize earnings for each company
        const earnings = Object.keys(companiesData).reduce((acc, company) => {
            acc[company] = { days: 0, amount: 0 };
            return acc;
        }, {});
        
        // Count days for each company in the period
        daysInPeriod.forEach(day => {
            const dateStr = day.toISOString().split('T')[0];
            const company = assignments[dateStr];
            if (company && companiesData[company]) {
                earnings[company].days += 1;
                earnings[company].amount += companiesData[company].rate;
            }
        });
        
        // Calculate totals
        const totalGross = Object.values(earnings).reduce((sum, { amount }) => sum + amount, 0);
        const taxAmount = (totalGross * taxPercentage) / 100;
        const superAmount = (totalGross * superPercentage) / 100;
        const netPay = totalGross - taxAmount - superAmount; // Super is now deducted from net pay
        
        return {
            periodStart,
            periodEnd,
            earnings,
            totalGross,
            taxAmount,
            taxPercentage,
            superAmount,
            superPercentage,
            netPay,
        };
    };

    const handlePeriodChange = (e) => {
        const selectedIndex = e.target.value;
        if (selectedIndex !== "") {
            const period = periods[selectedIndex];
            setSelectedPeriod(period);
            
            // Check if we already have a payslip for this period
            const existingPayslip = payslips[period.label];
            
            if (existingPayslip) {
                setActivePayslip(existingPayslip);
                setTaxPercentage(existingPayslip.taxPercentage);
                setSuperPercentage(existingPayslip.superPercentage);
            } else {
                // Generate new payslip data
                const newPayslipData = calculatePayslipData(period.startDate, period.endDate);
                setActivePayslip({
                    ...newPayslipData,
                    id: `PS-${period.label}`,
                    isPaid: false,
                    createdAt: new Date().toISOString(),
                });
            }
            setShowDetails(true);
        } else {
            setSelectedPeriod(null);
            setActivePayslip(null);
            setShowDetails(false);
        }
    };

    const savePayslipData = () => {
        if (!selectedPeriod || !activePayslip) return;
        
        // Recalculate with current tax and super percentages
        const updatedPayslipData = calculatePayslipData(
            selectedPeriod.startDate, 
            selectedPeriod.endDate
        );
        
        const updatedPayslip = {
            ...activePayslip,
            ...updatedPayslipData,
            taxPercentage: taxPercentage,
            superPercentage: superPercentage,
            updatedAt: new Date().toISOString(),
        };
        
        // Update payslips
        const updatedPayslips = {
            ...payslips,
            [selectedPeriod.label]: updatedPayslip
        };
        
        savePayslips(updatedPayslips);
        setActivePayslip(updatedPayslip);
    };

    const togglePaidStatus = () => {
        if (!selectedPeriod || !activePayslip) return;
        
        const updatedPayslip = {
            ...activePayslip,
            isPaid: !activePayslip.isPaid,
            paidAt: !activePayslip.isPaid ? new Date().toISOString() : null,
            updatedAt: new Date().toISOString(),
        };
        
        const updatedPayslips = {
            ...payslips,
            [selectedPeriod.label]: updatedPayslip
        };
        
        savePayslips(updatedPayslips);
        setActivePayslip(updatedPayslip);
    };

    const togglePrintView = () => {
        setShowPrintView(!showPrintView);
    };

    return (
        <div className="payslip-manager">
            <h2>Fortnightly Payslip Manager</h2>
            
            <div className="payslip-controls">
                <div className="select-container">
                    <label>Select Pay Period:</label>
                    <select onChange={handlePeriodChange} value={selectedPeriod ? periods.findIndex(p => p.label === selectedPeriod.label) : ""}>
                        <option value="">-- Select a period --</option>
                        {periods.map((period, index) => (
                            <option key={index} value={index}>
                                {period.label} {payslips[period.label]?.isPaid ? '(Paid)' : ''}
                            </option>
                        ))}
                    </select>
                </div>
                
                <div className="rate-inputs">
                    <div className="input-field">
                        <label>Tax Rate (%):</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={taxPercentage}
                            onChange={(e) => setTaxPercentage(parseFloat(e.target.value))}
                        />
                    </div>
                    <div className="input-field">
                        <label>Superannuation (%):</label>
                        <input
                            type="number"
                            step="0.1"
                            min="0"
                            max="100"
                            value={superPercentage}
                            onChange={(e) => setSuperPercentage(parseFloat(e.target.value))}
                        />
                    </div>
                    <button onClick={savePayslipData} className="recalculate-btn">
                        Recalculate & Save
                    </button>
                </div>
            </div>
            
            {showDetails && activePayslip && (
                <div className="payslip-details">
                    <div className="payslip-header">
                        <h3>Payslip: {selectedPeriod.label}</h3>
                        <div className="status-badge" style={{ backgroundColor: activePayslip.isPaid ? '#4CAF50' : '#FF9800' }}>
                            {activePayslip.isPaid ? 'PAID' : 'UNPAID'}
                        </div>
                        <button 
                            className={`toggle-paid-btn ${activePayslip.isPaid ? 'unpaid-btn' : 'paid-btn'}`}
                            onClick={togglePaidStatus}
                        >
                            Mark as {activePayslip.isPaid ? 'Unpaid' : 'Paid'}
                        </button>
                        <button 
                            className="print-view-btn" 
                            onClick={togglePrintView}
                            style={{ marginLeft: '10px', backgroundColor: '#2196F3', color: 'white', padding: '8px 12px', border: 'none', borderRadius: '4px', cursor: 'pointer', fontWeight: 'bold' }}
                        >
                            {showPrintView ? 'Hide Print View' : 'Show Print View'}
                        </button>
                    </div>
                    
                    {!showPrintView ? (
                        <div className="payslip-summary">
                            <table className="earnings-table">
                                <thead>
                                    <tr>
                                        <th>Company</th>
                                        <th>Days</th>
                                        <th>Daily Rate</th>
                                        <th>Amount</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {Object.entries(activePayslip.earnings).map(([company, data]) => (
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
                                <tfoot>
                                    <tr>
                                        <td colSpan="3"><strong>Gross Pay</strong></td>
                                        <td><strong>${activePayslip.totalGross.toFixed(2)}</strong></td>
                                    </tr>
                                    <tr>
                                        <td colSpan="3">Tax ({activePayslip.taxPercentage}%)</td>
                                        <td>-${activePayslip.taxAmount.toFixed(2)}</td>
                                    </tr>
                                    <tr className="super-row">
                                        <td colSpan="3">Superannuation ({activePayslip.superPercentage}%)</td>
                                        <td>-${activePayslip.superAmount.toFixed(2)}</td>
                                    </tr>
                                    <tr className="net-pay-row">
                                        <td colSpan="3"><strong>Net Pay</strong></td>
                                        <td><strong>${activePayslip.netPay.toFixed(2)}</strong></td>
                                    </tr>
                                </tfoot>
                            </table>
                        </div>
                    ) : (
                        <PayslipPrint 
                            payslipData={activePayslip} 
                            companiesData={companiesData}
                            onPrint={() => setShowPrintView(false)}
                        />
                    )}
                </div>
            )}
            
            <div className="payslips-list">
                <h3>Recent Payslips</h3>
                <table className="payslips-table">
                    <thead>
                        <tr>
                            <th>Period</th>
                            <th>Gross Pay</th>
                            <th>Net Pay</th>
                            <th>Status</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(payslips)
                            .sort((a, b) => new Date(b[1].periodEnd) - new Date(a[1].periodEnd))
                            .slice(0, 5)
                            .map(([periodLabel, payslip]) => (
                                <tr key={periodLabel} onClick={() => {
                                    const periodIndex = periods.findIndex(p => p.label === periodLabel);
                                    if (periodIndex >= 0) {
                                        setSelectedPeriod(periods[periodIndex]);
                                        setActivePayslip(payslip);
                                        setTaxPercentage(payslip.taxPercentage);
                                        setSuperPercentage(payslip.superPercentage);
                                        setShowDetails(true);
                                        setShowPrintView(false);
                                    }
                                }}>
                                    <td>{periodLabel}</td>
                                    <td>${payslip.totalGross.toFixed(2)}</td>
                                    <td>${payslip.netPay.toFixed(2)}</td>
                                    <td>
                                        <span className="status-indicator" style={{ backgroundColor: payslip.isPaid ? '#4CAF50' : '#FF9800' }}>
                                            {payslip.isPaid ? 'PAID' : 'UNPAID'}
                                        </span>
                                    </td>
                                </tr>
                            ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};

export default PayslipManager;

import React, { useState, useMemo } from 'react';
import { Bar, Line } from 'react-chartjs-2';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
} from 'chart.js';
import './SummaryStats.css';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    BarElement,
    Title,
    Tooltip,
    Legend
);

const getMonthOptions = () => {
    const options = [];
    const today = new Date();
    const startDate = new Date(today.getFullYear() - 1, today.getMonth(), 1); // 1 year back

    for (let date = startDate; date <= today; date.setMonth(date.getMonth() + 1)) {
        const value = date.toISOString().slice(0, 7);
        const label = new Date(date).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'long'
        });
        options.unshift({ value, label }); // Add to start of array to show newest first
    }
    return options;
};

const getYearOptions = () => {
    const options = [];
    const today = new Date();
    const startYear = today.getFullYear() - 2; // 2 years back

    for (let year = startYear; year <= today.getFullYear(); year++) {
        options.unshift({ 
            value: year.toString(),
            label: year.toString()
        });
    }
    return options;
};

const getFYOptions = () => {
    const options = [];
    const today = new Date();
    const currentFY = today.getMonth() >= 6 ? today.getFullYear() + 1 : today.getFullYear();
    
    // Generate last 3 FYs including current
    for (let year = currentFY - 2; year <= currentFY; year++) {
        options.unshift({
            value: year,
            label: `FY${year-1}/${year}`
        });
    }
    return options;
};

const getWeekDates = (date) => {
    const day = date.getDay();
    const diff = date.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    const weekStart = new Date(date.setDate(diff));
    const weekEnd = new Date(date.setDate(diff + 6));
    return {
        start: weekStart,
        end: weekEnd,
        key: weekStart.toISOString().split('T')[0]
    };
};

const formatDateRange = (start, end) => {
    return `${start.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
    })} - ${end.toLocaleDateString('en-US', { 
        month: 'short', 
        day: 'numeric'
    })}`;
};

const SummaryStats = ({ assignments, companiesData }) => {
    const [isYearlyView, setIsYearlyView] = useState(false);
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
    const [taxPercentage, setTaxPercentage] = useState(32.5); // Default tax rate
    const [superPercentage, setSuperPercentage] = useState(11); // Default super rate
    const [selectedFY, setSelectedFY] = useState(() => {
        const today = new Date();
        return today.getMonth() >= 6 ? today.getFullYear() + 1 : today.getFullYear();
    });
    
    const monthOptions = useMemo(() => getMonthOptions(), []);
    const yearOptions = useMemo(() => getYearOptions(), []);

    const stats = useMemo(() => {
        if (isYearlyView) {
            // Calculate yearly stats
            const yearAssignments = Object.entries(assignments).filter(([date]) => 
                date.startsWith(selectedYear));

            const monthlyRevenue = {};
            const monthlyTotals = {};

            yearAssignments.forEach(([date, company]) => {
                const month = date.slice(0, 7);
                if (!monthlyTotals[month]) {
                    monthlyTotals[month] = {};
                }
                monthlyTotals[month][company] = (monthlyTotals[month][company] || 0) + 1;
                monthlyRevenue[month] = (monthlyRevenue[month] || 0) + companiesData[company].rate;
            });

            const companyTotals = yearAssignments.reduce((acc, [_, company]) => {
                acc[company] = (acc[company] || 0) + 1;
                return acc;
            }, {});

            const totalRevenue = yearAssignments.reduce((acc, [_, company]) => 
                acc + companiesData[company].rate, 0);

            return { monthlyTotals, monthlyRevenue, companyTotals, totalRevenue };
        }

        const monthStart = new Date(selectedMonth);
        const monthEnd = new Date(monthStart.getFullYear(), monthStart.getMonth() + 1, 0);
        
        // Filter assignments for selected month
        const monthAssignments = Object.entries(assignments).filter(([date]) => 
            date.startsWith(selectedMonth));

        // Weekly breakdown with actual dates
        const weeks = {};
        const weeklyRevenue = {};
        const weekLabels = {};

        monthAssignments.forEach(([date, company]) => {
            const currentDate = new Date(date);
            const { start, end, key } = getWeekDates(currentDate);
            
            if (!weeks[key]) {
                weeks[key] = {};
                weekLabels[key] = formatDateRange(start, end);
            }
            
            weeks[key][company] = (weeks[key][company] || 0) + 1;
            weeklyRevenue[key] = (weeklyRevenue[key] || 0) + companiesData[company].rate;
        });

        // Company totals
        const companyTotals = monthAssignments.reduce((acc, [_, company]) => {
            acc[company] = (acc[company] || 0) + 1;
            return acc;
        }, {});

        const totalRevenue = monthAssignments.reduce((acc, [_, company]) => 
            acc + companiesData[company].rate, 0);

        return { weeks, weeklyRevenue, companyTotals, totalRevenue, weekLabels };
    }, [assignments, companiesData, selectedMonth, selectedYear, isYearlyView]);

    const financialYearStats = useMemo(() => {
        const fyStart = `${selectedFY - 1}-07-01`;
        const fyEnd = `${selectedFY}-06-30`;

        const fyAssignments = Object.entries(assignments).filter(([date]) => 
            date >= fyStart && date <= fyEnd);

        const totalIncome = fyAssignments.reduce((acc, [_, company]) => 
            acc + companiesData[company].rate, 0);

        const taxPayable = (totalIncome * taxPercentage) / 100;
        const superAmount = (totalIncome * superPercentage) / 100;
        const netIncome = totalIncome - taxPayable - superAmount;

        return {
            year: `${selectedFY - 1}/${selectedFY}`,
            totalIncome,
            taxPayable,
            superAmount,
            netIncome
        };
    }, [assignments, companiesData, taxPercentage, superPercentage, selectedFY]);

    const lineChartData = {
        labels: Object.keys(stats.weeklyRevenue).map(key => stats.weekLabels[key]),
        datasets: [{
            label: 'Weekly Revenue',
            data: Object.values(stats.weeklyRevenue),
            borderColor: '#4ECDC4',
            tension: 0.1
        }]
    };

    const barChartData = {
        labels: Object.keys(companiesData),
        datasets: [{
            label: 'Days per Company',
            data: Object.keys(companiesData).map(company => 
                stats.companyTotals[company] || 0),
            backgroundColor: Object.values(companiesData).map(c => c.color)
        }]
    };

    const chartData = useMemo(() => {
        if (isYearlyView) {
            return {
                line: {
                    labels: Object.keys(stats.monthlyRevenue).map(month => 
                        new Date(month).toLocaleDateString('en-US', { month: 'short' })),
                    datasets: [{
                        label: 'Monthly Revenue',
                        data: Object.values(stats.monthlyRevenue),
                        borderColor: '#4ECDC4',
                        tension: 0.1
                    }]
                },
                bar: barChartData // existing bar chart data structure
            };
        }
        return {
            line: lineChartData, // existing line chart data structure
            bar: barChartData // existing bar chart data structure
        };
    }, [stats, isYearlyView]);

    return (
        <div className="summary-stats">
            <div className="stats-header">
                <h2>{isYearlyView ? 'Yearly' : 'Monthly'} Statistics</h2>
                <div className="controls">
                    <button 
                        className="view-toggle"
                        onClick={() => setIsYearlyView(!isYearlyView)}
                    >
                        Switch to {isYearlyView ? 'Monthly' : 'Yearly'} View
                    </button>
                    <select
                        className="date-selector"
                        value={isYearlyView ? selectedYear : selectedMonth}
                        onChange={(e) => isYearlyView ? 
                            setSelectedYear(e.target.value) : 
                            setSelectedMonth(e.target.value)}
                    >
                        {(isYearlyView ? yearOptions : monthOptions).map(option => (
                            <option key={option.value} value={option.value}>
                                {option.label}
                            </option>
                        ))}
                    </select>
                </div>
            </div>

            <div className="stats-grid">
                <div className="stat-box">
                    <h3>{isYearlyView ? 'Yearly' : 'Monthly'} Revenue</h3>
                    <p>${stats.totalRevenue}</p>
                </div>
                <div className="stat-box">
                    <h3>Average {isYearlyView ? 'Monthly' : 'Weekly'} Revenue</h3>
                    <p>${Math.round(stats.totalRevenue / 
                        (isYearlyView ? 
                            Object.keys(stats.monthlyRevenue).length : 
                            Object.keys(stats.weeks).length)
                    )}</p>
                </div>
            </div>

            <div className="charts-container">
                <div className="revenue-breakdown">
                    <h3>{isYearlyView ? 'Monthly' : 'Weekly'} Revenue Breakdown</h3>
                    <div className="chart-container">
                        <Line data={chartData.line} options={{ responsive: true }} />
                    </div>
                </div>

                <div className="company-breakdown">
                    <h3>Company Distribution</h3>
                    <div className="chart-container">
                        <Bar data={chartData.bar} options={{ responsive: true }} />
                    </div>
                </div>
            </div>

            <div className="tax-calculator">
                <div>
                    <div className="calculator-header">
                        <h3>Financial Year Tax Calculator</h3>
                        <select
                            className="fy-selector"
                            value={selectedFY}
                            onChange={(e) => setSelectedFY(Number(e.target.value))}
                        >
                            {getFYOptions().map(option => (
                                <option key={option.value} value={option.value}>
                                    {option.label}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="calculator-inputs">
                        <div className="input-group">
                            <label>Tax Rate (%)</label>
                            <input 
                                type="number" 
                                value={taxPercentage}
                                onChange={(e) => setTaxPercentage(Number(e.target.value))}
                                step="0.1"
                                min="0"
                                max="100"
                            />
                        </div>
                        <div className="input-group">
                            <label>Super Rate (%)</label>
                            <input 
                                type="number" 
                                value={superPercentage}
                                onChange={(e) => setSuperPercentage(Number(e.target.value))}
                                step="0.1"
                                min="0"
                                max="100"
                            />
                        </div>
                    </div>
                </div>
                <div className="calculator-results">
                    <div className="result-item">
                        <span>Total Income:</span>
                        <span>${financialYearStats.totalIncome.toFixed(2)}</span>
                    </div>
                    <div className="result-item">
                        <span>Tax Payable:</span>
                        <span>${financialYearStats.taxPayable.toFixed(2)}</span>
                    </div>
                    <div className="result-item">
                        <span>Superannuation:</span>
                        <span>${financialYearStats.superAmount.toFixed(2)}</span>
                    </div>
                    <div className="result-item">
                        <span>Net Income:</span>
                        <span>${financialYearStats.netIncome.toFixed(2)}</span>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SummaryStats;
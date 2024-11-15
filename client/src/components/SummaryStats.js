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
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7));
    const monthOptions = useMemo(() => getMonthOptions(), []);

    const stats = useMemo(() => {
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
    }, [assignments, companiesData, selectedMonth]);

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

    return (
        <div className="summary-stats">
            <div className="stats-header">
                <h2>Monthly Statistics</h2>
                <select
                    className="month-selector"
                    value={selectedMonth}
                    onChange={(e) => setSelectedMonth(e.target.value)}
                >
                    {monthOptions.map(option => (
                        <option key={option.value} value={option.value}>
                            {option.label}
                        </option>
                    ))}
                </select>
            </div>

            <div className="stats-grid">
                <div className="stat-box">
                    <h3>Monthly Revenue</h3>
                    <p>${stats.totalRevenue}</p>
                </div>
                <div className="stat-box">
                    <h3>Average Weekly Revenue</h3>
                    <p>${Math.round(stats.totalRevenue / Object.keys(stats.weeks).length)}</p>
                </div>
            </div>

            <div className="weekly-breakdown">
                <h3>Weekly Breakdown</h3>
                <div className="chart-container">
                    <Line data={lineChartData} options={{ responsive: true }} />
                </div>
                <table className="weekly-table">
                    <thead>
                        <tr>
                            <th>Week</th>
                            {Object.keys(companiesData).map(company => (
                                <th key={company}>{company}</th>
                            ))}
                            <th>Revenue</th>
                        </tr>
                    </thead>
                    <tbody>
                        {Object.entries(stats.weeks).map(([weekKey, companies]) => (
                            <tr key={weekKey}>
                                <td>{stats.weekLabels[weekKey]}</td>
                                {Object.keys(companiesData).map(company => (
                                    <td key={company}>{companies[company] || 0}</td>
                                ))}
                                <td>${stats.weeklyRevenue[weekKey]}</td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            <div className="company-breakdown">
                <h3>Company Distribution</h3>
                <div className="chart-container">
                    <Bar data={barChartData} options={{ responsive: true }} />
                </div>
            </div>
        </div>
    );
};

export default SummaryStats;
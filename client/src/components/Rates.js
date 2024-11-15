import React, { useState, useMemo, useEffect } from 'react';
import Calendar from 'react-calendar';
import { Bar } from 'react-chartjs-2';
import 'react-calendar/dist/Calendar.css';
import './Rates.css';
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
} from 'chart.js';
import PasswordPrompt from './PasswordPrompt';
import { getFirestore, doc, getDoc, setDoc } from 'firebase/firestore';
import SummaryStats from './SummaryStats';

ChartJS.register(
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend
);

const initialCompaniesData = {
  'GIS Team': { color: '#FF6B6B', rate: 80*8 },
  'Exploration': { color: '#4ECDC4', rate: 80*8 },
  'GSWA': { color: '#45B7D1', rate: 140*8 },
  'Sick': { color: '#ff0000', rate: 0 },
  'Other': { color: '#ff0000', rate: 0 }
};

function Rates() {
    const [selectedDate, setSelectedDate] = useState(null);
    const [assignments, setAssignments] = useState({});
    const [companiesData, setCompaniesData] = useState(initialCompaniesData);
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const db = getFirestore();

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated]);

    const loadData = async () => {
        try {
            const [calendarDoc, companiesDoc] = await Promise.all([
                getDoc(doc(db, 'calendar', 'assignments')),
                getDoc(doc(db, 'calendar', 'companies'))
            ]);

            if (calendarDoc.exists()) {
                setAssignments(calendarDoc.data().assignments || {});
            }
            
            if (companiesDoc.exists()) {
                setCompaniesData(companiesDoc.data().companies || initialCompaniesData);
            } else {
                // If no companies data exists yet, save the initial data
                await setDoc(doc(db, 'calendar', 'companies'), {
                    companies: initialCompaniesData,
                    lastUpdated: new Date().toISOString()
                });
            }
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    const saveData = async () => {
        console.log('saving data');
        console.log(assignments);
        
        if (!isAuthenticated) return;

        try {
            await setDoc(doc(db, 'calendar', 'assignments'), {
                assignments,
                lastUpdated: new Date().toISOString()
            });
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const saveCompaniesData = async (newCompaniesData) => {
        if (!isAuthenticated) return;

        try {
            await setDoc(doc(db, 'calendar', 'companies'), {
                companies: newCompaniesData,
                lastUpdated: new Date().toISOString()
            });
            setCompaniesData(newCompaniesData);
        } catch (error) {
            console.error("Error saving companies data:", error);
        }
    };

    useEffect(() => {
        if (isAuthenticated) {
            saveData();
        }
    }, [assignments]);

    const getNextCompany = (currentCompany) => {
        const companies = Object.keys(companiesData);
        if (!currentCompany) return companies[0];
        const currentIndex = companies.indexOf(currentCompany);
        return companies[(currentIndex + 1) % companies.length];
    };

    const handleDoubleClick = (date) => {
        if (!isAuthenticated) return;
        const dateStr = date.toISOString().split('T')[0];
        const currentCompany = assignments[dateStr];
        const nextCompany = getNextCompany(currentCompany);
        setAssignments({
            ...assignments,
            [dateStr]: nextCompany
        });
    };

    const handleDateClick = (date) => {
        setSelectedDate(date);
    };

    const assignCompany = (company) => {
        if (!isAuthenticated) return;
        if (selectedDate) {
            const dateStr = selectedDate.toISOString().split('T')[0];
            setAssignments({
                ...assignments,
                [dateStr]: company
            });
        }
    };

    const stats = useMemo(() => {
        const counts = Object.values(assignments).reduce((acc, company) => {
            acc[company] = (acc[company] || 0) + 1;
            return acc;
        }, {});

        const revenue = Object.entries(counts).reduce((acc, [company, days]) => {
            return acc + (days * companiesData[company].rate);
        }, 0);

        return { counts, revenue };
    }, [assignments]);

    const chartData = {
        labels: Object.keys(companiesData),
        datasets: [{
            label: 'Days Assigned',
            data: Object.keys(companiesData).map(company => stats.counts[company] || 0),
            backgroundColor: Object.values(companiesData).map(c => c.color)
        }]
    };

    const tileContent = ({ date }) => {
        const dateStr = date.toISOString().split('T')[0];
        const company = assignments[dateStr];
        if (!company) return null;
        
        return (
            <div className="tile-content" style={{ backgroundColor: companiesData[company].color }}>
                {company}
            </div>
        );
    };

    if (!isAuthenticated) {
        return (
            <div className="rates-container">
                <h1 className="dashboard-title">HBD Billing Dashboard</h1>
                <PasswordPrompt 
                    onClose={() => setShowPasswordPrompt(false)}
                    onAuthenticated={() => setIsAuthenticated(true)}
                />
            </div>
        );
    }

    return (
        <div className="rates-container">
            <h1 className="dashboard-title">HBD Billing Dashboard</h1>
            <div className="calendar-section">
                <Calendar
                    onChange={handleDateClick}
                    value={selectedDate}
                    tileContent={tileContent}
                    onClickDay={(date, event) => {
                        if (event.detail === 2) {  // double click
                            handleDoubleClick(date);
                        }
                    }}
                />
                
                <div className="legend">
                    {Object.entries(companiesData).map(([company, data]) => (
                        <div key={company} className="legend-item">
                            <div className="color-box" style={{ backgroundColor: data.color }}></div>
                            <span>{company} (${data.rate}/day)</span>
                        </div>
                    ))}
                </div>
            </div>

            {selectedDate && (
                <div className="company-buttons">
                    {Object.entries(companiesData).map(([company, data]) => (
                        <button 
                            key={company} 
                            onClick={() => assignCompany(company)}
                            style={{ backgroundColor: data.color }}
                        >
                            {company}
                        </button>
                    ))}
                </div>
            )}

            <SummaryStats 
                assignments={assignments}
                companiesData={companiesData}
            />
        </div>
    );
}

export default Rates;
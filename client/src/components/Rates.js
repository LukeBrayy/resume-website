import React, { useState, useMemo, useEffect } from 'react';
import Calendar from 'react-calendar';
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
import { getDocument, saveDocument } from '../services/firebase';
import SummaryStats from './SummaryStats';
import InvoiceGenerator from './InvoiceGenerator';
import PurchaseOrderManager from './PurchaseOrderManager';

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
    const [purchaseOrders, setPurchaseOrders] = useState({});
    const [invoices, setInvoices] = useState({});

    useEffect(() => {
        if (isAuthenticated) {
            loadData();
        }
    }, [isAuthenticated]);

    const loadData = async () => {
        try {
            const [calendarDoc, companiesDoc, purchaseOrdersDoc, invoicesDoc] = await Promise.all([
                getDocument('calendar', 'assignments'),
                getDocument('calendar', 'companies'),
                getDocument('calendar', 'purchaseOrders'),
                getDocument('calendar', 'invoices')
            ]);

            if (calendarDoc.exists()) {
                setAssignments(calendarDoc.data().assignments || {});
            }
            
            if (companiesDoc.exists()) {
                setCompaniesData(companiesDoc.data().companies || initialCompaniesData);
            } else {
                await saveDocument('calendar', 'companies', { companies: initialCompaniesData });
            }

            if (purchaseOrdersDoc.exists()) {
                setPurchaseOrders(purchaseOrdersDoc.data().purchaseOrders || {});
            } else {
                await saveDocument('calendar', 'purchaseOrders', { purchaseOrders: {} });
            }

            if (invoicesDoc.exists()) {
                setInvoices(invoicesDoc.data().invoices || {});
            } else {
                await saveDocument('calendar', 'invoices', { invoices: {} });
            }
        } catch (error) {
            console.error("Error loading data:", error);
        }
    };

    const saveData = async () => {
        if (!isAuthenticated) return;
        try {
            await saveDocument('calendar', 'assignments', { assignments });
        } catch (error) {
            console.error("Error saving data:", error);
        }
    };

    const saveCompaniesData = async (newCompaniesData) => {
        if (!isAuthenticated) return;
        try {
            await saveDocument('calendar', 'companies', { companies: newCompaniesData });
            setCompaniesData(newCompaniesData);
        } catch (error) {
            console.error("Error saving companies data:", error);
        }
    };

    const savePurchaseOrders = async (newPurchaseOrders) => {
        if (!isAuthenticated) return;
        try {
            await saveDocument('calendar', 'purchaseOrders', { purchaseOrders: newPurchaseOrders });
            setPurchaseOrders(newPurchaseOrders);
        } catch (error) {
            console.error("Error saving purchase orders:", error);
        }
    };

    const saveInvoices = async (newInvoices) => {
        if (!isAuthenticated) return;
        try {
            await saveDocument('calendar', 'invoices', { invoices: newInvoices });
            setInvoices(newInvoices);
        } catch (error) {
            console.error("Error saving invoices:", error);
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

        // Find if this date is in any invoice
        const invoice = Object.values(invoices).find(inv => 
            inv.days.includes(dateStr)
        );
        
        return (
            <div className="tile-content" style={{ backgroundColor: companiesData[company].color }}>
                {company}
                {invoice && (
                    <div className="invoice-badge" style={{ color: invoice.status === 'sent' ? '#4CAF50' : '#FFC107' }}>
                        {invoice.id} ({invoice.status})
                    </div>
                )}
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

            <InvoiceGenerator 
                assignments={assignments}
                companiesData={companiesData}
                purchaseOrders={purchaseOrders}
                invoices={invoices}
                saveInvoices={saveInvoices}
            />

            <PurchaseOrderManager
                purchaseOrders={purchaseOrders}
                savePurchaseOrders={savePurchaseOrders}
                companiesData={companiesData}
                invoices={invoices}
            />
        </div>
    );
}

export default Rates;
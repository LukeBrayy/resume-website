import React, { useState } from 'react';
import './PurchaseOrderManager.css';

function PurchaseOrderManager({ purchaseOrders, savePurchaseOrders, companiesData, invoices }) {
    const [poDetails, setPoDetails] = useState({
        id: '',
        totalAmount: '',
        amountRemaining: '',
        company: '',
        fullCompanyName: '',
        contactName: '',
        contactNumber: '',
        address: '',
        phoneNumber: ''
    });
    const [editing, setEditing] = useState(false);

    const handleInputChange = (e) => {
        setPoDetails({ ...poDetails, [e.target.name]: e.target.value });
    };

    const handleSave = () => {
        const newPurchaseOrders = { ...purchaseOrders };
        if (!poDetails.id) {
            alert('Please enter a Purchase Order number');
            return;
        }
        newPurchaseOrders[poDetails.id] = { ...poDetails };
        savePurchaseOrders(newPurchaseOrders);
        setPoDetails({
            id: '',
            totalAmount: '',
            amountRemaining: '',
            company: '',
            fullCompanyName: '',
            contactName: '',
            contactNumber: '',
            address: '',
            phoneNumber: ''
        });
        setEditing(false);
    };

    const handleEdit = (poId) => {
        setPoDetails(purchaseOrders[poId]);
        setEditing(true);
    };

    const handleDeletePO = (poId) => {
        // Check if PO has any invoices
        const hasInvoices = Object.values(invoices).some(inv => inv.purchaseOrderId === poId);
        if (hasInvoices) {
            alert('Cannot delete purchase order with associated invoices');
            return;
        }

        // First confirmation
        if (!window.confirm(`Are you sure you want to delete purchase order ${poId}?`)) {
            return;
        }
        // Second confirmation
        if (!window.confirm('This action cannot be undone. Really delete this purchase order?')) {
            return;
        }

        const updatedPurchaseOrders = { ...purchaseOrders };
        delete updatedPurchaseOrders[poId];
        savePurchaseOrders(updatedPurchaseOrders);
    };

    const calculatePOUtilization = (poId, totalAmount) => {
        const relatedInvoices = Object.values(invoices).filter(inv => inv.purchaseOrderId === poId);
        
        const sent = relatedInvoices
            .filter(inv => inv.status === 'sent')
            .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);
            
        const draft = relatedInvoices
            .filter(inv => inv.status === 'draft')
            .reduce((sum, inv) => sum + parseFloat(inv.amount || 0), 0);

        const remaining = Math.max(0, totalAmount - sent - draft);

        return { sent, draft, remaining };
    };

    const renderProgressBar = (poId, totalAmount) => {
        const { sent, draft, remaining } = calculatePOUtilization(poId, totalAmount);
        
        const sentPercentage = (sent / totalAmount) * 100;
        const draftPercentage = (draft / totalAmount) * 100;
        const remainingPercentage = (remaining / totalAmount) * 100;

        return (
            <div className="po-progress">
                <div className="progress-bar">
                    <div className="progress-sent" style={{ width: `${sentPercentage}%` }} />
                    <div className="progress-draft" style={{ width: `${draftPercentage}%` }} />
                    <div className="progress-remaining" style={{ width: `${remainingPercentage}%` }} />
                </div>
                <div className="progress-details">
                    <span className="progress-amount sent">Invoiced: ${sent.toFixed(2)}</span>
                    <span className="progress-amount draft">Draft: ${draft.toFixed(2)}</span>
                    <span className="progress-amount remaining">Remaining: ${remaining.toFixed(2)}</span>
                </div>
            </div>
        );
    };

    const renderInvoicesList = (poId) => {
        const relatedInvoices = Object.values(invoices).filter(inv => inv.purchaseOrder === poId);
        
        return relatedInvoices.length > 0 ? (
            <details className="invoice-details">
                <summary>Related Invoices ({relatedInvoices.length})</summary>
                <ul className="invoice-list">
                    {relatedInvoices.map(inv => (
                        <li key={inv.id} className={`invoice-item ${inv.status}`}>
                            #{inv.id} - ${inv.amount.toFixed(2)} ({inv.status})
                        </li>
                    ))}
                </ul>
            </details>
        ) : (
            <p className="no-invoices">No invoices created yet</p>
        );
    };

    return (
        <div className="purchase-order-manager">
            <h2>Purchase Order Management</h2>
            <div className="po-container">
                <div className="po-control-panel">
                    <h3>Control Panel</h3>
                    <button 
                        className="add-po-button" 
                        onClick={() => {
                            setPoDetails({
                                id: '',
                                totalAmount: '',
                                amountRemaining: '',
                                company: '',
                                fullCompanyName: '',
                                contactName: '',
                                contactNumber: '',
                                address: '',
                                phoneNumber: ''
                            });
                            setEditing(true);
                        }}
                    >
                        Add Purchase Order
                    </button>
                    
                    <div className="po-list-control">
                        <h4>Existing Purchase Orders</h4>
                        {Object.entries(purchaseOrders).map(([id, po]) => (
                            <div key={id} className="po-list-item">
                                <div className="po-list-details">
                                    <strong>{po.company}</strong>
                                    <span>${parseFloat(po.totalAmount).toLocaleString()}</span>
                                </div>
                                <div className="po-list-actions">
                                    <button 
                                        className="edit-po-button"
                                        onClick={() => handleEdit(id)}
                                    >
                                        Edit
                                    </button>
                                    <button 
                                        className="delete-po-button"
                                        onClick={() => handleDeletePO(id)}
                                    >
                                        Delete
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    {editing && (
                        <div className="po-form">
                            <input
                                name="id"
                                value={poDetails.id}
                                onChange={handleInputChange}
                                placeholder="Purchase Order Number"
                            />
                            <input
                                type="number"
                                name="totalAmount"
                                value={poDetails.totalAmount}
                                onChange={handleInputChange}
                                placeholder="Total Amount"
                            />
                            <select
                                name="company"
                                value={poDetails.company}
                                onChange={handleInputChange}
                            >
                                <option value="">Select Company</option>
                                {Object.keys(companiesData).map(company => (
                                    <option key={company} value={company}>{company}</option>
                                ))}
                            </select>
                            <input
                                name="fullCompanyName"
                                value={poDetails.fullCompanyName}
                                onChange={handleInputChange}
                                placeholder="Full Company Name"
                            />
                            <input
                                name="contactName"
                                value={poDetails.contactName}
                                onChange={handleInputChange}
                                placeholder="Contact Name"
                            />
                            <input
                                name="contactNumber"
                                value={poDetails.contactNumber}
                                onChange={handleInputChange}
                                placeholder="Contact Number"
                            />
                            <input
                                name="address"
                                value={poDetails.address}
                                onChange={handleInputChange}
                                placeholder="Address"
                            />
                            <input
                                name="phoneNumber"
                                value={poDetails.phoneNumber}
                                onChange={handleInputChange}
                                placeholder="Phone Number"
                            />
                            <div className="form-actions">
                                <button onClick={handleSave}>Save</button>
                                <button onClick={() => setEditing(false)}>Cancel</button>
                            </div>
                        </div>
                    )}
                </div>

                <div className="po-summary">
                    <h3>Purchase Orders Summary</h3>
                    <div className="po-list">
                        {Object.entries(purchaseOrders).map(([id, po]) => {
                            const totalAmount = parseFloat(po.totalAmount || 0);
                            const { sent, draft, remaining } = calculatePOUtilization(id, totalAmount);
                            
                            return (
                                <div key={id} className="po-item">
                                    <div className="po-header">
                                        <h4>PO #{id}</h4>
                                        <div className="po-header-details">
                                            <span className="po-company">{po.company}</span>
                                            <span className="po-total">Total: ${totalAmount.toLocaleString()}</span>
                                        </div>
                                    </div>
                                    
                                    <div className="po-progress">
                                        <div className="progress-bar">
                                            <div className="progress-sent" 
                                                style={{ width: `${(sent / totalAmount) * 100}%` }} 
                                                title={`Invoiced: $${sent.toLocaleString()}`}
                                            />
                                            <div className="progress-draft" 
                                                style={{ width: `${(draft / totalAmount) * 100}%` }}
                                                title={`Draft: $${draft.toLocaleString()}`}
                                            />
                                        </div>
                                        <div className="progress-details">
                                            <span className="progress-amount sent">
                                                Invoiced: ${sent.toLocaleString()}
                                            </span>
                                            <span className="progress-amount draft">
                                                Draft: ${draft.toLocaleString()}
                                            </span>
                                            <span className="progress-amount remaining">
                                                Available: ${remaining.toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                    {renderInvoicesList(id)}
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        </div>
    );
}

export default PurchaseOrderManager;
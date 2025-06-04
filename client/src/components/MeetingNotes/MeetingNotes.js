import React, { useState, useEffect } from 'react';
import { collection, addDoc } from 'firebase/firestore';
import { db } from '../../services/firebase';
import PasswordPrompt from '../PasswordPrompt';
import MeetingHistory from './MeetingHistory';
import './MeetingNotes.css';

const MeetingNotes = () => {
    const [selectedTemplate, setSelectedTemplate] = useState('');
    const [meetingData, setMeetingData] = useState({});
    const [activeTab, setActiveTab] = useState('new');
    const [isLoading, setIsLoading] = useState(false);
    const [showPasswordPrompt, setShowPasswordPrompt] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);

    const templates = {
        BacklogRefinementMeeting: {
            title: 'Backlog Refinement Meeting',
            checkboxes: [
                // template: { text:'Ideation Board Reviewed', url:'https://google.com' }
                { text:'Product Overview Reviewed, any updates?', url:'https://mineralresources.sharepoint.com/:x:/r/sites/GIS-Team/Shared%20Documents/02%20Projects%20and%20Products%20Management/ProductOverview.xlsx?d=we59499c472494d92be151d0e6c188e50&csf=1&web=1&e=du6hZM' },
                { text:'Ideation Board Reviewed, any User Stories to create for next sprint?', url:'https://miro.com/app/board/uXjVIy1qHOg=/?share_link_id=6224884884com' },
                { text:'Feedback Form Review', url:'https://mineralresources.sharepoint.com/:x:/r/sites/GIS-Team/Shared%20Documents/Spatial%20Services%20MinRes%20Mapper%20Feedback.xlsx?d=w5c2ed4a98f394c3f96fdb17461aa24b7&csf=1&web=1&e=nRLveb'},
                { text:'Backlog List, anything need to be staged for Monday?', url:'https://dev.azure.com/MineralResourcesProjects/GIS%20Projects/_backlogs/backlog/MinRes%20Spatial%20Products/Stories?showParents=false' },
                { text:'Next Sprint Overview, anything we can remove?', url:'https://dev.azure.com/MineralResourcesProjects/GIS%20Projects/_sprints/backlog/MinRes%20Spatial%20Products/GIS%20Projects/Spatial%20Services/Sprint%2014' },
                { text:'Current Sprint Reference if needed', url:'https://dev.azure.com/MineralResourcesProjects/GIS%20Projects/_sprints/backlog/MinRes%20Spatial%20Products/GIS%20Projects/Spatial%20Services/Sprint%2013' }
            ],
            textFields: [
                'Sprint Names',
                'Sprint Goal',
                'Stories to Create',
                'Action Items',
                'Blockers/Issues',
                'Next Steps'
            ]
        },
        RetrospectiveMeeting: {
            title: 'Sprint Retrospective',
            checkboxes: [
                { text:'What went well discussed'},
                { text:'What could improve identified'},
                { text:'Action items defined'},
                { text:'Team agreements updated'},
                { text:'Next sprint planning completed'}
            ],
            textFields: [
                'Sprint Name',
                'What Went Well',
                'What Could Improve',
                'Action Items',
                'Team Agreements',
                'Retrospective Notes'
            ]
        },
        PlanningMeeting: {
            title: 'Retrospective and Sprint Planning',
            checkboxes: [
                { text:'Pleasantries exchanged'},
                { text:'Devops Retrospective'},
                { text:'Actions added to spreadsheet'},
                { text:'Previous sprint recap- points, rollovers'},
                { text:'User story estimation'},
                { text:'Total point review'},
                { text:'Remove items if needed'},
                { text:'Team commitment obtained'}
            ],
            textFields: [
                'Sprint Names',
                'Sprint Goal',
                'Key Risks',
                'Stories to Create'
            ]
        },
        BlankMeeting: {
            title: 'Standard Meeting Template',
            checkboxes: [
                { text:'Pleasantries exchanged'},
                { text:'Goal discussed' },
                { text:'Actions Assigned'}
            ],
            textFields: [
                'Topic',
                'Attendees',
                'Actions',
                'Important Notes'
            ]
        }
    };

    useEffect(() => {
        // Add classes to force scrolling
        document.body.classList.add('meeting-notes-active');
        document.documentElement.classList.add('meeting-notes-active');
        const rootElement = document.getElementById('root');
        if (rootElement) {
            rootElement.classList.add('meeting-notes-active');
        }

        // Cleanup function
        return () => {
            document.body.classList.remove('meeting-notes-active');
            document.documentElement.classList.remove('meeting-notes-active');
            if (rootElement) {
                rootElement.classList.remove('meeting-notes-active');
            }
        };
    }, []);

    const handleTemplateSelect = (templateKey) => {
        if (!isAuthenticated) return;
        setSelectedTemplate(templateKey);
        const template = templates[templateKey];
        const initialData = {
            templateKey,
            title: template.title,
            checkboxes: template.checkboxes.reduce((acc, item) => {
                // Handle both string and object formats
                const key = typeof item === 'string' ? item : item.text;
                acc[key] = false;
                return acc;
            }, {}),
            textFields: template.textFields.reduce((acc, field) => {
                acc[field] = '';
                return acc;
            }, {}),
            date: new Date().toISOString().split('T')[0]
        };
        setMeetingData(initialData);
    };

    const handleCheckboxChange = (checkbox, checked) => {
        setMeetingData(prev => ({
            ...prev,
            checkboxes: {
                ...prev.checkboxes,
                [checkbox]: checked
            }
        }));
    };

    const handleTextFieldChange = (field, value) => {
        setMeetingData(prev => ({
            ...prev,
            textFields: {
                ...prev.textFields,
                [field]: value
            }
        }));
    };

    const handleDateChange = (date) => {
        setMeetingData(prev => ({
            ...prev,
            date
        }));
    };

    const saveMeeting = async () => {
        if (!isAuthenticated) return;

        if (!selectedTemplate || !meetingData.date) {
            alert('Please select a template and date');
            return;
        }

        setIsLoading(true);
        try {
            await addDoc(collection(db, 'meetingNotes'), {
                ...meetingData,
                createdAt: new Date(),
                timestamp: Date.now()
            });
            alert('Meeting notes saved successfully!');
            resetForm();
        } catch (error) {
            console.error('Error saving meeting notes:', error);
            alert('Error saving meeting notes');
        } finally {
            setIsLoading(false);
        }
    };

    const resetForm = () => {
        setSelectedTemplate('');
        setMeetingData({});
    };

    const handleLogout = () => {
        setIsAuthenticated(false);
        setSelectedTemplate('');
        setMeetingData({});
        setActiveTab('new');
        setShowPasswordPrompt(true);
    };

    // Helper function to get checkbox item text
    const getCheckboxText = (item) => {
        return typeof item === 'string' ? item : item.text;
    };

    // Helper function to get checkbox item URL
    const getCheckboxUrl = (item) => {
        return typeof item === 'object' && item.url ? item.url : null;
    };

    if (!isAuthenticated) {
        return (
            <div className="meeting-notes-container">
                <div className="auth-header">
                    <h1>Meeting Notes</h1>
                    <p>Please authenticate to access meeting notes</p>
                </div>
                {showPasswordPrompt && (
                    <PasswordPrompt
                        onClose={() => setShowPasswordPrompt(false)}
                        onAuthenticated={() => setIsAuthenticated(true)}
                    />
                )}
            </div>
        );
    }

    return (
        <div className="meeting-notes-container">
            <header className="meeting-notes-header">
                <div className="header-content">
                    <h1>Meeting Notes</h1>
                    <div className="auth-status">
                        <span className="auth-indicator">✓ Authenticated</span>
                        <button className="logout-button" onClick={handleLogout}>
                            Logout
                        </button>
                    </div>
                </div>
                <nav className="tab-navigation">
                    <button
                        className={`tab-button ${activeTab === 'new' ? 'active' : ''}`}
                        onClick={() => setActiveTab('new')}
                    >
                        New Meeting
                    </button>
                    <button
                        className={`tab-button ${activeTab === 'history' ? 'active' : ''}`}
                        onClick={() => setActiveTab('history')}
                    >
                        Meeting History
                    </button>
                </nav>
            </header>

            {activeTab === 'new' && (
                <div className="new-meeting-section">
                    {!selectedTemplate ? (
                        <div className="template-selection">
                            <h2>Select Meeting Template</h2>
                            <div className="template-grid">
                                {Object.entries(templates).map(([key, template]) => (
                                    <div
                                        key={key}
                                        className="template-card"
                                        onClick={() => handleTemplateSelect(key)}
                                    >
                                        <h3>{template.title}</h3>
                                        <p>{template.checkboxes.length} checklist items</p>
                                        <p>{template.textFields.length} note sections</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ) : (
                        <div className="meeting-template">
                            <div className="template-header">
                                <button className="back-button" onClick={resetForm}>
                                    ← Back to Templates
                                </button>
                                <h2>{templates[selectedTemplate].title}</h2>
                                <div className="date-input-container">
                                    <label htmlFor="meeting-date">Meeting Date:</label>
                                    <input
                                        id="meeting-date"
                                        type="date"
                                        value={meetingData.date || ''}
                                        onChange={(e) => handleDateChange(e.target.value)}
                                        className="date-input"
                                    />
                                </div>
                            </div>

                            <div className="template-content">
                                <div className="checklist-section">
                                    <h3>Checklist</h3>
                                    <div className="checkbox-grid">
                                        {templates[selectedTemplate].checkboxes.map((item, index) => {
                                            const itemText = getCheckboxText(item);
                                            const itemUrl = getCheckboxUrl(item);
                                            
                                            return (
                                                <label key={index} className="checkbox-item">
                                                    <input
                                                        type="checkbox"
                                                        checked={meetingData.checkboxes?.[itemText] || false}
                                                        onChange={(e) => handleCheckboxChange(itemText, e.target.checked)}
                                                    />
                                                    <div className="checkbox-content">
                                                        <span className="checkbox-label">{itemText}</span>
                                                        {itemUrl && (
                                                            <a 
                                                                href={itemUrl} 
                                                                target="_blank" 
                                                                rel="noopener noreferrer"
                                                                className="checkbox-link"
                                                                onClick={(e) => e.stopPropagation()}
                                                            >
                                                                View Link
                                                            </a>
                                                        )}
                                                    </div>
                                                </label>
                                            );
                                        })}
                                    </div>
                                </div>

                                <div className="notes-section">
                                    <h3>Notes</h3>
                                    <div className="text-fields">
                                        {templates[selectedTemplate].textFields.map((field, index) => (
                                            <div key={index} className="text-field-container">
                                                <label htmlFor={`field-${index}`} className="field-label">
                                                    {field}:
                                                </label>
                                                <textarea
                                                    id={`field-${index}`}
                                                    value={meetingData.textFields?.[field] || ''}
                                                    onChange={(e) => handleTextFieldChange(field, e.target.value)}
                                                    className="text-field"
                                                    rows="4"
                                                    placeholder={`Enter ${field.toLowerCase()}...`}
                                                />
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            <div className="template-actions">
                                <button
                                    className="save-button"
                                    onClick={saveMeeting}
                                    disabled={isLoading}
                                >
                                    {isLoading ? 'Saving...' : 'Save Meeting Notes'}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {activeTab === 'history' && (
                <MeetingHistory isAuthenticated={isAuthenticated} />
            )}
        </div>
    );
};

export default MeetingNotes;
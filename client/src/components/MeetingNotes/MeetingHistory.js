import React, { useState, useEffect } from 'react';
import { collection, getDocs, query, orderBy } from 'firebase/firestore';
import { db } from '../../services/firebase';

const MeetingHistory = ({ isAuthenticated }) => {
    const [meetingHistory, setMeetingHistory] = useState([]);
    const [selectedMeeting, setSelectedMeeting] = useState(null);

    useEffect(() => {
        if (isAuthenticated) {
            loadMeetingHistory();
        }
    }, [isAuthenticated]);

    const loadMeetingHistory = async () => {
        if (!isAuthenticated) return;

        try {
            const q = query(collection(db, 'meetingNotes'), orderBy('createdAt', 'desc'));
            const querySnapshot = await getDocs(q);
            const meetings = querySnapshot.docs.map(doc => ({
                id: doc.id,
                ...doc.data()
            }));
            setMeetingHistory(meetings);
        } catch (error) {
            console.error('Error loading meeting history:', error);
        }
    };

    const formatDate = (dateString) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const getCompletionRate = (meeting) => {
        const checkboxes = Object.values(meeting.checkboxes || {});
        const completed = checkboxes.filter(Boolean).length;
        return checkboxes.length > 0 ? Math.round((completed / checkboxes.length) * 100) : 0;
    };

    return (
        <div className="meeting-history">
            <h2>Meeting History</h2>

            {meetingHistory.length === 0 ? (
                <div className="empty-state">
                    <p>No meeting notes saved yet.</p>
                </div>
            ) : (
                <div className="history-content">
                    <div className="meetings-list">
                        {meetingHistory.map((meeting) => (
                            <div
                                key={meeting.id}
                                className={`meeting-card ${selectedMeeting?.id === meeting.id ? 'selected' : ''}`}
                                onClick={() => setSelectedMeeting(meeting)}
                            >
                                <div className="meeting-card-header">
                                    <h3>{meeting.title}</h3>
                                    <span className="meeting-date">{formatDate(meeting.date)}</span>
                                </div>
                                <div className="meeting-card-info">
                                    <div className="completion-rate">
                                        Completion: {getCompletionRate(meeting)}%
                                    </div>
                                    <div className="meeting-meta">
                                        {Object.keys(meeting.textFields || {}).length} notes sections
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {selectedMeeting && (
                        <div className="meeting-details">
                            <div className="meeting-details-header">
                                <h3>{selectedMeeting.title}</h3>
                                <span className="meeting-date">{formatDate(selectedMeeting.date)}</span>
                            </div>

                            <div className="meeting-details-content">
                                <div className="checklist-review">
                                    <h4>Checklist Items</h4>
                                    {Object.entries(selectedMeeting.checkboxes || {}).map(([item, checked]) => (
                                        <div key={item} className="checkbox-review-item">
                                            <span className={`checkbox-status ${checked ? 'completed' : 'incomplete'}`}>
                                                {checked ? '✓' : '○'}
                                            </span>
                                            <span className="checkbox-text">{item}</span>
                                        </div>
                                    ))}
                                </div>

                                <div className="notes-review">
                                    <h4>Notes</h4>
                                    {Object.entries(selectedMeeting.textFields || {}).map(([field, value]) => (
                                        value && (
                                            <div key={field} className="note-review-item">
                                                <h5>{field}:</h5>
                                                <p>{value}</p>
                                            </div>
                                        )
                                    ))}
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default MeetingHistory;
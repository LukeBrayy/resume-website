import React, { useState, useEffect } from 'react';
import { getDocument, saveDocument } from '../services/firebase';

const Notes = () => {
    const [notes, setNotes] = useState('');
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState(null);

    useEffect(() => {
        loadNotes();
    }, []);

    const loadNotes = async () => {
        try {
            const doc = await getDocument('calendar', 'notes');
            if (doc.exists()) {
                setNotes(doc.data().content || '');
                setLastSaved(doc.data().lastUpdated);
            }
        } catch (error) {
            console.error("Error loading notes:", error);
        }
    };

    const saveNotes = async (content) => {
        setIsSaving(true);
        try {
            await saveDocument('calendar', 'notes', { content });
            setLastSaved(new Date().toLocaleString());
        } catch (error) {
            console.error("Error saving notes:", error);
        } finally {
            setIsSaving(false);
        }
    };

    const handleChange = (e) => {
        setNotes(e.target.value);
        // Debounce save after 1 second of no typing
        const timeoutId = setTimeout(() => saveNotes(e.target.value), 1000);
        return () => clearTimeout(timeoutId);
    };

    return (
        <div className="notes-container bg-gray-100 p-4 rounded-lg shadow-md border border-gray-200">
            <div className="flex justify-between items-center mb-2">
                <h3 className="text-lg font-semibold text-gray-800">Notes</h3>
                <div className="text-sm text-gray-600">
                    {isSaving ? 'Saving...' : lastSaved ? `Last saved: ${lastSaved}` : ''}
                </div>
            </div>
            <textarea
                value={notes}
                onChange={handleChange}
                className="w-full h-32 p-2 bg-gray-50 text-gray-800 rounded border border-gray-300 focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                placeholder="Add your notes here..."
            />
        </div>
    );
};

export default Notes;

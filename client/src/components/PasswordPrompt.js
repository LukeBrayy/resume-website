import React, { useState, useEffect } from 'react';
import { loginWithEmail, isAuthenticated } from '../services/firebase';
import './PasswordPrompt.css';

const PasswordPrompt = ({ onClose, onAuthenticated }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        const checkAuth = async () => {
            if (await isAuthenticated()) {
                onAuthenticated();
                onClose();
            }
        };
        checkAuth();
    }, [onAuthenticated, onClose]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        setError('');
        
        try {
            await loginWithEmail(password);
            onAuthenticated();
            onClose();
        } catch (err) {
            console.error('Auth error:', err);
            setError('Invalid password');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="password-prompt-overlay">
            <div className="password-prompt-content">
                <button className="close-button" onClick={onClose}>&times;</button>
                <h2>Enter Password</h2>
                
                <form onSubmit={handleSubmit}>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        placeholder="Enter password"
                        disabled={isLoading}
                    />
                    <button type="submit" disabled={isLoading}>
                        {isLoading ? 'Checking...' : 'Submit'}
                    </button>
                </form>

                {isLoading && <div className="loading-message">Checking credentials...</div>}
                {error && <div className="error-message">{error}</div>}
            </div>
        </div>
    );
};

export default PasswordPrompt;
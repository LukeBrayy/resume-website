import React, { useState } from 'react';
import { initializeApp } from 'firebase/app';
import { getAuth, signInWithEmailAndPassword } from 'firebase/auth';
import { getFirestore, doc, getDoc } from 'firebase/firestore';
import './PasswordPrompt.css';

// Your web app's Firebase configuration

const firebaseConfig = {

    apiKey: "AIzaSyBWv8rLcaC3-LCy_SPyBmG_h2U2vJryWhA",
  
    authDomain: "noderesume.firebaseapp.com",
  
    projectId: "noderesume",
  
    storageBucket: "noderesume.firebasestorage.app",
  
    messagingSenderId: "500260169914",
  
    appId: "1:500260169914:web:abe4d574a037aa66b3ba83"
  
  };
  

// Initialize Firebase
const app = initializeApp(firebaseConfig);

const PasswordPrompt = ({ onClose, onAuthenticated }) => {
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [data, setData] = useState(null);
    const [isLoading, setIsLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setIsLoading(true);
        const auth = getAuth();
        
        try {
            // Sign in with fixed email and provided password
            await signInWithEmailAndPassword(auth, 'mooksnook@gmail.com', password);
            onAuthenticated();
            onClose();
        } catch (err) {
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
                {data && (
                    <div className="data-display">
                        <pre>{JSON.stringify(data, null, 2)}</pre>
                    </div>
                )}
            </div>
        </div>
    );
};

export default PasswordPrompt;
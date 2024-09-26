import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import ModernResume from './components/ModernResume';
import ChatbotInterface from './components/ChatbotInterface';
import Chat2 from './components/Chat2';
import SecretSanta from './components/SecretSanta';

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<ModernResume />} />
        <Route path="SecretSanta" element={<SecretSanta />} />
        <Route path="/Chatbot" element={<ChatbotInterface />} />
        <Route path="/Chat2" element={<Chat2 />} />
      </Routes>
    </Router>
  );
};

export default App;
import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Send, Lock, Copy, Volume2, ChevronDown, ChevronUp, Moon, Sun } from 'lucide-react';

const presets = [
  { id: 'default', name: 'Message', prompt: 'You are a helpful assistant for a dyslexic user. Fix the input message and reply with only the corrected version. Dont correct: horse' },
  { id: 'creative', name: 'Creative Advert', prompt: 'You are a helpful assistant for a dyslexic user trying to create online adverts. The user will provide you with a draft or outline and you must turn it into an online advert listing using the provided details. You can be liberal with creativity but do not invent details. Only reply with the fixed response, and nothing else. Dont correct: horse' },
  { id: 'minimal', name: 'Minimal Change Advert', prompt: 'You are a helpful assistant for a dsylexic user. Read the input and apply any grammar, spelling or punctuation fixes with minimal content changes. Only reply with the fixed response, and nothing else. Horse=horse. Dont correct: horse' },
  { id: 'noprompt', name: 'No Prompt', prompt: 'You are a helpful assistant.' },
];

const ChatbotInterface = () => {
  const [password, setPassword] = useState('');
  const [chatApiKey, setChatApiKey] = useState('');
  const [googleApiKey, setGoogleApiKey] = useState('');
  const [error, setError] = useState('');
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState('');
  const [selectedPreset, setSelectedPreset] = useState(presets[0]);
  const [showSpeechSettings, setShowSpeechSettings] = useState(false);
  const [speechRate, setSpeechRate] = useState(1);
  const [speechPitch, setSpeechPitch] = useState(1);
  const [selectedVoice, setSelectedVoice] = useState(null);
  const [availableVoices, setAvailableVoices] = useState([]);
  const [darkMode, setDarkMode] = useState(false);

  useEffect(() => {
    const loadVoices = () => {
      const voices = window.speechSynthesis.getVoices();
      setAvailableVoices(voices);
      setSelectedVoice(voices[0]);
    };

    window.speechSynthesis.onvoiceschanged = loadVoices;
    loadVoices();
  }, []);

  useEffect(() => {
    document.body.classList.toggle('dark', darkMode);
  }, [darkMode]);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.post('http://localhost:5000/get-api-key', { password });
      if (response.data.chatApiKey) {
        setChatApiKey(response.data.chatApiKey);
        setGoogleApiKey(response.data.googleApiKey);
        setError('');
      } else {
        setError(response.data.error || 'Invalid password');
      }
    } catch (err) {
      if (err.response) {
        switch (err.response.status) {
          case 400:
            setError('Password is required.');
            break;
          case 429:
            setError('Too many failed attempts. Fuck off bots.');
            break;
          case 500:
            setError('Failed to read config file. Suck harder?');
            break;
          case 403:
            setError('Forbidden. Wrong password champ?');
            break;
          default:
            setError('Something fucked.');
        }
      } else {
        setError('An error occurred. Please try again.');
      }
    }
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim()) return;

    const newMessage = { role: 'user', content: input };
    setMessages([...messages, newMessage]);
    setInput('');

    try {
      const response = await axios.post('https://api.openai.com/v1/chat/completions', {
        model: 'gpt-4o',
        messages: [
          { role: 'system', content: selectedPreset.prompt },
          ...messages,
          newMessage,
        ],
      }, {
        headers: {
          'Authorization': `Bearer ${chatApiKey}`,
          'Content-Type': 'application/json',
        },
      });

      const assistantMessage = response.data.choices[0].message;
      setMessages(prevMessages => [...prevMessages, assistantMessage]);
    } catch (err) {
      setError('Failed to get response from OpenAI. Please try again.');
    }
  };

  const handleCopy = (content) => {
    navigator.clipboard.writeText(content).then(() => {
      alert('Copied to clipboard!');
    }).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  const handleTextToSpeech = (content) => {
    const speech = new SpeechSynthesisUtterance(content);
    speech.rate = speechRate;
    speech.pitch = speechPitch;
    speech.voice = selectedVoice;
    window.speechSynthesis.speak(speech);
  };

  const handleClearMessages = () => {
    setMessages([]);
  };

  const handlePresetChange = (preset) => {
    setSelectedPreset(preset);
    setMessages([]);
  };

  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };

  if (!chatApiKey) {
    return (
      <div className={`flex items-center justify-center min-h-screen ${darkMode ? 'bg-gray-900' : 'bg-gray-100'}`}>
        <div className={`w-full max-w-md p-8 ${darkMode ? 'bg-gray-800' : 'bg-white'} rounded-lg shadow-md`}>
          <h2 className={`mb-6 text-2xl font-bold text-center ${darkMode ? 'text-white' : 'text-gray-800'}`}>Enter Password</h2>
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="relative">
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className={`w-full px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
                }`}
                placeholder="Password"
                required
              />
              <Lock className="absolute top-2.5 right-3 text-gray-400" size={20} />
            </div>
            <button type="submit" className="w-full px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2">
              Submit
            </button>
          </form>
          {error && <p className="mt-4 text-sm text-center text-red-500">{error}</p>}
        </div>
      </div>
    );
  }

  return (
    <div className={`flex flex-col h-screen ${darkMode ? 'bg-gray-900 text-white' : 'bg-gray-100 text-gray-800'}`}>
      <div className={`flex-none p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'} shadow-md`}>
        <h2 className="mb-2 text-xl font-bold">Text Cleaner GPT</h2>
        <div className="flex space-x-2 items-center">
          <select
            value={selectedPreset.id}
            onChange={(e) => handlePresetChange(presets.find(preset => preset.id === e.target.value))}
            className={`px-4 py-2 rounded-md ${
              darkMode ? 'bg-gray-700 text-white' : 'bg-gray-200 text-gray-800'
            }`}
          >
            {presets.map((preset) => (
              <option key={preset.id} value={preset.id}>
                {preset.name}
              </option>
            ))}
          </select>
          <button
            onClick={handleClearMessages}
            className="px-4 py-2 rounded-md bg-red-500 text-white"
          >
            Clear
          </button>
          <button
            onClick={toggleDarkMode}
            className={`p-2 rounded-md ${
              darkMode ? 'bg-yellow-400 text-gray-900' : 'bg-gray-700 text-white'
            }`}
          >
            {darkMode ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        {showSpeechSettings && (
          <div className={`mt-2 p-4 ${darkMode ? 'bg-gray-700' : 'bg-gray-100'} rounded-md`}>
            {/* ... (keep the speech settings content as it is) */}
          </div>
        )}
      </div>
      <div className="flex-grow overflow-y-auto p-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`p-3 rounded-lg ${
              message.role === 'user'
                ? darkMode ? 'bg-blue-900 ml-auto' : 'bg-blue-100 ml-auto'
                : darkMode ? 'bg-gray-700' : 'bg-gray-200'
            } max-w-[80%]`}
          >
            <div className="mb-2">{message.content}</div>
            {message.role === 'assistant' && (
              <div className="flex space-x-2 mt-2">
                <button
                  onClick={() => handleCopy(message.content)}
                  className="p-1 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={() => handleTextToSpeech(message.content)}
                  className="p-1 bg-green-500 text-white rounded-md hover:bg-green-600"
                >
                  <Volume2 size={16} />
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
      <form onSubmit={handleSendMessage} className={`flex-none p-4 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>
        <div className="flex space-x-2">
          <textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className={`flex-grow px-4 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 ${
              darkMode ? 'bg-gray-700 text-white border-gray-600' : 'bg-white text-gray-800 border-gray-300'
            }`}
            placeholder="Type your message..."
            rows="2"
          />
          <button
            type="submit"
            className="px-4 py-2 text-white bg-blue-500 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
          >
            <Send size={20} />
          </button>
        </div>
      </form>
      {error && <p className={`p-2 text-sm text-center text-red-500 ${darkMode ? 'bg-gray-800' : 'bg-white'}`}>{error}</p>}
    </div>
  );
};

export default ChatbotInterface;

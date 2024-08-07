const express = require('express');
const fs = require('fs');
const path = require('path');
const cors = require('cors');
const app = express();
const port = 5000;

app.use(express.json()); // To parse JSON bodies

const failedAttempts = {}; // In-memory store for failed attempts

// Enable CORS for all routes
app.use(cors({
  origin: 'http://localhost:3000' // Allow only your React client's origin
}));

// Serve static files from the React app
const buildPath = path.join(__dirname, 'build');
app.use(express.static(buildPath));

// Endpoint to get the API key
app.post('/get-api-key', (req, res) => {
  const { password } = req.body;
  const ip = req.ip;

  if (!password) {
    return res.status(400).json({ error: 'Password is required' });
  }

  // Initialize failed attempts for the IP if not present
  if (!failedAttempts[ip]) {
    failedAttempts[ip] = { count: 0, timeout: null };
  }

  // Check if the IP is currently locked out
  if (failedAttempts[ip].count >= 3) {
    return res.status(429).json({ error: 'Too many failed attempts. Try again later.' });
  }

  // Path to the secrets.json file
  const configPath = path.join(__dirname, 'secrets.json');

  // Read the config.json file
  fs.readFile(configPath, 'utf8', (err, data) => {
    if (err) {
      console.error('Error reading file:', err);  // Log the error
      return res.status(500).json({ error: 'Failed to read config file' });
    }

    const config = JSON.parse(data);

    // Check if the provided password matches
    if (password === config.password) {
      // Reset failed attempts on success
      failedAttempts[ip].count = 0;
      clearTimeout(failedAttempts[ip].timeout);
      return res.json({ chatApiKey: config.chatApiKey, googleApiKey: config.googleApiKey });
    } else {
      // Increment failed attempts on failure
      failedAttempts[ip].count += 1;

      // Set a timeout to reset the failed attempts counter after 5 minutes
      if (failedAttempts[ip].count >= 3) {
        failedAttempts[ip].timeout = setTimeout(() => {
          failedAttempts[ip].count = 0;
        }, 5 * 60 * 1000); // 5 minutes
      }

      return res.status(403).json({ error: 'Invalid password' });
    }
  });
});

// Serve the React app for any unknown routes
app.get('*', (req, res) => {
  res.sendFile(path.join(buildPath, 'index.html'));
});

app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}/`);
});

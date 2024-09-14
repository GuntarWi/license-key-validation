const express = require('express');
const sqlite3 = require('sqlite3').verbose();
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

// Use bodyParser middleware to parse JSON bodies
app.use(bodyParser.json());

// Initialize SQLite database
const db = new sqlite3.Database('licenseKeys.db');

// Create the table if it doesn't exist
db.serialize(() => {
  db.run(`CREATE TABLE IF NOT EXISTS keys (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    license_key TEXT UNIQUE NOT NULL,
    is_valid INTEGER DEFAULT 1
  )`);
});

// API endpoint to validate a license key
app.post('/validate', (req, res) => {
  const { licenseKey } = req.body;

  if (!licenseKey) {
    return res.status(400).json({ error: 'License key is required' });
  }

  // Query the database to check if the license key is valid
  db.get('SELECT * FROM keys WHERE license_key = ? AND is_valid = 1', [licenseKey], (err, row) => {
    if (err) {
      console.error('Error querying database:', err);
      return res.status(500).json({ error: 'Internal server error' });
    }

    if (row) {
      // If the license key is valid, invalidate it for future use
      db.run('UPDATE keys SET is_valid = 0 WHERE id = ?', [row.id], (err) => {
        if (err) {
          console.error('Error updating license key status:', err);
          return res.status(500).json({ error: 'Internal server error' });
        }

        return res.json({ valid: true });
      });
    } else {
      return res.json({ valid: false });
    }
  });
});

// Start the server
app.listen(port, () => {
  console.log(`License validation service running on http://localhost:${port}`);
});

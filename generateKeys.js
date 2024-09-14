const sqlite3 = require('sqlite3').verbose();
const crypto = require('crypto');

// Generate random license key
function generateLicenseKey() {
  return crypto.randomBytes(16).toString('hex');
}

// Connect to SQLite database
const db = new sqlite3.Database('licenseKeys.db');

// Function to insert license keys
function insertKeys(numKeys) {
  db.serialize(() => {
    // Create the table if it doesn't exist
    db.run(`CREATE TABLE IF NOT EXISTS keys (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      license_key TEXT UNIQUE NOT NULL,
      is_valid INTEGER DEFAULT 1
    )`, (err) => {
      if (err) {
        console.error('Error creating table:', err);
        return;
      }

      const stmt = db.prepare("INSERT INTO keys (license_key) VALUES (?)");

      for (let i = 0; i < numKeys; i++) {
        const key = generateLicenseKey();
        stmt.run(key);
      }

      stmt.finalize();
      console.log(`${numKeys} license keys have been inserted into the database.`);
    });
  });
}

// Generate and insert 50,000 keys
insertKeys(50000);

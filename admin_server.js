require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 4000;
const ADMIN_HASH = process.env.ADMIN_HASH;
const USERNAMES_FILE = process.env.USERNAMES_FILE || './usernames.json';

app.use(bodyParser.urlencoded({ extended: true }));
app.set('view engine', 'ejs');

// Middleware to protect admin route using the hash as path
app.use(`/${ADMIN_HASH}`, (req, res, next) => {
  next();
});

// Route: Admin dashboard, view and edit balances
app.get(`/${ADMIN_HASH}`, (req, res) => {
  let usernames = {};
  try {
    usernames = JSON.parse(fs.readFileSync(USERNAMES_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading usernames.json:', err);
  }

  res.render('admin', { usernames, adminPath: `/${ADMIN_HASH}` });
});

// Route: Handle balance update form submission
app.post(`/${ADMIN_HASH}/update`, (req, res) => {
  const { username, balance } = req.body;

  if (!username || !balance) {
    return res.status(400).send('Missing username or balance');
  }

  let usernames = {};
  try {
    usernames = JSON.parse(fs.readFileSync(USERNAMES_FILE, 'utf8'));
  } catch (err) {
    console.error('Error reading usernames.json:', err);
  }

  // Update balance, parse balance to number
  usernames[username] = Number(balance);

  // Save back to file
  try {
    fs.writeFileSync(USERNAMES_FILE, JSON.stringify(usernames, null, 2));
  } catch (err) {
    console.error('Error writing usernames.json:', err);
    return res.status(500).send('Error saving data');
  }

  res.redirect(`/${ADMIN_HASH}`);
});

// 404 for any other route
app.use((req, res) => {
  res.status(404).send('Not found');
});

app.listen(PORT, () => {
  console.log(`Admin portal running at http://localhost:${PORT}/${ADMIN_HASH}`);
});

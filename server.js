const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();

const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());

app.use(express.static(path.join(__dirname, 'public')));

const DATA_FILE = './users.json';

function readUsers() {
  if (!fs.existsSync(DATA_FILE)) {
    fs.writeFileSync(DATA_FILE, JSON.stringify({}), 'utf-8');
  }
  const data = fs.readFileSync(DATA_FILE, 'utf-8');
  return JSON.parse(data || '{}');
}

function writeUsers(users) {
  fs.writeFileSync(DATA_FILE, JSON.stringify(users, null, 2), 'utf-8');
}

app.post('/check-phone', (req, res) => {
  const { phone } = req.body;

  if (!phone || !/^09\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'شماره موبایل معتبر نیست' });
  }

  const users = readUsers();

  if (users[phone]) {
    res.json({ exists: true, displayName: users[phone].displayName });
  } else {
    res.json({ exists: false });
  }
});

app.post('/save-user', (req, res) => {
  const { phone, name, family, displayName, birthday, province, city, job } = req.body;

  console.log('Save user data:', req.body);

  if (!phone || !/^09\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'شماره موبایل معتبر نیست' });
  }

  if (!name || !family || !displayName || !birthday || !province || !city || !job) {
    return res.status(400).json({ error: 'تمام فیلدها باید پر شوند' });
  }

  const users = readUsers();
  users[phone] = { name, family, displayName, birthday, province, city, job };
  writeUsers(users);

  res.json({ success: true });
});

app.get('/get-user/:phone', (req, res) => {
  const phone = req.params.phone;
  const users = readUsers();

  if (users[phone]) {
    res.json(users[phone]);
  } else {
    res.status(404).json({ error: 'کاربر یافت نشد' });
  }
});

// صفحه اصلی
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running at http://localhost:${PORT}`);
});

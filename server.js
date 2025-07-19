const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const cors = require('cors');
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

const DATA_FILE = path.resolve(__dirname, 'users.json');

app.use(cors());
app.use(express.json());
app.use(bodyParser.json());
app.use(express.urlencoded({ extended: true }));

app.use(express.static(path.join(__dirname, 'public')));

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


app.get('/health', (req, res) => {
  res.status(200).json({ status: 'OK' });
});

app.post('/check-phone', (req, res) => {
  const { phone } = req.body;

  if (!phone || !/^09\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'شماره موبایل معتبر نیست' });
  }

  const users = readUsers();

  if (users[phone]) {
    return res.status(200).json({ exists: true, displayName: users[phone].displayName });
  } else {
    return res.status(200).json({ exists: false });
  }
});

app.post('/save-user', (req, res) => {
  const { phone, name, family, displayName, birthday, province, city, job } = req.body;

  console.log('✅ Save user:', req.body);

  if (!phone || !/^09\d{9}$/.test(phone)) {
    return res.status(400).json({ error: 'شماره موبایل معتبر نیست' });
  }

  if (!name || !family || !displayName || !birthday || !province || !city || !job) {
    return res.status(400).json({ error: 'تمام فیلدها باید پر شوند' });
  }

  const users = readUsers();
  users[phone] = { name, family, displayName, birthday, province, city, job };
  writeUsers(users);

  res.status(200).json({ success: true });
});

app.get('/get-user/:phone', (req, res) => {
  const phone = req.params.phone;
  const users = readUsers();

  if (users[phone]) {
    return res.status(200).json(users[phone]);
  } else {
    return res.status(404).json({ error: 'کاربر یافت نشد' });
  }
});

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.listen(PORT, () => {
  console.log(`✅ Server running on https://localhost:${PORT}`);
});
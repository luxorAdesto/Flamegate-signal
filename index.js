require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');

const app = express();

app.use(express.static(__dirname));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));

const verifications = {};

app.get('/test', (req, res) => {
  res.setHeader('Content-Type', 'text/html');
  res.send('<h1>✅ FlameGate test route reached.</h1>');
});

app.post('/start-verification', async (req, res) => {
  const { phone } = req.body;
  if (!phone) return res.status(400).send({ error: 'Phone number required.' });

  const code = Math.floor(100000 + Math.random() * 900000);
  verifications[phone] = code;

  try {
    const response = await axios.post('https://textbelt.com/text', {
      phone,
      message: `Your FlameGate verification code is: ${code}`,
      key: process.env.TEXTBELT_API_KEY,
    });
    if (response.data.success) {
      res.send({ message: '🔥 Verification code sent.' });
    } else {
      res.status(500).send({ error: '❌ SMS failed.', details: response.data });
    }
  } catch (err) {
    res.status(500).send({ error: '❌ Failed to send SMS.', details: err.message });
  }
});

app.post('/verify-code', (req, res) => {
  const { phone, code } = req.body;
  if (verifications[phone] && verifications[phone] == code) {
    delete verifications[phone];
    res.send({ message: '✅ Verification successful.' });
  } else {
    res.status(400).send({ error: '❌ Invalid or expired code.' });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 FlameGate server running on port ${PORT}`);
});

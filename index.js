const express = require('express');
const nodemailer = require('nodemailer');
const cors = require('cors');
require('dotenv').config();

const app = express();

const path = require('path');

// Middleware
app.use(cors({ origin: process.env.ALLOWED_ORIGIN || '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, 'public')));

// Create transport for nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.EMAIL_HOST || 'smtp.gmail.com',
    port: process.env.EMAIL_PORT ? Number(process.env.EMAIL_PORT) : 587,
    secure: process.env.EMAIL_SECURE === 'true' || false,
    auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASS
    }
});

// Verify transporter at startup to catch SMTP/auth problems early
transporter.verify()
    .then(() => console.log('SMTP transporter verified'))
    .catch(err => console.error('SMTP transporter verification failed:', err));

// Serve frontend
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

// Send email route
app.post('/send-email', async (req, res) => {
    try {
        const { to, subject, text, html } = req.body;

        if ((!to && !process.env.EMAIL_RECIPIENT) || (!subject && !text && !html)) {
            return res.status(400).json({ 
                error: 'Missing required fields: provide "to" (or set EMAIL_RECIPIENT) and content (subject/text/html)'
            });
        }

        const mailOptions = {
            from: process.env.EMAIL_USER,
            to: to || process.env.EMAIL_RECIPIENT,
            subject: subject || 'Fatura Disponivel',
            text: text || 'Olá a sua fatura está disponivel.',
            html
        };

        await transporter.sendMail(mailOptions);
        res.json({ message: 'Email sent successfully!' });
    } catch (error) {
        console.error('Error sending email:', error);
        res.status(500).json({ 
            error: 'Failed to send email',
            details: error.message
        });
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ error: 'Something went wrong!' });
});

// Access-Control middleware
app.use((req, res, next) => {
    res.header('Access-Control-Allow-Origin', process.env.ALLOWED_ORIGIN || '*');
    res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    res.header('Access-Control-Allow-Methods', 'GET,POST,PUT,DELETE,OPTIONS');
    if (req.method === 'OPTIONS') return res.sendStatus(204);
    next();
});

const PORT = process.env.PORT || 3000;

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
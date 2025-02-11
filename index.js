const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const cors = require("cors")
const qrcode = require('qrcode');

const app = express();
app.use(express.json());

app.use(cors({
    origin: ["https://alzakry-server-production.up.railway.app", "https://alzakry.vercel.app"], 
    methods: ["GET", "POST"],
    allowedHeaders: ["Content-Type", "Authorization"]
}));

let qrCodeData = ''; // Store QR code data globally

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process',
            '--disable-gpu',
        ],
    },
});

// Generate and store QR Code for web display
client.on('qr', (qr) => {
    console.log('🔍 Scan this QR Code to log in:');
    qrCodeData = qr; // Save for web access
    qrcode.generate(qr, { small: true }); // Fixes QR display issue
});

// API endpoint to display QR Code in browser
app.get('/qr', async (req, res) => {
    if (!qrCodeData) {
        return res.send("QR Code not available. Please wait...");
    }
    const qrImage = await qrcode.toDataURL(qrCodeData);
    res.send(`<h2>Scan the QR Code</h2><img src="${qrImage}" style="width:300px"/>`);
});

// When client is ready
client.on('ready', () => {
    console.log('✅ WhatsApp Web is ready!');
});

// Handle disconnection
client.on('disconnected', (reason) => {
    console.log(`⚠️ WhatsApp disconnected: ${reason}`);
    console.log('🔄 Restarting...');
    client.initialize();
});

// Root API endpoint
app.get('/', (req, res) => {
    res.send('WhatsApp Web JS Server is running!');
});

// API Endpoint to send messages
app.post('/send-message', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ success: false, message: 'Number and message are required!' });
    }

    try {
        const chatId = `${number}@c.us`; // Ensure correct format
        await client.sendMessage(chatId, message);
        console.log(`📩 Message sent to ${number}: ${message}`);
        res.json({ success: true, message: 'Message sent successfully!' });
    } catch (error) {
        console.error('❌ Error sending message:', error);
        res.status(500).json({ success: false, message: 'Failed to send message', error });
    }
});

// Initialize WhatsApp client
client.initialize();

// Start Express server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`🚀 Server is running on http://localhost:${PORT}`);
    console.log(`📸 Open http://localhost:${PORT}/qr to scan the QR Code`);
});

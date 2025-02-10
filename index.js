const { Client, LocalAuth } = require('whatsapp-web.js');
const express = require('express');
const qrcode = require('qrcode-terminal');

const app = express();
app.use(express.json());

// Initialize WhatsApp client
const client = new Client({
    authStrategy: new LocalAuth(),
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage', // Avoids issues with limited memory
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // Reduces memory usage
            '--disable-gpu', // Avoids GPU-related issues
        ],
    },
});

// Scan QR Code for the first time
client.on('qr', (qr) => {
    console.log('🔍 Scan this QR Code to log in:');
    qrcode.generate(qr, { small: true });
});

// When client is ready
client.on('ready', () => {
    console.log('✅ WhatsApp Web is ready!');
});

client.on('disconnected', (reason) => {
    console.log(`⚠️ WhatsApp disconnected: ${reason}`);
    console.log('🔄 Restarting...');
    client.initialize(); // Restart the session
});


// Simple API endpoint
app.get('/', (req, res) => {
    res.send('WhatsApp Web JS Server is running!');
})

// API Endpoint to send a message
app.post('/send-message', async (req, res) => {
    const { number, message } = req.body;

    if (!number || !message) {
        return res.status(400).json({ success: false, message: 'Number and message are required!' });
    }

    try {
        const chatId = `${number}@c.us`; // Ensure proper format
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
});

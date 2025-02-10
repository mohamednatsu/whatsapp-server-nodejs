const { Client, LocalAuth } = require('whatsapp-web.js');
const qrcode = require('qrcode-terminal');
const express = require('express');

const app = express();
const port = process.env.PORT || 3000;

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

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', (message) => {
    if (message.body === 'ping') {
        message.reply('pong');
    }
});

client.initialize();

app.get('/', (req, res) => {
    res.send('WhatsApp Bot is running!');
});

app.listen(port, () => {
    console.log(`Server is running on http://localhost:${port}`);
});
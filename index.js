const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
const { matchCommand } = require('./source/match');

const client = new Client({
    puppeteer: {
        executablePath: '/usr/bin/chromium-browser',
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    }
});

client.on('qr', (qr) => {
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    if (msg.body === '!test') {
        msg.reply('Ligadinho!');
    }

    matchCommand(msg);
});

client.initialize();
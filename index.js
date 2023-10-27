const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');

const isMatchPostMessage = (msg) => {
    return msg.body.toLowerCase().startsWith('!jogo ');
}

const extractMatch = (msg) => {
    const splitedMessage = msg.body.split('!jogo ');

    if (splitedMessage.length < 2) {
        return null;
    }

    return splitedMessage[1];
}

const client = new Client({
    puppeteer: {
        executablePath: '/usr/bin/chromium-browser',
        ignoreHTTPSErrors: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox', '--enable-gpu', '--disable-extensions'],
    }
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED', qr);
    qrcode.generate(qr, { small: true });
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', msg => {
    const isMatchMessage = isMatchPostMessage(msg);

    if (msg.body === '!test') {
        msg.reply('I am alive!');
    }

    if (isMatchMessage) {
        const match = extractMatch(msg);

        if (!match) {
            msg.reply('Erro ao registrar o jogo. Tente novamente. Ex: !jogo Flamengo 2-1 River');
        } else {
            msg.reply(`## *${match}* ## registrado com sucesso! Você tem *12h* para postar o resultado.`);

            setTimeout(() => {
                msg.reply(`## *${match}* ## 12h se passaram. Cadastrou o resultado?`);
            }, 43200000);
        }
    }
});

client.initialize();
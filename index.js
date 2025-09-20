const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
const { matchCommand } = require('./source/match');
const { draftCommand } = require("./source/draft");

const {
    CMD_INIT_DRAFT,
    CMD_FINISH_DRAFT,
    CMD_CHOICE,
    CMD_CHOICE_FORCE,
    CMD_PASS_TURN,
    CMD_PASS_TURN_FORCE,
    CMD_SUBS,
    CMD_SUBS_FORCE,
    CMD_MATCH,
    CMD_ADD_TEAM,
    CMD_REMOVE_TEAM,
} = require("./source/utils/constants");

const client = new Client({
    authStrategy: new LocalAuth(),
    webVersion: '2.2347.56',
    webVersionCache: {
        type: 'remote',
        remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.2347.56.html'
    },
    puppeteer: {
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            '--disable-dev-shm-usage',
            '--disable-accelerated-2d-canvas',
            '--no-first-run',
            '--no-zygote',
            '--single-process', // <- this one
            '--disable-gpu'
        ],
    }
});

client.on('qr', (qr) => {
    console.log('QR RECEIVED');
    qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
    console.log('AUTHENTICATED');
});

client.on('auth_failure', msg => {
    console.error('AUTHENTICATION FAILURE', msg);
});

client.on('ready', () => {
    console.log('Client is ready!');
});

client.on('message', async msg => {
    if (msg.body === '!test') {
        msg.reply('Tô por aqui!');
    }

    let command;

    const initDraft = msg.body.toLowerCase().startsWith('!iniciar-draft');
    const finishDraft = msg.body.toLowerCase().startsWith('!finalizar-draft');

    if (initDraft) {
        command = CMD_INIT_DRAFT;
    }

    if (finishDraft) {
        command = CMD_FINISH_DRAFT;
    }

    if (!command) {
        command = msg.body.toLowerCase().split(' ')[0];
    }

    if (command === CMD_MATCH) {
        matchCommand(msg);
    }

    const validCommands = new Set([
        CMD_INIT_DRAFT, CMD_FINISH_DRAFT, CMD_CHOICE, CMD_CHOICE_FORCE,
        CMD_PASS_TURN, CMD_PASS_TURN_FORCE, CMD_SUBS, CMD_SUBS_FORCE, CMD_ADD_TEAM,
        CMD_REMOVE_TEAM
    ]);

    if (validCommands.has(command)) {
        try {
            const contact = await msg.getContact();
            draftCommand(msg, contact.number, client);
        } catch (error) {
            console.log(`Tentativa de execução: ${command}`);
            console.log('Erro ao executar comando', error);
        }
    }

});

client.initialize();
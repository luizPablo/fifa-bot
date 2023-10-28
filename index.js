const qrcode = require('qrcode-terminal');
const { Client } = require('whatsapp-web.js');
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
} = require("./source/utils/constants");

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

client.on('message', async msg => {
    if (msg.body === '!test') {
        msg.reply('Ligadinho!');
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

    if ([CMD_INIT_DRAFT, CMD_FINISH_DRAFT, CMD_CHOICE, CMD_CHOICE_FORCE, CMD_PASS_TURN, CMD_PASS_TURN_FORCE, CMD_SUBS, CMD_SUBS_FORCE].includes(command)) {
        try {
            const contact = await msg.getContact();

            draftCommand(msg, contact.number, client);
        } catch (error) {
            console.log('Tentativa de execução: ', command);
            console.log('Erro ao executar comando', error);
        }
    }

});

client.initialize();
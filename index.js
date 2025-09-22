const qrcode = require('qrcode-terminal');
const { Client, LocalAuth } = require('whatsapp-web.js');
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
  CMD_ADD_TEAM,
  CMD_REMOVE_TEAM,
  CMD_DRAFT_CONTINUE,
  CMD_REMOVE_PASS_TURN,
  CMD_INIT_DRAFT_NO_SHUFFLE,
} = require("./source/utils/constants");

let connectionRetries = 0;
const MAX_RETRIES = 5;
let isClientReady = false;

const client = new Client({
  authStrategy: new LocalAuth(),
  webVersion: '2.3000.1027381369-alpha',
  webVersionCache: {
    type: 'remote',
    remotePath: 'https://raw.githubusercontent.com/wppconnect-team/wa-version/main/html/2.3000.1027381369-alpha.html'
  },
  restartOnAuthFail: true,
  puppeteer: {
    headless: true,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-dev-shm-usage',
      '--disable-accelerated-2d-canvas',
      '--single-process',
      '--disable-gpu',
      '--disable-extensions',
      '--disable-background-timer-throttling',
      '--disable-backgrounding-occluded-windows',
      '--disable-renderer-backgrounding',
      '--no-first-run',
    ],
  }
});

client.on('qr', (qr) => {
  if (isClientReady) {
    console.log('WARNING: New QR code generated despite client being previously ready');
    connectionRetries++;

    if (connectionRetries > MAX_RETRIES) {
      console.log('Too many reconnection attempts. Restarting client...');
      process.exit(1);
    }
  }

  console.log('QR RECEIVED - Scan to authenticate');
  qrcode.generate(qr, { small: true });
});

client.on('authenticated', () => {
  console.log('AUTHENTICATED');
  connectionRetries = 0;
});

client.on('auth_failure', msg => {
  console.error('AUTHENTICATION FAILURE', msg);
  connectionRetries++;

  if (connectionRetries > MAX_RETRIES) {
    console.log('Too many authentication failures. Restarting...');
    process.exit(1);
  }
});

client.on('ready', () => {
  console.log('Client is ready!');
  isClientReady = true;
  connectionRetries = 0;
});


client.on('disconnected', (reason) => {
  console.log('Client was disconnected', reason);
  isClientReady = false;

  console.log('Attempting to reconnect...');
  client.initialize();
});

client.on('message', async msg => {
  if (!isClientReady) {
    console.log('Message received but client not ready');
    return;
  }

  if (msg.body === '!test') {
    msg.reply('Tô por aqui!');
    return;
  }

  let command;

  const initDraft = msg.body.toLowerCase().startsWith('!iniciar-draft');
  const initDraftNoShuffle = msg.body.toLowerCase().startsWith('!draft');
  const finishDraft = msg.body.toLowerCase().startsWith('!finalizar-draft');
  const continueDraft = msg.body.toLowerCase().startsWith('!continuar-draft');
  const addTeamsToDraft = msg.body.toLowerCase().startsWith('!adicionar-time');

  if (initDraft) {
    command = CMD_INIT_DRAFT;
  }

  if (initDraftNoShuffle) {
    command = CMD_INIT_DRAFT_NO_SHUFFLE;
  }

  if (finishDraft) {
    command = CMD_FINISH_DRAFT;
  }

  if (continueDraft) {
    command = CMD_DRAFT_CONTINUE;
  }

  if (addTeamsToDraft) {
    command = CMD_ADD_TEAM;
  }

  if (!command) {
    command = msg.body.toLowerCase().split(' ')[0];
  }

  // to be implemented later
  // if (command === CMD_MATCH) {
  //     matchCommand(msg);
  // }

  const validCommands = new Set([
    CMD_INIT_DRAFT, CMD_FINISH_DRAFT, CMD_CHOICE, CMD_CHOICE_FORCE,
    CMD_PASS_TURN, CMD_PASS_TURN_FORCE, CMD_SUBS, CMD_SUBS_FORCE, CMD_ADD_TEAM,
    CMD_REMOVE_TEAM, CMD_DRAFT_CONTINUE, CMD_REMOVE_PASS_TURN, CMD_INIT_DRAFT_NO_SHUFFLE
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

setInterval(async () => {
  if (isClientReady) {
    try {
      const info = await client.getWWebVersion();
      console.log(`Keep-alive ping: ${new Date().toISOString()} - Version: ${info}`);
    } catch (error) {
      console.log('Keep-alive failed:', error);
      isClientReady = false;
    }
  }
}, 5 * 60 * 1000);

// Initialize client
client.initialize();
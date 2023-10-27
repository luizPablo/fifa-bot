let matchTimers = new Map();

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

const matchCommand = (msg) => {
    const isMatchMessage = isMatchPostMessage(msg);

    if (isMatchMessage) {
        const match = extractMatch(msg);

        if (!match) {
            msg.reply('Erro ao registrar o jogo. Tente novamente. Ex: !jogo Flamengo 2-1 River');
        } else {
            msg.reply(`✅✅\n\n## *${match}* ## registrado com sucesso! Você tem *12h* para postar o resultado.`);

            matchTimers.set(match, setTimeout(() => {
                msg.reply(`⚠️⚠️\n\n## *${match}* ## 12h se passaram. Postou o resultado? 👀`);
                matchTimers.delete(match);
            }, 43200000));
        }
    }
}

module.exports = {
    matchCommand,
};
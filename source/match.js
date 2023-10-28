const {
    CMD_MATCH,
    INFO_MATCH_REGISTER,
    INFO_MATCH_NOTIFIED,
    ERR_MATCH_REGISTER,
} = require("./utils/constants");

let matchTimers = new Map();

const isMatchPostMessage = (msg) => {
    return msg.body.toLowerCase().startsWith(CMD_MATCH);
}

const extractMatch = (msg) => {
    const splitedMessage = msg.body.split(CMD_MATCH);

    if (splitedMessage.length < 2) {
        return null;
    }

    return splitedMessage[1].trim();
}

const matchCommand = (msg) => {
    const isMatchMessage = isMatchPostMessage(msg);

    if (isMatchMessage) {
        const match = extractMatch(msg);

        try {
            if (!match) {
                msg.reply(ERR_MATCH_REGISTER);
            } else {
                msg.reply(INFO_MATCH_REGISTER(match));

                matchTimers.set(match, setTimeout(() => {
                    try {
                        msg.reply(INFO_MATCH_NOTIFIED(match));
                    } catch (error) {
                        console.log(`Erro notificar limite de 12h (${match})`, error);
                    }
                    matchTimers.delete(match);
                }, 43200000));
            }
        } catch (error) {
            console.log('Erro ao registrar o jogo', error);
        }

    }
}

module.exports = {
    matchCommand,
};
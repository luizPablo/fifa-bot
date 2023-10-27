const membersMap = {
    "Chelsea": "558496208030",
    "Borussia Dortmund": "558498178229",
    "Arsenal": "558499295135",
    "Eintracht Frankfurt": "558496608745",
    "Ajax": "558494584526",
    "Bayern Münichen": "558499680589",
    "Manchester City": "558494812451",
    "Milan": "558496371308",
    "Juventus": "558499919369",
    "Tottenham Hotspur": "558496059793",
    "Barcelona": "558498483035",
    "Bayer Leverkusen": "558499279049",
    "Manchester United": "558499977001",
    "Newclastle United": "558499344210",
    "RB Leipzig": "558494008968",
    "Wolverhamptom": "558488390218",
    "Borussia Mgladbach": "558492258902",
    "Paris Saint-Germain": "558498523150",
    "Liverpool": "558481514642",
    "Real Madrid": "558499922350",
    "Porto": "558499700280",
    "Atlético de Madrid": "558499123739",
    "Wolfsburg": "558499800409",
    "Udinese": "558496426956",
    "Hoffenheim": "558496664752",
    "Brighton": "558496054415",
    "Sevilla": "556699245873",
    "Celta de Vigo": "558498504518",
};

let contactsMap = {
    "558496208030": null,
    "558498178229": null,
    "558499295135": null,
    "558496608745": null,
    "558494584526": null,
    "558499680589": null,
    "558494812451": null,
    "558496371308": null,
    "558499919369": null,
    "558496059793": null,
    "558498483035": null,
    "558499279049": null,
    "558499977001": null,
    "558499344210": null,
    "558494008968": null,
    "558488390218": null,
    "558492258902": null,
    "558498523150": null,
    "558481514642": null,
    "558499922350": null,
    "558499700280": null,
    "558499123739": null,
    "558499800409": null,
    "558496426956": null,
    "558496664752": null,
    "558496054415": null,
    "556699245873": null,
    "558498504518": null
};

let participants = [];
let currentChoice = 1;
let draftStarted = false;
let allChoicesDone = false;
let turnTimeout;
let chat;

const normalize = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

const getFormattedDraftMessage = () => {
    const instructions = `*- Limite de escolhas:*\nVocê pode fazer até 5 escolhas\n*- Cadastrar escolha:*\n!escolha <Nome Sobrenome>\nEx: !escolha Memphis Depay\n*- Passar a vez:*\n!passo <numero de vezes>\nEx: !passo 1\n\n*⚠️ 30 minutos para primeira escolha*\n*⚠️ 20 minutos na segunda rodada*\n*⚠️ 10 minutos nas rodadas seguintes*\n\n`;

    const formattedList = participants.map((participant, index) => {
        const choiceList = participant.choices.map(choice => `*${choice}*`).join('\n');

        return `${index + 1}. ${participant.team}\n${choiceList}`;
    }).join('\n\n');

    return `${instructions}${formattedList}`;
};

const populateParticipants = async (members, msg, client) => {
    if (members.length === 0) {
        return null;
    }

    members.forEach(member => {
        if (!membersMap[member]) {
            participants = [];
            return;
        };

        participants.push({
            member: membersMap[member],
            team: member,
            choices: [],
        });
    });

    if (participants.length !== members.length) {
        await client.sendMessage(msg.from, 'A lista de times está incorreta :(');

        return null;
    }

    draftStarted = true;

    return participants;
};

const addChoice = async (choice, member, msg, chat, client, force = false) => {
    const participant = participants.find(member => member.choices.length < currentChoice);

    if (!participant) {
        return;
    }

    if (!force) {
        if (participant.member != member) {
            await client.sendMessage(msg.from, 'Não é sua vez!');
            return;
        }
    }

    const normalizedChoice = normalize(choice);

    // Check if the choice is already taken
    for (let participant of participants) {
        const normalizedChoices = participant.choices.map(normalize);

        if (normalizedChoices.includes(normalizedChoice)) {
            await client.sendMessage(msg.from, 'Jogador já escolhido!');
            return;
        }
    }

    clearTimeout(turnTimeout);

    participant.choices.push(choice);
    await client.sendMessage(msg.from, getFormattedDraftMessage());
    await callNextMember(msg, chat, client);
};

const passTurn = async (times, member, msg, client, force = false) => {
    const participant = participants.find(member => member.choices.length < currentChoice);

    if (!participant) {
        return;
    }

    if (!force) {
        if (participant.member != member) {
            await client.sendMessage(msg.from, 'Não é sua vez!');
            return;
        }
    }

    const choicesMade = participant.choices.length;
    const availablePasses = 5 - choicesMade;

    if (times > availablePasses) {
        await client.sendMessage(msg.from, `Você só pode passar ${availablePasses} vezes.`);
        return;
    };

    clearTimeout(turnTimeout);

    for (let i = 0; i < times; i++) {
        participant.choices.push('Passou');
    }
    await client.sendMessage(msg.from, getFormattedDraftMessage());
    await callNextMember(msg, chat, client);
};

const callNextMember = async (msg, chat, client, from_subs = false) => {
    if (!from_subs) {
        clearTimeout(turnTimeout);
    }

    const participant = participants.find(member => member.choices.length < currentChoice);

    if (!participant) {
        currentChoice++;

        if (currentChoice > 5) {
            client.sendMessage(msg.from, '✅✅\n\n- Escolhas finalizadas\n- Substituições ainda são possíveis\n- Lembre-se de finalizar o draft após as substituições\n\n*!finalizar-draft*');
            allChoicesDone = true;

            return;
        }

        await callNextMember(msg, chat, client);
    } else {
        const contact = contactsMap[participant.member];

        if (from_subs) {

            if (!allChoicesDone) {
                await chat.sendMessage(`Ainda é sua vez @${contact.id.user}`, {
                    mentions: [contact]
                });
            }

            return;
        }


        await chat.sendMessage(`Sua vez @${contact.id.user}`, {
            mentions: [contact]
        });

        const time = currentChoice === 1 ? 120000 : currentChoice === 2 ? 120000 : 120000;

        turnTimeout = setTimeout(() => {
            client.sendMessage(msg.from, 'Tempo esgotado! Passando a vez...');
            passTurn(1, participant.member, msg, client);
        }, time);
    }
};

const changeChoiceAlreadyDone = async (member, msg, chat, client, force = false) => {
    const splittedCommand = msg.body.split('!subs');

    if (splittedCommand.length < 2) {
        await client.sendMessage(msg.from, 'Comando inválido\nEx: !subs <Nome Sobrenome> > <Nome Sobrenome>');
        return;
    };

    const players = splittedCommand[1].split('>');

    if (players.length < 2) {
        await client.sendMessage(msg.from, 'Comando inválido\nEx: !subs <Nome Sobrenome> > <Nome Sobrenome>');
        return;
    }

    const oldChoice = players[0].trim();
    const newChoice = players[1].trim();

    let participant;

    if (force) {
        participant = participants.find(participant => participant.choices.includes(oldChoice));
    } else {
        participant = participants.find(participant => participant.member === member);
    }


    if (!participant) {
        if (force) {
            client.sendMessage(msg.from, `${oldChoice}, esse elemento não foi encontrado entre as escolhas`);
        } else {
            client.sendMessage(msg.from, 'Você não está participando do draft ;D');
        }
        return;
    }

    const choiceIndex = participant.choices.indexOf(oldChoice);

    if (choiceIndex === -1) {
        client.sendMessage(msg.from, `${oldChoice}, esse elemento não foi encontrado entre as suas escolhas`);
        return;
    }

    // Check if the new choice is already taken
    for (let participant of participants) {
        if (participant.choices.includes(newChoice)) {
            await client.sendMessage(msg.from, 'O jogador que você quer inserir já foi escolhido!');
            return;
        }
    }

    // Replace the old choice with the new choice
    participant.choices[choiceIndex] = newChoice;

    await client.sendMessage(msg.from, getFormattedDraftMessage());
    await client.sendMessage(msg.from, 'Substituição realizada com sucesso!');
    await callNextMember(msg, chat, client, true);
};

const draftCommand = async (msg, member, client) => {
    const initDraft = msg.body.toLowerCase().startsWith('!iniciar-draft');
    const makingChoice = msg.body.toLowerCase().startsWith('!escolha');
    const forceChoice = msg.body.toLowerCase().startsWith('!!escolha');
    const passingTurn = msg.body.toLowerCase().startsWith('!passo');
    const forcePassingTurn = msg.body.toLowerCase().startsWith('!!passo');
    const subsChoice = msg.body.toLowerCase().startsWith('!subs');
    const forceSubs = msg.body.toLowerCase().startsWith('!!subs');
    const finishDraft = msg.body.toLowerCase().startsWith('!finalizar-draft');

    if (initDraft) {
        if (!(member == '558496208030' || member == '558498178229')) {
            await client.sendMessage(msg.from, 'Você não tem permissão para usar esse comando ;D');
            return;
        }

        if (draftStarted) {
            await client.sendMessage(msg.from, 'Já temos um draft em andamento.');
        } else {
            const members = msg.body.split('!iniciar-draft')[1].split('\n');
            const filteredMembers = members.filter(member => member);

            const draftStarted = await populateParticipants(filteredMembers, msg, client);

            if (!draftStarted) {
                client.sendMessage(msg.from, 'Erro ao iniciar o draft!');
            } else {
                chat = await msg.getChat();

                for (let participant of chat.participants) {
                    const contact = await client.getContactById(participant.id._serialized);

                    contactsMap[contact.number] = contact;
                }

                await client.sendMessage(msg.from, getFormattedDraftMessage());
                await callNextMember(msg, chat, client);
            }
        }
    }

    if (makingChoice && draftStarted) {
        const player = msg.body.split('!escolha')[1].trim();

        await addChoice(player, member, msg, chat, client);
    }

    if (forceChoice && draftStarted) {
        const player = msg.body.split('!!escolha')[1].trim();

        if (!(member == '558496208030' || member == '558498178229')) {
            await client.sendMessage(msg.from, 'Você não tem permissão para usar esse comando ;D');
            return;
        }

        await addChoice(player, member, msg, chat, client, true);
    }

    if (passingTurn && draftStarted) {
        const timesStr = msg.body.split('!passo')[1].trim();

        const times = parseInt(timesStr);
        if (isNaN(times)) {
            await client.sendMessage(msg.from, 'Comando inválido. Ex: !passo 1');
            return;
        }

        await passTurn(times, member, msg, client);
    }

    if (forcePassingTurn && draftStarted) {
        const timesStr = msg.body.split('!!passo')[1].trim();

        const times = parseInt(timesStr);
        if (isNaN(times)) {
            await client.sendMessage(msg.from, 'Comando inválido. Ex: !!passo 1');
            return;
        }

        if (!(member == '558496208030' || member == '558498178229')) {
            await client.sendMessage(msg.from, 'Você não tem permissão para usar esse comando ;D');
            return;
        }

        await passTurn(times, member, msg, client, true);
    }

    if (subsChoice && draftStarted) {
        await changeChoiceAlreadyDone(member, msg, chat, client);
    }

    if (forceSubs && draftStarted) {
        if (!(member == '558496208030' || member == '558498178229')) {
            await client.sendMessage(msg.from, 'Você não tem permissão para usar esse comando ;D');
            return;
        }

        await changeChoiceAlreadyDone(member, msg, chat, client, true);
    }

    if (finishDraft && draftStarted) {
        if (!(member == '558496208030' || member == '558498178229')) {
            await client.sendMessage(msg.from, 'Você não tem permissão para usar esse comando ;D');
            return;
        }

        participants = [];
        currentChoice = 1;
        draftStarted = false;
        allChoicesDone = false;
        chat = null;
        clearTimeout(turnTimeout);

        await client.sendMessage(msg.from, '✅✅\n\nDraft finalizado com sucesso!');
    }
};

module.exports = {
    draftCommand,
};
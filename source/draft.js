const {
  ERR_COMMAND_NOT_ALLOWED,
  ERR_INIT_DRAFT,
  ERR_NOT_YOUR_TURN,
  ERR_PLAYER_TAKEN,
  ERR_WRONG_LIST,
  ERR_PASS_LIMIT,
  ERR_PLAYER_NOT_FOUND,
  ERR_PLAYER_NOT_FOUND_IN_CHOICES,
  ERR_NOT_PARTICIPATING,
  ERR_SUBS_COMMAND,
  ERR_SUBS_COMMAND_FORCE,
  ERR_CHOICE_COMMAND,
  ERR_CHOICE_COMMAND_FORCE,
  ERR_PASS_TURN_COMMAND,
  ERR_PASS_TURN_COMMAND_FORCE,
  ERR_ADD_TEAM,
  ERR_TEAM_ALREADY_ON_DRAFT,
  INFO_LIST_HEADER,
  INFO_STILL_YOUR_TURN,
  INFO_YOUR_TURN,
  INFO_FINISHED_DRAFT,
  INFO_TIME_OVER,
  INFO_SUBS_DONE,
  INFO_DRAFT_IN_PROGRESS,
  INFO_CLOSED_DRAFT,
  INFO_ADD_TEAM,
  CMD_INIT_DRAFT,
  CMD_FINISH_DRAFT,
  CMD_CHOICE,
  CMD_CHOICE_FORCE,
  CMD_PASS_TURN,
  CMD_PASS_TURN_FORCE,
  CMD_SUBS,
  CMD_SUBS_FORCE,
  CMD_ADD_TEAM,
  MEMBERS_MAP,
  ERR_PASS_TURN_IN_CHOICE_COMMAND,
  CMD_REMOVE_TEAM,
  ERR_REMOVE_TEAM,
  COMIC_MESSAGES,
} = require("./utils/constants");

let contactsMap = {
  "558496208030": null,
  "558498178229": null,
  "558499205135": null,
  "558496608745": null,
  "558499680589": null,
  "558494812451": null,
  "558496371308": null,
  "558499919360": null,
  "558496059793": null,
  "558498483035": null,
  "558499279049": null,
  "558499977001": null,
  "558499344210": null,
  "558494008968": null,
  "558492258902": null,
  "558498523150": null,
  "558481514642": null,
  "558499922350": null,
  "558499700280": null,
  "558499123739": null,
  "558496426956": null,
  "558496664752": null,
  "558496054415": null,
  "556699245873": null,
  "558498185708": null
};

let participants = [];
let currentChoice = 1;
let draftStarted = false;
let allChoicesDone = false;
let turnTimeout;
let chat;

const normalize = (str) => str.normalize('NFD').replace(/[\u0300-\u036f]/g, "").toLowerCase();

const getFormattedDraftMessage = () => {

  const formattedList = participants.map((participant, index) => {
    const choiceList = participant.choices.map(choice => `*${choice}*`).join('\n');

    return `${index + 1}. ${participant.team}\n${choiceList}`;
  }).join('\n\n');

  return `${INFO_LIST_HEADER}${formattedList}`;
};

const populateParticipants = async (members, msg, client) => {
  if (!Array.isArray(members) || members.length === 0) {
    console.log('Invalid members list.');
    return null;
  }

  if (!members.every(member => MEMBERS_MAP[member])) {
    try {
      await client.sendMessage(msg.from, ERR_WRONG_LIST);
      console.log(members.filter(member => !MEMBERS_MAP[member]));
    } catch (error) {
      console.log('Error sending message:', error);
    }
    return null;
  }

  participants = members.map(member => ({
    member: MEMBERS_MAP[member],
    team: member,
    choices: [],
  }));

  draftStarted = true;

  return participants;
};

const addTeamToDraft = async (member, msg, client) => {
  // Check if the member exists on the MEMBERS_MAP
  if (!MEMBERS_MAP[member]) {
    try {
      await client.sendMessage(msg.from, ERR_ADD_TEAM);
    } catch (error) {
      console.log('Error sending message:', error);
    }

    return;
  }

  // Check if the member is already participating
  if (participants.some(participant => participant.team === member)) {
    try {
      await client.sendMessage(msg.from, ERR_TEAM_ALREADY_ON_DRAFT);
    } catch (error) {
      console.log('Error sending message:', error);
    }

    return;
  }

  // Add the member to the end of the participants list
  // Fill the choices with "Passou", until the current choice
  participants.push({
    member: MEMBERS_MAP[member],
    team: member,
    choices: new Array(currentChoice - 1).fill('Passou'),
  });

  return;
};

const removeTeamFromDraft = async (member, msg, client) => {
  const participantIndex = participants.findIndex(participant => participant.team === member);

  if (participantIndex === -1) {
    try {
      await client.sendMessage(msg.from, ERR_PLAYER_NOT_FOUND(member));
    } catch (error) {
      console.log('Error sending message:', error);
    }

    return;
  }

  participants.splice(participantIndex, 1);

  return;
};

const addChoice = async (choice, member, msg, chat, client, force = false) => {
  const participant = participants.find(participant => participant.choices.length < currentChoice);

  if (!participant) {
    return;
  }

  if (!force && participant.member !== member) {
    try {
      await client.sendMessage(msg.from, ERR_NOT_YOUR_TURN);
    } catch (error) {
      console.log('Error sending message:', error);
    }
    return;
  }

  const normalizedChoice = normalize(choice);

  // if choice start with pass, show error... user must use !passo command
  if (normalizedChoice.startsWith('pass')) {
    try {
      await client.sendMessage(msg.from, ERR_PASS_TURN_IN_CHOICE_COMMAND);
      await client.sendMessage(msg.from, COMIC_MESSAGES[Math.floor(Math.random() * COMIC_MESSAGES.length)]);
    } catch (error) {
      console.log('Error sending message:', error);
    }

    return;
  }

  // Create a set of all normalized choices
  const allChoices = new Set(participants.flatMap(participant =>
    participant.choices.map(normalize)
  ));

  if (allChoices.has(normalizedChoice)) {
    try {
      await client.sendMessage(msg.from, ERR_PLAYER_TAKEN);
    } catch (error) {
      console.log('Error sending message:', error);
    }
    return;
  }

  if (turnTimeout) {
    clearTimeout(turnTimeout);
  }

  participant.choices.push(choice);
  try {
    await client.sendMessage(msg.from, getFormattedDraftMessage());
    await callNextMember(msg, chat, client);
  } catch (error) {
    console.log('Error sending message:', error);
  }
};

const passTurn = async (times, member, msg, client, force = false) => {
  if (times < 0) {
    console.log('Invalid times value.');
    return;
  }

  const participant = participants.find(participant => participant.choices.length < currentChoice);

  if (!participant) {
    return;
  }

  const choicesMade = participant.choices.length;
  const availablePasses = 5 - choicesMade;

  if (times > availablePasses) {
    try {
      await client.sendMessage(msg.from, ERR_PASS_LIMIT(availablePasses));
    } catch (error) {
      console.log('Error sending message:', error);
    }
    return;
  }

  if (turnTimeout) {
    clearTimeout(turnTimeout);
  }

  // Add 'Passou' to the choices
  participant.choices = participant.choices.concat(new Array(times).fill('Passou'));

  try {
    await client.sendMessage(msg.from, getFormattedDraftMessage());
    await callNextMember(msg, chat, client);
  } catch (error) {
    console.log('Error calling next member:', error);
  }
};

const callNextMember = async (msg, chat, client, alt_mention = false) => {
  if (!alt_mention) {
    clearTimeout(turnTimeout);
  }

  const participant = participants.find(member => member.choices.length < currentChoice);

  if (!participant) {
    currentChoice++;

    if (currentChoice > 5) {
      try {
        client.sendMessage(msg.from, INFO_FINISHED_DRAFT);
      } catch (error) {
        console.log('Error sending message:', error);
      }

      allChoicesDone = true;
      return;
    }

    try {
      await callNextMember(msg, chat, client);
    } catch (error) {
      console.log('Error calling next member:', error);
    }

    return;
  }

  const contact = contactsMap[participant.member];

  if (!alt_mention || !allChoicesDone) {
    try {
      const message = !alt_mention ? INFO_YOUR_TURN(contact.id.user) : INFO_STILL_YOUR_TURN(contact.id.user);
      await chat.sendMessage(message, {
        mentions: [contact.id._serialized]
      });
    } catch (error) {
      console.log('Error sending message:', error);
    }
  }

  if (!alt_mention) {
    const timeMap = { 1: 1800000, 2: 1200000 };
    const time = timeMap[currentChoice] || 600000;

    turnTimeout = setTimeout(async () => {
      try {
        await client.sendMessage(msg.from, INFO_TIME_OVER);
        await passTurn(1, participant.member, msg, client);
      } catch (error) {
        console.log('Error sending message:', error);
      }
    }, time);
  }

  return;
};

const changeChoiceAlreadyDone = async (member, msg, chat, client, force = false) => {
  let splittedCommand;

  if (force) {
    splittedCommand = msg.body.split(CMD_SUBS_FORCE);
  } else {
    splittedCommand = msg.body.split(CMD_SUBS);
  }

  if (splittedCommand.length < 2) {
    const message = force ? ERR_SUBS_COMMAND_FORCE : ERR_SUBS_COMMAND;

    try {
      await client.sendMessage(msg.from, message);
      await client.sendMessage(msg.from, COMIC_MESSAGES[Math.floor(Math.random() * COMIC_MESSAGES.length)]);
    } catch (error) {
      console.log('Error sending message:', error);
    }

    return;
  }

  const players = splittedCommand[1].split('>');

  if (players.length < 2) {
    try {
      await client.sendMessage(msg.from, ERR_SUBS_COMMAND);
      await client.sendMessage(msg.from, COMIC_MESSAGES[Math.floor(Math.random() * COMIC_MESSAGES.length)]);
    } catch (error) {
      console.log('Error sending message:', error);
    }

    return;
  }

  const oldChoice = players[0].trim();
  const newChoice = players[1].trim();

  if (!oldChoice || !newChoice) {
    const message = force ? ERR_SUBS_COMMAND_FORCE : ERR_SUBS_COMMAND;

    try {
      await client.sendMessage(msg.from, message);
      await client.sendMessage(msg.from, COMIC_MESSAGES[Math.floor(Math.random() * COMIC_MESSAGES.length)]);
    } catch (error) {
      console.log('Error sending message:', error);
    }

    return;
  }

  let participant;

  if (force) {
    participant = participants.find(participant => participant.choices.includes(oldChoice));
  } else {
    participant = participants.find(participant => participant.member === member);
  }

  if (!participant) {
    const message = force ? ERR_PLAYER_NOT_FOUND(oldChoice) : ERR_NOT_PARTICIPATING;
    try {
      await client.sendMessage(msg.from, message);
    } catch (error) {
      console.log('Error sending message:', error);
    }

    return;
  }

  const choiceIndex = participant.choices.indexOf(oldChoice);

  if (choiceIndex === -1) {
    try {
      await client.sendMessage(msg.from, ERR_PLAYER_NOT_FOUND_IN_CHOICES(oldChoice));
    } catch (error) {
      console.log('Error sending message:', error);
    }

    return;
  }

  // Create a set of all choices
  const allChoices = new Set(participants.flatMap(participant => participant.choices));

  if (allChoices.has(newChoice)) {
    try {
      await client.sendMessage(msg.from, ERR_PLAYER_TAKEN);
    } catch (error) {
      console.log('Error sending message:', error);
    }

    return;
  }

  // Replace the old choice with the new choice
  participant.choices[choiceIndex] = newChoice;

  try {
    await client.sendMessage(msg.from, getFormattedDraftMessage());
    await client.sendMessage(msg.from, INFO_SUBS_DONE);
    await callNextMember(msg, chat, client, true);
  } catch (error) {
    console.log('Error sending message:', error);
  }
};

const draftCommand = async (msg, member, client) => {
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

  const isAdmin = ['558496208030', '558498178229', '558498483035'].includes(member);

  switch (command) {
    case CMD_INIT_DRAFT:
      if (!isAdmin) {
        try {
          await client.sendMessage(msg.from, ERR_COMMAND_NOT_ALLOWED);
        } catch (error) {
          console.log('Error sending message:', error);
        }

        return;
      }

      if (draftStarted) {
        try {
          await client.sendMessage(msg.from, INFO_DRAFT_IN_PROGRESS);
        } catch (error) {
          console.log('Error sending message:', error);
        }
      } else {
        const members = msg.body.split('!iniciar-draft')[1].split('\n');
        const filteredMembers = members.filter(member => member);

        const draftStarted = await populateParticipants(filteredMembers, msg, client);

        if (!draftStarted) {
          await client.sendMessage(msg.from, ERR_INIT_DRAFT);
        } else {
          try {
            chat = await msg.getChat();
          } catch (error) {
            console.log('Error getting chat:', error);

            return;
          }

          for (let participant of chat.participants) {
            try {
              const contact = await client.getContactById(participant.id._serialized);
              contactsMap[contact.number] = contact;
            } catch (error) {
              console.log('Error getting contact:', error);

              return;
            }
          }

          try {
            await client.sendMessage(msg.from, getFormattedDraftMessage());
            await callNextMember(msg, chat, client);
          } catch (error) {
            console.log('Error sending message:', error);
          }
        }
      }
      break;
    case CMD_CHOICE:
    case CMD_CHOICE_FORCE:
      if (draftStarted) {
        const splittedCommand = msg.body.split(command);

        if (splittedCommand.length < 2) {
          const message = command === '!escolha' ? ERR_CHOICE_COMMAND : ERR_CHOICE_COMMAND_FORCE;
          try {
            await client.sendMessage(msg.from, message);
            await client.sendMessage(msg.from, COMIC_MESSAGES[Math.floor(Math.random() * COMIC_MESSAGES.length)]);
          } catch (error) {
            console.log('Error sending message:', error);
          }

          return;
        }

        if (command === '!!escolha' && !isAdmin) {
          try {
            await client.sendMessage(msg.from, ERR_COMMAND_NOT_ALLOWED);
          } catch (error) {
            console.log('Error sending message:', error);
          }

          return;
        }

        const player = msg.body.split(command)[1].trim();

        if (!player) {
          const message = command === '!escolha' ? ERR_CHOICE_COMMAND : ERR_CHOICE_COMMAND_FORCE;
          try {
            await client.sendMessage(msg.from, message);
          } catch (error) {
            console.log('Error sending message:', error);
          }

          return;
        }

        await addChoice(player, member, msg, chat, client, command === '!!escolha');
      }
      break;
    case CMD_PASS_TURN:
    case CMD_PASS_TURN_FORCE:
      if (draftStarted) {
        const splittedCommand = msg.body.split(command);

        if (splittedCommand.length < 2) {
          const message = command === '!passo' ? ERR_PASS_TURN_COMMAND : ERR_PASS_TURN_COMMAND_FORCE;
          try {
            await client.sendMessage(msg.from, message);
          } catch (error) {
            console.log('Error sending message:', error);
          }

          return;
        }

        if (command === '!!passo' && !isAdmin) {
          try {
            await client.sendMessage(msg.from, ERR_COMMAND_NOT_ALLOWED);
          } catch (error) {
            console.log('Error sending message:', error);
          }

          return;
        }

        const timesStr = msg.body.split(command)[1].trim();
        const times = parseInt(timesStr);

        if (isNaN(times)) {
          const message = command === '!passo' ? ERR_PASS_TURN_COMMAND : ERR_PASS_TURN_COMMAND_FORCE;

          try {
            await client.sendMessage(msg.from, message);
            await client.sendMessage(msg.from, COMIC_MESSAGES[Math.floor(Math.random() * COMIC_MESSAGES.length)]);
          } catch (error) {
            console.log('Error sending message:', error);
          }

          return;
        }

        await passTurn(times, member, msg, client, command === '!!passo');
      }
      break;
    case CMD_SUBS:
    case CMD_SUBS_FORCE:
      if (draftStarted) {
        if (command === '!!subs' && !isAdmin) {
          try {
            await client.sendMessage(msg.from, ERR_COMMAND_NOT_ALLOWED);
          } catch (error) {
            console.log('Error sending message:', error);
          }

          return;
        }

        await changeChoiceAlreadyDone(member, msg, chat, client, command === '!!subs');
      }
      break;
    case CMD_ADD_TEAM:
      if (draftStarted) {
        if (!isAdmin) {
          try {
            await client.sendMessage(msg.from, ERR_COMMAND_NOT_ALLOWED);
          } catch (error) {
            console.log('Error sending message:', error);
          }

          return;
        }

        const splittedCommand = msg.body.split(CMD_ADD_TEAM);

        if (splittedCommand.length < 2) {
          try {
            await client.sendMessage(msg.from, ERR_ADD_TEAM);
          } catch (error) {
            console.log('Error sending message:', error);
          }

          return;
        };

        const member = splittedCommand[1].trim();

        if (!member) {
          try {
            await client.sendMessage(msg.from, ERR_ADD_TEAM);
          } catch (error) {
            console.log('Error sending message:', error);
          }

          return;
        }

        await addTeamToDraft(member, msg, client);

        try {
          await client.sendMessage(msg.from, getFormattedDraftMessage());
          await client.sendMessage(msg.from, INFO_ADD_TEAM);
          await callNextMember(msg, chat, client, true);
        } catch (error) {
          console.log('Error sending message:', error);
        }
      }
      break;
    case CMD_REMOVE_TEAM:
      if (draftStarted) {
        if (!isAdmin) {
          try {
            await client.sendMessage(msg.from, ERR_COMMAND_NOT_ALLOWED);
          } catch (error) {
            console.log('Error sending message:', error);
          }

          return;
        }

        const splittedCommand = msg.body.split(CMD_REMOVE_TEAM);

        if (splittedCommand.length < 2) {
          try {
            await client.sendMessage(msg.from, ERR_REMOVE_TEAM);
          } catch (error) {
            console.log('Error sending message:', error);
          }

          return;
        };

        const member = splittedCommand[1].trim();

        if (!member) {
          try {
            await client.sendMessage(msg.from, ERR_REMOVE_TEAM);
          } catch (error) {
            console.log('Error sending message:', error);
          }

          return;
        }

        await removeTeamFromDraft(member, msg, client);

        try {
          await client.sendMessage(msg.from, getFormattedDraftMessage());
          await callNextMember(msg, chat, client, true);
        } catch (error) {
          console.log('Error sending message:', error);
        }
      }
      break;
    case CMD_FINISH_DRAFT:
      if (draftStarted) {
        if (!isAdmin) {
          try {
            await client.sendMessage(msg.from, ERR_COMMAND_NOT_ALLOWED);
          } catch (error) {
            console.log('Error sending message:', error);
          }

          return;
        }

        participants = [];
        currentChoice = 1;
        draftStarted = false;
        allChoicesDone = false;
        chat = null;
        clearTimeout(turnTimeout);

        try {
          await client.sendMessage(msg.from, INFO_CLOSED_DRAFT);
        } catch (error) {
          console.log('Error sending message:', error);
        }
      }
      break;
    default:
      // send a message informing that the command is inexistent
      try {
        // send a ramdom comical message, just for fun
        await client.sendMessage(msg.from, COMIC_MESSAGES[Math.floor(Math.random() * COMIC_MESSAGES.length)]);
      } catch (error) {
        console.log('Error sending message:', error);
      }
  }
};

module.exports = {
  draftCommand,
};
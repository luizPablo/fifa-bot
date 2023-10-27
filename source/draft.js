const membersMap = {
    "Chelsea": 1,
    "Borussia Dortmund": 2,
};

let participants = [];
let currenChoice = 1;

const populateParticipants = (members) => {
    if (members.length === 0) {
        return null;
    }

    members.forEach(member => {
        participants.push({
            member,
            choices: [],
        });
    });

    return participants;
};

const addChoice = (choice) => {
    const participant = participants.find(member => member.choices.length < currenChoice);

    if (!participant) {
        return null;
    }

    participant.choices.push(choice);
};

const callNextMember = () => {
    const participant = participants.find(member => member.choices.length < currenChoice);

    if (!participant) {
        currenChoice++;

        if (currenChoice > 5) {
            return null;
        }
    } else {
        console.log(participant.member);
    }

    return callNextMember();
};
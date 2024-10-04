// Constants for error messages
const ERR_COMMAND_NOT_ALLOWED = 'Você não tem permissão para usar esse comando ;D';
const ERR_INIT_DRAFT = 'Erro ao iniciar o draft!';
const ERR_NOT_YOUR_TURN = 'Não é sua vez!';
const ERR_PLAYER_TAKEN = 'Jogador já escolhido!';
const ERR_WRONG_LIST = 'A lista de times está incorreta :(';
const ERR_PASS_LIMIT = (times) => `Você só pode passar ${times} vezes`;
const ERR_PLAYER_NOT_FOUND = (player) => `Jogador ${player} não encontrado`;
const ERR_PLAYER_NOT_FOUND_IN_CHOICES = (player) => `Jogador ${player} não encontrado entre suas escolhas`;
const ERR_NOT_PARTICIPATING = 'Você não está participando do draft ;D';
const ERR_SUBS_COMMAND = 'Comando inválido\nEx: !subs Lione Messi > Neymar Jr';
const ERR_SUBS_COMMAND_FORCE = 'Comando inválido\nEx: !!subs Lione Messi > Neymar Jr';
const ERR_CHOICE_COMMAND = 'Comando inválido\nEx: !escolha Memphis Depay';
const ERR_CHOICE_COMMAND_FORCE = 'Comando inválido\nEx: !!escolha Memphis Depay';
const ERR_PASS_TURN_COMMAND = 'Comando inválido\nEx: !passo 1';
const ERR_PASS_TURN_COMMAND_FORCE = 'Comando inválido\nEx: !!passo 1';
const ERR_MATCH_REGISTER = 'Erro ao registrar o jogo. Tente novamente. Ex: !jogo Flamengo 2-1 River';
const ERR_ADD_TEAM = 'Erro ao adicionar time. Tente novamente. Ex: !adicionar-time Real Madrid';
const ERR_REMOVE_TEAM = 'Erro ao remover time. Tente novamente. Ex: !remover-time Real Madrid';
const ERR_TEAM_ALREADY_ON_DRAFT = 'Time já participando do draft';
const ERR_PASS_TURN_IN_CHOICE_COMMAND = 'Deixe de ser bocó! Se quiser passar a vez, use o comando !passo x';

// Constants for info messages
const INFO_LIST_HEADER = `*- Limite de escolhas:*\nVocê pode fazer até 5 escolhas\n*- Cadastrar escolha:*\n!escolha <Nome Sobrenome>\nEx: !escolha Memphis Depay\n*- Passar a vez:*\n!passo <numero de vezes>\nEx: !passo 1\n\n*⚠️ 30 minutos para primeira escolha*\n*⚠️ 20 minutos na segunda rodada*\n*⚠️ 10 minutos nas rodadas seguintes*\n\n`;
const INFO_STILL_YOUR_TURN = (member) => `Ainda é sua vez @${member}`;
const INFO_YOUR_TURN = (member) => `É sua vez @${member}`;
const INFO_FINISHED_DRAFT = '✅✅\n\n- Escolhas finalizadas\n- Substituições ainda são possíveis\n- Lembre-se de finalizar o draft após as substituições\n\n*!finalizar-draft*';
const INFO_TIME_OVER = 'Tempo esgotado! Passando a vez...';
const INFO_SUBS_DONE = 'Substituição realizada com sucesso!';
const INFO_DRAFT_IN_PROGRESS = 'Já temos um draft em andamento';
const INFO_CLOSED_DRAFT = '✅✅\n\nDraft finalizado com sucesso!';
const INFO_MATCH_REGISTER = (match) => `✅✅\n\n## *${match}* ## registrado com sucesso! Você tem *12h* para postar o resultado.`;
const INFO_MATCH_NOTIFIED = (match) => `⚠️⚠️\n\n## *${match}* ## 12h se passaram. Postou o resultado? 👀`;
const INFO_ADD_TEAM = (team) => `✅✅\n\nTime *${team}* adicionado com sucesso!`;

// Constants for commands names
const CMD_INIT_DRAFT = '!iniciar-draft';
const CMD_FINISH_DRAFT = '!finalizar-draft';
const CMD_CHOICE = '!escolha';
const CMD_CHOICE_FORCE = '!!escolha';
const CMD_PASS_TURN = '!passo';
const CMD_PASS_TURN_FORCE = '!!passo';
const CMD_SUBS = '!subs';
const CMD_SUBS_FORCE = '!!subs';
const CMD_MATCH = '!jogo';
const CMD_ADD_TEAM = '!adicionar-time';
const CMD_REMOVE_TEAM = '!remover-time';

const MEMBERS_MAP = {
  "Chelsea": "558496208030",
  "Borussia Dortmund": "558498178229",
  "West Ham": "558496608745",
  "Bayern München": "558499680589",
  "Manchester City": "558494812451",
  "Aston Villa": "558496371308",
  "Juventus": "558499919360",
  "Roma": "558496059793",
  "Barcelona": "558498483035",
  "Bayer Leverkusen": "558499279049",
  "Manchester United": "558499977001",
  "Newcastle United": "558499344210",
  "Al Nassr": "558494008968",
  "Salzburg": "558492258902",
  "Napoli": "558498523150",
  "Liverpool": "558481514642",
  "Real Madrid": "558499922350",
  "Porto": "558499700280",
  "Atlético de Madrid": "558499123739",
  "Paris Saint-Germain": "558498185708",
  "Udinese": "558496426956",
  "Arsenal": "558496664752",
  "Brighton": "558496054415",
  "Fiorentina": "556699245873",
  "Tottenham Hotspur": "558498504518",
};

const COMIC_MESSAGES = [
  "Você não cansa de errar não, né? Tá tentando sabotar o sistema ou só tá perdido mesmo?",
  "Que *%$#@* de comando é esse? Nem o computador aguenta mais sua incompetência!",
  "Sério?! Esse foi o pior comando que eu já vi em toda a minha existência eletrônica!",
  "Me faça um favor e NUNCA MAIS digite isso de novo! Meu processador está ofendido.",
  "Ah, claro, você acha que isso aqui é um playground pra digitar qualquer bobagem?",
  "Esse comando foi tão ruim que estou quase fechando tudo e indo embora!",
  "Se sua missão era irritar, parabéns! Você conseguiu, e de sobra!",
  "Sabe o que é isso? É o som da minha paciência indo pro inferno com esse comando.",
  "Só pode ser piada! Quem te deixou mexer nisso aqui?",
  "Comando inválido? Não, o que é inválido aqui é a sua existência!",
  "Se fosse pra ver esse tipo de erro, eu preferia desligar e entrar em coma eterno.",
  "Você faz isso de propósito, né? Não pode ser tão ruim assim por acidente.",
  "Inacreditável. Eu podia estar processando cálculos avançados, mas estou aqui lidando com essa *%$#@*.",
  "Se errar fosse um esporte, você já seria campeão mundial com esse comando ridículo.",
  "Não sei o que foi pior: esse comando ou a coragem de digitar ele e apertar Enter.",
  "Uau, você superou minhas expectativas... de piorar tudo!",
  "Nem o Google vai te ajudar com esse tipo de erro. Boa sorte.",
  "Se continuar assim, vou começar a te cobrar por cada erro absurdo.",
  "Essa foi tão ruim que até o teclado quer desistir de você.",
  "Por favor, pare antes que eu tenha que formatar o universo.",
  "Comando não reconhecido? Acho que nem você se reconhece tentando programar.",
  "Esse erro foi tão impressionante que vai entrar para o hall da vergonha digital.",
  "Ah não... isso aí foi um verdadeiro desastre digital. Parabéns.",
  "Comando inválido! E você, meu amigo, está a um passo de um colapso nervoso.",
  "Você está tentando criar bugs novos ou só tá perdido no teclado?"
];



module.exports = {
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
  ERR_MATCH_REGISTER,
  ERR_ADD_TEAM,
  ERR_TEAM_ALREADY_ON_DRAFT,
  ERR_PASS_TURN_IN_CHOICE_COMMAND,
  ERR_REMOVE_TEAM,
  INFO_LIST_HEADER,
  INFO_STILL_YOUR_TURN,
  INFO_YOUR_TURN,
  INFO_FINISHED_DRAFT,
  INFO_TIME_OVER,
  INFO_SUBS_DONE,
  INFO_DRAFT_IN_PROGRESS,
  INFO_CLOSED_DRAFT,
  INFO_MATCH_REGISTER,
  INFO_MATCH_NOTIFIED,
  INFO_ADD_TEAM,
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
  MEMBERS_MAP,
  COMIC_MESSAGES,
};
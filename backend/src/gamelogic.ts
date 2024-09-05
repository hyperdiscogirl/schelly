import admin, { database } from 'firebase-admin';
import { Choice, Option, Player, Round, Sacrifice, SessionState } from '../../sharedTypes';



const defaultOptions: Option[] = [
	{emoji: "🧪", str: "test tube"},
	{emoji: "👆", str: 'finger up'},
	{emoji: '📝', str: "note"},
	{emoji: '⚙️', str: "gear"},
	{emoji: '⚡️', str: 'lightning'},
	{emoji: '🤖', str: 'robot'}
]

function randomChoice(player: Player, options: Option[]) {
	return {
		player: player,
		option: options[Math.floor(Math.random() * options.length)],
		wasRandom: true}
}

export function MakeChoice(db: admin.database.Database, sessionId, choice: Choice) {
	let sessionState = db.ref(`sessions/${sessionId}`)
	sessionState.transaction((game: SessionState) => {
		const curSacrifice = game.sacrifices![game.sacrifices!.length - 1]
		const curRound = curSacrifice.rounds[curSacrifice.rounds.length - 1]
		curRound.choices.push(choice)
	})
}

export function JudgeRound(round: Round, sesstionState: SessionState) {
	if (sesstionState.sacrifices !== undefined) {
		const win = round.choices.reduce((acc, choice) => {
			return acc && choice.option.emoji == round.choices[0].option.emoji
		}, true)
		const moreSacrifices = sesstionState.sacrifices.length < sesstionState.settings.numSacrifices  //
		return {
			wasWin: win,
			moreSacrifices: moreSacrifices
		}
	}
	throw Error("bro, this should never be undefined here wtf")
}

export function GenerateNewSacrifice(): Sacrifice {
	return {rounds: [{options: defaultOptions, choices: []}]}
}

export function GenerateNewRound(prevRound: Round): Round {
	return {options: defaultOptions, choices: []}
}

export function FillMissingChoices(round: Round, players: Player[]): Round {
    // Create a set of player IDs who have already made a choice
    const playersWithChoices = new Set(round.choices.map(choice => choice.player.id));
    
    // Iterate over all players to see if they are missing in the round
    players.forEach(player => {
        if (!playersWithChoices.has(player.id)) {
            // If the player hasn't made a choice, create a random choice for them
            const choice = randomChoice(player, round.options);
            round.choices.push(choice);
        }
    });

    return round;
}

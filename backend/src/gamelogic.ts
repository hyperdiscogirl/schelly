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
	console.log('randomChoice called with player:', player)
	return {
		player: player,
		option: options[Math.floor(Math.random() * options.length)],
		wasRandom: true}
}

export async function MakeChoice(db: admin.database.Database, sessionId, choice: Choice) {
	console.log('makeChoice called with data:', choice, sessionId)
	let sessionState = db.ref(`sessions/${sessionId}`)
	try {
		const result = await sessionState.transaction((sessionState: SessionState) => {
			console.log('sessionState in transaction:', sessionState)
			if (sessionState === null) {
				console.log('in make choice transaction, sessionState is null')
				return null
			}

			if (sessionState.sacrifices === undefined) {
				throw new Error('sessionState.sacrifices undefiened in make choice, GET FUCKED, WTF')
			}
			console.log("make choice transaction, all is beautiful and lovely")
			const curSacrifice = sessionState.sacrifices[sessionState.sacrifices!.length - 1] 
			const curRound = curSacrifice.rounds[curSacrifice.rounds.length - 1]
			if (curRound.choices) {
				let changedChoice = false
				curRound.choices.forEach(c => {
					if (c.player.id === choice.player.id) {
						c.option = choice.option
						changedChoice = true
					}
				})
				if (!changedChoice) {
					curRound.choices.push(choice)
				}
			} else {
				curRound.choices = [choice]
			}
			
			return sessionState
	})
		if (result.committed) {
			console.log('makeChoice transaction committed');
		} else {
			console.error('makeChoice transaction failed');
		}
	} catch (error) {
		console.error('Error making choice:', error);
	}

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

const sacrificeOptions: Option[][] = [
	[
		{emoji: "🍎", str: "apple"},
		{emoji: "🍌", str: "banana"},
		{emoji: "🍇", str: "grapes"},
		{emoji: "🍊", str: "orange"},
		{emoji: "🍓", str: "strawberry"},
		{emoji: "🥝", str: "kiwi"}
	],
	[
		{emoji: "🐶", str: "dog"},
		{emoji: "🐱", str: "cat"},
		{emoji: "🐰", str: "rabbit"},
		{emoji: "🐠", str: "fish"},
		{emoji: "🐦", str: "bird"},
		{emoji: "🐢", str: "turtle"}
	],
	[
		{emoji: "🚗", str: "car"},
		{emoji: "🚲", str: "bicycle"},
		{emoji: "🚂", str: "train"},
		{emoji: "✈️", str: "airplane"},
		{emoji: "🚢", str: "ship"},
		{emoji: "🚁", str: "helicopter"}
	]
]

export function GenerateNewSacrifice(): Sacrifice {
	const randomOptionsSet = sacrificeOptions[Math.floor(Math.random() * sacrificeOptions.length)];
	return {rounds: [{options: randomOptionsSet, choices: []}]}
}

export function GenerateNewRound(prevRound: Round): Round {
	const randomOptionsSet = sacrificeOptions[Math.floor(Math.random() * sacrificeOptions.length)];
	return {options: randomOptionsSet, choices: []}
}

export function LastRound(sessionState: SessionState): Round {
	return sessionState.sacrifices![sessionState.sacrifices!.length - 1].rounds[sessionState.sacrifices![sessionState.sacrifices!.length - 1].rounds.length - 1]
}

export function FillMissingChoices(round: Round, players: Player[]): Round {
	console.log('Filling missing choices called for round:', round)
	//check if no players have made a choice
	if (round.choices === undefined) {
		console.log('round.choices is undefined')
		round.choices = []
		players.forEach(player => {
			const choice = randomChoice(player, round.options);
            round.choices.push(choice);
		});
		console.log('round with no player choices:', round)
		return round
	}
	// Create a set of player IDs who have already made a choice
    const playersWithChoices = new Set(round.choices.map(choice => choice.player.id));
	console.log('playersWithChoices:', playersWithChoices)
	console.log('round.choices:', round.choices.length)
    
    // Iterate over all players to see if they are missing in the round
    players.forEach(player => {
        if (!playersWithChoices.has(player.id)) {
            // If the player hasn't made a choice, create a random choice for them
            const choice = randomChoice(player, round.options);
            round.choices.push(choice);
        } 
    }); 

	console.log('round with partial choices:', round)

    return round;
}

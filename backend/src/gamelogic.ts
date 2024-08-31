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
		option: options[Math.floor(Math.random() * options.length)]}
}

export function MakeChoice(db: admin.database.Database, sessionId, choice: Choice) {
	let sessionState = db.ref(`sessions/${sessionId}`)
	sessionState.transaction((game: SessionState) => {
		const curSacrifice = game.sacrifices![game.sacrifices!.length - 1]
		const curRound = curSacrifice.rounds[curSacrifice.rounds.length - 1]
		curRound.choices.push(choice)
	})
}


function judgeRound(round: Round, sesstionState: SessionState) {
	if (sesstionState.sacrifices !== undefined) {
		const win = round.choices.reduce((acc, choice) => {
			return acc && choice.option.emoji == round.choices[0].option.emoji
		},
		true)
		const moreSacrifices = sesstionState.sacrifices.length < sesstionState.settings.numSacrifices  //
		if (win && moreSacrifices) {
			const sacrifice = generateNewSacrifice()
			sesstionState.sacrifices.push(sacrifice)
		}
		if (!win) {
			const nextRound = generateNewRound(round)
			sesstionState.sacrifices[sesstionState.sacrifices.length - 1].rounds.push(nextRound)
		}
		return {
			sesstionState: sesstionState,
			wasWin: win,
			moreSacrifices: moreSacrifices
		}
	}
	throw Error("bro, this should never be undefined here wtf")
}

function generateNewSacrifice(): Sacrifice {
	return {rounds: [{options: defaultOptions, choices: []}]}
}

function generateNewRound(prevRound: Round): Round {
	return {options: defaultOptions, choices: []}
}

function RoundTimerCallback(sessionId) {
	//if anyone is missing, make random choice for them. 
}
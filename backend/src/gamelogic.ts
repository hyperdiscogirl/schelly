import admin, { database } from 'firebase-admin';
import { Choice, Option, Player, SessionState } from '../../sharedTypes';



function randomChoice(player: Player, options: Option[]) {
	return {
		player: player,
		option: options[Math.floor(Math.random() * options.length)]}
}

function makeChoice(db: admin.database.Database, sessionId, choice: Choice) {
	let sessionState = db.ref(`sessions/${sessionId}`)
	sessionState.transaction((game: SessionState) => {
		const curSacrifice = game.sacrifices![game.sacrifices!.length - 1]
		const curRound = curSacrifice.rounds[curSacrifice.rounds.length - 1]
		curRound.choices.push(choice)
	})
}
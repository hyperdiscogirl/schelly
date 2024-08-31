export interface Player {
	id: string;
	name: string;
}

export interface Option {
	emoji: string;
	str: string;
}

export interface Choice {
	option: Option;
	player: Player;
}

export interface Round {
	options: Option[]
	choices: Choice[]
}

export interface Sacrifice {
	rounds: Round[]
}

export interface GameSettings {
	maxTrys: number;
	numSacrifices: number;
	roundTimeLimit: number;
}

export interface SessionState {
	players: Player[];
	admin: Player;
	settings: GameSettings;
	sessionId: number;
	sessionName: string;
	sessionStarted: boolean;
	sacrifices?: Sacrifice[];
}
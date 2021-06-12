import {Magical_Trap} from "./challenges/magical_trap";
import {Dragon} from "./challenges/dragon";
import {Full_Party_Doom} from "./challenges/doomroom";
import {Challenge} from "./core";
import * as Characters from "./character";

const Challenges = [Magical_Trap, Dragon, Full_Party_Doom];

export function getRandomChallenge(): Challenge {
	return Challenges[Math.floor(Math.random() * (Challenges.length + 1))];
}

export function doomCountdown(): boolean {
	let party_alive = false;

	if (Characters.Fighter.HP  > 0 && !Characters.Fighter.countdownToDoom() ) party_alive = true;
	if (Characters.Ranger.HP   > 0 && !Characters.Ranger.countdownToDoom()  ) party_alive = true;
	if (Characters.Thinker.HP  > 0 && !Characters.Thinker.countdownToDoom() ) party_alive = true;
	if (Characters.Tinkerer.HP > 0 && !Characters.Tinkerer.countdownToDoom()) party_alive = true;

	return party_alive;
}

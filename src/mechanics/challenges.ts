import {Magical_Trap} from "./challenges/magical_trap";
import {Dragon} from "./challenges/dragon";
import {Challenge} from "./core";

const Challenges = [Magical_Trap, Dragon];

export function getRandomChallenge(): Challenge {
	return Challenges[Math.floor(Math.random() * (Challenges.length + 1))];
}

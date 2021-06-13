import {Yellow_Dragon} from "./challenges/yellow_dragon";
import {Purple_Dragon} from "./challenges/purple_dragon";
import {Full_Party_Doom} from "./challenges/doomroom";
import {Challenge} from "./core";
import * as Characters from "./character";
import * as KeyRoom from "./challenges/keyroom";
import {Red_Dragon} from "./challenges/red_dragon";
import {Blue_Dragon} from "./challenges/blue_dragon";
import {Green_Dragon} from "./challenges/green_dragon";
import {Red_Ooze} from "./challenges/red_ooze";
import {Yellow_Ooze} from "./challenges/yellow_ooze";
import {Blue_Ooze} from "./challenges/blue_ooze";
import {Green_Ooze} from "./challenges/green_ooze";

const Challenges = [Yellow_Dragon, Red_Dragon, Blue_Dragon, Green_Dragon, Purple_Dragon
	, Yellow_Ooze, Red_Ooze, Blue_Ooze, Green_Ooze
];
export const KeyRooms =
	[KeyRoom.WoodenKeyRoom
		, KeyRoom.CopperKeyRoom
		, KeyRoom.BrassKeyRoom
		, KeyRoom.BronzeKeyRoom
		, KeyRoom.SilverKeyRoom
		, KeyRoom.GoldenKeyRoom
		, KeyRoom.PlatinumKeyRoom
	];

export function getRandomChallenge(): Challenge {
	return Challenges[0];
}

export function doomCountdown(): boolean {
	let party_alive = false;

	if (Characters.Fighter.HP > 0 && !Characters.Fighter.countdownToDoom()) party_alive = true;
	if (Characters.Ranger.HP > 0 && !Characters.Ranger.countdownToDoom()) party_alive = true;
	if (Characters.Thinker.HP > 0 && !Characters.Thinker.countdownToDoom()) party_alive = true;
	if (Characters.Tinkerer.HP > 0 && !Characters.Tinkerer.countdownToDoom()) party_alive = true;

	return party_alive;
}

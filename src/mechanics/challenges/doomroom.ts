import * as Characters from "../character";
import * as Core from "../core";
import {ActionResult} from "../core";

let strength_result: Core.ActionResult =
{ damage: 0
, resolution: "A curse is unleashed in the room, dooming every goblin to die after five challenges."
};

let precision_result: Core.ActionResult =
{ damage: 0
, resolution: "A curse is unleashed in the room, dooming every goblin to die after five challenges."
};

let smarts_result: Core.ActionResult =
{ damage: 0
, resolution: "A curse is unleashed in the room, dooming every goblin to die after five challenges."
};

let craft_result: Core.ActionResult =
{ damage: 0
, resolution: "A curse is unleashed in the room, dooming every goblin to die after five challenges."
};

let image_loc  : string = "data/challenges/full_party_doom.png";
let description: string = "The room appears to be empty, but sinister aura seems to fill every shadow.";

class Full_Party_Doom_Room extends Core.Challenge {
	constructor
	( strength_result : ActionResult
	, precision_result: ActionResult
	, smarts_result   : ActionResult
	, craft_result    : ActionResult
	, image_location  : string
	, description	  : string
	) {
		super(strength_result, precision_result, smarts_result, craft_result, image_location, description);
	}

	private static doomEveryone(time_to_doom: number): void {
		if (Characters.Fighter.HP  > 0) Characters.Fighter.setDoom(time_to_doom);
		if (Characters.Ranger.HP   > 0) Characters.Ranger.setDoom(time_to_doom);
		if (Characters.Thinker.HP  > 0) Characters.Thinker.setDoom(time_to_doom);
		if (Characters.Tinkerer.HP > 0) Characters.Tinkerer.setDoom(time_to_doom);
	}

	getResult(skill: Core.Skill): ActionResult {
		Full_Party_Doom_Room.doomEveryone(5);
		return super.getResult(skill);
	}
}

export const Full_Party_Doom = new Full_Party_Doom_Room(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

export function doomOneCharacter(time_to_doom: number, character: Characters.Character): void {
	if (character.HP > 0) character.setDoom(time_to_doom);
}

export function doomCountdown(): boolean {
	let party_alive = false;

	if (Characters.Fighter.HP  > 0 && !Characters.Fighter.countdownToDoom() ) party_alive = true;
	if (Characters.Ranger.HP   > 0 && !Characters.Ranger.countdownToDoom()  ) party_alive = true;
	if (Characters.Thinker.HP  > 0 && !Characters.Thinker.countdownToDoom() ) party_alive = true;
	if (Characters.Tinkerer.HP > 0 && !Characters.Tinkerer.countdownToDoom()) party_alive = true;

	return party_alive;
}

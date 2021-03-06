/**
 * Challenge template file. Copy this and change into a new challenge.
 */

import * as Core from "../core";
import {SpriteName} from "../../ui/sprites";

let strength_result: Core.ActionResult =
{ damage: 3
, resolution: "The goblin delivers magnificent blow killing ooze with one hit. However, toxic matter from ooze spews onto the goblin"
};

let precision_result: Core.ActionResult =
{ damage: 0
, resolution: "The goblin shoots the hole and water bursts out, sweeping the ooze into a crack in the floor."
};

let smarts_result: Core.ActionResult =
{ damage: 0
, resolution: "The goblin pours water on the ground. Ooze naturally starts to follow where water goes."
};

let craft_result: Core.ActionResult =
{ damage: 2
, resolution: "The goblin closes carefully ooze and smashes it. Sadly, not careful enough as some ooze matter touches the goblins skin."
};

let image_loc  : SpriteName = SpriteName.BLUE_OOZE;
let description: string = "A pool of blue ooze sits in the middle of the room. There's water dripping from a hole on the ceiling.";

export const Blue_Ooze = new Core.Challenge(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

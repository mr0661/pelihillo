/**
 * Challenge template file. Copy this and change into a new challenge.
 */

import * as Core from "../core";
import {SpriteName} from "../../ui/sprites";

let strength_result: Core.ActionResult =
{ damage: 1
, resolution: "Strong pushes to ooze seem to be enough to move ooze far enough so it is no longer a threat. It tickles."
};

let precision_result: Core.ActionResult =
{ damage: 2
, resolution: "Shooting ooze into vital spot seemed like good idea, but it just caused it to explode. Luckily you did not use more force than that."
};

let smarts_result: Core.ActionResult =
{ damage: 3
, resolution: "The goblin throws magical energy to ooze. Ooze blows up in huge explosion."
};

let craft_result: Core.ActionResult =
{ damage: 0
, resolution: "The goblin dug a ditch to direct the ooze into a hole. The ooze is unable to fight against the slope of the ditch."
};

let image_loc: SpriteName = SpriteName.GREEN_OOZE;
let description: string = "A pool of green ooze sits in the middle of the room. It doesn't seem to be able to hold itself together and move.";

export const Green_Ooze = new Core.Challenge(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

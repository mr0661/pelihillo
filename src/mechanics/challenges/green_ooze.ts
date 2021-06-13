/**
 * Challenge template file. Copy this and change into a new challenge.
 */

import * as Core from "../core";
import {SpriteName} from "../../ui/sprites";

let strength_result: Core.ActionResult =
{ damage: 1
, resolution: "TODO"
};

let precision_result: Core.ActionResult =
{ damage: 2
, resolution: "TODO"
};

let smarts_result: Core.ActionResult =
{ damage: 3
, resolution: "TODO"
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

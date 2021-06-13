/**
 * Challenge template file. Copy this and change into a new challenge.
 */

import * as Core from "../core";
import {SpriteName} from "../../ui/sprites";

let strength_result: Core.ActionResult =
{ damage: 2
, resolution: "TODO"
};

let precision_result: Core.ActionResult =
{ damage: 3
, resolution: "TODO"
};

let smarts_result: Core.ActionResult =
{ damage: 0
, resolution: "The goblin blasts the ooze with a fire ball, destroying it."
};

let craft_result: Core.ActionResult =
{ damage: 1
, resolution: "TODO"
};

let image_loc: SpriteName = SpriteName.YELLOW_OOZE;
let description: string = "A pool of yellow ooze sits in the middle of the room. It seems to resist physical damage.";

export const Yellow_Ooze = new Core.Challenge(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

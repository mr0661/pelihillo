/**
 * Challenge template file. Copy this and change into a new challenge.
 */

import * as Core from "../core";

let strength_result: Core.ActionResult =
{ damage: 0
, resolution: "TODO"
};

let precision_result: Core.ActionResult =
{ damage: 1
, resolution: "TODO"
};

let smarts_result: Core.ActionResult =
{ damage: 2
, resolution: "TODO"
};

let craft_result: Core.ActionResult =
{ damage: 3
, resolution: "TODO"
};

let image_loc  : string = "data/challenges/ooze.png";
let description: string = "A pool of red ooze sits in the middle of the room, its core close to the surface.";

export const Red_Ooze = new Core.Challenge(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

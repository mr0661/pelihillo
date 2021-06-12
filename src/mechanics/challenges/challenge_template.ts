/**
 * Challenge template file. Copy this and change into a new challenge.
 */

import * as Core from "../core";

let strength_result: Core.ActionResult =
{ damage: 10
, resolution: "TODO"
};

let precision_result: Core.ActionResult =
{ damage: 10
, resolution: "TODO"
};

let smarts_result: Core.ActionResult =
{ damage: 10
, resolution: "TODO"
};

let craft_result: Core.ActionResult =
{ damage: 10
, resolution: "TODO"
};

let image_loc  : string = "data/challenges/CHALLENGE.png";
let description: string = "TODO";

/* Rename CHALLENGE to challenge name */
export let CHALLENGE = new Core.Challenge(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

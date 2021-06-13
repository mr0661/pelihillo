/**
 * Challenge template file. Copy this and change into a new challenge.
 */

import * as Core from "../core";
import {SpriteName} from "../../ui/sprites";

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

let image_loc  : SpriteName = SpriteName.ENEMY_QUESTIONABLE;
let description: string = "TODO";

/* Rename CHALLENGE to challenge name */
export let CHALLENGE = new Core.Challenge(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

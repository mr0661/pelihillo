/**
 * Challenge template file. Copy this and change into a new challenge.
 */

import * as Core from "../core";
import {SpriteName} from "../../ui/sprites";

let strength_result: Core.ActionResult =
{ damage: 2
, resolution: "Touching ooze with the weapon seems to backfire as ooze quickly start to move though the weapon it and burns the goblins skin. After much running and hitting, ooze dies."
};

let precision_result: Core.ActionResult =
{ damage: 3
, resolution: "Good shot into ooze doesn't seem to do anything. Ooze advances towards the goblin. After much running and screaming, ooze no longer moves."
};

let smarts_result: Core.ActionResult =
{ damage: 0
, resolution: "The goblin blasts the ooze with a fire ball, destroying it."
};

let craft_result: Core.ActionResult =
{ damage: 1
, resolution: "Goblin starts to close in the Ooze. Ooze spits at goblin burning its skip. The goblin takes from their blanket and throws it over the ooze. Ooze doesn't seem aggressive any more."
};

let image_loc: SpriteName = SpriteName.YELLOW_OOZE;
let description: string = "A pool of yellow ooze sits in the middle of the room. It seems to resist physical damage.";

export const Yellow_Ooze = new Core.Challenge(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

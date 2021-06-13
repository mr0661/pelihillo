/**
 * Challenge template file. Copy this and change into a new challenge.
 */

import * as Core from "../core";
import {SpriteName} from "../../ui/sprites";

let strength_result: Core.ActionResult =
{ damage: 0
, resolution: "The goblin hits ooze with all its might. Ooze vanishes around the room."
};

let precision_result: Core.ActionResult =
{ damage: 0
, resolution: "Precise hit into the red oozes beating heart seems to dissolve it immediately."
};

let smarts_result: Core.ActionResult =
{ damage: 4
, resolution: "The goblin starts its incantations, but suddenly seems extremely weak, while ooze seems to grow. Any magic seems to feed it. The goblin decides to keep building up magical energy until ooze blows up. The goblin seems really weak after this."
};

let craft_result: Core.ActionResult =
{ damage: 4
, resolution: "The goblin approaches ooze carefully with small cage build out of scrap material. When the goblin is close to the ooze, it swallows goblin as a whole. After huge struggle goblin manages to escape and leave ooze inside the cage."
};

let image_loc: SpriteName = SpriteName.RED_OOZE;
let description: string = "A pool of red ooze sits in the middle of the room, its core close to the surface. There is odd beating sound coming from inside it.";

export const Red_Ooze = new Core.Challenge(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

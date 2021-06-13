import * as Core from "../core";
import {SpriteName} from "../../ui/sprites";

let strength_result: Core.ActionResult =
{ damage: 10
, resolution: "The goblin didn't stand a chance against the dragon's magic and died. The dragon got bored and left."
};

let precision_result: Core.ActionResult =
{ damage: 7
, resolution: "TODO"
};

let smarts_result: Core.ActionResult =
{ damage: 2
, resolution: "The goblin was able to harness the magical energies to kill the dragon, but his body got damaged from the wild power."
};

let craft_result: Core.ActionResult =
{ damage: 5
, resolution: "TODO"
};

let image_loc  : SpriteName = SpriteName.BLUE_DRAGON;
let description: string = "The party encounters a formidable blue dragon. There's an abundance of magical energies swirling around the room.";

export const Blue_Dragon = new Core.Challenge(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

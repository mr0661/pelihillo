import * as Core from "../core";
import {SpriteName} from "../../ui/sprites";

let strength_result: Core.ActionResult =
{ damage: 2
, resolution: "The dragon was imposing, but surprisingly weak. The goblin was able to defeat him with minor wounds."
};

let precision_result: Core.ActionResult =
{ damage: 5
, resolution: "The goblin was able to shoot out the dragon's eyes, but got a face full of dragon's breath for his efforts."
};

let smarts_result: Core.ActionResult =
{ damage: 10
, resolution: "The dragon ate half of the goblin, and left the room after having his fill."
};

let craft_result: Core.ActionResult =
{ damage: 7
, resolution: "The goblin was able to build a trap around the dragon and cage it, but was severely wounded in the process."
};

let image_loc: SpriteName = SpriteName.GREEN_DRAGON;
let description: string = "The party encounters an imposing green dragon. The magical energy of the room feels drained.";

export const Green_Dragon = new Core.Challenge(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

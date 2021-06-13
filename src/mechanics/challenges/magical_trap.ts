import * as Core from "../core";
import {SpriteName} from "../../ui/sprites";

let strength_result: Core.ActionResult =
{ damage: 10
, resolution: "The blunt force of the trap is absorbed by the goblin, making the room safe."
};

let precision_result: Core.ActionResult =
{ damage: 2
, resolution: "TODO"
};

let smarts_result: Core.ActionResult =
{ damage: 0
, resolution: "TODO"
};

let craft_result: Core.ActionResult =
{ damage: 5
, resolution: "TODO"
};

let image_loc: SpriteName = SpriteName.MAGICAL_TRAP;
let description: string = "The party is faced with a strange device, emitting dangerous magical energy.";

export const Magical_Trap = new Core.Challenge(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

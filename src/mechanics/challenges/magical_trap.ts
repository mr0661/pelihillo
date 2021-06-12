import * as Core from "../core";

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

let image_loc  : string = "data/challenges/magical_trap.png";
let description: string = "The party is faced with a strange device, emitting dangerous magical energy.";

export let Magical_Trap = new Core.Challenge(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

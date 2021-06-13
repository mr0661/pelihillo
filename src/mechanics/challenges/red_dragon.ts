import * as Core from "../core";

let strength_result: Core.ActionResult =
{ damage: 7
, resolution: "The goblin battles bravely against the dragon and is able to subdue her, but is severely wounded."
};

let precision_result: Core.ActionResult =
{ damage: 2
, resolution: "The goblin was able to shoot an arrow into the dragon's weak spot, killing her with only minor wounds."
};

let smarts_result: Core.ActionResult =
{ damage: 5
, resolution: "The goblin outsmarted the dragon by having her breathe fire on the weak spot, but suffered moderate wounds from the efforts."
};

let craft_result: Core.ActionResult =
{ damage: 10
, resolution: "The goblin was able to collapse the ceiling on the dragon, but was also buried."
};

let image_loc  : string = "data/challenges/dragon.png";
let description: string = "The party encounters a fearsome red dragon. A scale can be seen missing from the dragon's body.";

export const Red_Dragon = new Core.Challenge(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

import * as Core from "../core";
import {SpriteName} from "../../ui/sprites";

let strength_result: Core.ActionResult =
{ damage: 5
, resolution: "The goblin utilizes dragons weakness by attacking only from one side. Battle is fierce, but eventually dragon draws its last breath."
};

let precision_result: Core.ActionResult =
{ damage: 10
, resolution: "The goblin aims and releases. However, dragons scales are not that easily pierced. The fate of the goblin is sealed. Others decide to move forward while dragon is distracted."
};

let smarts_result: Core.ActionResult =
{ damage: 7
, resolution: "The goblin challenged the dragon to a chess match, and won. The dragon was a sore loser. Goblin got badly damaged."
};

let craft_result: Core.ActionResult =
{ damage: 2
, resolution: "After initial aggression, the goblin built a splint for the dragon's leg. The dragon left happily."
};

let image_loc: SpriteName = SpriteName.YELLOW_DRAGON;
let description: string = "The party encounters a terrifying yellow dragon. The dragon seems to be keeping weight off of one leg.";

export const Yellow_Dragon = new Core.Challenge(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

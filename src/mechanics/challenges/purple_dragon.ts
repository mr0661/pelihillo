import * as Core from "../core";
import {SpriteName} from "../../ui/sprites";

let strength_result: Core.ActionResult =
{ damage: 10
, resolution: "The goblin didn't stand a chance against the pure chaos dragon emits. Dragon grabbed the goblin and left to eat it in peace."
};

let precision_result: Core.ActionResult =
{ damage: 0
, resolution: "Careful shot land behind the dragon, and dragon thinks there is something significant behind it and leaves."
};

let smarts_result: Core.ActionResult =
{ damage: 5
, resolution: "The goblin challenges dragon to duel of wits. Dragon is not amused for losing to a mere goblin and spews chaos energy into the goblin before leaving."
};

let craft_result: Core.ActionResult =
{ damage: 0
, resolution: "The goblins shows gadget it has made to the dragon. Pure logical nature of the structure kills this chaotic dragon."
};

let image_loc  : SpriteName = SpriteName.PURPLE_DRAGON;
let description: string = "The party encounters a formidable purple dragon. There's an abundance of chaos energies swirling around the room.";

export const Purple_Dragon = new Core.Challenge(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

import * as Core from "../core";
import {SpriteName} from "../../ui/sprites";

let strength_result: Core.ActionResult =
	{ damage: 4
		, resolution: "Unable to do anything against ghost spider, spider simply feeds and leaves."
	};

let precision_result: Core.ActionResult =
	{ damage: 4
		, resolution: "Unable to do anything against ghost spider, spider simply feeds and leaves."
	};

let smarts_result: Core.ActionResult =
	{ damage: 1
		, resolution: "Unable to do anything against ghost spider, spider simply feeds and leaves. Luckily, this goblin has strong spirit."
	};

let craft_result: Core.ActionResult =
	{ damage: 4
		, resolution: "Unable to do anything against ghost spider, spider simply feeds and leaves."
	};

let image_loc: SpriteName = SpriteName.GHOST_SPIDER;
let description: string = "The party sees, barely ghost spider. It want to feed on goblin soul!";

export const GhostSpider = new Core.Challenge(
	strength_result, precision_result, smarts_result, craft_result, image_loc, description
);

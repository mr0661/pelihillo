import * as Core from "./core";
import {Magical_Trap} from "./challenges/magical_trap";

export const Challenges = [Magical_Trap];

export class Dragon extends Core.Challenge {
strength_result:
	{ damage: 7
	, resolution: "The goblin battles bravely against the dragon and is able to subdue her, but is severely wounded."
	};
precision_result:
	{ damage: 2
	, resolution: "The goblin was able to shoot an arrow into the dragon's weak spot, killing her with only minor wounds."
	};
smarts_result:
	{ damage: 5
	, resolution: "The goblin outsmarted the dragon by having her breathe fire on the weak spot, but suffered moderate wounds from the efforts."
	};
craft_result:
	{ damage: 10
	, resolution: "The goblin was able to collapse the ceiling on the dragon, but was also buried."
	};
}

// What skills the characters have that can be used to resolve the obstacle
export enum Skill
{ None
, Strength
, Precision
, Smarts
, Craft
}

export interface ActionResult {
	damage: number;
	resolution: string;
}

export class Challenge {
	strength_result:  ActionResult;
	precision_result: ActionResult;
	smarts_result:    ActionResult;
	craft_result:     ActionResult;

	image: string; // Path to image? TODO: How are we determining images?

	constructor
	( strength_result : ActionResult
	, precision_result: ActionResult
	, smarts_result   : ActionResult
	, craft_result    : ActionResult
	, image           : string
	) {
		this.strength_result  = strength_result;
		this.precision_result = precision_result;
		this.smarts_result    = smarts_result;
		this.craft_result     = craft_result;
		this.image			  = image;
	}

	getResult(skill: Skill): ActionResult {
		switch (skill) {
			case Skill.Strength : return this.strength_result;
			case Skill.Precision: return this.precision_result;
			case Skill.Smarts   : return this.smarts_result;
			case Skill.Craft    : return this.craft_result;
		}
	}
}



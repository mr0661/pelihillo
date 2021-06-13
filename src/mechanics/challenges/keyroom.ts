/**
 * Challenge template file. Copy this and change into a new challenge.
 */

import * as Core from "../core";
import {ActionResult, Keys_Obtained} from "../core";
import {SpriteName} from "../../ui/sprites";

let unused_result: Core.ActionResult =
{ damage: 0
, resolution: "not in use"
};

interface KeyName {
	key: Core.Key;
	name: string;
}

let wooden_image_loc  : SpriteName = SpriteName.ENEMY_QUESTIONABLE;
let copper_image_loc  : SpriteName = SpriteName.ENEMY_QUESTIONABLE;
let brass_image_loc   : SpriteName = SpriteName.ENEMY_QUESTIONABLE;
let bronze_image_loc  : SpriteName = SpriteName.ENEMY_QUESTIONABLE;
let silver_image_loc  : SpriteName = SpriteName.ENEMY_QUESTIONABLE;
let golden_image_loc  : SpriteName = SpriteName.ENEMY_QUESTIONABLE;
let platinum_image_loc: SpriteName = SpriteName.ENEMY_QUESTIONABLE;

let wooden_description  : string = "TODO";
let copper_description  : string = "TODO";
let brass_description   : string = "TODO";
let bronze_description  : string = "TODO";
let silver_description  : string = "TODO";
let golden_description  : string = "TODO";
let platinum_description: string = "TODO";

class KeyRoom extends Core.Challenge {
	readonly KeyName: KeyName;

	constructor
	( strength_result : ActionResult
	, precision_result: ActionResult
	, smarts_result   : ActionResult
	, craft_result    : ActionResult
	, image_location  : SpriteName
	, description     : string
	, key             : KeyName
	) {
		super(strength_result, precision_result, smarts_result, craft_result, image_location, description);

		this.KeyName = key;
	}

	getResult(skill: Core.Skill): ActionResult {
		if ((Keys_Obtained.getKey() + 1) >= this.KeyName.key ) {
			Keys_Obtained.setKey(this.KeyName.key);
			return {damage: 0, resolution: "The goblin was able to obtain the " + this.KeyName.name + " key."};
		}

		return {damage: 0, resolution: "The goblin couldn't obtain the " + this.KeyName.name + " key."}
	}
}

export const WoodenKeyRoom = new KeyRoom (
	unused_result, unused_result, unused_result, unused_result, wooden_image_loc, wooden_description,
	{key:Core.Key.Wood, name: "wooden"}
);

export const CopperKeyRoom = new KeyRoom (
	unused_result, unused_result, unused_result, unused_result, copper_image_loc, copper_description,
	{key:Core.Key.Copper, name: "copper"}
);

export const BrassKeyRoom = new KeyRoom (
	unused_result, unused_result, unused_result, unused_result, brass_image_loc, brass_description,
	{key:Core.Key.Brass, name: "brass"}
);

export const BronzeKeyRoom = new KeyRoom (
	unused_result, unused_result, unused_result, unused_result, bronze_image_loc, bronze_description,
	{key:Core.Key.Bronze, name: "bronze"}
);

export const SilverKeyRoom = new KeyRoom (
	unused_result, unused_result, unused_result, unused_result, silver_image_loc, silver_description,
	{key:Core.Key.Silver, name: "silver"}
);
export const GoldenKeyRoom = new KeyRoom (
	unused_result, unused_result, unused_result, unused_result, golden_image_loc, golden_description,
	{key:Core.Key.Gold, name: "golden"}
);

export const PlatinumKeyRoom = new KeyRoom (
	unused_result, unused_result, unused_result, unused_result, platinum_image_loc, platinum_description,
	{key:Core.Key.Platinum, name: "platinum"}
);

import {Skill} from "./core";

export class Character {
	readonly primarySkill: Skill;
	readonly secondarySkill: Skill;
	HP: number;

	constructor(primary: Skill, secondary: Skill) {
		this.primarySkill   = primary;
		this.secondarySkill = secondary;
		this.HP = 10;
	}
}

export let Fighter  = new Character(Skill.Strength , Skill.Craft    );
export let Rogue    = new Character(Skill.Precision, Skill.Strength );
export let Thinker  = new Character(Skill.Smarts   , Skill.Precision);
export let Tinkerer = new Character(Skill.Craft    , Skill.Smarts   );

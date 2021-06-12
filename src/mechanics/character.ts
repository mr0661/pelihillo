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


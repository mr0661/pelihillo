import {Skill} from "./core";

export class Character {
	readonly Skill: Skill;
	HP: number;
	doom_track?: number;

	constructor(skill: Skill) {
		this.Skill   = skill;
		this.HP = 10;
	}

	setDoom(counter: number): void {
		this.doom_track = counter;
	}

	getDoom(): string {
		if (this.doom_track == undefined) return "Not doomed yet.";
		return this.doom_track + " steps until DOOM!";
	}

	countdownToDoom(): boolean {
		if (this.doom_track == undefined) return false;

		--this.doom_track;
		return (this.doom_track == 0);
	}
}

export let Fighter  = new Character(Skill.Strength );
export let Rogue    = new Character(Skill.Precision);
export let Thinker  = new Character(Skill.Smarts   );
export let Tinkerer = new Character(Skill.Craft    );

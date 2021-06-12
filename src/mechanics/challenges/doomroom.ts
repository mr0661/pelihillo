import * as Characters from "../character";

export function doomEveryone(time_to_doom: number): void {
	if (Characters.Fighter.HP  > 0) Characters.Fighter.setDoom(time_to_doom);
	if (Characters.Ranger.HP   > 0) Characters.Ranger.setDoom(time_to_doom);
	if (Characters.Thinker.HP  > 0) Characters.Thinker.setDoom(time_to_doom);
	if (Characters.Tinkerer.HP > 0) Characters.Tinkerer.setDoom(time_to_doom);
}

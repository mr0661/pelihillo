import * as Characters from "./character";
import * as Challenge from "./challenges";
import * as Core from "./core";
import * as UI from "../ui/ui_def";
import {AnimationObject} from "../ui/animation";
import {TextDisplayObject} from "../ui/interface";

export function resetCharacters(): void {
	Characters.Fighter.resetCharacter();
	Characters.Ranger.resetCharacter();
	Characters.Thinker.resetCharacter();
	Characters.Tinkerer.resetCharacter();
}

/* Resolve challenge. Gets the challenge resolution based on character's skill, and makes the character lose
 * HP accordingly.
 *
 * character: chosen character for resolving the challenge.
 * challenge: The challenge that needs to be cleared.
 *
 * returns: challenge resolution explanation to be displayed to the player.
 */
export function resolveChallenge(character: Characters.Character, challenge: Core.Challenge): string {
	let result = challenge.getResult(character.Skill);
	character.loseHP(result.damage);
	return result.resolution;
}

/* Lets the player choose the character that clears the room.
 *
 * currentRoom: the challenge of the room that needs to be cleared
 *
 * callback: called with True if room is cleared successfully (there are still party members alive). False if TPK.
 */
export function clearRoom(currentRoom: Core.Challenge, callback: (boolean) => void): void {

	// Todo: names, proper aliveness check
	const characterNames = [
		new TextDisplayObject("Thinker", "Choose Thinker", Characters.Thinker.HP <= 0),
		new TextDisplayObject("Ranger", "Choose Ranger", Characters.Ranger.HP <= 0),
		new TextDisplayObject("Tinkerer", "Choose Tinkerer", Characters.Tinkerer.HP <= 0),
		new TextDisplayObject("Fighter", "Choose Fighter", Characters.Fighter.HP <= 0)
	];

	const characters = [Characters.Thinker, Characters.Ranger, Characters.Tinkerer, Characters.Fighter];

	const chooseText = "Choose your character:";
	const preText = currentRoom.getDescription();

	UI.ui.display(preText, [], undefined, function(ix: number){
		UI.ui.display(chooseText, characterNames, undefined, function (ix: number) {
			let chosenCharacter = characters[ix];
			let resolutionText = resolveChallenge(chosenCharacter, currentRoom);
			let anim = new AnimationObject();
			anim.action(ix);
			UI.ui.updateCharacterStatus(characters);
			UI.ui.display(resolutionText, [], anim, function (ix: number) {
				// TODO: add check if there are still party members alive
				callback(true);
			});

		});
	});

}

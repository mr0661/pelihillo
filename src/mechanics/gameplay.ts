import * as Characters from "./character";
import * as Challenge from "./challenges";
import * as Core from "./core";

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
 * returns: True if room is cleared successfully (there are still party members alive). False if TPK.
 */
export function clearRoom(currentRoom: Core.Challenge): boolean {
	let chosenCharacter = Characters.Fighter; // TODO: change call to function that allows player to choose character
	let resolutionText = resolveChallenge(chosenCharacter, currentRoom);

	// TODO: display the resolutionText to player

	// TODO: add check if there are still party members alive

	return true;
}

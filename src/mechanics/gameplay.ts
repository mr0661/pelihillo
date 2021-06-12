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

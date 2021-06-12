import {AnimationObject} from "./animation";
import {SpriteName} from "./sprites";

export interface UserInterfaceInterface {

	/**
	 * Display information on UI until user input or another call to display.
	 * Callback on user input.
	 * @param text Text to display in the text box.
	 * @param choices Available choices for player. If empty, choices box is not drawn
	 *                and any input is accepted as "proceed".
	 * @param anim  AnimationObject with animation data. See struct details for options. If none, keep previous.
	 * @param callback Will call this function on user input with the index of the selected choice
	 *                 or 0 if no choices supplied when ready to continue.
	 */
	display(text: string, choices: Array<string>, anim: AnimationObject | undefined, callback: (choiceIndex: number) => void);

	/**
	 * Enter a new room. If rooms should be of consistent but different visuals, add an argument here.
	 * (If they can re-randomize with no gameplay effects, it can be randomized here.)
	 * @param doorsOpen Array of length 3 (left-middle-right), True if open door, false if not
	 * @param enemySprite Enemy sprite to display
	 * @param callback Called when enter-room-animation is finished
	 */
	changeRoom(doorsOpen: Array<boolean>, enemySprite: SpriteName, callback: () => void): void;

	/**
	 * Ask user for text input.
	 * @param prompt Leading text to ask for input
	 * @param baseText Base text inside input box, can be erased
	 * @param maxLen Maximum input character count
	 * @param callback Called with the input text when finished
	 */
	inputText(prompt: string, baseText: string, maxLen: number, callback: (text: string) => void): void;
}
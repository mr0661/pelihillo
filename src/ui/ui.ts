import {Drawer, SpriteName} from "./sprites";
import {Coord} from "./coord";
import {UserInterfaceInterface} from "./interface";
import {Animation, AnimationObject} from "./animation";
import {TextBox} from "./textbox";

const CHARACTER_COUNT = 5;

export enum Screen {
	ROOM,
	DEATH,
	MAINMENU
}


export class UserInterface implements UserInterfaceInterface {

	drawer: Drawer;

	textBox: TextBox;

	// Data set by Display
	actionCallback: (choiceIndex: number) => void;
	animation: AnimationObject;

	// Room display info
	screen: Screen;
	doorsOpen: Array<boolean>;
	enemySprite: SpriteName;

	constructor() {
		this.drawer = new Drawer();
		this.screen = Screen.ROOM;
		this.doorsOpen = [true, true, true];
		this.animation = new AnimationObject();
		this.enemySprite = SpriteName.ENEMY_QUESTIONABLE;
		this.textBox = new TextBox();
		this.actionCallback = function (choiceIndex: number) {
			console.log("Chose " + choiceIndex);
		}
	}

	/**
	 * Display information on UI until user input or another call to display.
	 * Callback on user input.
	 * @param text Text to display in the text box.
	 * @param choices Available choices for player. If empty, choices box is not drawn
	 *                and any input is accepted as "proceed".
	 * @param anim  AnimationObject with animation data. See struct details for options. If none, keep previous.
	 * @param callback Will call this function on user input with the index of the selected choice
	 *                 or 0 if no choices supplied.
	 */
	display(text: string, choices: Array<string>, anim: AnimationObject | undefined, callback: (choiceIndex: number) => void) {
		this.animation = anim || this.animation;
		this.actionCallback = callback;
		this.textBox.newText(text, choices);
	}

	/**
	 * Enter a new room. If rooms should be of consistent but different visuals, add an argument here.
	 * (If they can re-randomize with no gameplay effects, it can be randomized here.)
	 * @param doorsOpen Array of length 3 (left-middle-right), True if open door, false if not
	 * @param enemySprite Enemy sprite name to display
	 */
	changeRoom(doorsOpen: Array<boolean>, enemySprite: SpriteName): void {
		this.screen = Screen.ROOM;
		this.doorsOpen = doorsOpen;
		this.enemySprite = enemySprite;
	}

	/**
	 * Draw user interface.
	 * @param context The rendering context object
	 * @param canvasSize Canvas size for scaling
	 */
	draw(context: CanvasRenderingContext2D, canvasSize: Coord): void {
		if (this.screen == Screen.ROOM) {
			this.drawRoom(context, canvasSize);
		}

	}

	// Draw room background (Walls and doors)
	private drawRoomBackground(context: CanvasRenderingContext2D): void {
		// Temp positioning
		let offset = new Coord(300, 10);
		for (let i = 0; i < this.doorsOpen.length; i++) {
			const pos: Coord = new Coord(i * 200, 0).add(offset);
			this.drawer.drawSprite(context, SpriteName.DOOR_LEFT_OPEN + Number(this.doorsOpen[i]) * 3,
				pos, new Coord(1, 1));
		}


	}

	// Draw player characters idle
	private drawCharacterBacks(context: CanvasRenderingContext2D): void {
		// Temp positioning
		let offset = new Coord(300, 300);
		for (let i = 0; i < CHARACTER_COUNT; i++) {
			let state: Animation = this.animation.characterAnimations.length > i ?
				this.animation.characterAnimations[i] : Animation.IDLE;

			if (state != Animation.NOTHING) {
				const pos: Coord = new Coord(i * 200, 0).add(offset);
				this.drawer.drawSprite(context, SpriteName.CHAR_1_BACK + state, pos, new Coord(1, 1));
			}
		}
	}

	// Draw room screen
	private drawRoom = function (context: CanvasRenderingContext2D, canvasSize: Coord): void {
		this.drawRoomBackground(context);
		this.drawCharacterBacks(context);
		if (this.animation.enemyAnimation != Animation.NOTHING){
			// Todo this too
			const pos: Coord = new Coord(800, 100);
			this.drawer.drawSprite(context, this.enemySprite, pos, new Coord(1, 1));
		}
		this.textBox.draw(context, canvasSize);

	}

	mouseClick = function (coords: Coord) {
		// Todo: get choice
		let res: number = this.textBox.mouseClick(coords);
		if (res != -1 && this.actionCallback) {
			this.actionCallback(res);
		}
	}

	mouseMove = function (coords: Coord) {
		this.textBox.mouseMove(coords);
	}
}
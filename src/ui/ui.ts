import {Drawer, SpriteName} from "./sprites";
import {Coord} from "./coord";
import {UserInterfaceInterface} from "./interface";
import {Animation, AnimationObject, RoomAnimation, CHARACTER_COUNT} from "./animation";
import {TextBox} from "./textbox";
import {TextInput} from "./textinput";
import {Character} from "../mechanics/character";


export enum Screen {
	ROOM,
	DEATH,
	MAINMENU
}

const ROOM_ENTER_DURATION: number = 500;

export class UserInterface implements UserInterfaceInterface {

	drawer: Drawer;

	textBox: TextBox;
	textInput: TextInput;

	// Data set by Display
	actionCallback: (choiceIndex: number) => void;
	animation: AnimationObject;
	displaySet: number;

	// Text input callback

	textCallback: (text: string) => void;

	// Room animation callback
	roomCallback: () => void;

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
		this.textInput = undefined;
		this.roomCallback = function (){};
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
		this.displaySet = Date.now();
		this.animation.roomAnimation = RoomAnimation.NONE;
	}

	/**
	 * Enter a new room. If rooms should be of consistent but different visuals, add an argument here.
	 * (If they can re-randomize with no gameplay effects, it can be randomized here.)
	 * @param doorsOpen Array of length 3 (left-middle-right), True if open door, false if not
	 * @param enemySprite Enemy sprite to display
	 * @param callback Called when enter-room-animation is finished
	 */
	changeRoom(doorsOpen: Array<boolean>, enemySprite: SpriteName, callback: () => void): void {
		this.screen = Screen.ROOM;
		if (this.animation){
			this.animation.roomAnimation = RoomAnimation.ROOM_ENTER;
		}
		this.animation.reset();
		this.displaySet = Date.now();
		this.doorsOpen = doorsOpen;
		this.enemySprite = enemySprite;
		this.roomCallback = callback;
	}

	/**
	 * Ask user for text input.
	 * @param prompt Leading text to ask for input
	 * @param baseText Base text inside input box, can be erased
	 * @param maxLen Maximum input character count
	 * @param callback Called with the input text when finished
	 */
	inputText(prompt: string, baseText: string, maxLen: number, callback: (text: string) => void): void{
		if (this.textInput){
			this.textInput.delete();
		}
		this.textInput = new TextInput(baseText, maxLen);
		this.textCallback = callback;
		this.textBox.newText(prompt, []);
	}

	updateCharacterStatus(chars: Array<Character>){
		// Todo
	}

	update(): void{

		if (this.animation.roomAnimation != RoomAnimation.NONE){
			if (this.animationElapsed(ROOM_ENTER_DURATION) == 1){
				this.animation.roomAnimation = RoomAnimation.NONE;
				this.roomCallback();
			}
		}
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

	private animationElapsed(fullDuration: number): number{
		const elapsed = Date.now() - this.displaySet;
		let animTime = elapsed / fullDuration;
		if (animTime < 0){
			animTime = 0;
		}
		if (animTime > 1){
			animTime = 1;
		}
		return animTime;
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
		let offset = this.animation.roomAnimation != RoomAnimation.ROOM_ENTER ?
			new Coord(100, 300) :
			new Coord(this.animationElapsed(ROOM_ENTER_DURATION) * 500 - 400, 300);


		for (let i = 0; i < CHARACTER_COUNT; i++) {
			let state: Animation = this.animation.characterAnimations.length > i ?
				this.animation.characterAnimations[i] : Animation.IDLE;

			if (state == Animation.IDLE) {
				const pos: Coord = new Coord(i * 200, 0).add(offset);
				const frame = state == Animation.IDLE ? 0 : 2;
				this.drawer.drawSprite(context,
					SpriteName.CHAR_1_BACK + CHARACTER_COUNT + frame,
					pos, new Coord(1, 1));
			}
		}
	}

	private drawFront(context: CanvasRenderingContext2D, canvasSize: Coord): void{
		const enemyPos: Coord = new Coord(800, 100);

		if (this.animation.enemyAnimation != Animation.NOTHING){
			this.drawer.drawSprite(context, this.enemySprite, enemyPos, new Coord(1, 1));
		}

		for (let i = 0; i < CHARACTER_COUNT; i++) {
			let state: Animation = this.animation.characterAnimations.length > i ?
				this.animation.characterAnimations[i] : Animation.IDLE;

			if (state == Animation.ACTION) {
				const pos: Coord = enemyPos.add(new Coord(-100, 0));
				this.drawer.drawSprite(context,
					SpriteName.CHAR_1_FRONT + i,
					pos, new Coord(1, 1));
			}
		}

	}

	// Draw room screen
	private drawRoom(context: CanvasRenderingContext2D, canvasSize: Coord): void {
		this.drawRoomBackground(context);
		this.drawCharacterBacks(context);
		this.drawFront(context, canvasSize);
		this.textBox.draw(context, canvasSize);
		if (this.textInput){
			this.textInput.position();
		}

	}


	mouseClick(coords: Coord) {
		let res: number = this.textBox.mouseClick(coords);
		if (res != -1 && this.textCallback && this.textInput){
			this.textCallback(this.textInput.getText());
			this.textCallback = undefined;
			this.textInput.delete();
			this.textInput = undefined;
		}
		else if (res != -1 && this.actionCallback) {
			this.actionCallback(res);
		}

	}

	mouseMove(coords: Coord) {
		this.textBox.mouseMove(coords);
	}
}
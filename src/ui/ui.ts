import {Drawer, SpriteName} from "./sprites";
import {Coord} from "./coord";
import {TextDisplayObject, UserInterfaceInterface} from "./interface";
import {Animation, AnimationObject, CHARACTER_COUNT, RoomAnimation} from "./animation";
import {TextBox, TEXTBOX_VERT_RATIO} from "./textbox";
import {TextInput} from "./textinput";
import * as Characters from "../mechanics/character";
import {Character} from "../mechanics/character";
import {InputMode} from "./ui_def";


export enum Screen {
	ROOM,
	DEATH,
	MAINMENU
}

const ROOM_ENTER_DURATION: number = 1000;
const BASE_UI_HEIGHT: number = 1000;
const FLASH_DURATION: number = 300;
const characters = [Characters.Fighter, Characters.Ranger, Characters.Thinker, Characters.Tinkerer];
const MAXHP = 10;

export class UserInterface implements UserInterfaceInterface {

	drawer: Drawer;

	textBox: TextBox;
	textInput: TextInput;

	wallColor: string;

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

	doorsOpenOld: Array<boolean>;
	enemySpriteOld: SpriteName;
	wallColorOld: string;

	hps: Array<number>
	inputMode: InputMode;

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
		this.hps = [];
		for(let i = 0; i < CHARACTER_COUNT; i++){
			this.hps.push(MAXHP);
		}
		this.wallColor = "#333";
		this.inputMode = InputMode.INPUT_MOUSE;
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
	display(text: string, choices: Array<TextDisplayObject>, anim: AnimationObject | undefined, callback: (choiceIndex: number) => void) {
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
		this.doorsOpenOld = this.doorsOpen;
		this.enemySpriteOld = this.enemySprite;
		this.wallColorOld = this.wallColor;

		this.screen = Screen.ROOM;
		if (this.animation){
			this.animation.roomAnimation = RoomAnimation.ROOM_ENTER;
		}
		this.animation.reset();
		this.displaySet = Date.now();
		this.doorsOpen = doorsOpen;
		this.enemySprite = enemySprite;
		this.roomCallback = callback;
		this.wallColor = this.randomWallColor();
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

		const delta = 0.2;

		for(let i = 0; i < CHARACTER_COUNT; i++){
			if (Math.abs(this.hps[i] - characters[i].HP) < delta){
				this.hps[i] = characters[i].HP;
			}
			else if (this.hps[i] < characters[i].HP - delta * 0.5){
				this.hps[i] += delta;
			}
			else if (this.hps[i] > characters[i].HP + delta * 0.5){
				this.hps[i] -= delta;
			}
			if (this.hps[i] < delta){
				this.animation.characterAnimations[i] = Animation.DEAD;
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

	private randomWallColor(): string{
		const randB = 100 + Math.floor(Math.random() * 100);
		const randG = randB - Math.floor(Math.random() * 50);
		const randR = randB - Math.floor(Math.random() * 50);
		return "rgb(" + randR + "," + randG + "," + randB + ")";
	}

	private getBgPosition(canvasSize: Coord){
		const topRectSize = new Coord(canvasSize.x, canvasSize.y * (1 - TEXTBOX_VERT_RATIO));
		let scale = this.drawer.fitSpriteToBox(SpriteName.ROOM_BG, topRectSize);
		const bgSize = this.drawer.getSpriteSize(SpriteName.ROOM_BG, scale.x);
		const pos: Coord = new Coord((canvasSize.x - bgSize.x) * 0.5, 0);
		return {pos: pos, scale: scale, bgSize: bgSize};
	}

	// Draw room background (Walls and doors)
	private drawRoomBackground(context: CanvasRenderingContext2D, canvasSize: Coord,
	                           color: string, doorsOpen: Array<boolean>): void {

		// background
		context.fillStyle = "#000";
		context.fillRect(0, 0, canvasSize.x, canvasSize.y);
		context.fillStyle = color;

		const posScale = this.getBgPosition(canvasSize);
		const pos = posScale.pos;
		const scale = posScale.scale;
		const bgSize = posScale.bgSize;

		context.fillRect(pos.x, pos.y, bgSize.x, bgSize.y);
		this.drawer.drawSprite(context, SpriteName.ROOM_BG, pos, scale);

		for (let i = 0; i < this.doorsOpen.length; i++) {
			const spriteName = SpriteName.DOOR_LEFT_OPEN + i + Number(doorsOpen[i]) * 3;
			this.drawer.drawSprite(context, spriteName, pos, scale);
		}


	}

	// Draw player characters idle
	private drawCharacterBacks(context: CanvasRenderingContext2D, canvasSize: Coord): void {
		const posScale = this.getBgPosition(canvasSize);
		const scale = posScale.scale.x;

		let offsetY = posScale.pos.y + posScale.bgSize.y;
		let defaultStart = posScale.pos.x + 50 * scale;
		let elapsed = this.animationElapsed(ROOM_ENTER_DURATION);

		let offset = elapsed < 0.25 || this.animation.roomAnimation != RoomAnimation.ROOM_ENTER ?
			new Coord(defaultStart, offsetY) :
			new Coord(defaultStart - (1000 - this.animationElapsed(ROOM_ENTER_DURATION)) * scale, offsetY);

		for (let i = 0; i < CHARACTER_COUNT; i++) {
			let state: Animation = this.animation.characterAnimations.length > i ?
				this.animation.characterAnimations[i] : Animation.IDLE;

			if (state == Animation.IDLE) {
				let pos: Coord = new Coord(i * 200 * posScale.scale.x, 0).add(offset);
				pos.y -= this.drawer.getSpriteSize(SpriteName.CHAR_1_BACK + i, scale).y;
				const frame = state == Animation.IDLE ? 0 : 2;
				this.drawer.drawSprite(context,
					SpriteName.CHAR_1_BACK + CHARACTER_COUNT * frame + i,
					pos, posScale.scale);
				this.drawHP(context, i, pos, posScale.scale.x);
			}
		}
	}

	private drawHP(context: CanvasRenderingContext2D, ix: number, pos: Coord, scale: number): void{
		if (this.animation.roomAnimation != RoomAnimation.NONE
			|| this.hps[ix] <= 0){
			return;
		}
		this.drawer.drawSpriteHorizontalClipped(context, SpriteName.HPBAR,
			pos, new Coord(scale * 0.5, scale * 0.5), this.hps[ix] / MAXHP);

	}

	private drawFront(context: CanvasRenderingContext2D, canvasSize: Coord, useOld: boolean): void{

		let enemySprite = useOld ? this.enemySpriteOld : this.enemySprite;

		const posScale = this.getBgPosition(canvasSize);
		const enemyBottom: Coord = posScale.pos.add(new Coord(posScale.bgSize.x * 0.65,
			posScale.bgSize.y * 0.55));
		const enemyTop = enemyBottom.copy();
		enemyTop.y -= this.drawer.getSpriteSize(enemySprite, posScale.scale.x).y;

		let time = Date.now();
		let isAction = false;
		for (let i = 0; i < this.animation.characterAnimations.length; i++) {
			if (this.animation.characterAnimations[i] == Animation.ACTION &&
				time - this.displaySet < FLASH_DURATION){
				isAction = true;
				break;
			}
		}

		if (this.animation.enemyAnimation != Animation.IDLE){
			if(!isAction || Math.floor(time/20) % 2 == 0){
				this.drawer.drawSprite(context, enemySprite, enemyTop, posScale.scale);
			}
		}

		for (let i = 0; i < CHARACTER_COUNT; i++) {
			let state: Animation = this.animation.characterAnimations.length > i ?
				this.animation.characterAnimations[i] : Animation.IDLE;

			if (state == Animation.ACTION) {
				const pos: Coord = enemyBottom.add(new Coord(-200, 200).multiply(posScale.scale.x));
				const spriteName = SpriteName.CHAR_1_FRONT + i;
				pos.y -= this.drawer.getSpriteSize(spriteName, posScale.scale.x).y;
				if(!isAction || Math.floor(time/20) % 2 == 0){
					this.drawer.drawSprite(context, spriteName, pos, posScale.scale);
				}
				this.drawHP(context, i, pos, posScale.scale.x);
			}
		}

	}

	// Draw room screen
	private drawRoom(context: CanvasRenderingContext2D, canvasSize: Coord): void {
		let elapsed = this.animationElapsed(ROOM_ENTER_DURATION);

		const useOld = this.animation.roomAnimation == RoomAnimation.ROOM_ENTER && elapsed < 0.25;

		this.drawRoomBackground(context, canvasSize,
			useOld ? this.wallColorOld : this.wallColor,
			useOld ? this.doorsOpenOld : this.doorsOpen);

		this.drawCharacterBacks(context, canvasSize);
		this.drawFront(context, canvasSize, useOld);

		const bgPos = this.getBgPosition(canvasSize);

		// Draw black fade
		if (this.animation.roomAnimation == RoomAnimation.ROOM_ENTER){

			if (elapsed < 0.5){
				context.fillStyle = "#000";
				context.globalAlpha = Math.sin(elapsed * 2 * Math.PI);
				context.fillRect(bgPos.pos.x, bgPos.pos.y, bgPos.bgSize.x, bgPos.bgSize.y);
				context.globalAlpha = 1;
			}
		}

		this.textBox.draw(context, bgPos.pos, bgPos.scale, bgPos.bgSize);
		if (this.textInput){
			this.textInput.position(bgPos.pos, bgPos.bgSize);
		}

	}

	private action(actionCode: number){
		if (actionCode != -1 && this.textCallback && this.textInput){
			this.textCallback(this.textInput.getText());
			this.textCallback = undefined;
			this.textInput.delete();
			this.textInput = undefined;
		}
		else if (actionCode != -1 && this.actionCallback) {
			this.actionCallback(actionCode);
		}
	}

	mouseClick(coords: Coord) {
		if (this.inputMode == InputMode.INPUT_MOUSE){
			let res: number = this.textBox.mouseClick(coords);
			this.action(res);
		}
		else{
			this.inputMode = InputMode.INPUT_MOUSE;
			this.textBox.setInputMode(this.inputMode);
		}
	}

	mouseMove(coords: Coord) {
		if (this.inputMode == InputMode.INPUT_MOUSE){
			this.textBox.mouseMove(coords);
		}
	}

	key(kc: string){
		if (this.inputMode == InputMode.INPUT_KB || (this.textInput && kc == "Enter")){
			let res = this.textBox.key(kc);
			this.action(res);
		}
		else if(!this.textInput){
			this.inputMode = InputMode.INPUT_KB;
			this.textBox.setInputMode(this.inputMode);
		}
	}
}
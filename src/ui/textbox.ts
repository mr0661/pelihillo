import {boxHit, Coord} from "./coord";
import {TextDisplayObject} from "./interface";
import {InputMode} from "./ui_def";

const BASE_CHOICE_SIZE = 60;
export const BASE_TEXTBOX_HEIGHT = 300;
export const TEXTBOX_VERT_RATIO = 0.2;

const BASE_CHOICE_OFFSET = new Coord(0, 80);
const BASE_MARGIN = new Coord(100, 100);

function drawMultiline(context: CanvasRenderingContext2D, text: string,
                       pos: Coord, maxWidth: number, lineHeight: number){

	const lines = text.split('\n');
	for (let i = 0; i < lines.length; i++){
		pos.y += wrapTextBlock(context, lines[i], pos.copy(), maxWidth, lineHeight);
	}

	function wrapTextBlock(context: CanvasRenderingContext2D, text: string,
	                  pos: Coord, maxWidth: number, lineHeight: number) {
		const words = text.split(' ');
		let line = '';

		for(let n = 0; n < words.length; n++) {
			let testLine = line + words[n] + ' ';
			let metrics = context.measureText(testLine);
			let testWidth = metrics.width;
			if (testWidth > maxWidth && n > 0) {
				context.fillText(line, pos.x, pos.y);
				line = words[n] + ' ';
				pos.y += lineHeight;
			}
			else {
				line = testLine;
			}
		}
		context.fillText(line, pos.x, pos.y);
		return pos.y + lineHeight;
	}


}



export class TextBox {

	position: Coord;
	choiceOffset: Coord;
	choiceSize: Coord;
	size: Coord;
	margin: Coord;

	currentText: string;
	currentChoices: Array<TextDisplayObject>;

	hoverChoice: number;
	inputMode: InputMode;

	constructor() {
		// Temp
		this.position = new Coord(0, 500);
		this.choiceOffset = new Coord(0, 50);
		this.currentText = "";
		this.currentChoices = [];
		this.hoverChoice = -1;
		this.margin = new Coord(50, 50);
		this.choiceSize = new Coord(50, 50);
		this.size = new Coord(0, 0);
	}

	newText(text: string, choices: Array<TextDisplayObject>) {
		this.currentText = text;
		this.currentChoices = choices;
	}

	draw(context: CanvasRenderingContext2D, pos: Coord, scale: Coord, bgSize: Coord): void {
		this.choiceSize.x = bgSize.x * 0.5;
		this.choiceSize.y = BASE_CHOICE_SIZE * scale.y;
		this.position.x = pos.x;
		this.position.y = pos.y + bgSize.y * (1 - TEXTBOX_VERT_RATIO);
		this.size.x = bgSize.x;
		this.size.y = BASE_TEXTBOX_HEIGHT * (bgSize.y / 0.8);
		this.choiceOffset = BASE_CHOICE_OFFSET.multiply(scale.x);
		this.margin = BASE_MARGIN.multiply(scale.x);

		// Temp text box draws
		let text = this.currentText;
		let choices = [];
		for (let i = 0; i < this.currentChoices.length; i++) {
			choices.push(this.currentChoices[i]);
		}

		context.fillStyle = "#aaa";
		context.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
		const fontSize = Math.floor(50 * scale.x);
		context.font = fontSize + "px mainFont";
		context.fillStyle = "#333";

		let mainPos = new Coord(this.position.x + this.margin.x, this.position.y + this.margin.y);
		drawMultiline(context, text, mainPos, this.size.x - this.margin.x * 2, fontSize);

		const boxHeight = this.choiceSize.y;

		let choicesOffset = this.choiceOffset.copy();
		for (let i = 0; i < this.currentChoices.length; i++){
			context.fillStyle = "#ccc";
			if (this.hoverChoice == i){
				context.fillStyle = "#fff";
			}
			let thisTextPos = this.getChoicePos(i);
			context.fillRect(thisTextPos.x, thisTextPos.y, this.choiceSize.x, boxHeight);
			context.fillStyle = this.currentChoices[i].disable ? "#999" : "#000";
			context.fillText(this.currentChoices[i].text, thisTextPos.x + 3, thisTextPos.y + this.choiceSize.y - 3);
			choicesOffset.add(this.choiceOffset);
		}

		if (this.hoverChoice != -1 && this.currentChoices.length > this.hoverChoice
		&& !this.currentChoices[this.hoverChoice].disable){
			let hoverText = this.currentChoices[this.hoverChoice].hoverText;
			context.font = fontSize + "px mainFont";
			context.fillStyle = "#333";
			let tpos = new Coord(this.position.x + this.margin.x * 2 + this.size.x * 0.5, this.position.y + this.margin.y);
			drawMultiline(context, hoverText, tpos, this.size.x * 0.5 - this.margin.x * 4, fontSize);

		}

	}

	getPosition(): Coord{
		return this.position.copy();
	}

	private getChoicePos(ix: number): Coord{
		let pos = this.position.add(this.choiceOffset).add(this.margin).add(this.choiceOffset.multiply(ix));
		pos.y -= this.choiceSize.y;
		return pos;
	}

	private getHoverChoice(coords: Coord): number{
		for (let i = 0; i < this.currentChoices.length; i++) {
			if (this.currentChoices[i].disable){
				continue;
			}
			let pos: Coord = this.getChoicePos(i);
			if (boxHit(coords, pos, this.choiceSize)){
				return i;
			}
		}
		return -1;
	}

	private defaultHover(): number{
		return this.inputMode == InputMode.INPUT_MOUSE ? -1 : 0;
	}

	setInputMode(mode: InputMode){
		this.inputMode = mode;
		if (mode == InputMode.INPUT_MOUSE){
			this.hoverChoice = -1;
		}
		else{
			this.hoverChoice = 0;
		}
	}

	mouseClick(coords: Coord){
		if (this.currentChoices.length == 0){
			return boxHit(coords, this.position, this.choiceSize.multiply(100)) ? 0 : -1;
		}
		let hoverChoice = this.getHoverChoice(coords);
		this.hoverChoice = this.defaultHover();
		return hoverChoice;
	}

	mouseMove(coords: Coord){
		this.hoverChoice = this.getHoverChoice(coords);
	}

	enter(): number{
		let choice = this.hoverChoice;
		if (this.currentChoices.length == 0){
			choice = 0;
		}
		this.hoverChoice = this.defaultHover();
		return choice;
	}

	key(kc: string): number{
		if (kc == "Enter"){
			return this.enter();
		}
		let hoverChoice = this.hoverChoice;
		if (kc == 'w'){
			hoverChoice--;
		}
		else if (kc == 's'){
			hoverChoice++;
		}
		if (hoverChoice < 0){
			hoverChoice = 0;
		}
		else if (hoverChoice >= this.currentChoices.length){
			hoverChoice = this.currentChoices.length - 1;
		}
		this.hoverChoice = hoverChoice;
		return -1;
	}

}
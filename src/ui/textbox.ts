import {boxHit, Coord} from "./coord";
import {TextDisplayObject} from "./interface";

const BASE_CHOICE_SIZE = 50;
export const BASE_TEXTBOX_HEIGHT = 300;
export const TEXTBOX_VERT_RATIO = 0.2;

export class TextBox {

	position: Coord;
	choiceOffset: Coord;
	choiceSize: Coord;
	size: Coord;
	margin: Coord;

	currentText: string;
	currentChoices: Array<TextDisplayObject>;

	hoverChoice: number;

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

		// Temp text box draws
		let text = this.currentText;
		let choices = [];
		for (let i = 0; i < this.currentChoices.length; i++) {
			choices.push(this.currentChoices[i]);
		}

		context.fillStyle = "#aaa";
		context.fillRect(this.position.x, this.position.y, this.size.x, this.size.y);
		const fontSize = Math.floor(40 * scale.x);
		context.font = fontSize + "px Times New Roman";
		context.fillStyle = "#333";
		context.fillText(text, this.position.x + this.margin.x, this.position.y + this.margin.y);
		const boxHeight = this.choiceSize.y;

		let choicesOffset = this.choiceOffset.copy();
		for (let i = 0; i < this.currentChoices.length; i++){
			context.fillStyle = i % 2 ? "#ccc" : "#fff";
			if (this.hoverChoice == i){
				context.fillStyle = "green";
			}
			let thisTextPos = this.getChoicePos(i);
			context.fillRect(thisTextPos.x, thisTextPos.y, this.choiceSize.x, boxHeight);
			context.fillStyle = this.currentChoices[i].disable ? "#999" : "#000";
			context.fillText(this.currentChoices[i].text, thisTextPos.x, thisTextPos.y + this.choiceSize.y);
			choicesOffset.add(this.choiceOffset);
		}

		if (this.hoverChoice != -1 && this.currentChoices.length > this.hoverChoice
		&& !this.currentChoices[this.hoverChoice].disable){
			let hoverText = this.currentChoices[this.hoverChoice].hoverText;
			context.font = fontSize + "px Times New Roman";
			context.fillStyle = "#333";
			context.fillText(hoverText, this.position.x + this.margin.x + this.size.x * 0.5, this.position.y + this.margin.y);

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

	mouseClick(coords: Coord){
		if (this.currentChoices.length == 0){
			return boxHit(coords, this.position, this.choiceSize.multiply(100)) ? 0 : -1;
		}
		let hoverChoice = this.getHoverChoice(coords);
		this.hoverChoice = -1;
		return hoverChoice;
	}

	mouseMove(coords: Coord){
		this.hoverChoice = this.getHoverChoice(coords);
	}

}
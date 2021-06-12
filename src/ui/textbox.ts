import {Coord} from "./coord";

export class TextBox {

	position: Coord;
	choiceOffset: Coord;
	choiceSize: Coord;
	margin: Coord;

	currentText: string;
	currentChoices: Array<string>;

	hoverChoice: number;

	constructor() {
		// Temp
		this.position = new Coord(0, 500);
		this.choiceOffset = new Coord(0, 50);
		this.currentText = "Test text to be drawn \n in a test text box";
		this.currentChoices = ["Choice 1", "Choice 2"];
		this.hoverChoice = -1;
		this.margin = new Coord(50, 50);
		this.choiceSize = new Coord(50, 50);
	}

	newText(text: string, choices: Array<string>) {
		this.currentText = text;
		this.currentChoices = choices;
	}

	draw(context: CanvasRenderingContext2D, canvasSize: Coord): void {
		this.choiceSize.x = canvasSize.x;

		// Temp text box draws
		let text = this.currentText;
		let choices = [];
		for (let i = 0; i < this.currentChoices.length; i++) {
			choices.push(this.currentChoices[i]);
		}

		context.fillStyle = "#aaa";
		context.fillRect(this.position.x, this.position.y, canvasSize.x, canvasSize.y);
		context.font = "30px Arial";
		context.fillStyle = "#333";
		context.fillText(text, this.position.x + this.margin.x, this.position.y + this.margin.y);
		const boxHeight = this.choiceSize.y;

		let choicesOffset = this.choiceOffset.copy();
		for (let i = 0; i < choices.length; i++){
			context.fillStyle = i % 2 ? "#111" : "#fff";
			if (this.hoverChoice == i){
				context.fillStyle = "green";
			}
			let thisTextPos = this.getChoicePos(i);
			context.fillRect(thisTextPos.x, thisTextPos.y, canvasSize.x, boxHeight);
			context.fillStyle = "#333";
			context.fillText(choices[i], thisTextPos.x, thisTextPos.y + this.choiceSize.y);
			choicesOffset.add(this.choiceOffset);
		}

	}

	private getChoicePos(ix: number): Coord{
		let pos = this.position.add(this.choiceOffset).add(this.margin).add(this.choiceOffset.multiply(ix));
		pos.y -= this.choiceSize.y;
		return pos;
	}

	private getHoverChoice(coords: Coord): number{
		for (let i = 0; i < this.currentChoices.length; i++) {
			let pos: Coord = this.getChoicePos(i);
			if (coords.y >= pos.y && coords.x >= pos.x
				&& coords.y < pos.y + this.choiceSize.y && coords.x < pos.x + this.choiceSize.x){
				return i;
			}
		}
		return -1;
	}

	mouseClick(coords: Coord){
		if (this.currentChoices.length == 0){
			return 0;
		}
		let hoverChoice = this.getHoverChoice(coords);
		this.hoverChoice = -1;
		return hoverChoice;
	}

	mouseMove(coords: Coord){
		this.hoverChoice = this.getHoverChoice(coords);
	}

}
import {Coord} from "./coord";

export class TextInput{

	maxLen: number;
	box: HTMLInputElement;

	constructor(baseText: string, maxLen: number){
		this.maxLen = maxLen;
		this.box = <HTMLInputElement>document.createElement("Input");
		this.box.style.fontSize = "30px";
		this.box.maxLength = maxLen;
		this.box.value = baseText;
		this.box.style.border = "5px solid #111";
		this.box.style.background = "#999";
		this.box.style.color = "#881104";
		this.box.style.display = "none";
		this.box.style.padding = "15px";
		this.box.style.fontFamily = "bloodFont";
		document.body.appendChild(this.box);
	}

	getText(): string{
		return this.box.value;
	}

	delete(): void{
		document.body.removeChild(this.box);
	}

	position(bgPos: Coord, bgSize: Coord): void{

		let size: Coord = new Coord(bgSize.x / 2, 50);
		let pos: Coord = bgPos.add(bgSize.subtract(size).multiply(0.5));

		this.box.style.display = "inline";
		this.box.style.position = "absolute";
		this.box.style.left = pos.x + "px";
		this.box.style.top = pos.y + "px";
		this.box.style.width = size.x + "px";
		this.box.style.height = size.y + "px";
	}
}
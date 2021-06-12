import {Coord} from "./coord";

export class TextInput{

	maxLen: number;
	box: HTMLTextAreaElement;

	constructor(baseText: string, maxLen: number){
		this.maxLen = maxLen;
		this.box = <HTMLTextAreaElement>document.createElement("TextArea");
		this.box.style.fontSize = "30px";
		this.box.maxLength = maxLen;
		this.box.value = baseText;
		//this.box.style.display = "none";
		this.position();
		document.body.appendChild(this.box);
	}

	getText(): string{
		return this.box.value;
	}

	delete(): void{
		document.body.removeChild(this.box);
	}

	position(): void{
		let pos: Coord = new Coord(200, 200);
		let size: Coord = new Coord(300, 300);

		this.box.style.position = "absolute";
		this.box.style.left = pos.x + "px";
		this.box.style.top = pos.y + "px";
		this.box.style.width = size.x + "px";
		this.box.style.height = size.y + "px";
	}
}
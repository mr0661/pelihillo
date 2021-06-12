import {UserInterface} from "./ui";
import {Coord} from "./coord";

// Add mouse click listeners (todo: keys)
export function addListeners(canvas: HTMLCanvasElement, ui: UserInterface): void{
	canvas.addEventListener("mouseup", function(event: MouseEvent){
		ui.mouseClick(new Coord(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop));
	});
	canvas.addEventListener("touchend", function(event: MouseEvent){
		ui.mouseClick(new Coord(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop));
	});
	canvas.addEventListener("mousemove", function(event: MouseEvent){
		ui.mouseMove(new Coord(event.pageX - canvas.offsetLeft, event.pageY - canvas.offsetTop));
	});
}
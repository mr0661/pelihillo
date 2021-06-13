import * as fun from "./functions"
import {UserInterface} from "./ui/ui";
import {Coord} from "./ui/coord";
import {addListeners} from "./ui/inputs";
import {roomDemo} from "./ui/room_demo";
import {ui} from "./ui/ui_def"
import {startGame} from "./run"

const CANVAS_ID = "canvas";

function main(CANVAS_ID: string) {
	const WIDTH: number = document.body.clientWidth;
	const HEIGHT: number = Math.round(WIDTH * 7.5 / 16); // browser widescreen
	const CYCLE_MS: number = 1000 / 30; // ~30fps

	// Set canvas size
	let canvas: HTMLCanvasElement = document.getElementById(CANVAS_ID) as HTMLCanvasElement;
	canvas.width = WIDTH;
	canvas.height = HEIGHT;

	addListeners(canvas, ui);
	console.log("AAAA")
	startGame()
	// roomDemo(ui);

	// Set main loop
	setInterval(mainCycle, CYCLE_MS, canvas);

}

let iteration: number = 0;

function mainCycle(canvas: HTMLCanvasElement) {
	let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
	const maxIter: number = 32;
	let iterationId: number = iteration % maxIter > maxIter / 2 ? maxIter - iteration % maxIter : iteration % maxIter;
	let colorCode: string = "" + iterationId.toString(16) + iterationId.toString(16);
	ctx.fillStyle = "#" + (colorCode) + (colorCode) + (colorCode);
	ctx.fillStyle = "#333333";
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	ui.update();
	ui.draw(ctx, new Coord(canvas.width, canvas.height));
	iteration++;
}

main(CANVAS_ID);

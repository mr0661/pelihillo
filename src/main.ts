import * as fun from "./functions"

const CANVAS_ID = "canvas";

function main(CANVAS_ID: string) {
	const WIDTH: number = document.body.clientWidth;
	const HEIGHT: number = Math.round(WIDTH * 7.5 / 16); // browser widescreen
	const CYCLE_MS: number = 1000 / 30; // ~30fps

	// Set canvas size
	let canvas: HTMLCanvasElement = document.getElementById(CANVAS_ID) as HTMLCanvasElement;
	canvas.width = WIDTH;
	canvas.height = HEIGHT;

	// Set main loop
	setInterval(fun.mainCycle, CYCLE_MS, canvas);
}

main(CANVAS_ID);

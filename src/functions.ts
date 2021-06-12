let iteration: number = 0;

export function mainCycle(canvas: HTMLCanvasElement) {
	let ctx: CanvasRenderingContext2D = canvas.getContext("2d");
	const maxIter: number = 32;
	let iterationId: number = iteration % maxIter > maxIter / 2 ? maxIter - iteration % maxIter : iteration % maxIter;
	let colorCode: string = "" + iterationId.toString(16) + iterationId.toString(16);
	ctx.fillStyle = "#" + (colorCode) + (colorCode) + (colorCode);
	ctx.fillRect(0, 0, canvas.width, canvas.height);
	iteration++;
}
export class Coord{
	x: number;
	y: number;
	constructor(x: number, y: number) {
		this.x = x;
		this.y = y;
	}
	copy(): Coord {
		return new Coord(this.x, this.y);
	}
	add(o: Coord): Coord{
		return new Coord(this.x + o.x, this.y + o.y);
	}
	subtract(o: Coord): Coord{
		return new Coord(this.x - o.x, this.y - o.y);
	}
	multiply(mp: number): Coord{
		return new Coord(this.x * mp, this.y * mp);
	}

}

export function boxHit(testPos: Coord, boxPos: Coord, boxSize: Coord): boolean{
	return testPos.x >= boxPos.x && testPos.y >= boxPos.y
		&& testPos.x < boxPos.x + boxSize.x && testPos.y < boxPos.y + boxSize.y;
}
import {Note} from "../api/apiportal";

const ROOMS_DEBUG: boolean = true;

enum EnterStrategy {
	NORMAL, EXIT_LEFT, EXIT_RIGHT, EXIT_UP, EXIT_DOWN
}

interface Movement {
	fromDown: EnterStrategy
	fromUp: EnterStrategy
	fromRight: EnterStrategy
	fromLeft: EnterStrategy
}

const HORIZONTAL_AUTO: Movement = {
	fromDown: EnterStrategy.NORMAL,
	fromUp: EnterStrategy.NORMAL,
	fromLeft: EnterStrategy.EXIT_RIGHT,
	fromRight: EnterStrategy.EXIT_LEFT
};
const VERTICAL_AUTO: Movement = {
	fromDown: EnterStrategy.EXIT_UP,
	fromUp: EnterStrategy.EXIT_DOWN,
	fromLeft: EnterStrategy.NORMAL,
	fromRight: EnterStrategy.NORMAL
};

const TURN_LEFT_SKIP: Movement = {
	fromDown: EnterStrategy.EXIT_LEFT,
	fromUp: EnterStrategy.EXIT_RIGHT,
	fromLeft: EnterStrategy.EXIT_UP,
	fromRight: EnterStrategy.EXIT_DOWN
};

const NORMAL: Movement = {
	fromDown: EnterStrategy.NORMAL,
	fromUp: EnterStrategy.NORMAL,
	fromLeft: EnterStrategy.NORMAL,
	fromRight: EnterStrategy.NORMAL
};

export enum RoomAction {
	NORMAL, KEY1, KEY2, KEY3, KEY4, KEY5, KEY6, KEY7, REDRUM, RANDOM, BLOCKED
}

interface Strategy {
	action: RoomAction
	move: Movement
}

export const STANDARD: Strategy = {action: RoomAction.NORMAL, move: NORMAL};
export const HORIZONTAL: Strategy = {action: RoomAction.NORMAL, move: HORIZONTAL_AUTO};
export const VERTICAL: Strategy = {action: RoomAction.NORMAL, move: VERTICAL_AUTO};
export const TURN: Strategy = {action: RoomAction.NORMAL, move: TURN_LEFT_SKIP};
export const KEY1: Strategy = {action: RoomAction.KEY1, move: NORMAL};
export const KEY2: Strategy = {action: RoomAction.KEY2, move: NORMAL};
export const KEY3: Strategy = {action: RoomAction.KEY3, move: NORMAL};
export const KEY4: Strategy = {action: RoomAction.KEY4, move: NORMAL};
export const KEY5: Strategy = {action: RoomAction.KEY5, move: NORMAL};
export const KEY6: Strategy = {action: RoomAction.KEY6, move: NORMAL};
export const KEY7: Strategy = {action: RoomAction.KEY7, move: NORMAL};
export const DEATH: Strategy = {action: RoomAction.REDRUM, move: NORMAL};
export const RANDOM: Strategy = {action: RoomAction.RANDOM, move: NORMAL};
export const BLOCKED: Strategy = {action: RoomAction.BLOCKED, move: NORMAL};

export interface Room {
	x: number;
	y: number;
	strategy: Strategy;
}

export const BLOCKED_ROOM = {x: 4, y: 4, strategy: BLOCKED};

export const ROOMS: Room[] = [
	{x: 0, y: 0, strategy: HORIZONTAL} // HALLWAY-of-doom
	, {x: 0, y: 1, strategy: HORIZONTAL} // HALLWAY-of-doom
	, {x: 0, y: 2, strategy: HORIZONTAL} // HALLWAY-of-doom
	, {x: 0, y: 3, strategy: HORIZONTAL} // HALLWAY-of-doom
	, {x: 0, y: 4, strategy: HORIZONTAL} // HALLWAY-of-doom
	, {x: 0, y: 5, strategy: HORIZONTAL} // HALLWAY-of-doom
	, {x: 0, y: 6, strategy: HORIZONTAL} // HALLWAY-of-doom
	, {x: 0, y: 7, strategy: HORIZONTAL} // HALLWAY-of-doom
	, {x: 0, y: 8, strategy: HORIZONTAL} // HALLWAY-of-doom
	, {x: 0, y: 9, strategy: STANDARD}
	, {x: 1, y: 0, strategy: STANDARD}
	, {x: 1, y: 1, strategy: STANDARD}
	, {x: 1, y: 2, strategy: STANDARD}
	, {x: 1, y: 3, strategy: STANDARD}
	, {x: 1, y: 4, strategy: STANDARD}
	, {x: 1, y: 5, strategy: TURN}
	, {x: 1, y: 6, strategy: STANDARD}
	, {x: 1, y: 7, strategy: STANDARD}
	, {x: 1, y: 8, strategy: KEY2}
	, {x: 1, y: 9, strategy: STANDARD}
	, {x: 2, y: 0, strategy: STANDARD}
	, {x: 2, y: 1, strategy: STANDARD}
	, {x: 2, y: 2, strategy: VERTICAL}
	, {x: 2, y: 3, strategy: KEY3}
	, {x: 2, y: 4, strategy: STANDARD}
	, {x: 2, y: 5, strategy: HORIZONTAL}
	, {x: 2, y: 6, strategy: STANDARD}
	, {x: 2, y: 7, strategy: STANDARD}
	, {x: 2, y: 8, strategy: STANDARD}
	, {x: 2, y: 9, strategy: STANDARD}
	, {x: 3, y: 0, strategy: STANDARD}
	, {x: 3, y: 1, strategy: STANDARD}
	, {x: 3, y: 2, strategy: STANDARD}
	, {x: 3, y: 3, strategy: DEATH}
	, {x: 3, y: 4, strategy: STANDARD}
	, {x: 3, y: 5, strategy: STANDARD}
	, {x: 3, y: 6, strategy: TURN}
	, {x: 3, y: 7, strategy: STANDARD}
	, {x: 3, y: 8, strategy: STANDARD}
	, {x: 3, y: 9, strategy: STANDARD}
	, {x: 4, y: 0, strategy: STANDARD}
	, {x: 4, y: 1, strategy: STANDARD}
	, {x: 4, y: 2, strategy: STANDARD}
	, {x: 4, y: 3, strategy: STANDARD}
	, {x: 4, y: 4, strategy: KEY6}
	, {x: 4, y: 5, strategy: KEY1}
	, {x: 4, y: 6, strategy: RANDOM}
	, {x: 4, y: 7, strategy: STANDARD}
	, {x: 4, y: 8, strategy: STANDARD}
	, {x: 4, y: 9, strategy: VERTICAL}
	, {x: 5, y: 0, strategy: TURN}
	, {x: 5, y: 1, strategy: STANDARD}
	, {x: 5, y: 2, strategy: STANDARD}
	, {x: 5, y: 3, strategy: STANDARD}
	, {x: 5, y: 4, strategy: STANDARD}
	, {x: 5, y: 5, strategy: STANDARD}
	, {x: 5, y: 6, strategy: STANDARD}
	, {x: 5, y: 7, strategy: STANDARD}
	, {x: 5, y: 8, strategy: STANDARD}
	, {x: 5, y: 9, strategy: STANDARD}
	, {x: 6, y: 0, strategy: STANDARD}
	, {x: 6, y: 1, strategy: STANDARD}
	, {x: 6, y: 2, strategy: RANDOM}
	, {x: 6, y: 3, strategy: STANDARD}
	, {x: 6, y: 4, strategy: STANDARD}
	, {x: 6, y: 5, strategy: STANDARD}
	, {x: 6, y: 6, strategy: STANDARD}
	, {x: 6, y: 7, strategy: RANDOM}
	, {x: 6, y: 8, strategy: DEATH}
	, {x: 6, y: 9, strategy: STANDARD}
	, {x: 7, y: 0, strategy: STANDARD}
	, {x: 7, y: 1, strategy: STANDARD}
	, {x: 7, y: 2, strategy: STANDARD}
	, {x: 7, y: 3, strategy: KEY4}
	, {x: 7, y: 4, strategy: VERTICAL}
	, {x: 7, y: 5, strategy: STANDARD}
	, {x: 7, y: 6, strategy: DEATH}
	, {x: 7, y: 7, strategy: STANDARD}
	, {x: 7, y: 8, strategy: STANDARD}
	, {x: 7, y: 9, strategy: STANDARD}
	, {x: 8, y: 0, strategy: KEY5}
	, {x: 8, y: 1, strategy: VERTICAL}
	, {x: 8, y: 2, strategy: KEY7}
	, {x: 8, y: 3, strategy: HORIZONTAL}
	, {x: 8, y: 4, strategy: STANDARD}
	, {x: 8, y: 5, strategy: STANDARD}
	, {x: 8, y: 6, strategy: STANDARD}
	, {x: 8, y: 7, strategy: STANDARD}
	, {x: 8, y: 8, strategy: STANDARD}
	, {x: 8, y: 9, strategy: STANDARD}
	, {x: 9, y: 0, strategy: STANDARD}
	, {x: 9, y: 1, strategy: STANDARD}
	, {x: 9, y: 2, strategy: STANDARD}
	, {x: 9, y: 3, strategy: STANDARD}
	, {x: 9, y: 4, strategy: STANDARD}
	, {x: 9, y: 5, strategy: STANDARD}
	, {x: 9, y: 6, strategy: VERTICAL}
	, {x: 9, y: 7, strategy: VERTICAL}
	, {x: 9, y: 8, strategy: VERTICAL}
	, {x: 9, y: 9, strategy: STANDARD}
];

export interface NextRooms {
	left: Room;
	front: Room;
	right: Room;
	back: Room;
}

interface RoadTravelled {
	room1: Room;
	room2: Room;
}

let g_messages: Array<Array<Note>> = new Array<Array<Note>>();
let g_roadsTravelled: RoadTravelled[] = new Array<RoadTravelled>();
let g_roomsCleared: Room[] = new Array<Room>();

function resetMessageText(): void {
	if (ROOMS_DEBUG) {
		console.log("resetMessageText: start");
	}
	g_messages.length = 0;
	for (let i: number = 0; i < ROOMS.length * 4; i++) {
		// TODO get actual messages from actual server
		g_messages.push([
			{id: 1, message: "This door should have message " + Math.floor(i / 4).toString()},
			{id: 2, message: "No message here " + (i % 4).toString()}]);
	}
}

export function reset(): void {
	resetMessageText();
	g_roadsTravelled.length = 0;
	g_roomsCleared.length = 0;
}

export function getMessage(from: Room, to: Room): Note[] {
	if (ROOMS_DEBUG) {
		console.log("getMessage: " + getDoorId(from, to).toString() + "/" + g_messages.length);
	}
	// TODO get actual message
	return g_messages[getDoorId(from, to)];
}


export function getRoom(x: number, y: number): Room {
	let roomX = (x + 10) % 10;
	let roomY = (y + 10) % 10;
	if (ROOMS_DEBUG) {
		console.log("x: ", x, "y: ", y, "x: ", roomX, "y: ", roomY);
	}
	for (let i: number = 0; i < ROOMS.length; i++) {
		if (roomX == ROOMS[i].x && roomY == ROOMS[i].y) {
			return ROOMS[i];
		}
	}
	console.log("unknown error!");
	return {x: x, y: y, strategy: RANDOM};
}

export function addClearedRoom(room: Room): void {
	g_roomsCleared.push(room);
}

export function isRoomCleared(room: Room): boolean {
	for (let i: number = 0; i < g_roomsCleared.length; i++) {
		if (room == g_roomsCleared[i]) {
			return true;
		}
	}
	return false;
}

function isAutoMove(from: Room, to: Room): boolean {
	if (from.strategy == HORIZONTAL) {
		return from.x != to.x;
	} else if (from.strategy == VERTICAL) {
		return from.y != to.y;
	}
	return false;
}

export function isAllowedMove(from: Room, to: Room): boolean {
	if (isAutoMove(from, to)) {
		return false;
	}
	for (let i: number = 0; i < g_roadsTravelled.length; i++) {
		if (g_roadsTravelled[i].room1 == from && g_roadsTravelled[i].room2 == to) {
			console.log("not allowed", g_roadsTravelled);
			return false;
		}
	}
	return true;
}

export function getTargetIfAllowed(from: Room, to: Room): Room {
	return isAllowedMove(from, to) ? to : BLOCKED_ROOM;
}

export function getDoorId(from: Room, to: Room): number {
	let xDiff: number = from.x - to.x;
	let yDiff: number = from.y - to.y;
	let directionVal: number = 0;
	if (xDiff == -1) {
		directionVal = 0;
	}
	if (xDiff == 1) {
		directionVal = 1;
	}
	if (yDiff == -1) {
		directionVal = 2;
	}
	if (yDiff == 1) {
		directionVal = 3;
	}
	return ((from.x * 10 + from.y) << 2) + directionVal;
}

function resolveEnterStrategy(from: Room, up: Room, down: Room, left: Room, right: Room, normal: NextRooms, enter: EnterStrategy): NextRooms {
	if (enter == EnterStrategy.NORMAL) {
		return normal;
	}
	if (enter == EnterStrategy.EXIT_DOWN) {
		console.log("resolve move to down");
		return enterRoom(from, down);
	}
	if (enter == EnterStrategy.EXIT_UP) {
		console.log("resolve move to up");
		return enterRoom(from, up);
	}
	if (enter == EnterStrategy.EXIT_RIGHT) {
		console.log("resolve move to right");
		return enterRoom(from, right);
	}
	if (enter == EnterStrategy.EXIT_LEFT) {
		console.log("resolve move to left");
		return enterRoom(from, left);
	}
}

export function dropIntoRoom(from: Room, to: Room): NextRooms {
	// This does not mark paths travelled if dropped into normal room
	if (ROOMS_DEBUG) {
		console.log("dropping to room " + to.x.toString() + " " + to.y.toString());
	}
	const left: Room = getRoom(to.x - 1, to.y);
	const right: Room = getRoom(to.x + 1, to.y);
	const up: Room = getRoom(to.x, to.y - 1);
	const down: Room = getRoom(to.x, to.y + 1);

	const leftRefer: Room = getTargetIfAllowed(to, left);
	const rightRefer: Room = getTargetIfAllowed(to, right);
	const upRefer: Room = getTargetIfAllowed(to, up);
	const downRefer: Room = getTargetIfAllowed(to, down);

	if (from.x == down.x && from.y && down.y) {
		return resolveEnterStrategy(to, up, down, left, right, {
			left: leftRefer,
			front: upRefer,
			right: rightRefer,
			back: downRefer
		}, to.strategy.move.fromDown);
	} else if (from.x == left.x && from.y && left.y) {
		return resolveEnterStrategy(to, up, down, left, right, {
			left: upRefer,
			front: rightRefer,
			right: downRefer,
			back: leftRefer
		}, to.strategy.move.fromLeft);
	} else if (from.x == up.x && from.y && up.y) {
		return resolveEnterStrategy(to, up, down, left, right, {
			left: rightRefer,
			front: downRefer,
			right: leftRefer,
			back: upRefer
		}, to.strategy.move.fromUp);
	} else if (from.x == right.x && from.y && right.y) {
		return resolveEnterStrategy(to, up, down, left, right, {
			left: downRefer,
			front: leftRefer,
			right: upRefer,
			back: rightRefer
		}, to.strategy.move.fromRight);
	}
	// Lets pick random direction if we were not from correct room
	if (ROOMS_DEBUG) {
		console.log("Picking random direction enterRoom/dropRoom!");
	}
	const rnd: number = Math.random();
	if (rnd > 3 / 4) {
		return {left: leftRefer, front: upRefer, right: rightRefer, back: downRefer};
	}
	if (rnd > 2 / 4) {
		return {left: upRefer, front: rightRefer, right: downRefer, back: leftRefer};
	}
	if (rnd > 1 / 4) {
		return {left: rightRefer, front: downRefer, right: leftRefer, back: upRefer};
	}
	return {left: downRefer, front: leftRefer, right: upRefer, back: rightRefer};
}

export function enterRoom(from: Room, to: Room): NextRooms {
	// Marks path from->to and to->from travelled
	if (ROOMS_DEBUG) {
		console.log("entering room " + to.x.toString() + " " + to.y.toString());
	}
	g_roadsTravelled.push({room1: from, room2: to});
	g_roadsTravelled.push({room1: to, room2: from});
	return dropIntoRoom(from, to);
}

import {ui} from "./ui/ui_def";
import {SpriteName} from "./ui/sprites";
import {clearRoom} from "./mechanics/gameplay";
import {Challenge} from "./mechanics/core";
import * as map from "./map/rooms";
import {BLOCKED_ROOM, dropIntoRoom, getMessage} from "./map/rooms";
import {TextDisplayObject} from "./ui/interface";

let g_currentRoom: map.Room;
let g_nextRooms: map.NextRooms;
let g_isMessageAvailable: boolean;

function isMessageAvailable(): boolean {
	// TODO add more interesting logic
	return g_isMessageAvailable;
}

function setMessageUsed(): void {
	// TODO add more interesting logic
	g_isMessageAvailable = false;
}

function resetMessageUsed(): void {
	// TODO add more interesting logic
	g_isMessageAvailable = true;
}

export function startGame(): void {
	// TODO add start screen
	// TODO reset other stuff?
	console.log("startGame: start");
	resetMessageUsed();
	map.reset();
	let roomIndex = Math.floor(Math.random() * map.ROOMS.length);
	g_currentRoom = map.ROOMS[roomIndex];
	while (g_currentRoom.strategy != map.STANDARD) {
		roomIndex = Math.floor(Math.random() * map.ROOMS.length);
		g_currentRoom = map.ROOMS[roomIndex];
	}
	console.log("startGame: start " + roomIndex.toString());
	g_nextRooms = dropIntoRoom(map.ROOMS[45], g_currentRoom);
	ui.changeRoom([true, true, true], SpriteName.ENEMY_QUESTIONABLE, chooseRoom);
}

const LEFT = 0;
const FRONT = 1;
const RIGHT = 2;
const BACK = 3;
const TEXT = 3;
const CANCEL = 4;

const MAX_TEXT_LENGTH = 255;

function joinMessages(messages: Array<string>): string {
	let joined: string = "";
	for (let i: number = 0; i < messages.length; i++) {
		joined += messages[i] + "\n";
	}
	return joined;
}

function chooseRoom(): void {
	console.log("chooseRoom: start");
	const left: TextDisplayObject = new TextDisplayObject("Left", joinMessages(getMessage(g_currentRoom, g_nextRooms.left)), g_nextRooms.left == map.BLOCKED_ROOM);
	const front: TextDisplayObject = new TextDisplayObject("Front", joinMessages(getMessage(g_currentRoom, g_nextRooms.front)), g_nextRooms.front == map.BLOCKED_ROOM);
	const right: TextDisplayObject = new TextDisplayObject("Right", joinMessages(getMessage(g_currentRoom, g_nextRooms.right)), g_nextRooms.right == map.BLOCKED_ROOM);
	const leave: TextDisplayObject = new TextDisplayObject("Leave Message", "", isMessageAvailable());
	ui.display("Where you want to go", [left, front, right, leave], undefined, roomSelect);
}

function roomSelect(index: number): void {
	console.log("roomSelect: start");
	if (index == TEXT) {
		ui.display("Which door you want to leave message", [
			new TextDisplayObject("Left", joinMessages(getMessage(g_currentRoom, g_nextRooms.left)), true),
			new TextDisplayObject("Front", joinMessages(getMessage(g_currentRoom, g_nextRooms.front)), true),
			new TextDisplayObject("Right", joinMessages(getMessage(g_currentRoom, g_nextRooms.right)), true),
			new TextDisplayObject("Back", joinMessages(getMessage(g_currentRoom, g_nextRooms.back)), true),
			new TextDisplayObject("Cancel", "", true)], undefined, selectRoomToLeaveNote);
	} else {
		// Move to new room
		const nextRoom = index == LEFT ? g_nextRooms.left : index == FRONT ? g_nextRooms.front : g_nextRooms.right;
		g_nextRooms = map.enterRoom(g_currentRoom, nextRoom);
		g_currentRoom = nextRoom;
		enterRoom();
	}
}

function selectRoomToLeaveNote(index: number): void {
	console.log("selectRoomToLeaveNote: start");
	if (index == CANCEL) {
		chooseRoom();
	}
	ui.inputText("Leave message", "", MAX_TEXT_LENGTH, saveText);
}

function saveText(text: string): void {
	// TODO send text on door
	chooseRoom();
}

function enterRoom(): void {
	console.log("enterRoom: start");
	// Get status from current room
	const leftOpen = g_nextRooms.left != map.BLOCKED_ROOM;
	const frontOpen = g_nextRooms.front != map.BLOCKED_ROOM;
	const rightOpen = g_nextRooms.right != map.BLOCKED_ROOM;
	let openRooms: Array<boolean> = [leftOpen, frontOpen, rightOpen];
	let challengeSprite = SpriteName.ENEMY_QUESTIONABLE;
	ui.changeRoom(openRooms, challengeSprite, roomCombat);
}

function roomCombat(): void {
	console.log("roomCombat: start");
	// TODO add room challenges
	// clearRoom(currentChallenge, roomCombatResolved);
	roomCombatResolved(true);
}

function roomCombatResolved(aliveCharacters: boolean): void {
	console.log("roomCombatResolved: start");
	if (!aliveCharacters) {
		// TODO END GAME
		return;
	}
	chooseRoom();
}
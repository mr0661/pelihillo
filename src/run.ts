import {ui} from "./ui/ui_def";
import {SpriteName} from "./ui/sprites";
import {clearRoom} from "./mechanics/gameplay";
import {Challenge} from "./mechanics/core";
import * as map from "./map/rooms";
import {dropIntoRoom, getMessage} from "./map/rooms";
import {TextDisplayObject} from "./ui/interface";
import {doomCountdown, getRandomChallenge, KeyRooms} from "./mechanics/challenges";
import {Full_Party_Doom} from "./mechanics/challenges/doomroom";

const RUN_DEBUG: boolean = true;

let g_startRoom: map.Room;
let g_currentRoom: map.Room;
let g_nextRooms: map.NextRooms;
let g_isMessageAvailable: boolean;
let g_currentChallenge: Challenge;

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
	if (RUN_DEBUG) {
		console.log("startGame: start");
	}
	resetMessageUsed();
	map.reset();
	let roomIndex = Math.floor(Math.random() * map.ROOMS.length);
	g_startRoom = map.ROOMS[roomIndex];
	while (g_startRoom.strategy != map.STANDARD) {
		roomIndex = Math.floor(Math.random() * map.ROOMS.length);
		g_startRoom = map.ROOMS[roomIndex];
	}
	console.log("startGame: start " + roomIndex.toString());
	g_currentRoom = g_startRoom;
	g_nextRooms = dropIntoRoom(map.ROOMS[45], g_currentRoom);
	ui.changeRoom([true, true, true], SpriteName.NO_SPRITE, chooseRoom);
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
	if (RUN_DEBUG) {
		console.log("chooseRoom: start");
	}
	const left: TextDisplayObject = new TextDisplayObject("Left", joinMessages(getMessage(g_currentRoom, g_nextRooms.left)), g_nextRooms.left == map.BLOCKED_ROOM);
	const front: TextDisplayObject = new TextDisplayObject("Front", joinMessages(getMessage(g_currentRoom, g_nextRooms.front)), g_nextRooms.front == map.BLOCKED_ROOM);
	const right: TextDisplayObject = new TextDisplayObject("Right", joinMessages(getMessage(g_currentRoom, g_nextRooms.right)), g_nextRooms.right == map.BLOCKED_ROOM);
	const leave: TextDisplayObject = new TextDisplayObject("Leave Message", "", isMessageAvailable());
	ui.display("Where you want to go", [left, front, right, leave], undefined, roomSelect);
}

function roomSelect(index: number): void {
	if (RUN_DEBUG) {
		console.log("roomSelect: start");
	}
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
	if (RUN_DEBUG) {
		console.log("selectRoomToLeaveNote: start");
	}
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
	if (RUN_DEBUG) {
		console.log("enterRoom: start");
	}
	// Get status from current room
	const leftOpen = g_nextRooms.left != map.BLOCKED_ROOM;
	const frontOpen = g_nextRooms.front != map.BLOCKED_ROOM;
	const rightOpen = g_nextRooms.right != map.BLOCKED_ROOM;
	let openRooms: Array<boolean> = [leftOpen, frontOpen, rightOpen];

	let challengeSprite: SpriteName;
	if (g_currentRoom == g_startRoom) {
		// TODO special handling for start room
		console.log("START ROOM!");
		roomCombatResolved(true);
		challengeSprite = SpriteName.NO_SPRITE;
	} else if (map.isRoomCleared(g_currentRoom)) {
		roomCombatResolved(true);
		challengeSprite = SpriteName.NO_SPRITE;
	} else if (g_currentRoom.strategy.action == map.RoomAction.NORMAL) {
		console.log("NORMAL ROOM!");
		g_currentChallenge = getRandomChallenge();
		challengeSprite = g_currentChallenge.getImage();
	} else if (g_currentRoom.strategy.action == map.RoomAction.REDRUM) {
		g_currentChallenge = Full_Party_Doom;
		challengeSprite = g_currentChallenge.getImage();
	} else if (g_currentRoom.strategy.action == map.RoomAction.KEY1) {
		g_currentChallenge = KeyRooms[0];
		challengeSprite = g_currentChallenge.getImage();
	} else if (g_currentRoom.strategy.action == map.RoomAction.KEY2) {
		g_currentChallenge = KeyRooms[1];
		challengeSprite = g_currentChallenge.getImage();
	} else if (g_currentRoom.strategy.action == map.RoomAction.KEY3) {
		g_currentChallenge = KeyRooms[2];
		challengeSprite = g_currentChallenge.getImage();
	} else if (g_currentRoom.strategy.action == map.RoomAction.KEY4) {
		g_currentChallenge = KeyRooms[3];
		challengeSprite = g_currentChallenge.getImage();
	} else if (g_currentRoom.strategy.action == map.RoomAction.KEY5) {
		g_currentChallenge = KeyRooms[4];
		challengeSprite = g_currentChallenge.getImage();
	} else if (g_currentRoom.strategy.action == map.RoomAction.KEY6) {
		g_currentChallenge = KeyRooms[5];
		challengeSprite = g_currentChallenge.getImage();
	} else if (g_currentRoom.strategy.action == map.RoomAction.KEY7) {
		g_currentChallenge = KeyRooms[6];
		challengeSprite = g_currentChallenge.getImage();
	} else {
		// Room combat is normal for also if map.RoomAction.RANDOM
		g_currentChallenge = getRandomChallenge();
		challengeSprite = g_currentChallenge.getImage();
	}
	ui.changeRoom(openRooms, challengeSprite, roomCombat);
}

function roomCombat(): void {
	if (g_currentRoom == g_startRoom) {
		// TODO special handling for start room
		roomCombatResolved(true);
	} else if (map.isRoomCleared(g_currentRoom)) {
		roomCombatResolved(true);
	} else {
		clearRoom(g_currentChallenge, roomCombatResolved);
	}
}

function roomCombatResolved(aliveCharacters: boolean): void {
	if (!doomCountdown()) aliveCharacters = false; // TODO: Special logic

	if (RUN_DEBUG) {
		console.log("roomCombatResolved: start");
	}
	if (!aliveCharacters) {
		// TODO END GAME
		console.log("Game end!");
		return;
	}
	chooseRoom();
}
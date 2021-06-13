import {ui} from "./ui/ui_def";
import {SpriteName} from "./ui/sprites";
import {clearRoom, resetCharacters} from "./mechanics/gameplay";
import {Challenge, Key, Keys_Obtained} from "./mechanics/core";
import * as map from "./map/rooms";
import {dropIntoRoom, getDoorId, getMessage} from "./map/rooms";
import {TextDisplayObject} from "./ui/interface";
import {doomCountdown, getRandomChallenge, KeyRooms} from "./mechanics/challenges";
import {Full_Party_Doom} from "./mechanics/challenges/doomroom";
import {AnimationObject} from "./ui/animation";
//import {downVoteNote, Note, postNewNote, upVoteNote} from "./api/apiportal";
import {Note} from "./map/rooms";
import {Fighter, Ranger, Thinker, Tinkerer} from "./mechanics/character";

const RUN_DEBUG: boolean = true;

let g_votes_given: number;
let g_startRoom: map.Room;
let g_currentRoom: map.Room;
let g_nextRooms: map.NextRooms;
let g_isMessageAvailable: boolean;
let g_currentChallenge: Challenge;
let g_currentDoor: number;
let g_messages_on_doors: Array<Note> = new Array<Note>();

function isMessageAvailable(): boolean {
	return g_isMessageAvailable && (Fighter.HP <= 0 || Ranger.HP <= 0 || Thinker.HP <= 0 || Tinkerer.HP <= 0);
}

function setMessageUsed(): void {
	g_isMessageAvailable = false;
}

function resetMessageUsed(): void {
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
	Keys_Obtained.resetKeys();
	resetCharacters();
	g_votes_given = 0;
	g_messages_on_doors.length = 0;

	let roomIndex = Math.floor(Math.random() * map.ROOMS.length);
	g_startRoom = map.ROOMS[roomIndex];
	while (g_startRoom.strategy != map.STANDARD) {
		roomIndex = Math.floor(Math.random() * map.ROOMS.length);
		g_startRoom = map.ROOMS[roomIndex];
	}
	console.log("startGame: start " + roomIndex.toString());
	g_currentRoom = g_startRoom;
	g_nextRooms = dropIntoRoom(map.ROOMS[45], g_currentRoom);
	ui.changeRoom([false, false, false], SpriteName.NO_SPRITE, chooseRoom);
}

const LEFT = 0;
const FRONT = 1;
const RIGHT = 2;
const BACK = 3;
const TEXT = 3;
const CANCEL = 4;

const MAX_TEXT_LENGTH = 25;

function joinMessages(messages: Array<Note>): string {
	let joined: string = "";
	for (let i: number = 0; i < messages.length; i++) {
		joined += messages[i].message + "\n";
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
	const leave: TextDisplayObject = new TextDisplayObject("Leave Message", "", !isMessageAvailable());
	if (left.disable && front.disable && right.disable) {
		gameEnd("The goblins find that their only exit back has been locked. They do not have all the required 7 keys. They will surely starve to death!");
		return;
	}
	ui.display("Where you want to go", [left, front, right, leave], new AnimationObject(), roomSelect);
}

function roomSelect(index: number): void {
	if (RUN_DEBUG) {
		console.log("roomSelect: start");
	}
	if (index == TEXT) {
		ui.display("Which door you want to leave message", [
			new TextDisplayObject("Left", joinMessages(getMessage(g_currentRoom, g_nextRooms.left)), false),
			new TextDisplayObject("Front", joinMessages(getMessage(g_currentRoom, g_nextRooms.front)), false),
			new TextDisplayObject("Right", joinMessages(getMessage(g_currentRoom, g_nextRooms.right)), false),
			new TextDisplayObject("Back", joinMessages(getMessage(g_currentRoom, g_nextRooms.back)), false),
			new TextDisplayObject("Cancel", "", false)], new AnimationObject(), selectRoomToLeaveNote);
	} else {
		// Move to new room
		const nextRoom = index == LEFT ? g_nextRooms.left : index == FRONT ? g_nextRooms.front : g_nextRooms.right;
		const messages: Array<Note> = getMessage(g_currentRoom, nextRoom);
		for (let i: number = 0; i < messages.length; i++) {
			g_messages_on_doors.push(messages[i]);
		}

		g_nextRooms = map.enterRoom(g_currentRoom, nextRoom);
		g_currentRoom = nextRoom;
		enterRoom();
	}
}

function selectRoomToLeaveNote(index: number): void {
	if (RUN_DEBUG) {
		console.log("selectRoomToLeaveNote: start");
	}
	if (index == LEFT) g_currentDoor = getDoorId(g_currentRoom, g_nextRooms.left);
	if (index == RIGHT) g_currentDoor = getDoorId(g_currentRoom, g_nextRooms.right);
	if (index == FRONT) g_currentDoor = getDoorId(g_currentRoom, g_nextRooms.front);
	if (index == BACK) g_currentDoor = getDoorId(g_currentRoom, g_nextRooms.back);

	if (index == CANCEL) {
		chooseRoom();
	}
	ui.inputText("Leave message", "", MAX_TEXT_LENGTH, saveText);
}

function saveText(text: string): void {
	// postNewNote(g_currentDoor, text); // TODO no return value handling, perhaps it went through
	setMessageUsed();
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
	let closedRooms: Array<boolean> = [!leftOpen, !frontOpen, !rightOpen];

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
	ui.changeRoom(closedRooms, challengeSprite, roomCombat);
}

function roomCombat(): void {
	if (g_currentRoom == g_startRoom) {
		if (Keys_Obtained.getKey() == Key.Platinum) gameEnd("You escaped the dungeon!");
		else roomCombatResolved(true);
	} else if (map.isRoomCleared(g_currentRoom)) {
		roomCombatResolved(true);
	} else {
		clearRoom(g_currentChallenge, roomCombatResolved);
	}
}

function roomCombatResolved(aliveCharacters: boolean): void {
	if (RUN_DEBUG) {
		console.log("roomCombatResolved: start");
	}

	if (!aliveCharacters) {
		console.log("Game end!");
		gameEnd("Your party has fallen.");
	} else if (!doomCountdown()) {
		console.log("DOOMED!");
		gameEnd("The curse has claimed the party, killing everyone.");
	} else {
		chooseRoom();
	}
}

function voteNotes(index: number): void {
	if (RUN_DEBUG) {
		console.log("voteNotes: start");
	}
	const message: Note = g_messages_on_doors.pop();
	if (index == 0 || index == 1) {
		g_votes_given++;
		if (index == 0) {
			console.log("up vote:", message.message, message.id); // TODO use actual instead
			// upVoteNote(message.id); // TODO no return value handling, perhaps it went through
		}
		if (index == 1) {
			console.log("down vote:", message.message, message.id);  // TODO use actual instead
			// downVoteNote(message.id); // TODO no return value handling, perhaps it went through
		}
	}
	if (g_votes_given > 3 || index == 3) {
		startGame();
		return;
	}
	const upVote: TextDisplayObject = new TextDisplayObject("Up vote", "Up vote this message so it will be more likely to show up later.", false);
	const downVote: TextDisplayObject = new TextDisplayObject("Down vote", "Down vote this message so it will be less likely to show up later.", false);
	const skipVote: TextDisplayObject = new TextDisplayObject("Skip vote", "Do not give vote for this message.", false);
	const stopVote: TextDisplayObject = new TextDisplayObject("End vote", "Stop voting messages", false);
	ui.display("\"" + g_messages_on_doors[g_messages_on_doors.length - 1].message + "\"", [upVote, downVote, skipVote, stopVote], undefined, voteNotes);
}

function gameEnd(explanation: string): void {
	if (RUN_DEBUG) {
		console.log("gameEnd: start");
	}
	const vote: TextDisplayObject = new TextDisplayObject("Vote on messages on doors", "Your fates are joined with those who come next!", false);
	const try_again: TextDisplayObject = new TextDisplayObject("Just try to escape dungeon again?", "Try again.", false);
	ui.display(explanation, [vote, try_again], undefined, gameEndDecision);
}

function gameEndDecision(index: number): void {
	if (RUN_DEBUG) {
		console.log("gameEndDecision: start");
	}
	if (index == 0) {
		voteNotes(2);
	}
	if (index == 1) {
		startGame();
	}
}
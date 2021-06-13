import {UserInterface} from "./ui";
import {SpriteName} from "./sprites";
import {Animation, AnimationObject, CHARACTER_COUNT} from "./animation";
import {clearRoom} from "../mechanics/gameplay";
import {getRandomChallenge} from "../mechanics/challenges";
import {Challenge} from "../mechanics/core";
import {TextDisplayObject} from "./interface";
import * as Characters from "../mechanics/character";

class RoomTextObject{
	text: string;
	choices: Array<TextDisplayObject>;
	follows: Array<number>;

	constructor(text: string, choices: Array<TextDisplayObject>, follows: Array<number>) {
		this.text = text;
		this.choices = choices;
		this.follows = follows;
	}
}

const DUDE_CHOICES = [
	new TextDisplayObject("Fighter", "Choose Fighter", false),
	new TextDisplayObject("Ranger", "Choose Ranger", true),
	new TextDisplayObject("Thinker", "Choose Thinker", false),
	new TextDisplayObject("Tinkerer", "Choose Tinkerer", false)
];

const ROOM_INTRO = [
	new RoomTextObject("You enter a room. It is dark.", [], []),
	new RoomTextObject("You see a questionable looking creature right ahead...", [], []),
		new RoomTextObject("...It looks like it wants to fight.",
			DUDE_CHOICES, [3, 4, 4, 4]),
	new RoomTextObject("You absolutely annihilate it.", [], [5]),
	new RoomTextObject("Whelp, he died. Your dude, that is.", [], [6]),
	new RoomTextObject("The end.", [], [7]),
	new RoomTextObject("The end (bad).", [], []),
]

let currentText = 0;


// Test room UI
export function roomDemo(ui: UserInterface){

	let room = getRandomChallenge();
	//room.craft_result = { damage: 5, resolution: "Crafty, not"};
	//room.smarts_result = { damage: 5, resolution: "Smart, not"};
	//room.precision_result = { damage: 5, resolution: "Exact, not"};
	//room.strength_result = { damage: 5, resolution: "Smashy, yes"};

	clearRoom(room, function (res: boolean){
		if (res){
			ui.changeRoom([true, true, false], SpriteName.ENEMY_QUESTIONABLE, function (){
				ui.display(ROOM_INTRO[0].text, ROOM_INTRO[0].choices, undefined, follows);
			});
		}
	});
	const characters = [Characters.Fighter, Characters.Ranger, Characters.Thinker, Characters.Tinkerer];

	function follows(ix: number){
		let next = currentText + 1;
		if (ROOM_INTRO[currentText].follows.length != 0){
			next = ROOM_INTRO[currentText].follows[ix];
		}

		if (next < ROOM_INTRO.length){

			if (ROOM_INTRO[next].choices.length == CHARACTER_COUNT){
				for (let i = 0; i < CHARACTER_COUNT; i++){
					ROOM_INTRO[next].choices[i].disable = characters[i].HP < 0.1;
				}
			}

			let anims = new AnimationObject();
			if (next == 3 || next == 4){
				anims.characterAnimations = [
					ix == 0 ? Animation.ACTION : Animation.IDLE,
					ix == 1 ? Animation.ACTION : Animation.IDLE,
					ix == 2 ? Animation.ACTION : Animation.IDLE,
					ix == 3 ? Animation.ACTION : Animation.IDLE,
				]
			}

			currentText = next;
			ui.display(ROOM_INTRO[next].text, ROOM_INTRO[next].choices, anims, function(ix){
				follows(ix);
			});
		}
		else{
			ui.inputText("This room is over, complain here.", "here.", 50, function(st){
				ui.display("You typed: " + st, [], undefined, function(ix){
				});
			})
		}
	}

}
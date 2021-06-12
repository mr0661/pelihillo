import {UserInterface} from "./ui";
import {SpriteName} from "./sprites";
import {Animation, AnimationObject} from "./animation";

class RoomTextObject{
	text: string;
	choices: Array<string>;
	follows: Array<number>;

	constructor(text: string, choices: Array<string>, follows: Array<number>) {
		this.text = text;
		this.choices = choices;
		this.follows = follows;
	}
}

const ROOM_INTRO = [
	new RoomTextObject("You enter a room. It is dark.", [], []),
	new RoomTextObject("You see a questionable looking creature right ahead...", [], []),
		new RoomTextObject("...It looks like it wants to fight.",
			["Send dude1", "Send dude2", "Send dude3", "Send dude4"], [3, 4, 4, 4]),
	new RoomTextObject("You absolutely annihilate it.", [], [5]),
	new RoomTextObject("Whelp, he died. Your dude, that is.", [], [6]),
	new RoomTextObject("The end.", [], [7]),
	new RoomTextObject("The end (bad).", [], []),
]

let currentText = 0;


// Test room UI
export function roomDemo(ui: UserInterface){
	ui.changeRoom([true, true, false], SpriteName.ENEMY_QUESTIONABLE, function (){
		ui.display(ROOM_INTRO[0].text, ROOM_INTRO[0].choices, undefined, follows);
	});


	function follows(ix: number){
		let next = currentText + 1;
		if (ROOM_INTRO[currentText].follows.length != 0){
			next = ROOM_INTRO[currentText].follows[ix];
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


		if (next < ROOM_INTRO.length){
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
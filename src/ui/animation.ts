export const CHARACTER_COUNT = 4;

export enum Animation{
	NOTHING, // Don't draw at all
	IDLE, // Default
	DEAD, // Long gone
	ACTION, // Active acting
	DEATH, // Active dying
}

export enum RoomAnimation{
	NONE,
	ROOM_ENTER// Slide-in
}



export class AnimationObject{
	enemyAnimation: Animation; // Enemy / whatever
	characterAnimations: Array<Animation>; // one for each player character
	roomAnimation: RoomAnimation;

	constructor() {
		this.enemyAnimation = undefined;
		this.characterAnimations = [];
		for (let i = 0; i < CHARACTER_COUNT; i++){
			this.characterAnimations.push(Animation.IDLE);
		}
		this.roomAnimation = undefined;
	}

	// Reset actions, except the dead stay dead
	reset(){
		let oldAnims = this.characterAnimations;
		this.characterAnimations = [];
		for (let i = 0; i < CHARACTER_COUNT; i++){
			// Don't override if dead
			 if (oldAnims.length < i || oldAnims[i] != Animation.DEAD){
				this.characterAnimations.push(Animation.IDLE);
			}
			else{
				this.characterAnimations.push(oldAnims[i]);
			}
		}
	}

	// Make characterIx'th character action mode, keep rest as they are
	action(characterIx: number){
		let oldAnims = this.characterAnimations;
		this.characterAnimations = [];
		for (let i = 0; i < CHARACTER_COUNT; i++){
			// Don't override if dead
			if (characterIx == i && (oldAnims.length < i || oldAnims[i] == Animation.IDLE)){
				this.characterAnimations.push(Animation.ACTION);
			}
			else if (oldAnims.length < i){
				this.characterAnimations.push(Animation.IDLE);
			}
			else{
				this.characterAnimations.push(oldAnims[i]);
			}
		}
	}
}

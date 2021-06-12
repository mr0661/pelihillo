
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
		this.roomAnimation = undefined;
	}
}

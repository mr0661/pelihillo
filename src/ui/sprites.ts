import {Coord} from "./coord";

export enum SpriteName{
	DOOR_LEFT_OPEN,
	DOOR_MIDDLE_OPEN,
	DOOR_RIGHT_OPEN,
	DOOR_LEFT_CLOSED,
	DOOR_MIDDLE_CLOSED,
	DOOR_RIGHT_CLOSED,
	CHAR_1_BACK,
	CHAR_2_BACK,
	CHAR_3_BACK,
	CHAR_4_BACK,
	CHAR_5_BACK, // Add more / less if needed
	CHAR_1_FRONT,
	CHAR_2_FRONT,
	CHAR_3_FRONT,
	CHAR_4_FRONT,
	CHAR_5_FRONT, // Add more / less if needed
	CHAR_1_DEAD, // Back, ded
	CHAR_2_DEAD,
	CHAR_3_DEAD,
	CHAR_4_DEAD,
	CHAR_5_DEAD, // Add more / less if needed
	ENEMY_QUESTIONABLE
}

let SPRITE_URLS = [
	"door_open.png",
	"door_open.png",
	"door_open.png",
	"door_closed.png",
	"door_closed.png",
	"door_closed.png",
	"char1_back.png",
	"char1_back.png",
	"char1_back.png",
	"char1_back.png",
	"char1_back.png",
	"char1_front.png",
	"char1_front.png",
	"char1_front.png",
	"char1_front.png",
	"char1_front.png",
	"char1_dead.png",
	"char1_dead.png",
	"char1_dead.png",
	"char1_dead.png",
	"char1_dead.png",
	"enemy1.png"
];

export
class Drawer{

	sprites: Array<HTMLImageElement>;
	spritesLoaded: number;

	constructor() {
		this.sprites = [];
		this.spritesLoaded = 0;

		for(let i = 0; i < SPRITE_URLS.length; i++){
			let sprite: HTMLImageElement = new Image();
			let me = this;
			sprite.src = "images/" + SPRITE_URLS[i];
			sprite.onload = function(){
				me.spritesLoaded++;
			};
			this.sprites.push(sprite);
		}
	}

	/**
	 * Return whether all sprites have been loaded.
	 */
	allSpritesLoaded(): boolean{
		return this.spritesLoaded == SPRITE_URLS.length;
	}

	drawSprite(context: CanvasRenderingContext2D, spriteName: SpriteName, position: Coord, scale: Coord){

		// Skip if sprite images don't exist
		if (!this.allSpritesLoaded()){
			return;
		}
		let image: HTMLImageElement = this.sprites[spriteName];
		let imageSize = new Coord(image.width, image.height);
		context.drawImage(image, position.x, position.y, scale.x * imageSize.x, scale.y * imageSize.y);
	}


}
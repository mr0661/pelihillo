import {Coord} from "./coord";

export enum SpriteName {
	NO_SPRITE,
	ROOM_BG,
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
	CHAR_1_FRONT,
	CHAR_2_FRONT,
	CHAR_3_FRONT,
	CHAR_4_FRONT,
	CHAR_1_DEAD, // Back, ded
	CHAR_2_DEAD,
	CHAR_3_DEAD,
	CHAR_4_DEAD,
	HPBAR,
	ENEMY_QUESTIONABLE,
	BLUE_DRAGON,
	GREEN_DRAGON,
	RED_DRAGON,
	PURPLE_DRAGON,
	YELLOW_DRAGON,
	BLUE_OOZE,
	GREEN_OOZE,
	RED_OOZE,
	YELLOW_OOZE,
	DOOM_ROOM,
	BOX_1,
	BOX_2,
	BOX_3,
	BOX_4,
	BOX_5,
	BOX_6,
	BOX_7,
	KEY_1,
	KEY_2,
	KEY_3,
	KEY_4,
	KEY_5,
	KEY_6,
	KEY_7,
	GHOST_SPIDER
}

let SPRITE_URLS = [
	"empty.png",
	"room.png",
	"door1_open.png",
	"door2_open.png",
	"door3_open.png",
	"door1_closed.png",
	"door2_closed.png",
	"door3_closed.png",
	"shaman.png",
	"archer.png",
	"tinker.png",
	"fighter_1.png",
	"shaman_hyokkays.png",
	"archer_hyokkays.png",
	"tinker_hyokkays.png",
	"fighter_hyokkays.png",
	"char1_dead.png",
	"char1_dead.png",
	"char1_dead.png",
	"char1_dead.png",
	"hp.png",
	"lohikaarme_generic.png",
	"lohikaarme_blue.png",
	"lohikaarme_green.png",
	"lohikaarme_red.png",
	"lohikaarme_purple.png",
	"lohikaarme_yellow.png",
	"ooze_blue.png",
	"ooze_green.png",
	"ooze_red.png",
	"ooze_yellow.png",
	"kuolemanhuone.png",
	"kaappi_ja_varjot1.png",
	"kaappi_ja_varjot2.png",
	"kaappi_ja_varjot3.png",
	"kaappi_ja_varjot4.png",
	"kaappi_ja_varjot5.png",
	"kaappi_ja_varjot6.png",
	"kaappi_ja_varjot7.png",
	"avain1.png",
	"avain2.png",
	"avain3.png",
	"avain4.png",
	"avain5.png",
	"avain6.png",
	"avain7.png",
	"hamahakki_generic.png"
];

export class Drawer {

	sprites: Array<HTMLImageElement>;
	spritesLoaded: number;

	constructor() {
		this.sprites = [];
		this.spritesLoaded = 0;

		for (let i = 0; i < SPRITE_URLS.length; i++) {
			let sprite: HTMLImageElement = new Image();
			let me = this;
			sprite.src = "images/" + SPRITE_URLS[i];
			sprite.onload = function () {
				me.spritesLoaded++;
			};
			this.sprites.push(sprite);
		}
	}

	/**
	 * Return whether all sprites have been loaded.
	 */
	allSpritesLoaded(): boolean {
		return this.spritesLoaded == SPRITE_URLS.length;
	}

	// Get scale which fits sprite to specified box
	fitSpriteToBox(spriteName: SpriteName, boxSize: Coord): Coord {
		const image: HTMLImageElement = this.sprites[spriteName];
		let imageSize = new Coord(image.width, image.height);
		let ratio = new Coord(boxSize.x / imageSize.x, boxSize.y / imageSize.y);
		if (ratio.x < ratio.y) {
			return new Coord(ratio.x, ratio.x);
		} else {
			return new Coord(ratio.y, ratio.y);
		}
	}

	getSpriteSize(spriteName: SpriteName, scale?: number) {
		scale = scale || 1;
		let image: HTMLImageElement = this.sprites[spriteName];
		let imageSize = new Coord(image.width, image.height);
		return imageSize.multiply(scale);
	}

	drawSprite(context: CanvasRenderingContext2D, spriteName: SpriteName, position: Coord, scale: Coord) {

		// Skip if sprite images don't exist
		if (!this.allSpritesLoaded()) {
			return;
		}
		let image: HTMLImageElement = this.sprites[spriteName];
		let imageSize = new Coord(image.width, image.height);
		context.drawImage(image, position.x, position.y, scale.x * imageSize.x, scale.y * imageSize.y);
	}

	drawSpriteHorizontalClipped(context: CanvasRenderingContext2D, spriteName: SpriteName,
								position: Coord, scale: Coord, clipXRatio: number) {

		// Skip if sprite images don't exist
		if (!this.allSpritesLoaded()) {
			return;
		}
		let image: HTMLImageElement = this.sprites[spriteName];
		let imageSize = new Coord(image.width, image.height);
		context.drawImage(image, 0, 0, clipXRatio * imageSize.x, imageSize.y,
			position.x, position.y, scale.x * imageSize.x * clipXRatio, scale.y * imageSize.y);
	}


}
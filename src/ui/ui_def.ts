import {UserInterface} from "./ui";

// Game input, textinput is separate
export enum InputMode{
	INPUT_MOUSE,
	INPUT_KB
}

export let ui: UserInterface = new UserInterface();

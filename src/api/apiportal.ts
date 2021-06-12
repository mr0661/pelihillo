import { getTexts, postNewText, upVoteText, downVoteText } from './api.js';

export async function getNotes(id: number){
	return await getTexts(id);
};

export async function postNewNote(id: number, msg: string){
	const message: object = {note: msg};
	return await postNewText(id, message);
};

export async function upVoteNote(id: number){
	return await upVoteText(id);
};

export async function downVoteNote(id: number){
	return await downVoteText(id);
};
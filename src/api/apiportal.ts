import { getTexts, postNewText, upVoteText, downVoteText } from './api.js';

export async function getNotes(id: number){
	return await getTexts(id);
};

export async function postNewNote(id: number){
	return await postNewText(id);
};
export async function upVoteNote(id: number, msg: string){
	const message: object = {note: msg};
	return await upVoteText(id, message);
};
export async function downVoteNote(id: number){
	return await downVoteText(id);
};
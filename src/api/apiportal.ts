import { getTexts, postNewText, upVoteText, downVoteText } from './api';

export interface Note{
	id: number;
	message: string;
};

export async function getNotes(id: number){
	let notes: Array<Note> = new Array<Note>();
	let respond = await getTexts(id);
	respond.map(oneNote => {
		let note: Note = {
			id: oneNote.id,
			message: oneNote.note
		};
		notes.push(note);
	})
	return notes;
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
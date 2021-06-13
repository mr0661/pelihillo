import axios from 'axios';

const noteURI = 'http://localhost:3001/api/notes';

// Get notes by door ID.
export const getTexts = async (id: number) => {
	const res = await axios.get(`${noteURI}/${id}`);
	return res.data;
};

// Post new note by door ID.
export const postNewText = async (id: number, msg: object) => {
	const res = await axios.post(`${noteURI}/${id}`, msg);
	return res.data;
};

// Upvote note by note ID.
export const upVoteText = async (id: number) => {
	const res = await axios.patch(`${noteURI}/up/${id}`);
	return res.data;
};

// Downvote note by note ID.
export const downVoteText = async (id: number) => {
	const res = await axios.patch(`${noteURI}/down/${id}`);
	return res.data;
};
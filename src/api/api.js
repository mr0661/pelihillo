const axios = require('axios').default;

const noteURI = 'http://localhost:3001/api/notes';

// Get notes by door ID.
const getTexts = async (id) => {
	const res = await axios.get(`${noteURI}/${id}`);
	return res.data;
};

// // Post new note by door ID.
const postNewText = async (id, msg) => {
	console.log('id', id)
	console.log('msg', msg)
	const res = await axios.post(`${noteURI}/${id}`, msg);
	return res.data;
};

// // Upvote note by note ID.
const upVoteText = async (id) => {
	const res = await axios.patch(`${noteURI}/up/${id}`);
	return res.data;
};

// // Downvote note by note ID.
const downVoteText = async (id) => {
	const res = await axios.patch(`${noteURI}/down/${id}`);
	return res.data;
};

module.exports = { getTexts, postNewText, upVoteText, downVoteText };
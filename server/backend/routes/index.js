var express = require('express');
var router = express.Router();
const config = require('../utils/config');
const options = config.DATABASE_OPTIONS;
const knex = require('knex')(options);

// Get all notes from given door, ordered by total points.
router.get('/notes/:id', (req, res, next) => {
    const id = req.params.id;
    knex.select('*', knex.raw('(up + down) as points')).from('notes').where('door_id', id).orderBy('points', 'desc')
        .then(notes => {
            res.status(200).json(notes);
        })
        .catch(err => {
            res.status(500).json({error: 'Database error while getting request.'});
        });
});

// Post new note and delete lowest (if there are 3 notes already).
router.post('/notes/:id', (req, res, next) => {
    const id = req.params.id;
    const newNote = {door_id: req.params.id, up: 0, down: 0, note: req.body.note};
    knex.select('note_id', 'door_id', knex.raw('(up + down) as points')).from('notes').where('door_id', id).orderBy('points', 'desc')
        .then(notes => {
            if(notes.length >= 3) {
                knex('notes').where('note_id', notes[notes.length - 1].note_id).del().then(delBoolean => {
                    knex('notes').insert(newNote).then(added => {
                            res.status(200).json("ok");
                    }).catch(err => {
                            res.status(500).json({error: 'Database error while getting request.'});
                    });
                }).catch(err => {
                    res.status(500).json({error: 'Database error while getting request.'});
                });
            } else {
                knex('notes').insert(newNote).then(added => {
                    res.status(200).json("ok");
                }).catch(err => {
                        res.status(500).json({error: 'Database error while getting request.'});
                });
            };
        }).catch(err => {
        res.status(500).json({error: 'Database error while getting request.'});
    });
});

// Upvote note.
router.patch('/notes/up/:id', (req, res, next) => {
    const id = req.params.id;
        knex('notes').where('note_id', id).increment({up: 1}).then(upVoted => {
            res.status(200).json("Note has been upvoted.");
        }).catch(err => {
                res.status(500).json({error: 'Database error while upvoting.'});
        });
});

// Downvote note.
router.patch('/notes/down/:id', (req, res, next) => {
    const id = req.params.id;
        knex('notes').where('note_id', id).decrement({down: 1}).then(downVoted => {
            res.status(200).json("Note has been downvoted.");
        }).catch(err => {
                res.status(500).json({error: 'Database error while downvoting.'});
        });
});

module.exports = router;
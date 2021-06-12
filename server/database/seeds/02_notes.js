exports.seed = function (knex, Promise) {
    return knex("notes").del()
    .then(function () {
        return knex("notes").insert([
            {note_id: 1, door_id: 1, note: "Golden key: Turn right on next room.", up: 5, down: 0},
            {note_id: 2, door_id: 7, note: "Treasures lie behind this door :)", up: 2, down: -3},
            {note_id: 3, door_id: 12, note: "Go right, straigt, left, right for Blue key.", up: 12, down: -4},
            {note_id: 4, door_id: 12, note: "This game sucks!", up: 7, down: -10},
            {note_id: 5, door_id: 12, note: "Not sure if this a right way - or way to die again.", up: 10, down: -3}
        ]);
    });
};
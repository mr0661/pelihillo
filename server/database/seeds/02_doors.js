const roomGrid = require('./settings/settings')

exports.seed = function (knex, Promise) {
    return knex("doors").del()
        .then(async function () {
            const doorList = [];
            const roomAmount = roomGrid[0].roomGrid;
            const doorsInRoom = roomGrid[0].doorsInRoom;
            var i;
            var r = 1;
            for (i = 1; i <= roomAmount * doorsInRoom; i++) {
                doorList.push({door_id: i, room_id: r},);
                if (i % doorsInRoom === 0) {
                    r++;
                }
                ;
            }
            ;
            await knex("doors").insert(doorList);
        });
};
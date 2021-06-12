const roomGrid = require('./settings/settings')

exports.seed = function (knex, Promise) {
    return knex("rooms").del()
        .then(async function () {
            const roomList = [];
            const roomAmount = roomGrid[0].roomGrid;
            var i;
            for (i = 1; i <= roomAmount; i++) {
                roomList.push({room_id: i},);
            }
            ;
            await knex("rooms").insert(roomList);
        });
};
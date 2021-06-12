exports.up = function (knex, Promise) {
    return knex.schema
        .createTable("rooms", t => {
            t.increments("room_id").primary();
        })
        .createTable("doors", t => {
            t.increments("door_id").primary();
            t.integer("room_id").unsigned().references("room_id").inTable("rooms").nullable().onDelete("cascade");
        })
        .createTable("notes", t => {
            t.increments("note_id").primary();
            t.integer("door_id").unsigned().references("door_id").inTable("doors").nullable().onDelete("cascade");
            t.string("note", 200).notNullable();
            t.integer("up", 5).notNullable().default(0);
            t.integer("down", 5).notNullable().default(0);
        })
};
exports.down = function (knex, Promise) {
    return knex.schema
        .dropTableIfExists("notes")
        .dropTableIfExists("doors")
        .dropTableIfExists("rooms");
};
const { Events } = require("discord.js");
const fs = require("fs");

module.exports = {
    setup(client) {
        client.once(Events.ClientReady, async () => {
            const { load_db, save_db } = require("../module_database.js");
            const db = load_db();
            if (!db.guess_num) {
                db.guess_num = {};
                save_db(db);
            };
            if (!db.counting_num) {
                db.counting_num = 0;
                save_db(db);
            };
            if (!db.counting_highest) {
                db.counting_highest = db.counting_num;
                save_db(db);
            };
        });
    },
};
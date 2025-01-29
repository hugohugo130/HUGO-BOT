module.exports = {
    run: async function (client) {
        try {
            const { sleep } = require("../module_sleep.js");
            const { load_db, save_db } = require("../module_database.js");
            const { default_value } = require("../config.json");
            let db = load_db();
            if (!db.vote.active) return;
            const endtime = db.vote.endtime;
            const now = Date.now() / 1000;
            if (now + 10 < endtime) return;
            const message = client.channels.cache.get(db.vote.channel_id).messages.cache.get(db.vote.message_id);
            if (!message) return;
            if (endtime <= now + 120) {
                while (Math.abs(Date.now() / 1000 - endtime) > 0.5) {
                    await sleep(100);
                };
            };
            const participants = db.vote.participants;
            const highest = Math.max(...Object.values(participants).map(p => p.count));
            const highest_option = Object.keys(participants).find(key => participants[key].count === highest);
            const highest_option_name = participants[highest_option].option;
            await message.reply(`投票結束!，結果是${highest_option_name}，獲得了${highest}票!`);
            db.vote = default_value["db.json"].vote;
            save_db(db);
        } catch (error) {
            require("../module_senderr.js").senderr({ client: client, msg: `處理投票時出錯：${error.stack}`, clientready: true });
        };
    },
};
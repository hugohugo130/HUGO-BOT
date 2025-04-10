const { EmbedBuilder } = require("discord.js");

module.exports = {
    run: async function (client) {
        try {
            const { sleep } = require("../../module_sleep.js");
            const { load_db, save_db } = require("../../module_database.js");
            const { default_value } = require("../../config.json");
            let db = load_db();
            if (!db.vote.active) return;
            const endtime = db.vote.endtime;
            let now = Date.now() / 1000;
            if (now < endtime + 60) return;
            const channel = await client.channels.fetch(db.vote.channel_id);
            const message = await channel.messages.fetch(db.vote.message_id);
            if (!message) return;
            if (endtime <= now + 60) {
                while (Math.abs(Date.now() / 1000 - endtime) > 0.5) {
                    if (now > endtime) break;
                    await sleep(100);
                    now = Date.now() / 1000;
                };
            };
            const participants = db.vote.participants;
            const highest = Math.max(...Object.values(participants).map(p => p.count));
            const highest_option = Object.keys(participants).find(key => participants[key].count === highest);
            const highest_option_name = participants[highest_option].option;
            const vote_ended_embed = new EmbedBuilder()
                .setTitle("投票結束！")
                .setDescription(`結果是${highest_option_name}，獲得了${highest}票!`)
                .setColor(0x00BBFF);

            await message.reply({ embeds: [vote_ended_embed] });
            db.vote = default_value["db.json"].vote;
            save_db(db);
        } catch (error) {
            require("../../module_senderr.js").senderr({ client: client, msg: `處理投票時出錯：${error.stack}`, clientready: true });
        };
    },
};
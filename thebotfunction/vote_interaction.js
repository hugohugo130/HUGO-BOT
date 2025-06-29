const { Events, EmbedBuilder } = require("discord.js");

module.exports = {
    setup(client) {
        client.on(Events.InteractionCreate, async (interaction) => {
            if (!interaction.isButton()) return;
            if (!interaction.customId.startsWith("vote_")) return;
            const { load_db, save_db } = require("../module_database.js");

            let db = load_db();
            if (!db.vote.active) return;
            if (db.vote.message_id !== interaction.message.id) return;
            const index = interaction.customId.split("_")[1];

            // 檢查用戶是否已經投過票
            let hasVoted = false;
            let previousVoteIndex = -1;
            for (const [i, participant] of Object.entries(db.vote.participants)) {
                if (participant.user_ids.includes(interaction.user.id)) {
                    hasVoted = true;
                    previousVoteIndex = i;
                    break;
                };
            };

            if (hasVoted) {
                // 如果已經投過票，先移除之前的票
                db.vote.participants[previousVoteIndex].count--;
                db.vote.participants[previousVoteIndex].user_ids = db.vote.participants[previousVoteIndex].user_ids.filter(id => id !== interaction.user.id);
            };

            // 新增新的投票
            db.vote.participants[index].count++;
            db.vote.participants[index].user_ids.push(interaction.user.id);

            const option_choose_result_embed = new EmbedBuilder()
                .setTitle("投票結果")
                .setColor(0x00BBFF)
                .addFields(
                    ...Object.entries(db.vote.participants).map(([i, participant]) => ({
                        name: db.vote.options[i],
                        value: `票數: ${participant.count}票${db.vote.anonymous ? "" : `\n投票者: ${participant.user_ids.map(id => `<@${id}>`).join(", ") || "無"}`}`
                    }))
                );

            await interaction.update({ embeds: [interaction.message.embeds[0], option_choose_result_embed], components: [interaction.message.components[0]] });
            save_db(db);
        });
    },
};

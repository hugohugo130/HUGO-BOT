const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("結束投票")
        .setDescription("結束一個投票")
        .setNameLocalizations({
            "zh-TW": "結束投票",
            "zh-CN": "结束投票",
            "en-US": "end_vote",
        })
        .setDescriptionLocalizations({
            "zh-TW": "結束一個投票",
            "zh-CN": "结束一个投票",
            "en-US": "End a vote",
        }),
    async execute(interaction) {
        const { load_db, save_db, loadData } = require("../../module_database.js");
        await interaction.deferReply();
        let db = load_db();
        if (!db.vote.active) return interaction.editReply({ content: "目前沒有投票進行中" });
        if (db.vote.host !== interaction.user.id && !loadData(interaction.user.id).admin) return interaction.editReply({ content: "你不是投票發起者或機器人管理員，無法使用此指令" });
        let message;
        message = await interaction.channel.messages.fetch(db.vote.message_id);
        if (!message) {
            for (const channel of interaction.guild.channels.cache.values().filter(channel => channel.id !== interaction.channel.id)) {
                const msg = await channel.messages.fetch(db.vote.message_id);
                if (msg) {
                    message = msg;
                    break;
                };
            };
        };
        if (!message) return interaction.editReply({ content: "找不到投票訊息，也許投票訊息被刪除 或者 訊息不在這個頻道" });
        await message.edit({ content: "投票已被發起者或機器人管理員結束", embeds: [], components: [] });
        db.vote.active = false;
        save_db(db);
        return interaction.editReply({ content: "已結束投票" });
    },
};
const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("繼續猜數字")
        .setDescription("繼續遊玩猜數字遊戲 continue guess the number"),
    async execute(interaction) {
        const { load_db, save_db } = require("../../module_database.js");
        let db = load_db();
        const userid = interaction.user.id;
        if (!db.guess_num[userid]) {
            const cmdname = "猜數字";
            const cmdid = "1316360582345265182";
            interaction.reply(`你還沒有開始遊戲，請先使用 </${cmdname}:${cmdid}> 開始遊戲`);
            return;
        };
        const oldmsg = interaction.guild.channels.cache.get(db.guess_num[userid].channelid).messages.cache.get(db.guess_num[userid].msgid);
        const msg = await interaction.reply(`遊戲繼續！最小數字為 ${db.guess_num[userid].min}，最大數字為 ${db.guess_num[userid].max}，請猜數字 (記得要回覆這條訊息哦!)`);
        if (oldmsg) {
            await oldmsg.edit(`訊息已被移動: ${msg.url}`);
        };
        db.guess_num[userid].msgid = msg.id;
        save_db(db);
    },
};

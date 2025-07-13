const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("猜數字遊戲")
        .setDescription("開始猜數字遊戲")
        .setNameLocalizations({
            "zh-TW": "猜數字遊戲",
            "zh-CN": "猜数字游戏",
            "en-US": "guess_the_number_game",
        })
        .setDescriptionLocalizations({
            "zh-TW": "開始猜數字遊戲",
            "zh-CN": "开始猜数字游戏",
            "en-US": "Start guessing the number game",
        })
        .addIntegerOption(option =>
            option.setName("min")
                .setDescription("最小數字")
                .setRequired(true)
        )
        .addIntegerOption(option =>
            option.setName("max")
                .setDescription("最大數字")
                .setRequired(true),
        ),
    async execute(interaction) {
        const { load_db, save_db } = require("../../../module_database.js");
        const min = interaction.options.getInteger("min");
        const max = interaction.options.getInteger("max");
        let db = load_db();
        const initialMsg = await interaction.reply({
            content: "正在初始化...",
            withResponse: true
        });
        const number = Math.floor(Math.random() * (max - min + 1)) + min;
        const restart = Boolean(db.guess_num[interaction.user.id]);
        db.guess_num[min === max ? interaction.client.user.id : interaction.user.id] = {
            min: min,
            max: max,
            number: number,
            guess: [],
            userid: min === max ? interaction.client.user.id : interaction.user.id,
            msgid: initialMsg.id,
            channelid: interaction.channel.id,
        };
        save_db(db);
        await interaction.editReply(`遊戲${restart ? "重新" : ""}開始！最小數字為 ${min}，最大數字為 ${max}，請猜數字 (記得要回覆這條訊息哦!)`);
    },
};

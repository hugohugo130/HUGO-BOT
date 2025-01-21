const { SlashCommandBuilder } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("建立問題")
        .setDescription("建立一個問題，讓大家回答 question")
        .addNumberOption(option =>
            option.setName("數量")
                .setDescription("答對的人該獲得多少哈狗幣")
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName("問題")
                .setDescription("要建立的問題")
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName("正確解答")
                .setDescription("正確解答(可用英文逗號分隔, 空格也會算是一個答案哦!)")
                .setRequired(true),
        ),
    execute() { }
};
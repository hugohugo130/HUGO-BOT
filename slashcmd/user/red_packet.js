const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('紅包')
        .setDescription('發起紅包 red packet')
        .addNumberOption(option =>
            option.setName("數量")
                .setDescription("哈狗幣數量")
                .setRequired(true),
        )
        .addIntegerOption(option =>
            option.setName("封")
                .setDescription("發起多少封紅包")
                .setRequired(true),
        )
        .addStringOption(option =>
            option.setName("時間")
                .setDescription("結束時間, 時間單位可以是m,h,d或w (分,時,日,週) 例如 1d 表示一天")
                .setRequired(true),
        ),
    execute() { }
};
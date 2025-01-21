const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName("生成定期付款資料")
        .setDescription("生成定期付款資料")
        .addNumberOption(option =>
            option.setName("金額")
                .setDescription("用户要扣款的金額")
                .setRequired(true),
        )
        .addIntegerOption(option =>
            option.setName("次數")
                .setDescription("分多少期")
                .setRequired(true),
        )
        .addIntegerOption(option =>
            option.setName("間隔")
                .setDescription("每多少天扣一次")
                .setRequired(true),
        )
        .addBooleanOption(option =>
            option.setName("fullint")
                .setDescription("扣款金額是否可以被次數整除(可自動計算)")
                .setRequired(false),
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const amount = interaction.options.getNumber("金額");
        const times = interaction.options.getInteger("次數");
        const interval = interaction.options.getInteger("間隔");
        const fullint = interaction.options.getBoolean("fullint") ?? amount % times === 0;
        const lastrundate = "1970 1 1";
        const nextreduce = amount / times;
        const data = {
            remainamount: amount,
            latestrundate: lastrundate,
            fullint: fullint,
            nextreduce: nextreduce,
            intervalday: interval,
            times: times,
        };
        await interaction.editReply({ content: `已成功生成定期付款資料，資料如下：\n\`${JSON.stringify(data)}\`` });
    },
};
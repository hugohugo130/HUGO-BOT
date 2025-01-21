const { SlashCommandBuilder, ChannelType } = require("discord.js");

module.exports = {
    data: new SlashCommandBuilder()
        .setName("提及用戶")
        .setDescription("提及用戶 tag member")
        .addUserOption(option =>
            option.setName("提及的用戶")
                .setDescription("選擇用戶並提及")
                .setRequired(true),
        )
        .addIntegerOption(option =>
            option.setName("提及次數")
                .setDescription("要提及的次數")
                .setRequired(true)
                .setMinValue(1)
                .setMaxValue(10),
        )
        .addChannelOption(option =>
            option.setName("發送在哪個頻道")
                .setDescription("選擇頻道,我會發送訊息在你選擇的頻道")
                .setRequired(true)
                .addChannelTypes(ChannelType.GuildText),
        ),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        let user = await interaction.options.getUser("提及的用戶");
        let num = await interaction.options.getInteger("提及次數");
        let channel = await interaction.options.getChannel("發送在哪個頻道");
        await interaction.editReply("正在提及!");
        await channel.send(`以下的tag是 ${interaction.user.toString()} 讓我tag的哦~`);
        for (var i = 0; i < num; i++) {
            await channel.send(`<@${user.id}>`);
        };
    },
};
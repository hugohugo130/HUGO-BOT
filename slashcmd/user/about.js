const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('關於')
        .setDescription('關於機器人')
        .setNameLocalizations({
            "zh-TW": "關於",
            "zh-CN": "关于",
            "en-US": "about",
        })
        .setDescriptionLocalizations({
            "zh-TW": "關於機器人",
            "zh-CN": "关于机器人",
            "en-US": "About the bot",
        }),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });
        const { HugoUserID } = require("../../config.json");

        // 取得機器人資訊
        const botName = interaction.client.user.username;
        const botId = interaction.client.user.id;
        const serverCount = interaction.client.guilds.cache.size;
        const commandCount = interaction.client.application.commands.cache.size;

        // 構建回覆訊息
        const reply = `
            **機器人名稱**: ${botName}
            **機器人ID**: ${botId}
            **作者**: <@${HugoUserID}>
            **加入的伺服器數量**: ${serverCount}
            **斜線指令數量**: ${commandCount}
        `;

        await interaction.editReply(reply);
    }
};

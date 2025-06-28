const { SlashCommandBuilder } = require('discord.js');
const { loadData } = require('../../module_database.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('我的訊息數量')
        .setDescription('查看你的訊息數量')
        .setNameLocalizations({
            "zh-TW": "我的訊息數量",
            "zh-CN": "我的消息数量",
            "en-US": "my_message_count",
        })
        .setDescriptionLocalizations({
            "zh-TW": "查看你的訊息數量",
            "zh-CN": "查看你的消息数量",
            "en-US": "View your message count",
        }),
    async execute(interaction) {
        await interaction.deferReply();
        let userid = interaction.user.id;
        let data = loadData(userid);
        let message_count = data.message_count;
        let e_count = data.count_for_e;
        await interaction.editReply(`你累積發送了${message_count}條訊息，其中${e_count}條含有` + "`e`");
    }
};
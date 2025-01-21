const { SlashCommandBuilder, EmbedBuilder, embedLength } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('獲取訊息資訊')
        .setDescription('獲取伺服器中訊息的資訊 messageinfo')
        .addStringOption(option =>
            option.setName("訊息id")
                .setDescription("含有embed的訊息的id")
                .setRequired(true),
        )
        .addChannelOption(option =>
            option.setName("頻道")
                .setDescription("如果訊息不在此頻道,請選擇頻道"),
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const { loadData } = require("../../module_database.js");
        let user = interaction.user;
        if (!loadData(user.id).admin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
        let msgid = interaction.options.getString("訊息id");
        if (isNaN(parseInt(msgid))) return await interaction.editReply("訊息id必須是數字!");
        let channel = interaction.options.getChannel("頻道") ?? interaction.channel;
        let msg = await channel.messages.fetch({ message: msgid });
        let msgcontent = msg.content ? "```\n" + msg.content + "\n```" : "[\\/無/\\]";
        let username = user.globalName || user.username;
        if (!msg) return await interaction.editReply("找不到訊息!");
        let embedlength = (msg.embeds ? msg.embeds.length : 0).toString();
        let response_embed = new EmbedBuilder()
            .setTitle(`訊息資訊`)
            .addFields(
                { name: "訊息內容", value: msgcontent },
                { name: "embed數量", value: embedlength },
                { name: "訊息發送者", value: username },
            );
        await interaction.editReply({ embeds: [response_embed] });
    },
};
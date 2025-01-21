const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('獲取頻道資訊')
        .setDescription('選取頻道後獲取頻道的資訊 query channel')
        .addChannelOption(option =>
            option.setName("頻道")
                .setDescription("要獲取資訊的頻道"),
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const { loadData } = require("../../module_database.js");
        if (!loadData(interaction.user.id).admin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
        let channel = interaction.options.getChannel("頻道") ?? interaction.channel;
        let embed = new EmbedBuilder()
            .setTitle(`${channel.name}的資訊`)
            .setColor((0, 187, 255));
        let messages = []
        if (channel.lastMessage) {
            const fetchmessages = await channel.messages.fetch({ limit: 10 });
            let msgs = fetchmessages.map(msg => msg).reverse();
            if (msgs) {
                msgs.forEach(msg => {
                    if (msg.author.bot) return messages.slice(messages.indexOf(msg), 1);
                    messages.push(`[<t:${Math.floor(msg.createdTimestamp / 1000)}>]${msg.author.globalName || msg.author.username}: ${msg.content}`);
                });
            };
        };
        messages = messages.join("\n");
        let name = channel.name;
        let id = channel.id.toString();
        let createts = `<t:${Math.floor(channel.createdTimestamp / 1000)}:F>`
        let nsfw = channel.nsfw;
        let url = channel.url;
        let isVoiceBased = channel.isVoiceBased();
        let slowmoderate = channel.rateLimitPerUser;
        let viewable = channel.viewable;
        embed.addFields(
            { name: "頻道名稱", value: name },
            { name: "頻道ID", value: id },
            { name: "頻道創建時間", value: createts },
            { name: "頻道近10條訊息", value: messages ?? "找不到" },
            { name: "18+限制級頻道", value: nsfw ? "是" : "否" },
            { name: "url", value: "`" + url + "`" + " " + url },
            { name: "語音頻道", value: isVoiceBased ? "是" : "否" },
            { name: "慢速模式冷卻時間(秒)", value: slowmoderate == 0 ? "未啟用慢速模式" : slowmoderate.toString() },
            { name: "機器人可查看此頻道", value: viewable ? "是" : "否" },
        );
        await interaction.editReply({ embeds: [embed] });
    },
};

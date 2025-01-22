const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('伺服器資訊')
        .setDescription('查看本伺服器的資訊 serverinfo')
        .addBooleanOption(option =>
            option.setName("快速模式")
                .setDescription("快速模式可能不準確,預設啟用,這可以讓機器人回覆更快"),
        ),
    async execute(interaction) {
        await interaction.deferReply();
        const fastmode = interaction.options.getBoolean("快速模式") ?? true;
        if (!fastmode) await interaction.editReply("正在獲取資訊....");

        const guild = interaction.guild;
        const createts = Math.floor(guild.createdTimestamp / 1000);
        const guildid = guild.id;
        const guildname = guild.name;
        const owner = interaction.client.users.cache.get(guild.ownerId);
        const partnered = guild.partnered;
        const preferredLocale = guild.preferredLocale;
        const description = guild.description ?? "無";
        const verified = guild.verified;
        const icon = guild.iconURL();
        const rulesChannelId = guild.rulesChannelId;

        let channels;
        let lenemoji;
        let leninvite;
        let members;
        let lenroles;
        let lenstickers;

        if (fastmode) {
            channels = guild.channels.cache
            lenemoji = guild.emojis.cache.size;
            leninvite = guild.invites.cache.size;
            members = guild.members.cache;
            lenroles = guild.roles.cache.size;
            lenstickers = guild.stickers.cache.size;
        } else {
            channels = await guild.channels.fetch()
            lenemoji = (await guild.emojis.fetch()).size;
            leninvite = (await guild.invites.fetch()).size;
            members = await guild.members.fetch();
            lenroles = (await guild.roles.fetch()).size;
            lenstickers = (await guild.stickers.fetch()).size;
        };

        const lenchannel = channels.size;
        const lenmembervoice = members.filter(member => member.voice.channel).size;
        const humans = members.filter(member => !member.user.bot).size;
        const bots = members.filter(member => member.user.bot).size;
        const lenvoice = guild.channels.cache.filter(channel => channel.type === 'GUILD_VOICE').size;

        let embed = new EmbedBuilder()
            .setTitle("伺服器資訊")
            .setColor(0x00BBFF)
            .addFields(
                { name: "伺服器名稱", value: guildname, inline: true },
                { name: "伺服器描述", value: description, inline: true },
                { name: "服主", value: owner.toString(), inline: true },
                { name: "伺服器ID", value: guildid.toString(), inline: true },
                { name: "創建於", value: `<t:${createts}> <t:${createts}:T> (<t:${createts}:R>)`, inline: true },
                { name: "總成員數量", value: members.size.toString(), inline: true },
                { name: "成員數量", value: humans.toString(), inline: true },
                { name: "機器人數量", value: bots.toString(), inline: true },
                { name: "頻道數量", value: lenchannel.toString(), inline: true },
                { name: "表情符號數量", value: lenemoji.toString(), inline: true },
                { name: "語音頻道數量", value: lenvoice.toString(), inline: true },
                { name: "語音頻道成員數量", value: lenmembervoice.toString(), inline: true },
                { name: "伺服器邀請數量", value: leninvite.toString(), inline: true },
                { name: "身份組數量", value: lenroles.toString(), inline: true },
                { name: "貼圖數量", value: lenstickers.toString(), inline: true },
                { name: "伺服器是否Discord合作夥伴", value: partnered ? "是" : "否", inline: true },
                { name: "伺服器地區", value: preferredLocale, inline: true },
                { name: "規則頻道", value: rulesChannelId ? `<#${rulesChannelId}>` : "無", inline: true },
                { name: "伺服器已驗證", value: verified ? "是" : "否", inline: true },
            )
            .setThumbnail(icon);

        await interaction.editReply({ embeds: [embed] });
    }
};

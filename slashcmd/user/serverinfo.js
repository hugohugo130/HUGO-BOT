const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('伺服器資訊')
        .setDescription('查看本伺服器的資訊 serverinfo'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        let guild = interaction.guild;
        let lenchannel = (await guild.channels.fetch()).size;
        let createts = Math.floor(guild.createdTimestamp / 1000);
        let description = guild.description ?? "無";
        let lenemoji = (await guild.emojis.fetch()).size;
        let guildid = guild.id;
        let leninvite = (await guild.invites.fetch()).size;
        let members = await guild.members.fetch();
        let lenmembervoice = members.filter(member => member.voice.channel).size;
        let humans = members.filter(member => !member.user.bot).size;
        let bots = members.filter(member => member.user.bot).size;
        let guildname = guild.name;
        let owner = interaction.guild.owner;
        let partnered = guild.partnered;
        let preferredLocale = guild.preferredLocale;
        let lenroles = (await guild.roles.fetch()).size;
        let rulesChannelId = guild.rulesChannelId;
        let lenstickers = (await guild.stickers.fetch()).size;
        let verified = guild.verified;
        let lenvoice = guild.channels.cache.filter(channel => channel.type === 'GUILD_VOICE').size;
        let icon = guild.iconURL();

        let embed = new EmbedBuilder()
            .setTitle("伺服器資訊")
            .addFields(
                { name: "伺服器名稱", value: guildname },
                { name: "伺服器描述", value: description },
                { name: "服主", value: owner.toString() },
                { name: "伺服器ID", value: guildid.toString() },
                { name: "創建於", value: `<t:${createts}> <t:${createts}:T> (<t:${createts}:R>)` },
                { name: "總成員數量", value: members.size.toString() },
                { name: "成員數量", value: humans.toString() },
                { name: "機器人數量", value: bots.toString() },
                { name: "頻道數量", value: lenchannel.toString() },
                { name: "表情符號數量", value: lenemoji.toString() },
                { name: "語音頻道數量", value: lenvoice.toString() },
                { name: "語音頻道成員數量", value: lenmembervoice.toString() },
                { name: "伺服器邀請數量", value: leninvite.toString() },
                { name: "身份組數量", value: lenroles.toString() },
                { name: "貼圖數量", value: lenstickers.toString() },
                { name: "伺服器是否Discord合作夥伴", value: partnered ? "是" : "否" },
                { name: "伺服器地區", value: preferredLocale },
                { name: "規則頻道", value: rulesChannelId ? `<#${rulesChannelId}>` : "無" },
                { name: "伺服器已驗證", value: verified ? "是" : "否" },
            )
            .setThumbnail(icon);

        await interaction.editReply({ embeds: [embed] });
    }
};

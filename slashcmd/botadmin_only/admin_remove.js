const { SlashCommandBuilder, EmbedBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('移除管理員')
        .setDescription('移除管理員 remove admin')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('要移除的管理員')
                .setRequired(true),
        ),
    async execute(interaction) {
        const { loadData, saveUserData } = require("../../module_database.js");
        const { HugoUserID } = require("../../config.json");
        await interaction.deferReply();

        await interaction.editReply("正在處理...");

        let config = JSON.parse(fs.readFileSync(path.join(__dirname, "../../config.json"), "utf8"));
        const member = interaction.options.getUser('member');
        const userid = member.id;
        if (userid === HugoUserID) return await interaction.editReply("WTF? 你想移掉哈狗的機器人管理員權限? 你你你你....")
        if (!loadData(interaction.user.id).admin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
        const data = loadData(userid);
        config.admins = config.admins.filter(id => id !== userid);
        fs.writeFileSync(path.join(__dirname, "../../config.json"), JSON.stringify(config, null, 2));
        if (!data.admin) {
            const embed = new EmbedBuilder()
                .setDescription(`${member.toString()} 似乎不是機器人管理員`)
                .setThumbnail("https://cdn.discordapp.com/emojis/1381228667820183633.webp?size=1024")
            return await interaction.editReply({ content: "", embeds: [embed] });
        };

        data.admin = false;
        saveUserData(userid, data);
        await interaction.editReply(`已將 ${member.toString()} 的管理員權限移除`);
    },
};
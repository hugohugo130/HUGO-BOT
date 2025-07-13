const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('增加vip')
        .setDescription('增加vip add vip')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('要增加的VIP成員')
                .setRequired(true)
        ),
    async execute(interaction) {
        const { loadData, saveUserData } = require("../../module_database.js");
        await interaction.deferReply();
        if (!loadData(interaction.user.id).admin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
        await interaction.editReply("正在處理...");

        let config = JSON.parse(fs.readFileSync(path.join(__dirname, "../../config.json"), "utf8"));
        const member = interaction.options.getUser('member');
        const userid = member.id;
        const data = loadData(userid);
        data.vip = true;
        config.vip.push(userid);
        fs.writeFileSync(path.join(__dirname, "../../config.json"), JSON.stringify(config, null, 2));
        saveUserData(userid, data);
        await interaction.editReply(`已將 ${member.toString()} 設定為VIP`);
    },
};
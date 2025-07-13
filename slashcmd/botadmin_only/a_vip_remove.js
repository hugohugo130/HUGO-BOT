const { SlashCommandBuilder, MessageFlags } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('移除vip')
        .setDescription('移除vip remove vip')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('要移除的VIP成員')
                .setRequired(true)
        ),
    async execute(interaction) {
        const { loadData, saveUserData } = require("../../module_database.js");
        await interaction.deferReply({ flags: MessageFlags.Ephemeral });
        if (!loadData(interaction.user.id).admin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");
        await interaction.editReply("正在處理...");

        let config = JSON.parse(fs.readFileSync(path.join(__dirname, "../../config.json"), "utf8"));
        const member = interaction.options.getUser('member');
        const userid = member.id;
        const data = loadData(userid);
        data.vip = false;
        saveUserData(userid, data);
        if (!config.vip.includes(userid)) {
            await interaction.editReply(`${member.toString()} 不是VIP成員`);
        } else {
            config.vip = config.vip.filter(id => id !== userid);
            fs.writeFileSync(path.join(__dirname, "../../config.json"), JSON.stringify(config, null, 2));
            await interaction.editReply(`已將 ${member.toString()} 的VIP權限移除`);
        };
    },
};
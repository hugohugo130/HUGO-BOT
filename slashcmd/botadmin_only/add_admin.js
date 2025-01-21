const { SlashCommandBuilder } = require('discord.js');
const fs = require('fs');
const path = require('path');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('增加管理員')
        .setDescription('增加管理員 add admin')
        .addUserOption(option =>
            option.setName('member')
                .setDescription('要增加的管理員')
                .setRequired(true)
        ),
    async execute(interaction) {
        const { loadData, saveUserData } = require("../../module_database.js");
        await interaction.deferReply();
        const currentSeconds = new Date().getSeconds();
        const targetSeconds = 4;
        const diff = Math.abs(currentSeconds - targetSeconds);

        if (diff <= 5) {
            await interaction.editReply("正在處理...");
            const { sleep } = require("../../module_sleep.js");
            await sleep(10000);
        };

        let config = JSON.parse(fs.readFileSync(path.join(__dirname, "../../config.json"), "utf8"));
        const member = interaction.options.getUser('member');
        const userid = member.id;
        const data = loadData(userid);
        data.admin = true;
        config.admins.push(userid);
        fs.writeFileSync(path.join(__dirname, "../../config.json"), JSON.stringify(config, null, 2));
        saveUserData(userid, data);
        await interaction.editReply(`已將 ${member.toString()} 設定為管理員`);
    },
};
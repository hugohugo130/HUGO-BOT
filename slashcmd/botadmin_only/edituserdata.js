const { SlashCommandBuilder } = require('discord.js');
const { emptyeg } = require('../../config.json');

let choices = [];
for (let key in emptyeg) {
    choices.push({ name: key, value: key });
}

module.exports = {
    data: new SlashCommandBuilder()
        .setName('編輯用戶數據')
        .setDescription('編輯用戶數據（僅限管理員使用） edit userdata')
        .addUserOption(option =>
            option.setName('用戶')
                .setDescription('選擇要編輯的用戶')
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('數據')
                .setDescription('選擇要編輯的數據')
                .addChoices(choices)
                .setRequired(true)
        )
        .addStringOption(option =>
            option.setName('數值')
                .setDescription('輸入要設定的數值')
                .setRequired(true)
        ),
    async execute(interaction) {
        const { loadData, saveUserData } = require('../../module_database');
        const userid = interaction.user.id;
        await interaction.deferReply();

        let data = loadData(userid);
        if (!loadData(interaction.user.id).admin) return await interaction.editReply("您不是機器人管理員。無法使用此指令。");

        const user = interaction.options.getUser('用戶');
        const dataToEdit = interaction.options.getString('數據');
        let value = interaction.options.getString('數值');

        if (emptyeg[dataToEdit] === undefined) {
            return await interaction.editReply({
                content: `${dataToEdit}是無效的數據類型。\nemptyeg[${dataToEdit}] is ${emptyeg[dataToEdit]}`,
                ephemeral: true,
            });
        };

        const typeofdata = typeof emptyeg[dataToEdit];

        if (typeofdata === 'number') {
            value = parseInt(value);
        } else if (typeofdata === 'boolean') {
            value = value.toLowerCase() === 'true';
        };

        if (dataToEdit === 'installment') {
            value = JSON.parse(value);
        };

        data[dataToEdit] = value;
        saveUserData(userid, data);

        await interaction.editReply({
            content: `已成功更新 ${user} 的 ${dataToEdit} 數值到 ${dataToEdit === 'installment' ? JSON.stringify(value) : value}。`,
            ephemeral: true,
            allowedMentions: { repliedUser: false }
        });
    },
};
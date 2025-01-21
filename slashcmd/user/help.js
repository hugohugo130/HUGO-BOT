const { SlashCommandBuilder } = require('discord.js');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('幫助')
        .setDescription('顯示所有可用的指令 help'),
    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        // 動態取得所有斜線指令
        let commands = await interaction.client.application.commands.fetch();

        let reply = '機器人斜線指令如下:\n';
        commands.forEach(cmd => {
            reply += `\`/${cmd.name}\`: ${cmd.description}\n`;
        });

        await interaction.editReply(reply);
    }
};

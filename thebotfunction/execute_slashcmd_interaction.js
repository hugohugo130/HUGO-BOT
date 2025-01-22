const { Events, EmbedBuilder } = require('discord.js');
module.exports = {
    setup(client) {
        client.on(Events.InteractionCreate, async interaction => {
            const { time } = require("../module_time.js");
            const username = interaction.user.globalName || interaction.user.username;
            try {
                if (!interaction.isChatInputCommand()) return;
                const command = interaction.client.commands.get(interaction.commandName);

                if (!command) {
                    console.error(`[${time()}] 找不到名為 ${interaction.commandName} 的指令`);
                    return;
                };

                const { backend_channel_ID } = require('../config.json');
                let backend_channel = interaction.client.channels.cache.get(backend_channel_ID);
                let options = interaction.options.data.map(option => `${option.name}: ${option.value}`).join(', ');
                console.log(`[${time()}] ${username} 正在執行斜線指令: ${interaction.commandName}${options ? `, 選項: ${options}` : ""}`);
                await command.execute(interaction);
                if (backend_channel) {
                    const embed = new EmbedBuilder()
                        .addFields({ name: '指令執行者', value: username })
                        .addFields({ name: '指令名稱', value: interaction.commandName })
                        .addFields({ name: '選項', value: options ? options : '無' });
                    await backend_channel.send({ embeds: [embed] });
                };
            } catch (error) {
                require("../module_senderr").senderr({ client: client, msg: `執行斜線指令時出錯：${error.stack}`, clientready: true });
                if (interaction.replied || interaction.deferred) {
                    await interaction.followUp({ content: `[${time()}] 我運行這個指令的時候遇到了錯誤 :|\n${error.stack}`, ephemeral: interaction.ephemeral || true });
                } else {
                    await interaction.reply({ content: `[${time()}] 我運行這個指令的時候遇到了錯誤 :|\n${error.stack}`, ephemeral: interaction.ephemeral || true });
                };
                throw error;
            };
        });
    },
};
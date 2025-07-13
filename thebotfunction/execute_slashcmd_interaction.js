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
                // 新增遞迴函式處理 subcommand 與選項
                function parseOptions(options) {
                    if (!options || options.length === 0) return '';
                    return options.map(option => {
                        if (option.type === 1 || option.type === 2) { // 1: SUB_COMMAND, 2: SUB_COMMAND_GROUP
                            return `${option.name}${option.options && option.options.length > 0 ? `(${parseOptions(option.options)})` : ''}`;
                        } else {
                            return `${option.name}: ${option.value}`;
                        }
                    }).join(', ');
                };
                // 取得完整指令路徑（主指令 + subcommand group + subcommand）
                function getFullCommandPath(options) {
                    let path = [];
                    let current = options;
                    while (current && current.length > 0 && (current[0].type === 1 || current[0].type === 2)) {
                        path.push(current[0].name);
                        current = current[0].options;
                    }
                    return path;
                };
                // 取得最終參數
                function getFinalOptions(options) {
                    let current = options;
                    while (current && current.length > 0 && (current[0].type === 1 || current[0].type === 2)) {
                        current = current[0].options;
                    }
                    return current || [];
                };
                let subPath = getFullCommandPath(interaction.options.data);
                let fullCommand = [interaction.commandName, ...subPath].join(' ');
                let finalOptions = getFinalOptions(interaction.options.data);
                let optionsStr = finalOptions.map(option => `${option.name}: ${option.value}`).join(', ');
                console.log(`[${time()}] ${username} 正在執行斜線指令: ${fullCommand}${optionsStr ? `, 選項: ${optionsStr}` : ""}`);
                await command.execute(interaction);
                if (backend_channel) {
                    const embed = new EmbedBuilder()
                        .setTitle("指令執行")
                        .addFields({ name: '指令執行者', value: interaction.user.toString() })
                        .addFields({ name: '指令名稱', value: fullCommand })
                        .addFields({ name: '選項', value: optionsStr ? optionsStr : '無' });

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
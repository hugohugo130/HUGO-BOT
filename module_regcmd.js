const { Collection } = require("discord.js");
const fs = require('fs');
const path = require('node:path');

function loadslashcmd(bot) {
    const commandsPath = path.join(__dirname, 'slashcmd');
    let commands = bot ? new Collection() : [];

    function processDirectory(dirPath) {
        const items = fs.readdirSync(dirPath);
        for (const item of items) {
            const itemPath = path.join(dirPath, item);
            const stat = fs.statSync(itemPath);
            
            if (stat.isDirectory()) {
                processDirectory(itemPath);
            } else if (item.endsWith('.js')) {
                delete require.cache[require.resolve(itemPath)];
                const command = require(itemPath);
                if ('data' in command && 'execute' in command) {
                    if (bot) {
                        commands.set(command.data.name, command);
                    } else {
                        commands.push(command.data.toJSON());
                    };
                } else {
                    console.warn(`[警告] ${itemPath} 中的指令缺少必要的 "data" 和 "execute" 屬性。`);
                };
            };
        };
    };

    processDirectory(commandsPath);
    return commands;
};

module.exports = {
    loadslashcmd,
};

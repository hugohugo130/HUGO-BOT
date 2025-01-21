const { slashcmd, BotToken, BotID } = require("./config.json");
if (!slashcmd) return;
const { REST, Routes } = require("discord.js");
const { loadslashcmd } = require("./module_regcmd.js");

let commands = loadslashcmd(false);
const rest = new REST().setToken(BotToken);

(async () => {
    try {
        console.log(`正在註冊${commands.length}個斜線指令...`);

        const data = await rest.put(
            Routes.applicationCommands(BotID),
            { body: commands },
        );

        console.log(`已註冊${data.length}個斜線指令!`);
    } catch (error) {
        console.error(error);
    };
})();
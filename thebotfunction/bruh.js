const { Events } = require("discord.js");

bruh_list = [
    "吼優！點什麼點啦？",
    "你點個點是在哈囉？",
    "點點點，你在暗號嗎？",
    "這麼愛點，不如去當電燈開關。",
    "點一下，世界就不一樣了嗎？",
    "點點點，點到外太空。",
    "你這是在召喚什麼嗎？",
    "點點更健康？",
    "點到我都傻眼了。",
    "點點點，點到天荒地老。",
    "你是不是在測試機器人？",
    "點這麼多，手不會酸嗎？",
    "點點點，點出新高度。",
    "再點下去Discord要壞掉啦！",
    "點到我都想睡覺了。",
    "點點點，點到宇宙盡頭。",
    "你是不是沒事做？",
    "點點點，點到開心為止。",
    "點這麼多，是有什麼密碼嗎？",
    "點點點，點到世界末日。"
]

module.exports = {
    setup(client) {
        client.on(Events.MessageCreate, async (message) => {
            try {
                if (message.author.id === "1197913368519004191" && message.content === ".") {
                    const randomMsg = bruh_list[Math.floor(Math.random() * bruh_list.length)];
                    await message.reply(randomMsg);
                    setTimeout(() => {
                        message.delete().catch(() => {});
                    }, 5000);
                };
            } catch (error) {
                require("../module_senderr.js").senderr({ client: client, msg: `bruh時出錯：${error.stack}`, clientready: true });
            };
        });
    },
};
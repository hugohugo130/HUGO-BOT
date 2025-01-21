const { SlashCommandBuilder } = require('discord.js');
const axios = require('axios');

module.exports = {
    data: new SlashCommandBuilder()
        .setName('縮短url')
        .setDescription('縮短一個 URL shorten url')
        .addStringOption(option =>
            option.setName('url')
                .setDescription('要縮短的 URL')
                .setRequired(true)),

    async execute(interaction) {
        await interaction.deferReply({ ephemeral: true });

        const url = interaction.options.getString('url');

        try {
            const shortenedUrl = await shortenUrl(url);
            if (shortenedUrl[0]) {
                await interaction.editReply(`縮短後的 URL：<${shortenedUrl}>`);
            } else if (shortenedUrl[1]) {
                await interaction.editReply(`錯誤：無法縮短 URL\n${shortenedUrl[1]}`);
            } else {
                await interaction.editReply('無法縮短 URL。請確保您提供了有效的 URL，或稍後再試。');
            }
        } catch (error) {
            console.error('處理請求時發生錯誤:\n', error);
            await interaction.editReply(`處理請求時發生錯誤。請稍後再試。\n${error}`);
        }
    },
};

async function shortenUrl(longUrl) {
    const apiUrl = `https://tinyurl.com/api-create.php?url=${encodeURIComponent(longUrl)}`;
    try {
        const { data } = await axios.get(apiUrl);
        return (data.trim()) || (null, false);
    } catch (error) {
        console.error('縮短 URL 時發生錯誤：', error);
        return (null, error);
    };
};
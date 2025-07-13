// const { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require("discord.js");

module.exports = {
    run: async function (client) {
        // const { load_rpg_data, save_rpg_data, load_bake_data, save_bake_data } = require("../../module_database.js");
        // const { name } = require("../../rpg.js");
        // const { setEmbedFooter, get_emoji } = require("../../thebotfunction/rpg/msg_handler.js");

        // let bake_data = load_bake_data();

        // // 檢查是否有任何烹飪互動
        // if (Object.keys(bake_data).length > 0) {
        //     for (const userId in bake_data) {
        //         const userCookingList = bake_data[userId];

        //         for (let i = 0; i < userCookingList.length; i++) {
        //             let data = userCookingList[i];
        //             const {
        //                 userId,
        //                 item_id,
        //                 amount,
        //                 coal_amount,
        //                 end_time,
        //                 output_item_id,
        //             } = data;

        //             const now = Math.floor(new Date() / 1000);
        //             const remaining_time = end_time - now;
        //             const total_duration = end_time - (now - (current || 0));
        //             const new_current = total_duration - remaining_time;

        //             // 檢查是否完成
        //             if (remaining_time <= 0) {
        //                 // 烘焙完成
        //                 let rpg_data = load_rpg_data(userId);
                        
        //                 if (coal_amount > amount) {
        //                     // 煤炭過多，烘焙失敗
        //                     rpg_data.inventory["coal"] = (rpg_data.inventory["coal"] || 0) + coal_amount;
        //                     rpg_data.inventory[item_id] = (rpg_data.inventory[item_id] || 0) + amount;
        //                     save_rpg_data(userId, rpg_data);

        //                     const emoji = get_emoji(client.guilds.cache.first(), "burnt_bread") || "🔥";
        //                     const embed = new EmbedBuilder()
        //                         .setColor(0xF04A47)
        //                         .setTitle(`${emoji} | 烘焙失敗`)
        //                         .setDescription(`你烤焦了 \`${amount}\` 個 ${name[item_id]}！\n\n💡 提示：煤炭數量不應該超過原料數量`);

        //                     console.log(`烘焙失敗 - 用戶: ${userId}, 物品: ${name[item_id]}, 數量: ${amount}`);
        //                 } else {
        //                     // 烘焙成功
        //                     rpg_data.inventory[output_item_id] = (rpg_data.inventory[output_item_id] || 0) + amount;
        //                     save_rpg_data(userId, rpg_data);

        //                     const emoji = get_emoji(client.guilds.cache.first(), "bread") || "🍞";
        //                     const embed = new EmbedBuilder()
        //                         .setColor(0x00BBFF)
        //                         .setTitle(`${emoji} | 烘焙完成`)
        //                         .setDescription(`你成功烤了 \`${amount}\` 個美味的 ${name[output_item_id]}！\n\n🎉 烘焙成功！`);

        //                     console.log(`烘焙成功 - 用戶: ${userId}, 物品: ${name[output_item_id]}, 數量: ${amount}`);
        //                 };

        //                 // 移除完成的烹飪任務
        //                 userCookingList.splice(i, 1);
        //                 i--;
        //             } else {
        //                 // 更新進度條（如果有的話）
        //                 if (channelId && messageId) {
        //                     try {
        //                         const channel = await client.channels.fetch(channelId);
        //                         const message = await channel.messages.fetch(messageId);
                                
        //                         const progressBar = createProgressBar(new_current, total_duration);
        //                         const emoji_oven = get_emoji(channel.guild, "oven") || "🔥";
        //                         const embed = new EmbedBuilder()
        //                             .setColor(0x00BBFF)
        //                             .setTitle(`${emoji_oven} | 烘焙中...`)
        //                             .setDescription(`正在烘焙 ${amount} 個 ${name[item_id]}...\n\n⏰ 剩餘時間: ${remaining_time} 秒\n🔥 使用煤炭: ${coal_amount} 個`)
        //                             .addFields({
        //                                 name: "烘焙進度",
        //                                 value: progressBar,
        //                                 inline: false
        //                             });

        //                         await message.edit({ embeds: [setEmbedFooter(client, embed)] });
        //                     } catch (e) {
        //                         require("../../module_senderr.js").senderr({client, message: `更新烘焙進度時出錯：\n${e.stack}`, clientready: true})
        //                     };
        //                 };
        //             };
        //         };

        //         // 如果該用戶沒有烹飪任務了，移除該用戶的條目
        //         if (userCookingList.length === 0) {
        //             delete bake_data[userId];
        //         };
        //     };
            
        //     save_bake_data(bake_data); // 在所有互動處理完畢後儲存
        // };
    },
};

// 創建進度條的輔助函數
// function createProgressBar(current, total) {
//     const progress = Math.min(current / total, 1);
//     const filledBlocks = Math.floor(progress * 10);
//     const emptyBlocks = 10 - filledBlocks;
    
//     const filled = "█".repeat(filledBlocks);
//     const empty = "░".repeat(emptyBlocks);
    
//     return `${filled}${empty} ${Math.round(progress * 100)}%`;
// };

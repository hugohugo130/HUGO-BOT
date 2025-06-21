const { EmbedBuilder } = require("discord.js");

module.exports = {
    run: async function (client) {
        const { load_rpg_data, save_rpg_data, load_cooking_interactions, save_cooking_interactions } = require("../../module_database.js");
        const { name } = require("../../rpg.js");
        const { setEmbedFooter, get_emoji } = require("../../thebotfunction/rpg/msg_handler.js");
        
        let cooking_interactions = load_cooking_interactions();

        if (cooking_interactions.length > 0) {
            for (let i = 0; i < cooking_interactions.length; i++) {
                let data = cooking_interactions[i];
                const {
                    userid,
                    item_id,
                    amount,
                    coal_amount,
                    duration,
                    interaction,
                    current,
                    legal,
                    progress_updates = 0
                } = data;

                const base_duration = duration;
                const speed_factor = 0.1;
                let new_duration = Math.max(1, Math.round(base_duration * (1 - coal_amount * speed_factor))) * amount;

                let new_current = current + 1;
                cooking_interactions[i].current = new_current;

                // 計算進度百分比 
                const progress_percentage = Math.min(100, Math.floor((new_current / new_duration) * 100));
                const filled_circles = Math.floor(progress_percentage / 10);
                const empty_circles = 10 - filled_circles;

                let progress_bar = '🟢'.repeat(filled_circles) + '⚪'.repeat(empty_circles);

                if (!legal) {
                    if (30 <= progress_percentage && progress_percentage <= 60) {
                        progress_bar = progress_bar.replaceAll("🟢", "🟡");
                    } else if (progress_percentage > 60) {
                        progress_bar = progress_bar.replaceAll("🟢", "🔴");
                    };
                };

                if (new_current >= new_duration) {
                    if (coal_amount > amount) {
                        let rpg_data = load_rpg_data(userid);
                        rpg_data.inventory["coal"] = (rpg_data.inventory["coal"] || 0) + coal_amount;
                        rpg_data.inventory[item_id] = (rpg_data.inventory[item_id] || 0) + amount;
                        save_rpg_data(userid, rpg_data);

                        const emoji = get_emoji(interaction.guild, "burnt_bread");
                        const embed = new EmbedBuilder()
                            .setColor(0xF04A47)
                            .setTitle(`${emoji} | 烘焙失敗`)
                            .setDescription(`你烤焦了 \`${amount}\` 個 ${name[item_id]}！\n\n進度：${progress_bar} ${progress_percentage}%`);

                        await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed, `已返還 ${coal_amount} 個煤炭和 ${amount} 個 ${name[item_id]}`)] });
                        cooking_interactions.splice(i, 1);
                        i--;
                    } else {
                        let rpg_data = load_rpg_data(userid);
                        const cooked_item = item_id.replace("raw_", "");
                        rpg_data.inventory[cooked_item] = (rpg_data.inventory[cooked_item] || 0) + amount;
                        save_rpg_data(userid, rpg_data);

                        const emoji = get_emoji(interaction.guild, "bread");
                        const embed = new EmbedBuilder()
                            .setColor(0x00BBFF)
                            .setTitle(`${emoji} | 烘焙完成`)
                            .setDescription(`你成功烤了 \`${amount}\` 個美味的 ${name[cooked_item]}！`);

                        await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)] });
                        cooking_interactions.splice(i, 1);
                        i--;
                    }
                } else {
                    // 計算是否需要更新進度
                    const update_interval = Math.floor(new_duration / 5);
                    const should_update = new_current % update_interval === 0 && progress_updates < 5;

                    if (should_update) {
                        // 烘焙中，更新進度條
                        const emoji = get_emoji(interaction.guild, "bread");

                        const embed = new EmbedBuilder()
                            .setColor(0x00BBFF)
                            .setTitle(`${emoji} | 烘焙中...`)
                            .setDescription(`正在烘焙 \`${amount}\` 個 ${name[item_id]}...\n\n進度：${progress_bar} ${progress_percentage}%`);

                        await interaction.editReply({ embeds: [setEmbedFooter(interaction.client, embed)] });
                        cooking_interactions[i].progress_updates = progress_updates + 1;
                    };
                };
            };
            save_cooking_interactions(cooking_interactions); // 在所有互動處理完畢後儲存
        };
    },
};

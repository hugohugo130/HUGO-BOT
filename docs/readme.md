# 哈狗機器人更新 HUGO BOT Update - 13 July 2025 (Release Update 5)

> [!CAUTION]
> 哈狗機器人的RPG遊戲仍在開發，可能會有很多bug，並且這機器人只是為了一個Discord伺服器而做的
> The RPG game of HUGO BOT is still under development, there may be many bugs, and this bot is only made for a Discord server

---

- 新增 | What things added?
  - RPG
    - 烤箱系統 oven(baking) system
      - 可以使用 `/烤箱 資訊` 查看烤箱的內容物 | The contents of the oven can be viewed using `/bake info`
      - 可以使用 `/bake get` 取出烤箱內已烤好的食物 | You can use `/bake get` to take out the baked food in the oven
      - 烤箱的位置只有3格 | The oven has only 3 slots
    - 物品 | items
      - 生馬鈴薯 raw_potato
      - 小麥 wheat
        - 可以製作麵包 | can make bread

- 修復 | What bugs fixed?
  - 指令執行日誌 | Command execution log

- 更新 | What things edited?
  - .gitigore
    - 改名(RENAME) cooking_interactions.json -> bake_db.json
  - config.json
    - `"cooking_interactions.json": []` -> `"bake_db.json": {}`
  - server.js
    - 增加 /verify | add /verify
    |-> (Chinese) 機器人有時候會在資料庫的電腦上掛機(24/7) 所以使用這個檢查方法也許可以加快連線速度
    |-> (English) Bots sometimes hang up on the database computer (24/7) so using this check may speed up the connection
  - 重新命名的文件 rename files
    - slashcmd/game/rpg/`cook.js` -> `bake.js`
    - slashcmd/game/rpg/`craft.js` -> `make.js`
  - RPG
    - 烤箱系統 oven(baking) system
      - 沒有進度條 no progress bar
    - 自動進食優先順序 | Automatic feeding priority
      - 生的食物的優先度為最低 | Raw food has the lowest priority
    - 出售價格 | selling price of items
      - raw_potato: Nothing -> 76
      - wheat: Nothing -> 58

- 移除 | What things removed?
  - module_database.js 的備份 | copy of module_database.js

- 將來可能會加入的功能 | Features that may be added in the future
  - 熔鍊 | smelt

PS: I used Google Translate to translate and some wrongs I'll fix, so something might be a little weird
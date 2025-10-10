FROM node:20-alpine

WORKDIR /app

# 安裝編譯依賴 (某些套件會需要)
RUN apk add --no-cache python3 make g++ git

# 複製 package.json / package-lock.json
COPY package*.json ./

# npm 安裝
RUN npm install && \
    apk del python3 make g++ git

# 複製剩下的程式碼
COPY . .

# 啟動
CMD ["node", "index.js"]
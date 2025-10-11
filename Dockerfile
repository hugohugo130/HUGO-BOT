FROM node:22.14.0-alpine

WORKDIR /app

# 安裝編譯依賴 (某些套件會需要)
RUN apk add --no-cache python3 make g++ git

# 複製 package.json / package-lock.json
COPY package*.json ./

# npm 安裝
RUN npm install && \
    apk del python3 make g++ git

# 安裝curl
RUN apt-get -qq -y install curl

# 複製剩下的程式碼
COPY . .

# 註冊指令
RUN node register_commands.js

# 自動更新並修復依賴
RUN git pull && \
    npm update --save && \
    npm audit fix

# 註冊斜線指令
RUN ["node", "--trace-deprecation", "--trace-warnings", "register_commands.js"]

# 啟動
CMD ["node", "--trace-deprecation", "--trace-warnings", "index.js"]
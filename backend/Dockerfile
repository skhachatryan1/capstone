FROM node:26-alpine AS builder

WORKDIR /app

COPY package*.json ./

RUN npm ci --omit=dev

COPY . .

EXPOSE 5001
EXPOSE 9091

USER node

CMD ["node", "server.js"]

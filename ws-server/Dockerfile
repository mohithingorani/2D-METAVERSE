FROM node:20-alpine

WORKDIR /app

COPY package*.json ./
RUN npm ci --include=dev

COPY . .

RUN npm run build

EXPOSE 8080

CMD ["node", "dist/index.js"]

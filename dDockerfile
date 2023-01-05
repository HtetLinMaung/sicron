FROM node:lts-alpine3.16

WORKDIR /app

COPY package.json .

RUN npm i

COPY . .

RUN npm run build

CMD ["npm", "start"]
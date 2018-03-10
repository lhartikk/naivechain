FROM node:8.9.3-alpine

WORKDIR /blockgang

COPY package.json .

COPY package-lock.json .

COPY ./dist/x.js .

RUN npm install --quiet

COPY . .

ENV PEERS=$PEERS

EXPOSE 3000
EXPOSE 6001

CMD ["npm", "start"]

FROM node:9-alpine

WORKDIR /

COPY package.json .

COPY package-lock.json .

COPY ./dist/compiled.js .

RUN npm install --quiet

COPY . .

ENV PEERS=$PEERS

EXPOSE 3000
EXPOSE 6001

CMD ["npm", "start"]

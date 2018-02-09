FROM node:4.6

RUN mkdir /naivechain
WORKDIR /naivechain

ADD package.json .
ADD main.js .

RUN npm install

EXPOSE 3001
EXPOSE 6001

ENTRYPOINT PEERS=$PEERS npm start
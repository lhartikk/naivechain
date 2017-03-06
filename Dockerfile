FROM node:alpine

CMD npm install
ADD . /naivechain

EXPOSE 3001
EXPOSE 6001

ENTRYPOINT cd /naivechain && PEERS=$PEERS npm start
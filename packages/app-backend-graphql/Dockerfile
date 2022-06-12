FROM node:18-alpine

ENV NODE_ENV production

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

USER node

COPY dist/index.js index.js

RUN npm i pg

EXPOSE 4000

CMD [ "node", "index.js" ]

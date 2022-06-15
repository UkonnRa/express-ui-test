FROM node:18-alpine

ENV NODE_ENV production
ENV PORT 80

RUN mkdir -p /home/node/app && chown -R node:node /home/node/app

WORKDIR /home/node/app

USER node

COPY dist/index.js index.js
COPY protoset.bin protoset.bin

RUN npm i pg

EXPOSE $PORT

CMD [ "node", "index.js" ]

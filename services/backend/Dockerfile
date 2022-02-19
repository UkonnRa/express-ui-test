FROM node:16-alpine as builder

COPY package.json package.json

RUN npm uninstall @white-rabbit/business-logic @white-rabbit/repository-memory

RUN npm install --production --no-optional

FROM node:16-alpine

RUN mkdir /home/node/app/ && chown -R node:node /home/node/app

WORKDIR /home/node/app

USER node

COPY --chown=node:node ./dist/index.js ./

COPY --from=builder --chown=node:node node_modules/ node_modules/

ENV NODE_ENV production

ENV PORT 80

EXPOSE $PORT

CMD [ "node", "index.js" ]

FROM node:16-alpine

USER node

RUN mkdir /home/node/app/ && chown -R node:node /home/node/app

WORKDIR /home/node/app

COPY ./dist ./dist

ENV NODE_ENV production

ENV PORT 80

EXPOSE $PORT

CMD [ "node", "index.js" ]

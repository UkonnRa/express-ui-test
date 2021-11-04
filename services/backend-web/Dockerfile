FROM node:16-alpine

RUN mkdir /home/node/app/ && chown -R node:node /home/node/app

WORKDIR /home/node/app

USER node

COPY --chown=node:node dist/index.js .

ENV NODE_ENV production

EXPOSE 80

CMD [ "node", "index.js" ]

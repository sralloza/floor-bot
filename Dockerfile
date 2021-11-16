FROM node:15.14.0-alpine3.13

# Create app directory
WORKDIR /usr/src/app

RUN npm install -g npm@latest

RUN npm install -g typescript

COPY package*.json ./

COPY tsconfig.json .
COPY src src

EXPOSE 80

ENV NODE_ENV production

RUN npm ci

RUN tsc

COPY entrypoint.sh .

ENTRYPOINT [ "./entrypoint.sh"]

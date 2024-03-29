FROM node:16.14.0-slim

# Create app directory
WORKDIR /usr/src/app

RUN npm install -g npm@latest

RUN npm install -g typescript

COPY package*.json ./

# If you are building your code for production
# RUN npm ci --only=production

ENV NODE_ENV development

RUN npm ci

COPY tsconfig.json .
COPY src src

EXPOSE 80

ENV NODE_ENV production

RUN tsc

RUN npm ci

COPY entrypoint.sh .

ENTRYPOINT [ "./entrypoint.sh"]

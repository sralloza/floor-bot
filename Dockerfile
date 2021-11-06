FROM node:15.14.0-alpine3.13

# Create app directory
WORKDIR /usr/src/app

RUN npm install -g npm@latest

RUN npm install -g typescript

COPY package*.json ./

# If you are building your code for production
# RUN npm ci --only=production

ENV NODE_ENV development

RUN npm ci

COPY . .

EXPOSE 80

ENV NODE_ENV production

RUN tsc

RUN npm ci

ENTRYPOINT [ "./entrypoint.sh"]

FROM arm32v7/ubuntu:16.04

RUN apt update && \
    apt upgrade && \
    apt install curl npm wget -y && \
    curl -sL https://deb.nodesource.com/setup_14.x | bash - && \
    apt install nodejs -y && \
    rm -rf /var/lib/apt/lists/* && \
    wget --quiet https://raw.githubusercontent.com/vishnubob/wait-for-it/master/wait-for-it.sh -O /usr/sbin/wait-for-it.sh && \
    chmod +x /usr/sbin/wait-for-it.sh

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

FROM node:20-alpine
WORKDIR /usr/src/app

RUN apk add --no-cache \
    python3 \
    make \
    g++

COPY package*.json ./

RUN npm ci

COPY . .

RUN mkdir -p public/uploads && \
    chmod 755 public/uploads

EXPOSE 3000
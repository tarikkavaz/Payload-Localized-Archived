FROM node:18.8-alpine as base

RUN npm install -g pnpm
ENV PNPM_HOME=/home/node/.pnpm-store
ENV PATH=$PNPM_HOME:$PATH

FROM base as builder

WORKDIR /home/node/app
COPY package*.json ./
COPY pnpm-lock.yaml ./

RUN pnpm install

COPY . .
RUN pnpm build

FROM base as runtime

ENV NODE_ENV=production

WORKDIR /home/node/app
COPY package*.json  ./
COPY pnpm-lock.yaml ./
RUN pnpm install --prod

EXPOSE 3000

CMD ["node", "dist/server.js"]

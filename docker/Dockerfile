# DEV STAGE
FROM node:22-slim AS dev

WORKDIR /app

COPY package.json yarn.lock ./
RUN yarn install

COPY . .

EXPOSE 3000

CMD ["yarn", "start", "--host", "--port", "3000"]



# PROD STAGE
FROM node:22-slim AS prod

WORKDIR /app

COPY ./package.json ./yarn.lock ./
RUN yarn install --frozen-lockfile

COPY . .
RUN yarn build

# RUN yarn global add serve IF YOU WE WANT TO USE SERVE (INTEGRATION TEST?)

EXPOSE 3000

CMD ["serve", "-s", "dist", "-l", "3000"]

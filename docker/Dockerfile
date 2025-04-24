# Stage 1
FROM node:22-alpine AS build

WORKDIR /app

COPY ../package.json ../yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . ./
RUN yarn build


# Stage 2
FROM node:22-alpine

WORKDIR /app

# Install web server
RUN yarn global add serve

# Only copy the built files
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]

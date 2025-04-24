# Stage 1
FROM node:22-alpine AS build

ARG KRM3_FE_API_BASE_URL=/api/v1/

WORKDIR /app

COPY ../package.json ../yarn.lock ./

RUN yarn install --frozen-lockfile

COPY . ./

RUN KRM3_FE_API_BASE_URL=${KRM3_FE_API_BASE_URL} yarn build


# Stage 2
FROM node:22-alpine

WORKDIR /app

# Install web server
RUN yarn global add serve

# Only copy the built files
COPY --from=build /app/dist ./dist

EXPOSE 3000
CMD ["serve", "-s", "dist", "-l", "3000"]

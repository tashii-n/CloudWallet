# stage 1

FROM node:18 AS build
WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build

# stage 2

FROM nginx:alpine
COPY /nginx.conf /etc/nginx/nginx.conf
COPY --from=build /app/.next /usr/share/nginx/html
EXPOSE 4003

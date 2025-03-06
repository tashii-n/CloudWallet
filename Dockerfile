# stage 1

FROM node:18 AS ndi-cloud-wallet-frontend-build
WORKDIR /app
COPY . .

RUN npm ci
RUN npm run build
COPY package*.json ./

# stage 2
EXPOSE 4003
CMD [ "npm", "start" ]

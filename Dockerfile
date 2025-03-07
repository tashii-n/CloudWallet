FROM node:18 AS base
#RUN apk add --no-cache \
 #   build-base \
 #   g++ \
 #   cairo-dev \
 #   jpeg-dev \
 #   pango-dev \
 #   giflib-dev
WORKDIR /usr/src/app

COPY package*.json ./
#RUN npm install -g npm@10.2.4
#RUN npm i -g nodemon
#RUN npm install canvas
#RUN npm install

COPY . .
RUN npm ci
RUN npm run build
EXPOSE 4003
#CMD npm start
CMD [ "npm","run","start" ]

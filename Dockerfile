FROM node:latest

RUN mkdir -p /home/app \
  && npm config set registry https://registry.npm.taobao.org \
  && npm i -g pm2 \
  && npm i -g npm

WORKDIR /home/app

COPY . /home/app

RUN npm i \
  && npm run build

EXPOSE 3000

CMD ["pm2","start","dist/main.js","--no-daemon","--name","real-world"]

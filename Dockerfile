# This Dockerfile adapted from https://mherman.org/blog/dockerizing-a-react-app/
# There are a *lot* of approaches to this task. This one does work. Yay us.

FROM node:latest

ADD . /app
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json

RUN npm install --quiet
RUN npm install -g serve
COPY . /app

EXPOSE 8080

CMD ["/bin/bash", "./entrypoint.sh"]

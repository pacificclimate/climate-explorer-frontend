# This Dockerfile adapted from https://mherman.org/blog/dockerizing-a-react-app/

# At this moment, Node.js 10.16 LTS is recommended for most users.
FROM node:10.16

ADD . /app
WORKDIR /app

ENV PATH /app/node_modules/.bin:$PATH
COPY package.json /app/package.json

RUN npm install --quiet
RUN npm install -g serve
COPY . /app

EXPOSE 8080

CMD ["/bin/bash", "./entrypoint.sh"]

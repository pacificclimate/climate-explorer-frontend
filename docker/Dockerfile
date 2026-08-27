FROM node:24-bookworm-slim

RUN apt-get -y update &&  \ 
    apt-get install --no-install-recommends  \
    -y curl rpl && \
    rm -rf /var/lib/apt/lists/*

RUN npm install --global npm@12 && \
    test "$(node --version | cut -d. -f1 | tr -d v)" = "24" && \
    test "$(npm --version | cut -d. -f1)" = "12" && \
    npm install --global serve

COPY --chown=node build /app
COPY --chown=node docker/entrypoint.sh /app/docker/entrypoint.sh
WORKDIR /app

USER node
EXPOSE 8080
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 CMD [ "curl", "-f", "http://localhost:8080/healthcheck.js" ]

ENTRYPOINT ["docker/entrypoint.sh"]

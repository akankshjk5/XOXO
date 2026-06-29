# XOXO Travels API — Production Dockerfile
FROM node:20-alpine

WORKDIR /app

RUN apk add --no-cache tini

COPY package*.json ./
RUN npm ci --omit=dev

COPY src ./src

ENV NODE_ENV=production
ENV HOST=0.0.0.0
EXPOSE 5000

RUN mkdir -p uploads invoices && chown -R node:node uploads invoices

USER node

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "src/server.js"]

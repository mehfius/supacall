# Estágio de construção (build)
FROM node:18-slim AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .

FROM node:18-slim AS production
WORKDIR /app
COPY --from=build /app .
ENV ENVIRONMENT=production
EXPOSE 3000
CMD ["npm", "start"]

FROM node:18-slim AS development
WORKDIR /app
COPY --from=build /app .
ENV ENVIRONMENT=development
RUN apt-get update && apt-get install -y curl unzip && \
    curl -s https://bin.equinox.io/c/bNyj1mQVY4c/ngrok-stable-linux-amd64.zip -o ngrok.zip && \
    unzip ngrok.zip && \
    mv ngrok /usr/local/bin/ && \
    rm ngrok.zip && \
    ngrok config add-authtoken 2vF9tJTYFEv1H8mP7YXA4oI5HuO_2mQL71j6BfTXEour1qgSy
EXPOSE 3000
CMD ["sh", "-c", "npm start & ngrok http --url=${NGROK_URL} 3000"]
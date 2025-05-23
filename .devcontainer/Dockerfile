FROM node:23-slim


RUN apt update && apt upgrade -y && \
    apt install -y git curl && \
    apt clean && rm -rf /var/lib/apt/lists/*

ENV \
  PATH=$PATH:./node_modules/.bin

WORKDIR /workspace/ha-chore-card

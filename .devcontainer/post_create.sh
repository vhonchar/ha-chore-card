#!/bin/bash

# pull and install home-assistant/frontend
if [ ! -d "/workspace/frontend" ]; then
  git clone --depth=1 https://github.com/home-assistant/frontend /workspace/frontend
fi

cd /workspace/frontend || exit
yarn install --immutable

cd /workspace/ha-chore-card || exit
npm install
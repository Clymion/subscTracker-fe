FROM node:20-slim

WORKDIR /app

RUN echo -e "\n\
alias ll='ls -la --color'\n\
" >> /root/.bashrc

RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

# Install yarn v4
RUN corepack enable && corepack prepare yarn@4.0.2 --activate

COPY package.json yarn.lock ./

RUN yarn install

CMD ["yarn", "dev"]

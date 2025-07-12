# ============ ベースイメージ ============
FROM node:22-slim AS base

RUN apt-get update && apt-get install -y \
    git \
    && rm -rf /var/lib/apt/lists/*

RUN npm install -g pnpm
USER node:node

# ============ 開発ステージ ============
FROM base AS development

WORKDIR /workspace

USER node

COPY package.json ./
RUN pnpm config set store-dir /home/node/.local/share/pnpm/store
RUN pnpm install

COPY . .

RUN echo "alias ll='ls -l --color'" >> ~/.bashrc

EXPOSE 5173

CMD ["tail", "-f", "/dev/null"]

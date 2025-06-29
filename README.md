# 環境構築手順
## 前提
- Windows 10
- Docker Desktop

## 初期化
ホストOS
```bash
docker compose build
docker compose run -it app bash
```

コンテナ内
```bash
yarn create vite . --template react-ts
yarn install

# Tailwind CSSのインストールと初期化
yarn add -D tailwindcss postcss autoprefixer
yarn tailwindcss init -p

# Material UIのインストール
yarn add @mui/material @emotion/react @emotion/styled
yarn add @mui/icons-material

# shadcn/uiの初期化
npx shadcn-ui@latest init

exit
```

ホストOS
```bash
docker compose down
docker compose up -d
```

## 問題点
- tailwindcss の`@tailwind`で生成されない
  - `npx shadcn@latest init`で生成される

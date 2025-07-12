# 環境構築手順

## 前提
動作確認環境
- Windows 10
  - Docker Desktop
- Windows 11
  - WSL2 Debian
  - Docker (on Debian)


## 開発環境構築手順
ホストOS
```bash
docker compose build
docker compose run -it app bash
```

ホスト側では、`node_modules`が`root`で作られてしまうので、必要なら以下で権限を変更してください

```sh
sudo chown $USER:$USER node_modules/
```

### firebaseへのデプロイ
```sh
pnpm setup
source /home/node/.bashrc
pnpm -g i firebase-tools
firebase login
firebase init
```

## 初期化備忘録
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


## 残課題
- tailwindcss の`@tailwind`で生成されない
  - `npx shadcn@latest init`で生成される


# コミット時
```sh
pnpm lint
```

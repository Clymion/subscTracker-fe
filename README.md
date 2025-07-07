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

## 残課題
- tailwindcss の`@tailwind`で生成されない
  - `npx shadcn@latest init`で生成される

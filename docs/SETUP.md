# 一度きりのセットアップ（GitHub同期・公開）

## 1. リポジトリを2つ作る
- 公開リポジトリ（アプリの土台コード用）: 例 `icu-srs-app`（Public）
- 非公開リポジトリ（問題・進捗用）: 例 `icu-srs-data`（Private）

## 2. アプリコードを公開リポジトリへ
- このリポジトリの `data/` を除いたアプリ一式を公開リポジトリへ push する（アシスタントが実施）。
- 公開リポジトリの Settings → Pages → Source を「GitHub Actions」に設定。
- `main` へ push されると `.github/workflows/deploy.yml` が動き、Pages に公開される。

## 3. 問題データを非公開リポジトリへ
- `data/questions.json` を非公開リポジトリのルートに `questions.json` として置く（アシスタントが実施）。

## 4. アクセストークン（PAT）を作る
- GitHub → Settings → Developer settings → Fine-grained tokens → Generate new token
- Repository access: 非公開リポジトリ `icu-srs-data` のみ
- Permissions: Contents = Read and write
- 生成した文字列を控える（一度しか表示されない）。

## 5. アプリで設定
- 公開された Pages の URL をスマホ/Macで開く → 「同期の設定」で
  トークン / ユーザー名 / `icu-srs-data` / `main` を入力 →「保存して同期」。
- 初回同期で問題が端末に入り、以後オフラインでも演習可能。
- 運用: 始める前に🔄同期、終わったら🔄同期。

## メモ
- 公開リポジトリにはアプリの仕組み（HTML/CSS/JS）だけが入り、問題・進捗などの著作物は一切含まれません。
- 問題・進捗は非公開リポジトリにあり、各端末に登録したトークンを持つ自分だけが読み書きできます。

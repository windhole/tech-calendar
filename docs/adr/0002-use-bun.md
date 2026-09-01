# 0002. パッケージマネージャを bun にする

Date: 2026-09-01
Status: Accepted

## Context

依存関係のインストールとスクリプト実行は npm だった。利用者が bun で進めたいと明示した。CI（GitHub Pages の build）と README が npm のままだと、ローカルと公開パイプラインが割れる。

## Decision

- パッケージマネージャは bun とする。ロックファイルは `bun.lock` をコミットし、`package-lock.json` は置かない。
- ローカルも CI も `bun install` と `bun run …` で揃える。
- GitHub Actions は `oven-sh/setup-bun` を使い、`bun install --frozen-lockfile` のあと `bun run typecheck` / `bun run build` する。
- `package.json` の scripts 自体は Vite / tsc / eslint のままにする。ランナーだけ bun に替える。

## Consequences

- `npm install` ではロックファイルが再現されない。手順は README を bun に合わせる。
- ADR-0001 の Pages デプロイは、コマンドが `npm run build` から `bun run build` に変わる以外はそのまま。

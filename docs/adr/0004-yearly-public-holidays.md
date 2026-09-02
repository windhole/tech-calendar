# 0004. 祝日は年別 YAML を public で配信する

Date: 2026-09-02
Status: Accepted

## Context

祝日は `data/holidays.yaml` をビルド時に埋め込んでいた。年をまたぐたびに 1 ファイルが肥大し、イベント（`public/events.jsonl`）とも置き場が違う。祝日も年ごとに分けて `public/` で管理したい。

## Decision

- 祝日は `public/holidays/YYYY.yaml` に置く。形式は従来どおり `date` と `name` のリスト。
- 実行時に `fetch` し、`js-yaml` でパースする。表示中の 6 週間がまたぐ年だけ読む。ファイルが無い年は空として扱う。
- ADR-0001 の「`data/holidays.yaml` をビルド時に読み込む」は、この決定で置き換える。

## Consequences

- 年の追加は新しい YAML を `public/holidays/` に置くだけでよい。
- イベントと同じく静的ファイルなので、変更を Pages に出すにはデプロイが必要。
- 1月・12月のグリッドは前後の年ファイルも取りにいく。

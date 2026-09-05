# 0011. events.yaml の重複と密集日を Ruby で確認する

Date: 2026-09-05
Status: Accepted

## Context

変換や手編集のあと、同じイベント名が二度入っていないか、カレンダーの 1 日にイベントが寄りすぎていないかを知りたい。アプリを開かずに、リポジトリ直下で確認したい。

## Decision

- リポジトリ直下の `check_events.rb` が `public/events.yaml` を読む。パスは引数で変えられる（`data/` の生成物も可）。実行は `ruby check_events.rb` または `make check-events`。
- イベント名が 2 件以上あるものを一覧する。
- 開催期間（`startDate` から `endDate` まで）が重なるイベントが 3 件以上ある日付を一覧する。カレンダーのセルと同じ数え方。
- `endDate` が `startDate` より前の行は、その日付チェックから外して内容を表示する。
- 標準ライブラリの `yaml` / `date` だけを使う。ファイルが読めないときだけ非ゼロで終了する。重複や密集は表示するだけで、終了コードは変えない。

## Consequences

- `csv2yaml.rb` と同様、システム Ruby があれば足りる。
- 3 件は表示の閾値であり、公開を止める条件ではない。

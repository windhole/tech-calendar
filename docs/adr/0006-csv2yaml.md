# 0006. スプレッドシート CSV を Ruby で events.yaml に変換する

Date: 2026-09-02
Status: Accepted（入力と出力先は [ADR-0015](0015-csv2yaml-yearly-public.md)、入力チェックは [ADR-0012](0012-csv2yaml-validation.md)。出力名のシリアルは [ADR-0010](0010-csv2yaml-serial-filename.md) を ADR-0015 が置き換え）

## Context

イベントの元データはスプレッドシートから落とした CSV（`data/`）で、実行時は `public/events.yaml`（ADR-0005）を読む。日付は「9月5日(土)」形式で年が無く、公開する行だけが `TRUE` になっている。変換は bun のアプリ本体と分け、手元で何度も回せるようにしたい。

## Decision

- 変換はリポジトリ直下の `csv2yaml.rb` とし、標準ライブラリ（`csv` / `date`）のみ使う。実行は `make events`。
- 入力は `data/*.csv` のうちファイル名に西暦があるもの。同じ年が複数あるときは更新が新しい 1 ファイル（ADR-0015）。年はファイル名の 4 桁西暦から取る。
- 日付は「9月5日(土)」と、スプレッドシート由来の `YYYY/M/D`（ゼロ埋めなし可）を `YYYY-MM-DD` に正規化する。年が書いてあればその年を使う。
- `Public` が `TRUE` の行だけを出す。開始日が `2026-09-01` 以降のイベントに限る（`ruby csv2yaml.rb YYYY-MM-DD` または `make events SINCE=...` で変更可）。`tag` はアプリではまだ使わないが、CSV に値があれば YAML にも残す。
- 出力は `public/events_YYYY.yaml`（ADR-0015）。同じ年の既存ファイルは上書きする。
- `endDate` が `startDate` より前、またはイベント名が重複しているときはエラーで止め、YAML は書かない（ADR-0012）。

## Consequences

- 変換結果は `public/` に直接出るので、git の差分で確認してコミットする。
- 日付の年は CSV の中身ではなくファイル名に依存する。年を変えたらファイル名も合わせる必要がある。
- 実行にはシステム Ruby があれば足りる。アプリの bun 依存には載せない。

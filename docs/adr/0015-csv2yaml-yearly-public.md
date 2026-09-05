# 0015. csv2yaml は年ごとの CSV を public/events_YYYY.yaml に出す

Date: 2026-09-05
Status: Accepted
Amends: [0006](0006-csv2yaml.md)
Supersedes: [0010](0010-csv2yaml-serial-filename.md)

## Context

ADR-0006 / ADR-0010 の変換は、`data/` の最新 CSV 1 つだけを読み、`data/events_YYYYMMDD_NNN.yaml` に書いていた。公開するには手で `public/` へコピーする必要があった。年別の CSV（2026 と 2027 など）が並ぶようになり、年ごとに公開用 YAML を出したい。アプリはすでに `public/events*.yaml` をすべて読む（ADR-0014）。

## Decision

- 入力は `data/*.csv` のうち、ファイル名に独立した 4 桁西暦があるもの（例: `2026`、`2027`）。長い数字の一部（`20260905` の先頭 4 桁など）は年とみなさない。西暦が無い CSV はスキップする。
- 同じ西暦の CSV が複数あるときは、更新時刻が新しいものを 1 つだけ使う。時刻が同じならファイル名の辞書順で後のほう。
- 出力は `public/events_YYYY.yaml`。2026 の CSV は `events_2026.yaml`、2027 の CSV は `events_2027.yaml`。既存ファイルは上書きする。`data/` には書かない。
- 日付の年（「9月5日」形式）は、これまでどおりその CSV のファイル名から取った西暦を使う。
- 入力チェック（ADR-0012）は年ごと（各 CSV の中）に行う。どれか 1 年でもエラーがあれば、どの `events_YYYY.yaml` も書かない。
- `SINCE`（省略時 `2026-09-01`）はこれまでどおり全入力に適用する。
- `public/events.yaml`（年なし）は作らない・消さない。残っているとアプリが年別ファイルと合わせて読むので、重なると二重に出る。そのときは警告を出す。

## Consequences

- `make events` のあとに `public/` へコピーする手順は不要になる。生成物は git の差分として確認できる。
- ADR-0010 のシリアル付きファイルは出さない。手元の古い `data/events_YYYYMMDD_NNN.yaml` は使わない。
- 年を足すには、西暦の入った CSV を `data/` に置けばよい。出力ファイルが増えるので、初回は dev の再読み込みまたは再ビルドが要る（ADR-0014）。

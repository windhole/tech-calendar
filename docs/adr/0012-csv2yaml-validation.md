# 0012. csv2yaml は日付の逆転とイベント名の重複をエラーにする

Date: 2026-09-05
Status: Accepted
Amends: [0006](0006-csv2yaml.md)

## Context

CSV の終了日が開始日より前だと、変換後の YAML にそのまま残る。イベント名の重複も同様に通ってしまう。どちらも変換の時点で止めたい。YAML 側の点検（1 日 3 件以上）は ADR-0011 の `check_events.rb` に残す。

## Decision

- `csv2yaml.rb` は YAML を書く前に、次をエラーとして全部出して終了する。どれか 1 年でもエラーがあれば、どの `public/events_YYYY.yaml` も書かない。
  - `endDate` が `startDate` より前
  - 同じ `eventName` が 2 件以上（空の名前は対象外。空行は従来どおりスキップ）
- 行番号と期間が分かるメッセージにする。最初の 1 件で止めず、該当をまとめて出す。

## Consequences

- スプレッドシート側を直すまで `make events` は通らない。
- すでに `public/events_YYYY.yaml` にある不正は、再変換しない限り残る。

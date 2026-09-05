# 0005. イベントは YAML 1 ファイルにする

Date: 2026-09-02
Status: Accepted（入力ファイルは [ADR-0014](0014-multiple-events-yaml.md) で複数可に変更）

## Context

イベントは `public/events.jsonl` だった。祝日は YAML になり、イベントだけ JSONL だと編集手順が割れる。年別分割は全件ページ用の index が要るので、まずは 1 ファイルにする。

## Decision

- イベントは `public/events.yaml` に `startDate` / `endDate` / `eventName` / `location` / `url` のリストで置く。追加の年別ファイルなどは ADR-0014。
- 実行時に fetch し、祝日と同じく `js-yaml` でパースする。日付は `YYYY-MM-DD` に正規化する。読むファイルは ADR-0014。
- `events.jsonl` は削除する。

## Consequences

- 祝日とイベントがどちらも YAML になる。コメントが書ける。
- `/events` は合成後の全件を 1 画面で見られる。
- インデントを崩すとファイル全体が読めなくなる。

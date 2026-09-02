# 0005. イベントは YAML 1 ファイルにする

Date: 2026-09-02
Status: Accepted

## Context

イベントは `public/events.jsonl` だった。祝日は YAML になり、イベントだけ JSONL だと編集手順が割れる。年別分割は全件ページ用の index が要るので、まずは 1 ファイルにする。

## Decision

- イベントは `public/events.yaml` に `startDate` / `endDate` / `eventName` / `location` / `url` のリストで置く。
- 実行時に 1 回 fetch し、祝日と同じく `js-yaml` でパースする。日付は `YYYY-MM-DD` に正規化する。
- `events.jsonl` は削除する。年別分割はしない。

## Consequences

- 祝日とイベントがどちらも YAML になる。コメントが書ける。
- `/events` は従来どおり 1 fetch で全件を取れる。
- インデントを崩すとファイル全体が読めなくなる。

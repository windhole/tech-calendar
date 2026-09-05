# 0017. ヘッダの更新日時は Last updated の英語表記にする

Date: 2026-09-06
Status: Accepted
Amends: [0013](0013-events-yaml-mtime.md), [0014](0014-multiple-events-yaml.md)

## Context

タイトル下に、読んだ YAML のファイル名（`events_2027.yaml ほか1件`）と `2026/09/05 23:15` 形式の時刻を出していた（ADR-0013 / ADR-0014）。ファイル名は運用者向けで、見る人には「いつ時点か」だけ分かればよい。表記も英語の一般的な日時に揃えたい。

## Decision

- タイトル下は `Last updated: Sep 5, 2026, 11:15 PM` の形にする。月は英語 3 文字、日はゼロ埋めしない、時刻は 12 時間制（AM/PM）。ブラウザのローカル時刻。
- ファイル名や件数は出さない。時刻の元はこれまでどおり、読めた YAML のうち最も新しい `Last-Modified`（無ければ列挙時の mtime）。
- ヘッダが無く時刻が取れないときは `Last updated: unknown`。

## Consequences

- どのファイルを読んだかはヘッダからは分からない。中身の新しさだけが見える。

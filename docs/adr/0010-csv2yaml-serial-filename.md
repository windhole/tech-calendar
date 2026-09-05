# 0010. csv2yaml の出力名は日付と 3 桁シリアルにする

Date: 2026-09-05
Status: Accepted
Amends: [0006](0006-csv2yaml.md)

## Context

ADR-0006 の出力は `data/events_YYYYMMDD-HHMM.yaml` だった。同じ分に二度走ると上書きし、時刻だけ見ても何回目かが分かりにくい。その日の何回目の生成かをファイル名で知りたい。

## Decision

- 出力名は `data/events_YYYYMMDD_NNN.yaml` とする（例: `events_20260905_001.yaml`）。日付とシリアルの区切りはアンダースコア。
- `YYYYMMDD` は実行した日（ローカル時刻）。`NNN` はその日の既存ファイルを見て、使われている最大番号の次（3 桁ゼロ埋め）。その日の最初は `001`。
- 対象は `events_YYYYMMDD_NNN.yaml` だけ。古い `events_YYYYMMDD-HHMM.yaml` はシリアルに数えない。
- 既存ファイルは上書きしない。`999` を超えたらエラーで止める。
- `public/events.yaml` はこれまでどおり触らない。

## Consequences

- 同じ日に何度回しても、001, 002, … と残る。
- 日付が変わるとシリアルは 001 に戻る。
- `data/` は gitignore のままなので、手元に古い時刻付きファイルが残っていても邪魔にはならない。

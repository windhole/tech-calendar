# 0016. make clean は csv2yaml が使わない CSV を消す

Date: 2026-09-05
Status: Accepted
Amends: [0015](0015-csv2yaml-yearly-public.md)

## Context

`data/` にスプレッドシート由来の CSV が溜まる。`make events` は年ごとに更新が新しい 1 ファイルだけを使う（ADR-0015）ので、西暦のないファイルと、同じ年の古いファイルは残ったままになる。手で消さずに揃えたい。

## Decision

- `make clean`（`ruby csv2yaml.rb --clean`）は `data/*.csv` のうち、`make events` が使わないものだけを削除する。
  - ファイル名に独立した 4 桁西暦がない
  - 同じ西暦の CSV のうち、更新時刻が新しいもの以外（時刻が同じならファイル名の辞書順で後のほう以外）
- 使う側の CSV、YAML、`public/` は触らない。
- 削除対象が無くても成功する。

## Consequences

- `make events` のあとに `make clean` すると、`data/` には年ごとの最新 CSV だけが残る。
- 選択ルールは変換と共通なので、clean で消したファイルは変換にも使われない。

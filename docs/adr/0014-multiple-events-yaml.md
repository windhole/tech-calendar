# 0014. public/ の events*.yaml をすべて読む

Date: 2026-09-05
Status: Accepted
Amends: [0005](0005-events-yaml.md)

## Context

イベントは `public/events.yaml` 1 ファイルだった（ADR-0005）。年を分けたい、差分だけ足したい、といったときにファイルを増やせるようにする。GitHub Pages はディレクトリ一覧を返さないので、実行時に `public/` を列挙することはできない。

## Decision

- `public/` 直下の、名前が `events` で始まり拡張子が `.yaml` のファイルをすべて読む（例: `events.yaml` と `events_2027.yaml`）。
- ビルド／開発サーバー起動時にファイル名と更新時刻を列挙し、アプリはそれを fetch する。ファイルを足したら、反映には再ビルド（または dev の再読み込み）が要る。
- 同じ `startDate` かつ同じ `eventName` があるときは、ファイルの更新時刻が新しいほうの内容を残す。時刻が同じならファイル名の辞書順で後のほう。
- ヘッダの日時は、読めたファイルのうち最も新しい `Last-Modified`（無ければ列挙時の mtime）を出す。

## Consequences

- `events.yaml` だけの運用はこれまでどおり動く。
- 公開するには、新しい YAML を `public/` に置いてデプロイする。
- `check_events.rb` も同じルールで複数ファイルを合成してから密集日を見る。

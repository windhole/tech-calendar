# 0013. ヘッダに events.yaml の更新日時を出す

Date: 2026-09-05
Status: Accepted

## Context

画面上では、いま見ているイベントがいつ時点の YAML か分からない。手元や Pages で古いデータを見ているときに気づきたい。

## Decision

- 左上タイトルの下に、読み込んだ `events.yaml` の HTTP `Last-Modified` を小さく出す。
- 表示はブラウザのローカル時刻。ヘッダが無いときは「更新日時不明」。
- 「今日」で YAML を取り直したら、そのときの `Last-Modified` に更新する。

## Consequences

- 開発サーバーと GitHub Pages が `Last-Modified` を付けていれば、ファイルを差し替えた時刻が分かる。
- CDN や環境によってはヘッダが無く、不明と出る。

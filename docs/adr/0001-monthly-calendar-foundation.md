# 0001. 月間カレンダーの基礎構造

Date: 2026-09-01
Status: Accepted

## Context

プロトタイプのカレンダーは日曜始まりで、祝日は JSONL、見た目は Tailwind がセルに散らばっていた。GitHub Pages もソースをそのまま出しており、ビルド成果物ではなかった。月間カレンダーを先に作り直すにあたり、開始曜日・祝日の持ち方・スタイルの置き場・公開方法を揃える必要がある。

## Decision

- 表示範囲は対象月を含む 6 週間（42 日）とし、週の始まりは月曜日とする。
- 祝日は `data/holidays.yaml` に `date` と `name` のリストで置く。ビルド時に Vite の raw import と `js-yaml` で読み込む。
- カレンダーの見た目は `src/calendar/monthly-calendar.css` に集約する。色や余白は CSS カスタムプロパティ、状態は BEM 風クラス（`--saturday` / `--sunday` / `--holiday`）で切り替える。
- GitHub Pages には GitHub Actions で `npm run build` した `dist/` を載せる。Vite の `base` はリポジトリ名パス `/tech-calendar/` とする。

## Consequences

- 祝日の追加・修正は YAML を編集してビルドし直せば反映される。実行時 fetch は不要。
- セル色の調整は CSS 変数の変更で足りる。コンポーネント側は日付と状態クラスだけを付ける。
- Pages の URL は `https://windhole.github.io/tech-calendar/` になる。ローカル開発も同じ base パス配下で動かす。
- YAML の日付は js-yaml が Date にパースすることがあるため、ローダ側で `YYYY-MM-DD` に正規化する。

# 0003. イベント一覧を別ページにし react-router で遷移する

Date: 2026-09-02
Status: Accepted

## Context

月間カレンダーの下に全イベントを出していた。カレンダーは表示中の 6 週間だけを見せたい。全件は今日を先頭にした別ページで見たい。静的な GitHub Pages でもパスでページを分けられる必要がある。

## Decision

- `react-router-dom` の `BrowserRouter` を使う。`basename` は Vite の `BASE_URL`（`/tech-calendar/`）に合わせる。
- カレンダーは `/`、全イベントは `/events`。
- Pages で直リンクできるように、ビルド後に `dist/index.html` を `dist/404.html` へコピーする。
- カレンダー下の一覧は、表示中グリッド（月曜始まり 6 週間）と期間が重なるイベントだけにする。
- `/events` の先頭は終了日が今日以降のイベント（開始日の昇順）。その下に過去のイベント（開始日の降順）を置き、スクロールで全件を見られるようにする。

## Consequences

- 依存が 1 つ増える。深リンクは 404.html 経由で SPA に戻る。
- Hash ルーティングにはしない。URL は `/tech-calendar/events` になる。

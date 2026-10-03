# 0021. イベントを events.ics でも配信する

Date: 2026-10-04
Status: Accepted

## Context

イベントは Web アプリで見るほかに、Google カレンダーなど普段使っているカレンダーに重ねて見たい。ICS を手で書き出して配ると、イベントを足すたびに配り直しになる。GitHub Pages は静的ファイルしか返さないので、購読用の ICS もビルド時に作るしかない。

## Decision

- ビルド時に Vite プラグインで `dist/events.ics` を書き出す。入力はアプリと同じ `public/events*.yaml` で、読み方（`parseEventsYaml`）と合成の規則（`mergeEventLayers`、ADR-0014）もアプリと共有する。共有するモジュールは `vite.config.ts` から読むので、`@/` ではなく相対パスで import する。
- 開発サーバーでは同じ URL（`/tech-calendar/events.ics`）で、リクエストのたびに YAML から作って返す。
- 各イベントは終日の予定（`DTSTART;VALUE=DATE`）にし、`DTEND` は `endDate` の翌日にする。
- `SUMMARY` は `eventName`、`LOCATION` は `location`、`URL` は `url`。Google カレンダーは `URL` を表示しないので、`DESCRIPTION` にも URL を入れ、開催地があれば続けて書く。
- `TRANSP:TRANSPARENT` にして、購読者の空き時間を埋めない。
- `UID` は開始日とイベント名（アプリの同一性と同じ）のハッシュから作り、ビルドをまたいで変えない。会場や URL を直しても同じ予定のまま更新される。
- `DTSTAMP` はビルドした時刻。
- テキストのエスケープと 75 オクテットでの折り返しは RFC 5545 に従い、マルチバイト文字の途中では折り返さない。

## Consequences

- 公開 URL `https://windhole.github.io/tech-calendar/events.ics` をカレンダーアプリに登録すれば、デプロイのたびに更新が届く。取り直しの間隔は購読側が決める。
- 開始日かイベント名を変えると UID が変わり、購読側では古い予定が消えて新しい予定が入る。
- 開催地での絞り込みは ICS には無い。全イベントを 1 つのカレンダーとして配る。
- ICS のロジックは `bun test` でテストする。CI でも型チェックの後に走らせる。

# tech-calendar

日本の祝日に対応した techカレンダー Web アプリです。

月表示のカレンダー上でイベント日・祝日を確認し、その下に表示期間のイベントを出します。全件はリスト表示で、今日以降を先頭に並べます。

公開 URL: https://windhole.github.io/tech-calendar/

## 現状

GitHub Pages で公開しています。祝日は年別 YAML、イベントは `public/events*.yaml` です。見た目はカレンダー専用 CSS に切り出しています。バックエンドや認証はありません。

## 機能

- 月曜始まりの月間カレンダー（対象月を含む 6 週間）
- 土曜日セルは薄い青、日曜日・祝日セルは薄い赤
- 祝日を `public/holidays/YYYY.yaml` で年ごとに指定
- 日付セルには最大 5 件までイベント名を出し、それ以上は `+N件`
- イベント名にマウスを乗せると全文、クリックすると詳細ダイアログ（開催日・会場・「イベントサイトを開く」）
- ヘッダ右上は、左から「今日」（カレンダー表示のみ）、「カレンダー表示」「リスト表示」
- 「今日」は表示月を今日に戻し、イベントと祝日の YAML をキャッシュを避けて取り直す
- タイトル下に、読んだ YAML の更新日時（複数あるときは最も新しい `Last-Modified`。キャプションは `events.yaml` または `events_2027.yaml ほか1件` など）
- カレンダー下には、表示中の 6 週間と重なるイベントだけを表示
- リスト表示（`/events`）で全イベントを確認（今日以降が上、その下に過去）

## 技術スタック

| 区分 | 内容 |
|------|------|
| フレームワーク | Vite + React 18 + TypeScript |
| UI | Tailwind CSS + shadcn/ui（Radix UI）＋ カレンダー専用 CSS |
| アイコン | lucide-react |
| 祝日 | 年別 YAML（`public/holidays/YYYY.yaml`） |
| イベント | YAML（`public/events*.yaml`。ビルド時にファイル名を列挙） |
| 公開 | GitHub Pages（Actions で `dist/` をデプロイ） |
| アクセス計測 | GoatCounter（本番のみ。`VITE_GOATCOUNTER_COUNT_URL`） |
| パッケージマネージャ | bun 1.4 |
| データ変換 | Ruby（`csv2yaml.rb` / `check_events.rb`。標準ライブラリのみ） |

## セットアップ

```bash
bun install
bun run dev
```

開発サーバーは `http://localhost:5173/tech-calendar/` で開きます（GitHub Pages と同じ base パスです）。リスト表示は `http://localhost:5173/tech-calendar/events` です。

### その他のスクリプト

| コマンド | 説明 |
|----------|------|
| `bun run build` | 型チェック後にプロダクションビルド |
| `bun run preview` | ビルド結果のプレビュー |
| `bun run lint` | ESLint による静的解析 |
| `bun run typecheck` | TypeScript の型チェック |

## Makefile の操作

イベント CSV の変換と、公開用 YAML の点検は Makefile から実行します。Ruby はシステムのものを使います（bun の依存には入れていません）。

| コマンド | 説明 |
|----------|------|
| `make events` | `data/` の年付き CSV から `public/events_YYYY.yaml` を生成する |
| `make events SINCE=2026-10-01` | 開始日を変えて生成する（省略時は `2026-09-01`） |
| `make check-events` | `public/events*.yaml` を合成し、1 日 3 件以上重なる日付を表示する |

手元の流れは次のとおりです。

1. スプレッドシートから、ファイル名に西暦が入った CSV を `data/` に置く（`data/` は git 対象外。例: `events-2026.csv`、`events-2027.csv`）
2. `make events` で `public/events_2026.yaml` などへ書き出す（同じ年の CSV が複数あれば更新が新しい 1 つだけ）
3. git の差分を確認する
4. `make check-events` で日付セルが込み合う日を見る
5. コミットしてデプロイする

1 ファイルだけを見るときは、Makefile ではなく次です。

```bash
ruby check_events.rb public/events_2026.yaml
```

変換ルールと入力チェックの詳細は下の「CSV から YAML を作る」を見てください。

## 祝日（YAML）

`public/holidays/YYYY.yaml` に年ごとのファイルを置きます。例: `public/holidays/2026.yaml`。

```yaml
- date: "2026-08-11"
  name: 山の日
```

| フィールド | 型 | 説明 |
|------------|-----|------|
| `date` | `string` | 日付（`YYYY-MM-DD`。引用符推奨） |
| `name` | `string` | カレンダーに出す祝日名 |

カレンダーが表示している 6 週間がまたぐ年のファイルだけを読みます。その年のファイルが無ければ、その年の祝日は出ません。イベントと同じく `public/` の静的ファイルなので、GitHub Pages に出すにはデプロイが必要です。

## 見た目のカスタマイズ

カレンダーの色・余白・角丸は `src/calendar/monthly-calendar.css` のカスタムプロパティを変えます。

```css
.monthly-calendar {
  --monthly-calendar-saturday-bg: #dbeafe;
  --monthly-calendar-sunday-bg: #fecaca;
  --monthly-calendar-holiday-bg: #fecaca;
}
```

状態クラスは `--saturday` / `--sunday` / `--holiday` / `--outside` / `--today` です。

## イベントデータ

`public/` 直下の、名前が `events` で始まる YAML（`events.yaml`、`events_2027.yaml` など）をすべて読みます。GitHub Pages はディレクトリ一覧を返さないので、読むファイルはビルド時（開発サーバーでは起動時と、ファイル追加時の再読み込み）に列挙します。同じ開始日・同じイベント名があるときは、ファイルの更新時刻が新しいほうを使います。時刻が同じならファイル名の辞書順で後のほうです。

1 件 1 要素で書きます。

```yaml
- startDate: "2026-03-01"
  endDate: "2026-03-03"
  eventName: テックカンファレンス2026
  location: パシフィコ横浜
  url: https://example.com/tech-conf
```

| フィールド | 型 | 説明 |
|------------|-----|------|
| `startDate` | `string` | 開始日（`YYYY-MM-DD`） |
| `endDate` | `string` | 終了日（`YYYY-MM-DD`） |
| `eventName` | `string` | イベント名 |
| `location` | `string` | 会場 |
| `url` | `string` | 詳細 URL |
| `tag` | `string` | 任意。csv2yaml が CSV にあれば残すが、アプリはまだ使わない |

公開するには `public/` に置いてデプロイします。ファイルを足したあとは再ビルド（または `bun run dev` の再読み込み）が必要です。中身だけ直したときは、開発中ならヘッダの「今日」で取り直せます。

## CSV から YAML を作る

元データはスプレッドシートから落とした CSV です。実行は `make events`（上の「Makefile の操作」）です。`ruby csv2yaml.rb 2026-10-01` でも同じです。

- 入力は `data/*.csv` のうち、ファイル名に独立した 4 桁西暦があるもの（例: `2026`、`2027`）
- 同じ西暦の CSV が複数あるときは、更新時刻が新しい 1 ファイルだけを使う
- `Public` が `TRUE` の行だけを出す。開始日の省略時は `2026-09-01` 以降
- 日付は「9月5日(土)」と `YYYY/M/D`（ゼロ埋めなし可）を `YYYY-MM-DD` にする。年の無い日付はファイル名の西暦を使う
- 出力は `public/events_YYYY.yaml`（2026 の CSV なら `events_2026.yaml`）。同じ年の既存ファイルは上書きする
- `endDate` が `startDate` より前、または同じ CSV 内でイベント名が重複しているときは、どの年の YAML も書かずに終了する
- `public/events.yaml`（年なし）は作らない。残っていると年別ファイルと二重に出ることがある

## 1 日に重なる件数を見る

実行は `make check-events` です。開催期間が重なるイベントが 3 件以上の日付を表示します。引数なしでは `public/events*.yaml` をアプリと同じ規則で合成します。日付の逆転とイベント名の重複はここでは見ません（`make events` 側のエラーです）。

## アクセス計測（GoatCounter）

公開サイトの訪問は GoatCounter で数えます。localhost ではスクリプトを読みません。エンドポイントが未設定のビルドも何もしません。

### 1. GoatCounter でカウント URL を用意する

1. [GoatCounter](https://www.goatcounter.com/) でアカウントを作り、サイトを 1 つ作る（サブドメインが `YOURCODE` になる）
2. サイト設定の埋め込み用 HTML に `data-goatcounter="https://YOURCODE.goatcounter.com/count"` と出る
3. その **`https://YOURCODE.goatcounter.com/count` 全体** をコピーする（`/count` まで含める。引用符は付けない）

### 2. GitHub に変数を入れる（Actions の Variables）

ワークフローは GitHub Actions の **`vars`** から読むので、入れる場所は **Actions** です。同じ「Secrets and variables」の下にある **Agents** は Cursor などのエージェント用で、このデプロイには届きません。**Secrets** タブでもありません（秘密値ではなく、公開サイトの JS に埋め込まれる URL です）。

Settings → Environments の `github-pages` にも入れないでください。変数を使うのは **build** ジョブで、こちらは environment を指定していません。

手順:

1. リポジトリ [windhole/tech-calendar](https://github.com/windhole/tech-calendar) を開く
2. **Settings**（権限が必要。見えないときはリポジトリ名の右の `…` から）
3. 左サイドバーの **Secrets and variables** を開き、その下の **Actions** をクリックする  
   直接開くなら [この Variables のページ](https://github.com/windhole/tech-calendar/settings/variables/actions)
4. 画面上部のタブで **Variables** を選ぶ（隣の **Secrets** ではない）
5. **New repository variable** をクリックする
6. 次を入れて **Add variable** する

| 欄 | 値 |
|----|-----|
| Name | `VITE_GOATCOUNTER_COUNT_URL` |
| Value | `https://YOURCODE.goatcounter.com/count` |

Name は一字一句これです。Value の前後に空白や `" "` は付けません。

### 3. 本番ビルドをやり直す

この変数は `bun run build` のときに JS へ埋め込まれます。変数を足しただけ、または PR をマージしただけでは、すでに公開中のサイトは変わりません。

- まだ PR が未マージなら、変数を入れてからマージする（`main` への push で Deploy GitHub Pages が走る）
- すでに `main` に乗っているなら、**Actions** タブ → **Deploy GitHub Pages** → **Run workflow**（`main`）

カレンダー（`/tech-calendar/`）とリスト表示（`/tech-calendar/events`）は別パスとして数えます。比較メモは `docs/analytics-goatcounter-vs-cloudflare.md`、判断は `docs/adr/0009-goatcounter-analytics.md` です。

## ディレクトリ構成（概要）

```
csv2yaml.rb                  # data/ の年付き CSV → public/events_YYYY.yaml
check_events.rb              # 1日3件以上の日付を表示
Makefile                     # make events / make check-events
data/                        # CSV（git 対象外）
public/
  events.yaml                # 互換用。make events は events_YYYY.yaml を書く
  events_2026.yaml           # 年別イベント（csv2yaml の出力）
  holidays/
    2026.yaml                # 祝日（年ごと）
src/
  App.tsx
  analytics/                 # GoatCounter（本番のみ）
  pages/
    CalendarPage.tsx         # 月間カレンダー
    AllEventsPage.tsx        # リスト表示（今日以降が先頭）
  calendar/
    MonthlyCalendar.tsx
    EventDetailDialog.tsx
    monthly-calendar.css
    getCalendarGrid.ts
    loadHolidays.ts
  components/
    AppHeader.tsx
    EventList.tsx
    ui/
  utils/
    dataLoader.ts            # events*.yaml の取得と合成
    mergeEvents.ts
```

## ライセンス

プライベート利用を想定したリポジトリです。ライセンスは未設定です。

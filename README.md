# tech-calendar

日本の祝日に対応したイベントカレンダー Web アプリです。

月表示のカレンダー上でイベント日・祝日を確認し、その下に表示期間のイベントを出します。全件は別ページで、今日以降を先頭に並べます。

公開 URL: https://windhole.github.io/tech-calendar/

## 現状

月間カレンダーを GitHub Pages 向けに作り直している段階です。祝日は年別 YAML、イベントは `public/events.yaml` です。見た目はカレンダー専用 CSS に切り出しています。バックエンドや認証は未実装です。

## 機能

- 月曜始まりの月間カレンダー（対象月を含む 6 週間）
- 土曜日セルは薄い青、日曜日・祝日セルは薄い赤
- 祝日を `public/holidays/YYYY.yaml` で年ごとに指定
- 月送り・「今日」ボタン
- カレンダー下には、表示中の 6 週間と重なるイベントだけを表示
- `/events` で全イベントを確認（今日以降が上、スクロールで過去）

## 技術スタック

| 区分 | 内容 |
|------|------|
| フレームワーク | Vite + React 18 + TypeScript |
| UI | Tailwind CSS + shadcn/ui（Radix UI）＋ カレンダー専用 CSS |
| アイコン | lucide-react |
| 祝日 | 年別 YAML（`public/holidays/YYYY.yaml`） |
| イベント | YAML（`public/events.yaml`） |
| 公開 | GitHub Pages（Actions で `dist/` をデプロイ） |
| パッケージマネージャ | bun 1.4 |

## セットアップ

```bash
bun install
bun run dev
```

開発サーバーは `http://localhost:5173/tech-calendar/` で開きます（GitHub Pages と同じ base パスです）。全イベントは `http://localhost:5173/tech-calendar/events` です。

### その他のスクリプト

| コマンド | 説明 |
|----------|------|
| `bun run build` | 型チェック後にプロダクションビルド |
| `bun run preview` | ビルド結果のプレビュー |
| `bun run lint` | ESLint による静的解析 |
| `bun run typecheck` | TypeScript の型チェック |

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

`public/events.yaml` に 1 件 1 要素で書きます。

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
|----|----|
| Name | `VITE_GOATCOUNTER_COUNT_URL` |
| Value | `https://YOURCODE.goatcounter.com/count` |

Name は一字一句これです。Value の前後に空白や `" "` は付けません。

### 3. 本番ビルドをやり直す

この変数は `bun run build` のときに JS へ埋め込まれます。変数を足しただけ、または PR をマージしただけでは、すでに公開中のサイトは変わりません。

- まだ PR が未マージなら、変数を入れてからマージする（`main` への push で Deploy GitHub Pages が走る）
- すでに `main` に乗っているなら、**Actions** タブ → **Deploy GitHub Pages** → **Run workflow**（`main`）

カレンダー（`/tech-calendar/`）と全イベント（`/tech-calendar/events`）は別パスとして数えます。比較メモは `docs/analytics-goatcounter-vs-cloudflare.md`、判断は `docs/adr/0009-goatcounter-analytics.md` です。

## ディレクトリ構成（概要）

```
public/
  events.yaml                # イベント
  holidays/
    2026.yaml                # 祝日（年ごと）
src/
  App.tsx
  pages/
    CalendarPage.tsx         # 月間カレンダー
    AllEventsPage.tsx        # 全イベント（今日以降が先頭）
  calendar/
    MonthlyCalendar.tsx
    monthly-calendar.css
    getCalendarGrid.ts
    loadHolidays.ts
  components/
    EventList.tsx
    ui/
```

## ライセンス

プライベート利用を想定したリポジトリです。ライセンスは未設定です。

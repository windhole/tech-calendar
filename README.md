# tech-calendar

日本の祝日に対応したイベントカレンダー Web アプリです。

月表示のカレンダー上でイベント日・祝日を確認し、日付を選ぶとその日のイベント一覧を表示します。

公開 URL: https://windhole.github.io/tech-calendar/

## 現状

月間カレンダーを GitHub Pages 向けに作り直している段階です。祝日は YAML、見た目はカレンダー専用 CSS に切り出しています。イベント一覧は従来どおり静的 JSONL です。バックエンドや認証は未実装です。

## 機能

- 月曜始まりの月間カレンダー（対象月を含む 6 週間）
- 土曜日セルは薄い青、日曜日・祝日セルは薄い赤
- 祝日を `data/holidays.yaml` で指定
- 月送り・「今日」ボタン
- 日付選択によるイベント一覧の絞り込み

## 技術スタック

| 区分 | 内容 |
|------|------|
| フレームワーク | Vite + React 18 + TypeScript |
| UI | Tailwind CSS + shadcn/ui（Radix UI）＋ カレンダー専用 CSS |
| アイコン | lucide-react |
| 祝日 | YAML（`data/holidays.yaml`） |
| イベント | 静的 JSONL（`public/events.jsonl`） |
| 公開 | GitHub Pages（Actions で `dist/` をデプロイ） |

## セットアップ

```bash
npm install
npm run dev
```

開発サーバーは `http://localhost:5173/tech-calendar/` で開きます（GitHub Pages と同じ base パスです）。

### その他のスクリプト

| コマンド | 説明 |
|----------|------|
| `npm run build` | 型チェック後にプロダクションビルド |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run lint` | ESLint による静的解析 |
| `npm run typecheck` | TypeScript の型チェック |

## 祝日（YAML）

`data/holidays.yaml` に 1 件 1 要素で書きます。

```yaml
- date: "2026-08-11"
  name: 山の日
```

| フィールド | 型 | 説明 |
|------------|-----|------|
| `date` | `string` | 日付（`YYYY-MM-DD`。引用符推奨） |
| `name` | `string` | カレンダーに出す祝日名 |

ビルド時に読み込むため、変更後は再ビルドが必要です。

## 見た目のカスタマイズ

カレンダーの色・余白・角丸は `src/calendar/monthly-calendar.css` のカスタムプロパティを変えます。

```css
.monthly-calendar {
  --monthly-calendar-saturday-bg: #dbeafe;
  --monthly-calendar-sunday-bg: #fecaca;
  --monthly-calendar-holiday-bg: #fecaca;
}
```

状態クラスは `--saturday` / `--sunday` / `--holiday` / `--outside` / `--today` / `--selected` です。

## イベントデータ

`public/events.jsonl`（1行1オブジェクト）です。

```json
{"startDate":"2026-03-01","endDate":"2026-03-03","eventName":"テックカンファレンス2026","location":"パシフィコ横浜","url":"https://example.com/tech-conf"}
```

| フィールド | 型 | 説明 |
|------------|-----|------|
| `startDate` | `string` | 開始日（`YYYY-MM-DD`） |
| `endDate` | `string` | 終了日（`YYYY-MM-DD`） |
| `eventName` | `string` | イベント名 |
| `location` | `string` | 会場 |
| `url` | `string` | 詳細 URL |

## ディレクトリ構成（概要）

```
data/
  holidays.yaml              # 祝日
public/
  events.jsonl               # イベント
src/
  App.tsx
  calendar/
    MonthlyCalendar.tsx      # 月間カレンダー
    monthly-calendar.css     # 見た目（カスタムプロパティ）
    getCalendarGrid.ts       # 月曜始まり 6 週間
    loadHolidays.ts
  components/
    EventList.tsx
    ui/
```

## ライセンス

プライベート利用を想定したリポジトリです。ライセンスは未設定です。

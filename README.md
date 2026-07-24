# tech-calendar

日本の祝日に対応したイベントカレンダー Web アプリです。

月表示のカレンダー上でイベント日・祝日を確認し、日付を選ぶとその日のイベント一覧を表示します。

## 現状

プロトタイプ段階です。静的な JSONL ファイルからイベントと祝日を読み込み、フロントエンドのみで動作します。バックエンドや認証は未実装です。

## 機能

- 月送り・「今日」ボタン付きのカレンダー表示
- 祝日・イベント日のハイライト
- 日付選択によるイベント一覧の絞り込み
- イベントの期間・会場・URL の表示

## 技術スタック

| 区分 | 内容 |
|------|------|
| フレームワーク | Vite + React 18 + TypeScript |
| UI | Tailwind CSS + shadcn/ui（Radix UI） |
| アイコン | lucide-react |
| データ | 静的 JSONL（`public/`） |

`@supabase/supabase-js` は依存関係に含まれますが、現時点では未使用です。

## セットアップ

```bash
npm install
npm run dev
```

開発サーバー起動後、ブラウザで表示された URL を開いてください。

### その他のスクリプト

| コマンド | 説明 |
|----------|------|
| `npm run build` | 型チェック後にプロダクションビルド |
| `npm run preview` | ビルド結果のプレビュー |
| `npm run lint` | ESLint による静的解析 |
| `npm run typecheck` | TypeScript の型チェック |

## データ形式

データは `public/` 配下の JSONL（1行1オブジェクト）です。

### イベント（`public/events.jsonl`）

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

### 祝日（`public/holidays.jsonl`）

```json
{"date":"2026-01-01","name":"元日"}
```

| フィールド | 型 | 説明 |
|------------|-----|------|
| `date` | `string` | 日付（`YYYY-MM-DD`） |
| `name` | `string` | 祝日名 |

現状のサンプルはイベント 6 件・祝日 16 件（いずれも 2026 年想定）です。

## ディレクトリ構成（概要）

```
public/
  events.jsonl      # イベントデータ
  holidays.jsonl    # 祝日データ
src/
  App.tsx           # アプリ本体
  components/
    Calendar.tsx    # カレンダー表示
    EventList.tsx   # イベント一覧
    ui/             # shadcn/ui コンポーネント
  types/            # Event / Holiday 型定義
  utils/
    dataLoader.ts   # JSONL の読み込み
    dateUtils.ts    # 日付ユーティリティ
```

## ライセンス

プライベート利用を想定したリポジトリです。ライセンスは未設定です。

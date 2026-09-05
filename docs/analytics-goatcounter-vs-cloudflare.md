# GoatCounter と Cloudflare Web Analytics の比較

Date: 2026-09-05  
対象サイト: GitHub Pages の [tech-calendar](https://windhole.github.io/tech-calendar/)

この文書は、アクセス数を測るための候補として **GoatCounter** と **Cloudflare Web Analytics** を調べたメモです。導入の決定はまだしていません。

名前について: よく似た **Cloudflare Access** は、社内アプリへのログイン制限用の製品です。計測ツールではありません。ここで扱うのは **Cloudflare Web Analytics**（旧称 Browser Insights）です。

GitHub Pages 自体に公開サイトのアクセスログはありません。リポジトリの Insights → Traffic は GitHub 上の閲覧・clone であり、カレンダーサイトの訪問ではありません。

---

## このサイトで測りたいこと（前提）

tech-calendar は静的サイト（Vite + React）で、ページは主に次の2つです。

- `/tech-calendar/` … 月間カレンダー
- `/tech-calendar/events` … 全イベント一覧

React Router の History API で切り替える SPA です。`#` ハッシュルーティングではありません。

知りたいのは、だいたい次です。

- 何人が開いたか（日次のざっくり）
- カレンダーと `/events` のどちらが多いか
- どこから来たか（検索、SNS、直接入力）
- 可能なら国・端末の内訳

広告のリターゲティングや、個人を追い続ける計測は不要です。

---

## 共通点

どちらも次の点では近いです。

- Cookie を visiter に置かない（同意バナーを前提にしなくてよい、という説明が多い）
- 個人を横断サイトで追跡する設計ではない
- GitHub Pages でも、HTML に小さな JS を足せば動く（DNS を Cloudflare に移さなくても可）
- 広告ブロッカーで **一部の訪問が落ちる**（サーバーログがない GitHub Pages では避けにくい）
- Google Analytics より軽く、この規模の個人カレンダー向き

どちらも「GitHub Pages の生ログを見る」のではなく、**ブラウザがビーコンを送る**方式です。JS を無効にした人、ビーコンを遮断した人は数えません。

---

## GoatCounter

公式: [goatcounter.com](https://www.goatcounter.com/)  
ソース: オープンソース（EUPL）。Go の単一バイナリ + SQLite。

### 何をするか

訪問（visit）とパスごとの件数を集計する、小さなアクセス解析です。ダッシュボードは1画面で、日付ごとのグラフ、パス、リファラ、ブラウザ、OS、国、画面幅、言語が出ます。UTM やキャンペーン用のパラメータも扱えます。クリックなどのカスタムイベントも足せます。

既定では「訪問」を数えます。同じ人が短時間に何度リロードしても、訪問は1として扱います（約8時間、メモリ上の一時キー。IP や User-Agent は DB に残さない）。ページビュー単位に切り替える設定もあります。

データの持ち方は **日次・時間次の集計表** が中心です。ブラウザ別と画面幅別を後から1人に紐づけ直すことはできません。個人のタイムラインを作らない、という設計です。

### GitHub Pages への入れ方

1. goatcounter.com でサイトを作る（`xxxxx.goatcounter.com`）
2. `index.html` に公式の `<script>` を1行足す（約 3.5KB）
3. デプロイする

サーバーサイドのログ取り込みもできますが、GitHub Pages にアクセスログがないので、このサイトでは使えません。ピクセル（画像）方式もあり、JS なしでも数えられますが、情報は減ります。

SPA について: 初回ロードは自動で数えます。`/events` へのクライアント遷移をパス別に数えたい場合は、ルート変更時に `goatcounter.count()` を呼ぶ必要があります。公式ヘルプの SPA 例はハッシュ変更向けですが、同じ `count()` を React Router の遷移に繋げられます。

### メリット

- **この用途にちょうどよい。** 「今日何人来たか」「どの URL か」「どこから来たか」が主目的。ダッシュボードが単純。
- **オープンソース。** 何を送っているかコードで確認できる。気に入らなければ自前サーバーに移せる。
- **データが自分のサイト単位で残る。** CSV 等で出せる。アカウント削除で消せる。
- **個人サイトの hosted は無料**（公式: 妥当な公開利用。個人サイトや中小は可。1日何百万 PV は想定外）。寄付で運営。
- **スクリプトが小さい。** サイト本体をほとんど重くしない。
- **収集項目をサイト設定で止められる**（画面幅を取らない、など）。
- 訪問の重複除外が分かりやすい（リロードで数字が暴騰しにくい）。

### デメリット

- **一人の作者が運営する hosted。** 会社の SLA はない。止まっても自分で replica を立てるまでは見られない。
- **広告ブロッカーで欠ける。** 公式の見積もりでは、サイトによるがページビューの3割程度が落ちることがある。自前ホストにするとドメインが変わるので遮断されにくい。
- **GitHub Pages ではログ取り込み不可。** 欠測をサーバー側で埋める手段がない。
- **商用の hosted は有料、という整理**がある（サードパーティの紹介では Starter 約 $5 / Business 約 $15。公式の最新料金はサイトで確認）。個人の tech-calendar なら無料枠の意図に合う。
- **パフォーマンス（表示の速さ）は測らない。** Core Web Vitals はない。
- **ダッシュボードは英語。** 機能は単純なので支障は小さい。
- **統計の反映は最大十数秒遅れる**（効率のため。リアルタイム監視用ではない）。
- SPA のページ別カウントは、そのままでは初回ロード中心。`/events` を分けて見るならコードが少し要る。

### このリポジトリとの相性

「何人来たか」を軽く見る用途に合う。Cookie バナーを足さずに済む説明が公式にある。Cloudflare アカウントや DNS 変更は不要。

---

## Cloudflare Web Analytics

公式: [cloudflare.com/web-analytics](https://www.cloudflare.com/web-analytics/)  
ドキュメント: [developers.cloudflare.com/web-analytics](https://developers.cloudflare.com/web-analytics/about/)

### 何をするか

訪問者のブラウザから **利用状況と表示性能（RUM）** を取る無料の計測です。Cookie も localStorage も visiter に使わない、IP / UA で個人を追跡しない、と公式が書いています。

取れるものの例:

- 訪問・ページビュー
- リファラ、国、端末（ざっくり）
- **Core Web Vitals**（LCP, INP, CLS など、実ユーザーから見た速さ）

取らない・まだないもの（公式 FAQ、2026年時点）:

- **UTM パラメータ**（クエリ文字列を残さない。機微な情報が混ざるのを避けるため）
- **カスタムイベント**（クリック計測など。将来検討とある）
- サーバー側の URL 内訳（ビーコン方式ではクライアント計測のみ）

データの寿命:

- ダッシュボードで見られるのは **直近6か月**
- 生に近いビーコンは **7日**、その後は集約（おおよそ1割程度）して長期保存
- ダッシュボードの数字は、期間や件数によって **サンプリング** がかかる（低トラフィックでは信頼度を保つ方向に厚め、と説明）

### GitHub Pages への入れ方（2通り）

**A. ビーコンだけ（おすすめの入り方）**

1. Cloudflare アカウントを作る
2. Web Analytics でサイトを追加（プロキシなし / standalone）
3. ホスト名は `windhole.github.io`（`github.io` 全体にしない）
4. 発行された `<script type="module" src="https://static.cloudflareinsights.com/beacon.min.js" …>` を `index.html` に貼る
5. デプロイする

DNS を動かさなくてよい、と公式が明記しています。GitHub Pages のまま使えます。

**B. サイト全体を Cloudflare のプロキシに置く**

独自ドメインを GitHub Pages に付け、Cloudflare でオレンジ雲（プロキシ）にする方法です。ビーコンなしでもエッジのアクセス統計が取れ、広告ブロッカーをかなり避けられます。ただし **Pages の URL 構造・キャッシュ・カスタムドメイン設定が変わる** ので、計測のためだけにやる作業量は大きいです。有料プランのエッジ分析の話とも混ざりやすいです。

tech-calendar の現状（`*.github.io/tech-calendar/`）では A が現実的です。

SPA: History API（`pushState` / Navigation API など）の経路変更を自動で拾う、と公式にあります。ハッシュルータは非対応。このアプリは BrowserRouter なので、`/` と `/events` の切り替えは自動計測の対象になり得ます。

### メリット

- **無料で、ページビュー上限の公表がない。** Cloudflare 無料アカウントで足りる。
- **会社として継続しているプロダクト。** ダッシュボード・アカウント・ドキュメントが揃っている。
- **速さの指標（Core Web Vitals）が付く。** 「来たか」だけでなく「遅いか」も見える。
- **GitHub Pages のまま JS 1本で始められる。** DNS 必須ではない。
- **SPA のルート変更を自動で追う**（History API）。`/events` 用の手書きコードが GoatCounter より少なくて済む可能性が高い。
- Cookie なし、個人追跡しない、という公式の立場。同意バナーなしで始める例が多い。

### デメリット

- **広告ブロッカーに遮断されやすい。** `static.cloudflareinsights.com` / `cloudflareinsights.com` はブロックリストに載ることが多い。Brave や一部拡張では **テストしても数字がゼロ** になり得る。公式も認識している。GitHub Pages ではエッジ計測に逃げられない（プロキシしない限り）。
- **保存が6か月。** 年単位の「去年の9月」比較はダッシュボードだけではできない。
- **サンプリング。** 7日超は集約。低トラフィックでは影響は小さいが、「ぴったり何人」ではない。
- **UTM・カスタムイベントがない。** 「X の投稿から来たか」を URL パラメータで見る用途には弱い。
- **データは Cloudflare 側。** オープンソースではない。エクスポートや自前ホストは GoatCounter ほど簡単ではない。
- **ホスト名の一致に厳しい。** 設定したホストと実際のページが違うと CORS で送れない。`github.io` 配下なので、登録ホストを間違えると他サイトや無反応の原因になる。
- **サイト数のソフト上限がアカウントあたり10。** 増やせるがサポート経由。
- **ダッシュボードは「解析＋RUM」寄り。** 単純なカウンターとしては GoatCounter より画面が多い。
- プロキシなしでは **ボットや JS なしのヒットはほぼ見えない**（GoatCounter の JS 方式も同じ）。

### このリポジトリとの相性

Cloudflare をすでに使っている、または「表示が遅いか」も見たいなら強い。純粋な人数カウントだけなら、ブロッカーで欠ける点と6か月保持が気になりやすい。

---

## 項目ごとの比較

| 項目 | GoatCounter | Cloudflare Web Analytics |
|------|-------------|--------------------------|
| 目的 | 訪問・パス・リファラの集計 | 訪問に加え、実ユーザーの表示性能（RUM） |
| 料金（個人サイト） | hosted は妥当な利用なら無料（寄付歓迎） | 無料 |
| Cookie（訪問者） | なし | なし |
| 個人の横断追跡 | しない（日をまたぐ同一人物も持たない） | しない（フィンガープリントしないと明記） |
| スクリプト | 約 3.5KB。`gc.zgo.at/count.js` | beacon。`static.cloudflareinsights.com` |
| GitHub Pages | `index.html` に1行 | 同様に1行（ホスト名を `windhole.github.io` に） |
| DNS / プロキシ | 不要 | ビーコン方式なら不要 |
| SPA（このアプリ） | 初回は自動。`/events` は `count()` を足すと確実 | History API ならルート変更を自動追跡、とある |
| パス別 PV | 強い（時間単位の集計） | クライアント計測。UTM はなし |
| リファラ | あり（ドメイン＋URL） | あり |
| 国・端末 | あり（IP から国だけ取り、IP は捨てる） | あり |
| 表示速度 | なし | Core Web Vitals あり |
| カスタムイベント | あり | なし（公式: 未対応） |
| データ保持 | 自分のサイトとして蓄積・エクスポート可 | ダッシュボードは6か月。7日超は集約 |
| サンプリング | 集計表。低トラフィックでも「何件」が見やすい | 7日超は集約。ダッシュボードは動的サンプリング |
| 広告ブロッカー | 欠ける（公式で言及）。自前ホストで緩和 | ビーコンは遮断されやすい。エッジはプロキシ時のみ |
| オープンソース | はい。自前ホスト可 | いいえ。Cloudflare のサービス |
| 運用主体 | 個人開発者（Ireland、サーバーは Hetzner EU） | Cloudflare |
| 向き | 「何人・どのページ・どこから」 | 「何人」＋「遅いか」。CF エコシステム |

---

## tech-calendar 向けの整理

**GoatCounter が向く場合**

- まず人数とページと流入元が知りたい
- データを長く残したい、必要ならファイルで出したい
- コードが公開されていて、後から自前ホストに逃げられる方が安心
- Core Web Vitals は今は要らない

**Cloudflare Web Analytics が向く場合**

- すでに Cloudflare アカウントがある
- 表示の遅さも数字で見たい
- `/` と `/events` の SPA 遷移を、できるだけ手書きなしで取りたい
- 6か月あれば足りる。大企業のサポートやダッシュボードに慣れている

**どちらも向かないこと**

- 「GitHub のログを見るだけ」で完結すること（ログがない）
- 広告ブロッカー込みの **真の全ヒット**（Pages ではサーバーログがない）
- 個人を日をまたいで追うこと（どちらも設計としてやらない）

ブロッカーの欠測を本気で減らすなら、独自ドメイン + Cloudflare プロキシ + エッジ統計、または GoatCounter 自前ホスト、が次の段です。いまの `github.io` のまま始めるなら、欠測はある前提です。

---

## 入れ方の差（実装イメージ）

GoatCounter（公式の1行。コードはサイト発行後に差し替え）:

```html
<script data-goatcounter="https://MYCODE.goatcounter.com/count"
        async src="//gc.zgo.at/count.js"></script>
```

`/events` もパスとして数えるなら、React Router の遷移時に `window.goatcounter.count({ path: ... })` を足す。

Cloudflare Web Analytics（公式の手動埋め込み）:

```html
<script
  type="module"
  src="https://static.cloudflareinsights.com/beacon.min.js"
  data-cf-beacon='{"token": "YOUR_TOKEN"}'></script>
```

ホスト名は `windhole.github.io`。トークンはダッシュボード発行。

どちらも `index.html` だけで足り、アプリのイベント YAML 読み込みとは独立です。

---

## 参考（一次情報）

- [GoatCounter](https://www.goatcounter.com/)
- [GoatCounter プライバシー](https://www.goatcounter.com/help/privacy)
- [GoatCounter sessions](https://www.goatcounter.com/help/sessions)
- [GoatCounter SPA](https://www.goatcounter.com/help/spa)
- [GoatCounter FAQ](https://www.goatcounter.com/help/faq)
- [Cloudflare Web Analytics](https://www.cloudflare.com/web-analytics/)
- [Cloudflare Web Analytics About](https://developers.cloudflare.com/web-analytics/about/)
- [Cloudflare Web Analytics FAQ](https://developers.cloudflare.com/web-analytics/faq/)
- [Cloudflare Web Analytics SPA](https://developers.cloudflare.com/web-analytics/get-started/web-analytics-spa/)
- [GitHub リポジトリ Traffic API](https://docs.github.com/en/rest/metrics/traffic)（サイト訪問ではない）

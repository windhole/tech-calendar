# 0009. アクセス計測は GoatCounter から始める

Date: 2026-09-05
Status: Accepted

## Context

GitHub Pages には公開サイトのアクセスログがない。リポジトリの Insights → Traffic は GitHub 上の閲覧・clone であり、カレンダーサイトの訪問ではない。訪問数と、カレンダー（`/`）と全イベント（`/events`）のどちらが開かれたかを知りたい。

候補は GoatCounter と Cloudflare Web Analytics。比較は `docs/analytics-goatcounter-vs-cloudflare.md`。Cloudflare Access はログイン制限用で、計測ツールではない。

当面の訪問は少ない想定。後から利用が増えたら Cloudflare Web Analytics に切り替え、そのタイミングで Cloudflare Pages への移行も検討してよい。

## Decision

- まず GoatCounter を入れる。Cookie なし、スクリプトは小さく、管理画面も単純。
- 計測するのは GitHub Pages の本番だけ。`bun run dev` の localhost と、ホストが `localhost` / `127.0.0.1` のときはスクリプトを読まない。
- エンドポイント（`https://<code>.goatcounter.com/count`）はソースに書かない。`VITE_GOATCOUNTER_COUNT_URL` で渡す。未設定なら何もしない。
- SPA なので `no_onload: true` にし、React Router のパスが変わったときに `goatcounter.count({ path })` する。パスは実際の URL（`/tech-calendar/` と `/tech-calendar/events`）にする。
- Cloudflare Web Analytics と Cloudflare Pages はこの ADR では採用しない。利用が増えたときに別 ADR で見直す。

## Consequences

- GoatCounter のサイトを作り、GitHub の Actions 変数 `VITE_GOATCOUNTER_COUNT_URL` を入れてから本番ビルドしないと、公開サイトではカウントされない。
- count URL は HTML / JS に出る。秘密情報ではないが、他人のエンドポイントを誤って入れるとそちらに送ってしまう。
- 訪問が増えても GoatCounter の無料枠で足りるうちは、ホストを GitHub Pages のままにできる。
- 後で Cloudflare に寄せるなら、計測とホスティングをまとめて検討する（この ADR を更新するか、新しい ADR を書く）。

# 0020. 変換スクリプトは rbenv の最新安定版 Ruby で動かす

Date: 2026-10-01
Status: Accepted

## Context

`make events` が `/usr/bin/ruby` 2.6.10 で落ちた。`csv2yaml.rb` は Ruby 2.7 で入った `Enumerable#filter_map` を使う。ADR-0006 と ADR-0011 はシステム Ruby で足りるとしていたが、この Mac のシステム Ruby は 2.6 のままである。rbenv は入っていて、2026-10-01 時点の最新安定版（MRI）は 4.0.7。

## Decision

- このリポジトリの Ruby は rbenv の最新安定版（MRI）に固定する。バージョンは `.ruby-version` に書く。現在は 4.0.7。
- `make events` / `make check` / `make clean` は `rbenv exec ruby` でそのバージョンを起動する。PATH 上の `/usr/bin/ruby` は使わない。
- スクリプトは引き続き標準ライブラリのみ。アプリの bun 依存には載せない。

## Consequences

- rbenv と `.ruby-version` の Ruby が無いと make は失敗する。初回は `rbenv install` が必要。
- 「システム Ruby があれば足りる」は、この決定が置き換える。変換と点検の中身は ADR-0006 / ADR-0011 のまま。
- 最新安定版が上がったら `.ruby-version` を更新して入れ直す。

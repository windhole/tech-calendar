.PHONY: events check-events clean

SINCE ?= 2026-09-01

# data/ の年付き CSV から public/events_YYYY.yaml を生成する（csv2yaml.rb）
# 同じ年が複数あるときは更新が新しい CSV を 1 つ使う
# 開始日を変える例: make events SINCE=2026-10-01
events:
	ruby csv2yaml.rb $(SINCE)

# public/events*.yaml を合成して、1日3件以上の日付を表示する（check_events.rb）
# イベント名の重複と日付の逆転は make events（csv2yaml.rb）がエラーにする
# ファイルを変える例: ruby check_events.rb public/events_2026.yaml
check-events:
	ruby check_events.rb

# data/ のうち csv2yaml が使わない CSV を削除する
# （西暦なし、または同じ年のより古いファイル）
clean:
	ruby csv2yaml.rb --clean

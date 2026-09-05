.PHONY: events check-events

SINCE ?= 2026-09-01

# data/ の最新 CSV から events YAML を生成する（csv2yaml.rb）
# 出力は data/events_YYYYMMDD_NNN.yaml（その日のシリアル）
# 開始日を変える例: make events SINCE=2026-10-01
events:
	ruby csv2yaml.rb $(SINCE)

# public/events.yaml のイベント名重複と、1日3件以上の日付を表示する
# ファイルを変える例: ruby check_events.rb data/events_20260905_001.yaml
check-events:
	ruby check_events.rb

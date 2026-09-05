.PHONY: events

SINCE ?= 2026-09-01

# data/ の最新 CSV から events YAML を生成する（csv2yaml.rb）
# 出力は data/events_YYYYMMDD_NNN.yaml（その日のシリアル）
# 開始日を変える例: make events SINCE=2026-10-01
events:
	ruby csv2yaml.rb $(SINCE)

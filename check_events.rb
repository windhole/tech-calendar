#!/usr/bin/env ruby
# frozen_string_literal: true

# events.yaml で、1日3件以上の日付を表示する。
# 使い方: リポジトリ直下で `ruby check_events.rb [path]` または `make check-events`
# 省略時は public/events*.yaml をすべて読む（新しいファイルが同じ開始日・同じ名前を上書き）。
# 件数は startDate〜endDate が重なる日で数える。
# イベント名の重複と日付の逆転は csv2yaml.rb がエラーにする（ADR-0012）。

require 'date'
require 'yaml'

DEFAULT_DIR = File.expand_path('public', __dir__)
MIN_EVENTS_PER_DAY = 3

def iso_date(value, field, event_name)
  text = value.is_a?(Date) ? value.strftime('%Y-%m-%d') : value.to_s.strip
  Date.strptime(text, '%Y-%m-%d')
rescue ArgumentError
  abort "#{event_name}: #{field} が YYYY-MM-DD ではありません: #{value.inspect}"
end

def field(row, key)
  row[key] || row[key.to_s] || row[key.to_sym]
end

def load_events(path)
  abort "ファイルがありません: #{path}" unless File.file?(path)

  raw = File.read(path, encoding: 'BOM|UTF-8')
  data = YAML.safe_load(raw, permitted_classes: [Date], aliases: false)
  abort "#{path}: YAML のリストではありません" unless data.is_a?(Array)

  data.map.with_index(1) do |row, index|
    abort "#{path}: #{index} 件目がマップではありません" unless row.is_a?(Hash)

    name = field(row, 'eventName').to_s.strip
    label = name.empty? ? "#{index}件目" : name
    start_date = iso_date(field(row, 'startDate'), 'startDate', label)
    end_date = iso_date(field(row, 'endDate'), 'endDate', label)

    {
      name: name,
      start_date: start_date,
      end_date: end_date
    }
  end
end

def crowded_days(events, min: MIN_EVENTS_PER_DAY)
  by_day = Hash.new { |hash, day| hash[day] = [] }

  events.each do |event|
    next if event[:end_date] < event[:start_date]

    (event[:start_date]..event[:end_date]).each do |day|
      by_day[day] << event
    end
  end

  by_day.select { |_day, group| group.size >= min }.sort_by { |day, _group| day }
end

def print_crowded_days(days)
  puts "■ 1日#{MIN_EVENTS_PER_DAY}件以上"
  if days.empty?
    puts 'なし'
    return
  end

  days.each do |day, group|
    puts "- #{day.strftime('%Y-%m-%d')} (#{group.size}件)"
    group.each do |event|
      label = event[:name].empty? ? '(名前なし)' : event[:name]
      puts "  - #{label}"
    end
  end
end

def default_event_yaml_paths
  Dir.glob(File.join(DEFAULT_DIR, 'events*.yaml')).sort_by { |path| [File.mtime(path), path] }
end

def merge_event_layers(layers)
  by_key = {}
  layers.each do |events|
    events.each do |event|
      key = [event[:start_date].strftime('%Y-%m-%d'), event[:name]]
      by_key[key] = event
    end
  end
  by_key.values
end

if $PROGRAM_NAME == __FILE__
  paths =
    if ARGV[0]
      [File.expand_path(ARGV[0])]
    else
      default_event_yaml_paths
    end
  abort 'public/ に events*.yaml がありません' if paths.empty?

  layers = paths.map { |path| load_events(path) }
  events = merge_event_layers(layers)

  warn "対象: #{paths.join(', ')}"
  warn "件数: #{events.size}"
  puts
  print_crowded_days(crowded_days(events))
end

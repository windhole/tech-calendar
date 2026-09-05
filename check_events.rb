#!/usr/bin/env ruby
# frozen_string_literal: true

# events.yaml のイベント名重複と、1日3件以上の日付を表示する。
# 使い方: リポジトリ直下で `ruby check_events.rb [path]` または `make check-events`
# 省略時は public/events.yaml。件数は startDate〜endDate が重なる日で数える。

require 'date'
require 'yaml'

DEFAULT_PATH = File.expand_path('public/events.yaml', __dir__)
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

def format_range(event)
  start_date = event[:start_date]
  end_date = event[:end_date]
  if start_date == end_date
    start_date.strftime('%Y-%m-%d')
  else
    "#{start_date.strftime('%Y-%m-%d')} 〜 #{end_date.strftime('%Y-%m-%d')}"
  end
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
      end_date: end_date,
      location: field(row, 'location').to_s.strip,
      inverted: end_date < start_date
    }
  end
end

def duplicate_name_groups(events)
  events.group_by { |event| event[:name] }.select do |name, group|
    !name.empty? && group.size >= 2
  end.sort_by { |name, _group| name }
end

def crowded_days(events, min: MIN_EVENTS_PER_DAY)
  by_day = Hash.new { |hash, day| hash[day] = [] }

  events.each do |event|
    next if event[:inverted]

    (event[:start_date]..event[:end_date]).each do |day|
      by_day[day] << event
    end
  end

  by_day.select { |_day, group| group.size >= min }.sort_by { |day, _group| day }
end

def inverted_events(events)
  events.select { |event| event[:inverted] }
end

def print_inverted(events)
  return if events.empty?

  puts '■ 日付が不正（endDate が startDate より前）'
  events.each do |event|
    label = event[:name].empty? ? '(名前なし)' : event[:name]
    puts "- #{label}: #{format_range(event)}"
  end
  puts
end

def print_duplicates(groups)
  puts '■ イベント名の重複'
  if groups.empty?
    puts 'なし'
    return
  end

  groups.each do |name, group|
    puts "- #{name} (#{group.size}件)"
    group.each do |event|
      location = event[:location].empty? ? '' : "  #{event[:location]}"
      puts "  - #{format_range(event)}#{location}"
    end
  end
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

if $PROGRAM_NAME == __FILE__
  path = ARGV[0] ? File.expand_path(ARGV[0]) : DEFAULT_PATH
  events = load_events(path)

  warn "対象: #{path}"
  warn "件数: #{events.size}"
  puts
  print_inverted(inverted_events(events))
  print_duplicates(duplicate_name_groups(events))
  puts
  print_crowded_days(crowded_days(events))
end

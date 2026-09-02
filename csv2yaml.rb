#!/usr/bin/env ruby
# frozen_string_literal: true

# data/ の最新 CSV を public/events.yaml と同じ形式の YAML に変換する。
# 使い方: リポジトリ直下で `ruby csv2yaml.rb [YYYY-MM-DD]` または `make events`
# 開始日（省略時は 2026-09-01）以降に始まるイベントだけを出す。

require 'csv'
require 'date'

DATA_DIR = File.expand_path('data', __dir__)
DEFAULT_SINCE = '2026-09-01'

def parse_since(raw)
  text = raw.to_s.strip
  text = DEFAULT_SINCE if text.empty?
  unless text.match?(/\A\d{4}-\d{2}-\d{2}\z/)
    abort "開始日は YYYY-MM-DD で指定してください: #{raw.inspect}"
  end

  Date.strptime(text, '%Y-%m-%d')
rescue ArgumentError
  abort "開始日が暦として不正です: #{raw.inspect}"
end

def latest_csv
  files = Dir.glob(File.join(DATA_DIR, '*.csv'))
  abort "data/ に CSV がありません" if files.empty?

  files.max_by { |path| File.mtime(path) }
end

def year_from_filename(path)
  match = File.basename(path).match(/(\d{4})/)
  abort "CSV ファイル名から西暦（4桁）を取れません: #{File.basename(path)}" unless match

  match[1].to_i
end

def parse_date(raw, year)
  text = raw.to_s.strip
  raise "日付が空です" if text.empty?

  if (match = text.match(/\A(\d{4})[\/\-](\d{1,2})[\/\-](\d{1,2})\z/))
    return Date.new(match[1].to_i, match[2].to_i, match[3].to_i).strftime('%Y-%m-%d')
  end

  match = text.match(/\A(\d{1,2})月(\d{1,2})日/)
  raise "日付を解釈できません: #{raw.inspect}" unless match

  Date.new(year, match[1].to_i, match[2].to_i).strftime('%Y-%m-%d')
end

def yaml_quote(text)
  escaped = text.gsub('\\', '\\\\').gsub('"', '\\"').gsub("\n", '\\n')
  %("#{escaped}")
end

# public/events.yaml と同じ見た目になるよう、必要なときだけダブルクォートする。
def yaml_string(value)
  text = value.to_s
  return '""' if text.empty?

  needs_quotes =
    text.match?(/\A\d{4}-\d{2}-\d{2}\z/) ||
    text.match?(/[\#\[\]\{\}&*!|>'"%@`,]/) ||
    text.include?(': ') ||
    text.match?(/\A[-?:]/) ||
    text.match?(/\A(?:true|false|null|yes|no|on|off)\z/i) ||
    text.match?(/\A\s|\s\z/) ||
    text.include?("\n")

  needs_quotes ? yaml_quote(text) : text
end

def emit_event(io, event)
  io.puts "- startDate: #{yaml_string(event[:start_date])}"
  io.puts "  endDate: #{yaml_string(event[:end_date])}"
  io.puts "  eventName: #{yaml_string(event[:event_name])}"
  io.puts "  location: #{yaml_string(event[:location])}"
  io.puts "  url: #{yaml_string(event[:url])}"
  io.puts "  tag: #{yaml_string(event[:tag])}" unless event[:tag].to_s.empty?
end

def public_true?(row)
  row['Public'].to_s.strip.casecmp('TRUE').zero?
end

csv_path = latest_csv
year = year_from_filename(csv_path)
since = parse_since(ARGV[0])
events = []

File.open(csv_path, 'r:BOM|UTF-8') do |file|
  CSV.new(file, headers: true).each.with_index(2) do |row, line|
    next unless public_true?(row)

    event_name = row['eventName'].to_s.strip
    next if event_name.empty?

    begin
      start_date = parse_date(row['startDate'], year)
      next if Date.strptime(start_date, '%Y-%m-%d') < since

      events << {
        start_date: start_date,
        end_date: parse_date(row['endDate'], year),
        event_name: event_name,
        location: row['location'].to_s.strip,
        url: row['url'].to_s.strip,
        tag: row['tag'].to_s.strip
      }
    rescue StandardError => e
      abort "#{File.basename(csv_path)}:#{line}: #{e.message}"
    end
  end
end

stamp = Time.now.strftime('%Y%m%d-%H%M')
out_path = File.join(DATA_DIR, "events_#{stamp}.yaml")

File.open(out_path, 'w:UTF-8') do |io|
  io.puts '# イベント一覧。date は YYYY-MM-DD（引用符推奨）。'
  io.puts '#'
  io.puts "# generated from #{File.basename(csv_path)}"
  io.puts "# since #{since.strftime('%Y-%m-%d')}"
  io.puts

  events.each do |event|
    emit_event(io, event)
  end
end

warn "入力: #{csv_path}"
warn "開始日: #{since.strftime('%Y-%m-%d')} 以降"
warn "件数: #{events.size}"
warn "出力: #{out_path}"

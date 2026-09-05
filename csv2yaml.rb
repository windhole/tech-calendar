#!/usr/bin/env ruby
# frozen_string_literal: true

# data/ の年付き CSV を public/events_YYYY.yaml に変換する。
# 使い方: リポジトリ直下で `ruby csv2yaml.rb [YYYY-MM-DD]` または `make events`
# 開始日（省略時は 2026-09-01）以降に始まるイベントだけを出す。
# 同じ年の CSV が複数あるときは、更新が新しいものを 1 つ使う。
# 2026 の CSV は public/events_2026.yaml、2027 は public/events_2027.yaml。
# endDate が startDate より前、またはイベント名が重複しているときはエラーで止める。

require 'csv'
require 'date'

DATA_DIR = File.expand_path('data', __dir__)
PUBLIC_DIR = File.expand_path('public', __dir__)
DEFAULT_SINCE = '2026-09-01'
LEGACY_EVENTS_YAML = 'events.yaml'

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

# ファイル名に独立した 4 桁西暦があればそれを返す。長い数字の一部は年とみなさない。
def year_from_filename(path)
  match = File.basename(path).match(/(?<!\d)(\d{4})(?!\d)/)
  match && match[1].to_i
end

def select_year_csvs(data_dir)
  files = Dir.glob(File.join(data_dir, '*.csv'))
  abort "#{data_dir} に CSV がありません" if files.empty?

  by_year = Hash.new { |h, k| h[k] = [] }
  skipped = []

  files.each do |path|
    year = year_from_filename(path)
    if year.nil?
      skipped << path
      next
    end
    by_year[year] << path
  end

  abort "#{data_dir} に西暦（4桁）を含む CSV がありません" if by_year.empty?

  skipped.each do |path|
    warn "スキップ（ファイル名に西暦がない）: #{path}"
  end

  selected = {}
  by_year.keys.sort.each do |year|
    paths = by_year[year].sort_by { |path| [File.mtime(path), path] }
    chosen = paths.last
    paths[0...-1].each do |path|
      warn "スキップ（#{year} のより新しい CSV がある）: #{path}"
    end
    selected[year] = chosen
  end

  selected
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

def validation_errors(events)
  errors = []

  events.each do |event|
    start_date = Date.strptime(event[:start_date], '%Y-%m-%d')
    end_date = Date.strptime(event[:end_date], '%Y-%m-%d')
    next unless end_date < start_date

    where = event[:line] ? "#{event[:line]}: " : ''
    errors << "#{where}#{event[:event_name]}: endDate (#{event[:end_date]}) が startDate (#{event[:start_date]}) より前です"
  end

  events.group_by { |event| event[:event_name] }.sort_by { |name, _group| name }.each do |name, group|
    next if name.to_s.empty? || group.size < 2

    lines = group.filter_map { |event| event[:line] }
    where = lines.empty? ? '' : "（行 #{lines.join(', ')}）"
    ranges = group.map { |event| "#{event[:start_date]}〜#{event[:end_date]}" }.join(', ')
    errors << "イベント名が重複しています: #{name} (#{group.size}件: #{ranges})#{where}"
  end

  errors
end

def format_source_errors(errors, source)
  label = File.basename(source)
  errors.map do |msg|
    if msg.match?(/\A\d+: /)
      "#{label}:#{msg}"
    else
      "#{label}: #{msg}"
    end
  end
end

def read_events(csv_path, year, since)
  events = []
  errors = []

  File.open(csv_path, 'r:BOM|UTF-8') do |file|
    CSV.new(file, headers: true).each.with_index(2) do |row, line|
      next unless public_true?(row)

      event_name = row['eventName'].to_s.strip
      next if event_name.empty?

      begin
        start_date = parse_date(row['startDate'], year)
        next if Date.strptime(start_date, '%Y-%m-%d') < since

        events << {
          line: line,
          start_date: start_date,
          end_date: parse_date(row['endDate'], year),
          event_name: event_name,
          location: row['location'].to_s.strip,
          url: row['url'].to_s.strip,
          tag: row['tag'].to_s.strip
        }
      rescue StandardError => e
        errors << "#{File.basename(csv_path)}:#{line}: #{e.message}"
      end
    end
  end

  errors.concat(format_source_errors(validation_errors(events), csv_path))
  [events, errors]
end

def write_events_yaml(out_path, events, csv_basename, since)
  File.open(out_path, 'w:UTF-8') do |io|
    io.puts '# イベント一覧。date は YYYY-MM-DD（引用符推奨）。'
    io.puts '#'
    io.puts "# generated from #{csv_basename}"
    io.puts "# since #{since.strftime('%Y-%m-%d')}"
    io.puts

    events.each do |event|
      emit_event(io, event)
    end
  end
end

def convert_all!(data_dir:, public_dir:, since:)
  selected = select_year_csvs(data_dir)
  prepared = []
  errors = []

  selected.each do |year, csv_path|
    events, file_errors = read_events(csv_path, year, since)
    errors.concat(file_errors)
    prepared << [year, csv_path, events]
  end

  unless errors.empty?
    errors.each { |msg| warn msg }
    abort "エラーが #{errors.size} 件あるため YAML を出力しません"
  end

  Dir.mkdir(public_dir) unless File.directory?(public_dir)

  prepared.each do |year, csv_path, events|
    out_path = File.join(public_dir, format('events_%d.yaml', year))
    write_events_yaml(out_path, events, File.basename(csv_path), since)
    warn "入力: #{csv_path}"
    warn "開始日: #{since.strftime('%Y-%m-%d')} 以降"
    warn "件数: #{events.size}"
    warn "出力: #{out_path}"
  end

  legacy = File.join(public_dir, LEGACY_EVENTS_YAML)
  return unless File.file?(legacy)

  warn "注意: #{legacy} が残っています。アプリは events*.yaml をすべて読むので、年別ファイルと内容が重なると二重に出ます。"
end

if $PROGRAM_NAME == __FILE__
  convert_all!(
    data_dir: DATA_DIR,
    public_dir: PUBLIC_DIR,
    since: parse_since(ARGV[0])
  )
end

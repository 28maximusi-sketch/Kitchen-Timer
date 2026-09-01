# timer.rb
# Кухонный таймер на Ruby с потоками и неблокирующим вводом

require 'io/console'

class Timer
  attr_reader :seconds, :remaining, :paused, :running

  def initialize(seconds)
    @seconds = seconds
    @remaining = seconds
    @paused = false
    @running = false
  end

  def start
    @running = true
    Thread.new { countdown }
    Thread.new { display }
    listen_keys
  end

  private

  def countdown
    while @running
      sleep 1
      unless @paused
        @remaining -= 1
        if @remaining <= 0
          @running = false
          beep
          puts "\n⏰ Время вышло!"
          exit 0
        end
      end
    end
  end

  def display
    while @running
      m = [@remaining, 0].max / 60
      s = [@remaining, 0].max % 60
      print "\rОсталось: #{'%02d' % m}:#{'%02d' % s}   "
      sleep 0.2
    end
  end

  def listen_keys
    while @running
      char = STDIN.getch
      case char.downcase
      when 'p'
        pause
      when 'r'
        resume
      when 'q'
        stop
        puts "\nТаймер остановлен."
        exit 0
      when '+'
        @remaining += 60
      when '-'
        @remaining -= 60 if @remaining >= 60
      end
    end
  end

  def pause
    unless @paused
      @paused = true
      puts "\n⏸  Пауза"
    end
  end

  def resume
    if @paused
      @paused = false
      puts "\n▶  Возобновлено"
    end
  end

  def stop
    @running = false
  end

  def beep
    print "\007"
  end
end

def parse_time(arg)
  if arg.include?(':')
    m, s = arg.split(':')
    m.to_i * 60 + s.to_i
  else
    arg.to_i
  end
end

def show_help
  puts "Управление: p - пауза, r - возобновить, q - выход, + - +1 мин, - - -1 мин"
end

if ARGV.length > 0
  seconds = parse_time(ARGV[0])
else
  print "Введите время (сек или MM:SS): "
  input = gets.chomp
  seconds = parse_time(input)
end

timer = Timer.new(seconds)
puts "\n⏳ Таймер запущен на #{'%02d' % (seconds/60)}:#{'%02d' % (seconds%60)}"
show_help
timer.start

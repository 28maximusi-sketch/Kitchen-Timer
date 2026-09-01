# timer.py
# Кухонный таймер на Python с сохранением предустановок

import sys
import time
import threading
import json
import os
from datetime import datetime, timedelta

CONFIG_FILE = os.path.expanduser("~/.kitchen_timer_presets.json")

class Timer:
    def __init__(self, seconds):
        self.seconds = seconds
        self.remaining = seconds
        self.paused = False
        self.running = True
        self.lock = threading.Lock()

    def run(self):
        self.start_time = time.time()
        self.thread = threading.Thread(target=self._countdown)
        self.thread.daemon = True
        self.thread.start()

    def _countdown(self):
        while self.running and self.remaining > 0:
            with self.lock:
                if self.paused:
                    time.sleep(0.1)
                    continue
            time.sleep(1)
            with self.lock:
                if not self.paused and self.running:
                    self.remaining -= 1
                    if self.remaining <= 0:
                        self.running = False
                        break

    def pause(self):
        with self.lock:
            if not self.paused and self.running:
                self.paused = True
                print("\n⏸  Пауза")

    def resume(self):
        with self.lock:
            if self.paused:
                self.paused = False
                print("\n▶  Возобновлено")

    def stop(self):
        with self.lock:
            self.running = False

    def get_remaining(self):
        with self.lock:
            return self.remaining

    def format_time(self, total_seconds):
        if total_seconds < 0:
            total_seconds = 0
        m, s = divmod(total_seconds, 60)
        return f"{int(m):02d}:{int(s):02d}"

def show_help():
    print("Управление: p - пауза, r - возобновить, q - выход, + - +1 мин, - - -1 мин")

def load_presets():
    if os.path.exists(CONFIG_FILE):
        with open(CONFIG_FILE, 'r') as f:
            return json.load(f)
    return []

def save_preset(preset):
    presets = load_presets()
    if preset not in presets:
        presets.append(preset)
        with open(CONFIG_FILE, 'w') as f:
            json.dump(presets, f, indent=2)

def parse_time(arg):
    if ':' in arg:
        m, s = arg.split(':', 1)
        return int(m)*60 + int(s)
    else:
        return int(arg)

def main():
    if len(sys.argv) > 1:
        try:
            seconds = parse_time(sys.argv[1])
        except:
            print("Неверный формат. Используйте число (секунды) или MM:SS")
            sys.exit(1)
    else:
        # Интерактивный режим
        presets = load_presets()
        if presets:
            print("Предустановки:")
            for i, p in enumerate(presets, 1):
                print(f"  {i}. {p}")
            print("Введите время (сек или MM:SS) или номер предустановки:")
        else:
            print("Введите время (сек или MM:SS):")
        inp = input().strip()
        if inp.isdigit() and 1 <= int(inp) <= len(presets):
            seconds = parse_time(presets[int(inp)-1])
        else:
            seconds = parse_time(inp)
            save_preset(str(seconds))

    timer = Timer(seconds)
    print(f"\n⏳ Таймер запущен на {timer.format_time(seconds)}")
    show_help()
    timer.run()

    # Поток для вывода оставшегося времени
    try:
        while timer.running:
            remaining = timer.get_remaining()
            sys.stdout.write(f"\rОсталось: {timer.format_time(remaining)}   ")
            sys.stdout.flush()
            if remaining <= 0:
                break
            time.sleep(0.2)
    except KeyboardInterrupt:
        timer.stop()
        print("\nТаймер остановлен.")
        sys.exit(0)

    # Звуковой сигнал
    for _ in range(3):
        sys.stdout.write('\a')
        sys.stdout.flush()
        time.sleep(0.5)
    print("\n⏰ Время вышло!")

if __name__ == '__main__':
    main()

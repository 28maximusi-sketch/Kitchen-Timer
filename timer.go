// timer.go
// Кухонный таймер на Go с горутинами и каналами

package main

import (
	"bufio"
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Timer struct {
	seconds   int
	remaining int
	paused    bool
	running   bool
	done      chan bool
}

func NewTimer(seconds int) *Timer {
	return &Timer{
		seconds:   seconds,
		remaining: seconds,
		paused:    false,
		running:   false,
		done:      make(chan bool),
	}
}

func (t *Timer) Start() {
	t.running = true
	go t.countdown()
	go t.displayLoop()
}

func (t *Timer) countdown() {
	ticker := time.NewTicker(1 * time.Second)
	defer ticker.Stop()
	for {
		select {
		case <-t.done:
			return
		case <-ticker.C:
			if !t.paused {
				t.remaining--
				if t.remaining <= 0 {
					t.running = false
					t.beep()
					fmt.Println("\n⏰ Время вышло!")
					os.Exit(0)
				}
			}
		}
	}
}

func (t *Timer) displayLoop() {
	for t.running {
		m := t.remaining / 60
		s := t.remaining % 60
		fmt.Printf("\rОсталось: %02d:%02d   ", m, s)
		time.Sleep(200 * time.Millisecond)
	}
}

func (t *Timer) Pause() {
	if !t.paused {
		t.paused = true
		fmt.Println("\n⏸  Пауза")
	}
}

func (t *Timer) Resume() {
	if t.paused {
		t.paused = false
		fmt.Println("\n▶  Возобновлено")
	}
}

func (t *Timer) Stop() {
	t.running = false
	t.done <- true
}

func (t *Timer) AddMinute() {
	t.remaining += 60
}

func (t *Timer) SubtractMinute() {
	if t.remaining >= 60 {
		t.remaining -= 60
	}
}

func (t *Timer) beep() {
	fmt.Print("\a")
}

func parseTime(arg string) (int, error) {
	if strings.Contains(arg, ":") {
		parts := strings.Split(arg, ":")
		m, err1 := strconv.Atoi(parts[0])
		s, err2 := strconv.Atoi(parts[1])
		if err1 != nil || err2 != nil {
			return 0, fmt.Errorf("неверный формат")
		}
		return m*60 + s, nil
	} else {
		return strconv.Atoi(arg)
	}
}

func showHelp() {
	fmt.Println("Управление: p - пауза, r - возобновить, q - выход, + - +1 мин, - - -1 мин")
}

func main() {
	var seconds int
	var err error
	if len(os.Args) > 1 {
		seconds, err = parseTime(os.Args[1])
		if err != nil {
			fmt.Println("Неверный формат. Используйте число (секунды) или MM:SS")
			os.Exit(1)
		}
	} else {
		reader := bufio.NewReader(os.Stdin)
		fmt.Print("Введите время (сек или MM:SS): ")
		input, _ := reader.ReadString('\n')
		input = strings.TrimSpace(input)
		seconds, err = parseTime(input)
		if err != nil {
			fmt.Println("Неверный формат.")
			os.Exit(1)
		}
	}

	timer := NewTimer(seconds)
	fmt.Printf("\n⏳ Таймер запущен на %02d:%02d\n", seconds/60, seconds%60)
	showHelp()
	timer.Start()

	// Управление клавишами
	reader := bufio.NewReader(os.Stdin)
	for {
		char, _ := reader.ReadByte()
		switch char {
		case 'p', 'P':
			timer.Pause()
		case 'r', 'R':
			timer.Resume()
		case 'q', 'Q':
			timer.Stop()
			fmt.Println("\nТаймер остановлен.")
			os.Exit(0)
		case '+':
			timer.AddMinute()
		case '-':
			timer.SubtractMinute()
		}
	}
}

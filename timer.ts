// timer.ts
// Кухонный таймер на TypeScript с строгой типизацией

import * as readline from 'readline';
import { exec } from 'child_process';

class Timer {
    private seconds: number;
    private remaining: number;
    private paused: boolean = false;
    private running: boolean = false;
    private interval: NodeJS.Timeout | null = null;

    constructor(seconds: number) {
        this.seconds = seconds;
        this.remaining = seconds;
    }

    start(): void {
        this.running = true;
        this.interval = setInterval(() => {
            if (!this.paused) {
                this.remaining--;
                if (this.remaining <= 0) {
                    this.stop();
                    this.beep();
                    console.log('\n⏰ Время вышло!');
                    process.exit(0);
                }
            }
        }, 1000);
        this.displayLoop();
    }

    private displayLoop(): void {
        const display = () => {
            if (this.running) {
                const m = Math.floor(Math.max(0, this.remaining) / 60);
                const s = Math.max(0, this.remaining) % 60;
                const str = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
                readline.cursorTo(process.stdout, 0);
                process.stdout.write(`Осталось: ${str}   `);
                setTimeout(display, 200);
            }
        };
        display();
    }

    pause(): void {
        if (!this.paused) {
            this.paused = true;
            console.log('\n⏸  Пауза');
        }
    }

    resume(): void {
        if (this.paused) {
            this.paused = false;
            console.log('\n▶  Возобновлено');
        }
    }

    stop(): void {
        this.running = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    private beep(): void {
        if (process.platform === 'win32') {
            exec('powershell -c "[console]::beep(1000,500)"');
        } else {
            process.stdout.write('\x07');
        }
    }

    addMinute(): void {
        this.remaining += 60;
    }

    subtractMinute(): void {
        if (this.remaining >= 60) {
            this.remaining -= 60;
        }
    }
}

function parseTime(arg: string): number {
    if (arg.includes(':')) {
        const parts = arg.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else {
        return parseInt(arg);
    }
}

function showHelp(): void {
    console.log('Управление: p - пауза, r - возобновить, q - выход, + - +1 мин, - - -1 мин');
}

const args = process.argv.slice(2);
let seconds: number;

if (args.length > 0) {
    seconds = parseTime(args[0]);
    startTimer(seconds);
} else {
    const rl = readline.createInterface({
        input: process.stdin,
        output: process.stdout
    });
    rl.question('Введите время (сек или MM:SS): ', (answer) => {
        rl.close();
        seconds = parseTime(answer);
        startTimer(seconds);
    });
}

function startTimer(secs: number): void {
    const timer = new Timer(secs);
    console.log(`\n⏳ Таймер запущен на ${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`);
    showHelp();
    timer.start();

    readline.emitKeypressEvents(process.stdin);
    process.stdin.setRawMode(true);
    process.stdin.on('keypress', (str, key) => {
        if (key.name === 'p' || key.name === 'P') {
            timer.pause();
        } else if (key.name === 'r' || key.name === 'R') {
            timer.resume();
        } else if (key.name === 'q' || key.name === 'Q') {
            timer.stop();
            console.log('\nТаймер остановлен.');
            process.exit(0);
        } else if (str === '+') {
            timer.addMinute();
        } else if (str === '-') {
            timer.subtractMinute();
        }
    });
}

// timer.js
// Кухонный таймер на JavaScript (Node.js) с интерактивным управлением

const readline = require('readline');
const { exec } = require('child_process');

class Timer {
    constructor(seconds) {
        this.seconds = seconds;
        this.remaining = seconds;
        this.paused = false;
        this.running = false;
        this.interval = null;
    }

    start() {
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

    displayLoop() {
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

    pause() {
        if (!this.paused) {
            this.paused = true;
            console.log('\n⏸  Пауза');
        }
    }

    resume() {
        if (this.paused) {
            this.paused = false;
            console.log('\n▶  Возобновлено');
        }
    }

    stop() {
        this.running = false;
        if (this.interval) {
            clearInterval(this.interval);
            this.interval = null;
        }
    }

    beep() {
        // Системный звуковой сигнал
        if (process.platform === 'win32') {
            exec('powershell -c "[console]::beep(1000,500)"');
        } else {
            process.stdout.write('\x07');
        }
    }

    addMinute() {
        this.remaining += 60;
    }

    subtractMinute() {
        if (this.remaining >= 60) {
            this.remaining -= 60;
        }
    }
}

function parseTime(arg) {
    if (arg.includes(':')) {
        const parts = arg.split(':');
        return parseInt(parts[0]) * 60 + parseInt(parts[1]);
    } else {
        return parseInt(arg);
    }
}

function showHelp() {
    console.log('Управление: p - пауза, r - возобновить, q - выход, + - +1 мин, - - -1 мин');
}

const args = process.argv.slice(2);
let seconds;
if (args.length > 0) {
    seconds = parseTime(args[0]);
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
    // Чтобы не ждать, выходим, если ввод уже обработан
    process.stdin.on('end', () => {});
    return;
}

function startTimer(secs) {
    const timer = new Timer(secs);
    console.log(`\n⏳ Таймер запущен на ${Math.floor(secs/60)}:${String(secs%60).padStart(2,'0')}`);
    showHelp();
    timer.start();

    // Управление клавишами
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

if (seconds !== undefined) {
    startTimer(seconds);
}

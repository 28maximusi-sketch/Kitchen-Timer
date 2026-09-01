<?php
// timer.php
// Кухонный таймер на PHP (консольный)

if (php_sapi_name() !== 'cli') {
    die("Это консольное приложение.\n");
}

function parseTime($arg) {
    if (strpos($arg, ':') !== false) {
        list($m, $s) = explode(':', $arg);
        return intval($m)*60 + intval($s);
    } else {
        return intval($arg);
    }
}

function showHelp() {
    echo "Управление: p - пауза, r - возобновить, q - выход, + - +1 мин, - - -1 мин\n";
}

function beep() {
    echo "\x07";
}

$seconds = 0;
if ($argc > 1) {
    $seconds = parseTime($argv[1]);
} else {
    echo "Введите время (сек или MM:SS): ";
    $input = trim(fgets(STDIN));
    $seconds = parseTime($input);
}

$remaining = $seconds;
$paused = false;
$running = true;

// Настройка неблокирующего ввода (только для Unix)
if (function_exists('stream_set_blocking')) {
    stream_set_blocking(STDIN, false);
}

echo "\n⏳ Таймер запущен на " . sprintf("%02d:%02d", intdiv($seconds,60), $seconds%60) . "\n";
showHelp();

// Поток для вывода (используем цикл)
while ($running) {
    if (!$paused) {
        $m = intdiv($remaining, 60);
        $s = $remaining % 60;
        echo "\rОсталось: " . sprintf("%02d:%02d", $m, $s) . "   ";
        if ($remaining <= 0) {
            $running = false;
            beep();
            beep();
            beep();
            echo "\n⏰ Время вышло!\n";
            break;
        }
        $remaining--;
    }
    sleep(1);

    // Проверка ввода
    $key = fgetc(STDIN);
    if ($key !== false) {
        $key = strtolower($key);
        if ($key == 'p') {
            $paused = true;
            echo "\n⏸  Пауза";
        } elseif ($key == 'r') {
            $paused = false;
            echo "\n▶  Возобновлено";
        } elseif ($key == 'q') {
            $running = false;
            echo "\nТаймер остановлен.\n";
            break;
        } elseif ($key == '+') {
            $remaining += 60;
        } elseif ($key == '-') {
            if ($remaining >= 60) $remaining -= 60;
        }
    }
}

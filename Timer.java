// Timer.java
// Кухонный таймер на Java с ScheduledExecutorService

import java.util.Scanner;
import java.util.concurrent.Executors;
import java.util.concurrent.ScheduledExecutorService;
import java.util.concurrent.TimeUnit;

public class Timer {
    private int seconds;
    private int remaining;
    private boolean paused;
    private boolean running;
    private ScheduledExecutorService executor;

    public Timer(int seconds) {
        this.seconds = seconds;
        this.remaining = seconds;
        this.paused = false;
        this.running = false;
    }

    public void start() {
        this.running = true;
        this.executor = Executors.newSingleThreadScheduledExecutor();
        this.executor.scheduleAtFixedRate(() -> {
            if (!paused && running) {
                remaining--;
                if (remaining <= 0) {
                    running = false;
                    executor.shutdown();
                    beep();
                    System.out.println("\n⏰ Время вышло!");
                    System.exit(0);
                }
            }
        }, 1, 1, TimeUnit.SECONDS);
        displayLoop();
    }

    private void displayLoop() {
        new Thread(() -> {
            while (running) {
                int m = Math.max(0, remaining) / 60;
                int s = Math.max(0, remaining) % 60;
                System.out.printf("\rОсталось: %02d:%02d   ", m, s);
                try {
                    Thread.sleep(200);
                } catch (InterruptedException e) {
                    break;
                }
            }
        }).start();
    }

    public void pause() {
        if (!paused && running) {
            paused = true;
            System.out.println("\n⏸  Пауза");
        }
    }

    public void resume() {
        if (paused) {
            paused = false;
            System.out.println("\n▶  Возобновлено");
        }
    }

    public void stop() {
        running = false;
        if (executor != null) {
            executor.shutdown();
        }
    }

    public void addMinute() {
        remaining += 60;
    }

    public void subtractMinute() {
        if (remaining >= 60) {
            remaining -= 60;
        }
    }

    private void beep() {
        System.out.print('\007');
    }

    private static int parseTime(String arg) throws NumberFormatException {
        if (arg.contains(":")) {
            String[] parts = arg.split(":");
            return Integer.parseInt(parts[0]) * 60 + Integer.parseInt(parts[1]);
        } else {
            return Integer.parseInt(arg);
        }
    }

    private static void showHelp() {
        System.out.println("Управление: p - пауза, r - возобновить, q - выход, + - +1 мин, - - -1 мин");
    }

    public static void main(String[] args) throws Exception {
        int seconds;
        if (args.length > 0) {
            seconds = parseTime(args[0]);
        } else {
            Scanner scanner = new Scanner(System.in);
            System.out.print("Введите время (сек или MM:SS): ");
            String input = scanner.nextLine().trim();
            seconds = parseTime(input);
        }

        Timer timer = new Timer(seconds);
        System.out.printf("\n⏳ Таймер запущен на %02d:%02d\n", seconds/60, seconds%60);
        showHelp();
        timer.start();

        // Управление с клавиатуры
        Scanner scanner = new Scanner(System.in);
        while (true) {
            char c = scanner.next().charAt(0);
            switch (c) {
                case 'p': case 'P': timer.pause(); break;
                case 'r': case 'R': timer.resume(); break;
                case 'q': case 'Q':
                    timer.stop();
                    System.out.println("\nТаймер остановлен.");
                    System.exit(0);
                    break;
                case '+': timer.addMinute(); break;
                case '-': timer.subtractMinute(); break;
            }
        }
    }
}

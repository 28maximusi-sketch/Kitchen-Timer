// Timer.cs
// Кухонный таймер на C# с System.Timers.Timer

using System;
using System.Threading;

class Timer
{
    private int seconds;
    private int remaining;
    private bool paused;
    private bool running;
    private System.Timers.Timer timer;
    private Thread displayThread;

    public Timer(int seconds)
    {
        this.seconds = seconds;
        this.remaining = seconds;
        this.paused = false;
        this.running = false;
    }

    public void Start()
    {
        this.running = true;
        this.timer = new System.Timers.Timer(1000);
        this.timer.Elapsed += (sender, e) =>
        {
            if (!paused && running)
            {
                remaining--;
                if (remaining <= 0)
                {
                    running = false;
                    timer.Stop();
                    Beep();
                    Console.WriteLine("\n⏰ Время вышло!");
                    Environment.Exit(0);
                }
            }
        };
        this.timer.Start();
        DisplayLoop();
    }

    private void DisplayLoop()
    {
        this.displayThread = new Thread(() =>
        {
            while (running)
            {
                int m = Math.Max(0, remaining) / 60;
                int s = Math.Max(0, remaining) % 60;
                Console.Write($"\rОсталось: {m:00}:{s:00}   ");
                Thread.Sleep(200);
            }
        });
        this.displayThread.IsBackground = true;
        this.displayThread.Start();
    }

    public void Pause()
    {
        if (!paused && running)
        {
            paused = true;
            Console.WriteLine("\n⏸  Пауза");
        }
    }

    public void Resume()
    {
        if (paused)
        {
            paused = false;
            Console.WriteLine("\n▶  Возобновлено");
        }
    }

    public void Stop()
    {
        running = false;
        if (timer != null) timer.Stop();
        if (displayThread != null) displayThread.Abort();
    }

    public void AddMinute() => remaining += 60;
    public void SubtractMinute() { if (remaining >= 60) remaining -= 60; }

    private void Beep()
    {
        Console.Beep(1000, 500);
    }

    private static int ParseTime(string arg)
    {
        if (arg.Contains(":"))
        {
            var parts = arg.Split(':');
            return int.Parse(parts[0]) * 60 + int.Parse(parts[1]);
        }
        else
        {
            return int.Parse(arg);
        }
    }

    private static void ShowHelp()
    {
        Console.WriteLine("Управление: p - пауза, r - возобновить, q - выход, + - +1 мин, - - -1 мин");
    }

    static void Main(string[] args)
    {
        int seconds;
        if (args.Length > 0)
        {
            seconds = ParseTime(args[0]);
        }
        else
        {
            Console.Write("Введите время (сек или MM:SS): ");
            string input = Console.ReadLine().Trim();
            seconds = ParseTime(input);
        }

        var timer = new Timer(seconds);
        Console.WriteLine($"\n⏳ Таймер запущен на {seconds/60:00}:{seconds%60:00}");
        ShowHelp();
        timer.Start();

        while (true)
        {
            char c = Console.ReadKey(true).KeyChar;
            switch (c)
            {
                case 'p': case 'P': timer.Pause(); break;
                case 'r': case 'R': timer.Resume(); break;
                case 'q': case 'Q':
                    timer.Stop();
                    Console.WriteLine("\nТаймер остановлен.");
                    return;
                case '+': timer.AddMinute(); break;
                case '-': timer.SubtractMinute(); break;
            }
        }
    }
}

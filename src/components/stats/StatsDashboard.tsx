import React, { useEffect, useState } from "react";
import { StatsSummaryRecord, WeakKeyRecord } from "@/types/stats";
import { TestResultRecord } from "@/types/typing";
import { getStatsSummary, getTestHistory, getWeakKeys } from "@/persistence/db-bridge";
import {
  BarChart2,
  Clock,
  Gauge,
  Target,
  Sparkles,
  AlertCircle,
  Filter,
} from "lucide-react";

export const StatsDashboard: React.FC = () => {
  const [period, setPeriod] = useState<string>("all");
  const [summary, setSummary] = useState<StatsSummaryRecord>({
    total_tests: 0,
    total_time_seconds: 0,
    avg_wpm: 0,
    best_wpm: 0,
    avg_accuracy: 0,
    best_accuracy: 0,
    total_characters: 0,
  });
  const [history, setHistory] = useState<TestResultRecord[]>([]);
  const [weakKeys, setWeakKeys] = useState<WeakKeyRecord[]>([]);
  const [modeFilter, setModeFilter] = useState<string>("all");

  const loadData = async () => {
    const sum = await getStatsSummary(period === "all" ? undefined : period);
    setSummary(sum);

    const hist = await getTestHistory(100, 0);
    setHistory(hist);

    const weak = await getWeakKeys(6);
    setWeakKeys(weak);
  };

  useEffect(() => {
    loadData();
  }, [period]);

  const filteredHistory = history.filter((h) => {
    if (modeFilter === "all") return true;
    return h.mode === modeFilter;
  });

  const formatSeconds = (sec: number): string => {
    const hours = Math.floor(sec / 3600);
    const mins = Math.floor((sec % 3600) / 60);
    if (hours > 0) return `${hours}h ${mins}m`;
    return `${mins}m ${Math.floor(sec % 60)}s`;
  };

  // Generate SVG points for speed curve
  const chartData = [...history].reverse().slice(-20);
  const maxWpm = Math.max(...chartData.map((d) => d.netWpm), 60);
  const minWpm = 0;

  const points = chartData.map((d, i) => {
    const x = (i / Math.max(chartData.length - 1, 1)) * 360 + 20;
    const y = 140 - ((d.netWpm - minWpm) / (maxWpm - minWpm)) * 110;
    return { x, y, wpm: d.netWpm, acc: d.accuracy, mode: d.mode };
  });

  const pathD = points.length > 1
    ? points.reduce((acc, p, i) => `${acc} ${i === 0 ? "M" : "L"} ${p.x} ${p.y}`, "")
    : "";

  return (
    <div className="w-full max-w-5xl lg:max-w-6xl xl:max-w-7xl mx-auto flex flex-col gap-8 select-none py-2">
      {/* Time Period Filter Bar */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold text-zinc-900 dark:text-zinc-100">
            Performance & Analytics
          </h2>
          <p className="text-xs text-zinc-500">
            Real typing test performance data derived from your local database.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-white dark:bg-zinc-800/80 border border-zinc-200/90 dark:border-zinc-700 shadow-xs text-xs font-medium">
          {[
            { id: "today", label: "Today" },
            { id: "7days", label: "7 Days" },
            { id: "30days", label: "30 Days" },
            { id: "all", label: "All Time" },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setPeriod(item.id)}
              className={`px-3 py-1 rounded-md transition-colors cursor-pointer ${
                period === item.id
                  ? "bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-xs font-semibold"
                  : "text-zinc-600 hover:text-zinc-950 dark:text-zinc-400 dark:hover:text-zinc-100"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs dark:shadow-none space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <Gauge className="w-4 h-4 text-amber-500" />
            <span>Average Speed</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {summary.avg_wpm}
            </span>
            <span className="text-xs text-zinc-400 font-mono">WPM</span>
          </div>
          <span className="text-[11px] text-zinc-400 block">
            Best: <strong className="text-zinc-700 dark:text-zinc-300">{summary.best_wpm} WPM</strong>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs dark:shadow-none space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <Target className="w-4 h-4 text-emerald-500" />
            <span>Accuracy</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {summary.avg_accuracy}%
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 block">
            Peak: <strong className="text-zinc-700 dark:text-zinc-300">{summary.best_accuracy}%</strong>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs dark:shadow-none space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <Clock className="w-4 h-4 text-blue-500" />
            <span>Practice Time</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {formatSeconds(summary.total_time_seconds)}
            </span>
          </div>
          <span className="text-[11px] text-zinc-400 block">
            Across {summary.total_tests} completed tests
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/40 border border-zinc-200/90 dark:border-zinc-800/80 shadow-xs dark:shadow-none space-y-1">
          <div className="flex items-center gap-2 text-zinc-400 text-xs font-medium uppercase tracking-wider">
            <BarChart2 className="w-4 h-4 text-purple-500" />
            <span>Volume</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-zinc-900 dark:text-zinc-100">
              {summary.total_characters.toLocaleString()}
            </span>
            <span className="text-xs text-zinc-400 font-mono">chars</span>
          </div>
          <span className="text-[11px] text-zinc-400 block">
            ~{Math.round(summary.total_characters / 5).toLocaleString()} words typed
          </span>
        </div>
      </div>

      {/* Speed Trend Chart & Weak Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Speed Curve Chart */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Speed Trend (Last 20 Sessions)
            </span>
            <span className="text-xs text-zinc-400 font-mono">Peak: {maxWpm} WPM</span>
          </div>

          {points.length > 1 ? (
            <div className="w-full h-44 flex items-center justify-center">
              <svg viewBox="0 0 400 160" className="w-full h-full overflow-visible">
                {/* Horizontal reference lines */}
                <line x1="20" y1="30" x2="380" y2="30" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="3 3" />
                <line x1="20" y1="85" x2="380" y2="85" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" strokeDasharray="3 3" />
                <line x1="20" y1="140" x2="380" y2="140" stroke="currentColor" className="text-zinc-200 dark:text-zinc-800" />

                {/* Polyline Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="currentColor"
                  className="text-amber-500"
                  strokeWidth="2.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />

                {/* Data Points */}
                {points.map((p, idx) => (
                  <circle
                    key={idx}
                    cx={p.x}
                    cy={p.y}
                    r="3.5"
                    className="fill-amber-500 hover:scale-150 transition-all cursor-pointer"
                  >
                    <title>{`${Math.round(p.wpm)} WPM (${Math.round(p.acc)}% acc) - ${p.mode}`}</title>
                  </circle>
                ))}
              </svg>
            </div>
          ) : (
            <div className="w-full h-44 flex flex-col items-center justify-center text-zinc-400 text-xs">
              <BarChart2 className="w-6 h-6 mb-1 opacity-50" />
              <span>Complete more tests to view your speed curve</span>
            </div>
          )}
        </div>

        {/* Weak Keys & Personalized Recommendations */}
        <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60 space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-500" />
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Weak Key Analytics
            </span>
          </div>

          {weakKeys.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-zinc-500">
                Frequently mistyped keys from your actual typing sessions:
              </p>

              <div className="flex flex-wrap gap-2">
                {weakKeys.map((w) => (
                  <div
                    key={w.character}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-rose-500/10 border border-rose-500/20 text-rose-600 dark:text-rose-400 text-xs font-mono font-medium"
                  >
                    <span className="font-bold text-sm">{w.character}</span>
                    <span className="text-[10px] opacity-75">({w.total_errors} err)</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-amber-500/5 border border-amber-500/20 text-xs text-zinc-600 dark:text-zinc-400 space-y-1">
                <span className="font-semibold text-amber-600 dark:text-amber-400 flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Recommendation
                </span>
                <p>
                  Practice Academy Chapters 2–3 to reinforce muscle memory for{" "}
                  <strong>{weakKeys.map((k) => `'${k.character}'`).join(", ")}</strong> without glancing at the keyboard.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-zinc-400 py-8 text-center">
              No recurring weak keys detected yet.
            </div>
          )}
        </div>
      </div>

      {/* Test History Table */}
      <div className="p-5 rounded-2xl bg-white dark:bg-zinc-900/30 border border-zinc-200/60 dark:border-zinc-800/60 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-zinc-400" />
            <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
              Session History
            </span>
          </div>

          {/* Mode Filter */}
          <div className="flex items-center gap-1 text-xs">
            {["all", "time", "words", "sentence", "quote", "code", "custom"].map((m) => (
              <button
                key={m}
                onClick={() => setModeFilter(m)}
                className={`px-2.5 py-1 rounded capitalize transition-colors ${
                  modeFilter === m
                    ? "bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-950 font-medium"
                    : "text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-100"
                }`}
              >
                {m}
              </button>
            ))}
          </div>
        </div>

        {filteredHistory.length > 0 ? (
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-zinc-200 dark:border-zinc-800 text-zinc-400 font-medium pb-2">
                  <th className="py-2">Date & Time</th>
                  <th className="py-2">Mode</th>
                  <th className="py-2">Net WPM</th>
                  <th className="py-2">Accuracy</th>
                  <th className="py-2">Characters</th>
                  <th className="py-2 text-right">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-100 dark:divide-zinc-800/50 font-mono">
                {filteredHistory.slice(0, 15).map((row) => (
                  <tr key={row.id || row.timestamp} className="hover:bg-zinc-50 dark:hover:bg-zinc-800/30">
                    <td className="py-2.5 text-zinc-500 font-sans">
                      {new Date(row.timestamp).toLocaleDateString()} {new Date(row.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-2.5 capitalize text-zinc-700 dark:text-zinc-300 font-sans">
                      <span className="px-1.5 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-[11px]">
                        {row.mode} {row.modeValue > 0 ? row.modeValue : ""}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-amber-600 dark:text-amber-400">
                      {row.netWpm}
                    </td>
                    <td className="py-2.5 text-zinc-900 dark:text-zinc-100 font-semibold">
                      {row.accuracy}%
                    </td>
                    <td className="py-2.5 text-zinc-500 text-[11px]">
                      <span className="text-emerald-500">{row.correctCharacters}</span> / <span className="text-rose-500">{row.incorrectCharacters}</span>
                    </td>
                    <td className="py-2.5 text-right text-zinc-500">
                      {row.durationSeconds}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-400 text-xs">
            No typing sessions recorded for the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};

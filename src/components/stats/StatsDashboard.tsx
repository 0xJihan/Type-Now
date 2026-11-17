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
          <h2 className="text-xl font-bold text-text-primary">
            Performance & Analytics
          </h2>
          <p className="text-xs text-text-secondary">
            Real typing test performance data derived from your local database.
          </p>
        </div>

        <div className="flex items-center gap-1 p-1 rounded-lg bg-surface border border-border shadow-2xs text-xs font-medium">
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
                  ? "bg-text-primary text-surface font-semibold shadow-2xs"
                  : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/70"
              }`}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-text-secondary text-xs font-medium uppercase tracking-wider">
            <Gauge className="w-4 h-4 text-accent" />
            <span>Average Speed</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-text-primary tabular-nums">
              {summary.avg_wpm}
            </span>
            <span className="text-xs text-text-muted font-mono">WPM</span>
          </div>
          <span className="text-[11px] text-text-muted block">
            Best: <strong className="text-text-secondary">{summary.best_wpm} WPM</strong>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-text-secondary text-xs font-medium uppercase tracking-wider">
            <Target className="w-4 h-4 text-success" />
            <span>Accuracy</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-text-primary tabular-nums">
              {summary.avg_accuracy}%
            </span>
          </div>
          <span className="text-[11px] text-text-muted block">
            Peak: <strong className="text-text-secondary">{summary.best_accuracy}%</strong>
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-text-secondary text-xs font-medium uppercase tracking-wider">
            <Clock className="w-4 h-4 text-accent" />
            <span>Practice Time</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-text-primary tabular-nums">
              {formatSeconds(summary.total_time_seconds)}
            </span>
          </div>
          <span className="text-[11px] text-text-muted block">
            Across {summary.total_tests} completed tests
          </span>
        </div>

        <div className="p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-1">
          <div className="flex items-center gap-2 text-text-secondary text-xs font-medium uppercase tracking-wider">
            <BarChart2 className="w-4 h-4 text-accent" />
            <span>Volume</span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-mono font-bold text-text-primary tabular-nums">
              {summary.total_characters.toLocaleString()}
            </span>
            <span className="text-xs text-text-muted font-mono">chars</span>
          </div>
          <span className="text-[11px] text-text-muted block">
            ~{Math.round(summary.total_characters / 5).toLocaleString()} words typed
          </span>
        </div>
      </div>

      {/* Speed Trend Chart & Weak Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Speed Curve Chart */}
        <div className="md:col-span-2 p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-text-primary">
              Speed Trend (Last 20 Sessions)
            </span>
            <span className="text-xs text-text-muted font-mono">Peak: {maxWpm} WPM</span>
          </div>

          {points.length > 1 ? (
            <div className="w-full h-44 flex items-center justify-center">
              <svg viewBox="0 0 400 160" className="w-full h-full overflow-visible">
                {/* Horizontal reference lines */}
                <line x1="20" y1="30" x2="380" y2="30" stroke="currentColor" className="text-border" strokeDasharray="3 3" />
                <line x1="20" y1="85" x2="380" y2="85" stroke="currentColor" className="text-border" strokeDasharray="3 3" />
                <line x1="20" y1="140" x2="380" y2="140" stroke="currentColor" className="text-border" />

                {/* Polyline Path */}
                <path
                  d={pathD}
                  fill="none"
                  stroke="var(--accent)"
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
                    className="fill-accent hover:scale-150 transition-all cursor-pointer"
                  >
                    <title>{`${Math.round(p.wpm)} WPM (${Math.round(p.acc)}% acc) - ${p.mode}`}</title>
                  </circle>
                ))}
              </svg>
            </div>
          ) : (
            <div className="w-full h-44 flex flex-col items-center justify-center text-text-muted text-xs">
              <BarChart2 className="w-6 h-6 mb-1 opacity-50" />
              <span>Complete more tests to view your speed curve</span>
            </div>
          )}
        </div>

        {/* Weak Keys & Personalized Recommendations */}
        <div className="p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-4">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-error" />
            <span className="font-semibold text-sm text-text-primary">
              Weak Key Analytics
            </span>
          </div>

          {weakKeys.length > 0 ? (
            <div className="space-y-3">
              <p className="text-xs text-text-secondary">
                Frequently mistyped keys from your actual typing sessions:
              </p>

              <div className="flex flex-wrap gap-2">
                {weakKeys.map((w) => (
                  <div
                    key={w.character}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-error-soft/60 border border-error/20 text-error text-xs font-mono font-medium"
                  >
                    <span className="font-bold text-sm">{w.character}</span>
                    <span className="text-[10px] opacity-75">({w.total_errors} err)</span>
                  </div>
                ))}
              </div>

              <div className="p-3 rounded-xl bg-accent-soft/40 border border-accent/20 text-xs text-text-secondary space-y-1">
                <span className="font-semibold text-accent flex items-center gap-1">
                  <Sparkles className="w-3.5 h-3.5" /> Recommendation
                </span>
                <p>
                  Practice Academy Chapters 2–3 to reinforce muscle memory for{" "}
                  <strong className="text-text-primary">{weakKeys.map((k) => `'${k.character}'`).join(", ")}</strong> without glancing at the keyboard.
                </p>
              </div>
            </div>
          ) : (
            <div className="text-xs text-text-muted py-8 text-center">
              No recurring weak keys detected yet.
            </div>
          )}
        </div>
      </div>

      {/* Test History Table */}
      <div className="p-5 rounded-2xl bg-surface border border-border shadow-2xs space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-text-muted" />
            <span className="font-semibold text-sm text-text-primary">
              Session History
            </span>
          </div>

          {/* Mode Filter */}
          <div className="flex items-center gap-1 text-xs">
            {["all", "time", "words", "sentence", "quote", "code", "custom"].map((m) => (
              <button
                key={m}
                onClick={() => setModeFilter(m)}
                className={`px-2.5 py-1 rounded capitalize transition-colors cursor-pointer ${
                  modeFilter === m
                    ? "bg-text-primary text-surface font-semibold shadow-2xs"
                    : "text-text-secondary hover:text-text-primary hover:bg-surface-secondary/70"
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
                <tr className="border-b border-border text-text-muted font-medium pb-2">
                  <th className="py-2 font-medium">Date & Time</th>
                  <th className="py-2 font-medium">Mode</th>
                  <th className="py-2 font-medium">Net WPM</th>
                  <th className="py-2 font-medium">Accuracy</th>
                  <th className="py-2 font-medium">Characters</th>
                  <th className="py-2 text-right font-medium">Duration</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border font-mono">
                {filteredHistory.slice(0, 15).map((row) => (
                  <tr key={row.id || row.timestamp} className="hover:bg-surface-secondary/50 transition-colors">
                    <td className="py-2.5 text-text-secondary font-sans">
                      {new Date(row.timestamp).toLocaleDateString()} {new Date(row.timestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                    </td>
                    <td className="py-2.5 capitalize text-text-primary font-sans">
                      <span className="px-1.5 py-0.5 rounded bg-surface-secondary border border-border text-[11px] text-text-secondary font-mono">
                        {row.mode} {row.modeValue > 0 ? row.modeValue : ""}
                      </span>
                    </td>
                    <td className="py-2.5 font-bold text-accent tabular-nums">
                      {row.netWpm}
                    </td>
                    <td className="py-2.5 text-text-primary font-semibold tabular-nums">
                      {row.accuracy}%
                    </td>
                    <td className="py-2.5 text-text-secondary text-[11px] tabular-nums">
                      <span className="text-success font-medium">{row.correctCharacters}</span> / <span className="text-error font-medium">{row.incorrectCharacters}</span>
                    </td>
                    <td className="py-2.5 text-right text-text-secondary tabular-nums">
                      {row.durationSeconds}s
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div className="text-center py-8 text-text-muted text-xs">
            No typing sessions recorded for the selected filter.
          </div>
        )}
      </div>
    </div>
  );
};

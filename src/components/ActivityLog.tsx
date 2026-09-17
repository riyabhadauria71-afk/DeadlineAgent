import React, { useRef, useEffect, useState } from 'react';
import { LogEntry } from '../types';
import { Terminal, Trash2, ArrowDown, Play, Square, FastForward, Check, Copy } from 'lucide-react';

interface ActivityLogProps {
  logs: LogEntry[];
  isRunning: boolean;
  onClearLogs: () => void;
  speed: 'normal' | 'fast';
  onToggleSpeed: () => void;
}

export const ActivityLog: React.FC<ActivityLogProps> = ({
  logs,
  isRunning,
  onClearLogs,
  speed,
  onToggleSpeed,
}) => {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  useEffect(() => {
    if (autoScroll && scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleCopyLogs = () => {
    const text = logs.map(l => `[${l.timestamp}] [${l.step}] ${l.message} ${l.detail ? `(${l.detail})` : ''}`).join('\n');
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const getStepBadge = (step: LogEntry['step']) => {
    switch (step) {
      case 'READ':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-sky-900/40 text-sky-400 border border-sky-700/50">READ</span>;
      case 'EXTRACT':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-indigo-900/40 text-indigo-400 border border-indigo-700/50">EXTRACT</span>;
      case 'FOUND':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-emerald-900/40 text-emerald-400 border border-emerald-700/50">FOUND</span>;
      case 'CHECK':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-300 border border-slate-700">DEDUP</span>;
      case 'DUPLICATE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-amber-900/40 text-amber-300 border border-amber-700/50">SKIPPED</span>;
      case 'CREATE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-teal-900/40 text-teal-300 border border-teal-700/50">SCHEDULE</span>;
      case 'FLAG':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-orange-900/40 text-orange-400 border border-orange-700/50">REVIEW</span>;
      case 'RETRY':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-purple-900/40 text-purple-300 border border-purple-700/50">RETRY</span>;
      case 'FAIL':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-rose-900/40 text-rose-300 border border-rose-700/50">FAILURE</span>;
      case 'GUARDRAIL':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-violet-900/40 text-violet-300 border border-violet-700/50">GUARDRAIL</span>;
      case 'COMPLETE':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-green-900/40 text-green-300 border border-green-700/50">FINISHED</span>;
      case 'INFO':
      default:
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">INFO</span>;
    }
  };

  const getMessageColor = (step: LogEntry['step']) => {
    switch (step) {
      case 'DUPLICATE':
        return 'text-amber-300 font-medium';
      case 'CREATE':
        return 'text-teal-300 font-medium';
      case 'FOUND':
        return 'text-emerald-300 font-medium';
      case 'FLAG':
        return 'text-orange-300';
      case 'RETRY':
        return 'text-purple-300 font-medium';
      case 'FAIL':
        return 'text-rose-300 font-medium';
      case 'GUARDRAIL':
        return 'text-violet-300 font-semibold';
      case 'COMPLETE':
        return 'text-green-300 font-semibold';
      case 'READ':
        return 'text-sky-200';
      default:
        return 'text-slate-200';
    }
  };

  return (
    <div id="activity-log-container" className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-lg flex flex-col h-[480px]">
      {/* Terminal Titlebar */}
      <div className="bg-slate-950 px-4 py-2.5 border-b border-slate-800 flex items-center justify-between text-xs">
        <div className="flex items-center gap-2.5">
          <div className="flex items-center gap-1.5">
            <div className="w-2.5 h-2.5 rounded-full bg-rose-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/80" />
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500/80" />
          </div>
          <div className="h-4 w-px bg-slate-800 mx-1" />
          <div className="flex items-center gap-2 font-mono text-slate-400">
            <Terminal className="h-3.5 w-3.5 text-indigo-400" />
            <span className="font-semibold text-slate-300">agent-trace.log</span>
            {isRunning && (
              <span className="flex items-center gap-1.5 px-2 py-0.5 rounded-full bg-indigo-950 text-indigo-400 border border-indigo-800 text-[10px]">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
                Scanning active
              </span>
            )}
          </div>
        </div>

        {/* Terminal Controls */}
        <div className="flex items-center gap-2">
          {/* Speed Toggle */}
          <button
            type="button"
            onClick={onToggleSpeed}
            title="Toggle Agent Execution Speed"
            className="flex items-center gap-1 px-2 py-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition text-[11px]"
          >
            <FastForward className="h-3 w-3 text-indigo-400" />
            <span>{speed === 'fast' ? 'Speed: Fast' : 'Speed: Normal'}</span>
          </button>

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopyLogs}
            disabled={logs.length === 0}
            title="Copy trace to clipboard"
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition disabled:opacity-40"
          >
            {copied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
          </button>

          {/* Clear */}
          <button
            type="button"
            onClick={onClearLogs}
            disabled={logs.length === 0 || isRunning}
            title="Clear Log Terminal"
            className="p-1 rounded bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 border border-slate-800 transition disabled:opacity-40"
          >
            <Trash2 className="h-3.5 w-3.5" />
          </button>

          {/* Auto Scroll Toggle */}
          <button
            type="button"
            onClick={() => setAutoScroll(!autoScroll)}
            title={autoScroll ? "Auto-scroll ON" : "Auto-scroll OFF"}
            className={`p-1 rounded border transition ${
              autoScroll
                ? 'bg-indigo-950 text-indigo-300 border-indigo-800'
                : 'bg-slate-900 text-slate-500 border-slate-800 hover:text-slate-300'
            }`}
          >
            <ArrowDown className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>

      {/* Terminal Body */}
      <div
        ref={scrollRef}
        className="flex-1 p-3 overflow-y-auto font-mono text-xs space-y-1.5 terminal-scroll bg-[#0b101b] select-text"
      >
        {logs.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center text-slate-600 space-y-2">
            <Terminal className="h-8 w-8 text-slate-700" />
            <p className="text-xs">Agent loop is idle. Click "Run Agent" to start scanning the inbox.</p>
            <p className="text-[11px] text-slate-700">Detailed step-by-step trace & guardrail decisions will display here.</p>
          </div>
        ) : (
          logs.map((log) => (
            <div key={log.id} className="flex items-start gap-2.5 leading-relaxed hover:bg-slate-800/30 px-1.5 py-0.5 rounded transition-colors">
              <span className="text-[10px] text-slate-500 select-none shrink-0 pt-0.5">
                {log.timestamp}
              </span>
              <div className="shrink-0">{getStepBadge(log.step)}</div>
              <div className="flex-1 min-w-0">
                <span className={getMessageColor(log.step)}>{log.message}</span>
                {log.detail && (
                  <span className="block text-[11px] text-slate-400 mt-0.5 pl-2 border-l-2 border-slate-700">
                    {log.detail}
                  </span>
                )}
              </div>
            </div>
          ))
        )}

        {isRunning && (
          <div className="flex items-center gap-2 text-indigo-400 text-xs py-1 animate-pulse">
            <span className="inline-block w-2 h-3.5 bg-indigo-400" />
            <span>Processing current task...</span>
          </div>
        )}
      </div>

      {/* Terminal Footer Status Bar */}
      <div className="bg-slate-950 px-4 py-1.5 border-t border-slate-800 text-[11px] font-mono text-slate-400 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <span>Entries: {logs.length}</span>
          <span className="text-slate-600">|</span>
          <span>Contract: extractDeadline(text)</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-emerald-400 font-medium">● System Ready</span>
        </div>
      </div>
    </div>
  );
};

import React from 'react';
import { Bot, Play, RotateCcw, ShieldCheck, Sparkles, Square } from 'lucide-react';

interface NavbarProps {
  isRunning: boolean;
  onRunAgent: () => void;
  onStopAgent: () => void;
  onResetDemo: () => void;
  unprocessedCount: number;
  totalCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  isRunning,
  onRunAgent,
  onStopAgent,
  onResetDemo,
  unprocessedCount,
  totalCount,
}) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-4">
        {/* Brand identity */}
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-xl bg-indigo-600 flex items-center justify-center text-white shadow-xs">
            <Bot className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-base font-bold text-slate-900 tracking-tight">Deadline Agent</h1>
              <span className="hidden sm:inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-md bg-indigo-50 text-indigo-700 border border-indigo-200">
                <Sparkles className="h-3 w-3" />
                AI Inbox Scanner
              </span>
            </div>
            <p className="text-xs text-slate-500 hidden md:block">
              Scans inbox deadlines & updates your calendar without duplicate events or infinite loops.
            </p>
          </div>
        </div>

        {/* Global Agent Execution Action Controls */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Reset Demo Button */}
          <button
            type="button"
            onClick={onResetDemo}
            disabled={isRunning}
            title="Reset inbox, calendar, and logs to initial state"
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span className="hidden sm:inline">Reset Demo</span>
          </button>

          {/* Run Agent Primary CTA */}
          {isRunning ? (
            <button
              type="button"
              onClick={onStopAgent}
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs font-bold text-white bg-rose-600 hover:bg-rose-700 shadow-sm transition"
            >
              <Square className="h-3.5 w-3.5 fill-current" />
              <span>Stop Agent</span>
            </button>
          ) : (
            <button
              type="button"
              onClick={onRunAgent}
              disabled={unprocessedCount === 0}
              className={`inline-flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-bold text-white transition shadow-sm ${
                unprocessedCount === 0
                  ? 'bg-slate-300 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700 active:scale-98 shadow-indigo-200'
              }`}
            >
              <Play className="h-3.5 w-3.5 fill-current" />
              <span>
                {unprocessedCount === 0 ? 'All Emails Processed' : `Run Agent (${unprocessedCount} pending)`}
              </span>
            </button>
          )}
        </div>
      </div>
    </header>
  );
};

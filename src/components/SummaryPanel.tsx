import React from 'react';
import { RunStats } from '../types';
import { Mail, CalendarCheck2, CopyCheck, AlertTriangle, AlertCircle, CheckCircle2 } from 'lucide-react';

interface SummaryPanelProps {
  stats: RunStats;
  hasRun: boolean;
  limitReached: boolean;
  unprocessedRemaining: number;
}

export const SummaryPanel: React.FC<SummaryPanelProps> = ({
  stats,
  hasRun,
  limitReached,
  unprocessedRemaining,
}) => {
  if (!hasRun) {
    return (
      <div id="summary-panel-idle" className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-sm font-semibold text-slate-800">Agent Performance & Summary</h3>
            <p className="text-xs text-slate-500">Run the agent to view execution telemetry, deduplication metrics, and scheduling summary.</p>
          </div>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            Awaiting Run
          </span>
        </div>
      </div>
    );
  }

  return (
    <div id="summary-panel" className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs space-y-3">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-100 pb-2">
        <div className="flex items-center gap-2">
          <CheckCircle2 className="h-4 w-4 text-emerald-600" />
          <h3 className="text-sm font-semibold text-slate-900">Run Summary & Telemetry</h3>
        </div>
        <span className="text-xs font-mono text-slate-500">
          Processed: {stats.emailsScanned} / {stats.totalEmails} total emails
        </span>
      </div>

      {/* Limit Reached Warning if hard cap triggered */}
      {limitReached && (
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2.5 text-amber-900 text-xs">
          <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">Run limit reached — {unprocessedRemaining} emails left unprocessed.</span>
            <p className="text-amber-800 text-[11px] mt-0.5">
              The agent's 20-email hard cap halted processing to preserve token budget and prevent runaway loops.
            </p>
          </div>
        </div>
      )}

      {/* 5 Simple Stat Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
        {/* Scanned */}
        <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-slate-500 mb-1">
            <span className="text-xs font-medium">Scanned</span>
            <Mail className="h-3.5 w-3.5 text-slate-400" />
          </div>
          <div className="text-xl font-bold text-slate-900">{stats.emailsScanned}</div>
          <div className="text-[10px] text-slate-500 mt-0.5">Inbox messages parsed</div>
        </div>

        {/* Events Created */}
        <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-emerald-700 mb-1">
            <span className="text-xs font-medium">Events Created</span>
            <CalendarCheck2 className="h-3.5 w-3.5 text-emerald-600" />
          </div>
          <div className="text-xl font-bold text-emerald-800">{stats.eventsCreated}</div>
          <div className="text-[10px] text-emerald-600/90 mt-0.5">Added to calendar grid</div>
        </div>

        {/* Duplicates Skipped */}
        <div className="bg-amber-50/70 border border-amber-200/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-amber-700 mb-1">
            <span className="text-xs font-medium">Duplicates Skipped</span>
            <CopyCheck className="h-3.5 w-3.5 text-amber-600" />
          </div>
          <div className="text-xl font-bold text-amber-800">{stats.duplicatesSkipped}</div>
          <div className="text-[10px] text-amber-600/90 mt-0.5">Idempotency saved</div>
        </div>

        {/* Flagged for Review */}
        <div className="bg-orange-50/70 border border-orange-200/80 rounded-lg p-3">
          <div className="flex items-center justify-between text-orange-700 mb-1">
            <span className="text-xs font-medium">Needs Review</span>
            <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
          </div>
          <div className="text-xl font-bold text-orange-800">{stats.flaggedForReview}</div>
          <div className="text-[10px] text-orange-600/90 mt-0.5">Vague / low confidence</div>
        </div>

        {/* Failures Handled */}
        <div className="bg-rose-50/70 border border-rose-200/80 rounded-lg p-3 col-span-2 sm:col-span-1">
          <div className="flex items-center justify-between text-rose-700 mb-1">
            <span className="text-xs font-medium">Failures Handled</span>
            <AlertCircle className="h-3.5 w-3.5 text-rose-600" />
          </div>
          <div className="text-xl font-bold text-rose-800">{stats.failures}</div>
          <div className="text-[10px] text-rose-600/90 mt-0.5">Safely bounded (no loop)</div>
        </div>
      </div>
    </div>
  );
};

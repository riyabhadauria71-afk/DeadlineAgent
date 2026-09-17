import React, { useState } from 'react';
import {
  Database,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Copy,
  Check,
  ExternalLink,
  UploadCloud,
  DownloadCloud,
  X,
  Shield,
  Server,
  Code
} from 'lucide-react';
import {
  SUPABASE_PROJECT_ID,
  SUPABASE_URL,
  SUPABASE_ANON_KEY,
  SUPABASE_SQL_SCHEMA,
  SupabaseHealthStatus
} from '../supabase';

interface SupabaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  status: SupabaseHealthStatus | null;
  isChecking: boolean;
  onCheckStatus: () => void;
  onPushToSupabase: () => Promise<void>;
  onPullFromSupabase: () => Promise<void>;
  isSyncing: boolean;
  syncMessage: string | null;
}

export const SupabaseModal: React.FC<SupabaseModalProps> = ({
  isOpen,
  onClose,
  status,
  isChecking,
  onCheckStatus,
  onPushToSupabase,
  onPullFromSupabase,
  isSyncing,
  syncMessage,
}) => {
  const [copiedSql, setCopiedSql] = useState(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'sql'>('overview');

  if (!isOpen) return null;

  const handleCopySql = () => {
    navigator.clipboard.writeText(SUPABASE_SQL_SCHEMA);
    setCopiedSql(true);
    setTimeout(() => setCopiedSql(false), 2000);
  };

  const maskedKey = `${SUPABASE_ANON_KEY.slice(0, 15)}••••••••••••••••${SUPABASE_ANON_KEY.slice(-6)}`;

  return (
    <div
      id="supabase-modal-backdrop"
      className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 sm:p-6 overflow-y-auto"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        id="supabase-modal-panel"
        className="bg-white rounded-2xl border border-slate-200 shadow-2xl max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Header */}
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/70">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-600">
              <Database className="h-5 w-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-slate-900">Supabase Backend</h3>
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  Live Connected
                </span>
              </div>
              <p className="text-xs text-slate-500 font-mono">
                Project ID: {SUPABASE_PROJECT_ID}
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 p-1.5 rounded-lg hover:bg-slate-100 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-6 pt-3 border-b border-slate-100 flex gap-4 text-xs font-semibold">
          <button
            type="button"
            onClick={() => setActiveTab('overview')}
            className={`pb-2 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'overview'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Server className="h-3.5 w-3.5" />
            Connection & Sync
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('sql')}
            className={`pb-2 border-b-2 transition flex items-center gap-1.5 ${
              activeTab === 'sql'
                ? 'border-emerald-600 text-emerald-700'
                : 'border-transparent text-slate-500 hover:text-slate-800'
            }`}
          >
            <Code className="h-3.5 w-3.5" />
            Database Schema & SQL
          </button>
        </div>

        {/* Content Area */}
        <div className="p-6 overflow-y-auto space-y-6 flex-1 text-sm">
          {activeTab === 'overview' ? (
            <>
              {/* Connection Status Card */}
              <div className="bg-slate-50 border border-slate-200/80 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                    Connection Details
                  </span>
                  <button
                    type="button"
                    onClick={onCheckStatus}
                    disabled={isChecking}
                    className="inline-flex items-center gap-1 text-xs font-medium text-emerald-700 hover:text-emerald-800 transition"
                  >
                    <RefreshCw className={`h-3 w-3 ${isChecking ? 'animate-spin' : ''}`} />
                    <span>{isChecking ? 'Pinging...' : 'Re-test Ping'}</span>
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Endpoint</span>
                    <span className="font-mono text-slate-800 break-all">{SUPABASE_URL}</span>
                  </div>
                  <div className="bg-white p-3 rounded-lg border border-slate-200 shadow-2xs">
                    <span className="text-slate-400 block text-[10px] uppercase font-semibold">Publishable Key</span>
                    <span className="font-mono text-slate-700 text-[11px] truncate block">{maskedKey}</span>
                  </div>
                </div>

                {status?.latencyMs !== undefined && (
                  <div className="flex items-center gap-2 text-xs text-slate-600 pt-1">
                    <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    <span>Supabase response latency: <strong className="text-emerald-600 font-mono">{status.latencyMs}ms</strong></span>
                  </div>
                )}
              </div>

              {/* Status & Tables Info */}
              <div className="space-y-3">
                <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                  Postgres Tables Status
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-800">emails</span>
                      {status?.emailsTableExists ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Stores inbox emails, extraction payloads, and processed status flags.
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-800">calendar_events</span>
                      {status?.calendarTableExists ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Schedules deadlines, event times, completion flags, and deduplication IDs.
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-800">assignments</span>
                      {status?.assignmentsTableExists ? (
                        <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-amber-500" />
                      )}
                    </div>
                    <p className="text-[11px] text-slate-500">
                      User assignments, completion status, due dates, and student task tracking.
                    </p>
                  </div>

                  <div className="p-3 bg-white border border-slate-200 rounded-xl">
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-semibold text-slate-800">agent_logs</span>
                      <CheckCircle2 className="h-4 w-4 text-emerald-500" />
                    </div>
                    <p className="text-[11px] text-slate-500">
                      Stores autonomous audit logs and guardrail trigger telemetry.
                    </p>
                  </div>
                </div>

                {(!status?.emailsTableExists || !status?.calendarTableExists) && (
                  <div className="p-3 rounded-lg bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-start gap-2.5">
                    <AlertTriangle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold block">Notice on Database Tables</span>
                      If you haven't run the SQL schema yet in your Supabase project, click the{' '}
                      <strong>"Database Schema & SQL"</strong> tab above, copy the schema, and paste it into the{' '}
                      <a
                        href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`}
                        target="_blank"
                        rel="noreferrer"
                        className="underline font-semibold inline-flex items-center gap-0.5 text-emerald-800"
                      >
                        Supabase SQL Editor <ExternalLink className="h-3 w-3" />
                      </a>.
                    </div>
                  </div>
                )}
              </div>

              {/* Sync Controls */}
              <div className="pt-2 border-t border-slate-100 space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-semibold text-slate-600 uppercase tracking-wider">
                    Database Synchronization
                  </h4>
                  {syncMessage && (
                    <span className="text-xs font-medium text-emerald-700 animate-fade-in">
                      {syncMessage}
                    </span>
                  )}
                </div>

                <div className="flex flex-col sm:flex-row gap-3">
                  <button
                    type="button"
                    onClick={onPushToSupabase}
                    disabled={isSyncing}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 transition disabled:opacity-50 shadow-sm"
                  >
                    <UploadCloud className="h-4 w-4" />
                    <span>{isSyncing ? 'Syncing...' : 'Push / Seed Inbox & Calendar to Supabase'}</span>
                  </button>

                  <button
                    type="button"
                    onClick={onPullFromSupabase}
                    disabled={isSyncing}
                    className="inline-flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition disabled:opacity-50"
                  >
                    <DownloadCloud className="h-4 w-4 text-slate-600" />
                    <span>Pull from Supabase</span>
                  </button>
                </div>
                <p className="text-[11px] text-slate-500">
                  Whenever the autonomous agent runs, all extracted deadlines and updated email statuses are also automatically synced in real-time to your Supabase tables.
                </p>
              </div>
            </>
          ) : (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                    PostgreSQL Tables & Security Policies
                  </h4>
                  <p className="text-xs text-slate-500">
                    Paste this DDL in your Supabase SQL Editor to initialize or update tables with RLS.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleCopySql}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100 transition"
                >
                  {copiedSql ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
                  <span>{copiedSql ? 'Copied to Clipboard!' : 'Copy SQL Schema'}</span>
                </button>
              </div>

              <div className="relative rounded-xl overflow-hidden border border-slate-200 bg-slate-950 text-slate-200 p-4 font-mono text-xs max-h-96 overflow-y-auto">
                <pre>{SUPABASE_SQL_SCHEMA}</pre>
              </div>

              <div className="p-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-600 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Shield className="h-4 w-4 text-indigo-600" />
                  <span>Configured with Row Level Security (RLS) policies for anonymous access.</span>
                </div>
                <a
                  href={`https://supabase.com/dashboard/project/${SUPABASE_PROJECT_ID}/sql`}
                  target="_blank"
                  rel="noreferrer"
                  className="font-semibold text-emerald-700 hover:text-emerald-800 inline-flex items-center gap-1"
                >
                  Open Supabase SQL Editor <ExternalLink className="h-3 w-3" />
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-100 bg-slate-50 flex items-center justify-between text-xs text-slate-500">
          <span className="flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full bg-emerald-500" />
            Backend: Supabase Cloud (Postgres 15+)
          </span>
          <button
            type="button"
            onClick={onClose}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-100 transition shadow-2xs"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};

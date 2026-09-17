import React from 'react';
import { Bot, Play, RotateCcw, ShieldCheck, Sparkles, Square, Database, User, LogIn, LogOut, Sun, Moon } from 'lucide-react';
import { UserProfile } from '../types';

interface NavbarProps {
  isRunning: boolean;
  onRunAgent: () => void;
  onStopAgent: () => void;
  onResetDemo: () => void;
  unprocessedCount: number;
  totalCount: number;
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
  isSyncingSupabase?: boolean;
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onLogout: () => void;
  theme?: 'light' | 'dark';
  onToggleTheme?: () => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  isRunning,
  onRunAgent,
  onStopAgent,
  onResetDemo,
  unprocessedCount,
  totalCount,
  onOpenSupabaseModal,
  isSupabaseConnected,
  isSyncingSupabase,
  currentUser,
  onOpenLogin,
  onOpenSignup,
  onLogout,
  theme = 'light',
  onToggleTheme,
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
          {/* Supabase Backend Status Pill */}
          <button
            type="button"
            onClick={onOpenSupabaseModal}
            className="inline-flex items-center gap-1.5 px-2 sm:px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200/80 hover:bg-emerald-100 transition shadow-2xs"
            title="Supabase backend connection details & SQL schema"
          >
            <Database className="h-3.5 w-3.5 text-emerald-600" />
            <span className="flex items-center gap-1">
              <span className={`h-1.5 w-1.5 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
              <span className="hidden sm:inline">Supabase</span>
            </span>
          </button>

          {/* User Auth Controls */}
          {currentUser ? (
            <div className="flex items-center gap-1.5 pl-1">
              <div
                className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-50 border border-indigo-200 text-xs font-medium text-indigo-900"
                title={`Signed in as ${currentUser.email}`}
              >
                <div className="w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center text-[10px] font-bold">
                  {currentUser.name ? currentUser.name[0].toUpperCase() : 'U'}
                </div>
                <span className="font-semibold truncate max-w-[100px]">{currentUser.name.split(' ')[0]}</span>
              </div>
              <button
                type="button"
                onClick={onLogout}
                className="p-1.5 text-slate-500 hover:text-rose-600 hover:bg-slate-100 rounded-lg transition"
                title="Log Out"
              >
                <LogOut className="h-3.5 w-3.5" />
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-1">
              <button
                type="button"
                onClick={onOpenLogin}
                className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold text-slate-700 hover:bg-slate-100 transition"
              >
                <LogIn className="h-3.5 w-3.5 text-slate-500" />
                <span className="hidden sm:inline">Sign In</span>
              </button>
            </div>
          )}

          {/* Theme Toggle Button (Light / Dark) */}
          {onToggleTheme && (
            <button
              type="button"
              onClick={onToggleTheme}
              title={`Switch to ${theme === 'light' ? 'Dark' : 'Light'} Mode`}
              className="p-1.5 rounded-lg text-slate-600 hover:text-slate-900 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition"
              aria-label="Toggle color theme"
            >
              {theme === 'light' ? (
                <Moon className="h-4 w-4 text-slate-700" />
              ) : (
                <Sun className="h-4 w-4 text-amber-400" />
              )}
            </button>
          )}

          {/* Reset Demo Button */}
          <button
            type="button"
            onClick={onResetDemo}
            disabled={isRunning}
            title="Reset inbox, calendar, and logs to initial state"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 border border-slate-200 transition disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <RotateCcw className="h-3.5 w-3.5 text-slate-500" />
            <span>Reset</span>
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

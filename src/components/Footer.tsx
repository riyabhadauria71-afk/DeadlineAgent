import React from 'react';
import {
  LogIn,
  UserPlus,
  LogOut,
  User,
  ShieldCheck,
  Sparkles,
  Database,
  CheckCircle2,
  Calendar,
  Mail
} from 'lucide-react';
import { UserProfile } from '../types';

interface FooterProps {
  currentUser: UserProfile | null;
  onOpenLogin: () => void;
  onOpenSignup: () => void;
  onLogout: () => void;
  onOpenSupabaseModal: () => void;
  isSupabaseConnected: boolean;
}

export const Footer: React.FC<FooterProps> = ({
  currentUser,
  onOpenLogin,
  onOpenSignup,
  onLogout,
  onOpenSupabaseModal,
  isSupabaseConnected,
}) => {
  return (
    <footer id="app-footer" className="mt-12 bg-white border-t border-slate-200">
      {/* Top CTA band for Authentication & Quick Links */}
      <div className="bg-slate-900 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 sm:py-10">
          <div className="flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="space-y-1 text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2">
                <span className="p-1.5 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                  <Sparkles className="h-4 w-4" />
                </span>
                <span className="text-base font-bold text-white tracking-tight">
                  Deadline Agent Cloud
                </span>
                <span className="text-[10px] uppercase font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  Supabase Auth
                </span>
              </div>
              <p className="text-xs text-slate-400 max-w-xl">
                Log in to securely persist your inbox scans, mark completed coursework assignments, and update calendar deadlines directly in your PostgreSQL database.
              </p>
            </div>

            {/* Auth Actions in Footer */}
            <div className="flex items-center gap-3 shrink-0 flex-wrap justify-center">
              {currentUser ? (
                <div className="flex items-center gap-3 bg-slate-800 border border-slate-700 px-4 py-2 rounded-xl">
                  <div className="flex items-center gap-2 text-xs">
                    <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center font-bold text-white uppercase text-xs">
                      {currentUser.name ? currentUser.name[0] : 'U'}
                    </div>
                    <div className="text-left">
                      <div className="font-semibold text-white leading-tight">{currentUser.name}</div>
                      <div className="text-[10px] text-slate-400">{currentUser.email}</div>
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={onLogout}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-700 hover:bg-slate-600 text-slate-200 text-xs font-semibold transition"
                  >
                    <LogOut className="h-3.5 w-3.5" />
                    <span>Log Out</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    id="footer-login-btn"
                    onClick={onOpenLogin}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-semibold border border-slate-700 transition shadow-sm"
                  >
                    <LogIn className="h-4 w-4 text-indigo-400" />
                    <span>Log In</span>
                  </button>

                  <button
                    type="button"
                    id="footer-signup-btn"
                    onClick={onOpenSignup}
                    className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition shadow-sm"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Sign Up</span>
                  </button>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Main Footer Links & Architecture Info */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 text-xs">
          <div>
            <h4 className="font-bold text-slate-900 mb-2 flex items-center gap-1.5">
              <Sparkles className="h-3.5 w-3.5 text-indigo-600" />
              Deadline Agent
            </h4>
            <p className="text-slate-500 leading-relaxed text-[11px]">
              AI inbox agent that extracts course deadlines, fees, and internship applications and synchronizes them with your calendar and database.
            </p>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2">Account & Access</h4>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              <li>
                <button
                  type="button"
                  onClick={onOpenLogin}
                  className="hover:text-indigo-600 transition flex items-center gap-1"
                >
                  <LogIn className="h-3 w-3" />
                  Sign In to Account
                </button>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenSignup}
                  className="hover:text-indigo-600 transition flex items-center gap-1"
                >
                  <UserPlus className="h-3 w-3" />
                  Create New Account
                </button>
              </li>
              <li>
                <span className="text-slate-400">Assignment Management (Active)</span>
              </li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2">Supabase Cloud Database</h4>
            <ul className="space-y-1.5 text-slate-600 text-[11px]">
              <li className="flex items-center gap-1.5">
                <span className={`w-2 h-2 rounded-full ${isSupabaseConnected ? 'bg-emerald-500 animate-pulse' : 'bg-amber-500'}`} />
                <span>Project: <code>njcszvoakbiktuurrlqm</code></span>
              </li>
              <li>
                <button
                  type="button"
                  onClick={onOpenSupabaseModal}
                  className="text-indigo-600 hover:text-indigo-800 font-medium underline"
                >
                  View SQL Schema & Sync Panel
                </button>
              </li>
              <li className="text-slate-400">RLS Policies on <code>emails</code>, <code>calendar_events</code>, <code>assignments</code></li>
            </ul>
          </div>

          <div>
            <h4 className="font-bold text-slate-900 mb-2">Guardrails & Safety</h4>
            <ul className="space-y-1 text-slate-500 text-[11px]">
              <li>&bull; Idempotent contract hashing</li>
              <li>&bull; Strict 3-retry circuit breaker</li>
              <li>&bull; Monospace audit log trail</li>
              <li>&bull; Human review fallback queues</li>
            </ul>
          </div>
        </div>

        <div className="mt-8 pt-6 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px] text-slate-400">
          <div>
            &copy; 2026 Deadline Agent. Built with React, Tailwind CSS & Supabase.
          </div>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-emerald-600">
              <CheckCircle2 className="h-3 w-3" />
              Supabase Connected
            </span>
            <span className="flex items-center gap-1 text-indigo-600">
              <ShieldCheck className="h-3 w-3" />
              Auth Ready
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
};

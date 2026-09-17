import React from 'react';
import { ShieldCheck, Repeat, HardDrive, AlertOctagon, HelpCircle } from 'lucide-react';

interface GuardrailsBannerProps {
  simulateFailure: boolean;
  onToggleSimulateFailure: (val: boolean) => void;
  isRunning: boolean;
}

export const GuardrailsBanner: React.FC<GuardrailsBannerProps> = ({
  simulateFailure,
  onToggleSimulateFailure,
  isRunning,
}) => {
  return (
    <div id="guardrails-banner" className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <ShieldCheck className="h-4 w-4" />
          </div>
          <div>
            <h2 className="text-sm font-semibold text-slate-900 flex items-center gap-2">
              Autonomous Agent Guardrails
              <span className="text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
                All 4 Enforced
              </span>
            </h2>
            <p className="text-xs text-slate-500">
              Deterministic safeguards protecting against runaway loops, duplicate bookings, and uncapped executions.
            </p>
          </div>
        </div>

        {/* Simulate Failure Toggle */}
        <div className="flex items-center gap-3 bg-slate-50 border border-slate-200/80 rounded-lg px-3 py-1.5 self-start md:self-auto">
          <div className="flex flex-col">
            <span className="text-xs font-medium text-slate-800">Simulate Failure</span>
            <span className="text-[10px] text-slate-500">Triggers 1 retry, then exits</span>
          </div>
          <button
            type="button"
            role="switch"
            aria-checked={simulateFailure}
            disabled={isRunning}
            onClick={() => onToggleSimulateFailure(!simulateFailure)}
            className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
              simulateFailure ? 'bg-amber-600' : 'bg-slate-300'
            } ${isRunning ? 'opacity-60 cursor-not-allowed' : ''}`}
          >
            <span
              aria-hidden="true"
              className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                simulateFailure ? 'translate-x-4' : 'translate-x-0'
              }`}
            />
          </button>
        </div>
      </div>

      {/* The 4 Guardrail Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-3">
        {/* Guardrail 1: Hard Cap */}
        <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50/70 border border-slate-100">
          <div className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-700 mt-0.5">
            <HardDrive className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-slate-900">Hard Cap: 20/run</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              Strictly halts after 20 emails. Alerts if excess emails remain unprocessed.
            </p>
          </div>
        </div>

        {/* Guardrail 2: Idempotency */}
        <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50/70 border border-slate-100">
          <div className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-700 mt-0.5">
            <Repeat className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-slate-900">Idempotent Deduplication</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              Checks candidate source email ID & near-identical title + date before scheduling.
            </p>
          </div>
        </div>

        {/* Guardrail 3: State Locking */}
        <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50/70 border border-slate-100">
          <div className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-700 mt-0.5">
            <ShieldCheck className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-slate-900">State Locking</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              Processed emails are marked in state; re-runs skip them to eliminate repeat work.
            </p>
          </div>
        </div>

        {/* Guardrail 4: Loop & Retry Bound */}
        <div className="flex items-start gap-2.5 p-2 rounded-lg bg-slate-50/70 border border-slate-100">
          <div className="p-1.5 rounded-md bg-white border border-slate-200 text-slate-700 mt-0.5">
            <AlertOctagon className="h-3.5 w-3.5" />
          </div>
          <div>
            <div className="flex items-center gap-1">
              <span className="text-xs font-semibold text-slate-900">Max 1 Retry Bound</span>
            </div>
            <p className="text-[11px] text-slate-500 leading-tight mt-0.5">
              Extraction retries at most once. On 2nd failure, marks processed to avert infinite loops.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

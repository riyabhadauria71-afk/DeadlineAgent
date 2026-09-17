import React from 'react';
import { Email } from '../types';
import { X, Mail, Calendar, Clock, AlertTriangle, CheckCircle2, ShieldAlert, FileCode } from 'lucide-react';

interface EmailDetailModalProps {
  email: Email | null;
  onClose: () => void;
}

export const EmailDetailModal: React.FC<EmailDetailModalProps> = ({ email, onClose }) => {
  if (!email) return null;

  const getStatusBadge = () => {
    switch (email.status) {
      case 'event_created':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3.5 w-3.5 text-emerald-600" />
            Event Created
          </span>
        );
      case 'duplicate_skipped':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <ShieldAlert className="h-3.5 w-3.5 text-amber-600" />
            Duplicate Skipped (Idempotent)
          </span>
        );
      case 'needs_review':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
            <AlertTriangle className="h-3.5 w-3.5 text-orange-600" />
            Needs Manual Review
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertTriangle className="h-3.5 w-3.5 text-rose-600" />
            Failed (Handled Safely)
          </span>
        );
      case 'processing':
        return (
          <span className="inline-flex items-center gap-1 text-xs font-semibold px-2.5 py-1 rounded-full bg-indigo-50 text-indigo-700 border border-indigo-200 animate-pulse">
            Processing...
          </span>
        );
      case 'unprocessed':
      default:
        return (
          <span className="inline-flex items-center gap-1 text-xs font-medium px-2.5 py-1 rounded-full bg-slate-100 text-slate-600">
            Unprocessed
          </span>
        );
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
      <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-2xl w-full max-h-[90vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        {/* Header */}
        <div className="p-4 border-b border-slate-100 flex items-start justify-between bg-slate-50/50">
          <div className="flex-1 pr-4">
            <div className="flex items-center gap-2 mb-1">
              {getStatusBadge()}
              {email.processed && (
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-200 text-slate-700">
                  Locked: Processed
                </span>
              )}
            </div>
            <h3 className="text-base font-bold text-slate-900 leading-snug">{email.subject}</h3>
            <div className="flex items-center gap-2 text-xs text-slate-500 mt-1">
              <span className="font-medium text-slate-700">{email.sender}</span>
              <span>&bull;</span>
              <span>&lt;{email.senderEmail}&gt;</span>
              <span>&bull;</span>
              <span>{email.receivedDate}</span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-200/60 transition"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Modal Scrollable Content */}
        <div className="p-5 overflow-y-auto space-y-4 text-xs">
          {/* Email Body */}
          <div>
            <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
              <Mail className="h-3.5 w-3.5 text-slate-400" />
              <span>Email Body</span>
            </div>
            <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-800 whitespace-pre-wrap leading-relaxed font-sans">
              {email.body}
            </div>
          </div>

          {/* Extraction Result Breakdown */}
          {email.extractedData && (
            <div>
              <div className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 mb-1.5 flex items-center gap-1.5">
                <FileCode className="h-3.5 w-3.5 text-indigo-500" />
                <span>Extracted Contract JSON (extractDeadline Output)</span>
              </div>
              <pre className="p-3 rounded-lg bg-slate-950 text-indigo-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
                {JSON.stringify(email.extractedData, null, 2)}
              </pre>
            </div>
          )}

          {/* Status Details / Reason */}
          {email.resultSummary && (
            <div className="p-3 rounded-lg bg-indigo-50/70 border border-indigo-200 text-indigo-900 flex items-start gap-2 text-xs">
              <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
              <div>
                <span className="font-semibold block">Agent Action Summary:</span>
                <span>{email.resultSummary}</span>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-3 bg-slate-50 border-t border-slate-100 flex items-center justify-between">
          <span className="text-[11px] font-mono text-slate-500">Email ID: {email.id}</span>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 rounded-lg bg-slate-900 text-white font-medium hover:bg-slate-800 transition"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};

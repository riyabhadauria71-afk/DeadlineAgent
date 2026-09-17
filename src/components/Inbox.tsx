import React, { useState } from 'react';
import { Email } from '../types';
import { Mail, Search, CheckCircle2, CopyCheck, AlertTriangle, AlertCircle, Clock, Eye } from 'lucide-react';

interface InboxProps {
  emails: Email[];
  currentProcessingEmailId?: string | null;
  onSelectEmail: (email: Email) => void;
}

export const Inbox: React.FC<InboxProps> = ({
  emails,
  currentProcessingEmailId,
  onSelectEmail,
}) => {
  const [filter, setFilter] = useState<'all' | 'unprocessed' | 'created' | 'duplicates' | 'review'>('all');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredEmails = emails.filter((email) => {
    // Tab filter
    if (filter === 'unprocessed' && email.processed) return false;
    if (filter === 'created' && email.status !== 'event_created') return false;
    if (filter === 'duplicates' && email.status !== 'duplicate_skipped') return false;
    if (filter === 'review' && email.status !== 'needs_review') return false;

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        email.subject.toLowerCase().includes(q) ||
        email.sender.toLowerCase().includes(q) ||
        email.snippet.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getStatusBadge = (email: Email) => {
    if (email.id === currentProcessingEmailId) {
      return (
        <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-indigo-100 text-indigo-800 border border-indigo-300 animate-pulse">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-600 animate-ping" />
          Processing...
        </span>
      );
    }

    switch (email.status) {
      case 'event_created':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="h-3 w-3 text-emerald-600" />
            Created
          </span>
        );
      case 'duplicate_skipped':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-amber-50 text-amber-700 border border-amber-200">
            <CopyCheck className="h-3 w-3 text-amber-600" />
            Duplicate
          </span>
        );
      case 'needs_review':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-orange-50 text-orange-700 border border-orange-200">
            <AlertTriangle className="h-3 w-3 text-orange-600" />
            Review
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="h-3 w-3 text-rose-600" />
            Failed
          </span>
        );
      default:
        if (email.processed) {
          return (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-600">
              No Deadline
            </span>
          );
        }
        return (
          <span className="inline-flex items-center gap-1 text-[11px] font-medium px-2 py-0.5 rounded-full bg-slate-100 text-slate-500">
            Unprocessed
          </span>
        );
    }
  };

  const unprocessedCount = emails.filter((e) => !e.processed).length;
  const createdCount = emails.filter((e) => e.status === 'event_created').length;
  const duplicateCount = emails.filter((e) => e.status === 'duplicate_skipped').length;
  const reviewCount = emails.filter((e) => e.status === 'needs_review').length;

  return (
    <div id="inbox-container" className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden flex flex-col h-[480px]">
      {/* Inbox Header */}
      <div className="p-3.5 border-b border-slate-100 bg-white space-y-2.5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
              <Mail className="h-4 w-4" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Mock Inbox</h3>
              <p className="text-xs text-slate-500">Sample email feed with realistic deadlines and noisy distractors.</p>
            </div>
          </div>
          <span className="text-xs font-mono font-medium px-2 py-0.5 rounded-md bg-slate-100 text-slate-600 border border-slate-200">
            {unprocessedCount} unread / pending
          </span>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-2 pt-1">
          <div className="relative flex-1">
            <Search className="h-3.5 w-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search sender, subject..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-8 pr-3 py-1.5 text-xs bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-800 placeholder-slate-400"
            />
          </div>

          <div className="flex items-center gap-1 overflow-x-auto pb-1 sm:pb-0 text-xs">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`px-2 py-1 rounded-md transition font-medium text-[11px] whitespace-nowrap ${
                filter === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              All ({emails.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('unprocessed')}
              className={`px-2 py-1 rounded-md transition font-medium text-[11px] whitespace-nowrap ${
                filter === 'unprocessed'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              Unprocessed ({unprocessedCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('created')}
              className={`px-2 py-1 rounded-md transition font-medium text-[11px] whitespace-nowrap ${
                filter === 'created'
                  ? 'bg-emerald-700 text-white'
                  : 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60'
              }`}
            >
              Created ({createdCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('duplicates')}
              className={`px-2 py-1 rounded-md transition font-medium text-[11px] whitespace-nowrap ${
                filter === 'duplicates'
                  ? 'bg-amber-700 text-white'
                  : 'bg-amber-50 text-amber-700 hover:bg-amber-100 border border-amber-200/60'
              }`}
            >
              Duplicates ({duplicateCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('review')}
              className={`px-2 py-1 rounded-md transition font-medium text-[11px] whitespace-nowrap ${
                filter === 'review'
                  ? 'bg-orange-700 text-white'
                  : 'bg-orange-50 text-orange-700 hover:bg-orange-100 border border-orange-200/60'
              }`}
            >
              Review ({reviewCount})
            </button>
          </div>
        </div>
      </div>

      {/* Email List */}
      <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
        {filteredEmails.length === 0 ? (
          <div className="p-8 text-center text-slate-400 text-xs">
            No emails match your filter criteria.
          </div>
        ) : (
          filteredEmails.map((email) => {
            const isProcessingThis = email.id === currentProcessingEmailId;
            return (
              <div
                key={email.id}
                onClick={() => onSelectEmail(email)}
                className={`p-3 cursor-pointer transition flex items-start gap-2.5 group ${
                  isProcessingThis
                    ? 'bg-indigo-50/70 ring-1 ring-inset ring-indigo-400'
                    : 'hover:bg-slate-50/80 bg-white'
                }`}
              >
                {/* Unread indicator dot */}
                <div className="pt-1.5 shrink-0">
                  {email.unread && !email.processed ? (
                    <span className="block w-2 h-2 rounded-full bg-indigo-600 ring-2 ring-indigo-100" />
                  ) : (
                    <span className="block w-2 h-2 rounded-full bg-slate-200" />
                  )}
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2 mb-0.5">
                    <span className={`text-xs truncate ${email.unread ? 'font-bold text-slate-900' : 'font-medium text-slate-700'}`}>
                      {email.sender}
                    </span>
                    <div className="flex items-center gap-1.5 shrink-0">
                      <span className="text-[10px] text-slate-400 font-mono">{email.receivedDate}</span>
                      {getStatusBadge(email)}
                    </div>
                  </div>

                  <div className={`text-xs truncate mb-0.5 ${email.unread ? 'font-semibold text-slate-900' : 'text-slate-800'}`}>
                    {email.subject}
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-1 leading-relaxed">
                    {email.snippet}
                  </p>

                  {email.resultSummary && (
                    <div className="mt-1 text-[10px] text-slate-600 bg-slate-50 border border-slate-100 rounded px-1.5 py-0.5 inline-block max-w-full truncate">
                      {email.resultSummary}
                    </div>
                  )}
                </div>

                {/* View hover button */}
                <div className="opacity-0 group-hover:opacity-100 transition shrink-0 self-center pl-1">
                  <span className="p-1 rounded text-slate-400 hover:text-indigo-600 hover:bg-slate-100 block">
                    <Eye className="h-3.5 w-3.5" />
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};

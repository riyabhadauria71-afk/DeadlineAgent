import React, { useState } from 'react';
import { CalendarEvent } from '../types';
import { ChevronLeft, ChevronRight, Bot, Calendar as CalendarIcon, Clock, Mail, Info, X, CheckCircle2, Circle } from 'lucide-react';

interface CalendarViewProps {
  events: CalendarEvent[];
  onToggleEventComplete?: (id: string) => void;
}

export const CalendarView: React.FC<CalendarViewProps> = ({ events, onToggleEventComplete }) => {
  // Default to October 2026 as the primary demo deadline month
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = October
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear(prev => prev - 1);
    } else {
      setCurrentMonth(prev => prev - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear(prev => prev + 1);
    } else {
      setCurrentMonth(prev => prev + 1);
    }
  };

  // Calendar calculations
  const firstDayIndex = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();
  const daysInPrevMonth = new Date(currentYear, currentMonth, 0).getDate();

  // Filter events for this month
  const monthString = (currentMonth + 1).toString().padStart(2, '0');
  const monthPrefix = `${currentYear}-${monthString}`;

  const agentEventsCount = events.filter(e => e.isAgentCreated && e.date.startsWith(monthPrefix)).length;
  const preExistingCount = events.filter(e => !e.isAgentCreated && e.date.startsWith(monthPrefix)).length;

  return (
    <div id="calendar-view" className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs flex flex-col">
      {/* Calendar Header & Month Navigation */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="h-7 w-7 rounded-lg bg-indigo-50 border border-indigo-100 flex items-center justify-center text-indigo-600">
            <CalendarIcon className="h-4 w-4" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Calendar Sync</h3>
            <p className="text-xs text-slate-500">Autonomous additions visually marked with agent credentials.</p>
          </div>
        </div>

        <div className="flex items-center justify-between sm:justify-end gap-3">
          {/* Legend */}
          <div className="flex items-center gap-3 text-xs">
            <div className="flex items-center gap-1.5 text-slate-600">
              <span className="w-2.5 h-2.5 rounded-full bg-slate-300 border border-slate-400" />
              <span>Pre-existing ({preExistingCount})</span>
            </div>
            <div className="flex items-center gap-1.5 text-indigo-700 font-medium">
              <span className="w-2.5 h-2.5 rounded-full bg-indigo-600 border border-indigo-700" />
              <span>Agent-Created ({agentEventsCount})</span>
            </div>
          </div>

          {/* Month Stepper */}
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded hover:bg-white text-slate-600 transition"
              title="Previous Month"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>
            <span className="text-xs font-semibold text-slate-800 px-2 min-w-[110px] text-center">
              {monthNames[currentMonth]} {currentYear}
            </span>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded hover:bg-white text-slate-600 transition"
              title="Next Month"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Days of week header */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 border-b border-slate-200 text-center text-[11px] font-semibold text-slate-600 py-2 mt-2">
        <span>Sun</span>
        <span>Mon</span>
        <span>Tue</span>
        <span>Wed</span>
        <span>Thu</span>
        <span>Fri</span>
        <span>Sat</span>
      </div>

      {/* Grid of Days */}
      <div className="grid grid-cols-7 gap-px bg-slate-200 flex-1 min-h-[360px] border-b border-x border-slate-200 rounded-b-lg overflow-hidden">
        {/* Previous month padding cells */}
        {Array.from({ length: firstDayIndex }).map((_, idx) => {
          const prevDay = daysInPrevMonth - firstDayIndex + idx + 1;
          return (
            <div key={`prev-${idx}`} className="bg-slate-50/50 p-1.5 min-h-[72px] text-[11px] text-slate-400">
              {prevDay}
            </div>
          );
        })}

        {/* Current Month Days */}
        {Array.from({ length: daysInMonth }).map((_, idx) => {
          const day = idx + 1;
          const dayStr = day.toString().padStart(2, '0');
          const dateStr = `${currentYear}-${monthString}-${dayStr}`;
          const dayEvents = events.filter(e => e.date === dateStr);

          // Highlight today (Sep 16, 2026 in demo context)
          const isToday = currentYear === 2026 && currentMonth === 8 && day === 16;

          return (
            <div
              key={`day-${day}`}
              className={`bg-white p-1.5 min-h-[74px] flex flex-col transition hover:bg-slate-50/80 ${
                isToday ? 'ring-1 ring-inset ring-indigo-500 bg-indigo-50/20' : ''
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span
                  className={`text-[11px] font-medium leading-none ${
                    isToday
                      ? 'w-5 h-5 rounded-full bg-indigo-600 text-white flex items-center justify-center font-bold'
                      : 'text-slate-700'
                  }`}
                >
                  {day}
                </span>
                {dayEvents.length > 0 && (
                  <span className="text-[10px] text-slate-400 font-mono">
                    {dayEvents.length}
                  </span>
                )}
              </div>

              {/* Day Events Container */}
              <div className="space-y-1 flex-1 overflow-y-auto max-h-[80px]">
                {dayEvents.map(evt => {
                  if (evt.isAgentCreated) {
                    return (
                      <button
                        key={evt.id}
                        type="button"
                        onClick={() => setSelectedEvent(evt)}
                        title={`Agent-created: ${evt.title} (${evt.time || 'All Day'})${evt.isCompleted ? ' - Completed' : ''}`}
                        className={`w-full text-left px-1.5 py-1 rounded text-[10px] transition group flex items-start gap-1 ${
                          evt.isCompleted
                            ? 'bg-emerald-50 hover:bg-emerald-100 border border-emerald-300 text-emerald-900'
                            : 'bg-indigo-50 hover:bg-indigo-100 border border-indigo-200/90 text-indigo-900'
                        }`}
                      >
                        {evt.isCompleted ? (
                          <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0 mt-0.5" />
                        ) : (
                          <Bot className="h-3 w-3 text-indigo-600 shrink-0 mt-0.5" />
                        )}
                        <div className="truncate flex-1">
                          <span className={`font-semibold block truncate leading-tight ${evt.isCompleted ? 'line-through text-emerald-800' : ''}`}>
                            {evt.title}
                          </span>
                          {evt.time && <span className="text-[9px] text-indigo-700 block">{evt.time}</span>}
                        </div>
                      </button>
                    );
                  } else {
                    return (
                      <button
                        key={evt.id}
                        type="button"
                        onClick={() => setSelectedEvent(evt)}
                        title={`Pre-existing: ${evt.title} (${evt.time || 'All Day'})`}
                        className="w-full text-left px-1.5 py-1 rounded bg-slate-100 hover:bg-slate-200 border border-slate-200 text-slate-800 text-[10px] transition group flex items-start gap-1"
                      >
                        <CalendarIcon className="h-3 w-3 text-slate-500 shrink-0 mt-0.5" />
                        <div className="truncate flex-1">
                          <span className="font-medium block truncate leading-tight">{evt.title}</span>
                          {evt.time && <span className="text-[9px] text-slate-500 block">{evt.time}</span>}
                        </div>
                      </button>
                    );
                  }
                })}
              </div>
            </div>
          );
        })}

        {/* Trailing cells for grid alignment */}
        {(() => {
          const totalCells = firstDayIndex + daysInMonth;
          const remainder = totalCells % 7;
          const trailingCount = remainder === 0 ? 0 : 7 - remainder;
          return Array.from({ length: trailingCount }).map((_, idx) => (
            <div key={`post-${idx}`} className="bg-slate-50/50 p-1.5 min-h-[72px] text-[11px] text-slate-400">
              {idx + 1}
            </div>
          ));
        })()}
      </div>

      {/* Selected Event Details Modal */}
      {selectedEvent && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-start justify-between border-b border-slate-100 pb-3">
              <div className="flex items-center gap-2">
                {selectedEvent.isAgentCreated ? (
                  <div className="h-8 w-8 rounded-lg bg-indigo-50 border border-indigo-200 flex items-center justify-center text-indigo-600">
                    <Bot className="h-5 w-5" />
                  </div>
                ) : (
                  <div className="h-8 w-8 rounded-lg bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-600">
                    <CalendarIcon className="h-5 w-5" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm font-bold text-slate-900">{selectedEvent.title}</h4>
                  </div>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full ${
                    selectedEvent.isAgentCreated 
                      ? 'bg-indigo-50 text-indigo-700 border border-indigo-200' 
                      : 'bg-slate-100 text-slate-600'
                  }`}>
                    {selectedEvent.isAgentCreated ? 'Autonomous Agent Created' : 'Pre-existing Event'}
                  </span>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-lg hover:bg-slate-100 transition"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <div className="flex items-center gap-2 text-slate-600">
                <Clock className="h-4 w-4 text-slate-400" />
                <span className="font-semibold text-slate-900">{selectedEvent.date}</span>
                {selectedEvent.time && <span>at {selectedEvent.time}</span>}
              </div>

              {selectedEvent.sourceEmailSubject && (
                <div className="p-3 bg-slate-50 border border-slate-200 rounded-lg space-y-1">
                  <div className="flex items-center gap-1.5 text-slate-500 text-[11px]">
                    <Mail className="h-3.5 w-3.5" />
                    <span>Source Email Trigger</span>
                  </div>
                  <div className="font-medium text-slate-900">{selectedEvent.sourceEmailSubject}</div>
                  {selectedEvent.sourceEmailId && (
                    <div className="text-[10px] text-slate-400 font-mono">ID: {selectedEvent.sourceEmailId}</div>
                  )}
                </div>
              )}

              {selectedEvent.isAgentCreated && (
                <div className="p-2.5 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-800 text-[11px] flex items-start gap-2">
                  <Info className="h-4 w-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>
                    Verified through automated deadline parsing and screened through duplicate detection guardrails.
                  </span>
                </div>
              )}
            </div>

            <div className="pt-2 flex items-center justify-between border-t border-slate-100">
              {onToggleEventComplete && (
                <button
                  type="button"
                  onClick={() => {
                    onToggleEventComplete(selectedEvent.id);
                    setSelectedEvent((prev) => prev ? { ...prev, isCompleted: !prev.isCompleted } : null);
                  }}
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition ${
                    selectedEvent.isCompleted
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                  }`}
                >
                  <CheckCircle2 className="h-3.5 w-3.5" />
                  <span>{selectedEvent.isCompleted ? 'Mark Incomplete' : 'Mark as Done'}</span>
                </button>
              )}
              <button
                type="button"
                onClick={() => setSelectedEvent(null)}
                className="px-3 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold transition ml-auto"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

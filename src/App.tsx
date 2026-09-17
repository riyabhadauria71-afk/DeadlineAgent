/**
 * Deadline Agent
 * 
 * An autonomous agent that scans a user's mock inbox for emails containing deadlines
 * and schedules them to a calendar view with strict guardrails:
 * 1. Hard Cap (max 20 emails per run)
 * 2. Idempotency & Deduplication
 * 3. State Locking (processed emails are never re-run)
 * 4. Bounded Retries (at most 1 retry, no infinite loops)
 */

import React, { useState, useRef, useCallback } from 'react';
import { Email, CalendarEvent, LogEntry, RunStats } from './types';
import { INITIAL_EMAILS, INITIAL_CALENDAR_EVENTS } from './sampleEmails';
import { executeAgentScan } from './agentRunner.js';
import { Navbar } from './components/Navbar';
import { GuardrailsBanner } from './components/GuardrailsBanner';
import { SummaryPanel } from './components/SummaryPanel';
import { Inbox } from './components/Inbox';
import { ActivityLog } from './components/ActivityLog';
import { CalendarView } from './components/CalendarView';
import { EmailDetailModal } from './components/EmailDetailModal';

export default function App() {
  const [emails, setEmails] = useState<Email[]>(INITIAL_EMAILS);
  const [calendarEvents, setCalendarEvents] = useState<CalendarEvent[]>(INITIAL_CALENDAR_EVENTS);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: 'log-init-1',
      timestamp: new Date().toLocaleTimeString(),
      step: 'INFO',
      message: 'Deadline Agent initialized and ready. Loaded 14 inbox emails and 2 pre-existing calendar events.',
    },
    {
      id: 'log-init-2',
      timestamp: new Date().toLocaleTimeString(),
      step: 'GUARDRAIL',
      message: 'Guardrails loaded: Hard Cap (20 max), Idempotency Check, Max 1 Retry, and Processed State Locking.',
    }
  ]);
  const [isRunning, setIsRunning] = useState<boolean>(false);
  const [speed, setSpeed] = useState<'normal' | 'fast'>('normal');
  const [simulateFailure, setSimulateFailure] = useState<boolean>(false);
  const [currentProcessingEmailId, setCurrentProcessingEmailId] = useState<string | null>(null);
  const [selectedEmail, setSelectedEmail] = useState<Email | null>(null);

  const [hasRun, setHasRun] = useState<boolean>(false);
  const [limitReached, setLimitReached] = useState<boolean>(false);
  const [unprocessedRemaining, setUnprocessedRemaining] = useState<number>(0);
  const [stats, setStats] = useState<RunStats>({
    emailsScanned: 0,
    eventsCreated: 0,
    duplicatesSkipped: 0,
    flaggedForReview: 0,
    failures: 0,
    totalEmails: INITIAL_EMAILS.length,
    processedCount: 0,
  });

  const abortControllerRef = useRef<boolean>(false);

  // Email update handler during scan
  const handleEmailUpdate = useCallback((emailId: string, updates: Partial<Email>) => {
    setEmails((prevEmails) =>
      prevEmails.map((email) => {
        if (email.id === emailId) {
          const updated = { ...email, ...updates };
          return updated;
        }
        return email;
      })
    );
  }, []);

  // Calendar event creation handler during scan
  const handleEventCreate = useCallback((newEvent: CalendarEvent) => {
    setCalendarEvents((prevEvents) => [...prevEvents, newEvent]);
  }, []);

  // Log handler
  const handleLog = useCallback((logEntry: LogEntry) => {
    setLogs((prev) => [...prev, logEntry]);
  }, []);

  // Run the Agent
  const handleRunAgent = async () => {
    if (isRunning) return;

    abortControllerRef.current = false;
    setIsRunning(true);
    setHasRun(true);

    const stepDelayMs = speed === 'fast' ? 250 : 650;

    try {
      const runResult = await executeAgentScan({
        emails,
        existingCalendarEvents: calendarEvents,
        simulateFailure,
        stepDelayMs,
        shouldStop: () => abortControllerRef.current,
        onLog: handleLog,
        onEmailUpdate: (id: string, updates: Partial<Email>) => {
          if (updates.status === 'processing') {
            setCurrentProcessingEmailId(id);
          } else if (updates.status !== undefined) {
            setCurrentProcessingEmailId(null);
          }
          handleEmailUpdate(id, updates);
        },
        onEventCreate: handleEventCreate,
      });

      setLimitReached(runResult.limitReached);
      setUnprocessedRemaining(runResult.unprocessedRemaining);

      setStats((prev) => ({
        emailsScanned: prev.emailsScanned + runResult.emailsScanned,
        eventsCreated: prev.eventsCreated + runResult.eventsCreated,
        duplicatesSkipped: prev.duplicatesSkipped + runResult.duplicatesSkipped,
        flaggedForReview: prev.flaggedForReview + runResult.flaggedForReview,
        failures: prev.failures + runResult.failures,
        totalEmails: emails.length,
        processedCount: emails.filter((e) => e.processed).length + runResult.emailsScanned,
      }));
    } catch (err: any) {
      handleLog({
        id: `log-err-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        step: 'FAIL',
        message: `Agent execution stopped unexpectedly: ${err?.message || 'Unknown error'}`,
      });
    } finally {
      setIsRunning(false);
      setCurrentProcessingEmailId(null);
    }
  };

  const handleStopAgent = () => {
    abortControllerRef.current = true;
    setIsRunning(false);
    setCurrentProcessingEmailId(null);
    handleLog({
      id: `log-stop-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      step: 'INFO',
      message: 'Agent run paused by user request.',
    });
  };

  const handleResetDemo = () => {
    if (isRunning) return;
    abortControllerRef.current = true;
    setEmails(INITIAL_EMAILS);
    setCalendarEvents(INITIAL_CALENDAR_EVENTS);
    setHasRun(false);
    setLimitReached(false);
    setUnprocessedRemaining(0);
    setCurrentProcessingEmailId(null);
    setSelectedEmail(null);
    setStats({
      emailsScanned: 0,
      eventsCreated: 0,
      duplicatesSkipped: 0,
      flaggedForReview: 0,
      failures: 0,
      totalEmails: INITIAL_EMAILS.length,
      processedCount: 0,
    });
    setLogs([
      {
        id: `log-reset-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        step: 'INFO',
        message: 'Demo state reset. Mock inbox restored to 14 sample emails and calendar restored to initial baseline.',
      },
    ]);
  };

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleToggleSpeed = () => {
    setSpeed((prev) => (prev === 'normal' ? 'fast' : 'normal'));
  };

  const unprocessedCount = emails.filter((e) => !e.processed).length;

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 flex flex-col font-sans">
      {/* Top Navbar */}
      <Navbar
        isRunning={isRunning}
        onRunAgent={handleRunAgent}
        onStopAgent={handleStopAgent}
        onResetDemo={handleResetDemo}
        unprocessedCount={unprocessedCount}
        totalCount={emails.length}
      />

      {/* Main Content Dashboard */}
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Guardrails Visibility Header Banner */}
        <GuardrailsBanner
          simulateFailure={simulateFailure}
          onToggleSimulateFailure={setSimulateFailure}
          isRunning={isRunning}
        />

        {/* Telemetry & Summary Panel */}
        <SummaryPanel
          stats={stats}
          hasRun={hasRun}
          limitReached={limitReached}
          unprocessedRemaining={unprocessedRemaining}
        />

        {/* Split Grid: Inbox Feed (Left) & Activity Log Terminal (Right) */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
          {/* Left: Mock Inbox */}
          <Inbox
            emails={emails}
            currentProcessingEmailId={currentProcessingEmailId}
            onSelectEmail={(email) => setSelectedEmail(email)}
          />

          {/* Right: Monospace Activity Log */}
          <ActivityLog
            logs={logs}
            isRunning={isRunning}
            onClearLogs={handleClearLogs}
            speed={speed}
            onToggleSpeed={handleToggleSpeed}
          />
        </div>

        {/* Bottom: Month Calendar View with Agent-Created Markers */}
        <CalendarView events={calendarEvents} />
      </main>

      {/* Email Detail & Contract Inspector Modal */}
      <EmailDetailModal
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
      />
    </div>
  );
}

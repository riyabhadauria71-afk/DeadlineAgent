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

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Email, CalendarEvent, LogEntry, RunStats, Assignment, UserProfile } from './types';
import { INITIAL_EMAILS, INITIAL_CALENDAR_EVENTS } from './sampleEmails';
import { executeAgentScan } from './agentRunner.js';
import { Navbar } from './components/Navbar';
import { GuardrailsBanner } from './components/GuardrailsBanner';
import { SummaryPanel } from './components/SummaryPanel';
import { Inbox } from './components/Inbox';
import { ActivityLog } from './components/ActivityLog';
import { CalendarView } from './components/CalendarView';
import { AssignmentManager } from './components/AssignmentManager';
import { EmailDetailModal } from './components/EmailDetailModal';
import { SupabaseModal } from './components/SupabaseModal';
import { AuthModal } from './components/AuthModal';
import { Footer } from './components/Footer';
import {
  checkSupabaseHealth,
  fetchEmailsFromSupabase,
  fetchCalendarEventsFromSupabase,
  fetchAssignmentsFromSupabase,
  syncEmailToSupabase,
  syncCalendarEventToSupabase,
  syncEmailsBatchToSupabase,
  syncCalendarEventsBatchToSupabase,
  syncAssignmentToSupabase,
  syncAssignmentsBatchToSupabase,
  deleteAssignmentFromSupabase,
  syncLogToSupabase,
  SupabaseHealthStatus,
  supabase,
} from './supabase';

// Baseline assignments for students & coursework
const INITIAL_ASSIGNMENTS: Assignment[] = [
  {
    id: 'asg-1',
    title: 'CS 380: Assignment 3 - Decoder-Only Transformer',
    courseOrOrg: 'CS 380 (Prof. David Kahan)',
    dueDate: '2026-10-12',
    dueTime: '11:59 PM',
    status: 'pending',
    priority: 'high',
    sourceEmailId: 'email-2',
    notes: 'Implement decoder attention mask and submit notebook via Gradescope.',
  },
  {
    id: 'asg-2',
    title: 'Fall 2026 Tuition Fee Payment Settlement',
    courseOrOrg: 'Office of the Bursar',
    dueDate: '2026-10-05',
    dueTime: '5:00 PM',
    status: 'pending',
    priority: 'high',
    sourceEmailId: 'email-1',
    notes: 'Pay $4,850 online via student accounts portal or wire transfer.',
  },
  {
    id: 'asg-3',
    title: 'Tech & Engineering Career Fair Fast-Pass Registration',
    courseOrOrg: 'Career Development Center',
    dueDate: '2026-10-02',
    dueTime: '6:00 PM',
    status: 'completed',
    completedAt: '2026-09-15T14:30:00Z',
    priority: 'medium',
    sourceEmailId: 'email-14',
    notes: 'Uploaded verified resume to Handshake and downloaded fast-pass QR code.',
  },
  {
    id: 'asg-4',
    title: 'Stripe Summer 2027 SWE Internship Application',
    courseOrOrg: 'Stripe Campus Recruiting',
    dueDate: '2026-10-15',
    dueTime: '11:59 PM',
    status: 'pending',
    priority: 'medium',
    sourceEmailId: 'email-3',
    notes: 'Submit resume and coding portfolio before priority deadline closes.',
  },
  {
    id: 'asg-5',
    title: 'Student Health Insurance Waiver Petition',
    courseOrOrg: 'University Health Services',
    dueDate: '2026-10-25',
    dueTime: '5:00 PM',
    status: 'pending',
    priority: 'low',
    sourceEmailId: 'email-6',
    notes: 'Upload front/back copy of private insurance card to waive $1,420 fee.',
  },
];

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

  const [assignments, setAssignments] = useState<Assignment[]>(INITIAL_ASSIGNMENTS);
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    try {
      const saved = localStorage.getItem('deadline_agent_user');
      return saved ? JSON.parse(saved) : null;
    } catch {
      return null;
    }
  });
  const [authModalOpen, setAuthModalOpen] = useState<boolean>(false);
  const [authModalMode, setAuthModalMode] = useState<'login' | 'signup'>('login');

  // Theme Mode: 'light' or 'dark' (User Request: add dark mode and light mode)
  const [theme, setTheme] = useState<'light' | 'dark'>(() => {
    try {
      const savedTheme = localStorage.getItem('deadline_agent_theme');
      if (savedTheme === 'dark' || savedTheme === 'light') return savedTheme;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    } catch {
      return 'light';
    }
  });

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
    localStorage.setItem('deadline_agent_theme', theme);
  }, [theme]);

  const handleToggleTheme = () => {
    setTheme((prev) => (prev === 'light' ? 'dark' : 'light'));
  };

  // Supabase Backend Integration State
  const [supabaseModalOpen, setSupabaseModalOpen] = useState<boolean>(false);
  const [supabaseStatus, setSupabaseStatus] = useState<SupabaseHealthStatus | null>(null);
  const [isCheckingSupabase, setIsCheckingSupabase] = useState<boolean>(false);
  const [isSyncingSupabase, setIsSyncingSupabase] = useState<boolean>(false);
  const [supabaseSyncMessage, setSupabaseSyncMessage] = useState<string | null>(null);

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

  // Check Supabase connection on startup and attempt initial pull
  const refreshSupabaseStatus = useCallback(async () => {
    setIsCheckingSupabase(true);
    try {
      const health = await checkSupabaseHealth();
      setSupabaseStatus(health);
      return health;
    } catch (err) {
      console.warn('Supabase check error:', err);
      return null;
    } finally {
      setIsCheckingSupabase(false);
    }
  }, []);

  useEffect(() => {
    let isMounted = true;
    async function initSupabase() {
      const health = await refreshSupabaseStatus();
      if (!isMounted || !health) return;

      // If tables exist in Supabase with data, load them
      if (health.connected && health.emailsTableExists) {
        const { data: dbEmails } = await fetchEmailsFromSupabase();
        if (dbEmails && dbEmails.length > 0 && isMounted) {
          setEmails(dbEmails);
          setLogs((prev) => [
            ...prev,
            {
              id: `log-sb-load-${Date.now()}`,
              timestamp: new Date().toLocaleTimeString(),
              step: 'INFO',
              message: `Connected to Supabase (project: njcszvoakbiktuurrlqm) — loaded ${dbEmails.length} emails from Postgres.`,
            },
          ]);
        }
      }

      if (health.connected && health.calendarTableExists) {
        const { data: dbEvents } = await fetchCalendarEventsFromSupabase();
        if (dbEvents && dbEvents.length > 0 && isMounted) {
          setCalendarEvents(dbEvents);
        }
      }

      if (health.connected && health.assignmentsTableExists) {
        const { data: dbAssignments } = await fetchAssignmentsFromSupabase();
        if (dbAssignments && dbAssignments.length > 0 && isMounted) {
          setAssignments(dbAssignments);
        }
      }

      // Check active Supabase auth session if available
      try {
        const { data: authData } = await supabase.auth.getSession();
        if (authData?.session?.user && isMounted) {
          setCurrentUser({
            id: authData.session.user.id,
            email: authData.session.user.email || '',
            name: authData.session.user.user_metadata?.full_name || authData.session.user.email?.split('@')[0] || 'User',
            role: 'Student / Assignee',
          });
        }
      } catch (authErr) {
        // Safe auth check
      }
    }

    initSupabase();

    return () => {
      isMounted = false;
    };
  }, [refreshSupabaseStatus]);

  // Email update handler during scan
  const handleEmailUpdate = useCallback((emailId: string, updates: Partial<Email>) => {
    setEmails((prevEmails) =>
      prevEmails.map((email) => {
        if (email.id === emailId) {
          const updated = { ...email, ...updates };
          // Asynchronously persist to Supabase
          syncEmailToSupabase(updated);
          return updated;
        }
        return email;
      })
    );
  }, []);

  // Calendar event creation handler during scan
  const handleEventCreate = useCallback((newEvent: CalendarEvent) => {
    setCalendarEvents((prevEvents) => [...prevEvents, newEvent]);
    // Asynchronously persist event to Supabase
    syncCalendarEventToSupabase(newEvent);
  }, []);

  // Log handler
  const handleLog = useCallback((logEntry: LogEntry) => {
    setLogs((prev) => [...prev, logEntry]);
    // Asynchronously save audit log to Supabase
    syncLogToSupabase(logEntry);
  }, []);

  // Manual Push / Seed to Supabase
  const handlePushToSupabase = async () => {
    setIsSyncingSupabase(true);
    setSupabaseSyncMessage(null);
    try {
      const emailsSuccess = await syncEmailsBatchToSupabase(emails);
      const eventsSuccess = await syncCalendarEventsBatchToSupabase(calendarEvents);
      const assignmentsSuccess = await syncAssignmentsBatchToSupabase(assignments, currentUser?.id);
      if (emailsSuccess && eventsSuccess) {
        setSupabaseSyncMessage(`Synced ${emails.length} emails, ${calendarEvents.length} events & ${assignments.length} assignments to Supabase!`);
        handleLog({
          id: `log-sb-push-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          step: 'INFO',
          message: `Synchronized ${emails.length} emails, ${calendarEvents.length} calendar events, and ${assignments.length} assignments to Supabase.`,
        });
        await refreshSupabaseStatus();
      } else {
        setSupabaseSyncMessage('Sync notice: check if SQL schema has been executed in Supabase SQL Editor.');
      }
    } catch (err: any) {
      setSupabaseSyncMessage(`Sync error: ${err?.message || 'Failed to sync'}`);
    } finally {
      setIsSyncingSupabase(false);
    }
  };

  // Manual Pull from Supabase
  const handlePullFromSupabase = async () => {
    setIsSyncingSupabase(true);
    setSupabaseSyncMessage(null);
    try {
      const { data: dbEmails, error: emailErr } = await fetchEmailsFromSupabase();
      const { data: dbEvents, error: eventErr } = await fetchCalendarEventsFromSupabase();
      const { data: dbAssignments } = await fetchAssignmentsFromSupabase();

      if (emailErr || eventErr) {
        setSupabaseSyncMessage(`Pull notice: ${emailErr?.message || eventErr?.message}`);
        return;
      }

      if (dbEmails && dbEmails.length > 0) {
        setEmails(dbEmails);
      }
      if (dbEvents && dbEvents.length > 0) {
        setCalendarEvents(dbEvents);
      }
      if (dbAssignments && dbAssignments.length > 0) {
        setAssignments(dbAssignments);
      }
      setSupabaseSyncMessage(
        `Pulled ${dbEmails?.length || 0} emails, ${dbEvents?.length || 0} events & ${dbAssignments?.length || 0} assignments from Supabase.`
      );
    } catch (err: any) {
      setSupabaseSyncMessage(`Pull error: ${err?.message || 'Failed to pull'}`);
    } finally {
      setIsSyncingSupabase(false);
    }
  };

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

  // Assignment & Task Tracker Handlers
  const handleToggleAssignmentStatus = async (assignmentId: string) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === assignmentId) {
          const nextStatus = a.status === 'completed' ? 'pending' : 'completed';
          const updated: Assignment = {
            ...a,
            status: nextStatus,
            completedAt: nextStatus === 'completed' ? new Date().toISOString() : null,
          };
          syncAssignmentToSupabase(updated, currentUser?.id);
          return updated;
        }
        return a;
      })
    );
  };

  const handleAddAssignment = async (newAssignmentData: Omit<Assignment, 'id'>) => {
    const newAssignment: Assignment = {
      ...newAssignmentData,
      id: `asg-${Date.now()}`,
    };
    setAssignments((prev) => [newAssignment, ...prev]);
    syncAssignmentToSupabase(newAssignment, currentUser?.id);
    handleLog({
      id: `log-asg-add-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      step: 'INFO',
      message: `Assignment "${newAssignment.title}" created and tracked for ${newAssignment.dueDate}.`,
    });
  };

  const handleUpdateAssignment = async (id: string, updates: Partial<Assignment>) => {
    setAssignments((prev) =>
      prev.map((a) => {
        if (a.id === id) {
          const updated: Assignment = { ...a, ...updates };
          syncAssignmentToSupabase(updated, currentUser?.id);
          return updated;
        }
        return a;
      })
    );
  };

  const handleDeleteAssignment = async (id: string) => {
    setAssignments((prev) => prev.filter((a) => a.id !== id));
    deleteAssignmentFromSupabase(id);
  };

  const handleToggleCalendarEventComplete = async (eventId: string) => {
    setCalendarEvents((prev) =>
      prev.map((evt) => {
        if (evt.id === eventId) {
          const updated = { ...evt, isCompleted: !evt.isCompleted };
          syncCalendarEventToSupabase(updated);
          return updated;
        }
        return evt;
      })
    );
  };

  const handleLogout = async () => {
    try {
      await supabase.auth.signOut();
    } catch {
      // safe signout
    }
    localStorage.removeItem('deadline_agent_user');
    setCurrentUser(null);
    handleLog({
      id: `log-logout-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      step: 'INFO',
      message: 'User signed out. Demo sessions remain available.',
    });
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
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
        isSupabaseConnected={supabaseStatus?.connected ?? false}
        isSyncingSupabase={isSyncingSupabase}
        currentUser={currentUser}
        onOpenLogin={() => {
          setAuthModalMode('login');
          setAuthModalOpen(true);
        }}
        onOpenSignup={() => {
          setAuthModalMode('signup');
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        theme={theme}
        onToggleTheme={handleToggleTheme}
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

        {/* Assignments & Student Task Tracker (User Request: Mark assignments as done & update) */}
        <AssignmentManager
          assignments={assignments}
          onToggleStatus={handleToggleAssignmentStatus}
          onAddAssignment={handleAddAssignment}
          onUpdateAssignment={handleUpdateAssignment}
          onDeleteAssignment={handleDeleteAssignment}
          currentUser={currentUser}
          onOpenLogin={() => {
            setAuthModalMode('login');
            setAuthModalOpen(true);
          }}
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

        {/* Bottom: Month Calendar View with Agent-Created Markers & Completion status */}
        <CalendarView
          events={calendarEvents}
          onToggleEventComplete={handleToggleCalendarEventComplete}
        />
      </main>

      {/* Email Detail & Contract Inspector Modal */}
      <EmailDetailModal
        email={selectedEmail}
        onClose={() => setSelectedEmail(null)}
      />

      {/* Supabase Backend Integration Modal */}
      <SupabaseModal
        isOpen={supabaseModalOpen}
        onClose={() => setSupabaseModalOpen(false)}
        status={supabaseStatus}
        isChecking={isCheckingSupabase}
        onCheckStatus={refreshSupabaseStatus}
        onPushToSupabase={handlePushToSupabase}
        onPullFromSupabase={handlePullFromSupabase}
        isSyncing={isSyncingSupabase}
        syncMessage={supabaseSyncMessage}
      />

      {/* Authentication Login / Signup Modal */}
      <AuthModal
        isOpen={authModalOpen}
        mode={authModalMode}
        onClose={() => setAuthModalOpen(false)}
        onSwitchMode={(mode) => setAuthModalMode(mode)}
        onAuthSuccess={(user) => {
          setCurrentUser(user);
          handleLog({
            id: `log-auth-${Date.now()}`,
            timestamp: new Date().toLocaleTimeString(),
            step: 'INFO',
            message: `User ${user.email} signed in successfully. Assignments synced to your profile.`,
          });
        }}
        onLoginSuccess={(user) => {
          setCurrentUser(user);
        }}
      />

      {/* Persistent App Footer with Login/Signup and Supabase Links */}
      <Footer
        currentUser={currentUser}
        onOpenLogin={() => {
          setAuthModalMode('login');
          setAuthModalOpen(true);
        }}
        onOpenSignup={() => {
          setAuthModalMode('signup');
          setAuthModalOpen(true);
        }}
        onLogout={handleLogout}
        onOpenSupabaseModal={() => setSupabaseModalOpen(true)}
      />
    </div>
  );
}

import { createClient, SupabaseClient } from '@supabase/supabase-js';
import { Email, CalendarEvent, LogEntry, Assignment } from './types';

export const SUPABASE_PROJECT_ID = 'njcszvoakbiktuurrlqm';
export const SUPABASE_URL =
  import.meta.env.VITE_SUPABASE_URL || 'https://njcszvoakbiktuurrlqm.supabase.co';
export const SUPABASE_ANON_KEY =
  import.meta.env.VITE_SUPABASE_ANON_KEY ||
  'sb_publishable_Xov4J1rRW8rVAue1NEYCMA_U4yoY5o1';

export const supabase: SupabaseClient = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

export interface SupabaseHealthStatus {
  connected: boolean;
  projectId: string;
  url: string;
  latencyMs?: number;
  emailsTableExists: boolean;
  calendarTableExists: boolean;
  assignmentsTableExists: boolean;
  errorMessage?: string;
  tablesSummary?: {
    emailCount: number;
    eventCount: number;
  };
}

export const SUPABASE_SQL_SCHEMA = `-- Deadline Agent Supabase Schema
-- Run this in your Supabase SQL Editor (Project: ${SUPABASE_PROJECT_ID})

-- 1. Create emails table
CREATE TABLE IF NOT EXISTS emails (
  id TEXT PRIMARY KEY,
  sender TEXT NOT NULL,
  sender_email TEXT NOT NULL,
  subject TEXT NOT NULL,
  snippet TEXT,
  body TEXT NOT NULL,
  received_date TEXT,
  unread BOOLEAN DEFAULT TRUE,
  processed BOOLEAN DEFAULT FALSE,
  status TEXT DEFAULT 'unprocessed',
  result_summary TEXT,
  extracted_data JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  date TEXT NOT NULL,
  time TEXT,
  source_email_id TEXT,
  source_email_subject TEXT,
  is_agent_created BOOLEAN DEFAULT TRUE,
  category TEXT DEFAULT 'general',
  is_completed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Create assignments table
CREATE TABLE IF NOT EXISTS assignments (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  course_or_org TEXT NOT NULL,
  due_date TEXT NOT NULL,
  due_time TEXT,
  status TEXT DEFAULT 'pending',
  completed_at TIMESTAMPTZ,
  source_email_id TEXT,
  notes TEXT,
  priority TEXT DEFAULT 'medium',
  user_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. Create agent_logs table (optional activity persistence)
CREATE TABLE IF NOT EXISTS agent_logs (
  id TEXT PRIMARY KEY,
  timestamp TEXT NOT NULL,
  step TEXT NOT NULL,
  message TEXT NOT NULL,
  detail TEXT,
  email_id TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Enable Row Level Security (RLS) & allow anonymous public read/write access
ALTER TABLE emails ENABLE ROW LEVEL SECURITY;
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE assignments ENABLE ROW LEVEL SECURITY;
ALTER TABLE agent_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Allow public all on emails" ON emails FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on calendar_events" ON calendar_events FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on assignments" ON assignments FOR ALL TO anon USING (true) WITH CHECK (true);
CREATE POLICY "Allow public all on agent_logs" ON agent_logs FOR ALL TO anon USING (true) WITH CHECK (true);
`;

/**
 * Checks connection to the Supabase backend and tests if the tables exist.
 */
export async function checkSupabaseHealth(): Promise<SupabaseHealthStatus> {
  const startTime = performance.now();
  try {
    // 1. Try pinging the emails table
    const { data: emailData, error: emailError } = await supabase
      .from('emails')
      .select('id', { count: 'exact', head: true });

    // 2. Try pinging the calendar_events table
    const { data: eventData, error: eventError } = await supabase
      .from('calendar_events')
      .select('id', { count: 'exact', head: true });

    // 3. Try pinging the assignments table
    const { data: assignmentData, error: assignmentError } = await supabase
      .from('assignments')
      .select('id', { count: 'exact', head: true });

    const latencyMs = Math.round(performance.now() - startTime);

    const emailsTableExists = !emailError || (emailError.code !== 'PGRST204' && !emailError.message?.includes('does not exist'));
    const calendarTableExists = !eventError || (eventError.code !== 'PGRST204' && !eventError.message?.includes('does not exist'));
    const assignmentsTableExists = !assignmentError || (assignmentError.code !== 'PGRST204' && !assignmentError.message?.includes('does not exist'));

    return {
      connected: true,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      latencyMs,
      emailsTableExists,
      calendarTableExists,
      assignmentsTableExists,
      tablesSummary: {
        emailCount: emailData?.length ?? 0,
        eventCount: eventData?.length ?? 0,
      },
      errorMessage: emailError && emailError.message.includes('does not exist')
        ? 'Tables not yet initialized in Supabase. You can create them with the SQL schema.'
        : emailError?.message,
    };
  } catch (err: any) {
    return {
      connected: false,
      projectId: SUPABASE_PROJECT_ID,
      url: SUPABASE_URL,
      emailsTableExists: false,
      calendarTableExists: false,
      assignmentsTableExists: false,
      errorMessage: err?.message || 'Failed to reach Supabase backend',
    };
  }
}

/**
 * Transforms local Email object to Supabase database row format.
 */
function emailToRow(email: Email) {
  return {
    id: email.id,
    sender: email.sender,
    sender_email: email.senderEmail,
    subject: email.subject,
    snippet: email.snippet,
    body: email.body,
    received_date: email.receivedDate,
    unread: email.unread,
    processed: email.processed,
    status: email.status,
    result_summary: email.resultSummary || null,
    extracted_data: email.extractedData || null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Transforms Supabase database row format to local Email object.
 */
function rowToEmail(row: any): Email {
  return {
    id: row.id,
    sender: row.sender,
    senderEmail: row.sender_email || row.senderEmail || '',
    subject: row.subject,
    snippet: row.snippet || '',
    body: row.body || '',
    receivedDate: row.received_date || row.receivedDate || '',
    unread: row.unread ?? false,
    processed: row.processed ?? false,
    status: row.status || 'unprocessed',
    resultSummary: row.result_summary || row.resultSummary,
    extractedData: row.extracted_data || row.extractedData,
  };
}

/**
 * Transforms local CalendarEvent to Supabase row format.
 */
function calendarEventToRow(event: CalendarEvent) {
  return {
    id: event.id,
    title: event.title,
    date: event.date,
    time: event.time || null,
    source_email_id: event.sourceEmailId || null,
    source_email_subject: event.sourceEmailSubject || null,
    is_agent_created: event.isAgentCreated ?? true,
    category: event.category || 'general',
    is_completed: event.isCompleted ?? false,
    created_at: event.createdAt || new Date().toISOString(),
  };
}

/**
 * Transforms Supabase row format to local CalendarEvent.
 */
function rowToCalendarEvent(row: any): CalendarEvent {
  return {
    id: row.id,
    title: row.title,
    date: row.date,
    time: row.time,
    sourceEmailId: row.source_email_id || row.sourceEmailId,
    sourceEmailSubject: row.source_email_subject || row.sourceEmailSubject,
    isAgentCreated: row.is_agent_created ?? row.isAgentCreated ?? true,
    category: row.category || 'general',
    isCompleted: row.is_completed ?? row.isCompleted ?? false,
    createdAt: row.created_at || row.createdAt,
  };
}

/**
 * Fetches all emails from Supabase.
 */
export async function fetchEmailsFromSupabase(): Promise<{ data: Email[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('emails')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    if (data && data.length > 0) {
      return { data: data.map(rowToEmail), error: null };
    }
    return { data: [], error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Fetches all calendar events from Supabase.
 */
export async function fetchCalendarEventsFromSupabase(): Promise<{ data: CalendarEvent[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('calendar_events')
      .select('*')
      .order('date', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    if (data && data.length > 0) {
      return { data: data.map(rowToCalendarEvent), error: null };
    }
    return { data: [], error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Upserts a single email to Supabase.
 */
export async function syncEmailToSupabase(email: Email): Promise<boolean> {
  try {
    const row = emailToRow(email);
    const { error } = await supabase.from('emails').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase syncEmail error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to sync email to Supabase:', err);
    return false;
  }
}

/**
 * Bulk upserts emails into Supabase.
 */
export async function syncEmailsBatchToSupabase(emails: Email[]): Promise<boolean> {
  try {
    const rows = emails.map(emailToRow);
    const { error } = await supabase.from('emails').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase bulk syncEmails error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to bulk sync emails to Supabase:', err);
    return false;
  }
}

/**
 * Upserts a calendar event to Supabase.
 */
export async function syncCalendarEventToSupabase(event: CalendarEvent): Promise<boolean> {
  try {
    const row = calendarEventToRow(event);
    const { error } = await supabase.from('calendar_events').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase syncCalendarEvent error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to sync calendar event to Supabase:', err);
    return false;
  }
}

/**
 * Bulk upserts calendar events into Supabase.
 */
export async function syncCalendarEventsBatchToSupabase(events: CalendarEvent[]): Promise<boolean> {
  try {
    const rows = events.map(calendarEventToRow);
    const { error } = await supabase.from('calendar_events').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase bulk syncCalendarEvents error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to bulk sync calendar events to Supabase:', err);
    return false;
  }
}

/**
 * Stores an agent execution log entry in Supabase agent_logs table.
 */
export async function syncLogToSupabase(log: LogEntry): Promise<void> {
  try {
    await supabase.from('agent_logs').insert({
      id: log.id,
      timestamp: log.timestamp,
      step: log.step,
      message: log.message,
      detail: log.detail || null,
      email_id: log.emailId || null,
    });
  } catch (err) {
    // Non-blocking log persistence
  }
}

/**
 * Transforms Assignment to Supabase row format.
 */
function assignmentToRow(assignment: Assignment, userId?: string) {
  return {
    id: assignment.id,
    title: assignment.title,
    course_or_org: assignment.courseOrOrg,
    due_date: assignment.dueDate,
    due_time: assignment.dueTime || null,
    status: assignment.status,
    completed_at: assignment.completedAt || null,
    source_email_id: assignment.sourceEmailId || null,
    notes: assignment.notes || null,
    priority: assignment.priority || 'medium',
    user_id: userId || null,
    updated_at: new Date().toISOString(),
  };
}

/**
 * Transforms Supabase row to Assignment.
 */
function rowToAssignment(row: any): Assignment {
  return {
    id: row.id,
    title: row.title,
    courseOrOrg: row.course_or_org || row.courseOrOrg || 'General',
    dueDate: row.due_date || row.dueDate,
    dueTime: row.due_time || row.dueTime,
    status: row.status || (row.completed_at ? 'completed' : 'pending'),
    completedAt: row.completed_at || row.completedAt,
    sourceEmailId: row.source_email_id || row.sourceEmailId,
    notes: row.notes,
    priority: row.priority || 'medium',
  };
}

/**
 * Fetches assignments from Supabase.
 */
export async function fetchAssignmentsFromSupabase(): Promise<{ data: Assignment[] | null; error: any }> {
  try {
    const { data, error } = await supabase
      .from('assignments')
      .select('*')
      .order('due_date', { ascending: true });

    if (error) {
      return { data: null, error };
    }

    if (data && data.length > 0) {
      return { data: data.map(rowToAssignment), error: null };
    }
    return { data: [], error: null };
  } catch (err) {
    return { data: null, error: err };
  }
}

/**
 * Syncs single assignment to Supabase.
 */
export async function syncAssignmentToSupabase(assignment: Assignment, userId?: string): Promise<boolean> {
  try {
    const row = assignmentToRow(assignment, userId);
    const { error } = await supabase.from('assignments').upsert(row, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase syncAssignment error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to sync assignment to Supabase:', err);
    return false;
  }
}

/**
 * Bulk syncs assignments to Supabase.
 */
export async function syncAssignmentsBatchToSupabase(assignments: Assignment[], userId?: string): Promise<boolean> {
  try {
    const rows = assignments.map((a) => assignmentToRow(a, userId));
    const { error } = await supabase.from('assignments').upsert(rows, { onConflict: 'id' });
    if (error) {
      console.warn('Supabase bulk syncAssignments error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to bulk sync assignments to Supabase:', err);
    return false;
  }
}

/**
 * Deletes an assignment from Supabase.
 */
export async function deleteAssignmentFromSupabase(id: string): Promise<boolean> {
  try {
    const { error } = await supabase.from('assignments').delete().eq('id', id);
    if (error) {
      console.warn('Supabase deleteAssignment error:', error.message);
      return false;
    }
    return true;
  } catch (err) {
    console.warn('Failed to delete assignment from Supabase:', err);
    return false;
  }
}

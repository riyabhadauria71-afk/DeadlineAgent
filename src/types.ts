export interface DeadlineExtractionResult {
  has_deadline: boolean;
  title: string;
  date: string; // "YYYY-MM-DD"
  time: string | null;
  confidence: 'high' | 'low';
  notes?: string;
}

export type EmailStatus =
  | 'unprocessed'
  | 'processing'
  | 'event_created'
  | 'duplicate_skipped'
  | 'needs_review'
  | 'failed';

export interface Email {
  id: string;
  sender: string;
  senderEmail: string;
  subject: string;
  snippet: string;
  body: string;
  receivedDate: string;
  unread: boolean;
  processed: boolean;
  status: EmailStatus;
  resultSummary?: string;
  extractedData?: DeadlineExtractionResult | null;
}

export interface CalendarEvent {
  id: string;
  title: string;
  date: string; // YYYY-MM-DD
  time: string | null;
  sourceEmailId: string | null;
  sourceEmailSubject?: string;
  isAgentCreated: boolean;
  category?: 'academic' | 'finance' | 'career' | 'personal' | 'general';
  createdAt?: string;
}

export type LogStepType =
  | 'INFO'
  | 'READ'
  | 'EXTRACT'
  | 'FOUND'
  | 'CHECK'
  | 'DUPLICATE'
  | 'CREATE'
  | 'FLAG'
  | 'RETRY'
  | 'FAIL'
  | 'GUARDRAIL'
  | 'COMPLETE';

export interface LogEntry {
  id: string;
  timestamp: string;
  step: LogStepType;
  message: string;
  detail?: string;
  emailId?: string;
}

export interface RunStats {
  emailsScanned: number;
  eventsCreated: number;
  duplicatesSkipped: number;
  flaggedForReview: number;
  failures: number;
  totalEmails: number;
  processedCount: number;
}

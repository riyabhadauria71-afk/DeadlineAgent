/**
 * agentRunner.js
 * 
 * Standalone Deadline Agent loop and extraction logic.
 * Decoupled from the UI to ensure deterministic testing, pure logic separation,
 * and seamless drop-in replacement with Gemini API or external intelligence.
 */

export const HARD_CAP = 20;
export const MAX_RETRIES = 1; // Agent retries once on failure, never more than 2 attempts total

/**
 * Normalizes title strings for fuzzy matching and deduplication.
 */
export function normalizeTitle(title) {
  if (!title) return '';
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/**
 * Checks if two titles describe the same deadline intent.
 */
export function areTitlesEquivalent(titleA, titleB) {
  const normA = normalizeTitle(titleA);
  const normB = normalizeTitle(titleB);
  if (normA === normB) return true;

  // Check key signature keywords
  const keywords = ['tuition', 'fee', 'assignment 3', 'cs 380', 'internship', 'gala', 'health insurance', 'grfp', 'nsf', 'career fair'];
  for (const kw of keywords) {
    if (normA.includes(kw) && normB.includes(kw)) {
      return true;
    }
  }

  // Token jaccard similarity
  const tokensA = new Set(normA.split(' ').filter(w => w.length > 2));
  const tokensB = new Set(normB.split(' ').filter(w => w.length > 2));
  if (tokensA.size === 0 || tokensB.size === 0) return false;

  let intersection = 0;
  tokensA.forEach(t => {
    if (tokensB.has(t)) intersection++;
  });
  const similarity = intersection / Math.min(tokensA.size, tokensB.size);
  return similarity >= 0.6;
}

/**
 * Idempotency Check:
 * Checks existing calendar events for a matching source email ID or near-identical title + date.
 * 
 * @param {Object} candidate - { title, date, sourceEmailId }
 * @param {Array} existingEvents - List of calendar events
 * @returns {{ isDuplicate: boolean, matchedEvent?: Object, reason?: string }}
 */
export function checkCalendarDuplicate(candidate, existingEvents) {
  if (!candidate || !candidate.date) {
    return { isDuplicate: false };
  }

  for (const event of existingEvents) {
    // Check direct source email ID duplicate
    if (candidate.sourceEmailId && event.sourceEmailId === candidate.sourceEmailId) {
      return {
        isDuplicate: true,
        matchedEvent: event,
        reason: `Matched existing event with source email ID "${candidate.sourceEmailId}"`
      };
    }

    // Check same date and equivalent title
    if (event.date === candidate.date && areTitlesEquivalent(event.title, candidate.title)) {
      return {
        isDuplicate: true,
        matchedEvent: event,
        reason: `Existing event "${event.title}" on ${event.date} matches candidate "${candidate.title}"`
      };
    }
  }

  return { isDuplicate: false };
}

// ============================================================================
// SWAP POINT: replace mock logic below with a Gemini API call using this
// same input/output contract:
// Input: emailText (string)
// Output: Promise<{
//   has_deadline: boolean,
//   title: string,
//   date: "YYYY-MM-DD",
//   time: string | null,
//   confidence: "high" | "low",
//   notes?: string
// }>
// ============================================================================
export async function extractDeadline(emailText) {
  if (!emailText || typeof emailText !== 'string') {
    return {
      has_deadline: false,
      title: '',
      date: '',
      time: null,
      confidence: 'high',
      notes: 'Empty input text'
    };
  }

  const lower = emailText.toLowerCase();

  // 1. Detect ambiguous/vague date references with low confidence (Needs manual review)
  const vaguePhrases = [
    'sometime next week',
    'sometime next month',
    'tentatively towards',
    'catch up sometime',
    'end of next month or early',
    'maybe next week',
    'maybe the following week',
    'tentatively aiming'
  ];

  for (const phrase of vaguePhrases) {
    if (lower.includes(phrase)) {
      // Check if there's no concrete exact calendar date
      const hasSpecificDatePattern = /(?:january|february|march|april|may|june|july|august|september|october|november|december|oct|nov|dec)\s+\d{1,2}(?:st|nd|rd|th)?,\s*202\d/i.test(emailText);
      if (!hasSpecificDatePattern) {
        let extractedTitle = 'Ambiguous discussion / catchup';
        if (lower.includes('coffee')) extractedTitle = 'Coffee chat follow-up';
        else if (lower.includes('roadmap') || lower.includes('okr')) extractedTitle = 'Q4 Roadmap Milestone Review';

        return {
          has_deadline: true,
          title: extractedTitle,
          date: '',
          time: null,
          confidence: 'low',
          notes: `Vague timing identified ("${phrase}"). Exact calendar date unspecified.`
        };
      }
    }
  }

  // 2. Check for clear deadline signals
  const deadlineKeywords = [
    'deadline',
    'due date',
    'due on',
    'due by',
    'submit by',
    'submission deadline',
    'closes on',
    'closes',
    'payment deadline',
    'rsvp by',
    'rsvp deadline',
    'waiver deadline',
    'pre-registration closes'
  ];

  const hasDeadlineKeyword = deadlineKeywords.some(kw => lower.includes(kw));

  // If no deadline keyword found and no clear "due" signal, return no deadline
  if (!hasDeadlineKeyword && !lower.includes('due') && !lower.includes('rsvp')) {
    return {
      has_deadline: false,
      title: '',
      date: '',
      time: null,
      confidence: 'high',
      notes: 'No deadline keywords detected in message body.'
    };
  }

  // 3. Extract Date: e.g. "October 5, 2026", "Oct 12, 2026", "October 28, 2026"
  const dateRegex = /(?:(January|February|March|April|May|June|July|August|September|October|November|December|Jan|Feb|Mar|Apr|May|Jun|Jul|Aug|Sep|Sept|Oct|Nov|Dec)[.\s]+(\d{1,2})(?:st|nd|rd|th)?(?:,)?\s+(\d{4}))/i;
  const dateMatch = emailText.match(dateRegex);

  let formattedDate = '';
  if (dateMatch) {
    const rawMonth = dateMatch[1].toLowerCase();
    const day = parseInt(dateMatch[2], 10);
    const year = dateMatch[3];

    const monthsMap = {
      jan: '01', january: '01',
      feb: '02', february: '02',
      mar: '03', march: '03',
      apr: '04', april: '04',
      may: '05',
      jun: '06', june: '06',
      jul: '07', july: '07',
      aug: '08', august: '08',
      sep: '09', sept: '09', september: '09',
      oct: '10', october: '10',
      nov: '11', november: '11',
      dec: '12', december: '12'
    };

    const monthNum = monthsMap[rawMonth.slice(0, 3)] || '10';
    const dayStr = day < 10 ? `0${day}` : `${day}`;
    formattedDate = `${year}-${monthNum}-${dayStr}`;
  }

  // 4. Extract Time: e.g. "5:00 PM", "11:59 PM", "6:00 PM", "5:00 PM EST"
  const timeRegex = /\b(\d{1,2}(?::\d{2})?\s*(?:AM|PM|am|pm))\b/;
  const timeMatch = emailText.match(timeRegex);
  const formattedTime = timeMatch ? timeMatch[1].toUpperCase() : null;

  // 5. Extract Title based on context
  let extractedTitle = 'Deadline';
  if (lower.includes('tuition') || lower.includes('bursar') || lower.includes('fee payment')) {
    extractedTitle = 'Fall 2026 Tuition & Fee Payment';
  } else if (lower.includes('assignment 3') || lower.includes('cs 380')) {
    extractedTitle = 'CS 380: Assignment 3 Submission';
  } else if (lower.includes('stripe') || lower.includes('internship')) {
    extractedTitle = 'Stripe 2027 SWE Internship Deadline';
  } else if (lower.includes('gala') || lower.includes('tech innovators')) {
    extractedTitle = 'Tech Innovators Gala RSVP';
  } else if (lower.includes('health insurance') || lower.includes('waiver')) {
    extractedTitle = 'Student Health Insurance Waiver';
  } else if (lower.includes('nsf') || lower.includes('fellowship') || lower.includes('grfp')) {
    extractedTitle = 'NSF GRFP Fellowship Application';
  } else if (lower.includes('career fair') || lower.includes('pre-registration')) {
    extractedTitle = 'Tech Career Fair Pre-Registration';
  } else {
    // Derive from first subject line or header
    const firstLine = emailText.split('\n')[0].replace(/^(subject|re|fwd):\s*/i, '').trim();
    if (firstLine && firstLine.length > 5 && firstLine.length < 50) {
      extractedTitle = firstLine;
    }
  }

  if (formattedDate) {
    return {
      has_deadline: true,
      title: extractedTitle,
      date: formattedDate,
      time: formattedTime,
      confidence: 'high',
      notes: `Concrete date found: ${formattedDate}${formattedTime ? ` at ${formattedTime}` : ''}`
    };
  }

  // Found deadline keywords but could not parse a date -> flag for manual review
  return {
    has_deadline: true,
    title: extractedTitle,
    date: '',
    time: null,
    confidence: 'low',
    notes: 'Deadline keyword detected but specific calendar date could not be parsed with high certainty.'
  };
}

/**
 * Execute the agent loop on a collection of emails.
 * 
 * Guardrails enforced:
 * 1. Hard Cap: At most HARD_CAP (20) emails scanned per run.
 * 2. Idempotency: Duplicate check against existing calendar events & sourceEmailId.
 * 3. State Locking: Once processed (created, skipped, or flagged), marked processed so re-runs never repeat.
 * 4. Loop Prevention & Retry Cap: Simulate failure retries at most 1 time per email (max 2 attempts),
 *    then logs failure and marks processed, completely avoiding infinite loops.
 */
export async function executeAgentScan({
  emails,
  existingCalendarEvents,
  simulateFailure = false,
  stepDelayMs = 650,
  shouldStop = () => false,
  onLog,
  onEmailUpdate,
  onEventCreate,
}) {
  const log = (step, message, detail = '', emailId = null) => {
    if (onLog) {
      onLog({
        id: `log-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        timestamp: new Date().toLocaleTimeString(),
        step,
        message,
        detail,
        emailId,
      });
    }
  };

  const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

  log('INFO', 'Starting Deadline Agent scan sequence...');
  log('GUARDRAIL', `Active Guardrails: Hard Cap = ${HARD_CAP} emails, Max Retries = ${MAX_RETRIES}, Idempotency Deduplication = ENABLED.`);

  // Filter for unprocessed emails
  const unprocessedEmails = emails.filter((e) => !e.processed);
  const alreadyProcessedCount = emails.length - unprocessedEmails.length;

  if (alreadyProcessedCount > 0) {
    log('INFO', `Skipping ${alreadyProcessedCount} previously processed email(s) via idempotency state guard.`);
  }

  if (unprocessedEmails.length === 0) {
    log('COMPLETE', 'All emails in the inbox have already been processed. Nothing to do.');
    return {
      emailsScanned: 0,
      eventsCreated: 0,
      duplicatesSkipped: 0,
      flaggedForReview: 0,
      failures: 0,
      limitReached: false,
      unprocessedRemaining: 0,
    };
  }

  // Guardrail 1: Hard Cap of 20 emails
  const emailsToProcess = unprocessedEmails.slice(0, HARD_CAP);
  const excessCount = unprocessedEmails.length - emailsToProcess.length;

  let scannedCount = 0;
  let createdCount = 0;
  let duplicateCount = 0;
  let flaggedCount = 0;
  let failureCount = 0;

  // Local mirror of calendar events during this run to catch duplicates created in the same batch
  let currentCalendarEvents = [...existingCalendarEvents];

  for (let i = 0; i < emailsToProcess.length; i++) {
    if (shouldStop()) {
      log('INFO', 'Scan aborted by user.');
      break;
    }

    const email = emailsToProcess[i];
    scannedCount++;
    const progressLabel = `(${i + 1}/${emailsToProcess.length})`;

    log('READ', `Reading email ${progressLabel}: "${email.subject}" from ${email.sender}...`, '', email.id);
    onEmailUpdate(email.id, { status: 'processing' });
    await sleep(stepDelayMs);

    if (shouldStop()) break;

    // Guardrail 4: Retry mechanism with hard limit of MAX_RETRIES (1 retry, 2 attempts max)
    let attempts = 0;
    let extractionSuccess = false;
    let extractionResult = null;

    // Simulate failure logic: if simulateFailure is enabled, fail the 4th and 8th email or random ~25%
    const shouldSimulateFailThisEmail = simulateFailure && (i === 3 || i === 7 || Math.random() < 0.25);

    while (attempts <= MAX_RETRIES && !extractionSuccess) {
      attempts++;
      log('EXTRACT', attempts === 1 ? `Extracting deadline...` : `Retrying extraction (attempt ${attempts}/${MAX_RETRIES + 1})...`, '', email.id);
      await sleep(stepDelayMs * 0.8);

      if (shouldSimulateFailThisEmail && attempts <= MAX_RETRIES) {
        log('RETRY', `[Simulated Failure] Extraction worker timed out or encountered parsing glitch. Triggering auto-retry (1 attempt allowed)...`, '', email.id);
        await sleep(stepDelayMs);
        // Continue to attempt 2
        continue;
      } else if (shouldSimulateFailThisEmail && attempts > MAX_RETRIES) {
        // Exceeded retries!
        log('FAIL', `Extraction failed after ${attempts} attempts. Guardrail triggered: marking email as processed to prevent infinite loops.`, '', email.id);
        failureCount++;
        onEmailUpdate(email.id, {
          status: 'failed',
          processed: true,
          resultSummary: 'Failed extraction (retries exceeded safe cap)',
        });
        await sleep(stepDelayMs * 0.5);
        break;
      }

      // Normal extraction
      try {
        extractionResult = await extractDeadline(`${email.subject}\n\n${email.body}`);
        extractionSuccess = true;
      } catch (err) {
        if (attempts <= MAX_RETRIES) {
          log('RETRY', `Encountered unexpected error: ${err.message}. Retrying once...`, '', email.id);
          await sleep(stepDelayMs);
        } else {
          log('FAIL', `Extraction permanently failed: ${err.message}. Guardrail: marking email processed.`, '', email.id);
          failureCount++;
          onEmailUpdate(email.id, {
            status: 'failed',
            processed: true,
            resultSummary: `Error: ${err.message}`,
          });
          break;
        }
      }
    }

    if (!extractionSuccess || !extractionResult) {
      continue;
    }

    // Step 3: Handle extraction results
    if (!extractionResult.has_deadline) {
      log('INFO', `No deadline found in email "${email.subject}". Marking as processed.`, extractionResult.notes, email.id);
      onEmailUpdate(email.id, {
        status: 'unprocessed', // marked processed below
        processed: true,
        resultSummary: 'No deadline present (newsletter or casual message)',
        extractedData: extractionResult,
      });
      await sleep(stepDelayMs * 0.6);
      continue;
    }

    // Confidence check: If confidence is 'low', skip creating event & flag in UI as "Needs manual review"
    if (extractionResult.confidence === 'low' || !extractionResult.date) {
      log('FLAG', `Deadline detected with LOW confidence: "${extractionResult.title}" — flagged for manual review.`, extractionResult.notes, email.id);
      flaggedCount++;
      onEmailUpdate(email.id, {
        status: 'needs_review',
        processed: true,
        resultSummary: extractionResult.notes || 'Vague date; flagged for manual review',
        extractedData: extractionResult,
      });
      await sleep(stepDelayMs * 0.7);
      continue;
    }

    // High confidence deadline found!
    const dateFormatted = extractionResult.date;
    const timeFormatted = extractionResult.time ? ` at ${extractionResult.time}` : '';
    log('FOUND', `Found deadline: ${dateFormatted}${timeFormatted} ("${extractionResult.title}") — checking calendar for duplicates...`, '', email.id);
    await sleep(stepDelayMs * 0.7);

    // Guardrail 2: Idempotency & Duplicate Check
    const candidateEvent = {
      title: extractionResult.title,
      date: extractionResult.date,
      time: extractionResult.time,
      sourceEmailId: email.id,
    };

    const duplicateCheck = checkCalendarDuplicate(candidateEvent, currentCalendarEvents);

    if (duplicateCheck.isDuplicate) {
      log('DUPLICATE', `Duplicate detected — skipped! (${duplicateCheck.reason})`, '', email.id);
      duplicateCount++;
      onEmailUpdate(email.id, {
        status: 'duplicate_skipped',
        processed: true,
        resultSummary: `Duplicate skipped: already scheduled as "${duplicateCheck.matchedEvent.title}" on ${duplicateCheck.matchedEvent.date}`,
        extractedData: extractionResult,
      });
      await sleep(stepDelayMs * 0.7);
    } else {
      // Create new event
      log('CREATE', `No duplicate found — creating calendar event for ${dateFormatted}...`, '', email.id);
      const newEvent = {
        id: `evt-agent-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
        title: extractionResult.title,
        date: extractionResult.date,
        time: extractionResult.time,
        sourceEmailId: email.id,
        sourceEmailSubject: email.subject,
        isAgentCreated: true,
        createdAt: new Date().toISOString(),
      };

      currentCalendarEvents.push(newEvent);
      onEventCreate(newEvent);
      createdCount++;

      log('INFO', `Marking email as processed.`, '', email.id);
      onEmailUpdate(email.id, {
        status: 'event_created',
        processed: true,
        resultSummary: `Event created: "${newEvent.title}" on ${newEvent.date}`,
        extractedData: extractionResult,
      });
      await sleep(stepDelayMs * 0.7);
    }
  }

  // Guardrail 1 check for hard cap excess
  if (excessCount > 0) {
    log('GUARDRAIL', `Run limit reached — ${excessCount} emails left unprocessed (Hard Cap: ${HARD_CAP} per run).`);
  }

  log('COMPLETE', `Scan finished! Scanned: ${scannedCount} | Events created: ${createdCount} | Duplicates skipped: ${duplicateCount} | Flagged: ${flaggedCount} | Failures: ${failureCount}`);

  return {
    emailsScanned: scannedCount,
    eventsCreated: createdCount,
    duplicatesSkipped: duplicateCount,
    flaggedForReview: flaggedCount,
    failures: failureCount,
    limitReached: excessCount > 0,
    unprocessedRemaining: excessCount,
  };
}

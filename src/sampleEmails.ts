import { Email, CalendarEvent } from './types';

export const INITIAL_CALENDAR_EVENTS: CalendarEvent[] = [
  {
    id: 'evt-existing-1',
    title: 'Department All-Hands & Strategy Sync',
    date: '2026-10-08',
    time: '10:00 AM',
    sourceEmailId: null,
    isAgentCreated: false,
    category: 'academic',
  },
  {
    id: 'evt-existing-2',
    title: 'Routine Dental Cleaning & Checkup',
    date: '2026-10-19',
    time: '2:30 PM',
    sourceEmailId: null,
    isAgentCreated: false,
    category: 'personal',
  },
];

export const INITIAL_EMAILS: Email[] = [
  {
    id: 'email-1',
    sender: 'Office of the Bursar',
    senderEmail: 'bursar@university.edu',
    subject: 'Fall 2026 Tuition & Comprehensive Fee Payment Deadline',
    snippet: 'This is an official notice that all tuition and student fee balances must be paid in full by October 5, 2026 by 5:00 PM EST...',
    body: `Dear Student,

Please be advised that your statement for the Fall 2026 academic semester is now available online. 

DEADLINE NOTICE:
All tuition and mandatory university fees must be settled in full or placed on an approved installment payment plan by October 5, 2026 at 5:00 PM. Failure to clear your balance prior to this deadline may result in a $150 late fee and a registrar hold on spring course enrollment.

Payment portal: https://pay.university.edu/student-accounts

Sincerely,
Office of the Bursar
Financial Administration Building, Room 204`,
    receivedDate: 'Sep 14, 2026',
    unread: true,
    processed: false,
    status: 'unprocessed',
  },
  {
    id: 'email-2',
    sender: 'Prof. David Kahan (CS 380)',
    senderEmail: 'dkahan@cs.university.edu',
    subject: 'CS 380: Assignment 3 (Transformer Architecture) Due Date',
    snippet: 'Assignment 3 has been posted to Gradescope. The final submission deadline is October 12, 2026 at 11:59 PM sharp...',
    body: `Hello CS 380 students,

Assignment 3: Implementing a Decoder-Only Transformer from scratch is now live on the course GitHub repository and Gradescope.

Important Details:
- Due date: October 12, 2026 at 11:59 PM.
- Late policy: 10% penalty per 24 hours, up to a maximum of 48 hours.
- Office hours are scheduled this Wednesday and Friday from 3:00 PM - 5:00 PM in CSB 320.

Please submit your jupyter notebooks and writeup as a zip archive directly through Gradescope.

Best regards,
Prof. Kahan`,
    receivedDate: 'Sep 15, 2026',
    unread: true,
    processed: false,
    status: 'unprocessed',
  },
  {
    id: 'email-3',
    sender: 'Stripe University Recruiting',
    senderEmail: 'early-talent@stripe.com',
    subject: 'Summer 2027 Software Engineering Internship Applications Closing',
    snippet: 'Thank you for your interest in Stripe! Just a reminder that our early application portal closes on October 15, 2026...',
    body: `Hi there!

We wanted to send a quick reminder regarding Stripe's Summer 2027 Software Engineering Internship program.

Our priority consideration application window closes on October 15, 2026 at 11:59 PM PST. Applications received after this date will be reviewed only on a rolling, space-available basis.

If you have already started your application, please ensure your resume, coding sample, and transcript are uploaded before the cutoff date:
https://stripe.com/jobs/university/swe-intern-2027

We look forward to reviewing your materials!
The Stripe Campus Recruiting Team`,
    receivedDate: 'Sep 15, 2026',
    unread: false,
    processed: false,
    status: 'unprocessed',
  },
  {
    id: 'email-4',
    sender: 'Tech Innovators Guild',
    senderEmail: 'events@techguild.org',
    subject: 'Annual Alumni & Industry Gala: RSVP Deadline Approaching',
    snippet: 'Catering and venue numbers must be locked in next month. Please RSVP by October 20, 2026 to guarantee your banquet seat...',
    body: `Dear Tech Guild Members & Guests,

We are thrilled to invite you to our 2026 Annual Autumn Gala held at the Grand Waterfront Pavilion.

Because this is a seated three-course dinner, our caterer requires confirmed headcount in advance. 
RSVP deadline: October 20, 2026.
Event date: November 7, 2026 at 6:30 PM.

Please indicate dietary restrictions and guest names on the response form:
https://techguild.org/rsvp-gala-2026

Warm regards,
Event Coordinating Committee`,
    receivedDate: 'Sep 16, 2026',
    unread: true,
    processed: false,
    status: 'unprocessed',
  },
  {
    id: 'email-5',
    sender: 'Student Accounts Notification',
    senderEmail: 'notifications@studentbilling.university.edu',
    subject: 'Urgent: Fall 2026 Tuition Fee Payment Due Oct 5',
    snippet: 'Automatic billing alert: Please remember that fall semester tuition must be settled by October 5, 2026...',
    body: `*** AUTOMATED NOTIFICATION ***

Student ID: #94820194
Subject: Fall 2026 Tuition and Fee Payment Deadline

This is a courtesy automated notification from the Central Student Billing system. Outstanding charges on your account are scheduled for final collection. 

Payment Deadline: October 5, 2026 by 5:00 PM.
Amount Due: $4,850.00

If payment has already been remitted through your bank or wire transfer within the last 48 hours, please disregard this notice.`,
    receivedDate: 'Sep 16, 2026',
    unread: true,
    processed: false,
    status: 'unprocessed',
  },
  {
    id: 'email-6',
    sender: 'University Health Services',
    senderEmail: 'health-insurance@university.edu',
    subject: 'Action Required: Student Health Insurance Waiver Deadline',
    snippet: 'All enrolled students must either enroll or provide proof of comparable coverage. Deadline to submit waiver is October 25, 2026...',
    body: `Dear Student,

Every full-time registered student must maintain valid health insurance coverage. 

If you already have private or employer-sponsored insurance that meets university criteria, you must submit an online waiver petition.

Deadline to submit waiver or enroll: October 25, 2026 at 5:00 PM.
Students who do not submit a verified waiver by October 25 will be automatically enrolled in the University Student Health Plan and billed $1,420.

Submit proof here: https://healthcenter.university.edu/waiver`,
    receivedDate: 'Sep 14, 2026',
    unread: false,
    processed: false,
    status: 'unprocessed',
  },
  {
    id: 'email-7',
    sender: 'CS 380 Course Staff',
    senderEmail: 'ta-staff@cs.university.edu',
    subject: 'CS 380: Assignment 3 Deadline Clarification & Office Hours',
    snippet: 'Several students asked about timezone allowances. To confirm: Assignment 3 is due October 12, 2026 at 11:59 PM EST...',
    body: `Hi everyone,

We received several questions on Ed Discussion regarding submission timezones for Assignment 3. 

To clarify for the entire class:
- Assignment 3 submission is due on October 12, 2026 at 11:59 PM EST.
- The autograder will remain open without penalty until exactly that timestamp.
- Extra office hours have been added this Thursday evening.

Good luck with model training!
CS 380 Teaching Assistants`,
    receivedDate: 'Sep 16, 2026',
    unread: false,
    processed: false,
    status: 'unprocessed',
  },
  {
    id: 'email-8',
    sender: 'The Pragmatic Engineer',
    senderEmail: 'newsletter@pragmaticengineer.com',
    subject: 'Issue #148: How Big Tech builds resilient distributed state machines',
    snippet: 'In this weeks deep dive, we look into how modern cloud infrastructure avoids split-brain scenarios and idempotency pitfalls...',
    body: `Hey engineers,

Welcome to issue #148 of The Pragmatic Engineer.

Today we explore real-world consensus protocols, distributed locks, and why idempotency keys are the unsung heroes of modern e-commerce checkouts.

Topics covered today:
1. Why retrying without idempotency tokens creates ghost charges.
2. The trade-offs between Raft and Paxos in multi-region clusters.
3. Book recommendation: Designing Data-Intensive Applications.

Hope you enjoy this read over your morning brew!

Gergely`,
    receivedDate: 'Sep 13, 2026',
    unread: false,
    processed: false,
    status: 'unprocessed',
  },
  {
    id: 'email-9',
    sender: 'Sarah Lin (Design Team)',
    senderEmail: 'sarah.lin@teamworkspace.io',
    subject: 'Team offsite photos from last Friday!',
    snippet: 'Here is the shared Google Drive folder with all high-res photos from our outdoor hike and dinner...',
    body: `Hey everyone!

Thanks to everyone who made it out to the fall team offsite in Marin Headlands! The weather was stunning and the sunset photos came out fantastic.

I have uploaded all the camera roll shots to our team Drive folder:
https://drive.google.com/drive/folders/offsite-2026-fall

Feel free to add your own pictures to the shared album.

Best,
Sarah`,
    receivedDate: 'Sep 15, 2026',
    unread: false,
    processed: false,
    status: 'unprocessed',
  },
  {
    id: 'email-10',
    sender: 'Spotify',
    senderEmail: 'no-reply@spotify.com',
    subject: 'Your September Listening Digest & Fresh Recommendations',
    snippet: 'You spent 1,480 minutes listening to Lo-Fi Beats and Synthwave this month. Check out what your friends are streaming...',
    body: `Hi there,

Your monthly listening recap is ready! 

Top Genre: Ambient Electronica / Lo-Fi Study
Top Artist: Tycho
Total Minutes Streamed: 1,480

We have created a personalized Discover Weekly mixtape based on your favorite late-night study sessions. Tap the app to listen now.`,
    receivedDate: 'Sep 16, 2026',
    unread: false,
    processed: false,
    status: 'unprocessed',
  },
  {
    id: 'email-11',
    sender: 'Elena Rostova',
    senderEmail: 'elena.rostova@partnerlabs.org',
    subject: 'Quick coffee chat next week?',
    snippet: 'Hey! Are you around campus or downtown next week? Let’s catch up sometime next week or maybe the following Tuesday...',
    body: `Hey!

I saw your recent paper pre-print on arXiv, really neat findings! 

Are you around campus or downtown next week? Let’s catch up sometime next week or maybe the following week over a quick coffee. Let me know when you have some free time and we can coordinate a spot.

Cheers,
Elena`,
    receivedDate: 'Sep 16, 2026',
    unread: true,
    processed: false,
    status: 'unprocessed',
  },
  {
    id: 'email-12',
    sender: 'Marcus Vance (Product Lead)',
    senderEmail: 'marcus.vance@startupincubator.co',
    subject: 'Q4 Product Roadmap & Milestone Planning',
    snippet: 'We should begin gathering stakeholder input for Q4 milestones. We plan to do our review tentatively towards the end of next month...',
    body: `Team,

As we head into October, please start drafting your team OKR proposals.

We are tentatively aiming to do our review towards the end of next month or early November, but we will lock in the exact date once leadership finishes the budget forecast.

Please start drafting your initial bullet points in Notion.

Thanks,
Marcus`,
    receivedDate: 'Sep 15, 2026',
    unread: false,
    processed: false,
    status: 'unprocessed',
  },
  {
    id: 'email-13',
    sender: 'National Science Foundation',
    senderEmail: 'grants-notification@nsf.gov',
    subject: 'NSF Graduate Research Fellowship: Application Due Date',
    snippet: 'Applications for the Fall 2026 NSF GRFP in Computer and Information Science & Engineering must be submitted by October 28, 2026...',
    body: `Dear Applicant,

This is an administrative notification for the NSF Graduate Research Fellowship Program (GRFP) FY2027 Competition.

CISE (Computer and Information Science and Engineering) Fellowship applications:
Submission Deadline: October 28, 2026 at 5:00 PM local applicant time.
Reference Letters Deadline: November 2, 2026 at 5:00 PM.

Incomplete applications or submissions received after the 5:00 PM deadline will not be accepted under any circumstances.

NSF FastLane Operations Portal: https://research.gov/grfp`,
    receivedDate: 'Sep 16, 2026',
    unread: true,
    processed: false,
    status: 'unprocessed',
  },
  {
    id: 'email-14',
    sender: 'Campus Career & Professional Development',
    senderEmail: 'careercenter@university.edu',
    subject: 'Reminder: Fall Tech Career Fair Pre-Registration Closes Oct 2',
    snippet: 'Over 80 companies will be attending. Priority fast-pass entry registration closes October 2, 2026 at 6:00 PM...',
    body: `Hello Students,

The Fall 2026 Tech & Engineering Career Fair takes place in the University Pavilion.

Fast-Pass Pre-registration:
Closes on October 2, 2026 at 6:00 PM.
Registered attendees get 1-hour early admission to visit booths before general floor opening.

Upload your approved resume to Handshake before registration closes.

Career Services Center`,
    receivedDate: 'Sep 14, 2026',
    unread: true,
    processed: false,
    status: 'unprocessed',
  }
];

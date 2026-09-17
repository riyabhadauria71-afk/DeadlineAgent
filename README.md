## Engineering Highlights

This isn't just a UI wrapped around an LLM call — the interesting problems 
are in the agent's control loop, not the model.

**Bounded execution.** The agent processes a maximum of 20 emails per run. 
Without a hard cap, a bug or an unexpected inbox size can turn a scheduled 
job into a runaway loop that burns API quota indefinitely. If the cap is 
hit, the agent stops cleanly and reports how much work is left rather than 
failing silently.

**Idempotency.** Before creating a calendar event, the agent checks existing 
events for a matching source email ID or a near-identical title/date. This 
means running the agent twice on the same inbox never creates duplicate 
events — a property that matters a lot once this kind of agent runs on a 
schedule rather than a single manual click.

**Graceful failure handling.** If a tool call (in this demo, the extraction 
step) fails, the agent retries once, then logs the failure and marks the 
email as processed anyway, rather than retrying indefinitely or crashing 
the whole run. A single bad email should never block the other 19.

The extraction step currently uses [the Gemini API / a mocked local 
function — pick one]. Swapping between them is a single function call 
inside `agentRunner.js`; the loop logic, guardrails, and UI are entirely 
decoupled from which extraction method is used.

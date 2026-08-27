# Nexus Demo — Narration Audio Assets

## Status

Audio files are NOT yet present. The demo player is fully wired to play these files
when they exist. Until they are added, the demo runs in **captions-only** mode —
captions remain visible and all visual actions execute on schedule.

## When audio files are present, the player will:
- Play each scene's audio track at scene start
- Synchronize captions and visual actions to the audio
- Use `audio.currentTime` as the master clock for scene events
- Advance to the next scene automatically when audio ends (or after `duration` ms, whichever comes first)
- Support mute/unmute and volume control without re-recording

## Required Audio Files

Place finished MP3 (or AAC) files in this directory with **exactly** these filenames:

| Filename | Duration (approx.) | Scene |
|---|---|---|
| `nexus-demo-01-welcome.mp3` | 4–5 s | Welcome / intro |
| `nexus-demo-02-executive-dashboard.mp3` | 5–6 s | Executive KPI dashboard |
| `nexus-demo-03-problem-detected.mp3` | 5–6 s | Risk KPI drill-down |
| `nexus-demo-04-understand-cause.mp3` | 5–6 s | Detail drawer — cause and action |
| `nexus-demo-05-ask-nexus.mp3` | 6–8 s | Ask Nexus AI assistant |
| `nexus-demo-06-map-context.mp3` | 5–7 s | Map Intelligence |
| `nexus-demo-07-finance-view.mp3` | 5–6 s | Finance dashboard + AP drill-down |
| `nexus-demo-08-assign-action.mp3` | 5–6 s | Assign work / accountability |
| `nexus-demo-09-prove-value.mp3` | 5–6 s | Value / ROI report |
| `nexus-demo-10-explore-next.mp3` | 4–5 s | Closing — invite to explore |

**Total demo run time with narration: approximately 50–65 seconds.**

---

## Approved Narration Scripts

Read by a professional narrator. Tone: clear, confident, conversational.
Pace: moderate — allow 0.3–0.5 second pauses between sentences.

---

### Scene 01 — Welcome to Nexus
> "Welcome to Nexus — the GCS operations intelligence platform. In the next minute,
> you'll see how Nexus connects your organization's information into one operating
> picture, so leaders can see what's happening, know what needs attention, and act."

---

### Scene 02 — Executive Dashboard
> "The executive dashboard gives leadership a live view of the entire organization —
> budget utilization, open work orders, workforce capacity, and risk exposure —
> always current, always connected across every department."

---

### Scene 03 — Problem Detected
> "Nexus identifies a risk that needs attention. One tap opens the full picture —
> context, cause, and recommended action — without searching through separate
> systems or waiting for a report."

---

### Scene 04 — Understand Cause and Risk
> "The detail view shows what's happening, why it matters, and what to do next.
> Leaders see the recommended action and the estimated cost of leaving it
> unaddressed — so decisions are informed, not guesswork."

---

### Scene 05 — Ask Nexus
> "Ask Nexus lets leaders ask plain-language questions across all connected
> operational data. No analyst required — just ask. The answer comes back in plain
> language with the numbers to support it."

---

### Scene 06 — Map Context
> "Map Intelligence adds geographic context — so leaders can see where risk,
> projects, and assets are concentrated across facilities, sites, and service areas,
> and act directly from the map."

---

### Scene 07 — Finance View
> "The Finance view connects budget, revenue, and accounts payable signals to the
> operational picture. Overdue invoices, vendor risk, and spending trends — visible
> in one place, connected to everything else."

---

### Scene 08 — Assign Action
> "From insight to action — leaders can assign work, escalate issues, and track
> accountability without leaving the Nexus environment. Every action is named,
> dated, and visible."

---

### Scene 09 — Prove Value
> "Nexus helps teams document outcomes, generate performance reports, and prove
> measurable value from operational improvements — with data, not just claims."

---

### Scene 10 — Explore Nexus
> "That's the guided walkthrough. Now explore Nexus interactively — move through
> departments, ask your own questions, open records, and see the platform at your
> own pace. Synthetic data only. No login required."

---

## Audio Production Notes

- **Format**: MP3 at 128 kbps minimum, AAC preferred for smaller file size
- **Sample rate**: 44.1 kHz, mono is acceptable for voice narration
- **Noise floor**: clean — no background noise, no room reverb
- **Normalization**: -3 dBFS peak, -16 LUFS integrated loudness
- **Silence**: 0.1 s lead-in, 0.2 s tail on each file
- **Hosting**: files served from `/assets/audio/` (same origin, no CORS issues)
- The demo player uses `HTMLAudioElement` — no third-party audio library needed

## After adding audio files

No code changes are needed. The demo player automatically detects the files and
switches from captions-only to narrated mode. The `duration` field in each SCENES
entry acts as a minimum — scenes wait for audio to finish before advancing.

## Activating audio in the demo player

Once files are present, update the `audioSrc` fields in `js/nexus-demo-player.js`:

```js
// Change from:
audioSrc: null,
// To (relative path from sandbox/index.html):
audioSrc: '../assets/audio/nexus-demo-01-welcome.mp3',
```

Do this for all 10 scenes. The player handles the rest.

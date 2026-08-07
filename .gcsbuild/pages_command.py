# -*- coding: utf-8 -*-
"""Founder Command Center page."""

import shell as S
from pages_content import icon

P = "../"


def kpi(label, value, unit="", delta="", dirn="", variant=""):
    cls = "kpi kpi--%s" % variant if variant else "kpi"
    u = '<span class="kpi__unit">%s</span>' % unit if unit else ""
    arrow = {"up": "&#9650;", "down": "&#9660;", "flat": "&#9679;"}.get(dirn, "")
    d = '<span class="kpi__delta kpi__delta--%s">%s %s</span>' % (dirn, arrow, delta) if delta else ""
    return f"""          <article class="{cls}">
            <span class="kpi__label">{label}</span>
            <span class="kpi__value">{value}{u}</span>
            {d}
          </article>"""


def bar(label, pct, value, fill="", delay=0):
    f = "chart__fill chart__fill--%s" % fill if fill else "chart__fill"
    return f"""            <div class="chart__row">
              <span class="chart__label">{label}</span>
              <div class="chart__track"><div class="{f}" style="width:{pct}%; animation-delay:{delay}ms"></div></div>
              <span class="chart__value">{value}</span>
            </div>"""


# ---------------------------------------------------------------- mission queue
MISSIONS = [
    ("M-118", "Publish reference implementation documentation", "Marketing &amp; Positioning", "High", "risk", "In progress", 70),
    ("M-121", "Complete Nexus asset module condition scoring", "Platform Engineering", "High", "risk", "In progress", 55),
    ("M-124", "Draft Genesis agent charter template v2", "AI Governance", "Medium", "warn", "In review", 85),
    ("M-127", "Municipal readiness assessment package", "Service Design", "High", "risk", "In progress", 40),
    ("M-129", "Accessibility audit remediation pass", "Platform Engineering", "Medium", "warn", "Queued", 0),
    ("M-131", "Capital planning model &mdash; scenario engine", "Platform Engineering", "Medium", "warn", "In progress", 25),
    ("M-134", "Compliance obligation library expansion", "Service Design", "Low", "neutral", "Queued", 0),
]

mission_rows = "\n".join(
    f"""                  <tr>
                    <td><strong>{mid}</strong></td>
                    <td>{title}</td>
                    <td>{dept}</td>
                    <td><span class="chip chip--{chip}">{pri}</span></td>
                    <td>{status}</td>
                    <td>
                      <div class="mini-bar mini-bar--{'good' if pct >= 70 else 'warn' if pct >= 30 else 'neutral'}"><span style="width:{pct}%"></span></div>
                      <span style="font-size:0.6875rem;color:var(--dash-dim)">{pct}%</span>
                    </td>
                  </tr>"""
    for mid, title, dept, pri, chip, status, pct in MISSIONS
)

# ---------------------------------------------------------------- approvals
APPROVALS = [
    ("A-2201", "Genesis &mdash; Obligation Coordinator scope expansion",
     "Requests read access to the contractor certification register in addition to the internal obligation register. Expands notification scope to external vendor contacts, which crosses the internal-recipients boundary in the current charter.",
     "AI Governance", "Decision required"),
    ("A-2203", "Publish Nexus map intelligence demonstration",
     "Public-facing interactive demonstration using synthetic geography and illustrative data only. Confirm every data point is labeled as demonstration and no client geography is identifiable.",
     "Marketing &amp; Positioning", "Ready for release"),
    ("A-2205", "Adopt revised condition scoring methodology",
     "Moves from a five-point subjective scale to a weighted composite of age, observed condition, failure history, and criticality. Changes ratings on approximately 340 sample assets and affects capital sequencing output.",
     "Platform Engineering", "Decision required"),
    ("A-2208", "Retention schedule for Genesis decision records",
     "Proposes seven-year append-only retention aligned to typical public-sector record schedules, with client-configurable extension. Affects storage design and export tooling.",
     "AI Governance", "Decision required"),
]

approval_items = "\n".join(
    f"""            <li class="queue__item">
              <div class="queue__head">
                <div>
                  <span class="queue__id">{aid}</span>
                  <h4 class="queue__title">{title}</h4>
                </div>
                <span class="chip chip--warn">{status}</span>
              </div>
              <p class="queue__desc">{desc}</p>
              <div class="queue__foot">
                <span class="queue__meta">{dept}</span>
                <div class="queue__actions">
                  <button type="button" class="btn-mini btn-mini--approve" data-queue-action="Approved">Approve</button>
                  <button type="button" class="btn-mini btn-mini--hold" data-queue-action="Held for review">Hold</button>
                  <button type="button" class="btn-mini" data-queue-action="Delegated">Delegate</button>
                </div>
              </div>
            </li>"""
    for aid, title, desc, dept, status in APPROVALS
)

# ---------------------------------------------------------------- departments
DEPARTMENTS = [
    ("Platform Engineering", "Nexus modules, data model, interface", 4, "Healthy", "good", 82),
    ("Service Design", "Assessment methods, deliverable standards", 3, "Healthy", "good", 74),
    ("AI Governance", "Charters, approvals, evaluation, audit", 2, "Attention", "warn", 58),
    ("Marketing &amp; Positioning", "Site, messaging, reference material", 3, "Healthy", "good", 88),
    ("Client Delivery", "Engagement execution and support", 2, "Healthy", "good", 79),
    ("Operations &amp; Admin", "Internal process, records, finance", 1, "Attention", "warn", 61),
]

dept_rows = "\n".join(
    f"""                  <tr>
                    <td><strong>{name}</strong><br /><span style="font-size:0.6875rem;color:var(--dash-dim)">{scope}</span></td>
                    <td>{active}</td>
                    <td><span class="chip chip--{chip}">{status}</span></td>
                    <td>
                      <div class="mini-bar mini-bar--{'good' if load >= 70 else 'warn'}"><span style="width:{load}%"></span></div>
                    </td>
                  </tr>"""
    for name, scope, active, status, chip, load in DEPARTMENTS
)

# ---------------------------------------------------------------- repositories
REPOS = [
    ("gcs-website", "Public marketing site and platform demonstrations", "main", "Passing", "good", "2 hours ago", 0),
    ("nexus-core", "Platform data model and services", "main", "Passing", "good", "yesterday", 3),
    ("nexus-ui", "Interface components and dashboards", "develop", "Passing", "good", "yesterday", 5),
    ("genesis-agents", "Agent charters, harnesses, evaluation suites", "develop", "Attention", "warn", "3 days ago", 8),
    ("gcs-methods", "Assessment frameworks and deliverable templates", "main", "Passing", "good", "5 days ago", 1),
    ("nexus-map", "Spatial layer definitions and rendering", "develop", "Not run", "neutral", "6 days ago", 2),
]

repo_rows = "\n".join(
    f"""                  <tr>
                    <td><strong>{name}</strong><br /><span style="font-size:0.6875rem;color:var(--dash-dim)">{desc}</span></td>
                    <td><code style="font-size:0.6875rem">{branch}</code></td>
                    <td><span class="chip chip--{chip}">{check}</span></td>
                    <td>{last}</td>
                    <td>{'&mdash;' if open_pr == 0 else str(open_pr)}</td>
                  </tr>"""
    for name, desc, branch, check, chip, last, open_pr in REPOS
)

# ---------------------------------------------------------------- decisions
DECISIONS = [
    ("Feb 12", "Sequence AI Assisted Operations last in the solution model",
     "Applying agents to an undefined process produces confident, unreliable output. Operations Intelligence, Workflow Automation, and Executive Reporting must precede it. This is now a stated constraint in engagement scoping, not a recommendation."),
    ("Feb 09", "Publish agent maturity labels on the public site",
     "Every Genesis agent role is now labeled as in development or concept. Presenting designed architecture as available product is the single fastest way to lose credibility with a public-sector buyer."),
    ("Feb 05", "No client logos, no metrics without a source",
     "The site will carry no customer logos, no revenue claims, and no measured-outcome percentages that are not directly attributable. Reference material describes approach and expected benefits, clearly labeled."),
    ("Jan 30", "Forms remain client-side only, and say so",
     "No form on the site will imply transmission to a server that does not exist. Each form validates in-browser, shows the user a summary, and provides a direct email path."),
    ("Jan 24", "Condition scoring must be reproducible",
     "Any condition rating must be reconstructible from its inputs. A score no one can explain is worse than no score, because it carries unearned authority into a capital decision."),
]

decision_items = "\n".join(
    f"""            <li class="feed__item">
              <span class="feed__dot feed__dot--info" aria-hidden="true"></span>
              <div class="feed__content">
                <p class="feed__text"><strong>{date}</strong> &mdash; {title}</p>
                <p class="feed__meta">{note}</p>
              </div>
            </li>"""
    for date, title, note in DECISIONS
)

# ---------------------------------------------------------------- upcoming
UPCOMING = [
    ("This week", "Nexus asset module &mdash; condition scoring merge", "Platform Engineering", "risk"),
    ("This week", "Genesis charter template v2 review", "AI Governance", "warn"),
    ("This week", "Accessibility remediation pass on public site", "Platform Engineering", "warn"),
    ("Next week", "Municipal readiness assessment package draft", "Service Design", "warn"),
    ("Next week", "Capital scenario engine &mdash; first working model", "Platform Engineering", "warn"),
    ("This month", "Compliance obligation library expansion", "Service Design", "neutral"),
    ("This month", "Decision record export tooling", "AI Governance", "neutral"),
    ("This quarter", "Reference implementation documentation release", "Marketing &amp; Positioning", "neutral"),
]

upcoming_rows = "\n".join(
    f"""                  <tr>
                    <td><span class="chip chip--{chip}">{when}</span></td>
                    <td><strong>{what}</strong></td>
                    <td>{dept}</td>
                  </tr>"""
    for when, what, dept, chip in UPCOMING
)

# ---------------------------------------------------------------- risks
RISKS = [
    ("Capability expectation gap", "Market", "High", "risk",
     "Buyers hear &ldquo;AI workforce&rdquo; and assume a finished autonomous product. Mitigation: explicit maturity labels on every agent, published boundaries, and a stated position that Genesis is delivered inside engagements today."),
    ("Founder concentration", "Structural", "High", "risk",
     "Direction, approval authority, and technical depth concentrate in one person. Mitigation in progress: written charters, documented methods, and decision records that make the reasoning transferable rather than tacit."),
    ("Public-sector procurement cycle", "Commercial", "Medium", "warn",
     "Municipal buying cycles are long and budget-bound. Mitigation: scoped assessment engagements sized to fit existing professional-services authority rather than requiring a capital appropriation."),
    ("Data quality at intake", "Delivery", "Medium", "warn",
     "Client asset and work records are frequently incomplete, which limits what any analysis can honestly conclude. Mitigation: intake assessment states data confidence explicitly before any recommendation is made."),
    ("Model provider dependency", "Technical", "Medium", "warn",
     "Agent behavior depends partly on third-party model providers whose behavior can change. Mitigation: evaluation suites run on a fixed cadence, and provider arrangements are disclosed to clients."),
    ("Scope creep in engagements", "Delivery", "Low", "neutral",
     "Operational assessments surface adjacent problems that clients want addressed immediately. Mitigation: findings outside scope are documented and quoted separately rather than absorbed."),
]

risk_items = "\n".join(
    f"""              <article class="card card--dark">
                <div style="display:flex;justify-content:space-between;align-items:flex-start;gap:1rem">
                  <h4 class="card__title" style="margin:0">{name}</h4>
                  <span class="chip chip--{chip}">{level}</span>
                </div>
                <p class="card__eyebrow" style="margin-top:0.5rem">{cat}</p>
                <p class="card__desc">{note}</p>
              </article>"""
    for name, cat, level, chip, note in RISKS
)


body = S.page_hero(
    P,
    "Founder Command Center",
    "One Screen. Everything That Needs a Decision.",
    "The internal operating view GCS runs on itself &mdash; missions, approvals, department status, repositories, risk, and decisions in a single place. Published here as a working demonstration of the operating discipline we build for clients.",
    [(None, "Founder Command Center")],
    actions='<a href="%snexus/" class="btn btn--gold">See the Nexus Platform</a><a href="%srequest-demo/" class="btn btn--outline">Request a Demo</a>' % (P, P),
    dash=True,
) + """    <section class="dash">
      <div class="container">
        %s

        <div class="dash__bar">
          <div class="status-strip">
            <span class="status-strip__item"><span class="pulse-dot" aria-hidden="true"></span> Command Center &mdash; demonstration view</span>
            <span class="status-strip__item">Reporting period: current</span>
            <span class="status-strip__item">Operator: Founder</span>
            <span class="status-strip__item">Scope: internal operations</span>
          </div>
        </div>

        <h2 class="section-title" style="font-size:1.375rem;color:#fff;margin:2rem 0 1rem">Executive Dashboard</h2>
        <div class="kpi-grid">
%s
        </div>

        <div class="dash__layout" style="margin-top:1.5rem">
          <div class="dash__main">

            <section class="panel" id="mission-queue">
              <div class="panel__head">
                <div>
                  <h3 class="panel__title">Mission Queue</h3>
                  <p class="panel__hint">Active initiatives with an owner, a department, and a definition of done.</p>
                </div>
                <span class="demo-tag">Illustrative</span>
              </div>
              <div class="panel__body panel__body--flush">
                <div class="dtable-wrap" tabindex="0" role="region" aria-label="Scrollable data table">
                  <table class="dtable">
                    <caption>Illustrative demonstration data &mdash; internal mission queue</caption>
                    <thead>
                      <tr><th scope="col">ID</th><th scope="col">Mission</th><th scope="col">Department</th><th scope="col">Priority</th><th scope="col">Status</th><th scope="col">Progress</th></tr>
                    </thead>
                    <tbody>
%s
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section class="panel" id="approvals">
              <div class="panel__head">
                <div>
                  <h3 class="panel__title">Approvals Queue</h3>
                  <p class="panel__hint">Items that cannot proceed without an explicit decision. Buttons below respond locally in your browser &mdash; nothing is transmitted.</p>
                </div>
                <span class="demo-tag">Illustrative</span>
              </div>
              <div class="panel__body">
                <ul class="queue" data-queue role="list">
%s
                </ul>
              </div>
            </section>

            <section class="panel" id="active-projects">
              <div class="panel__head">
                <div>
                  <h3 class="panel__title">Active Projects</h3>
                  <p class="panel__hint">Delivery and build work currently in flight.</p>
                </div>
                <span class="demo-tag">Illustrative</span>
              </div>
              <div class="panel__body">
                <div class="chart">
%s
                </div>
                <p class="panel__hint" style="margin-top:1rem">Bars show completion against the defined scope for each active workstream in this sample.</p>
              </div>
            </section>

            <section class="panel" id="departments">
              <div class="panel__head">
                <div>
                  <h3 class="panel__title">Department Status</h3>
                  <p class="panel__hint">Six internal functions, their active mission count, and current load.</p>
                </div>
                <span class="demo-tag">Illustrative</span>
              </div>
              <div class="panel__body panel__body--flush">
                <div class="dtable-wrap" tabindex="0" role="region" aria-label="Scrollable data table">
                  <table class="dtable">
                    <caption>Illustrative demonstration data &mdash; department status</caption>
                    <thead>
                      <tr><th scope="col">Department</th><th scope="col">Active</th><th scope="col">Status</th><th scope="col">Load</th></tr>
                    </thead>
                    <tbody>
%s
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section class="panel" id="repositories">
              <div class="panel__head">
                <div>
                  <h3 class="panel__title">Repository Status</h3>
                  <p class="panel__hint">Build and branch state across platform repositories. Mock status &mdash; not connected to a live build system.</p>
                </div>
                <span class="demo-tag">Mock</span>
              </div>
              <div class="panel__body panel__body--flush">
                <div class="dtable-wrap" tabindex="0" role="region" aria-label="Scrollable data table">
                  <table class="dtable">
                    <caption>Illustrative demonstration data &mdash; repository and build status (mock)</caption>
                    <thead>
                      <tr><th scope="col">Repository</th><th scope="col">Branch</th><th scope="col">Checks</th><th scope="col">Last commit</th><th scope="col">Open PRs</th></tr>
                    </thead>
                    <tbody>
%s
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

            <section class="panel" id="risk-summary">
              <div class="panel__head">
                <div>
                  <h3 class="panel__title">Risk Summary</h3>
                  <p class="panel__hint">The risks the founder actually tracks, with the mitigation actually in place.</p>
                </div>
                <span class="demo-tag">Illustrative</span>
              </div>
              <div class="panel__body">
                <div class="grid grid--2" style="gap:1rem">
%s
                </div>
              </div>
            </section>

            <section class="panel" id="upcoming">
              <div class="panel__head">
                <div>
                  <h3 class="panel__title">Upcoming Work</h3>
                  <p class="panel__hint">What is committed next, by horizon.</p>
                </div>
                <span class="demo-tag">Illustrative</span>
              </div>
              <div class="panel__body panel__body--flush">
                <div class="dtable-wrap" tabindex="0" role="region" aria-label="Scrollable data table">
                  <table class="dtable">
                    <caption>Illustrative demonstration data &mdash; upcoming committed work</caption>
                    <thead>
                      <tr><th scope="col">Horizon</th><th scope="col">Work item</th><th scope="col">Department</th></tr>
                    </thead>
                    <tbody>
%s
                    </tbody>
                  </table>
                </div>
              </div>
            </section>

          </div>

          <aside class="dash__aside">

            <section class="panel" id="operational-health">
              <div class="panel__head"><h3 class="panel__title">Operational Health</h3><span class="demo-tag">Illustrative</span></div>
              <div class="panel__body">
                <div class="gauge">
                  <svg viewBox="0 0 120 120" width="120" height="120" role="img" aria-label="Gauge showing an illustrative composite operational health index of 84 out of 100.">
                    <circle class="gauge__track" cx="60" cy="60" r="48" />
                    <circle class="gauge__value gauge__value--good" cx="60" cy="60" r="48" transform="rotate(-90 60 60)" />
                    <text class="gauge__num" x="60" y="58" text-anchor="middle">84</text>
                    <text class="gauge__cap" x="60" y="76" text-anchor="middle">HEALTH INDEX</text>
                  </svg>
                  <p class="panel__hint">Composite of mission velocity, approval latency, build health, and risk posture.</p>
                </div>
                <div class="chart" style="margin-top:1.25rem">
%s
                </div>
              </div>
            </section>

            <section class="panel" id="ai-workforce">
              <div class="panel__head"><h3 class="panel__title">AI Workforce Overview</h3><span class="demo-tag">Illustrative</span></div>
              <div class="panel__body">
                <div class="kpi-grid kpi-grid--tight">
                  <article class="kpi kpi--gold"><span class="kpi__label">Agents Defined</span><span class="kpi__value">12</span></article>
                  <article class="kpi"><span class="kpi__label">In Development</span><span class="kpi__value">6</span></article>
                  <article class="kpi"><span class="kpi__label">Concept Stage</span><span class="kpi__value">6</span></article>
                  <article class="kpi kpi--warn"><span class="kpi__label">Awaiting Charter</span><span class="kpi__value">2</span></article>
                </div>
                <div class="chart" style="margin-top:1.25rem">
%s
                </div>
                <p class="panel__hint" style="margin-top:1rem">Charter coverage is the share of defined agents with an approved written charter. No agent operates without one.</p>
                <a href="%sgenesis/" class="btn btn--ghost btn--sm" style="margin-top:1rem">Genesis Details</a>
              </div>
            </section>

            <section class="panel" id="decisions">
              <div class="panel__head"><h3 class="panel__title">Recent Decisions</h3><span class="demo-tag">Illustrative</span></div>
              <div class="panel__body">
                <ul class="feed" role="list">
%s
                </ul>
                <p class="panel__hint" style="margin-top:0.75rem">Each decision is recorded with its reasoning, so it can be revisited on evidence rather than re-litigated on memory.</p>
              </div>
            </section>

            <section class="panel">
              <div class="panel__head"><h3 class="panel__title">Explore Further</h3></div>
              <div class="panel__body">
                <ul class="anchor-list" role="list">
                  <li><a href="%snexus/">Nexus Platform demonstration</a></li>
                  <li><a href="%smap-intelligence/">Map Intelligence demonstration</a></li>
                  <li><a href="%sgenesis/">Genesis AI Workforce</a></li>
                  <li><a href="%sreference/">Reference implementations</a></li>
                  <li><a href="%sresponsible-ai/">Responsible AI statement</a></li>
                </ul>
              </div>
            </section>

          </aside>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="split">
          <div>
            <div class="section-header section-header--left">
              <span class="section-label">Why This Is Public</span>
              <h2 class="section-title">We Run the Discipline We Sell</h2>
            </div>
            <div class="prose prose--wide">
              <p>Most firms that sell operational discipline do not practice it internally. Work is tracked in whatever tool each person prefers, decisions live in email, priorities shift without a record, and nobody can answer why a choice was made six months ago.</p>
              <p>GCS runs on the structure shown above. Every initiative has an owner, a department, and a definition of done. Every consequential decision passes an approval gate and is recorded with its reasoning. Every agent has a written charter. Every risk has a named mitigation rather than an acknowledgment.</p>
              <p>Publishing it serves two purposes. First, it is the most honest demonstration we can offer: this is the operating model, applied to us, before we ask anyone to apply it to themselves. Second, it makes the claim falsifiable. A firm that publishes its own risk register &mdash; including founder concentration and market expectation gaps &mdash; is making a statement that a capability list cannot make.</p>
              <p>The data on this page is illustrative. The structure is not.</p>
            </div>
          </div>
          <aside>
            <div class="card card--flat">
              <span class="card__eyebrow">Reading This Page</span>
              <h3 class="card__title">What is real and what is not</h3>
              <ul class="card__list" role="list">
                <li><strong>Real:</strong> the categories, the queue structure, the approval-gate model, the risks named, and the reasoning attached to each recorded decision.</li>
                <li><strong>Illustrative:</strong> every number, identifier, date, progress bar, and status chip. These represent plausible values, not live internal metrics.</li>
                <li><strong>Mock:</strong> the repository status panel is not connected to a live build system.</li>
                <li><strong>Local only:</strong> the approve, hold, and delegate buttons change this page in your browser and transmit nothing.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>

%s""" % (
    S.demo_banner(
        "Every figure, identifier, date, and status indicator on this page is illustrative demonstration data created to "
        "show the structure of the Founder Command Center. It is not a live feed of GCS internal operations, and the "
        "repository panel is not connected to a build system."
    ),
    "\n".join([
        kpi("Active Missions", "7", "", "2 opened this period", "up", "gold"),
        kpi("Awaiting Approval", "4", "", "Oldest: 3 days", "flat", "warn"),
        kpi("Departments", "6", "", "4 healthy, 2 attention", "flat", ""),
        kpi("Repositories", "6", "", "1 needs attention", "flat", ""),
        kpi("Open Risks", "6", "", "2 high, 3 medium", "flat", "risk"),
        kpi("Health Index", "84", "", "3 pts vs. last period", "up", "good"),
    ]),
    mission_rows,
    approval_items,
    "\n".join([
        bar("Nexus asset module", 55, "55%", "warn", 0),
        bar("Public site &amp; demonstrations", 88, "88%", "good", 80),
        bar("Genesis charter framework", 70, "70%", "good", 160),
        bar("Capital scenario engine", 25, "25%", "risk", 240),
        bar("Assessment package", 40, "40%", "warn", 320),
        bar("Map intelligence layers", 62, "62%", "warn", 400),
        bar("Compliance obligation library", 34, "34%", "risk", 480),
    ]),
    dept_rows,
    repo_rows,
    risk_items,
    upcoming_rows,
    "\n".join([
        bar("Mission velocity", 78, "78", "good", 0),
        bar("Approval latency", 64, "64", "warn", 80),
        bar("Build health", 83, "83", "good", 160),
        bar("Documentation currency", 71, "71", "good", 240),
        bar("Risk posture", 58, "58", "warn", 320),
    ]),
    "\n".join([
        bar("Charter coverage", 83, "10 / 12", "gold", 0),
        bar("Evaluation suites written", 50, "6 / 12", "warn", 80),
        bar("Approval paths defined", 100, "12 / 12", "good", 160),
    ]),
    P,
    decision_items,
    P, P, P, P, P,
    S.cta_band(
        P,
        "Want this view of your own operation?",
        "The Command Center pattern is not exclusive to GCS. It is what Nexus produces for an organization once its operating record is structured and current.",
        ("request-demo/", "Request a Demo"),
        ("nexus/", "Explore Nexus"),
    ),
)

S.write(
    "founder-command-center/",
    "Founder Command Center | Executive Operating View — GCS",
    "The internal GCS operating view: mission queue, approvals, department status, repository health, risk summary, and recorded decisions. Illustrative demonstration data.",
    body,
    active="command",
    body_class="theme-dash",
)

print("command center written")

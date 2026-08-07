# -*- coding: utf-8 -*-
"""Content pages: about, solutions, industries, reference, founder."""

import shell as S

P = "../"


def icon(name, size=22):
    paths = {
        "chart": '<path d="M3 3v18h18"/><path d="M7 15l4-5 3 3 5-7"/>',
        "building": '<rect x="3" y="3" width="8" height="18" rx="1"/><rect x="13" y="8" width="8" height="13" rx="1"/><path d="M6 7h2M6 11h2M6 15h2M16 12h2M16 16h2"/>',
        "grid": '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
        "calendar": '<rect x="3" y="4" width="18" height="17" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/><path d="M8 15h3"/>',
        "gauge": '<path d="M12 21a9 9 0 1 0-9-9"/><path d="M12 12l5-3"/><circle cx="12" cy="12" r="1.6"/>',
        "cube": '<path d="M21 16V8l-9-5-9 5v8l9 5 9-5z"/><path d="M3.3 7.5L12 12.5l8.7-5"/><path d="M12 21.5v-9"/>',
        "shield": '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><path d="M9 12l2 2 4-4"/>',
        "check-doc": '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="M9 15l2 2 4-4"/>',
        "flow": '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="15" width="6" height="6" rx="1"/><path d="M9 6h4a2 2 0 0 1 2 2v10"/><path d="M12 12h-1"/>',
        "report": '<path d="M4 3h16v18H4z"/><path d="M8 8h8M8 12h8M8 16h5"/>',
        "target": '<circle cx="12" cy="12" r="9"/><circle cx="12" cy="12" r="5"/><circle cx="12" cy="12" r="1.5"/>',
        "cpu": '<rect x="6" y="6" width="12" height="12" rx="2"/><path d="M9 2v3M15 2v3M9 19v3M15 19v3M2 9h3M2 15h3M19 9h3M19 15h3"/>',
        "city": '<path d="M3 21h18"/><path d="M5 21V7l6-4v18"/><path d="M11 9h8v12"/><path d="M8 9h.01M8 13h.01M8 17h.01M15 13h.01M15 17h.01"/>',
        "school": '<path d="M3 21h18"/><path d="M12 3l9 5H3l9-5z"/><path d="M5 21V9M19 21V9M9 21v-6h6v6"/>',
        "health": '<path d="M12 21s-7-4.5-7-10a4.5 4.5 0 0 1 7-3.7A4.5 4.5 0 0 1 19 11c0 5.5-7 10-7 10z"/><path d="M12 8v6M9 11h6"/>',
        "factory": '<path d="M3 21h18V9l-6 4V9l-6 4V4H3z"/><path d="M7 17h.01M11 17h.01M15 17h.01"/>',
        "store": '<path d="M3 9l1.5-5h15L21 9"/><path d="M4 9v12h16V9"/><path d="M9 21v-7h6v7"/>',
        "keys": '<circle cx="8" cy="15" r="4"/><path d="M10.8 12.2L20 3l1.5 1.5-1.5 1.5 1.5 1.5-1.5 1.5-1.5-1.5-3.5 3.5"/>',
        "server": '<rect x="3" y="4" width="18" height="7" rx="2"/><rect x="3" y="13" width="18" height="7" rx="2"/><path d="M7 7.5h.01M7 16.5h.01"/>',
        "hands": '<path d="M12 21s-7-4-7-9a3.5 3.5 0 0 1 7-1.5A3.5 3.5 0 0 1 19 12c0 5-7 9-7 9z"/>',
        "users": '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87"/><path d="M16 3.13a4 4 0 0 1 0 7.75"/>',
        "layers": '<path d="M12 2L2 7l10 5 10-5-10-5z"/><path d="M2 17l10 5 10-5"/><path d="M2 12l10 5 10-5"/>',
        "compass": '<circle cx="12" cy="12" r="10"/><path d="M16.2 7.8l-2.9 6.4-6.4 2.9 2.9-6.4 6.4-2.9z"/>',
        "clock": '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3.5 2"/>',
        "book": '<path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/>',
        "route": '<circle cx="6" cy="19" r="3"/><circle cx="18" cy="5" r="3"/><path d="M9 19h5a4 4 0 0 0 0-8H10a4 4 0 0 1 0-8h5"/>',
        "alert": '<path d="M10.3 3.9L1.8 18a2 2 0 0 0 1.7 3h17a2 2 0 0 0 1.7-3L13.7 3.9a2 2 0 0 0-3.4 0z"/><path d="M12 9v4M12 17h.01"/>',
    }
    return (
        '<svg width="%d" height="%d" viewBox="0 0 24 24" fill="none" stroke="currentColor" '
        'stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">%s</svg>'
        % (size, size, paths[name])
    )


def card(icon_name, title, desc, bullets=None, anchor=None, eyebrow=None, dark=False, pills=None):
    a = ' id="%s"' % anchor if anchor else ""
    style = ' style="scroll-margin-top:6rem"' if anchor else ""
    eb = '<span class="card__eyebrow">%s</span>' % eyebrow if eyebrow else ""
    bl = ""
    if bullets:
        bl = '\n            <ul class="card__list" role="list">%s</ul>' % "".join(
            "<li>%s</li>" % b for b in bullets
        )
    pl = ""
    if pills:
        pl = '\n            <div class="pill-row">%s</div>' % "".join(
            '<span class="pill %s">%s</span>' % ("pill--dark" if dark else "pill--accent", p)
            for p in pills
        )
    cls = "card card--dark" if dark else "card"
    return f"""          <article class="{cls} reveal"{a}{style}>
            <span class="card__icon" aria-hidden="true">{icon(icon_name)}</span>
            {eb}<h3 class="card__title">{title}</h3>
            <p class="card__desc">{desc}</p>{bl}{pl}
          </article>"""


# ============================================================
# ABOUT
# ============================================================
about_body = S.page_hero(
    P,
    "About GCS",
    "Operations, Made Legible",
    "General Contractor Solutions LLC exists because most organizations do not have an information problem &mdash; they have a <em>legibility</em> problem. The data exists. It just cannot be seen, trusted, or acted on fast enough to matter.",
    [(None, "About")],
    actions='<a href="%ssolutions/" class="btn btn--gold">Explore Solutions</a><a href="%srequest-demo/" class="btn btn--outline">Request a Demo</a>' % (P, P),
) + """    <section class="section">
      <div class="container">
        <div class="split">
          <div>
            <div class="section-header section-header--left">
              <span class="section-label">Why GCS Exists</span>
              <h2 class="section-title">The gap between knowing and doing</h2>
            </div>
            <div class="prose prose--wide">
              <p>Walk into almost any operating organization &mdash; a township public works yard, a school district facilities office, a hospital plant operations department, a manufacturing maintenance shop &mdash; and you will find the same pattern. Deeply capable people. Real institutional knowledge. And an operating picture assembled from spreadsheets, email threads, a work order system nobody fully trusts, three binders, and one person's memory.</p>
              <p>The result is predictable. Leadership makes capital decisions on incomplete information. Preventive maintenance slips because nobody can see the whole backlog. Compliance deadlines are met heroically rather than systematically. A retirement takes twenty years of context out the door. Nothing is <em>broken</em>, exactly &mdash; it just costs far more than it should, in money, in risk, and in the attention of people who should be doing higher-value work.</p>
              <p>GCS was founded to close that gap with a specific approach: make the operation legible first, then make it accountable, then make it faster. In that order. Software that arrives before clarity simply automates confusion.</p>
              <p>Our name is deliberate. A general contractor does not just design a building. They sequence every trade, hold every subcontractor to a schedule, resolve conflicts between systems, and deliver a finished structure that works. GCS does the same for an organization's operating model.</p>
            </div>
          </div>
          <aside>
            <div class="card card--flat">
              <span class="card__eyebrow">Mission</span>
              <h3 class="card__title">Turn operations into intelligence, action, and accountability.</h3>
              <p class="card__desc">Give every level of an organization &mdash; from the technician closing a work order to the executive approving a capital plan &mdash; the same trustworthy picture of reality, and a clear path from that picture to a decision.</p>
            </div>
            <div class="card card--flat" style="margin-top:1.25rem">
              <span class="card__eyebrow">Vision</span>
              <h3 class="card__title">Building Better Organizations.</h3>
              <p class="card__desc">Organizations that can answer &ldquo;what is our condition, what does it cost, what happens if we wait, and who owns it&rdquo; in minutes rather than weeks &mdash; and that improve measurably year over year because the answers are written down.</p>
            </div>
            <div class="callout callout--gold" style="margin-top:1.25rem">
              <span class="callout__icon" aria-hidden="true">""" + icon("compass", 20) + """</span>
              <p><strong>Operating principle.</strong> We would rather deliver an uncomfortable, accurate assessment than a comfortable one that lets a problem compound for another budget cycle.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container">
        <div class="section-header">
          <span class="section-label">The Core Idea</span>
          <h2 class="section-title">What &ldquo;Operations Intelligence&rdquo; Actually Means</h2>
          <p class="section-subtitle">It is not a dashboard. It is a discipline &mdash; four linked capabilities that turn raw operational activity into decisions an organization can defend.</p>
        </div>
        <div class="grid grid--4">
""" + "\n".join([
    card("layers", "1. Capture", "Operational reality gets recorded once, at the point it happens, in a structure that supports later analysis. Asset identity, condition, work performed, cost, and time all connect to the same record.",
         ["Single asset register", "Structured work history", "Cost linked to the asset, not the month"]),
    card("chart", "2. Interpret", "Raw records become a picture: what is degrading, what is consuming labor, what is drifting toward a compliance deadline, and where money is actually going compared to where it was budgeted.",
         ["Condition and criticality scoring", "Backlog and trend analysis", "Plan versus actual at every level"]),
    card("target", "3. Decide", "Interpretation becomes a ranked set of choices with stated tradeoffs. Not &ldquo;here is a chart,&rdquo; but &ldquo;here are three options, here is what each costs, here is what deferral does to risk.&rdquo;",
         ["Scenario comparison", "Deferral cost modeling", "Documented decision rationale"]),
    card("shield", "4. Account", "Every decision produces an owner, a date, and a verification step. The loop closes when someone confirms the outcome &mdash; and the record of that closure survives personnel change.",
         ["Named ownership", "Escalation on aging", "Auditable decision history"]),
]) + """
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">How We Are Built</span>
          <h2 class="section-title">Consulting, Software, and AI Workforce Are Three Different Things</h2>
          <p class="section-subtitle">Buyers are often sold one and given another. GCS operates in all three modes, and we are explicit about which one you are engaging &mdash; because the accountability model is different in each.</p>
        </div>
        <div class="table-scroll">
          <table class="matrix">
            <caption class="sr-only">Comparison of consulting, software platform, and AI workforce engagement models at GCS</caption>
            <thead>
              <tr>
                <th scope="col">Dimension</th>
                <th scope="col">Consulting</th>
                <th scope="col">Software (Nexus)</th>
                <th scope="col">AI Workforce (Genesis)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">What it is</th>
                <td>Senior practitioners working alongside your team to diagnose, design, and stand up an operating model.</td>
                <td>A configured platform that holds the operating model &mdash; assets, work, budgets, risks, approvals &mdash; in one place.</td>
                <td>Bounded software agents that execute defined operational tasks under human approval.</td>
              </tr>
              <tr>
                <th scope="row">What you get</th>
                <td>Assessment, target operating model, process design, governance structure, transition plan, and trained staff.</td>
                <td>A system of record and a decision surface: dashboards, registers, workflows, reporting, and audit trail.</td>
                <td>Throughput on repetitive analytical and administrative work: drafting, reconciling, monitoring, preparing.</td>
              </tr>
              <tr>
                <th scope="row">Who is accountable</th>
                <td>GCS for the quality of the design; the client for adopting it.</td>
                <td>GCS for the platform behaving correctly; the client for the accuracy of what is entered.</td>
                <td>Always a named person. Agents prepare and recommend; humans approve consequential actions.</td>
              </tr>
              <tr>
                <th scope="row">Where it fails</th>
                <td>When a strong design is delivered to an organization with no capacity to operate it.</td>
                <td>When software is deployed before the operating model is clear &mdash; it encodes the confusion.</td>
                <td>When authority is granted without bounds, or when nobody reviews the output.</td>
              </tr>
              <tr>
                <th scope="row">How GCS sequences it</th>
                <td>First. Clarity before configuration, always.</td>
                <td>Second. The platform reflects a model you have already agreed to.</td>
                <td>Third. Automation applied to a process that is already understood and measured.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="callout mt-lg">
          <span class="callout__icon" aria-hidden="true">""" + icon("alert", 20) + """</span>
          <p><strong>We will tell you when you do not need all three.</strong> Plenty of organizations need a clear-eyed assessment and a disciplined operating rhythm far more than they need another software subscription. If that is the honest answer for your situation, that is the answer you will get.</p>
        </div>
      </div>
    </section>

    <section class="section section--dark">
      <div class="container">
        <div class="section-header">
          <span class="section-label section-label--light">How We Work</span>
          <h2 class="section-title">The Engagement Arc</h2>
          <p class="section-subtitle">A repeatable sequence that produces something useful at every stage, so value does not depend on reaching the end.</p>
        </div>
        <div class="split">
          <div class="timeline timeline--dark">
            <div class="timeline__item">
              <span class="timeline__step">Stage 01</span>
              <h3 class="timeline__title">Ground Truth</h3>
              <p class="timeline__desc">Structured interviews, site walks, and document review to establish what is actually true today &mdash; asset inventory, condition, work volume, spend, staffing, systems in use, and where information genuinely lives. This stage frequently surfaces material discrepancies between the official record and the operating reality.</p>
            </div>
            <div class="timeline__item">
              <span class="timeline__step">Stage 02</span>
              <h3 class="timeline__title">Diagnostic and Priorities</h3>
              <p class="timeline__desc">A written assessment naming the specific constraints limiting performance, ranked by impact and by the effort required to relieve them. Deliverable includes the near-term actions worth taking regardless of whether the engagement continues.</p>
            </div>
            <div class="timeline__item">
              <span class="timeline__step">Stage 03</span>
              <h3 class="timeline__title">Target Operating Model</h3>
              <p class="timeline__desc">The intended future state expressed operationally: who owns what, which decisions happen at which level, what the standard cadence is, which records are authoritative, and what gets measured. Designed with your team, not delivered to them.</p>
            </div>
            <div class="timeline__item">
              <span class="timeline__step">Stage 04</span>
              <h3 class="timeline__title">Instrumentation</h3>
              <p class="timeline__desc">The model is made real &mdash; asset registers built, workflows configured, dashboards stood up, reporting automated. Where Nexus is the right vehicle, it is configured to the model. Where existing systems are adequate, we improve them rather than replace them.</p>
            </div>
            <div class="timeline__item">
              <span class="timeline__step">Stage 05</span>
              <h3 class="timeline__title">Operating Rhythm</h3>
              <p class="timeline__desc">The cadence that keeps it alive: a weekly operational review, a monthly performance review, a quarterly capital and risk review, each with a defined agenda, owner, and escalation path. Without rhythm, instrumentation decays within two quarters.</p>
            </div>
            <div class="timeline__item">
              <span class="timeline__step">Stage 06</span>
              <h3 class="timeline__title">Transfer and Independence</h3>
              <p class="timeline__desc">Documentation, training, and a deliberate handoff so the organization runs the model without us. Our stated objective is that you should not need GCS to sustain what GCS helped you build.</p>
            </div>
          </div>
          <aside>
            <div class="card card--dark">
              <span class="card__eyebrow">Founder-Led</span>
              <h3 class="card__title">Sam Hurwitz is in the work, not above it</h3>
              <p class="card__desc">GCS is a founder-led firm by design. The person who sets the standard is the person on the site walk, in the assessment, and reviewing what gets delivered. There is no layer between the client and the accountable party.</p>
              <p class="card__desc" style="margin-top:0.875rem">That structure has a natural consequence: GCS deliberately limits how many engagements run concurrently. Depth over volume is not a marketing position &mdash; it is the operating constraint that keeps quality consistent.</p>
              <a href="%sfounder/" class="btn btn--outline btn--sm" style="margin-top:1.25rem">About the Founder</a>
            </div>
            <div class="card card--dark" style="margin-top:1.25rem">
              <span class="card__eyebrow">What We Do Not Claim</span>
              <h3 class="card__title">Honest boundaries</h3>
              <ul class="card__list" role="list">
                <li>We do not publish client logos, revenue figures, or engagement counts on this site.</li>
                <li>Dashboards shown here are demonstrations built with invented data, labeled as such on every page.</li>
                <li>Capabilities in development are described as in development, not as shipped.</li>
                <li>We do not promise a percentage improvement before we have seen your operation.</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">What Guides Us</span>
          <h2 class="section-title">Five Commitments</h2>
        </div>
        <div class="grid grid--3">
""" % P + "\n".join([
    card("compass", "Clarity before technology", "Every engagement starts by making the operation legible. Tools follow understanding; when that order reverses, organizations end up with expensive software that documents a process nobody agreed to."),
    card("shield", "Accountability by name", "Findings, actions, and decisions carry an owner and a date. Diffuse responsibility is the most common root cause of operational drift we encounter, and it is the first thing we fix."),
    card("book", "Evidence over assertion", "Recommendations are traceable to observed data, documented conditions, or stated assumptions. Where evidence is thin, we say so and scope the work to strengthen it before committing capital."),
    card("users", "Transfer, don't create dependency", "Success means the client operates the model without us. Documentation, training, and handoff are scoped into the engagement from the start, not offered as an upsell at the end."),
    card("gauge", "Measure what changed", "Baseline first, then measure. If an engagement cannot show movement in an agreed metric, that is information we owe the client &mdash; not something to reframe in a summary slide."),
]) + """
        </div>
      </div>
    </section>

""" + S.cta_band(
    P,
    "See what this looks like in practice",
    "Walk through the Nexus Platform demonstration, review our reference implementation approach, or start a direct conversation about your operation.",
    ("nexus/", "Explore Nexus"),
    ("contact/", "Contact GCS"),
)

S.write(
    "about/",
    "About GCS | Operations Intelligence for Organizations That Run Things",
    "GCS turns operations into intelligence, action, and accountability. Our mission, vision, engagement approach, and the difference between consulting, software, and AI workforce.",
    about_body,
    active="about",
)


# ============================================================
# SOLUTIONS
# ============================================================
SOLUTIONS = [
    ("operations-intelligence", "chart", "Operations Intelligence", "Foundation",
     "The core discipline: one trustworthy operating picture assembled from the systems and records you already have, structured so that condition, cost, workload, and risk can be compared across the whole organization rather than argued department by department.",
     ["Unified operational data model across departments",
      "Single source of truth for asset, work, and cost records",
      "Leading indicators, not just month-end reporting",
      "Defined metric ownership and refresh cadence",
      "Drill path from executive summary to source record"]),
    ("facilities", "building", "Facilities", "Operations",
     "Buildings, grounds, and building systems managed as a portfolio with known condition and known cost &mdash; so that maintenance is planned against deterioration curves and criticality rather than allocated by whoever escalated most recently.",
     ["Space, system, and equipment registers",
      "Preventive maintenance program design and scheduling",
      "Facility condition assessment and deficiency tracking",
      "Custodial, grounds, and trades workload modeling",
      "Energy and utility consumption visibility"]),
    ("infrastructure", "route", "Infrastructure", "Operations",
     "Roads, water and sewer networks, stormwater systems, bridges, fleet, and public assets brought into a single condition-and-criticality framework that supports defensible prioritization and grant-ready documentation.",
     ["Linear and networked asset inventory",
      "Condition scoring and deterioration modeling",
      "Criticality and consequence-of-failure rating",
      "Renewal sequencing and deferral cost analysis",
      "Documentation structured for grant applications"]),
    ("capital-planning", "calendar", "Capital Planning", "Strategy",
     "Multi-year capital programs built on asset condition and risk rather than on last year's list plus inflation &mdash; with scenario comparison that shows leadership and governing bodies exactly what deferral costs.",
     ["Five and ten-year capital plan construction",
      "Needs-based prioritization scoring model",
      "Funding scenario modeling and sequencing",
      "Deferral risk and cost-escalation analysis",
      "Board, council, and public presentation materials"]),
    ("executive-dashboards", "gauge", "Executive Dashboards", "Visibility",
     "Decision surfaces built for the people who allocate resources: current state, direction of travel, what needs a decision, and what happens if the decision waits &mdash; on one screen, refreshed on a known schedule.",
     ["Role-specific views for executives, directors, and supervisors",
      "Exception-first design that surfaces what changed",
      "Trend and trajectory rather than point-in-time only",
      "Documented metric definitions and data lineage",
      "Board-ready export in presentation format"]),
    ("asset-intelligence", "cube", "Asset Intelligence", "Foundation",
     "A complete, hierarchical asset register carrying identity, location, condition, criticality, cost history, and remaining useful life &mdash; the substrate every other operational discipline depends on.",
     ["Asset hierarchy, classification, and unique identity",
      "Condition assessment methodology and scoring",
      "Total cost of ownership and lifecycle tracking",
      "Remaining useful life and replacement forecasting",
      "Warranty, contract, and specification linkage"]),
    ("risk-management", "alert", "Risk Management", "Assurance",
     "Operational risk identified, rated, owned, and reviewed on a schedule &mdash; covering asset failure, safety exposure, regulatory action, service interruption, single points of failure, and knowledge loss.",
     ["Risk register with likelihood and consequence rating",
      "Named risk owners and review cadence",
      "Mitigation planning with tracked completion",
      "Business continuity and emergency response planning",
      "Insurance and loss-exposure documentation support"]),
    ("compliance", "check-doc", "Compliance", "Assurance",
     "Regulatory obligations mapped to specific assets, activities, and people, with automated advance notice, evidence capture, and an audit trail that reconstructs what was done and when &mdash; years later if necessary.",
     ["Obligation register mapped to asset and owner",
      "Inspection, certification, and permit scheduling",
      "Evidence capture and retention structure",
      "Automated escalation ahead of deadlines",
      "Audit and open-records response packages"]),
    ("workflow-automation", "flow", "Workflow Automation", "Efficiency",
     "The handoffs between people and systems made explicit, then automated where automation is safe &mdash; removing rekeying, chasing, and status meetings that exist only because information does not move on its own.",
     ["Current-state process mapping and friction analysis",
      "Request intake, routing, and approval chains",
      "System-to-system integration and data movement",
      "Automated notification, escalation, and SLA tracking",
      "Exception handling with defined human checkpoints"]),
    ("executive-reporting", "report", "Executive Reporting", "Visibility",
     "Recurring reporting produced from the operating record rather than reassembled by hand each cycle &mdash; consistent, comparable across periods, and defensible when questioned by an auditor or a governing body.",
     ["Automated monthly and quarterly operational reporting",
      "Board, council, and committee packages",
      "Grant, regulatory, and statutory reporting support",
      "Consistent period-over-period comparability",
      "Narrative context alongside the numbers"]),
    ("operational-readiness", "shield", "Operational Readiness", "Assurance",
     "The capacity to absorb disruption: documented procedures, tested continuity plans, cross-trained staff, and captured institutional knowledge &mdash; so that a storm, an outage, or a retirement does not become an operational crisis.",
     ["Standard operating procedure development",
      "Continuity of operations and recovery planning",
      "Emergency response role definition and tabletop exercises",
      "Succession mapping and knowledge capture",
      "Readiness assessment against defined scenarios"]),
    ("ai-assisted-operations", "cpu", "AI Assisted Operations", "Emerging",
     "Bounded AI agents applied to defined operational work &mdash; reconciling records, drafting reports, monitoring thresholds, preparing analysis &mdash; always under human approval for anything consequential, with a complete audit record.",
     ["Task-scoped agents with written authority limits",
      "Mandatory approval gates on consequential actions",
      "Full decision record: input, output, approver, timestamp",
      "Human review sampling and drift monitoring",
      "Published boundaries on what is never automated"]),
]

sol_cards = "\n".join(
    card(i, t, d, b, anchor=a, eyebrow=e) for a, i, t, e, d, b in SOLUTIONS
)

sol_anchors = "\n".join(
    '          <a href="#%s">%s</a>' % (a, t) for a, i, t, e, d, b in SOLUTIONS
)

solutions_body = S.page_hero(
    P,
    "Solutions",
    "Twelve Disciplines. One Operating Picture.",
    "GCS solutions are not modules to be purchased independently &mdash; they are twelve linked disciplines that compound. Asset intelligence makes capital planning defensible. Capital planning makes risk management concrete. Compliance evidence falls out of workflows that were already running.",
    [(None, "Solutions")],
    actions='<a href="%srequest-demo/" class="btn btn--gold">Request a Demo</a><a href="%sindustries/" class="btn btn--outline">Industries We Serve</a>' % (P, P),
) + """    <section class="section">
      <div class="container">
        <nav class="anchor-list" aria-label="Jump to a solution">
%s
        </nav>
        <div class="grid grid--3">
%s
        </div>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Sequencing</span>
          <h2 class="section-title">Where Organizations Should Start</h2>
          <p class="section-subtitle">Attempting all twelve at once is the most reliable way to finish none. This is the sequence that works, and the reason each stage precedes the next.</p>
        </div>
        <div class="split split--even">
          <div class="timeline">
            <div class="timeline__item">
              <span class="timeline__step">First</span>
              <h3 class="timeline__title">Asset Intelligence and Operations Intelligence</h3>
              <p class="timeline__desc">Nothing downstream is trustworthy without a defensible answer to &ldquo;what do we own, where is it, what condition is it in, and what has it cost us.&rdquo; Organizations that skip this end up with sophisticated analysis of unreliable inputs.</p>
            </div>
            <div class="timeline__item">
              <span class="timeline__step">Second</span>
              <h3 class="timeline__title">Facilities, Infrastructure, and Compliance</h3>
              <p class="timeline__desc">Apply the register to daily operating reality. This is where the first visible wins appear: preventive maintenance actually scheduled, deadlines caught in advance instead of discovered late, backlog quantified rather than felt.</p>
            </div>
            <div class="timeline__item">
              <span class="timeline__step">Third</span>
              <h3 class="timeline__title">Capital Planning, Risk, and Readiness</h3>
              <p class="timeline__desc">With condition data accumulating, planning becomes evidence-based. Capital requests carry justification. Risk ratings reference real failure history. Continuity planning targets the assets that actually matter.</p>
            </div>
            <div class="timeline__item">
              <span class="timeline__step">Fourth</span>
              <h3 class="timeline__title">Dashboards, Reporting, and Automation</h3>
              <p class="timeline__desc">Now visibility and automation pay off, because they are built on a model the organization agreed to. Reporting stops consuming days per cycle. Workflow automation removes handoffs that were already mapped.</p>
            </div>
            <div class="timeline__item">
              <span class="timeline__step">Fifth</span>
              <h3 class="timeline__title">AI Assisted Operations</h3>
              <p class="timeline__desc">Automation of judgment-adjacent work comes last, applied only to processes that are already understood, measured, and stable. Applying AI to an undefined process produces fast, confident, unreliable output.</p>
            </div>
          </div>
          <div>
            <div class="card card--flat">
              <span class="card__eyebrow">Delivery Model</span>
              <h3 class="card__title">How solutions are delivered</h3>
              <ul class="card__list" role="list">
                <li><strong>Advisory engagement.</strong> Assessment, design, and governance structure delivered as documented work product your team owns.</li>
                <li><strong>Platform configuration.</strong> Nexus configured to the operating model, with registers built and workflows live.</li>
                <li><strong>Embedded support.</strong> GCS operating alongside your team through a transition period, with a defined exit.</li>
                <li><strong>Program oversight.</strong> Ongoing review cadence and reporting for organizations that want sustained external rigor.</li>
              </ul>
            </div>
            <div class="callout callout--gold" style="margin-top:1.25rem">
              <span class="callout__icon" aria-hidden="true">%s</span>
              <p><strong>Scope is set after the diagnostic, not before it.</strong> We do not quote a twelve-discipline program to an organization whose real constraint is that three people are doing the work of six. The diagnostic determines the scope, and sometimes the honest answer is a narrow engagement.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Outcomes</span>
          <h2 class="section-title">What Changes When This Works</h2>
          <p class="section-subtitle">Described as capabilities an organization gains &mdash; not as percentage improvements we have not measured in your environment.</p>
        </div>
        <div class="grid grid--3">
          <div class="card card--flat">
            <h3 class="card__title">Questions answered in minutes</h3>
            <p class="card__desc">&ldquo;What is the condition of our water system?&rdquo; &ldquo;What did we spend on that building last year?&rdquo; &ldquo;What happens if we defer this three years?&rdquo; These stop being research projects and become queries.</p>
          </div>
          <div class="card card--flat">
            <h3 class="card__title">Capital requests that survive scrutiny</h3>
            <p class="card__desc">Requests arrive with condition data, criticality rating, deferral consequence, and comparison to alternatives &mdash; so the conversation is about priority rather than credibility.</p>
          </div>
          <div class="card card--flat">
            <h3 class="card__title">Compliance without heroics</h3>
            <p class="card__desc">Obligations are tracked with advance warning and captured evidence, so meeting them is a routine output of the system rather than a scramble by one person who remembers.</p>
          </div>
          <div class="card card--flat">
            <h3 class="card__title">Institutional memory that persists</h3>
            <p class="card__desc">What was done, why, by whom, and what it cost lives in the record rather than in one long-tenured employee's head. A retirement becomes a staffing event, not a knowledge loss event.</p>
          </div>
          <div class="card card--flat">
            <h3 class="card__title">Time returned to skilled staff</h3>
            <p class="card__desc">Reporting, reconciliation, status-chasing, and rekeying shrink. The hours go back to work that requires judgment, craft, or presence &mdash; the work you actually hired for.</p>
          </div>
          <div class="card card--flat">
            <h3 class="card__title">Fewer surprises</h3>
            <p class="card__desc">Failures that were foreseeable get foreseen. The organization spends more of its attention on planned work and less on emergencies that were quietly building for years.</p>
          </div>
        </div>
      </div>
    </section>

%s""" % (sol_anchors, sol_cards, icon("alert", 20), S.cta_band(
    P,
    "Which discipline is your constraint?",
    "Most organizations already know. A short diagnostic conversation is usually enough to confirm it and to determine whether GCS is the right partner for the work.",
))

S.write(
    "solutions/",
    "Solutions | Operations Intelligence, Facilities, Infrastructure & Capital Planning — GCS",
    "Twelve linked operational disciplines from GCS: operations intelligence, facilities, infrastructure, capital planning, dashboards, asset intelligence, risk, compliance, automation, reporting, readiness, and AI assisted operations.",
    solutions_body,
    active="solutions",
)


# ============================================================
# INDUSTRIES
# ============================================================
INDUSTRIES = [
    ("municipalities", "city", "Municipalities", "Public Sector",
     "General-purpose local government carrying an unusually wide operational surface: public works, utilities, facilities, fleet, parks, code enforcement, and emergency services &mdash; all funded from a constrained tax base and all subject to public scrutiny.",
     ["Fragmented asset records across departments",
      "Capital requests competing without a common scoring basis",
      "Grant and statutory reporting assembled manually",
      "Deep knowledge concentrated in long-tenured staff"],
     ["Consolidated asset register spanning every department",
      "Defensible capital prioritization for governing-body review",
      "Grant-ready condition documentation",
      "Procedures and records that survive turnover"]),
    ("cities", "building", "Cities", "Public Sector",
     "Larger urban governments with departmental scale, formal budgeting cycles, union agreements, and infrastructure portfolios substantial enough that prioritization errors carry material financial and service consequences.",
     ["Cross-departmental capital competition without shared criteria",
      "Aging infrastructure with incomplete condition baselines",
      "Multiple systems of record that disagree with each other",
      "High public visibility on service failures"],
     ["Portfolio-level condition and criticality view",
      "Scenario modeling across funding levels",
      "Executive dashboards for administration and council",
      "Reporting consistent enough to compare across years"]),
    ("townships", "city", "Townships", "Public Sector",
     "Smaller governments where one or two people carry responsibility across many functions. The binding constraint is rarely capability &mdash; it is capacity, and the absence of systems that let a small team see the whole picture.",
     ["Very small teams covering very broad scope",
      "Institutional knowledge held informally",
      "Limited administrative capacity for reporting",
      "Deferred maintenance accumulating without visibility"],
     ["Right-sized systems a small team can actually sustain",
      "Automated recurring reporting and reminders",
      "Documented procedures reducing key-person dependency",
      "Clear capital narrative for committee and public meetings"]),
    ("counties", "layers", "Counties", "Public Sector",
     "Multi-jurisdictional operations spanning courthouses, correctional facilities, health departments, county roads, bridges, parks, and shared services &mdash; frequently with autonomous departments and inconsistent data practices.",
     ["Departmental autonomy producing incompatible records",
      "Geographically dispersed facility portfolios",
      "Complex funding streams with distinct reporting rules",
      "Coordination overhead across independent offices"],
     ["Common data standard that respects departmental autonomy",
      "Portfolio view across dispersed facilities",
      "Fund-aware cost tracking and reporting",
      "Shared-service coordination structures"]),
    ("schools", "school", "Schools &amp; Districts", "Public Sector",
     "K&ndash;12 districts and higher education institutions operating substantial building portfolios on referendum-driven capital cycles, with occupant safety, indoor air quality, and community accountability as constant constraints.",
     ["Capital funding arriving in referendum-sized increments",
      "Aging systems in continuously occupied buildings",
      "Summer work windows compressing the schedule",
      "Community expectation of transparent justification"],
     ["Facility condition assessment across the portfolio",
      "Referendum and long-range facility plan support",
      "Preventive maintenance sequenced to academic calendar",
      "Board and community-ready documentation"]),
    ("healthcare", "health", "Healthcare", "Regulated",
     "Hospitals, health systems, and clinical facilities where plant operations directly affect patient safety and accreditation, and where documentation standards are among the most demanding of any sector.",
     ["Accreditation and life-safety documentation burden",
      "Critical systems requiring redundancy and testing evidence",
      "Continuous occupancy limiting maintenance windows",
      "Utility management program requirements"],
     ["Compliance calendars with captured evidence",
      "Critical asset criticality and redundancy mapping",
      "Work planning suited to 24/7 clinical operation",
      "Survey-ready audit trails"]),
    ("manufacturing", "factory", "Manufacturing", "Industrial",
     "Production environments where equipment availability is directly tied to output, and where the cost of unplanned downtime is measurable to the hour &mdash; making maintenance strategy a financial decision, not a technical one.",
     ["Unplanned downtime with quantifiable cost",
      "Reactive maintenance crowding out planned work",
      "Spare parts and inventory disconnected from criticality",
      "Safety and environmental obligations tied to equipment"],
     ["Criticality-based maintenance strategy",
      "Downtime cause analysis and reduction programs",
      "Spares policy aligned to failure consequence",
      "Integrated safety, environmental, and asset records"]),
    ("commercial", "store", "Commercial Real Estate", "Private Sector",
     "Owners and operators of commercial portfolios where building performance, capital timing, and tenant experience are directly connected to asset value and net operating income.",
     ["Capital timing decisions affecting valuation",
      "Inconsistent standards across a mixed portfolio",
      "Tenant service expectations versus operating cost",
      "Due diligence requiring credible condition data"],
     ["Portfolio-wide condition and capital forecasting",
      "Standardized operating practice across properties",
      "Service-level tracking and response measurement",
      "Transaction-ready asset documentation"]),
    ("property-management", "keys", "Property Management", "Private Sector",
     "Managers accountable to owners for buildings they do not own, where the core challenge is proving performance and justifying spend across properties with different systems, ages, and expectations.",
     ["Reporting obligations to multiple owners",
      "Work order volume outpacing coordination capacity",
      "Vendor performance difficult to compare",
      "Recurring cost patterns hidden across properties"],
     ["Owner-facing reporting produced automatically",
      "Standardized intake, routing, and escalation",
      "Vendor performance and cost benchmarking",
      "Cross-property cost pattern analysis"]),
    ("data-centers", "server", "Data Centers", "Industrial",
     "Facilities where power, cooling, and redundancy are the product. Maintenance discipline, change control, and documented resilience are not overhead &mdash; they are the service commitment.",
     ["Uptime commitments with contractual consequence",
      "Redundancy that must be verified, not assumed",
      "Change control on critical infrastructure",
      "Capacity planning across power, cooling, and space"],
     ["Critical system registers with redundancy mapping",
      "Maintenance windows planned against redundancy state",
      "Change control workflows with approval gates",
      "Capacity and utilization trend visibility"]),
    ("nonprofits", "hands", "Nonprofits", "Mission-Driven",
     "Mission-driven organizations operating facilities with constrained budgets, restricted funding, mixed staff and volunteer capacity, and an obligation to demonstrate stewardship to donors and boards.",
     ["Restricted funding limiting how work can be paid for",
      "Facility needs competing directly with program spending",
      "Limited administrative and technical capacity",
      "Board and donor expectations for stewardship evidence"],
     ["Right-sized practices sustainable with small teams",
      "Capital narratives suitable for grants and donors",
      "Restricted-fund-aware cost documentation",
      "Board reporting that demonstrates stewardship"]),
]


def industry_card(anchor, ic, name, sector, desc, challenges, delivers):
    ch = "".join("<li>%s</li>" % c for c in challenges)
    dl = "".join("<li>%s</li>" % d for d in delivers)
    return f"""          <article class="card reveal" id="{anchor}" style="scroll-margin-top:6rem">
            <span class="card__icon" aria-hidden="true">{icon(ic)}</span>
            <span class="card__eyebrow">{sector}</span>
            <h3 class="card__title">{name}</h3>
            <p class="card__desc">{desc}</p>
            <h4 class="card__eyebrow" style="margin-top:1.25rem;color:var(--color-text-subtle)">Common Constraints</h4>
            <ul class="card__list" role="list">{ch}</ul>
            <h4 class="card__eyebrow" style="margin-top:1.125rem;color:var(--color-text-subtle)">What GCS Brings</h4>
            <ul class="card__list" role="list">{dl}</ul>
          </article>"""


ind_cards = "\n".join(industry_card(*i) for i in INDUSTRIES)
ind_anchors = "\n".join(
    '          <a href="#%s">%s</a>' % (i[0], i[2]) for i in INDUSTRIES
)

industries_body = S.page_hero(
    P,
    "Industries",
    "Eleven Sectors. One Underlying Problem.",
    "A township public works yard and a hospital plant operations department look nothing alike &mdash; but both are trying to answer the same four questions: what do we own, what condition is it in, what will it cost, and who owns the decision. GCS adapts the method; the discipline stays constant.",
    [(None, "Industries")],
    actions='<a href="%ssolutions/" class="btn btn--gold">See Solutions</a><a href="%sreference/" class="btn btn--outline">Reference Implementations</a>' % (P, P),
) + """    <section class="section">
      <div class="container">
        <nav class="anchor-list" aria-label="Jump to an industry">
%s
        </nav>
        <div class="grid grid--3">
%s
        </div>
      </div>
    </section>

    <section class="section section--dark">
      <div class="container">
        <div class="section-header">
          <span class="section-label section-label--light">Sector Depth</span>
          <h2 class="section-title">Public Sector Is Where GCS Is Strongest</h2>
          <p class="section-subtitle">Municipalities, townships, counties, school districts, and public authorities carry constraints that most commercial operational tooling was never designed for.</p>
        </div>
        <div class="grid grid--2">
          <div class="card card--dark">
            <h3 class="card__title">Constraints that shape everything</h3>
            <ul class="card__list" role="list">
              <li><strong>Public accountability.</strong> Decisions are made in open meetings and defended in public. Justification must be legible to a resident, not only to an engineer.</li>
              <li><strong>Statutory obligation.</strong> Reporting, retention, procurement, and bidding requirements constrain how work can be done, not just what gets done.</li>
              <li><strong>Fiscal-year rigidity.</strong> Funds appropriated in a cycle often cannot cross it. Timing is as consequential as amount.</li>
              <li><strong>Restricted funding.</strong> Grant and dedicated-fund dollars carry eligibility and documentation rules that shape which work is fundable at all.</li>
              <li><strong>Political turnover.</strong> Governing bodies change. Programs that depend on a specific administration's enthusiasm do not survive; documented, defensible programs do.</li>
              <li><strong>Small teams, broad scope.</strong> The person managing a facilities portfolio may also manage fleet, purchasing, and emergency response.</li>
            </ul>
          </div>
          <div class="card card--dark">
            <h3 class="card__title">How GCS designs around them</h3>
            <ul class="card__list" role="list">
              <li><strong>Documentation as a first-class deliverable.</strong> Everything produced is structured to survive an open records request, an audit, and a change in administration.</li>
              <li><strong>Prioritization that is publicly defensible.</strong> Scoring models based on condition, criticality, and consequence &mdash; explainable at a public meeting without a technical background.</li>
              <li><strong>Grant-ready by construction.</strong> Condition and cost documentation is captured in the format funding applications require, not reassembled at deadline.</li>
              <li><strong>Fund-aware records.</strong> Cost tracking that respects fund restrictions and supports the reporting each funding source demands.</li>
              <li><strong>Right-sized to capacity.</strong> A system a two-person department cannot sustain is a system that will be abandoned. Scope follows capacity.</li>
              <li><strong>Continuity through turnover.</strong> Institutional knowledge captured in records and procedures rather than in one person's tenure.</li>
            </ul>
          </div>
        </div>
        <div class="callout callout--dark mt-lg">
          <span class="callout__icon" aria-hidden="true">%s</span>
          <p><strong>Jefferson Township is our published reference implementation.</strong> It is documented on this site using publicly available information only, and it illustrates the approach GCS applies in municipal environments. <a href="%sreference/" style="color:var(--color-gold-light);text-decoration:underline">Review the reference implementation</a>.</p>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Common Thread</span>
          <h2 class="section-title">What Every Sector Shares</h2>
          <p class="section-subtitle">The vocabulary differs. The underlying failure modes are remarkably consistent.</p>
        </div>
        <div class="grid grid--4">
          <div class="card card--flat">
            <span class="card__number">01</span>
            <h3 class="card__title">The register is incomplete</h3>
            <p class="card__desc">Assets exist that no system knows about. Systems list assets that no longer exist. Nobody is confident which is which, so nobody fully trusts the analysis built on top of it.</p>
          </div>
          <div class="card card--flat">
            <span class="card__number">02</span>
            <h3 class="card__title">Cost is tracked by period, not by thing</h3>
            <p class="card__desc">The organization knows what it spent last quarter. It cannot say what a specific building, vehicle, or pump station has cost over its life &mdash; which makes replace-versus-repair a matter of opinion.</p>
          </div>
          <div class="card card--flat">
            <span class="card__number">03</span>
            <h3 class="card__title">Urgent work displaces important work</h3>
            <p class="card__desc">Reactive work consumes the capacity that preventive work required, which generates more reactive work. The cycle is self-reinforcing and rarely visible in aggregate.</p>
          </div>
          <div class="card card--flat">
            <span class="card__number">04</span>
            <h3 class="card__title">Knowledge lives in people</h3>
            <p class="card__desc">The critical understanding of how a system actually behaves is held by individuals, not records. Every departure is an uncontrolled loss of operating capability.</p>
          </div>
        </div>
      </div>
    </section>

%s""" % (ind_anchors, ind_cards, icon("book", 20), P, S.cta_band(
    P,
    "Does your sector look like this?",
    "Tell us how your operation is structured and where the friction is. We will tell you honestly whether GCS is the right fit and what a realistic first engagement would cover.",
    ("contact/", "Start a Conversation"),
    ("request-demo/", "Request a Demo"),
))

S.write(
    "industries/",
    "Industries | Municipalities, Schools, Healthcare, Manufacturing & More — GCS",
    "GCS serves municipalities, cities, townships, counties, schools, healthcare, manufacturing, commercial real estate, property management, data centers, and nonprofits.",
    industries_body,
    active="industries",
)

print("content pages part 1 written")

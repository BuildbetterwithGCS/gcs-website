# -*- coding: utf-8 -*-
"""Genesis AI Workforce page."""

import shell as S
from pages_content import icon, card

P = "../"


def agent(initials, name, role, desc, status, chip, avatar=""):
    av = "agent__avatar agent__avatar--%s" % avatar if avatar else "agent__avatar"
    return f"""            <article class="agent">
              <div class="agent__head">
                <span class="{av}" aria-hidden="true">{initials}</span>
                <div>
                  <h4 class="agent__name">{name}</h4>
                  <span class="agent__role">{role}</span>
                </div>
              </div>
              <p class="agent__desc">{desc}</p>
              <div class="agent__foot">
                <span class="chip chip--{chip}">{status}</span>
              </div>
            </article>"""


DEPARTMENTS = [
    ("Operations Analysis", "teal", [
        ("CA", "Condition Analyst", "Asset condition and deterioration",
         "Reviews inspection records and work history to flag assets whose condition trajectory has changed, and drafts the supporting evidence for a re-rating. Does not change a condition rating on its own.",
         "In development", "warn"),
        ("BA", "Backlog Analyst", "Work management",
         "Monitors open work volume, aging, and mix. Identifies where reactive work is displacing preventive work and prepares the analysis a supervisor needs to make the case for resourcing.",
         "In development", "warn"),
        ("VA", "Variance Analyst", "Cost and budget",
         "Reconciles committed spend against plan at fund and project level, isolates the drivers behind a deviation, and drafts the variance narrative for review.",
         "In development", "warn"),
    ]),
    ("Compliance &amp; Assurance", "gold", [
        ("OC", "Obligation Coordinator", "Regulatory tracking",
         "Maintains the obligation register, calculates upcoming due dates, and issues advance notice to named owners. Escalates when an obligation approaches its window without a scheduled action.",
         "In development", "warn"),
        ("EA", "Evidence Assembler", "Audit support",
         "Gathers inspection records, certificates, photographs, and work history into an evidence package structured for a specific audit, survey, or open records request.",
         "In development", "warn"),
        ("RM", "Risk Monitor", "Risk register",
         "Watches for conditions that should trigger a risk re-rating &mdash; repeat failures, mitigation slippage, changed redundancy &mdash; and prepares the re-rating recommendation for the risk owner.",
         "Concept", "neutral"),
    ]),
    ("Reporting &amp; Communication", "", [
        ("RW", "Report Writer", "Recurring reporting",
         "Assembles recurring operational, board, and grant reports from the operating record on schedule. Produces a draft with flagged sections requiring human confirmation, never a final distributed document.",
         "In development", "warn"),
        ("BS", "Briefing Synthesizer", "Executive summary",
         "Condenses a period of operational activity into an executive summary that leads with what changed and what needs a decision, rather than restating every metric.",
         "In development", "warn"),
        ("DC", "Documentation Clerk", "Procedures and records",
         "Drafts and maintains standard operating procedures from observed practice and subject-matter interviews, keeping documentation current as processes change.",
         "Concept", "neutral"),
    ]),
    ("Planning &amp; Capital", "violet", [
        ("SP", "Scenario Planner", "Capital planning",
         "Builds and compares funding scenarios against the condition and criticality data, quantifying what each level of appropriation produces over five and ten years.",
         "Concept", "neutral"),
        ("DF", "Deferral Forecaster", "Consequence modeling",
         "Models the cost and risk consequence of deferring a specific capital item, so a deferral decision is made with its downstream cost visible.",
         "Concept", "neutral"),
        ("GS", "Grant Scout", "Funding readiness",
         "Matches documented capital needs against published funding program criteria and assembles the condition documentation an application requires.",
         "Concept", "neutral"),
    ]),
]

dept_sections = "\n".join(
    """        <section class="mb-lg">
          <h3 class="section-title" style="font-size:1.25rem;margin-bottom:1.25rem;color:#fff">%s</h3>
          <div class="agent-grid">
%s
          </div>
        </section>"""
    % (dept, "\n".join(agent(*a[:5], chip=a[5], avatar=av) for a in agents))
    for dept, av, agents in DEPARTMENTS
)


genesis_body = S.page_hero(
    P,
    "Genesis AI Workforce",
    "Bounded Agents. Named Accountability.",
    "Genesis is the GCS approach to AI in operations: task-scoped software agents that prepare, analyze, monitor, and draft &mdash; operating inside written authority limits, escalating anything consequential to a named human, and leaving a complete record of what they did and who allowed it.",
    [(None, "Genesis")],
    actions='<a href="%sresponsible-ai/" class="btn btn--gold">Read Our AI Governance</a><a href="%srequest-demo/" class="btn btn--outline">Request a Demo</a>' % (P, P),
    dash=True,
) + """    <section class="section">
      <div class="container">
        <div class="split">
          <div>
            <div class="section-header section-header--left">
              <span class="section-label">The Concept</span>
              <h2 class="section-title">What an &ldquo;AI Workforce&rdquo; Actually Means</h2>
            </div>
            <div class="prose prose--wide">
              <p>The phrase is used loosely enough to be nearly meaningless. Here is what GCS means by it, stated precisely.</p>
              <p>A meaningful share of operational work is <strong>analytical and administrative</strong> rather than physical or judgment-heavy. Reconciling a spend report against a budget. Checking which certifications fall due in the next 60 days. Reading three months of work orders to find out why a pump keeps failing. Assembling the same board report every quarter from the same six sources. Drafting a procedure from an interview. Cross-checking an asset register against a field inventory.</p>
              <p>This work is real, necessary, and expensive &mdash; and it is frequently done by the most experienced people in the organization, because they are the only ones who know where the information lives. It consumes the capacity that should be going to diagnosis, planning, and craft.</p>
              <p>Genesis is a structured set of agents that take on that category of work. Each agent has one defined job, a written scope, explicit data access, and a hard boundary on what it may do without a human saying yes. It is called a workforce because it is organized like one: departments, defined roles, a reporting line, and supervision.</p>
              <p>What it is <em>not</em>: a general-purpose assistant, an autonomous decision-maker, or a replacement for operational judgment. An agent that reads the whole asset register and confidently recommends a capital plan without anyone able to trace how it got there is not a productivity gain. It is an audit finding waiting to happen.</p>
            </div>
          </div>
          <aside>
            <div class="card card--flat">
              <span class="card__eyebrow">Design Constraints</span>
              <h3 class="card__title">Non-negotiable properties</h3>
              <ul class="card__list" role="list">
                <li><strong>One job per agent.</strong> Narrow scope makes behavior predictable and failure diagnosable.</li>
                <li><strong>Written charter.</strong> Purpose, data access, permitted actions, approval thresholds, escalation triggers, and deactivation criteria &mdash; documented before activation.</li>
                <li><strong>Approval gate on consequence.</strong> Anything that commits funds, changes a compliance posture, affects a person, or communicates externally requires human authorization.</li>
                <li><strong>Complete decision record.</strong> Inputs, output, confidence, approver, timestamp &mdash; retained and queryable.</li>
                <li><strong>Immediate suspension.</strong> Any authorized reviewer can stop any agent without seeking permission.</li>
                <li><strong>Stated uncertainty.</strong> Output declares its confidence and its basis rather than presenting everything with equal authority.</li>
              </ul>
            </div>
            <div class="callout callout--gold" style="margin-top:1.25rem">
              <span class="callout__icon" aria-hidden="true">""" + icon("alert", 20) + """</span>
              <p><strong>Honest status.</strong> Genesis is in active development. The agent roles described on this page are the designed architecture. Several are in development inside GCS engagements; others are at concept stage. Each is labeled below. Nothing here should be read as generally available product.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="dash">
      <div class="container">
        %s

        <div class="section-header" style="margin-top:2rem">
          <span class="section-label section-label--light">Structure</span>
          <h2 class="section-title">Departments and Operational Agents</h2>
          <p class="section-subtitle">Genesis is organized into departments that mirror how operational analysis actually divides. Each agent below shows its current maturity honestly.</p>
        </div>

%s

        <div class="callout callout--dark">
          <span class="callout__icon" aria-hidden="true">%s</span>
          <div>
            <p><strong>Maturity labels used above.</strong> &ldquo;In development&rdquo; means the agent is being built and exercised inside GCS engagements under close supervision. &ldquo;Concept&rdquo; means the role is designed and specified but not yet built. No agent on this page is offered as a generally available, self-service product.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section section--dark">
      <div class="container">
        <div class="section-header">
          <span class="section-label section-label--light">Governance</span>
          <h2 class="section-title">How an Agent Action Actually Flows</h2>
          <p class="section-subtitle">Six stages. The gate at stage four is the architectural feature, not a configuration option.</p>
        </div>
        <div class="flow">
          <div class="flow__step">
            <h3 class="flow__title">Trigger</h3>
            <p class="flow__desc">A scheduled cycle, a threshold crossing, or an explicit human request activates the agent. The trigger and its parameters are recorded.</p>
          </div>
          <div class="flow__step">
            <h3 class="flow__title">Scoped Retrieval</h3>
            <p class="flow__desc">The agent reads only the data its charter permits. Every source consulted, and how current it was, is captured.</p>
          </div>
          <div class="flow__step">
            <h3 class="flow__title">Analysis &amp; Draft</h3>
            <p class="flow__desc">The agent produces its output with a stated confidence level and the factors that drove it, expressed in operational language.</p>
          </div>
          <div class="flow__step">
            <h3 class="flow__title">Approval Gate</h3>
            <p class="flow__desc">If the action is consequential, it routes to a named human with full context. An unapproved item does not execute &mdash; it expires. There is no timeout-to-approve.</p>
          </div>
          <div class="flow__step">
            <h3 class="flow__title">Execution</h3>
            <p class="flow__desc">Only after authorization does the action take effect, attributed to both the approving human and the executing agent.</p>
          </div>
          <div class="flow__step">
            <h3 class="flow__title">Record &amp; Verify</h3>
            <p class="flow__desc">The decision record is written and the observable outcome is captured, which feeds evaluation and drift monitoring.</p>
          </div>
        </div>

        <div class="grid grid--2 mt-lg" style="gap:1.25rem">
          <div class="panel">
            <div class="panel__head"><h3 class="panel__title">Approval Thresholds &mdash; Sample Configuration</h3><span class="demo-tag">Illustrative</span></div>
            <div class="panel__body panel__body--flush">
              <div class="dtable-wrap" tabindex="0" role="region" aria-label="Scrollable data table">
                <table class="dtable">
                  <caption>Illustrative demonstration data &mdash; example agent authority matrix</caption>
                  <thead>
                    <tr><th scope="col">Action Class</th><th scope="col">Agent May</th><th scope="col">Requires</th></tr>
                  </thead>
                  <tbody>
                    <tr><td><strong>Read operational records</strong></td><td><span class="chip chip--good">Autonomous</span></td><td>Charter scope only</td></tr>
                    <tr><td><strong>Produce analysis or draft</strong></td><td><span class="chip chip--good">Autonomous</span></td><td>Marked as draft</td></tr>
                    <tr><td><strong>Notify a named owner</strong></td><td><span class="chip chip--good">Autonomous</span></td><td>Internal recipients only</td></tr>
                    <tr><td><strong>Create a work order</strong></td><td><span class="chip chip--warn">Gated</span></td><td>Supervisor approval</td></tr>
                    <tr><td><strong>Change a condition or risk rating</strong></td><td><span class="chip chip--warn">Gated</span></td><td>Asset or risk owner approval</td></tr>
                    <tr><td><strong>Commit funds</strong></td><td><span class="chip chip--risk">Prohibited</span></td><td>Human action only</td></tr>
                    <tr><td><strong>Communicate externally</strong></td><td><span class="chip chip--risk">Prohibited</span></td><td>Human action only</td></tr>
                    <tr><td><strong>Alter an audit record</strong></td><td><span class="chip chip--risk">Prohibited</span></td><td>Not permitted at any level</td></tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
          <div class="panel">
            <div class="panel__head"><h3 class="panel__title">Decision Record &mdash; Sample Entry</h3><span class="demo-tag">Illustrative</span></div>
            <div class="panel__body">
              <dl class="map-detail__grid" style="gap:1.125rem 1.5rem">
                <div class="map-detail__field"><dt>Record ID</dt><dd>GEN-2026-004182</dd></div>
                <div class="map-detail__field"><dt>Agent</dt><dd>Obligation Coordinator</dd></div>
                <div class="map-detail__field"><dt>Trigger</dt><dd>Scheduled 30-day window scan</dd></div>
                <div class="map-detail__field"><dt>Sources consulted</dt><dd>Obligation register, work schedule, contact roster</dd></div>
                <div class="map-detail__field"><dt>Output</dt><dd>38 backflow devices flagged; notice drafted</dd></div>
                <div class="map-detail__field"><dt>Stated confidence</dt><dd>High &mdash; complete source data</dd></div>
                <div class="map-detail__field"><dt>Action class</dt><dd>Notify named owner (autonomous)</dd></div>
                <div class="map-detail__field"><dt>Escalation</dt><dd>Raised to Operations Director &mdash; no scheduled appointments</dd></div>
                <div class="map-detail__field"><dt>Approved by</dt><dd>Compliance Coordinator</dd></div>
                <div class="map-detail__field"><dt>Executed</dt><dd>Notice issued; escalation opened</dd></div>
                <div class="map-detail__field"><dt>Outcome verified</dt><dd>Pending &mdash; 10-day directive open</dd></div>
                <div class="map-detail__field"><dt>Retention</dt><dd>Per client schedule; append-only</dd></div>
              </dl>
              <p class="panel__hint" style="margin-top:1.25rem">Every field above exists so that a specific question can be answered years later: what did the system see, what did it conclude, who allowed it, and what happened as a result.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Oversight</span>
          <h2 class="section-title">Founder Oversight and the Supervision Model</h2>
          <p class="section-subtitle">Oversight that exists on paper is not oversight. These are the mechanisms that make it real.</p>
        </div>
        <div class="grid grid--3">
%s
        </div>

        <hr class="divider" />

        <div class="split">
          <div>
            <div class="section-header section-header--left">
              <span class="section-label">Auditability</span>
              <h2 class="section-title">Built for the Question Asked Three Years Later</h2>
            </div>
            <div class="prose prose--wide">
              <p>The hardest question an operational system ever faces is not asked while it is running. It is asked long afterward, by an auditor, a new administrator, a grant monitor, an attorney, or a resident at a public meeting: <em>why did we do that?</em></p>
              <p>In most organizations, the answer is reconstructed from email, memory, and inference. Genesis is designed so that the answer is retrieved rather than reconstructed. Each decision record is append-only and carries the full chain &mdash; trigger, sources, output, confidence, approver, execution, outcome.</p>
              <p>For public-sector clients this matters more than anywhere else. A municipal capital decision may be examined by a governing body that has entirely turned over, under an open records request, or during a grant compliance review. A system that cannot produce a defensible reconstruction of its own reasoning creates institutional exposure rather than reducing it.</p>
              <p>The same property makes correction possible. When an agent produces bad output, the record shows exactly which inputs and which reasoning produced it &mdash; which is what allows the failure to be fixed at the layer that actually failed rather than patched at the surface.</p>
            </div>
          </div>
          <aside>
            <div class="card card--flat">
              <span class="card__eyebrow">What We Will Not Automate</span>
              <h3 class="card__title">Published boundaries</h3>
              <ul class="card__list" role="list">
                <li>Hiring, discipline, evaluation, or termination of an employee</li>
                <li>Final determination on a benefit, permit, license, or citation</li>
                <li>Binding financial commitment, contract award, or procurement decision</li>
                <li>Override of a safety control or emergency protocol</li>
                <li>External communication on behalf of an organization</li>
                <li>Alteration of a compliance record, filing, or audit trail</li>
                <li>Surveillance of individuals or inference of protected characteristics</li>
              </ul>
              <p class="card__desc" style="margin-top:1rem">In each of these areas an agent may assemble evidence and prepare options. A person decides, and the record says who.</p>
              <a href="%sresponsible-ai/" class="btn btn--ghost btn--sm" style="margin-top:1.25rem">Full Responsible AI Statement</a>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Straight Answers</span>
          <h2 class="section-title">Questions Organizations Actually Ask</h2>
        </div>
        <div class="accordion" style="max-width:820px;margin-inline:auto">
          <details class="accordion__item">
            <summary>Is this going to replace my staff?</summary>
            <div class="accordion__body">
              <p>No &mdash; and we would be suspicious of anyone who told you otherwise about operational work. Genesis targets analytical and administrative tasks: reconciling, monitoring, drafting, assembling, cross-checking. It does not inspect a pump station, negotiate with a contractor, judge whether a road can wait another winter, or lead a crew through a storm response.</p>
              <p>What it changes is where skilled time goes. In most operations we assess, experienced people spend a substantial share of their week on information handling because they are the only ones who know where the information lives. Recovering that time is the objective.</p>
              <p>We do encourage clients to plan the human side deliberately &mdash; which tasks change, what training is needed, how roles evolve, and how that is communicated honestly. A deployment that surprises the workforce tends to fail regardless of technical quality.</p>
            </div>
          </details>
          <details class="accordion__item">
            <summary>What happens when it gets something wrong?</summary>
            <div class="accordion__body">
              <p>It will. Every AI system produces incorrect output, and a governance model that does not assume that is not a governance model.</p>
              <p>Our commitments: any authorized reviewer can suspend an agent immediately without an approval chain; affected parties are notified directly; downstream artifacts built on the faulty output are identified and corrected rather than quietly superseded; root cause is traced to the layer that actually failed &mdash; data, scope, model behavior, or oversight design; and material failures are documented in the decision record and reported to the client's governance body.</p>
            </div>
          </details>
          <details class="accordion__item">
            <summary>Where does our data go?</summary>
            <div class="accordion__body">
              <p>Client operational data is processed for the client's purposes under the engagement agreement and for nothing else. It is not used to train general-purpose or cross-client models without explicit written authorization. Agents receive the narrowest data scope that lets them do their job, and personal data is avoided in agent workflows unless operationally necessary.</p>
              <p>Where a third-party model provider is involved, the arrangement, its data handling terms, and its retention posture are disclosed to the client before deployment &mdash; not buried in a subprocessor list.</p>
            </div>
          </details>
          <details class="accordion__item">
            <summary>How do we explain this to our governing body?</summary>
            <div class="accordion__body">
              <p>This is the question public-sector clients ask most, and it is the right one. GCS supports it directly: written system descriptions in plain language, documented data flows and retention terms, the agent charter and approval matrix, evaluation results and known limitations, and the audit record structure available for open records and oversight purposes.</p>
              <p>We will also attend a public meeting and answer questions about the system directly. A vendor unwilling to do that is asking a public body to accept risk it cannot explain.</p>
            </div>
          </details>
          <details class="accordion__item">
            <summary>Can we start small?</summary>
            <div class="accordion__body">
              <p>You should. The sequence we recommend is a single agent, on a single well-understood process, with every output reviewed for a defined period. That produces real evidence about accuracy, effort saved, and where the process is actually ambiguous &mdash; which is usually more valuable than the automation itself.</p>
              <p>We also insist on a prerequisite: the process must already be understood and measured. Applying an agent to an undefined process produces fast, confident, unreliable output. That is why AI Assisted Operations is the last discipline in the GCS solution sequence, not the first.</p>
            </div>
          </details>
          <details class="accordion__item">
            <summary>What can we actually get today?</summary>
            <div class="accordion__body">
              <p>Today, Genesis capabilities are delivered inside GCS engagements under direct supervision &mdash; not as a self-service product you subscribe to. The agents labeled &ldquo;in development&rdquo; above are being built and exercised in that context. The ones labeled &ldquo;concept&rdquo; are designed and specified but not yet built.</p>
              <p>If you have a near-term operational need, the honest conversation is about what GCS can deliver in an engagement now, and where a Genesis agent might realistically fit within it. We will draw that line clearly rather than blurring it.</p>
            </div>
          </details>
        </div>
      </div>
    </section>

%s""" % (
    S.demo_banner(
        "Agent names, roles, sample authority matrices, and the decision record example on this page describe designed "
        "architecture and illustrative configurations. They are not a report of live production activity."
    ),
    dept_sections,
    icon("alert", 20),
    "\n".join([
        card("users", "Named human in every approval path", "Every gated action routes to a specific person with the standing authority to reject, modify, delay, escalate, or suspend the agent entirely. Approval is never automatic, and it never expires into consent."),
        card("book", "Charter before activation", "No agent operates without a written charter approved in advance: purpose, permitted data, permitted actions, thresholds, escalation triggers, and deactivation criteria. Changing an agent's authority requires documented approval."),
        card("gauge", "Scheduled review, not incident-driven", "Output is sampled and reviewed on a fixed cadence rather than only when something goes wrong. Reviews test accuracy, appropriateness, and whether the agent is still operating inside its charter."),
        card("chart", "Drift monitoring", "Approval and rejection rates, escalation frequency, and accuracy against observed outcomes are tracked continuously. A climbing rejection rate is treated as a design signal, not a user problem."),
        card("shield", "Immediate suspension authority", "Any authorized reviewer can halt any agent immediately. No approval chain is required to stop something &mdash; only to start it."),
        card("target", "Founder-level oversight", "At GCS, high-impact decisions and any change to an agent's authority reach the founder directly. Concentrated ownership is our structural answer to diffuse accountability."),
    ]),
    P,
    S.cta_band(
        P,
        "Discuss where an agent would actually help",
        "The useful conversation starts with a specific, repetitive, well-understood process in your operation — not with a capability list.",
        ("request-demo/", "Request a Demo"),
        ("responsible-ai/", "Read Our AI Governance"),
    ),
)

S.write(
    "genesis/",
    "Genesis AI Workforce | Bounded Agents with Human Oversight — GCS",
    "Genesis is the GCS AI workforce: task-scoped operational agents with written authority limits, mandatory human approval on consequential actions, and complete audit records.",
    genesis_body,
    active="genesis",
)

print("genesis written")

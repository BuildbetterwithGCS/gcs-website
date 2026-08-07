# -*- coding: utf-8 -*-
"""Reference implementations and founder biography pages."""

import shell as S
from pages_content import icon, card

P = "../"

# ============================================================
# REFERENCE IMPLEMENTATIONS
# ============================================================
reference_body = S.page_hero(
    P,
    "Reference Implementations",
    "How the Method Applies in the Real World",
    "GCS publishes reference implementations rather than case studies with borrowed logos. Each one describes a real operating context, the challenge it presents, the approach GCS applies, what gets delivered, and the benefits an organization should reasonably expect &mdash; without disclosing anything confidential.",
    [(None, "Reference")],
    actions='<a href="%ssolutions/" class="btn btn--gold">See Solutions</a><a href="%scontact/" class="btn btn--outline">Discuss Your Operation</a>' % (P, P),
) + """    <section class="section">
      <div class="container">
        <div class="callout callout--gold mb-lg">
          <span class="callout__icon" aria-hidden="true">""" + icon("shield", 20) + """</span>
          <div>
            <p><strong>What is and is not published here.</strong> The Jefferson Township reference is built entirely from information that is publicly available &mdash; the kind of material published in municipal budgets, capital plans, meeting minutes, and open records. GCS does not publish confidential client data, internal figures, contract terms, or any material a client has not authorized for release.</p>
            <p style="margin-top:0.625rem">Where this page describes benefits, it describes <strong>expected</strong> benefits based on the mechanics of the approach. It does not present measured results from a specific engagement, and no figure on this page should be read as a guaranteed outcome.</p>
          </div>
        </div>

        <article class="split" id="jefferson" style="scroll-margin-top:6rem">
          <div>
            <div class="section-header section-header--left">
              <span class="section-label">Primary Reference &middot; Public Sector</span>
              <h2 class="section-title">Jefferson Township</h2>
              <p class="section-subtitle">A municipal operating environment illustrating how GCS approaches asset intelligence, capital planning, and accountability in local government.</p>
            </div>
            <div class="prose prose--wide">
              <h2 id="jefferson-context" style="margin-top:0">The Operating Context</h2>
              <p>Jefferson Township is a New Jersey municipality in Morris County covering roughly 42 square miles, a substantial portion of it around Lake Hopatcong &mdash; the largest lake in the state. That geography defines the operational profile. A township of this shape carries a road network far longer than its population alone would suggest, a lake-adjacent stormwater and shoreline management burden, seasonal population variation that changes service demand, and a mix of year-round and seasonal properties served by the same municipal systems.</p>
              <p>Like most municipalities of its size, the township operates across public works, water and sewer utilities, buildings and grounds, fleet, parks and recreation, and emergency services &mdash; with a small professional staff, an elected governing body, and the full statutory reporting burden of New Jersey local government including annual budget publication, capital ordinance documentation, and open public meetings.</p>

              <h2 id="jefferson-challenge">The Challenge</h2>
              <p>The challenge in this environment is not unique to Jefferson Township &mdash; it is the standard condition of American local government, and it is worth naming precisely:</p>
              <ul>
                <li><strong>Asset records are distributed and inconsistent.</strong> Roads live in one place, water and sewer in another, buildings in a third, fleet in a fourth. Each is maintained to a different standard by a different person. No single view answers &ldquo;what does the township own and what condition is it in.&rdquo;</li>
                <li><strong>Condition is known experientially, not systematically.</strong> Experienced staff know which pump station is fragile and which road is failing. That knowledge is accurate and valuable &mdash; and it is undocumented, unranked, and unavailable to anyone who was not in the truck.</li>
                <li><strong>Capital requests compete without a common basis.</strong> When a road program, a roof replacement, a pump station rehabilitation, and a fleet purchase compete for the same limited capital, there is often no shared scoring framework. Prioritization becomes advocacy.</li>
                <li><strong>Deferral consequence is invisible.</strong> The governing body can see what a project costs this year. It usually cannot see what waiting three years costs &mdash; in escalation, in accelerated deterioration, in emergency repair probability.</li>
                <li><strong>Grant readiness is reactive.</strong> Infrastructure funding programs require condition documentation, cost estimates, and prioritization rationale. Assembling that after a notice of funding availability is published means competing against applicants who already had it.</li>
                <li><strong>Institutional knowledge is concentrated.</strong> In a small municipality, decades of operating context may sit with a handful of people. A retirement is a genuine operational risk event.</li>
                <li><strong>Lake-adjacent complexity.</strong> Stormwater, shoreline, and water quality obligations around a major lake add regulatory and environmental dimensions that a landlocked municipality of the same size does not carry.</li>
              </ul>

              <h2 id="jefferson-approach">The GCS Approach</h2>
              <p>The approach follows the standard GCS engagement arc, adapted to municipal constraints &mdash; public meetings, fiscal-year appropriation, procurement rules, and a small staff whose day job continues throughout.</p>
            </div>
            <div class="timeline mt-lg">
              <div class="timeline__item">
                <span class="timeline__step">Phase 1</span>
                <h3 class="timeline__title">Consolidated Asset Register</h3>
                <p class="timeline__desc">Build one register spanning every department: roads and their segments, water and sewer mains and appurtenances, pump and lift stations, municipal buildings and their major systems, fleet and heavy equipment, parks facilities, and stormwater structures. Each asset carries a unique identifier, location, install or acquisition date where known, and a responsible department. Gaps are recorded as gaps rather than guessed at &mdash; a documented unknown is more useful than a fabricated value.</p>
              </div>
              <div class="timeline__item">
                <span class="timeline__step">Phase 2</span>
                <h3 class="timeline__title">Condition and Criticality Assessment</h3>
                <p class="timeline__desc">Apply a consistent condition scoring methodology across asset classes and pair it with a criticality rating based on consequence of failure &mdash; service population affected, safety implication, regulatory exposure, and availability of redundancy. The combination is what makes prioritization defensible: a fair-condition asset with no redundancy serving critical function outranks a poor-condition asset with a workaround.</p>
              </div>
              <div class="timeline__item">
                <span class="timeline__step">Phase 3</span>
                <h3 class="timeline__title">Knowledge Capture</h3>
                <p class="timeline__desc">Structured sessions with long-tenured staff to convert experiential knowledge into records: failure history, known weak points, seasonal behavior, workaround procedures, vendor and parts specifics, and the reasoning behind past decisions. This is often the highest-value phase and the one most frequently skipped.</p>
              </div>
              <div class="timeline__item">
                <span class="timeline__step">Phase 4</span>
                <h3 class="timeline__title">Capital Plan Construction</h3>
                <p class="timeline__desc">Build a multi-year capital plan from the condition and criticality data, with each item carrying a score, a cost estimate, a funding pathway, and a deferral consequence statement. Model alternative funding scenarios so the governing body can see what different appropriation levels actually produce over five and ten years.</p>
              </div>
              <div class="timeline__item">
                <span class="timeline__step">Phase 5</span>
                <h3 class="timeline__title">Compliance and Obligation Register</h3>
                <p class="timeline__desc">Map regulatory obligations &mdash; stormwater permitting, water system reporting, tank and equipment inspections, facility certifications &mdash; to specific assets, responsible individuals, and recurrence schedules, with automated advance notice and structured evidence capture.</p>
              </div>
              <div class="timeline__item">
                <span class="timeline__step">Phase 6</span>
                <h3 class="timeline__title">Reporting and Operating Rhythm</h3>
                <p class="timeline__desc">Automate the recurring reporting the township already owes &mdash; governing body updates, budget support material, grant documentation &mdash; and establish the review cadence that keeps the system current: weekly operational, monthly performance, quarterly capital and risk.</p>
              </div>
              <div class="timeline__item">
                <span class="timeline__step">Phase 7</span>
                <h3 class="timeline__title">Transfer</h3>
                <p class="timeline__desc">Documented procedures, trained staff, and a deliberate handoff. The measure of success is that the township sustains the model through a change in administration without external support.</p>
              </div>
            </div>
          </div>

          <aside>
            <div class="card card--flat">
              <span class="card__eyebrow">Reference Profile</span>
              <h3 class="card__title">Jefferson Township, New Jersey</h3>
              <dl class="form-summary" style="margin-top:0.875rem">
                <dt>County</dt>
                <dd>Morris County, New Jersey</dd>
                <dt>Approximate Area</dt>
                <dd>~42 square miles</dd>
                <dt>Defining Geography</dt>
                <dd>Lake Hopatcong shoreline &mdash; the largest lake in New Jersey</dd>
                <dt>Government Form</dt>
                <dd>Municipal township with elected governing body</dd>
                <dt>Operational Scope</dt>
                <dd>Public works, water and sewer utilities, buildings and grounds, fleet, parks and recreation, emergency services</dd>
                <dt>Information Basis</dt>
                <dd>Publicly available municipal information only</dd>
              </dl>
              <p class="form-hint" style="margin-top:0.875rem">Profile details reflect publicly available information about the municipality. This reference illustrates the GCS method in a municipal context and does not represent or disclose the internal records of any engagement.</p>
            </div>

            <div class="card card--flat" style="margin-top:1.25rem">
              <span class="card__eyebrow">Deliverables</span>
              <h3 class="card__title">What the engagement produces</h3>
              <ul class="card__list" role="list">
                <li>Consolidated multi-department asset register</li>
                <li>Condition and criticality assessment with documented methodology</li>
                <li>Captured institutional knowledge base</li>
                <li>Five and ten-year capital plan with scoring rationale</li>
                <li>Funding scenario models and deferral cost analysis</li>
                <li>Regulatory obligation register with evidence structure</li>
                <li>Automated governing body and grant reporting</li>
                <li>Documented standard operating procedures</li>
                <li>Operating review cadence with defined agendas</li>
                <li>Staff training and transition documentation</li>
              </ul>
            </div>

            <div class="card card--flat" style="margin-top:1.25rem">
              <span class="card__eyebrow">Expected Benefits</span>
              <h3 class="card__title">What should improve &mdash; and why</h3>
              <ul class="card__list" role="list">
                <li><strong>Defensible capital decisions.</strong> Prioritization rests on a published scoring model rather than on advocacy, which changes the character of public budget discussion.</li>
                <li><strong>Stronger grant position.</strong> Condition data and prioritization rationale already exist when a funding opportunity opens, rather than being assembled under deadline.</li>
                <li><strong>Earlier failure detection.</strong> Systematic condition tracking surfaces deterioration before it becomes an emergency repair at premium cost.</li>
                <li><strong>Reduced key-person risk.</strong> Documented knowledge means a retirement is a staffing event rather than a loss of operating capability.</li>
                <li><strong>Compliance without scramble.</strong> Obligations tracked with advance notice and captured evidence.</li>
                <li><strong>Continuity across administrations.</strong> A documented, evidence-based program survives political turnover in a way that an informal one does not.</li>
                <li><strong>Time returned to staff.</strong> Recurring reporting produced from the record rather than reassembled by hand each cycle.</li>
              </ul>
              <p class="form-hint" style="margin-top:0.875rem">These are the benefits the approach is designed to produce. Actual results depend on data quality, staffing capacity, funding, and sustained adoption.</p>
            </div>
          </aside>
        </article>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Illustrative Frameworks</span>
          <h2 class="section-title">Additional Operating Patterns</h2>
          <p class="section-subtitle">Representative frameworks showing how the same discipline adapts across sectors. These describe methodology, not named clients.</p>
        </div>
        <div class="grid grid--2">
          <article class="card">
            <span class="card__icon" aria-hidden="true">""" + icon("school") + """</span>
            <span class="card__eyebrow">Framework &middot; K&ndash;12 District</span>
            <h3 class="card__title">Referendum-Ready Facility Planning</h3>
            <p class="card__desc"><strong>Challenge.</strong> A district facing a capital referendum needs to justify a specific dollar figure to a community that will vote on it &mdash; while operating aging buildings that are occupied 180 days a year.</p>
            <p class="card__desc" style="margin-top:0.75rem"><strong>Approach.</strong> Portfolio-wide facility condition assessment scored consistently across buildings; deficiencies categorized by system, urgency, and consequence; work sequenced against the academic calendar and available summer windows; the resulting package structured so a resident can understand what the money buys and what happens if it is not approved.</p>
            <p class="card__desc" style="margin-top:0.75rem"><strong>Expected benefit.</strong> A referendum request grounded in documented condition rather than in an aggregated estimate &mdash; and a maintenance program that continues to generate the evidence for the next cycle.</p>
          </article>

          <article class="card">
            <span class="card__icon" aria-hidden="true">""" + icon("health") + """</span>
            <span class="card__eyebrow">Framework &middot; Healthcare Facility</span>
            <h3 class="card__title">Survey-Ready Plant Operations</h3>
            <p class="card__desc"><strong>Challenge.</strong> Accreditation and life-safety requirements demand documented evidence of testing, inspection, and maintenance on critical systems &mdash; in a building that never closes and where a documentation gap is a finding.</p>
            <p class="card__desc" style="margin-top:0.75rem"><strong>Approach.</strong> Critical system register with redundancy mapping; compliance calendar tied to each obligation with automated advance notice; evidence captured at the point of work rather than reconstructed; maintenance windows planned against redundancy state so no procedure removes the last line of protection.</p>
            <p class="card__desc" style="margin-top:0.75rem"><strong>Expected benefit.</strong> Survey preparation becomes a query against existing records rather than a multi-week documentation project, and redundancy assumptions get verified rather than assumed.</p>
          </article>

          <article class="card">
            <span class="card__icon" aria-hidden="true">""" + icon("factory") + """</span>
            <span class="card__eyebrow">Framework &middot; Manufacturing</span>
            <h3 class="card__title">Criticality-Based Maintenance Strategy</h3>
            <p class="card__desc"><strong>Challenge.</strong> Reactive maintenance consumes the capacity that preventive work required, producing more failures &mdash; a self-reinforcing cycle that is expensive and rarely visible in aggregate.</p>
            <p class="card__desc" style="margin-top:0.75rem"><strong>Approach.</strong> Equipment criticality rating based on production consequence, safety exposure, and redundancy; maintenance strategy differentiated by criticality rather than applied uniformly; downtime cause analysis to identify the small number of assets driving the majority of loss; spares policy aligned to failure consequence and lead time.</p>
            <p class="card__desc" style="margin-top:0.75rem"><strong>Expected benefit.</strong> Maintenance effort concentrated where failure actually costs money, and a measurable shift in the ratio of planned to unplanned work.</p>
          </article>

          <article class="card">
            <span class="card__icon" aria-hidden="true">""" + icon("keys") + """</span>
            <span class="card__eyebrow">Framework &middot; Multi-Property Portfolio</span>
            <h3 class="card__title">Owner-Facing Performance Reporting</h3>
            <p class="card__desc"><strong>Challenge.</strong> A manager accountable to multiple owners must demonstrate performance and justify spend across properties with different ages, systems, and expectations &mdash; using data that lives in inconsistent formats.</p>
            <p class="card__desc" style="margin-top:0.75rem"><strong>Approach.</strong> Standardized work intake, routing, and escalation across the portfolio; consistent cost coding so properties become comparable; vendor performance and cost benchmarking; owner reporting generated from the operating record on a fixed cycle rather than compiled manually.</p>
            <p class="card__desc" style="margin-top:0.75rem"><strong>Expected benefit.</strong> Reporting effort collapses, cost patterns become visible across properties, and owner conversations move from &ldquo;is this accurate&rdquo; to &ldquo;what should we do.&rdquo;</p>
          </article>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="split">
          <div>
            <div class="section-header section-header--left">
              <span class="section-label">Our Standard</span>
              <h2 class="section-title">Why We Do Not Publish Traditional Case Studies</h2>
            </div>
            <div class="prose prose--wide">
              <p>The consulting industry norm is a one-page case study with a client logo, a dramatic percentage, and a quote. We do not publish those, for three reasons.</p>
              <p><strong>Client data is the client's.</strong> Operational figures, cost data, deficiency findings, and internal assessments belong to the organization that produced them. Publishing them &mdash; even favorably, even with permission &mdash; sets a precedent about how we treat information. Public-sector clients in particular operate under scrutiny where a vendor publicizing internal detail creates real exposure.</p>
              <p><strong>Percentages without context mislead.</strong> &ldquo;Reduced maintenance costs 34%%&rdquo; is meaningless without knowing the baseline, the measurement window, the accounting treatment, and what else changed in that period. A number that cannot be independently verified is marketing, not evidence.</p>
              <p><strong>Method transfers; anecdote does not.</strong> What is actually useful to a prospective client is a clear account of how the work is done, what it produces, and what it should be expected to change. That is what a reference implementation provides.</p>
              <p>If you want to evaluate GCS rigorously, the productive path is a conversation about your specific operation. We will describe exactly what we would do, what it would produce, and what we are uncertain about &mdash; and we will tell you if we think you do not need us.</p>
            </div>
          </div>
          <aside>
            <div class="card card--flat">
              <span class="card__eyebrow">Verification</span>
              <h3 class="card__title">How to evaluate us properly</h3>
              <ul class="card__list" role="list">
                <li><strong>Ask for the diagnostic methodology in writing.</strong> A firm that cannot describe its assessment method precisely is improvising.</li>
                <li><strong>Ask what we would not do.</strong> Every credible approach has boundaries and known weaknesses.</li>
                <li><strong>Ask for references you can call.</strong> Provided with client consent, privately &mdash; which is different from publishing their data on a website.</li>
                <li><strong>Ask how the engagement ends.</strong> If there is no defined transfer and exit, you are being sold a dependency.</li>
                <li><strong>Ask who does the work.</strong> At GCS, the founder is directly involved in every engagement.</li>
              </ul>
              <a href="%scontact/" class="btn btn--ghost btn--sm" style="margin-top:1.25rem">Ask Us These Questions</a>
            </div>
          </aside>
        </div>
      </div>
    </section>

%s""" % (P, S.cta_band(
    P,
    "Bring your own operating context",
    "The most useful next step is a conversation about how your organization actually runs today. No pitch deck required.",
    ("contact/", "Start a Conversation"),
    ("request-demo/", "Request a Demo"),
))

S.write(
    "reference/",
    "Reference Implementations | Jefferson Township & Operating Frameworks — GCS",
    "GCS reference implementations, including Jefferson Township as a municipal reference built from public information, plus illustrative frameworks for schools, healthcare, manufacturing, and property portfolios.",
    reference_body,
    active="reference",
)


# ============================================================
# FOUNDER
# ============================================================
founder_body = S.page_hero(
    P,
    "Leadership",
    "Sam Hurwitz",
    "Founder of General Contractor Solutions LLC. A practitioner background in operations, facilities, safety, risk management, and business continuity &mdash; applied to the problem of making organizations legible to the people responsible for them.",
    [(None, "Founder")],
    actions='<a href="%sabout/" class="btn btn--gold">About GCS</a><a href="%scontact/" class="btn btn--outline">Contact</a>' % (P, P),
) + """    <section class="section">
      <div class="container">
        <div class="split">
          <div>
            <div class="section-header section-header--left">
              <span class="section-label">Professional Biography</span>
              <h2 class="section-title">A practitioner, not a theorist</h2>
            </div>
            <div class="prose prose--wide">
              <p>Sam Hurwitz founded General Contractor Solutions LLC to address a problem he encountered repeatedly in operating environments: organizations full of capable people, running critical systems, without a trustworthy picture of what they owned, what condition it was in, or what it was costing them.</p>
              <p>His professional background is operational rather than academic. It is grounded in the disciplines where consequences are immediate and physical &mdash; facilities and building systems, operational safety, risk management, and business continuity. These are fields where an incomplete record is not an inconvenience; it is the reason an incident becomes a crisis.</p>
              <p>That grounding shapes how GCS works. The firm's methods are built around what actually holds up under operating conditions: registers that field staff will maintain, scoring models that a supervisor can explain, review cadences that survive a busy quarter, and documentation that remains useful when the person who wrote it has moved on.</p>
              <p>The company name is a deliberate statement of philosophy. A general contractor does not simply design; they coordinate every trade, hold each party to a schedule, resolve conflicts between systems, and deliver a finished structure that works. GCS applies the same integrating role to an organization's operating model &mdash; which is why the firm works across facilities, infrastructure, compliance, capital planning, and technology rather than specializing in one and handing off the rest.</p>
              <p>GCS is deliberately founder-led. Sam is directly involved in every engagement: the site walks, the assessment, the design decisions, and the review of what gets delivered. There is no layer of account management between the client and the person accountable for the work. That structure caps how many engagements the firm can run concurrently, which is an accepted constraint rather than a problem to be solved by hiring quickly.</p>
            </div>
          </div>
          <aside>
            <div class="card card--flat">
              <div class="founder-card__avatar" aria-hidden="true" style="width:4.5rem;height:4.5rem;display:flex;align-items:center;justify-content:center;border-radius:var(--radius-lg);background:linear-gradient(135deg,var(--color-primary-light),var(--color-accent));color:#fff;font-family:var(--font-heading);font-weight:800;font-size:1.375rem;margin-bottom:1.125rem">SH</div>
              <h3 class="card__title">Sam Hurwitz</h3>
              <p class="card__desc">Founder &amp; Principal<br />General Contractor Solutions LLC</p>
              <div class="pill-row">
                <span class="pill pill--accent">Operations</span>
                <span class="pill pill--accent">Facilities</span>
                <span class="pill pill--accent">Safety</span>
                <span class="pill pill--accent">Risk Management</span>
                <span class="pill pill--accent">Business Continuity</span>
                <span class="pill pill--gold">Operations Technology</span>
              </div>
              <hr class="divider" style="margin-block:1.5rem" />
              <p class="card__desc"><strong>Direct contact:</strong><br /><a href="mailto:info@buildbetterwithgcs.com" style="color:var(--color-primary);font-weight:600">info@buildbetterwithgcs.com</a></p>
            </div>
            <div class="callout callout--gold" style="margin-top:1.25rem">
              <span class="callout__icon" aria-hidden="true">""" + icon("shield", 20) + """</span>
              <p><strong>Professional information only.</strong> This page presents professional background and philosophy. GCS does not publish personal contact details, residential information, family details, or private information about any individual &mdash; a standard we apply to ourselves as well as to our clients.</p>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Areas of Expertise</span>
          <h2 class="section-title">Five Disciplines That Reinforce Each Other</h2>
          <p class="section-subtitle">These are not separate practice areas. Each one exposes gaps the others create, which is why GCS treats them as a single integrated view of operational health.</p>
        </div>
        <div class="grid grid--3">
          <article class="card">
            <span class="card__icon" aria-hidden="true">""" + icon("gauge") + """</span>
            <span class="card__eyebrow">Discipline 01</span>
            <h3 class="card__title">Operations</h3>
            <p class="card__desc">The practical mechanics of running things: how work is requested, prioritized, assigned, executed, verified, and recorded. Operations expertise is fundamentally about understanding where effort is actually consumed and why the official process and the real process diverge.</p>
            <ul class="card__list" role="list">
              <li>Process mapping against observed reality, not documented intent</li>
              <li>Workload modeling and capacity analysis</li>
              <li>Escalation design and decision-rights definition</li>
              <li>Operating cadence and performance review structure</li>
            </ul>
          </article>
          <article class="card">
            <span class="card__icon" aria-hidden="true">""" + icon("building") + """</span>
            <span class="card__eyebrow">Discipline 02</span>
            <h3 class="card__title">Facilities</h3>
            <p class="card__desc">Buildings and building systems as a managed portfolio with known condition, known cost, and a planned intervention schedule. Facilities work is where asset intelligence stops being abstract &mdash; a deterioration curve becomes a roof that will leak in a specific year.</p>
            <ul class="card__list" role="list">
              <li>Facility condition assessment methodology</li>
              <li>Building systems lifecycle and replacement forecasting</li>
              <li>Preventive maintenance program design</li>
              <li>Capital renewal sequencing and deferral analysis</li>
            </ul>
          </article>
          <article class="card">
            <span class="card__icon" aria-hidden="true">""" + icon("alert") + """</span>
            <span class="card__eyebrow">Discipline 03</span>
            <h3 class="card__title">Safety</h3>
            <p class="card__desc">Operational safety as a system property rather than a compliance artifact. Most incidents are preceded by observable conditions that a functioning system would have surfaced &mdash; the work is building the mechanism that surfaces them and the culture that responds.</p>
            <ul class="card__list" role="list">
              <li>Hazard identification and control hierarchy</li>
              <li>Incident and near-miss analysis with corrective tracking</li>
              <li>Safety program documentation and training structure</li>
              <li>Contractor and vendor safety qualification</li>
            </ul>
          </article>
          <article class="card">
            <span class="card__icon" aria-hidden="true">""" + icon("shield") + """</span>
            <span class="card__eyebrow">Discipline 04</span>
            <h3 class="card__title">Risk Management</h3>
            <p class="card__desc">Systematic identification, rating, ownership, and review of operational exposure &mdash; asset failure, safety incident, regulatory action, service interruption, single points of failure, and knowledge loss. The discipline is making risk explicit enough to be resourced against.</p>
            <ul class="card__list" role="list">
              <li>Risk register construction with likelihood and consequence rating</li>
              <li>Single-point-of-failure and dependency identification</li>
              <li>Mitigation planning with tracked completion</li>
              <li>Insurance and loss-exposure documentation support</li>
            </ul>
          </article>
          <article class="card">
            <span class="card__icon" aria-hidden="true">""" + icon("clock") + """</span>
            <span class="card__eyebrow">Discipline 05</span>
            <h3 class="card__title">Business Continuity</h3>
            <p class="card__desc">The capacity to keep essential functions running through disruption &mdash; and to recover deliberately rather than improvisationally. Continuity planning is where every other discipline gets tested, because a plan is only as good as the asset, staffing, and dependency data underneath it.</p>
            <ul class="card__list" role="list">
              <li>Business impact analysis and essential function identification</li>
              <li>Recovery time and recovery point objective setting</li>
              <li>Continuity of operations plan development</li>
              <li>Tabletop exercise design and after-action improvement</li>
            </ul>
          </article>
          <article class="card">
            <span class="card__icon" aria-hidden="true">""" + icon("cpu") + """</span>
            <span class="card__eyebrow">Discipline 06</span>
            <h3 class="card__title">Operations Technology</h3>
            <p class="card__desc">The systems layer that holds all of the above: asset registers, work management, dashboards, workflow automation, and increasingly AI-assisted execution. Technology chosen for what it makes visible and enforceable &mdash; not for its feature list.</p>
            <ul class="card__list" role="list">
              <li>Operational data model and system-of-record design</li>
              <li>Dashboard and decision-surface architecture</li>
              <li>Workflow automation with defined human checkpoints</li>
              <li>AI governance, approval gates, and audit structure</li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <section class="section section--dark">
      <div class="container">
        <div class="section-header">
          <span class="section-label section-label--light">Leadership Philosophy</span>
          <h2 class="section-title">Six Principles That Govern How GCS Operates</h2>
        </div>
        <div class="grid grid--2">
          <div class="card card--dark">
            <span class="card__number">01</span>
            <h3 class="card__title">Reality first, comfort second</h3>
            <p class="card__desc">The most expensive thing an organization can buy is a reassuring assessment. A diagnostic that names the real constraint &mdash; including when the constraint is leadership behavior, staffing level, or an unwillingness to retire a system everyone depends on &mdash; is worth more than a polished one that lets the problem compound for another budget cycle.</p>
          </div>
          <div class="card card--dark">
            <span class="card__number">02</span>
            <h3 class="card__title">Accountability requires a name and a date</h3>
            <p class="card__desc">&ldquo;The department will address this&rdquo; is not accountability. A named owner, an agreed date, and a verification step is. The single most common root cause of operational drift is a finding that everyone acknowledged and nobody owned.</p>
          </div>
          <div class="card card--dark">
            <span class="card__number">03</span>
            <h3 class="card__title">Systems must fit the people who run them</h3>
            <p class="card__desc">A model that requires more administrative capacity than the organization has will be abandoned within two quarters, regardless of technical quality. Design to the team you have. Elegance that nobody sustains is failure with better documentation.</p>
          </div>
          <div class="card card--dark">
            <span class="card__number">04</span>
            <h3 class="card__title">Institutional memory is infrastructure</h3>
            <p class="card__desc">The knowledge of why a system behaves the way it does, which vendor actually shows up, and what was tried in 2011 is operational capability. Treating it as informal means every retirement is an uncontrolled loss. Capturing it is one of the highest-return activities available.</p>
          </div>
          <div class="card card--dark">
            <span class="card__number">05</span>
            <h3 class="card__title">Technology amplifies whatever it finds</h3>
            <p class="card__desc">Applied to a clear process, technology multiplies capability. Applied to an unclear one, it multiplies confusion at greater speed and higher cost. This is why GCS sequences clarity before configuration, and configuration before automation &mdash; every time.</p>
          </div>
          <div class="card card--dark">
            <span class="card__number">06</span>
            <h3 class="card__title">Build for the successor</h3>
            <p class="card__desc">The measure of a well-run operation is whether it functions after the people who built it have moved on. Documentation, defensible reasoning, and transferable systems are the deliverable &mdash; not dependence on a particular individual or a particular consultant.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="split">
          <div>
            <div class="section-header section-header--left">
              <span class="section-label">Technology Vision</span>
              <h2 class="section-title">Where This Is Headed</h2>
            </div>
            <div class="prose prose--wide">
              <p>The operational software market has spent two decades producing systems of record. They store what happened. They are, on the whole, good at that. What they do not do is close the loop &mdash; take a signal, interpret it, propose an action, route it for approval, execute it, and verify the outcome, with the entire chain traceable afterward.</p>
              <p>That gap is the design premise behind the <a href="../nexus/">Nexus Enterprise Intelligence Platform</a>. Nexus is not intended as another place to type work orders. It is intended as the layer where operational reality becomes a decision surface: condition, cost, workload, risk, and obligation in one model, with the actions that follow tracked to closure.</p>
              <p><a href="../genesis/">Genesis</a> extends that premise into execution. The thesis is that a meaningful share of operational work is analytical and administrative &mdash; reconciling records, monitoring thresholds, preparing recurring reports, drafting documentation, assembling evidence &mdash; and that this work can be executed by bounded software agents operating under explicit human approval.</p>
              <p>The conviction underneath both is that <strong>governance is the hard part, not capability</strong>. Producing plausible output is increasingly easy. Producing output that a public body can defend in an open meeting, that an auditor can trace, and that a named individual is accountable for &mdash; that is the engineering problem worth solving. It is why authority boundaries, approval gates, and the decision record are architectural features of Genesis rather than settings.</p>
              <p>GCS states plainly which capabilities are available today and which are in development. Overstating maturity in operational technology does not just lose a sale &mdash; it puts an organization's critical systems in the hands of something that cannot carry the weight. Our position on this is published in full in our <a href="../responsible-ai/">Responsible AI statement</a>.</p>
            </div>
          </div>
          <aside>
            <div class="card card--flat">
              <span class="card__eyebrow">Working With Sam</span>
              <h3 class="card__title">What engagement looks like</h3>
              <ul class="card__list" role="list">
                <li><strong>Direct involvement.</strong> The founder is in the assessment, the design, and the review &mdash; not introduced at the pitch and replaced at delivery.</li>
                <li><strong>Limited concurrency.</strong> GCS caps active engagements deliberately. Availability is a real constraint, and we will tell you when it applies.</li>
                <li><strong>Written work product.</strong> Findings, models, and procedures are delivered as documentation your organization owns outright.</li>
                <li><strong>Defined exit.</strong> Every engagement has a transfer plan. Perpetual dependency is not the business model.</li>
                <li><strong>Honest scoping.</strong> If your constraint is not something GCS should be paid to solve, that is the answer you will get in the first conversation.</li>
              </ul>
              <a href="%scontact/" class="btn btn--primary btn--sm" style="margin-top:1.5rem">Contact Sam Directly</a>
            </div>
          </aside>
        </div>
      </div>
    </section>

%s""" % (P, S.cta_band(
    P,
    "Start with a direct conversation",
    "Describe your operation and where the friction is. You will get a candid assessment of whether GCS is the right partner and what a realistic first engagement would cover.",
    ("contact/", "Contact GCS"),
    ("about/", "About the Firm"),
))

S.write(
    "founder/",
    "Sam Hurwitz, Founder | GCS — General Contractor Solutions LLC",
    "Professional biography of Sam Hurwitz, founder of GCS: expertise in operations, facilities, safety, risk management, and business continuity, plus leadership philosophy and technology vision.",
    founder_body,
    active="founder",
)

print("reference + founder written")

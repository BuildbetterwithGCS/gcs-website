# -*- coding: utf-8 -*-
"""Enhance the home page: shared shell, preview sections, honest contact form."""

import io
import re
import shell as S
from pages_content import icon

P = ""

src = io.open("../index.html", encoding="utf-8").read()

# ---- extract existing main content -------------------------------------
start = src.index('<main id="main-content">')
end = src.index("</main>")
main_inner = src[start + len('<main id="main-content">'):end]

# Drop the old contact section entirely (replaced below)
c_start = main_inner.index('<!-- ===== CONTACT ===== -->')
main_inner = main_inner[:c_start].rstrip()

# Update in-page anchors that now point at dedicated pages
main_inner = main_inner.replace('href="#contact"', 'href="#contact"')

# Add reveal classes to card grids for scroll animation
for cls in ("service-card", "industry-card", "reference-card", "nexus-module"):
    main_inner = main_inner.replace('class="%s"' % cls, 'class="%s reveal"' % cls)

# Deep links from home sections out to the dedicated pages
main_inner = main_inner.replace(
    "</section>\n\n    <!-- ===== SERVICES ===== -->",
    "</section>\n\n    <!-- ===== SERVICES ===== -->",
)


def preview_link_row(links):
    return '<div class="pill-row">%s</div>' % "".join(
        '<a class="pill pill--accent" href="%s">%s</a>' % (h, t) for h, t in links
    )


PREVIEWS = """
    <!-- ===== NEXUS PREVIEW ===== -->
    <section id="nexus-preview" class="section section--dark" aria-labelledby="nexus-preview-heading">
      <div class="container">
        <div class="section-header">
          <span class="section-label section-label--light">The Platform</span>
          <h2 id="nexus-preview-heading" class="section-title">Nexus, In One Screen</h2>
          <p class="section-subtitle">Seven working views over a single operating record. The demonstration below uses illustrative data &mdash; the interface and the interaction model are real.</p>
        </div>

        <div class="preview reveal">
          <div class="preview__media">
            <div class="preview__chrome" aria-hidden="true">
              <span class="preview__dot"></span><span class="preview__dot"></span><span class="preview__dot"></span>
              <span class="preview__chrome-label">Nexus &mdash; Executive Dashboard</span>
              <span class="demo-tag">Illustrative</span>
            </div>
            <div class="preview__body">
              <div class="kpi-grid kpi-grid--tight">
                <article class="kpi kpi--gold"><span class="kpi__label">Asset Condition Index</span><span class="kpi__value">71<span class="kpi__unit">/100</span></span><span class="kpi__delta kpi__delta--flat">&#9679; Steady</span></article>
                <article class="kpi kpi--good"><span class="kpi__label">Work Order Completion</span><span class="kpi__value">92<span class="kpi__unit">%</span></span><span class="kpi__delta kpi__delta--up">&#9650; 4 pts</span></article>
                <article class="kpi kpi--warn"><span class="kpi__label">Compliance Current</span><span class="kpi__value">94<span class="kpi__unit">%</span></span><span class="kpi__delta kpi__delta--down">&#9660; 38 devices</span></article>
                <article class="kpi kpi--risk"><span class="kpi__label">Critical Risks Open</span><span class="kpi__value">6</span><span class="kpi__delta kpi__delta--flat">&#9679; 2 escalated</span></article>
              </div>
              <div class="chart" style="margin-top:1.125rem">
                <div class="chart__row"><span class="chart__label">Facilities</span><div class="chart__track"><div class="chart__fill chart__fill--good" style="width:94%"></div></div><span class="chart__value">94%</span></div>
                <div class="chart__row"><span class="chart__label">Water Utility</span><div class="chart__track"><div class="chart__fill chart__fill--good" style="width:87%"></div></div><span class="chart__value">87%</span></div>
                <div class="chart__row"><span class="chart__label">Sewer</span><div class="chart__track"><div class="chart__fill chart__fill--warn" style="width:66%"></div></div><span class="chart__value">66%</span></div>
                <div class="chart__row"><span class="chart__label">Infrastructure</span><div class="chart__track"><div class="chart__fill chart__fill--risk" style="width:58%"></div></div><span class="chart__value">58%</span></div>
              </div>
            </div>
          </div>

          <div class="preview__content">
            <h3 class="preview__title">One record. Seven views. No reconciliation.</h3>
            <p class="preview__desc">Executive dashboard, projects, assets, work orders, budgets, action center, and risk &mdash; all reading from the same operating record. When a condition rating changes, every view changes with it. There is no export, no monthly reconciliation, and no argument about which spreadsheet is current.</p>
            <ul class="card__list" role="list">
              <li><strong>Executive Dashboard</strong> &mdash; the state of the operation on one screen, with what changed leading</li>
              <li><strong>Assets</strong> &mdash; condition, criticality, remaining life, and failure history</li>
              <li><strong>Work Orders</strong> &mdash; the reactive-to-planned ratio that predicts next year's capital need</li>
              <li><strong>Budgets</strong> &mdash; committed against approved, with the drivers behind every variance</li>
              <li><strong>Action Center</strong> &mdash; the short list of decisions that actually require a person</li>
              <li><strong>Risks</strong> &mdash; likelihood and consequence, with named owners and real mitigations</li>
            </ul>
            <div class="preview__actions">
              <a href="nexus/" class="btn btn--gold">Open the Nexus Demonstration</a>
              <a href="map-intelligence/" class="btn btn--ghost">Map Intelligence</a>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== GENESIS PREVIEW ===== -->
    <section id="genesis-preview" class="section" aria-labelledby="genesis-preview-heading">
      <div class="container">
        <div class="section-header">
          <span class="section-label">The AI Workforce</span>
          <h2 id="genesis-preview-heading" class="section-title">Genesis: Bounded Agents, Named Accountability</h2>
          <p class="section-subtitle">Task-scoped agents that prepare, monitor, analyze, and draft &mdash; operating inside written authority limits and escalating anything consequential to a named human.</p>
        </div>

        <div class="grid grid--4 reveal">
          <article class="card">
            <span class="card__icon" aria-hidden="true">@@ICON1@@</span>
            <h3 class="card__title">One job per agent</h3>
            <p class="card__desc">Narrow scope makes behavior predictable and failure diagnosable. There is no general-purpose agent with access to everything.</p>
          </article>
          <article class="card">
            <span class="card__icon" aria-hidden="true">@@ICON2@@</span>
            <h3 class="card__title">Written charter first</h3>
            <p class="card__desc">Purpose, data access, permitted actions, approval thresholds, escalation triggers, and deactivation criteria &mdash; documented before activation.</p>
          </article>
          <article class="card">
            <span class="card__icon" aria-hidden="true">@@ICON3@@</span>
            <h3 class="card__title">Approval gate on consequence</h3>
            <p class="card__desc">Anything that commits funds, changes compliance posture, affects a person, or communicates externally requires human authorization.</p>
          </article>
          <article class="card">
            <span class="card__icon" aria-hidden="true">@@ICON4@@</span>
            <h3 class="card__title">Complete decision record</h3>
            <p class="card__desc">Inputs, output, stated confidence, approver, timestamp, and observed outcome &mdash; retained so the reasoning can be retrieved rather than reconstructed.</p>
          </article>
        </div>

        <div class="callout callout--gold mt-lg">
          <span class="callout__icon" aria-hidden="true">@@ICON5@@</span>
          <div>
            <p><strong>Stated honestly:</strong> Genesis is in active development. Agent roles are published with explicit maturity labels &mdash; in development or concept &mdash; and capabilities are delivered inside GCS engagements today rather than as a self-service product. <a href="genesis/">See the full Genesis architecture</a> or read our <a href="responsible-ai/">Responsible AI statement</a>.</p>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== FOUNDER COMMAND CENTER TEASER ===== -->
    <section id="command-preview" class="section section--dark" aria-labelledby="command-preview-heading">
      <div class="container">
        <div class="split split--even">
          <div>
            <div class="section-header section-header--left">
              <span class="section-label section-label--light">Founder Command Center</span>
              <h2 id="command-preview-heading" class="section-title">We Run the Discipline We Sell</h2>
            </div>
            <p class="lead">Missions, approvals, department status, repository health, risk, and recorded decisions &mdash; the internal operating view GCS runs on itself, published as a working demonstration.</p>
            <p class="lead">Most firms that sell operational discipline do not practice it internally. Publishing our own queue, our own risk register &mdash; including founder concentration and market expectation gaps &mdash; makes the claim falsifiable in a way a capability list never can.</p>
            <div class="preview__actions">
              <a href="founder-command-center/" class="btn btn--gold">Open the Command Center</a>
              <a href="founder/" class="btn btn--ghost">About the Founder</a>
            </div>
          </div>
          <div class="preview__media">
            <div class="preview__chrome" aria-hidden="true">
              <span class="preview__dot"></span><span class="preview__dot"></span><span class="preview__dot"></span>
              <span class="preview__chrome-label">Command Center &mdash; Approvals</span>
              <span class="demo-tag">Illustrative</span>
            </div>
            <div class="preview__body">
              <div class="status-strip" style="margin-bottom:1rem">
                <span class="status-strip__item"><span class="pulse-dot" aria-hidden="true"></span> 7 active missions</span>
                <span class="status-strip__item">4 awaiting approval</span>
                <span class="status-strip__item">Health index 84</span>
              </div>
              <ul class="feed" role="list">
                <li class="feed__item">
                  <span class="feed__dot feed__dot--warn" aria-hidden="true"></span>
                  <div class="feed__content">
                    <p class="feed__text">Genesis &mdash; Obligation Coordinator scope expansion</p>
                    <p class="feed__meta">AI Governance &middot; decision required &middot; 3 days open</p>
                  </div>
                </li>
                <li class="feed__item">
                  <span class="feed__dot feed__dot--info" aria-hidden="true"></span>
                  <div class="feed__content">
                    <p class="feed__text">Publish map intelligence demonstration</p>
                    <p class="feed__meta">Marketing &amp; Positioning &middot; ready for release</p>
                  </div>
                </li>
                <li class="feed__item">
                  <span class="feed__dot feed__dot--warn" aria-hidden="true"></span>
                  <div class="feed__content">
                    <p class="feed__text">Adopt revised condition scoring methodology</p>
                    <p class="feed__meta">Platform Engineering &middot; affects capital sequencing</p>
                  </div>
                </li>
                <li class="feed__item">
                  <span class="feed__dot feed__dot--good" aria-hidden="true"></span>
                  <div class="feed__content">
                    <p class="feed__text">Sequence AI Assisted Operations last &mdash; approved</p>
                    <p class="feed__meta">Recorded decision &middot; reasoning attached</p>
                  </div>
                </li>
              </ul>
              <p class="panel__hint" style="margin-top:0.75rem">Illustrative demonstration data.</p>
            </div>
          </div>
        </div>
      </div>
    </section>

    <!-- ===== EXPLORE ===== -->
    <section id="explore" class="section section--alt" aria-labelledby="explore-heading">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Explore</span>
          <h2 id="explore-heading" class="section-title">Where to Go Next</h2>
          <p class="section-subtitle">Everything on this site is available without a form, a gate, or a sales sequence.</p>
        </div>
        <div class="grid grid--3">
          <article class="card">
            <span class="card__eyebrow">Understand the approach</span>
            <h3 class="card__title">Method and scope</h3>
            <ul class="anchor-list" role="list">
              <li><a href="about/">About GCS &mdash; mission and method</a></li>
              <li><a href="solutions/">Twelve solution areas</a></li>
              <li><a href="industries/">Eleven industries served</a></li>
              <li><a href="reference/">Reference implementations</a></li>
            </ul>
          </article>
          <article class="card">
            <span class="card__eyebrow">See it working</span>
            <h3 class="card__title">Live demonstrations</h3>
            <ul class="anchor-list" role="list">
              <li><a href="nexus/">Nexus Platform &mdash; 7 views</a></li>
              <li><a href="map-intelligence/">Map Intelligence</a></li>
              <li><a href="founder-command-center/">Founder Command Center</a></li>
              <li><a href="genesis/">Genesis AI Workforce</a></li>
            </ul>
          </article>
          <article class="card">
            <span class="card__eyebrow">Know who you are dealing with</span>
            <h3 class="card__title">Governance and leadership</h3>
            <ul class="anchor-list" role="list">
              <li><a href="founder/">Sam Hurwitz &mdash; founder</a></li>
              <li><a href="responsible-ai/">Responsible AI statement</a></li>
              <li><a href="accessibility/">Accessibility statement</a></li>
              <li><a href="privacy/">Privacy policy</a></li>
            </ul>
          </article>
        </div>
      </div>
    </section>

    <!-- ===== CONTACT ===== -->
    <section id="contact" class="section section--dark" aria-labelledby="contact-heading">
      <div class="container">
        <div class="section-header">
          <span class="section-label section-label--light">Get in Touch</span>
          <h2 id="contact-heading" class="section-title">Start the Conversation</h2>
          <p class="section-subtitle">Whether you are facing a specific operational problem or exploring what a transformation engagement looks like, the conversation starts the same way &mdash; with what is actually happening in your operation.</p>
        </div>

        <div class="split">
          <div>
            <div class="form-card">
              <h3 class="form-card__title">Send a message</h3>
              <p class="form-card__lead">Fields marked with an asterisk are required.</p>

              <form id="home-contact-form" data-honest-form data-form-kind="General inquiry" novalidate>
                <div class="form-grid">
                  <div class="form-group">
                    <label for="home-name">Full name <span aria-hidden="true">*</span></label>
                    <input type="text" id="home-name" name="name" autocomplete="name" required aria-describedby="home-name-error" />
                    <p class="form-error" id="home-name-error" role="alert"></p>
                  </div>
                  <div class="form-group">
                    <label for="home-email">Work email <span aria-hidden="true">*</span></label>
                    <input type="email" id="home-email" name="email" autocomplete="email" required aria-describedby="home-email-error" />
                    <p class="form-error" id="home-email-error" role="alert"></p>
                  </div>
                  <div class="form-group">
                    <label for="home-phone">Phone <span class="form-optional">(optional)</span></label>
                    <input type="tel" id="home-phone" name="phone" autocomplete="tel" />
                  </div>
                  <div class="form-group">
                    <label for="home-org">Organization <span aria-hidden="true">*</span></label>
                    <input type="text" id="home-org" name="organization" autocomplete="organization" required aria-describedby="home-org-error" />
                    <p class="form-error" id="home-org-error" role="alert"></p>
                  </div>
                  <div class="form-group form-group--full">
                    <label for="home-type">Organization type <span aria-hidden="true">*</span></label>
                    <select id="home-type" name="orgType" required aria-describedby="home-type-error">
                      <option value="">Select one&hellip;</option>
                      <option>Municipality / City / Township / Borough</option>
                      <option>County government</option>
                      <option>School district or higher education</option>
                      <option>Healthcare organization</option>
                      <option>Manufacturing or industrial</option>
                      <option>Commercial real estate</option>
                      <option>Property management</option>
                      <option>Data center or critical facility</option>
                      <option>Nonprofit organization</option>
                      <option>Utility or authority</option>
                      <option>Other</option>
                    </select>
                    <p class="form-error" id="home-type-error" role="alert"></p>
                  </div>
                  <div class="form-group form-group--full">
                    <label for="home-goals">How can we help? <span aria-hidden="true">*</span></label>
                    <textarea id="home-goals" name="goals" rows="6" required aria-describedby="home-goals-error home-goals-hint" placeholder="Describe what you are trying to accomplish and what is currently getting in the way."></textarea>
                    <p class="form-hint" id="home-goals-hint">Specific beats polished. A paragraph describing a real difficulty is more useful than a formal request for information.</p>
                    <p class="form-error" id="home-goals-error" role="alert"></p>
                  </div>
                </div>

                <div class="form-disclosure">
                  <span class="form-disclosure__icon" aria-hidden="true">@@ICON6@@</span>
                  <div>
                    <p><strong>How this form works &mdash; stated plainly.</strong> This is a static website with no server-side application behind it. Submitting does <strong>not</strong> transmit your information to GCS. Your entries are validated in your browser, then shown back to you as a summary with a link that opens your own email client addressed to <a href="mailto:info@buildbetterwithgcs.com">info@buildbetterwithgcs.com</a>.</p>
                    <p>Nothing is stored, logged, or sent anywhere until you send that email yourself.</p>
                  </div>
                </div>

                <button type="submit" class="btn btn--primary btn--lg">Prepare my message</button>
              </form>

              <div class="form-result" data-form-result hidden tabindex="-1">
                <h3 class="form-result__title"><span aria-hidden="true">@@ICON7@@</span> Message prepared &mdash; not yet sent</h3>
                <div class="form-result__body">
                  <p>Your entries passed validation and are summarized below. <strong>They have not been transmitted.</strong> Use the button to open your email client with this summary prefilled, or copy the text and send it however you prefer.</p>
                  <pre class="form-summary" data-form-summary></pre>
                  <div class="form-result__actions">
                    <a class="btn btn--primary btn--sm" data-form-mailto href="mailto:info@buildbetterwithgcs.com">Open email with this summary</a>
                    <button type="button" class="btn btn--outline btn--sm" data-form-copy>Copy summary</button>
                    <button type="button" class="btn btn--ghost btn--sm" data-form-reset>Edit entries</button>
                  </div>
                  <p class="form-hint">If your browser does not open an email client, write to <a href="mailto:info@buildbetterwithgcs.com">info@buildbetterwithgcs.com</a> directly.</p>
                </div>
              </div>
            </div>
          </div>

          <aside>
            <div class="card card--dark">
              <span class="card__eyebrow">Direct Contact</span>
              <h3 class="card__title">General Contractor Solutions LLC</h3>
              <p class="card__desc">Building Better Organizations</p>
              <ul class="card__list" role="list">
                <li><strong>Email</strong> &mdash; <a href="mailto:info@buildbetterwithgcs.com">info@buildbetterwithgcs.com</a></li>
                <li><strong>Website</strong> &mdash; <a href="https://buildbetterwithgcs.com">buildbetterwithgcs.com</a></li>
                <li><strong>Leadership</strong> &mdash; Sam Hurwitz, Founder</li>
                <li><strong>Response</strong> &mdash; answered directly by the founder, typically within two business days</li>
              </ul>
            </div>
            <div class="card card--dark" style="margin-top:1.25rem">
              <span class="card__eyebrow">Typically Engaged For</span>
              <h3 class="card__title">Where engagements begin</h3>
              <ul class="card__list" role="list">
                <li>Operational diagnostic and assessment</li>
                <li>Asset condition and capital planning defensibility</li>
                <li>Compliance obligation registers and evidence assembly</li>
                <li>Executive reporting that survives a hard question</li>
                <li>Nexus platform inquiry and early access</li>
              </ul>
              <a href="request-demo/" class="btn btn--gold btn--sm" style="margin-top:1.25rem">Request a Demonstration</a>
            </div>
          </aside>
        </div>
      </div>
    </section>
"""

PREVIEWS = (
    PREVIEWS.replace("@@ICON1@@", icon("target", 22))
    .replace("@@ICON2@@", icon("book", 22))
    .replace("@@ICON3@@", icon("shield", 22))
    .replace("@@ICON4@@", icon("check-doc", 22))
    .replace("@@ICON5@@", icon("alert", 20))
    .replace("@@ICON6@@", icon("shield", 20))
    .replace("@@ICON7@@", icon("check-doc", 20))
)

body = main_inner + "\n" + PREVIEWS

S.write(
    "",
    "GCS | General Contractor Solutions LLC — Building Better Organizations",
    "GCS turns operations into intelligence, action, and accountability. Operations intelligence consulting, the Nexus platform, and the Genesis AI workforce for public sector, institutional, and commercial organizations.",
    body,
    active="",
)

print("home page written")

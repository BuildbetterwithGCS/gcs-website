# -*- coding: utf-8 -*-
"""Request Demo and Contact pages."""

import shell as S
from pages_content import icon, card

P = "../"

ORG_TYPES = [
    "Municipality / City / Township / Borough",
    "County government",
    "School district or higher education",
    "Healthcare organization",
    "Manufacturing or industrial",
    "Commercial real estate",
    "Property management",
    "Data center or critical facility",
    "Nonprofit organization",
    "Utility or authority",
    "Other",
]

org_options = "\n".join(
    '                    <option value="%s">%s</option>' % (t, t) for t in ORG_TYPES
)

INTERESTS = [
    ("ops", "Operations Intelligence"),
    ("facilities", "Facilities Management"),
    ("infra", "Infrastructure &amp; Utilities"),
    ("capital", "Capital Planning"),
    ("dash", "Executive Dashboards"),
    ("assets", "Asset Intelligence"),
    ("risk", "Risk Management"),
    ("compliance", "Compliance"),
    ("workflow", "Workflow Automation"),
    ("reporting", "Executive Reporting"),
    ("readiness", "Operational Readiness"),
    ("ai", "AI Assisted Operations"),
]

interest_boxes = "\n".join(
    f"""                    <label class="checkbox-item">
                      <input type="checkbox" name="interest" value="{v}" />
                      <span>{label}</span>
                    </label>"""
    for v, label in INTERESTS
)


def core_fields(idp):
    return f"""                <div class="form-group">
                  <label for="{idp}-name">Full name <span aria-hidden="true">*</span></label>
                  <input type="text" id="{idp}-name" name="name" autocomplete="name" required aria-describedby="{idp}-name-error" />
                  <p class="form-error" id="{idp}-name-error" role="alert"></p>
                </div>
                <div class="form-group">
                  <label for="{idp}-email">Work email <span aria-hidden="true">*</span></label>
                  <input type="email" id="{idp}-email" name="email" autocomplete="email" required aria-describedby="{idp}-email-error" />
                  <p class="form-error" id="{idp}-email-error" role="alert"></p>
                </div>
                <div class="form-group">
                  <label for="{idp}-phone">Phone <span class="form-optional">(optional)</span></label>
                  <input type="tel" id="{idp}-phone" name="phone" autocomplete="tel" />
                </div>
                <div class="form-group">
                  <label for="{idp}-org">Organization <span aria-hidden="true">*</span></label>
                  <input type="text" id="{idp}-org" name="organization" autocomplete="organization" required aria-describedby="{idp}-org-error" />
                  <p class="form-error" id="{idp}-org-error" role="alert"></p>
                </div>
                <div class="form-group">
                  <label for="{idp}-role">Role or title <span class="form-optional">(optional)</span></label>
                  <input type="text" id="{idp}-role" name="role" autocomplete="organization-title" />
                </div>
                <div class="form-group">
                  <label for="{idp}-type">Organization type <span aria-hidden="true">*</span></label>
                  <select id="{idp}-type" name="orgType" required aria-describedby="{idp}-type-error">
                    <option value="">Select one&hellip;</option>
{org_options}
                  </select>
                  <p class="form-error" id="{idp}-type-error" role="alert"></p>
                </div>"""


DISCLOSURE = """              <div class="form-disclosure">
                <span class="form-disclosure__icon" aria-hidden="true">%s</span>
                <div>
                  <p><strong>How this form works &mdash; stated plainly.</strong> This is a static website with no server-side application behind it. Submitting this form does <strong>not</strong> transmit your information to GCS. Your entries are validated in your browser, and you are then shown a formatted summary along with a link that opens your own email client addressed to <a href="mailto:info@buildbetterwithgcs.com">info@buildbetterwithgcs.com</a> with that summary included.</p>
                  <p>Nothing is stored, logged, or sent anywhere until you send that email yourself. We would rather tell you this than show you a &ldquo;message sent&rdquo; confirmation that isn't true.</p>
                </div>
              </div>""" % icon("shield", 20)


def result_block(idp, heading):
    return f"""              <div class="form-result" data-form-result hidden tabindex="-1">
                <h3 class="form-result__title"><span aria-hidden="true">{icon('check-doc', 20)}</span> {heading}</h3>
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
              </div>"""


# =============================================================== REQUEST DEMO
demo_body = S.page_hero(
    P,
    "Request a Demonstration",
    "See It Against Your Own Problem.",
    "A GCS demonstration is a working session, not a slide deck. Tell us what is actually difficult in your operation and we will show you how Nexus, Genesis, and the GCS method address it &mdash; including where they do not.",
    [(None, "Request Demo")],
) + """    <section class="section">
      <div class="container">
        <div class="split">
          <div>
            <div class="form-card">
              <h2 class="form-card__title">Demonstration request</h2>
              <p class="form-card__lead">Fields marked with an asterisk are required. The more specific you are about the operational problem, the more useful the session will be.</p>

              <form id="demo-form" data-honest-form data-form-kind="Demonstration request" novalidate>
                <div class="form-grid">
%s
                  <div class="form-group form-group--full">
                    <label for="demo-size">Approximate scale of operation <span class="form-optional">(optional)</span></label>
                    <input type="text" id="demo-size" name="scale" placeholder="e.g. 26,000 residents; 480,000 sq ft; 6 facilities" />
                  </div>
                </div>

                <fieldset class="form-fieldset">
                  <legend class="form-legend">Areas of interest <span class="form-optional">(select any that apply)</span></legend>
                  <div class="checkbox-grid">
%s
                  </div>
                </fieldset>

                <fieldset class="form-fieldset">
                  <legend class="form-legend">Timing <span class="form-optional">(optional)</span></legend>
                  <div class="checkbox-grid checkbox-grid--radio">
                    <label class="checkbox-item"><input type="radio" name="timing" value="Exploring — no timeline yet" /><span>Exploring &mdash; no timeline yet</span></label>
                    <label class="checkbox-item"><input type="radio" name="timing" value="Planning for next budget cycle" /><span>Next budget cycle</span></label>
                    <label class="checkbox-item"><input type="radio" name="timing" value="Active need this quarter" /><span>Active need this quarter</span></label>
                    <label class="checkbox-item"><input type="radio" name="timing" value="Urgent — immediate problem" /><span>Urgent &mdash; immediate problem</span></label>
                  </div>
                </fieldset>

                <div class="form-group form-group--full">
                  <label for="demo-goals">What are you trying to solve? <span aria-hidden="true">*</span></label>
                  <textarea id="demo-goals" name="goals" rows="6" required aria-describedby="demo-goals-error demo-goals-hint" placeholder="For example: we cannot produce a defensible capital plan because our asset condition data lives in three places and nobody trusts any of them."></textarea>
                  <p class="form-hint" id="demo-goals-hint">Describe the actual difficulty, not the software category. That is what makes the session worth your time.</p>
                  <p class="form-error" id="demo-goals-error" role="alert"></p>
                </div>

%s

                <button type="submit" class="btn btn--primary btn--lg">Prepare my request</button>
              </form>

%s
            </div>
          </div>

          <aside>
            <div class="card card--flat">
              <span class="card__eyebrow">What to Expect</span>
              <h3 class="card__title">The session itself</h3>
              <ul class="card__list" role="list">
                <li><strong>45 to 60 minutes.</strong> Long enough to get into a real problem, short enough to fit a working calendar.</li>
                <li><strong>Working software, live.</strong> Nexus modules driven against demonstration data, not screenshots.</li>
                <li><strong>Your problem, not our script.</strong> We spend most of the time on what you described in this form.</li>
                <li><strong>Explicit limits.</strong> We will tell you what is built, what is in development, and what would require custom work.</li>
                <li><strong>No pressure sequence.</strong> There is no second call designed to create urgency.</li>
              </ul>
            </div>

            <div class="card card--flat" style="margin-top:1.25rem">
              <span class="card__eyebrow">Before You Ask</span>
              <h3 class="card__title">Worth knowing up front</h3>
              <ul class="card__list" role="list">
                <li>GCS is a founder-led firm. You will speak with Sam Hurwitz, not a sales development representative.</li>
                <li>Genesis agent capabilities are delivered inside engagements today, not as a self-service product. We label maturity honestly on the <a href="%sgenesis/">Genesis page</a>.</li>
                <li>If your operating record is not yet structured, the honest first step is an assessment &mdash; not a platform purchase.</li>
                <li>We will tell you if GCS is not the right fit. That is a shorter conversation and a better outcome for both parties.</li>
              </ul>
            </div>

            <div class="card card--flat" style="margin-top:1.25rem">
              <span class="card__eyebrow">Explore First</span>
              <h3 class="card__title">Available right now</h3>
              <ul class="anchor-list" role="list">
                <li><a href="%snexus/">Nexus Platform demonstration</a></li>
                <li><a href="%smap-intelligence/">Map Intelligence demonstration</a></li>
                <li><a href="%sfounder-command-center/">Founder Command Center</a></li>
                <li><a href="%ssolutions/">Twelve solution areas</a></li>
                <li><a href="%sreference/">Reference implementations</a></li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>
""" % (
    core_fields("demo"),
    interest_boxes,
    DISCLOSURE,
    result_block("demo", "Request prepared &mdash; not yet sent"),
    P, P, P, P, P, P,
)

S.write(
    "request-demo/",
    "Request a Demonstration | GCS",
    "Request a working demonstration of the Nexus platform and the GCS operations intelligence method. Founder-led sessions focused on your actual operational problem.",
    demo_body,
    active="demo",
)


# =================================================================== CONTACT
contact_body = S.page_hero(
    P,
    "Contact",
    "Start With the Actual Problem.",
    "Whether you are evaluating a platform, scoping an assessment, or simply trying to describe something that is not working, the conversation begins the same way &mdash; with what is actually happening in your operation.",
    [(None, "Contact")],
) + """    <section class="section">
      <div class="container">
        <div class="split">
          <div>
            <div class="form-card">
              <h2 class="form-card__title">Send a message</h2>
              <p class="form-card__lead">Fields marked with an asterisk are required.</p>

              <form id="contact-form" data-honest-form data-form-kind="General inquiry" novalidate>
                <div class="form-grid">
%s
                </div>

                <div class="form-group form-group--full">
                  <label for="contact-goals">How can we help? <span aria-hidden="true">*</span></label>
                  <textarea id="contact-goals" name="goals" rows="7" required aria-describedby="contact-goals-error contact-goals-hint" placeholder="Describe what you are trying to accomplish, what is currently getting in the way, and any constraints we should know about."></textarea>
                  <p class="form-hint" id="contact-goals-hint">Specific beats polished. A paragraph describing a real operational difficulty is more useful than a formal request for information.</p>
                  <p class="form-error" id="contact-goals-error" role="alert"></p>
                </div>

%s

                <button type="submit" class="btn btn--primary btn--lg">Prepare my message</button>
              </form>

%s
            </div>
          </div>

          <aside>
            <div class="contact-card">
              <span class="card__eyebrow">Direct Contact</span>
              <h3 class="card__title">General Contractor Solutions LLC</h3>
              <dl class="contact-card__list">
                <div class="contact-card__row">
                  <dt><span aria-hidden="true">%s</span> Email</dt>
                  <dd><a href="mailto:info@buildbetterwithgcs.com">info@buildbetterwithgcs.com</a></dd>
                </div>
                <div class="contact-card__row">
                  <dt><span aria-hidden="true">%s</span> Website</dt>
                  <dd><a href="https://buildbetterwithgcs.com">buildbetterwithgcs.com</a></dd>
                </div>
                <div class="contact-card__row">
                  <dt><span aria-hidden="true">%s</span> Leadership</dt>
                  <dd>Sam Hurwitz, Founder &mdash; <a href="%sfounder/">professional background</a></dd>
                </div>
                <div class="contact-card__row">
                  <dt><span aria-hidden="true">%s</span> Focus</dt>
                  <dd>Operations intelligence for public sector, institutional, and commercial organizations</dd>
                </div>
                <div class="contact-card__row">
                  <dt><span aria-hidden="true">%s</span> Response</dt>
                  <dd>Inquiries are answered directly by the founder, typically within two business days</dd>
                </div>
              </dl>
            </div>

            <div class="card card--flat" style="margin-top:1.25rem">
              <span class="card__eyebrow">Common Reasons People Write</span>
              <h3 class="card__title">Where to start</h3>
              <ul class="card__list" role="list">
                <li><strong>&ldquo;We cannot answer a basic question about our own operation.&rdquo;</strong> That is an operations intelligence problem, and it is where most engagements begin.</li>
                <li><strong>&ldquo;Our capital plan is not defensible.&rdquo;</strong> Usually a condition and criticality data problem before it is a funding problem.</li>
                <li><strong>&ldquo;We are drowning in reactive work.&rdquo;</strong> The reactive-to-planned ratio is measurable, and the causes are usually identifiable.</li>
                <li><strong>&ldquo;Compliance is tracked in someone's head.&rdquo;</strong> Obligation registers and evidence assembly are directly addressable.</li>
                <li><strong>&ldquo;We are being asked about AI and need a defensible answer.&rdquo;</strong> Start with our <a href="%sresponsible-ai/">Responsible AI statement</a>.</li>
              </ul>
            </div>

            <div class="card card--flat" style="margin-top:1.25rem">
              <span class="card__eyebrow">Looking for a Demonstration?</span>
              <h3 class="card__title">Use the demo request form</h3>
              <p class="card__desc">If you want to see the platform working rather than ask a question, the demonstration request form captures the context needed to make that session useful.</p>
              <a href="%srequest-demo/" class="btn btn--outline btn--sm" style="margin-top:1rem">Request a Demonstration</a>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Transparency</span>
          <h2 class="section-title">What Happens to What You Send</h2>
        </div>
        <div class="grid grid--3">
%s
        </div>
      </div>
    </section>
""" % (
    core_fields("contact"),
    DISCLOSURE,
    result_block("contact", "Message prepared &mdash; not yet sent"),
    icon("report", 16), icon("grid", 16), icon("users", 16),
    P,
    icon("target", 16), icon("clock", 16),
    P,
    P,
    "\n".join([
        card("shield", "Nothing leaves your browser here", "This site is static. The forms on this page perform validation locally and generate a summary for you to send yourself. No submission endpoint exists, no analytics capture your entries, and no cookie records what you typed."),
        card("book", "What we do with an email", "An email you send is used to respond to your inquiry and to maintain the record of our correspondence. It is not sold, shared with data brokers, or used to build a marketing profile. Details are in our <a href=\"%sprivacy/\">privacy policy</a>." % P),
        card("users", "Who reads it", "Inquiries reach the founder directly. There is no lead qualification queue, no drip sequence, and no reassignment to a sales team. If GCS is not the right fit for what you describe, we will say so plainly."),
    ]),
)

S.write(
    "contact/",
    "Contact GCS | General Contractor Solutions LLC",
    "Contact GCS — General Contractor Solutions LLC. Email info@buildbetterwithgcs.com or use the client-side contact form to prepare an inquiry about operations intelligence.",
    contact_body,
    active="contact",
)

print("form pages written")

# -*- coding: utf-8 -*-
"""Legal and policy pages: privacy, terms, accessibility, responsible AI."""

import shell as S

P = "../"
EFFECTIVE = "February 1, 2026"


def toc(items):
    lis = "\n".join(
        '            <li><a href="#%s">%s</a></li>' % (i, t) for i, t in items
    )
    return """          <nav class="prose__toc" aria-label="On this page">
            <h2>On This Page</h2>
            <ol>
%s
            </ol>
          </nav>""" % lis


def legal_body(prefix_hero, sections_toc, prose):
    return prefix_hero + """    <section class="section">
      <div class="container">
        <div class="prose">
          <p class="prose__meta">Effective date: %s &middot; Last reviewed: %s</p>
%s
%s
        </div>
      </div>
    </section>
""" % (EFFECTIVE, EFFECTIVE, sections_toc, prose)


# ============================================================
# PRIVACY
# ============================================================
privacy_toc = toc([
    ("scope", "Scope of This Policy"),
    ("collect", "Information We Collect"),
    ("use", "How We Use Information"),
    ("basis", "Lawful Bases for Processing"),
    ("forms", "Website Forms and Submission"),
    ("hosting", "Hosting, Logs, and Third-Party Services"),
    ("cookies", "Cookies and Similar Technologies"),
    ("client-data", "Client and Engagement Data"),
    ("ai", "Artificial Intelligence and Automated Processing"),
    ("sharing", "How We Share Information"),
    ("retention", "Data Retention"),
    ("security", "Security"),
    ("rights", "Your Privacy Rights"),
    ("transfers", "International Transfers"),
    ("children", "Children's Privacy"),
    ("changes", "Changes to This Policy"),
    ("contact", "How to Contact Us"),
])

privacy_prose = """
          <p>General Contractor Solutions LLC (&ldquo;GCS,&rdquo; &ldquo;we,&rdquo; &ldquo;us,&rdquo; or &ldquo;our&rdquo;) respects the privacy of every person and organization that interacts with us. This policy explains what information we collect through this website and through our consulting and platform engagements, why we collect it, how long we keep it, and the choices available to you.</p>

          <h2 id="scope">1. Scope of This Policy</h2>
          <p>This policy applies to <strong>buildbetterwithgcs.com</strong> and to information you provide directly to GCS by email, through a website form, or in the ordinary course of a professional engagement. It does not apply to third-party websites that we may link to, which operate under their own policies.</p>
          <p>Where GCS processes data on behalf of a client &mdash; for example, operational records inside a Nexus deployment &mdash; the client is the controller of that data and GCS acts as a processor under the terms of the applicable engagement agreement. Section 8 describes how we treat that data.</p>

          <h2 id="collect">2. Information We Collect</h2>
          <p>We deliberately collect as little as possible. Categories include:</p>
          <ul>
            <li><strong>Contact information you submit.</strong> Name, work email address, optional phone number, organization name, organization type, and the free-text description of your needs or goals that you choose to include in a contact or demo request.</li>
            <li><strong>Correspondence.</strong> The content of emails and messages you send to us, and our replies.</li>
            <li><strong>Engagement information.</strong> Business information exchanged during scoping, proposals, and delivery, such as role titles, departmental structures, and operational documentation you elect to share.</li>
            <li><strong>Technical information.</strong> Standard web server and content delivery logs generated automatically when a browser requests a page, including IP address, user agent string, referring page, and timestamp.</li>
          </ul>
          <p>We do <strong>not</strong> intentionally collect special category data (such as health, biometric, racial or ethnic origin, political opinions, or trade union membership), and we ask that you do not include such information in free-text form fields.</p>

          <h2 id="use">3. How We Use Information</h2>
          <ul>
            <li>To respond to inquiries, schedule conversations, and prepare demonstrations you have requested.</li>
            <li>To scope, price, deliver, and support consulting engagements and platform implementations.</li>
            <li>To maintain records required for contracting, invoicing, insurance, and tax purposes.</li>
            <li>To secure and operate this website, diagnose faults, and prevent abuse.</li>
            <li>To improve the clarity and usefulness of our published materials.</li>
          </ul>
          <p>We do not sell personal information. We do not share personal information with advertising networks, data brokers, or list vendors. We do not use your information to train publicly available machine learning models.</p>

          <h2 id="basis">4. Lawful Bases for Processing</h2>
          <p>Where the EU or UK General Data Protection Regulation applies, GCS relies on the following lawful bases:</p>
          <ul>
            <li><strong>Legitimate interests</strong> &mdash; responding to business inquiries, operating and securing our website, and communicating with prospective and current clients in a professional capacity.</li>
            <li><strong>Performance of a contract</strong> &mdash; delivering the services described in an engagement agreement.</li>
            <li><strong>Legal obligation</strong> &mdash; retaining records required by accounting, tax, or regulatory rules.</li>
            <li><strong>Consent</strong> &mdash; where we ask for it explicitly, and which you may withdraw at any time.</li>
          </ul>

          <h2 id="forms">5. Website Forms and Submission</h2>
          <p>This website is a static site. The contact and demo request forms perform validation entirely inside your browser and <strong>do not transmit your entry to a GCS server</strong>. After validation, the page presents a summary of what you entered along with an email link so that you can send the information to us yourself. This means:</p>
          <ul>
            <li>Nothing you type into a form on this site is stored by GCS unless and until you send it to us by email.</li>
            <li>No hidden analytics call, tracking pixel, or third-party endpoint receives your form entries.</li>
            <li>If you close the page without sending the email, the information is discarded with the page.</li>
          </ul>
          <p>Once you email us, that message is handled by our email provider and retained as described in Section 11.</p>

          <h2 id="hosting">6. Hosting, Logs, and Third-Party Services</h2>
          <p>This website is hosted on <strong>GitHub Pages</strong>. GitHub processes standard request logs for delivery, security, and abuse prevention, in accordance with its own privacy statement. GCS does not have access to individual visitor identities through this hosting arrangement.</p>
          <p>Web fonts are requested from <strong>Google Fonts</strong>. That request necessarily discloses your IP address and user agent to Google in order to deliver the font files. No other third-party resources are loaded by this site &mdash; there is no advertising network, no session recording, no chat widget, and no social media tracking script.</p>

          <h2 id="cookies">7. Cookies and Similar Technologies</h2>
          <p>GCS does not set cookies on this website. We do not deploy analytics cookies, advertising identifiers, fingerprinting scripts, or cross-site trackers. Because no cookies are set, no cookie consent banner is presented.</p>
          <p>If we introduce measurement tooling in the future, we will update this policy before doing so and will implement consent controls where required by law.</p>

          <h2 id="client-data">8. Client and Engagement Data</h2>
          <p>During an engagement, GCS may be granted access to operational data belonging to a client &mdash; asset registers, work order histories, capital plans, compliance records, and similar material. That data is handled under the following commitments:</p>
          <ul>
            <li>It is used only for the purposes defined in the engagement agreement.</li>
            <li>Access is limited to personnel and systems with a demonstrable need.</li>
            <li>It is not used to build or enrich products offered to other clients without explicit written authorization.</li>
            <li>It is returned or securely destroyed at the end of the engagement, on the schedule the agreement specifies.</li>
          </ul>
          <p>Public-sector clients frequently operate under records retention statutes and open records laws. GCS aligns its handling and retention practices with the client's statutory obligations.</p>

          <h2 id="ai">9. Artificial Intelligence and Automated Processing</h2>
          <p>GCS builds and operates AI-assisted operational tooling. Two commitments govern how that intersects with privacy:</p>
          <ul>
            <li><strong>No solely automated decisions with legal or similarly significant effects.</strong> Where an automated system produces a recommendation that affects a person, a named human reviews and authorizes the outcome.</li>
            <li><strong>No repurposing of your data.</strong> Information you submit through this website, and client data processed during an engagement, is not used to train general-purpose models.</li>
          </ul>
          <p>Our broader governance commitments are published in our <a href="../responsible-ai/">Responsible AI statement</a>.</p>

          <h2 id="sharing">10. How We Share Information</h2>
          <p>We share personal information only in these circumstances:</p>
          <ul>
            <li><strong>Service providers</strong> that operate infrastructure on our behalf (for example, email hosting and website hosting), bound by confidentiality obligations and permitted to use the information only to provide that service.</li>
            <li><strong>Professional advisors</strong> such as legal counsel and accountants, where necessary and under duties of confidence.</li>
            <li><strong>Legal compliance</strong> where disclosure is required by law, regulation, subpoena, or court order.</li>
            <li><strong>Business transfer</strong> in the event of a merger, acquisition, or sale of assets, in which case the recipient remains bound by this policy until it is superseded with notice.</li>
          </ul>

          <h2 id="retention">11. Data Retention</h2>
          <ul>
            <li><strong>Inquiries that do not become engagements</strong> &mdash; retained up to 24 months, then deleted.</li>
            <li><strong>Engagement records</strong> &mdash; retained for the duration of the engagement plus the period required by contract, professional standards, and applicable law, typically seven years for financial records.</li>
            <li><strong>Client operational data</strong> &mdash; retained per the engagement agreement, then returned or destroyed.</li>
            <li><strong>Server logs</strong> &mdash; retained by our hosting provider for its own operational window; GCS does not maintain a separate copy.</li>
          </ul>

          <h2 id="security">12. Security</h2>
          <p>GCS applies administrative, technical, and physical safeguards proportionate to the sensitivity of the information we hold. These include access control on a least-privilege basis, encryption of data in transit, multi-factor authentication on business systems, separation of client environments, background-appropriate confidentiality agreements, and periodic review of access rights.</p>
          <p>No method of transmission or storage is perfectly secure. We ask that you avoid sending sensitive information &mdash; credentials, financial account numbers, or personal identifiers &mdash; through unencrypted email or through a website form.</p>

          <h2 id="rights">13. Your Privacy Rights</h2>
          <p>Subject to applicable law, you may have the right to:</p>
          <ul>
            <li>Request access to the personal information we hold about you.</li>
            <li>Request correction of inaccurate or incomplete information.</li>
            <li>Request deletion of information we no longer have a lawful reason to keep.</li>
            <li>Request restriction of, or object to, certain processing.</li>
            <li>Request a portable copy of information you provided to us.</li>
            <li>Withdraw consent where processing is based on consent.</li>
            <li>Lodge a complaint with your supervisory authority.</li>
          </ul>
          <p>To exercise a right, email <a href="mailto:info@buildbetterwithgcs.com">info@buildbetterwithgcs.com</a> with the subject line &ldquo;Privacy Request.&rdquo; We respond within 30 days, or sooner where the law requires. We will ask you for enough information to verify your identity before acting. We do not charge a fee for a reasonable request, and we do not discriminate against anyone for exercising a privacy right.</p>
          <p>If your request concerns data GCS processes on behalf of a client, we will refer you to that client, who is the controller of the data, and support their response.</p>

          <h2 id="transfers">14. International Transfers</h2>
          <p>GCS is based in the United States, and information you send to us will be processed there. Where personal information is transferred from the European Economic Area, the United Kingdom, or Switzerland, we rely on appropriate safeguards such as Standard Contractual Clauses together with supplementary technical and organizational measures.</p>

          <h2 id="children">15. Children's Privacy</h2>
          <p>Our website and services are directed to organizations and business professionals. We do not knowingly collect personal information from anyone under 16. If you believe a child has provided information to us, contact us and we will delete it.</p>

          <h2 id="changes">16. Changes to This Policy</h2>
          <p>We review this policy at least annually and update it when our practices change. The effective date at the top of the page reflects the most recent revision. Material changes will be summarized at the top of the page for at least 60 days after they take effect.</p>

          <h2 id="contact">17. How to Contact Us</h2>
          <p>Privacy questions, requests, and complaints:</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:info@buildbetterwithgcs.com">info@buildbetterwithgcs.com</a></li>
            <li><strong>Subject line:</strong> Privacy Request</li>
            <li><strong>Entity:</strong> General Contractor Solutions LLC</li>
          </ul>
          <p>We take every privacy inquiry seriously and will work with you in good faith to resolve it.</p>
"""

privacy_hero = S.page_hero(
    P,
    "Legal",
    "Privacy Policy",
    "How General Contractor Solutions LLC collects, uses, protects, and retains information &mdash; written to be read, not to be skipped.",
    [(None, "Privacy Policy")],
)

S.write(
    "privacy/",
    "Privacy Policy | GCS — General Contractor Solutions LLC",
    "How GCS collects, uses, shares, retains, and protects personal and client information, including your privacy rights and how to exercise them.",
    legal_body(privacy_hero, privacy_toc, privacy_prose),
)


# ============================================================
# TERMS
# ============================================================
terms_toc = toc([
    ("acceptance", "Acceptance of Terms"),
    ("site", "Purpose of This Website"),
    ("no-advice", "No Professional Advice"),
    ("demo", "Demonstration Content and Sample Data"),
    ("forward", "Forward-Looking Statements"),
    ("ip", "Intellectual Property"),
    ("permitted", "Permitted and Prohibited Use"),
    ("submissions", "Your Submissions"),
    ("thirdparty", "Third-Party Links and Services"),
    ("engagements", "Engagements and Separate Agreements"),
    ("availability", "Availability and Changes"),
    ("disclaimer", "Disclaimer of Warranties"),
    ("liability", "Limitation of Liability"),
    ("indemnity", "Indemnification"),
    ("law", "Governing Law and Disputes"),
    ("general", "General Provisions"),
    ("contact", "Contact"),
])

terms_prose = """
          <p>These Terms of Service (&ldquo;Terms&rdquo;) govern your access to and use of <strong>buildbetterwithgcs.com</strong> and any content published on it (the &ldquo;Site&rdquo;), operated by General Contractor Solutions LLC (&ldquo;GCS&rdquo;). Please read them carefully.</p>

          <h2 id="acceptance">1. Acceptance of Terms</h2>
          <p>By accessing or using the Site, you agree to be bound by these Terms and by our <a href="../privacy/">Privacy Policy</a>. If you do not agree, please do not use the Site. If you use the Site on behalf of an organization, you represent that you are authorized to bind that organization to these Terms.</p>

          <h2 id="site">2. Purpose of This Website</h2>
          <p>The Site is an informational and marketing resource describing the services, methods, and software concepts of GCS. It is not a transactional platform. No account is created, no payment is processed, and no client data is transmitted to GCS through this Site.</p>

          <h2 id="no-advice">3. No Professional Advice</h2>
          <p>Content on the Site is provided for general informational purposes. It does not constitute legal, financial, engineering, safety, regulatory, accounting, or professional advice, and it is not a substitute for engaging a qualified professional with knowledge of your specific circumstances. Nothing on the Site creates a consulting relationship, a fiduciary duty, or a duty of care. Do not act, or refrain from acting, based solely on Site content.</p>

          <h2 id="demo">4. Demonstration Content and Sample Data</h2>
          <p>Several pages on this Site &mdash; including the <a href="../nexus/">Nexus Platform</a> demonstration, the <a href="../founder-command-center/">Founder Command Center</a>, and <a href="../map-intelligence/">Map Intelligence</a> &mdash; present interactive interfaces populated with <strong>illustrative demonstration data</strong>. That data is invented for the purpose of communicating design and functionality. It is labeled as such wherever it appears.</p>
          <ul>
            <li>The organizations, projects, assets, budgets, dates, names, and metrics shown are fictional.</li>
            <li>No client's live or historical data appears in any demonstration on this Site.</li>
            <li>Demonstration screens do not connect to a production system, do not persist state, and do not represent a service-level commitment.</li>
            <li>Interface layouts, module names, and capabilities shown may change without notice.</li>
          </ul>

          <h2 id="forward">5. Forward-Looking Statements</h2>
          <p>Descriptions of planned capabilities, roadmap items, and product direction are forward-looking. They reflect current intent and are not commitments to deliver a specific feature on a specific date. Where a capability is planned rather than available, we label it accordingly. You should not rely on a described future capability when making a purchasing or planning decision.</p>

          <h2 id="ip">6. Intellectual Property</h2>
          <p>The Site and its contents &mdash; including text, graphics, interface designs, diagrams, methodologies, structure, selection and arrangement, source code, and the marks <strong>GCS</strong>, <strong>General Contractor Solutions</strong>, <strong>Nexus</strong>, <strong>Genesis</strong>, and <strong>Building Better Organizations</strong> &mdash; are owned by GCS or its licensors and are protected by copyright, trademark, and other intellectual property laws.</p>
          <p>No license is granted except as expressly stated in Section 7. All rights not expressly granted are reserved.</p>

          <h2 id="permitted">7. Permitted and Prohibited Use</h2>
          <p><strong>You may</strong> view the Site, and print or download individual pages for your own internal, non-commercial evaluation, provided you keep all proprietary notices intact.</p>
          <p><strong>You may not:</strong></p>
          <ul>
            <li>Copy, republish, distribute, or publicly display Site content for commercial purposes without written permission.</li>
            <li>Create derivative works from Site content, or remove or obscure attribution and proprietary notices.</li>
            <li>Use automated means to scrape, harvest, mine, or systematically extract content, except for well-behaved search engine indexing consistent with our <code>robots.txt</code>.</li>
            <li>Attempt to gain unauthorized access to the Site, its hosting infrastructure, or any connected system.</li>
            <li>Introduce malware, attempt to disrupt availability, or probe for vulnerabilities without written authorization.</li>
            <li>Use the Site or any content from it to train a machine learning model without written permission.</li>
            <li>Misrepresent your affiliation with GCS, or use our marks in a way likely to cause confusion.</li>
          </ul>

          <h2 id="submissions">8. Your Submissions</h2>
          <p>If you send GCS an inquiry, demo request, feedback, or suggestion, you grant GCS a non-exclusive, worldwide, royalty-free license to use it for the purpose of responding to you and improving our services. Do not send confidential or proprietary information through an unsecured channel; unsolicited material sent to us is not received under an obligation of confidence unless a signed agreement says otherwise.</p>

          <h2 id="thirdparty">9. Third-Party Links and Services</h2>
          <p>The Site may link to third-party websites and loads web fonts from a third-party provider. GCS does not control those parties, does not endorse their content, and is not responsible for their practices. Your use of a third-party service is governed by that party's terms.</p>

          <h2 id="engagements">10. Engagements and Separate Agreements</h2>
          <p>Consulting services, platform access, licensing, and support are provided only under a separate written agreement executed by both parties. In the event of a conflict between these Terms and an executed engagement agreement, the engagement agreement controls with respect to the services it covers. Pricing, scope, service levels, warranties, and data handling are addressed in that agreement, not here.</p>
          <p>Submitting a form or sending an inquiry does not create a contract, reserve capacity, or obligate GCS to provide services.</p>

          <h2 id="availability">11. Availability and Changes</h2>
          <p>GCS may modify, suspend, or discontinue any part of the Site at any time without notice. We may revise these Terms by posting an updated version with a new effective date. Your continued use after a revision constitutes acceptance of the revised Terms.</p>

          <h2 id="disclaimer">12. Disclaimer of Warranties</h2>
          <p>THE SITE AND ALL CONTENT ARE PROVIDED &ldquo;AS IS&rdquo; AND &ldquo;AS AVAILABLE,&rdquo; WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED. TO THE FULLEST EXTENT PERMITTED BY LAW, GCS DISCLAIMS ALL WARRANTIES, INCLUDING IMPLIED WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, TITLE, AND NON-INFRINGEMENT. GCS DOES NOT WARRANT THAT THE SITE WILL BE UNINTERRUPTED, SECURE, OR ERROR-FREE, OR THAT CONTENT IS ACCURATE, COMPLETE, OR CURRENT.</p>

          <h2 id="liability">13. Limitation of Liability</h2>
          <p>TO THE FULLEST EXTENT PERMITTED BY LAW, GCS AND ITS MEMBERS, OFFICERS, EMPLOYEES, AND AGENTS WILL NOT BE LIABLE FOR ANY INDIRECT, INCIDENTAL, SPECIAL, CONSEQUENTIAL, EXEMPLARY, OR PUNITIVE DAMAGES, OR FOR LOST PROFITS, LOST REVENUE, LOST DATA, OR BUSINESS INTERRUPTION, ARISING OUT OF OR RELATED TO YOUR USE OF THE SITE, WHETHER BASED IN CONTRACT, TORT, STRICT LIABILITY, OR OTHERWISE, EVEN IF ADVISED OF THE POSSIBILITY OF SUCH DAMAGES.</p>
          <p>GCS'S TOTAL AGGREGATE LIABILITY ARISING FROM OR RELATED TO THE SITE WILL NOT EXCEED ONE HUNDRED U.S. DOLLARS (US$100). Some jurisdictions do not allow certain exclusions or limitations; in those jurisdictions, liability is limited to the maximum extent permitted by law.</p>

          <h2 id="indemnity">14. Indemnification</h2>
          <p>You agree to indemnify, defend, and hold harmless GCS and its members, officers, employees, and agents from any claim, demand, loss, liability, or expense (including reasonable attorneys' fees) arising out of your use of the Site, your violation of these Terms, or your violation of any law or third-party right.</p>

          <h2 id="law">15. Governing Law and Disputes</h2>
          <p>These Terms are governed by the laws of the State of New Jersey, United States, without regard to conflict-of-laws principles. The parties agree to first attempt to resolve any dispute informally by written notice and good-faith discussion for at least 30 days. Any dispute not resolved informally will be brought exclusively in the state or federal courts located in New Jersey, and you consent to personal jurisdiction there. Any claim must be filed within one year after it arises.</p>

          <h2 id="general">16. General Provisions</h2>
          <ul>
            <li><strong>Entire agreement.</strong> These Terms and the Privacy Policy constitute the entire agreement regarding the Site.</li>
            <li><strong>Severability.</strong> If any provision is held unenforceable, the remainder stays in effect and the unenforceable provision is reformed to the minimum extent necessary.</li>
            <li><strong>No waiver.</strong> Failure to enforce a provision is not a waiver of the right to enforce it later.</li>
            <li><strong>Assignment.</strong> You may not assign these Terms without our written consent; GCS may assign them in connection with a merger, acquisition, or sale of assets.</li>
            <li><strong>Headings.</strong> Section headings are for convenience only and do not affect interpretation.</li>
          </ul>

          <h2 id="contact">17. Contact</h2>
          <p>Questions about these Terms may be sent to <a href="mailto:info@buildbetterwithgcs.com">info@buildbetterwithgcs.com</a> with the subject line &ldquo;Terms of Service.&rdquo;</p>
"""

terms_hero = S.page_hero(
    P,
    "Legal",
    "Terms of Service",
    "The terms that govern use of this website, including how demonstration content should be interpreted and how engagements are actually formed.",
    [(None, "Terms of Service")],
)

S.write(
    "terms/",
    "Terms of Service | GCS — General Contractor Solutions LLC",
    "Terms governing use of the GCS website, including intellectual property, demonstration content, disclaimers, limitation of liability, and dispute resolution.",
    legal_body(terms_hero, terms_toc, terms_prose),
)


# ============================================================
# ACCESSIBILITY
# ============================================================
access_toc = toc([
    ("commitment", "Our Commitment"),
    ("standard", "Conformance Standard"),
    ("measures", "Measures We Take"),
    ("features", "Accessibility Features of This Site"),
    ("known", "Known Limitations"),
    ("assistive", "Compatibility and Testing"),
    ("products", "Accessibility in Our Products and Deliverables"),
    ("accommodations", "Requesting an Accommodation"),
    ("feedback", "Feedback and Response Commitment"),
    ("escalation", "If You Are Not Satisfied"),
])

access_prose = """
          <p>General Contractor Solutions LLC is committed to making this website usable by the widest possible audience, including people who use screen readers, keyboard-only navigation, screen magnification, speech input, or other assistive technology.</p>

          <h2 id="commitment">1. Our Commitment</h2>
          <p>Accessibility is not a compliance checkbox for us. GCS works extensively with municipalities, school districts, healthcare organizations, and public agencies &mdash; institutions with a legal and civic duty to serve everyone. We hold our own materials to the same standard we recommend to our clients.</p>

          <h2 id="standard">2. Conformance Standard</h2>
          <p>We target conformance with the <strong>Web Content Accessibility Guidelines (WCAG) 2.1, Level AA</strong>, published by the World Wide Web Consortium. We also design with Section 508 of the U.S. Rehabilitation Act and EN 301 549 in mind, since many of our clients are subject to those requirements.</p>
          <p>We describe this site as <strong>partially conformant</strong> with WCAG 2.1 Level AA. &ldquo;Partially conformant&rdquo; means most of the site meets the standard, and we have identified specific areas where work remains. Those areas are listed in Section 5. We publish this honestly rather than claiming full conformance we have not independently verified.</p>

          <h2 id="measures">3. Measures We Take</h2>
          <ul>
            <li>Accessibility requirements are considered during design rather than retrofitted afterward.</li>
            <li>Semantic HTML is used as the foundation of every page, with ARIA applied only where native semantics are insufficient.</li>
            <li>Color contrast is checked against WCAG AA thresholds for text and meaningful interface elements.</li>
            <li>Every interactive element is reachable and operable by keyboard alone, with a visible focus indicator.</li>
            <li>Interfaces are tested at 200% zoom and at narrow viewport widths for reflow without loss of content or function.</li>
            <li>Motion is reduced automatically for visitors whose systems request <code>prefers-reduced-motion</code>.</li>
          </ul>

          <h2 id="features">4. Accessibility Features of This Site</h2>
          <ul>
            <li><strong>Skip link.</strong> A &ldquo;Skip to main content&rdquo; link is the first focusable element on every page.</li>
            <li><strong>Landmark structure.</strong> Each page uses <code>header</code>, <code>nav</code>, <code>main</code>, and <code>footer</code> landmarks with accessible names.</li>
            <li><strong>Heading hierarchy.</strong> One <code>h1</code> per page, with headings nested in order and not skipped for visual effect.</li>
            <li><strong>Keyboard-accessible components.</strong> The navigation menu, dashboard tab sets, map layer toggles, map pins, and accordions all operate by keyboard. Tab sets support arrow-key, Home, and End navigation following the WAI-ARIA Authoring Practices.</li>
            <li><strong>Form accessibility.</strong> Every field has a persistent visible label, required fields are marked programmatically, and validation errors are announced through a live region and linked to their field.</li>
            <li><strong>Data tables.</strong> Tabular content uses real table markup with header cells and captions rather than styled <code>div</code> elements.</li>
            <li><strong>Non-color status.</strong> Status indicators pair color with a text label so meaning does not depend on color perception alone.</li>
            <li><strong>Reduced motion.</strong> Chart, gauge, and pulse animations are disabled when reduced motion is requested.</li>
            <li><strong>Decorative graphics.</strong> Ornamental SVG and background elements are hidden from assistive technology with <code>aria-hidden</code>.</li>
            <li><strong>Text resizing.</strong> Layouts use relative units and remain usable when text is enlarged.</li>
          </ul>

          <h2 id="known">5. Known Limitations</h2>
          <p>We know about the following issues and are working on them. If you encounter something not listed here, please tell us.</p>
          <ul>
            <li><strong>Dense data visualizations.</strong> The demonstration dashboards present a large amount of information at once. While each chart has an accessible text equivalent, navigating a full dashboard panel by screen reader is more effortful than we would like. We are working to add summary-first structures and per-panel skip targets.</li>
            <li><strong>The illustrative map.</strong> The Map Intelligence page uses an abstract, non-geographic visualization. Every pin is a real focusable button with an accessible name, and selecting a pin updates a text detail panel through a live region &mdash; but spatial relationships between pins are not conveyed non-visually. A tabular &ldquo;list view&rdquo; equivalent of all mapped records is planned.</li>
            <li><strong>Horizontally scrolling tables.</strong> On narrow viewports, wide data tables scroll horizontally. The scroll container is keyboard focusable, but the pattern is not ideal for magnification users. Responsive stacking is planned.</li>
            <li><strong>Third-party web fonts.</strong> Fonts load from an external provider. If that request fails, the site falls back to system fonts, which changes appearance but preserves all content and function.</li>
            <li><strong>No formal third-party audit yet.</strong> Our conformance assessment is based on internal review with automated and manual testing. An independent audit has not been completed.</li>
          </ul>

          <h2 id="assistive">6. Compatibility and Testing</h2>
          <p>This site is built to work with current versions of major browsers &mdash; Chrome, Edge, Firefox, and Safari &mdash; on desktop and mobile, in combination with the assistive technology those platforms provide. Our internal testing includes keyboard-only traversal of every page, screen reader review of navigation and forms, contrast measurement, 200% zoom checks, and reduced-motion verification.</p>
          <p>The site does not depend on JavaScript for access to its content. If scripting is unavailable, all written content, navigation, and form fields remain readable and usable; interactive enhancements such as tab panels degrade to visible stacked content.</p>

          <h2 id="products">7. Accessibility in Our Products and Deliverables</h2>
          <p>Accessibility carries into the work we deliver. When GCS builds dashboards, reports, or platform modules for a client, we apply the same principles: semantic structure, keyboard operability, sufficient contrast, non-color status encoding, and text alternatives for visual information. Where a client is subject to Section 508, the ADA, or EN 301 549, we treat conformance as an explicit deliverable requirement rather than a best effort.</p>

          <h2 id="accommodations">8. Requesting an Accommodation</h2>
          <p>If any content on this site is inaccessible to you, or if you need information in an alternative format, contact us and we will provide it. There is no cost, and you do not need to explain why you are asking.</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:info@buildbetterwithgcs.com">info@buildbetterwithgcs.com</a></li>
            <li><strong>Subject line:</strong> Accessibility Request</li>
          </ul>
          <p>Formats we can provide on request include plain-text or large-print versions of any page, an accessible document version of published material, a text or tabular equivalent of any chart or map, and a live walkthrough of a demonstration by phone or video call with a person describing what is on screen.</p>
          <p>To help us respond quickly, it is useful &mdash; but never required &mdash; to include the page address, a description of the problem, and the browser and assistive technology you are using.</p>

          <h2 id="feedback">9. Feedback and Response Commitment</h2>
          <p>We aim to acknowledge accessibility reports within <strong>two business days</strong> and to provide a remediation plan or an accessible alternative within <strong>ten business days</strong>. If a fix will take longer, we will tell you why and give you a realistic date.</p>

          <h2 id="escalation">10. If You Are Not Satisfied</h2>
          <p>If our response does not resolve your issue, reply to the same thread and ask for escalation to the founder. Accessibility complaints reach leadership directly at GCS; they are not routed into a queue and forgotten.</p>
          <p class="prose__meta">This statement was prepared using the W3C Web Accessibility Initiative's accessibility statement guidance and is reviewed at least annually.</p>
"""

access_hero = S.page_hero(
    P,
    "Accessibility",
    "Accessibility Statement",
    "Our WCAG 2.1 Level AA commitment, the measures we take, the limitations we know about, and exactly how to request an accommodation.",
    [(None, "Accessibility")],
)

S.write(
    "accessibility/",
    "Accessibility Statement | GCS — General Contractor Solutions LLC",
    "GCS commits to WCAG 2.1 Level AA. Read our accessibility measures, known limitations, testing approach, and how to request an accommodation.",
    legal_body(access_hero, access_toc, access_prose),
)


# ============================================================
# RESPONSIBLE AI
# ============================================================
rai_toc = toc([
    ("position", "Our Position"),
    ("principles", "Seven Governing Principles"),
    ("oversight", "Human Oversight in Practice"),
    ("transparency", "Transparency"),
    ("auditability", "Auditability and the Decision Record"),
    ("data", "Data Handling and Model Use"),
    ("boundaries", "What We Will Not Automate"),
    ("evaluation", "Evaluation and Monitoring"),
    ("failure", "When the System Is Wrong"),
    ("workforce", "Impact on People and Work"),
    ("procurement", "Support for Public Procurement"),
    ("governance", "Governance and Review"),
    ("contact", "Raising a Concern"),
])

rai_prose = """
          <p>GCS builds AI-assisted operational systems. That places an obligation on us to be explicit about how those systems behave, what they are permitted to do, who is accountable for their output, and where we deliberately stop. This statement describes the standards we apply to our own work &mdash; the Genesis AI workforce, the Nexus platform, and everything we deliver to clients.</p>

          <h2 id="position">1. Our Position</h2>
          <p>Artificial intelligence in operations should <strong>compress the distance between a signal and a good decision</strong>. It should not obscure who made the decision, dilute accountability, or produce output that nobody can trace back to a source.</p>
          <p>We treat AI as an operational capability subject to the same controls as any other: defined scope, defined authority, defined escalation path, defined record. An agent that cannot be audited is not a productivity gain &mdash; it is an unmanaged risk.</p>

          <h2 id="principles">2. Seven Governing Principles</h2>
          <ol>
            <li><strong>Human accountability is non-transferable.</strong> A named person is accountable for every consequential outcome. An AI system may prepare, analyze, draft, and recommend. It does not absorb responsibility, and &ldquo;the system decided&rdquo; is never an acceptable explanation.</li>
            <li><strong>Authority is explicit and bounded.</strong> Every agent operates inside a written scope defining what it may read, what it may write, what it may initiate, what requires approval, and what is forbidden. Authority is granted deliberately, not inherited by default.</li>
            <li><strong>Consequential actions require approval.</strong> Anything that commits funds, changes a contractual position, alters a safety or compliance posture, affects a person's employment, or communicates externally on behalf of the organization requires human authorization before it takes effect.</li>
            <li><strong>Everything is traceable.</strong> Inputs, reasoning summary, outputs, approver, and timestamp are recorded for every agent action. If the record cannot answer &ldquo;why did this happen and who allowed it,&rdquo; the design is incomplete.</li>
            <li><strong>Uncertainty is disclosed, not smoothed over.</strong> Output states its confidence and its basis. Where data is stale, partial, or contested, the system says so rather than producing a clean-looking answer built on a weak foundation.</li>
            <li><strong>Data is used only for its stated purpose.</strong> Client operational data serves the client's objectives. It is not repurposed to train general-purpose models or to build capability sold to others without explicit written authorization.</li>
            <li><strong>Fairness is engineered and verified.</strong> Where a system influences the allocation of resources, attention, or service, we examine whether that allocation systematically disadvantages a community, facility, or group &mdash; and we correct it when it does.</li>
          </ol>

          <h2 id="oversight">3. Human Oversight in Practice</h2>
          <p>Oversight is a control structure, not an intention. Ours has four layers:</p>
          <ul>
            <li><strong>Scope definition.</strong> Before an agent is activated, its charter is written and approved: purpose, permitted data sources, permitted actions, approval thresholds, escalation triggers, and deactivation criteria.</li>
            <li><strong>Approval gates.</strong> Actions above a defined threshold pause and route to a named human queue with the full context needed to decide. An unapproved item does not execute &mdash; it expires.</li>
            <li><strong>Continuous review.</strong> Output is sampled and reviewed on a schedule, not only when something goes wrong. Reviews test accuracy, appropriateness, and whether the agent is operating inside its charter.</li>
            <li><strong>Founder oversight.</strong> At GCS, high-impact decisions and any change to an agent's authority reach the founder directly. Concentrated ownership is our answer to diffuse accountability.</li>
          </ul>
          <p>Oversight is meaningful only if the reviewer can actually intervene. Every human in an approval path has the standing authority to reject, modify, delay, or escalate &mdash; and to suspend an agent entirely without seeking permission first.</p>

          <h2 id="transparency">4. Transparency</h2>
          <ul>
            <li><strong>Disclosure of machine involvement.</strong> Where an AI system materially produced or shaped a document, analysis, or recommendation, that is disclosed on the artifact.</li>
            <li><strong>Explanations at the right altitude.</strong> A recommendation is accompanied by the factors that drove it and the data it drew on, expressed in operational language rather than model internals.</li>
            <li><strong>Honest capability claims.</strong> We distinguish between what is deployed today, what is in active development, and what is planned. We do not describe roadmap items as if they were shipped. On this website, forward-looking capabilities are labeled.</li>
            <li><strong>Named limitations.</strong> Every system we deliver ships with written documentation of what it does not do well and the conditions under which its output should be distrusted.</li>
          </ul>

          <h2 id="auditability">5. Auditability and the Decision Record</h2>
          <p>Auditability is the backbone of the architecture. For each agent action we retain a decision record containing:</p>
          <ul>
            <li>What triggered the action, and when.</li>
            <li>Which data sources were consulted, and how current they were.</li>
            <li>The recommendation or output produced, with its stated confidence.</li>
            <li>The alternatives considered and why they were not selected, where the decision was non-trivial.</li>
            <li>Who reviewed it, what they decided, when, and any modification they made.</li>
            <li>What was executed as a result, and the observable outcome.</li>
          </ul>
          <p>These records are append-only and retained per the client's retention schedule. For public-sector clients, they are structured to support open records requests, audit findings, grant reporting, and governing-body inquiry &mdash; which frequently means being able to reconstruct, years later, why a specific expenditure or prioritization decision was made.</p>

          <h2 id="data">6. Data Handling and Model Use</h2>
          <ul>
            <li>Client data is processed for the client's purposes under the engagement agreement, and for nothing else.</li>
            <li>Client data is not used to train general-purpose or cross-client models without explicit written authorization.</li>
            <li>Data minimization applies: agents receive the narrowest data scope that lets them do their job.</li>
            <li>Personal data is avoided in agent workflows unless operationally necessary, and is masked or aggregated where it is not.</li>
            <li>Where a third-party model provider is used, the arrangement, its data handling terms, and its retention posture are disclosed to the client.</li>
            <li>Model and prompt versions are recorded so that a past output can be interpreted in light of the system that produced it.</li>
          </ul>

          <h2 id="boundaries">7. What We Will Not Automate</h2>
          <p>Some decisions belong to people. GCS will not design or deliver systems that autonomously:</p>
          <ul>
            <li>Hire, discipline, evaluate, or terminate an employee.</li>
            <li>Make a final determination on a benefit, permit, license, citation, or entitlement affecting an individual.</li>
            <li>Execute a binding financial commitment, contract award, or procurement decision.</li>
            <li>Override a safety control, life-safety system, or emergency protocol.</li>
            <li>Issue an external communication on behalf of an organization without review.</li>
            <li>Alter a compliance record, regulatory filing, or audit trail.</li>
            <li>Conduct surveillance of individuals, or infer protected characteristics.</li>
          </ul>
          <p>In these areas AI may assemble evidence, surface precedent, and prepare options. A person decides, and the record says who.</p>

          <h2 id="evaluation">8. Evaluation and Monitoring</h2>
          <p>Before an agent is deployed it is evaluated against representative scenarios including edge cases and adversarial inputs, with acceptance thresholds agreed in advance. After deployment we monitor accuracy against observed outcomes, approval and rejection rates, escalation frequency, latency, and drift in data quality. A rejection rate that climbs is treated as a design signal, not a user problem.</p>
          <p>An agent that persistently operates outside its acceptance thresholds is suspended and re-scoped rather than tolerated.</p>

          <h2 id="failure">9. When the System Is Wrong</h2>
          <p>AI systems will produce incorrect output. Our commitments when that happens:</p>
          <ul>
            <li><strong>Rapid suspension.</strong> Any authorized reviewer can halt an agent immediately. No approval chain is required to stop something.</li>
            <li><strong>Notification.</strong> Affected parties are told promptly and directly, with what went wrong and what is being done.</li>
            <li><strong>Correction.</strong> Downstream artifacts built on the faulty output are identified and corrected, not quietly superseded.</li>
            <li><strong>Root cause.</strong> We determine whether the failure was data, scope, model behavior, or oversight design &mdash; and fix the layer that actually failed.</li>
            <li><strong>Disclosure.</strong> Material failures are documented in the decision record and reported to the client's governance body.</li>
          </ul>

          <h2 id="workforce">10. Impact on People and Work</h2>
          <p>We are direct about this because organizations deserve directness. AI-assisted operations changes what people spend their time on. Our design intent is to remove low-value administrative burden &mdash; rekeying, chasing status, assembling reports, reconciling spreadsheets &mdash; so that skilled staff can spend their time on judgment, relationships, and physical work that only people can do.</p>
          <p>We encourage clients to plan the human side of a deployment as deliberately as the technical side: which tasks change, what training is required, how roles evolve, and how the organization communicates that honestly. A deployment that surprises the workforce tends to fail regardless of technical quality.</p>

          <h2 id="procurement">11. Support for Public Procurement</h2>
          <p>Public bodies increasingly need to document AI governance before they can adopt a tool. GCS supports that process by providing, on request: written system descriptions in plain language, documented data flows and retention terms, the agent charter and approval matrix, evaluation results and known limitations, and the audit record structure available for open records and oversight purposes. We will also participate directly in a governing body's public meeting to answer questions about the system.</p>

          <h2 id="governance">12. Governance and Review</h2>
          <p>This statement is owned by the founder of GCS and reviewed at least annually, and whenever we introduce a materially new capability. Changes to agent authority require documented approval. This is a living commitment; as the field and the regulatory landscape mature, we expect to strengthen it.</p>

          <h2 id="contact">13. Raising a Concern</h2>
          <p>If you believe a GCS system has produced a harmful, unfair, inaccurate, or inappropriate outcome, tell us. Concerns reach the founder directly.</p>
          <ul>
            <li><strong>Email:</strong> <a href="mailto:info@buildbetterwithgcs.com">info@buildbetterwithgcs.com</a></li>
            <li><strong>Subject line:</strong> Responsible AI Concern</li>
          </ul>
          <p>We acknowledge within two business days and respond substantively within ten. Related reading: <a href="../genesis/">Genesis AI Workforce</a> and <a href="../privacy/">Privacy Policy</a>.</p>
"""

rai_hero = S.page_hero(
    P,
    "Governance",
    "Responsible AI",
    "How GCS governs AI-assisted operations: bounded authority, mandatory human approval on consequential actions, complete audit records, and a published list of what we will not automate.",
    [(None, "Responsible AI")],
)

S.write(
    "responsible-ai/",
    "Responsible AI | GCS — General Contractor Solutions LLC",
    "GCS AI governance principles: human accountability, bounded agent authority, approval gates, auditability, transparency, and the decisions we will not automate.",
    legal_body(rai_hero, rai_toc, rai_prose),
)

print("legal pages written")

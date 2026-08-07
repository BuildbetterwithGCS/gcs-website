"""Shared HTML shell for the GCS static site.

Generates head, header/navigation, and footer markup for every page so that
navigation and footer stay identical across the site.
"""

import os
import re

REPO = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

SITE_URL = "https://buildbetterwithgcs.com"

# key -> (href fragment relative to site root, nav label)
NAV = [
    ("about", "about/", "About"),
    ("solutions", "solutions/", "Solutions"),
    ("industries", "industries/", "Industries"),
    ("nexus", "nexus/", "Nexus Platform"),
    ("genesis", "genesis/", "Genesis"),
    ("command", "founder-command-center/", "Command Center"),
    ("map", "map-intelligence/", "Map Intelligence"),
    ("reference", "reference/", "Reference"),
    ("founder", "founder/", "Founder"),
    ("contact", "contact/", "Contact"),
]

CTA = ("demo", "request-demo/", "Request Demo")

FOOTER_GROUPS = [
    ("Company", [
        ("about/", "About GCS"),
        ("founder/", "Sam Hurwitz, Founder"),
        ("reference/", "Reference Implementations"),
        ("contact/", "Contact"),
    ]),
    ("Capabilities", [
        ("solutions/", "Solutions Overview"),
        ("industries/", "Industries Served"),
        ("solutions/#operations-intelligence", "Operations Intelligence"),
        ("solutions/#capital-planning", "Capital Planning"),
        ("solutions/#compliance", "Compliance"),
    ]),
    ("Platform", [
        ("nexus/", "Nexus Platform"),
        ("map-intelligence/", "Nexus Map Intelligence"),
        ("founder-command-center/", "Founder Command Center"),
        ("genesis/", "Genesis AI Workforce"),
    ]),
    ("Engage", [
        ("request-demo/", "Request a Demo"),
        ("contact/", "Contact GCS"),
        ("responsible-ai/", "Responsible AI"),
        ("accessibility/", "Accessibility"),
    ]),
]

LEGAL_LINKS = [
    ("privacy/", "Privacy Policy"),
    ("terms/", "Terms of Service"),
    ("accessibility/", "Accessibility Statement"),
    ("responsible-ai/", "Responsible AI"),
]


def head(prefix, title, description, canonical, extra_head="", body_class=""):
    """Return the document head + opening body tag."""
    og_image = SITE_URL + "/assets/og-image.png"
    canonical_url = SITE_URL + "/" + canonical if canonical else SITE_URL + "/"
    bc = ' class="%s"' % body_class if body_class else ""
    return f"""<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />

  <title>{title}</title>
  <meta name="title" content="{title}" />
  <meta name="description" content="{description}" />
  <meta name="author" content="General Contractor Solutions LLC" />
  <meta name="robots" content="index, follow" />
  <link rel="canonical" href="{canonical_url}" />

  <meta property="og:type" content="website" />
  <meta property="og:site_name" content="GCS — General Contractor Solutions LLC" />
  <meta property="og:url" content="{canonical_url}" />
  <meta property="og:title" content="{title}" />
  <meta property="og:description" content="{description}" />
  <meta property="og:image" content="{og_image}" />

  <meta name="twitter:card" content="summary_large_image" />
  <meta name="twitter:title" content="{title}" />
  <meta name="twitter:description" content="{description}" />

  <link rel="preconnect" href="https://fonts.googleapis.com" />
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
  <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&family=Sora:wght@400;600;700;800&display=swap" rel="stylesheet" />

  <link rel="stylesheet" href="{prefix}css/styles.css" />
  <link rel="icon" href="{prefix}assets/favicon.svg" type="image/svg+xml" />
  <link rel="apple-touch-icon" href="{prefix}assets/favicon.svg" />
  <meta name="theme-color" content="#0a4d8c" />
  <noscript><style>.reveal{{opacity:1 !important;transform:none !important;}}</style></noscript>
{extra_head}</head>
<body{bc}>

  <a class="skip-link" href="#main-content">Skip to main content</a>
"""


def header(prefix, active=""):
    """Site header with the shared primary navigation."""
    items = []
    for key, href, label in NAV:
        cur = ' aria-current="page"' if key == active else ""
        items.append(
            '        <li><a href="%s%s" class="nav__link"%s>%s</a></li>'
            % (prefix, href, cur, label)
        )
    cur = ' aria-current="page"' if CTA[0] == active else ""
    items.append(
        '        <li><a href="%s%s" class="nav__link nav__link--cta"%s>%s</a></li>'
        % (prefix, CTA[1], cur, CTA[2])
    )
    links = "\n".join(items)
    home_href = prefix if prefix else "./"
    return f"""  <!-- ===================== SITE HEADER ===================== -->
  <header class="site-header" role="banner">
    <nav class="nav container" aria-label="Primary navigation">
      <a href="{home_href}" class="nav__logo" aria-label="GCS — General Contractor Solutions LLC home">
        <span class="logo-mark" aria-hidden="true">GCS</span>
        <span class="logo-text">General Contractor Solutions</span>
      </a>

      <button class="nav__toggle" type="button" aria-controls="nav-menu" aria-expanded="false" aria-label="Open navigation menu">
        <span class="hamburger" aria-hidden="true"></span>
        <span class="hamburger" aria-hidden="true"></span>
        <span class="hamburger" aria-hidden="true"></span>
      </button>

      <ul class="nav__links" id="nav-menu" role="list">
{links}
      </ul>
    </nav>
  </header>
"""


def footer(prefix):
    groups = []
    for heading, links in FOOTER_GROUPS:
        lis = "\n".join(
            '              <li><a href="%s%s">%s</a></li>' % (prefix, h, l)
            for h, l in links
        )
        groups.append(
            """          <div class="footer__nav-group">
            <h4 class="footer__nav-heading">%s</h4>
            <ul role="list">
%s
            </ul>
          </div>"""
            % (heading, lis)
        )
    groups_html = "\n".join(groups)
    legal = "\n".join(
        '          <a href="%s%s">%s</a>' % (prefix, h, l) for h, l in LEGAL_LINKS
    )
    home_href = prefix if prefix else "./"
    return f"""  <!-- ===================== SITE FOOTER ===================== -->
  <footer class="site-footer" role="contentinfo">
    <div class="container">
      <div class="footer__top">
        <div class="footer__brand">
          <a href="{home_href}" class="nav__logo" aria-label="GCS home">
            <span class="logo-mark logo-mark--sm" aria-hidden="true">GCS</span>
          </a>
          <div>
            <div class="footer__company-name">General Contractor Solutions LLC</div>
            <div class="footer__tagline">Building Better Organizations</div>
          </div>
        </div>
        <nav class="footer__nav footer__nav--wide" aria-label="Footer navigation">
{groups_html}
        </nav>
      </div>
      <div class="footer__bottom">
        <p class="footer__copy">&copy; <span id="footer-year">2026</span> General Contractor Solutions LLC. All rights reserved.</p>
        <nav class="footer__legal" aria-label="Legal and policy links">
{legal}
        </nav>
      </div>
      <p class="footer__note">
        GCS turns operations into intelligence, action, and accountability. Dashboards, maps, queues, and metrics shown
        anywhere on this site are illustrative demonstrations built to communicate product concepts. They do not represent
        any client's live data, and no figure on this site should be read as a performance guarantee.
      </p>
    </div>
  </footer>
"""


def scripts(prefix):
    return f"""  <script src="{prefix}js/main.js"></script>
</body>
</html>
"""


def demo_banner(text=None, light=False):
    text = text or (
        "Every figure, name, chart, and record on this page is fabricated for product demonstration. "
        "Nothing here reflects a real organization's data."
    )
    cls = "demo-banner demo-banner--light" if light else "demo-banner"
    return f"""<div class="{cls}" role="note">
          <span class="demo-banner__tag">Illustrative Demonstration Data</span>
          <span>{text}</span>
        </div>"""


def breadcrumbs(prefix, trail):
    """trail: list of (href_or_None, label)."""
    parts = ['<a href="%s">Home</a>' % (prefix if prefix else "./")]
    for href, label in trail:
        parts.append('<span class="breadcrumbs__sep" aria-hidden="true">/</span>')
        if href:
            parts.append('<a href="%s%s">%s</a>' % (prefix, href, label))
        else:
            parts.append('<span aria-current="page">%s</span>' % label)
    return (
        '<nav class="breadcrumbs" aria-label="Breadcrumb">\n          '
        + "\n          ".join(parts)
        + "\n        </nav>"
    )


def page_hero(prefix, eyebrow, title, lead, trail, actions="", dash=False, extra=""):
    cls = "page-hero page-hero--dash" if dash else "page-hero"
    acts = (
        '\n        <div class="page-hero__actions">%s</div>' % actions if actions else ""
    )
    return f"""    <section class="{cls}">
      <div class="container">
        {breadcrumbs(prefix, trail)}
        <div class="page-hero__inner">
          <span class="page-hero__eyebrow">{eyebrow}</span>
          <h1 class="page-hero__title">{title}</h1>
          <p class="page-hero__lead">{lead}</p>{acts}
        </div>{extra}
      </div>
    </section>
"""


def cta_band(prefix, title, text, primary=("request-demo/", "Request a Demo"),
             secondary=("contact/", "Contact GCS")):
    return f"""    <section class="cta-band">
      <div class="container cta-band__inner">
        <div>
          <h2 class="cta-band__title">{title}</h2>
          <p class="cta-band__text">{text}</p>
        </div>
        <div class="cta-band__actions">
          <a href="{prefix}{primary[0]}" class="btn btn--gold">{primary[1]}</a>
          <a href="{prefix}{secondary[0]}" class="btn btn--outline">{secondary[1]}</a>
        </div>
      </div>
    </section>
"""


def write(path, title, description, body, active="", extra_head="", body_class=""):
    """Write a page. `path` is site-relative, e.g. 'about/' or '' for home."""
    prefix = "../" if path else ""
    out_dir = os.path.join(REPO, path.rstrip("/")) if path else REPO
    os.makedirs(out_dir, exist_ok=True)
    out_file = os.path.join(out_dir, "index.html")
    html = (
        head(prefix, title, description, path, extra_head, body_class)
        + header(prefix, active)
        + '\n  <!-- ===================== MAIN ===================== -->\n  <main id="main-content">\n\n'
        + body
        + "\n  </main>\n\n"
        + footer(prefix)
        + "\n"
        + scripts(prefix)
    )
    with open(out_file, "w", encoding="utf-8") as fh:
        fh.write(html)
    return out_file

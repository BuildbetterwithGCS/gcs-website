# -*- coding: utf-8 -*-
"""Nexus Map Intelligence page."""

import shell as S
from pages_content import icon, card

P = "../"

# (id, kind, top%, left%, label, status chip, detail fields)
PINS = [
    ("p1", "facility", 22, 18, "Public Works Facility", "good", [
        ("Asset ID", "FAC-0101"), ("Class", "Facility &mdash; operations"),
        ("Condition", "Good"), ("Year built", "2004"),
        ("Replacement value", "$4,800,000"), ("Open work orders", "3"),
        ("Last inspection", "Jan 2026"), ("Criticality", "High"),
    ]),
    ("p2", "asset", 34, 42, "North Pump Station", "warn", [
        ("Asset ID", "WTR-0442"), ("Class", "Water &mdash; pumping"),
        ("Condition", "Fair &mdash; declining"), ("Year installed", "1996"),
        ("Replacement value", "$1,150,000"), ("Open work orders", "7"),
        ("Last inspection", "Dec 2025"), ("Criticality", "Critical &mdash; no redundancy"),
    ]),
    ("p3", "asset", 58, 30, "Elevated Storage Tank", "good", [
        ("Asset ID", "WTR-0118"), ("Class", "Water &mdash; storage"),
        ("Condition", "Good"), ("Year built", "1988"),
        ("Replacement value", "$2,300,000"), ("Open work orders", "1"),
        ("Last inspection", "Sep 2025"), ("Criticality", "Critical"),
    ]),
    ("p4", "project", 46, 62, "Ridge Road Culvert Replacement", "risk", [
        ("Project ID", "CP-2411"), ("Class", "Capital &mdash; infrastructure"),
        ("Status", "At risk &mdash; bid over estimate"), ("Budget", "$1,240,000"),
        ("Committed", "62%"), ("Target completion", "Nov 2026"),
        ("Owner", "Engineering"), ("Note", "Requires contingency decision"),
    ]),
    ("p5", "project", 68, 55, "Main Street Resurfacing &mdash; Phase 2", "good", [
        ("Project ID", "CP-2402"), ("Class", "Capital &mdash; roadway"),
        ("Status", "On track"), ("Budget", "$2,850,000"),
        ("Committed", "78%"), ("Target completion", "Aug 2026"),
        ("Owner", "Public Works"), ("Note", "Paving window confirmed"),
    ]),
    ("p6", "asset", 26, 68, "Lift Station 4", "risk", [
        ("Asset ID", "SWR-0207"), ("Class", "Sewer &mdash; lift station"),
        ("Condition", "Poor"), ("Year installed", "1979"),
        ("Replacement value", "$680,000"), ("Open work orders", "11"),
        ("Last inspection", "Feb 2026"), ("Criticality", "Critical &mdash; three failures in 18 months"),
    ]),
    ("p7", "facility", 74, 22, "Municipal Complex", "good", [
        ("Asset ID", "FAC-0100"), ("Class", "Facility &mdash; administrative"),
        ("Condition", "Good"), ("Year built", "1998"),
        ("Replacement value", "$9,400,000"), ("Open work orders", "5"),
        ("Last inspection", "Nov 2025"), ("Criticality", "High"),
    ]),
    ("p8", "risk", 40, 78, "Flood-Prone Corridor", "risk", [
        ("Zone ID", "RSK-0031"), ("Class", "Risk zone &mdash; hydrologic"),
        ("Exposure", "14 assets, 2 critical"), ("Trigger", "Sustained rainfall &gt; 3 in / 24 hr"),
        ("Last activation", "Oct 2025"), ("Mitigation", "Basin retrofit in planning"),
        ("Owner", "Engineering"), ("Note", "Detour route conflicts with CP-2411"),
    ]),
    ("p9", "asset", 62, 76, "Salt Storage &amp; Fleet Yard", "warn", [
        ("Asset ID", "FAC-0114"), ("Class", "Facility &mdash; storage"),
        ("Condition", "Fair"), ("Year built", "1991"),
        ("Replacement value", "$1,900,000"), ("Open work orders", "4"),
        ("Last inspection", "Oct 2025"), ("Criticality", "Seasonal &mdash; high"),
    ]),
    ("p10", "project", 18, 52, "Fiber Backbone Extension", "warn", [
        ("Project ID", "CP-2415"), ("Class", "Capital &mdash; technology"),
        ("Status", "Monitoring &mdash; permit pending"), ("Budget", "$620,000"),
        ("Committed", "31%"), ("Target completion", "Mar 2027"),
        ("Owner", "Administration"), ("Note", "County right-of-way approval outstanding"),
    ]),
    ("p11", "facility", 52, 12, "Fire Station 2", "good", [
        ("Asset ID", "FAC-0122"), ("Class", "Facility &mdash; public safety"),
        ("Condition", "Good"), ("Year built", "2011"),
        ("Replacement value", "$3,600,000"), ("Open work orders", "2"),
        ("Last inspection", "Dec 2025"), ("Criticality", "Critical"),
    ]),
    ("p12", "risk", 78, 68, "Slope Stability Watch Area", "warn", [
        ("Zone ID", "RSK-0044"), ("Class", "Risk zone &mdash; geotechnical"),
        ("Exposure", "1 roadway segment, 1 culvert"), ("Trigger", "Freeze-thaw cycling with saturation"),
        ("Last activation", "Mar 2025"), ("Mitigation", "Monitoring; no capital item programmed"),
        ("Owner", "Public Works"), ("Note", "Candidate for next capital cycle"),
    ]),
]

LAYER_OF = {"asset": "assets", "project": "projects", "facility": "facilities", "risk": "risk"}


def pin_markup(pid, kind, top, left, label, chip):
    return f"""            <button type="button" class="map-pin" data-pin="{pid}" data-kind="{kind}" style="top:{top}%; left:{left}%" aria-label="{label} — show details">
              <span class="map-pin__marker map-pin__marker--{kind}" aria-hidden="true"></span>
              <span class="map-pin__label">{label}</span>
            </button>"""


def detail_panel(pid, label, chip, fields, hidden=True):
    rows = "\n".join(
        f"""              <div class="map-detail__field"><dt>{k}</dt><dd>{v}</dd></div>"""
        for k, v in fields
    )
    h = " hidden" if hidden else ""
    return f"""          <div class="map-detail__record" data-detail="{pid}"{h}>
            <div class="map-detail__head">
              <h3 class="map-detail__title">{label}</h3>
              <span class="chip chip--{chip}">{'Attention' if chip == 'warn' else 'Critical' if chip == 'risk' else 'Good'}</span>
            </div>
            <dl class="map-detail__grid">
{rows}
            </dl>
          </div>"""


layers = {"assets": [], "projects": [], "facilities": [], "risk": []}
details = []
for pid, kind, top, left, label, chip, fields in PINS:
    layers[LAYER_OF[kind]].append(pin_markup(pid, kind, top, left, label, chip))
    details.append(detail_panel(pid, label, chip, fields))

detail_records = "\n".join(details)

LAYER_TOGGLES = [
    ("assets", "Assets", "Pump stations, tanks, storage, yards", True),
    ("projects", "Projects", "Active capital work locations", True),
    ("facilities", "Facilities", "Buildings and occupied structures", True),
    ("risk", "Risk zones", "Flood, slope, and exposure areas", True),
    ("water", "Water mains", "Distribution network trunk lines", True),
    ("sewer", "Sewer mains", "Gravity and force main network", True),
    ("roads", "Road network", "Maintained roadway centerlines", True),
    ("fiber", "Fiber routes", "Communications conduit and fiber", False),
]

toggle_markup = "\n".join(
    f"""              <li>
                <label class="layer-toggle">
                  <input type="checkbox" data-layer="{key}"{' checked' if on else ''} />
                  <span class="layer-toggle__text">
                    <span class="layer-toggle__name">{name}</span>
                    <span class="layer-toggle__desc">{desc}</span>
                  </span>
                </label>
              </li>"""
    for key, name, desc, on in LAYER_TOGGLES
)


body = S.page_hero(
    P,
    "Nexus Map Intelligence",
    "Operations, Located.",
    "Condition, criticality, capital work, and risk exposure are inherently spatial. Map Intelligence puts the operating record on the ground &mdash; so that a failing asset, a scheduled project, and a flood corridor are visibly the same problem.",
    [(None, "Map Intelligence")],
    actions='<a href="%snexus/" class="btn btn--gold">Nexus Platform</a><a href="%srequest-demo/" class="btn btn--outline">Request a Demo</a>' % (P, P),
    dash=True,
) + """    <section class="dash">
      <div class="container">
        %s

        <div class="dash__bar">
          <div class="status-strip">
            <span class="status-strip__item"><span class="pulse-dot" aria-hidden="true"></span> Demonstration map &mdash; synthetic geography</span>
            <span class="status-strip__item">12 located records</span>
            <span class="status-strip__item">8 layers</span>
            <span class="status-strip__item">No external map service</span>
          </div>
        </div>

        <div class="mapui">
          <aside class="map-controls" aria-label="Map layers and filters">
            <section class="panel">
              <div class="panel__head"><h2 class="panel__title">Layers</h2></div>
              <div class="panel__body">
                <ul class="layer-list" role="list">
%s
                </ul>
              </div>
            </section>

            <section class="panel">
              <div class="panel__head"><h2 class="panel__title">Filters</h2></div>
              <div class="panel__body">
                <div class="map-filter-group">
                  <label for="filter-condition">Condition</label>
                  <select id="filter-condition" class="map-filter" data-filter="condition">
                    <option value="all">All conditions</option>
                    <option value="good">Good only</option>
                    <option value="warn">Fair / attention</option>
                    <option value="risk">Poor / critical</option>
                  </select>
                </div>
                <div class="map-filter-group">
                  <label for="filter-category">Category</label>
                  <select id="filter-category" class="map-filter" data-filter="category">
                    <option value="all">All categories</option>
                    <option value="asset">Assets</option>
                    <option value="project">Projects</option>
                    <option value="facility">Facilities</option>
                    <option value="risk">Risk zones</option>
                  </select>
                </div>
                <button type="button" class="btn btn--ghost btn--sm" data-map-reset style="width:100%%;margin-top:0.5rem">Reset view</button>
                <p class="form-hint" style="margin-top:0.75rem">Filters dim non-matching records rather than removing them, so context is never lost.</p>
              </div>
            </section>

            <section class="panel">
              <div class="panel__head"><h2 class="panel__title">Legend</h2></div>
              <div class="panel__body">
                <ul class="map-legend" role="list">
                  <li><span class="map-legend__key map-legend__key--asset" aria-hidden="true"></span> Asset</li>
                  <li><span class="map-legend__key map-legend__key--project" aria-hidden="true"></span> Project</li>
                  <li><span class="map-legend__key map-legend__key--facility" aria-hidden="true"></span> Facility</li>
                  <li><span class="map-legend__key map-legend__key--risk" aria-hidden="true"></span> Risk zone</li>
                  <li><span class="map-legend__key map-legend__key--water" aria-hidden="true"></span> Water main</li>
                  <li><span class="map-legend__key map-legend__key--sewer" aria-hidden="true"></span> Sewer main</li>
                  <li><span class="map-legend__key map-legend__key--road" aria-hidden="true"></span> Roadway</li>
                  <li><span class="map-legend__key map-legend__key--fiber" aria-hidden="true"></span> Fiber route</li>
                </ul>
              </div>
            </section>
          </aside>

          <div class="map-canvas">
            <div class="map-stage" role="group" aria-label="Interactive demonstration map with illustrative asset, project, facility, and risk records">
              <div class="map-stage__grid" aria-hidden="true"></div>

              <svg class="map-svg" viewBox="0 0 100 100" preserveAspectRatio="none" aria-hidden="true" focusable="false">
                <g class="map-layer" data-layer-group="zones">
                  <path class="map-zone map-zone--flood" d="M62,28 L92,22 L96,52 L72,58 L58,44 Z" />
                  <path class="map-zone map-zone--cap" d="M8,62 L36,58 L42,84 L12,88 Z" />
                  <path class="map-zone map-zone--asset" d="M28,10 L58,8 L60,26 L30,30 Z" />
                </g>
                <g class="map-layer" data-layer-group="roads">
                  <path class="map-route map-route--road" d="M2,70 C22,66 40,74 58,64 C74,55 86,60 98,54" />
                  <path class="map-route map-route--road" d="M20,4 C24,26 18,48 26,70 C30,82 28,92 30,98" />
                  <path class="map-route map-route--road" d="M4,34 C26,30 48,40 70,32 C82,28 90,30 98,26" />
                </g>
                <g class="map-layer" data-layer-group="water">
                  <path class="map-route map-route--water" d="M18,20 C30,28 34,40 44,44 C56,50 62,46 74,40" />
                  <path class="map-route map-route--water" d="M44,44 C48,54 52,58 58,60 C66,63 70,68 76,74" />
                </g>
                <g class="map-layer" data-layer-group="sewer">
                  <path class="map-route map-route--sewer" d="M26,68 C38,64 50,66 62,58 C72,52 78,50 88,48" />
                  <path class="map-route map-route--sewer" d="M26,68 C24,56 26,44 26,34" />
                </g>
                <g class="map-layer" data-layer-group="fiber" hidden>
                  <path class="map-route map-route--fiber" d="M6,18 C28,14 46,24 66,18 C80,14 90,16 98,12" />
                  <path class="map-route map-route--fiber" d="M52,14 C54,34 50,54 54,74" />
                </g>
              </svg>

              <div class="map-layer" data-layer-group="assets">
%s
              </div>
              <div class="map-layer" data-layer-group="projects">
%s
              </div>
              <div class="map-layer" data-layer-group="facilities">
%s
              </div>
              <div class="map-layer" data-layer-group="risk">
%s
              </div>
            </div>

            <div class="map-detail" data-map-detail>
              <div class="map-detail__empty" data-detail-empty>
                <span class="map-detail__empty-icon" aria-hidden="true">%s</span>
                <p><strong>Select a record on the map.</strong> Choose any pin to see its condition, value, work history, and criticality. Use the layer switches to control what is drawn and the filters to focus on a condition band or category.</p>
              </div>
%s
            </div>
            <p class="map-canvas__note">Illustrative demonstration data. Geography is synthetic and does not depict any actual municipality, parcel, or utility network.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="split">
          <div>
            <div class="section-header section-header--left">
              <span class="section-label">Why Spatial</span>
              <h2 class="section-title">A Table Cannot Show You Adjacency</h2>
            </div>
            <div class="prose prose--wide">
              <p>A condition register tells you that Lift Station 4 is in poor condition with eleven open work orders. A capital plan tells you that Ridge Road culvert replacement is bid over estimate. A risk register tells you a flood corridor activated last October.</p>
              <p>None of those documents tells you that all three are within a half mile of each other, that the culvert project's detour route runs through the flood corridor, and that the lift station loses service when that corridor floods. That relationship only becomes visible when the operating record is placed on the ground.</p>
              <p>This is the practical argument for spatial intelligence in operations, and it has nothing to do with maps being attractive. Adjacency drives sequencing. Two projects on the same corridor should be coordinated; two failures behind the same single point of failure should be treated as one problem; a risk zone that overlaps three critical assets is not the same risk as one that overlaps none.</p>
              <p>Map Intelligence is a view of the same operating record that drives every other Nexus module &mdash; not a separate system with its own data. An asset's condition changes once, and the map, the dashboard, and the capital model all reflect it.</p>
            </div>
          </div>
          <aside>
            <div class="card card--flat">
              <span class="card__eyebrow">Built Without</span>
              <h3 class="card__title">No external map service</h3>
              <p class="card__desc">This demonstration renders entirely in the browser with SVG and CSS. There is no third-party tile provider, no map API key, and no request leaving your browser to any mapping service while you use this page.</p>
              <p class="card__desc">That choice is deliberate for a demonstration. In a client deployment, spatial data is rendered against the client's authoritative geographic base &mdash; typically their existing GIS &mdash; under their data governance terms, rather than pushed to a public service.</p>
              <ul class="card__list" role="list">
                <li>No external tiles, keys, or trackers on this page</li>
                <li>Layer state and selection are local to your browser</li>
                <li>Synthetic geography &mdash; no real parcels or utilities</li>
              </ul>
            </div>
          </aside>
        </div>
      </div>
    </section>

    <section class="section section--alt">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Capabilities</span>
          <h2 class="section-title">What Map Intelligence Provides</h2>
          <p class="section-subtitle">Six spatial capabilities that change how operational and capital decisions get made.</p>
        </div>
        <div class="grid grid--3">
%s
        </div>
      </div>
    </section>

    <section class="section section--dark">
      <div class="container">
        <div class="section-header">
          <span class="section-label section-label--light">Honest Scope</span>
          <h2 class="section-title">What This Demonstration Is and Is Not</h2>
        </div>
        <div class="grid grid--3">
          <div class="card card--dark">
            <span class="card__eyebrow">Represents accurately</span>
            <h3 class="card__title">The interaction model</h3>
            <ul class="card__list" role="list">
              <li>Layer control and visibility management</li>
              <li>Condition and category filtering with context preserved</li>
              <li>Record selection returning full operational detail</li>
              <li>Network routes and zones rendered as distinct layers</li>
              <li>Status expressed consistently with the rest of Nexus</li>
            </ul>
          </div>
          <div class="card card--dark">
            <span class="card__eyebrow">Simplified here</span>
            <h3 class="card__title">The geography</h3>
            <ul class="card__list" role="list">
              <li>Synthetic coordinates, not a projected coordinate system</li>
              <li>A dozen records rather than thousands</li>
              <li>Illustrative routes rather than surveyed network geometry</li>
              <li>No basemap, imagery, parcel fabric, or elevation model</li>
              <li>No measurement, routing, or spatial query tools</li>
            </ul>
          </div>
          <div class="card card--dark">
            <span class="card__eyebrow">In a deployment</span>
            <h3 class="card__title">The real implementation</h3>
            <ul class="card__list" role="list">
              <li>Rendered against the client's authoritative GIS base</li>
              <li>Bidirectional link between spatial features and asset records</li>
              <li>Condition, work order, and capital status driven by live data</li>
              <li>Access controls consistent with the client's data governance</li>
              <li>Export to the formats an engineering department already uses</li>
            </ul>
          </div>
        </div>
        <div class="callout callout--dark" style="margin-top:2rem">
          <span class="callout__icon" aria-hidden="true">%s</span>
          <div>
            <p><strong>On GIS.</strong> Most organizations that need this already have GIS, and often have had it for years. The problem is rarely the absence of spatial data &mdash; it is that the spatial layer and the operating record are separate systems that disagree. Map Intelligence is designed to join them, not to replace a working GIS investment.</p>
          </div>
        </div>
      </div>
    </section>

%s""" % (
    S.demo_banner(
        "All map geography, asset locations, project sites, network routes, risk zones, and record details on this page "
        "are illustrative demonstration data. The geography is synthetic and does not depict any actual municipality, "
        "parcel, or utility network."
    ),
    toggle_markup,
    "\n".join(layers["assets"]),
    "\n".join(layers["projects"]),
    "\n".join(layers["facilities"]),
    "\n".join(layers["risk"]),
    icon("compass", 28),
    detail_records,
    "\n".join([
        card("layers", "Layered operating picture", "Assets, projects, facilities, risk zones, and network routes drawn as independent layers that can be combined to answer a specific question rather than crowded onto one static map."),
        card("alert", "Exposure analysis", "See which assets fall inside a flood corridor, slope watch area, or service interruption zone &mdash; and how many of those are critical with no redundancy."),
        card("route", "Corridor coordination", "Identify capital projects, utility work, and maintenance activity competing for the same corridor before they are scheduled into conflict."),
        card("gauge", "Condition at a glance", "Condition and criticality expressed spatially, so degradation clusters become visible &mdash; which is usually where a systemic cause is hiding."),
        card("calendar", "Capital sequencing", "Evaluate programmed work geographically to find adjacency savings, avoid tearing up new pavement, and sequence around access constraints."),
        card("shield", "Response readiness", "During an event, see which assets are in the affected area, what condition they were in going in, and which access routes are compromised."),
    ]),
    icon("alert", 20),
    S.cta_band(
        P,
        "See your own operation on the map",
        "In a working deployment, this view is populated from your asset register and your existing GIS — not from sample data.",
        ("request-demo/", "Request a Demo"),
        ("nexus/", "Explore Nexus"),
    ),
)

S.write(
    "map-intelligence/",
    "Nexus Map Intelligence | Spatial Operations Demonstration — GCS",
    "Interactive demonstration of Nexus Map Intelligence: layered assets, projects, facilities, risk zones, and infrastructure routes rendered without any external map service. Illustrative data.",
    body,
    active="map",
    body_class="theme-dash",
)

print("map intelligence written")

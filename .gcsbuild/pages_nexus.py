# -*- coding: utf-8 -*-
"""Nexus Enterprise Intelligence Platform — interactive demonstration page."""

import shell as S
from pages_content import icon

P = "../"

DEMO = "ILLUSTRATIVE DEMONSTRATION DATA"


def kpi(label, value, unit="", delta=None, direction="flat", variant="", spark=None):
    v = "%s%s" % (value, '<span class="kpi__unit">%s</span>' % unit if unit else "")
    d = ""
    if delta:
        arrows = {"up": "&#9650;", "down": "&#9660;", "flat": "&#9644;"}
        d = '<span class="kpi__delta kpi__delta--%s">%s %s</span>' % (
            direction, arrows[direction], delta)
    sp = ""
    if spark:
        bars = "".join(
            '<span style="height:%d%%;animation-delay:%dms"></span>' % (h, i * 45)
            for i, h in enumerate(spark)
        )
        sp = '<div class="kpi__spark" aria-hidden="true">%s</div>' % bars
    cls = "kpi kpi--%s" % variant if variant else "kpi"
    return f"""            <div class="{cls}">
              <span class="kpi__label">{label}</span>
              <span class="kpi__value">{v}</span>
              {d}{sp}
            </div>"""


def bar(label, pct, value, fill="", delay=0):
    f = "chart__fill chart__fill--%s" % fill if fill else "chart__fill"
    return f"""              <div class="chart__row">
                <span class="chart__label">{label}</span>
                <div class="chart__track"><div class="{f}" style="width:{pct}%; animation-delay:{delay}ms"></div></div>
                <span class="chart__value">{value}</span>
              </div>"""


def feed_item(kind, title, meta):
    return f"""            <li class="feed__item">
              <span class="feed__dot feed__dot--{kind}" aria-hidden="true">{icon('alert', 14) if kind in ('warn', 'risk') else icon('check-doc', 14)}</span>
              <div>
                <p class="feed__title">{title}</p>
                <p class="feed__meta">{meta}</p>
              </div>
            </li>"""


# ------------------------------------------------------------
# TAB 1 — EXECUTIVE DASHBOARD
# ------------------------------------------------------------
tab_exec = """
          <div class="kpi-grid">
%s
          </div>

          <div class="grid grid--2" style="gap:1.25rem">
            <section class="panel">
              <div class="panel__head">
                <h3 class="panel__title">Capital Spend by Program</h3>
                <span class="panel__hint">Fiscal year to date</span>
              </div>
              <div class="panel__body">
                <div class="chart">
%s
                </div>
                <p class="panel__hint" style="margin-top:1rem">Percentage of approved program budget committed to date. Sample values.</p>
              </div>
            </section>

            <section class="panel">
              <div class="panel__head">
                <h3 class="panel__title">Planned vs. Actual Work Completion</h3>
                <span class="panel__hint">Last six periods</span>
              </div>
              <div class="panel__body">
                <div class="colchart" role="img" aria-label="Column chart comparing planned and completed work orders across six periods of illustrative demonstration data: period one 420 planned and 388 completed, period two 445 planned and 401 completed, period three 460 planned and 447 completed, period four 438 planned and 452 completed, period five 470 planned and 461 completed, period six 455 planned and 470 completed.">
%s
                </div>
                <div class="legend">
                  <span class="legend__item"><span class="legend__swatch" style="background:var(--color-accent)"></span> Planned</span>
                  <span class="legend__item"><span class="legend__swatch" style="background:var(--color-gold)"></span> Completed</span>
                </div>
              </div>
            </section>
          </div>

          <div class="grid grid--2" style="gap:1.25rem;margin-top:1.25rem">
            <section class="panel">
              <div class="panel__head">
                <h3 class="panel__title">Portfolio Condition Distribution</h3>
                <span class="panel__hint">1,847 tracked assets</span>
              </div>
              <div class="panel__body">
                <div class="gauge">
                  <svg class="gauge__svg" width="132" height="132" viewBox="0 0 120 120" role="img" aria-label="Radial gauge showing 71 percent of illustrative demonstration assets rated good or fair condition.">
                    <circle class="gauge__ring-bg" cx="60" cy="60" r="50" fill="none" stroke-width="12" />
                    <circle class="gauge__ring" cx="60" cy="60" r="50" fill="none" stroke="#10b981" stroke-width="12" stroke-dasharray="314" stroke-dashoffset="91" />
                    <text class="gauge__num" x="60" y="58" text-anchor="middle">71%%</text>
                    <text class="gauge__cap" x="60" y="74" text-anchor="middle">GOOD / FAIR</text>
                  </svg>
                  <dl class="gauge__legend">
                    <div class="gauge__legend-item"><dt>Good condition</dt><dd><b>812</b></dd></div>
                    <div class="gauge__legend-item"><dt>Fair condition</dt><dd><b>499</b></dd></div>
                    <div class="gauge__legend-item"><dt>Poor condition</dt><dd><b>371</b></dd></div>
                    <div class="gauge__legend-item"><dt>Critical / end of life</dt><dd><b>165</b></dd></div>
                  </dl>
                </div>
              </div>
            </section>

            <section class="panel">
              <div class="panel__head">
                <h3 class="panel__title">Department Performance Index</h3>
                <span class="panel__hint">Composite score, current period</span>
              </div>
              <div class="panel__body">
                <div class="chart">
%s
                </div>
                <p class="panel__hint" style="margin-top:1rem">Composite of schedule adherence, backlog trend, and compliance currency. Sample values.</p>
              </div>
            </section>
          </div>

          <section class="panel" style="margin-top:1.25rem">
            <div class="panel__head">
              <h3 class="panel__title">Executive Summary</h3>
              <span class="demo-tag">Sample narrative</span>
            </div>
            <div class="panel__body">
              <p style="color:var(--dash-muted);line-height:1.8;font-size:0.9375rem">
                Portfolio condition held steady this period, with 71%% of tracked assets rated good or fair. Work order completion
                exceeded plan for the second consecutive period, closing the reactive backlog by 46 orders &mdash; the first
                sustained reduction in three quarters. Capital commitment is at 63%% of the approved program with four months
                remaining, which is on pace but leaves limited contingency for the water main condition findings flagged below.
              </p>
              <p style="color:var(--dash-muted);line-height:1.8;font-size:0.9375rem;margin-top:1rem">
                <strong style="color:#fff">Requires attention.</strong> Three items are escalated for executive decision this period:
                the Ridge Road culvert replacement is trending 11%% over estimate and needs a scope or funding decision before
                mobilization; the annual backflow certification program has 38 devices inside the 30-day window with no scheduled
                appointment; and the Public Works facility generator has now failed two consecutive load tests, which places
                continuity of the emergency operations center at risk.
              </p>
              <p style="color:var(--dash-muted);line-height:1.8;font-size:0.9375rem;margin-top:1rem">
                <strong style="color:#fff">Recommended actions.</strong> Approve the culvert contingency draw to hold the fall
                construction window; direct the compliance coordinator to complete backflow scheduling within ten business days;
                and authorize emergency generator service ahead of the storm season readiness review.
              </p>
              <div class="status-strip" style="margin-top:1.5rem">
                <div class="status-strip__cell"><span class="status-strip__label">Period</span><span class="status-strip__value">Q3 &mdash; Sample</span></div>
                <div class="status-strip__cell"><span class="status-strip__label">Prepared</span><span class="status-strip__value">Automated</span></div>
                <div class="status-strip__cell"><span class="status-strip__label">Reviewed by</span><span class="status-strip__value">Operations Director</span></div>
                <div class="status-strip__cell"><span class="status-strip__label">Items escalated</span><span class="status-strip__value">3</span></div>
                <div class="status-strip__cell"><span class="status-strip__label">Data currency</span><span class="status-strip__value">Illustrative</span></div>
              </div>
            </div>
          </section>
""" % (
    "\n".join([
        kpi("Portfolio Health", "82", "/100", "3 pts vs. last period", "up", "good", [55, 58, 54, 62, 68, 71, 76, 82]),
        kpi("Open Work Orders", "1,284", "", "46 fewer this period", "down", "", [92, 90, 88, 84, 80, 76, 72, 70]),
        kpi("Capital Committed", "63", "%", "On pace to plan", "flat", "gold", [12, 22, 30, 38, 45, 52, 58, 63]),
        kpi("Compliance Current", "94", "%", "38 devices in window", "down", "warn", [98, 97, 97, 96, 96, 95, 95, 94]),
        kpi("Open Risks", "17", "", "2 escalated to executive", "up", "risk", [10, 11, 12, 12, 14, 15, 16, 17]),
        kpi("PM Completion", "88", "%", "6 pts vs. last period", "up", "good", [62, 66, 68, 71, 76, 80, 84, 88]),
    ]),
    "\n".join([
        bar("Road &amp; Bridge", 78, "$2.34M", "", 0),
        bar("Water System", 64, "$1.82M", "", 90),
        bar("Facilities Renewal", 51, "$1.11M", "gold", 180),
        bar("Sewer &amp; Stormwater", 44, "$0.96M", "", 270),
        bar("Fleet Replacement", 82, "$0.74M", "warn", 360),
        bar("Parks &amp; Grounds", 29, "$0.31M", "", 450),
    ]),
    "\n".join(
        """                  <div class="colchart__col">
                    <div class="colchart__stack">
                      <div class="colchart__seg colchart__seg--actual" style="height:%d%%;animation-delay:%dms"></div>
                    </div>
                    <span class="colchart__cap">P%d</span>
                  </div>
                  <div class="colchart__col">
                    <div class="colchart__stack">
                      <div class="colchart__seg colchart__seg--planned" style="height:%d%%;animation-delay:%dms"></div>
                    </div>
                    <span class="colchart__cap" aria-hidden="true">&nbsp;</span>
                  </div>"""
        % (a, i * 70, i + 1, p, i * 70 + 35)
        for i, (p, a) in enumerate([(89, 82), (95, 85), (98, 95), (93, 96), (100, 98), (97, 100)])
    ),
    "\n".join([
        bar("Public Works", 91, "91", "good", 0),
        bar("Water Utility", 84, "84", "good", 80),
        bar("Facilities", 76, "76", "", 160),
        bar("Fleet Services", 68, "68", "warn", 240),
        bar("Parks &amp; Recreation", 72, "72", "", 320),
        bar("Emergency Services", 88, "88", "good", 400),
    ]),
)


# ------------------------------------------------------------
# TAB 2 — PROJECTS
# ------------------------------------------------------------
PROJECTS = [
    ("CP-2411", "Ridge Road Culvert Replacement", "Infrastructure", "$1,240,000", 62, "At Risk", "risk", "Nov 2026", "11% over estimate"),
    ("CP-2408", "Water Main Replacement &mdash; Sector 4", "Water Utility", "$2,850,000", 41, "On Track", "good", "Mar 2027", "Within tolerance"),
    ("CP-2402", "Municipal Complex Roof Renewal", "Facilities", "$685,000", 88, "On Track", "good", "Sep 2026", "Ahead of schedule"),
    ("CP-2415", "Lift Station 3 Rehabilitation", "Sewer", "$1,120,000", 24, "Monitoring", "warn", "Jun 2027", "Permit pending"),
    ("CP-2409", "Fleet Replacement &mdash; Heavy Equipment", "Fleet", "$940,000", 55, "On Track", "good", "Jan 2027", "Two units delivered"),
    ("CP-2418", "Stormwater Basin Retrofit", "Stormwater", "$480,000", 12, "Planning", "info", "Aug 2027", "Design 30% complete"),
    ("CP-2406", "Salt Storage Facility", "Public Works", "$760,000", 94, "Closing", "good", "Aug 2026", "Punch list open"),
    ("CP-2421", "Park Pavilion ADA Upgrades", "Parks", "$215,000", 8, "Planning", "info", "Oct 2027", "Scope in review"),
]

project_rows = "\n".join(
    f"""                <tr>
                  <td><b>{pid}</b></td>
                  <td><strong>{name}</strong><br /><span style="font-size:0.6875rem;color:var(--dash-dim)">{prog}</span></td>
                  <td class="num">{budget}</td>
                  <td>
                    <div class="mini-bar mini-bar--{'risk' if st == 'At Risk' else 'warn' if st == 'Monitoring' else 'good'}"><span style="width:{pct}%"></span></div>
                    <span style="font-size:0.6875rem;color:var(--dash-dim)">{pct}% complete</span>
                  </td>
                  <td><span class="chip chip--{cc}">{st}</span></td>
                  <td>{due}</td>
                  <td>{note}</td>
                </tr>"""
    for pid, name, prog, budget, pct, st, cc, due, note in PROJECTS
)

tab_projects = """
          <div class="kpi-grid">
%s
          </div>

          <section class="panel">
            <div class="panel__head">
              <h3 class="panel__title">Active Capital Projects</h3>
              <span class="demo-tag">Sample records</span>
            </div>
            <div class="panel__body panel__body--flush">
              <div class="dtable-wrap" tabindex="0" role="region" aria-label="Scrollable data table">
                <table class="dtable">
                  <caption>Illustrative demonstration data &mdash; active capital project portfolio</caption>
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Project</th>
                      <th scope="col" class="num">Budget</th>
                      <th scope="col">Progress</th>
                      <th scope="col">Status</th>
                      <th scope="col">Target</th>
                      <th scope="col">Note</th>
                    </tr>
                  </thead>
                  <tbody>
%s
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <div class="grid grid--2" style="gap:1.25rem;margin-top:1.25rem">
            <section class="panel">
              <div class="panel__head"><h3 class="panel__title">Schedule Health by Program</h3></div>
              <div class="panel__body">
                <div class="chart">
%s
                </div>
                <p class="panel__hint" style="margin-top:1rem">Share of program milestones met on or ahead of baseline date.</p>
              </div>
            </section>
            <section class="panel">
              <div class="panel__head"><h3 class="panel__title">Project Phase Distribution</h3></div>
              <div class="panel__body">
                <div class="chart">
%s
                </div>
                <p class="panel__hint" style="margin-top:1rem">Count of projects in each delivery phase across the sample portfolio.</p>
              </div>
            </section>
          </div>
""" % (
    "\n".join([
        kpi("Active Projects", "8", "", "2 entering closeout", "flat", "", None),
        kpi("Committed Capital", "$8.29M", "", "Across active portfolio", "flat", "gold", None),
        kpi("On Schedule", "6", "/8", "1 at risk, 1 monitoring", "flat", "good", None),
        kpi("Avg. Completion", "48", "%", "Weighted by budget", "up", "", None),
    ]),
    project_rows,
    "\n".join([
        bar("Facilities", 94, "94%", "good", 0),
        bar("Water Utility", 87, "87%", "good", 80),
        bar("Fleet", 81, "81%", "good", 160),
        bar("Sewer", 66, "66%", "warn", 240),
        bar("Infrastructure", 58, "58%", "risk", 320),
        bar("Parks", 90, "90%", "good", 400),
    ]),
    "\n".join([
        bar("Planning &amp; design", 25, "2", "violet", 0),
        bar("Permitting", 12, "1", "violet", 80),
        bar("Construction", 50, "4", "", 160),
        bar("Closeout", 13, "1", "good", 240),
    ]),
)


# ------------------------------------------------------------
# TAB 3 — ASSETS
# ------------------------------------------------------------
ASSETS = [
    ("AS-0417", "Pump Station 2 &mdash; Primary Pump", "Water Utility", "1998", "Poor", "risk", "Critical", 28, "$412K lifetime"),
    ("AS-1120", "Municipal Complex &mdash; Roof System", "Facilities", "2004", "Fair", "warn", "High", 46, "$188K lifetime"),
    ("AS-0902", "Ridge Road Culvert 14", "Infrastructure", "1971", "Critical", "risk", "Critical", 4, "$96K lifetime"),
    ("AS-2231", "Emergency Generator &mdash; DPW", "Facilities", "2011", "Poor", "risk", "Critical", 31, "$74K lifetime"),
    ("AS-0655", "Water Main &mdash; Sector 4 Trunk", "Water Utility", "1966", "Poor", "risk", "Critical", 12, "$1.2M lifetime"),
    ("AS-3014", "Plow Truck 7", "Fleet", "2016", "Fair", "warn", "High", 52, "$143K lifetime"),
    ("AS-1877", "Lift Station 3 &mdash; Controls", "Sewer", "2002", "Fair", "warn", "High", 38, "$67K lifetime"),
    ("AS-4402", "Community Center &mdash; HVAC", "Facilities", "2013", "Good", "good", "Medium", 71, "$52K lifetime"),
    ("AS-0128", "Salt Storage Structure", "Public Works", "2026", "Good", "good", "Medium", 97, "New asset"),
    ("AS-2790", "Park Pavilion &mdash; Electrical", "Parks", "1994", "Poor", "risk", "Low", 19, "$28K lifetime"),
]

asset_rows = "\n".join(
    f"""                <tr>
                  <td><b>{aid}</b></td>
                  <td><strong>{name}</strong></td>
                  <td>{dept}</td>
                  <td class="num">{yr}</td>
                  <td><span class="chip chip--{cc}">{cond}</span></td>
                  <td>{crit}</td>
                  <td>
                    <div class="mini-bar mini-bar--{'risk' if rul < 30 else 'warn' if rul < 55 else 'good'}"><span style="width:{rul}%"></span></div>
                    <span style="font-size:0.6875rem;color:var(--dash-dim)">{rul}% RUL</span>
                  </td>
                  <td>{cost}</td>
                </tr>"""
    for aid, name, dept, yr, cond, cc, crit, rul, cost in ASSETS
)

tab_assets = """
          <div class="kpi-grid">
%s
          </div>

          <div class="grid grid--2" style="gap:1.25rem;margin-bottom:1.25rem">
            <section class="panel">
              <div class="panel__head"><h3 class="panel__title">Assets by Class</h3></div>
              <div class="panel__body">
                <div class="chart">
%s
                </div>
              </div>
            </section>
            <section class="panel">
              <div class="panel__head"><h3 class="panel__title">Replacement Value at Risk</h3><span class="panel__hint">Poor / critical condition</span></div>
              <div class="panel__body">
                <div class="chart">
%s
                </div>
                <p class="panel__hint" style="margin-top:1rem">Estimated replacement value of assets rated poor or critical, by class.</p>
              </div>
            </section>
          </div>

          <section class="panel">
            <div class="panel__head">
              <h3 class="panel__title">Critical &amp; High-Criticality Asset Register</h3>
              <span class="demo-tag">Sample records</span>
            </div>
            <div class="panel__body panel__body--flush">
              <div class="dtable-wrap" tabindex="0" role="region" aria-label="Scrollable data table">
                <table class="dtable">
                  <caption>Illustrative demonstration data &mdash; asset register extract sorted by criticality</caption>
                  <thead>
                    <tr>
                      <th scope="col">Asset ID</th>
                      <th scope="col">Description</th>
                      <th scope="col">Department</th>
                      <th scope="col" class="num">Installed</th>
                      <th scope="col">Condition</th>
                      <th scope="col">Criticality</th>
                      <th scope="col">Remaining Life</th>
                      <th scope="col">Cost History</th>
                    </tr>
                  </thead>
                  <tbody>
%s
                  </tbody>
                </table>
              </div>
            </div>
          </section>
""" % (
    "\n".join([
        kpi("Tracked Assets", "1,847", "", "Across 6 departments", "flat", "", None),
        kpi("Replacement Value", "$186M", "", "Estimated, current dollars", "flat", "gold", None),
        kpi("Poor / Critical", "536", "", "29% of portfolio", "up", "risk", None),
        kpi("Avg. Remaining Life", "41", "%", "Weighted by value", "down", "warn", None),
    ]),
    "\n".join([
        bar("Water &amp; sewer network", 100, "612", "", 0),
        bar("Buildings &amp; systems", 71, "434", "", 80),
        bar("Roads &amp; structures", 58, "356", "", 160),
        bar("Fleet &amp; equipment", 33, "203", "", 240),
        bar("Parks &amp; grounds", 25, "154", "", 320),
        bar("Stormwater", 14, "88", "", 400),
    ]),
    "\n".join([
        bar("Water &amp; sewer network", 92, "$41.2M", "risk", 0),
        bar("Roads &amp; structures", 74, "$33.1M", "risk", 80),
        bar("Buildings &amp; systems", 48, "$21.5M", "warn", 160),
        bar("Fleet &amp; equipment", 21, "$9.4M", "warn", 240),
        bar("Stormwater", 15, "$6.7M", "warn", 320),
        bar("Parks &amp; grounds", 9, "$4.0M", "", 400),
    ]),
    asset_rows,
)


# ------------------------------------------------------------
# TAB 4 — WORK ORDERS
# ------------------------------------------------------------
WOS = [
    ("WO-88214", "Hydrant flow test &mdash; Zone 3", "Water Utility", "Preventive", "Scheduled", "info", "Medium", "T. Alvarez", "3 days"),
    ("WO-88207", "Generator load test failure &mdash; DPW", "Facilities", "Corrective", "In Progress", "warn", "Critical", "M. Okafor", "Overdue 2 days"),
    ("WO-88198", "Pothole repair &mdash; Ridge Rd MP 4.2", "Public Works", "Reactive", "In Progress", "warn", "High", "Crew 2", "Today"),
    ("WO-88221", "Backflow device certification batch", "Compliance", "Regulatory", "Scheduled", "info", "High", "R. Pham", "12 days"),
    ("WO-88176", "Lift Station 3 &mdash; control panel fault", "Sewer", "Corrective", "On Hold", "risk", "Critical", "J. Byrne", "Parts pending"),
    ("WO-88233", "Quarterly HVAC filter replacement", "Facilities", "Preventive", "Scheduled", "info", "Low", "Facilities crew", "9 days"),
    ("WO-88189", "Plow Truck 7 &mdash; hydraulic leak", "Fleet", "Corrective", "Complete", "good", "High", "Fleet shop", "Closed"),
    ("WO-88240", "Storm drain inlet cleaning &mdash; Sector 2", "Stormwater", "Preventive", "Scheduled", "info", "Medium", "Crew 4", "6 days"),
    ("WO-88165", "Pavilion electrical inspection", "Parks", "Regulatory", "Complete", "good", "Medium", "R. Pham", "Closed"),
    ("WO-88245", "Water meter replacement batch 14", "Water Utility", "Planned", "Scheduled", "info", "Low", "Meter crew", "18 days"),
]

wo_rows = "\n".join(
    f"""                <tr>
                  <td><b>{wid}</b></td>
                  <td><strong>{desc}</strong></td>
                  <td>{dept}</td>
                  <td>{typ}</td>
                  <td><span class="chip chip--{cc}">{st}</span></td>
                  <td>{pri}</td>
                  <td>{who}</td>
                  <td>{due}</td>
                </tr>"""
    for wid, desc, dept, typ, st, cc, pri, who, due in WOS
)

tab_wo = """
          <div class="kpi-grid">
%s
          </div>

          <div class="grid grid--2" style="gap:1.25rem;margin-bottom:1.25rem">
            <section class="panel">
              <div class="panel__head"><h3 class="panel__title">Work Order Mix</h3><span class="panel__hint">Current open population</span></div>
              <div class="panel__body">
                <div class="chart">
%s
                </div>
                <p class="panel__hint" style="margin-top:1rem">A healthy operation trends toward preventive and planned work. Reactive share above roughly 30%% typically indicates the maintenance program is being crowded out.</p>
              </div>
            </section>
            <section class="panel">
              <div class="panel__head"><h3 class="panel__title">Backlog Age</h3><span class="panel__hint">Open orders by age band</span></div>
              <div class="panel__body">
                <div class="chart">
%s
                </div>
                <p class="panel__hint" style="margin-top:1rem">Orders aging beyond 90 days are automatically escalated to the responsible director in the sample configuration.</p>
              </div>
            </section>
          </div>

          <section class="panel">
            <div class="panel__head">
              <h3 class="panel__title">Work Order Queue</h3>
              <span class="demo-tag">Sample records</span>
            </div>
            <div class="panel__body panel__body--flush">
              <div class="dtable-wrap" tabindex="0" role="region" aria-label="Scrollable data table">
                <table class="dtable">
                  <caption>Illustrative demonstration data &mdash; work order queue extract</caption>
                  <thead>
                    <tr>
                      <th scope="col">Order</th>
                      <th scope="col">Description</th>
                      <th scope="col">Department</th>
                      <th scope="col">Type</th>
                      <th scope="col">Status</th>
                      <th scope="col">Priority</th>
                      <th scope="col">Assigned</th>
                      <th scope="col">Due</th>
                    </tr>
                  </thead>
                  <tbody>
%s
                  </tbody>
                </table>
              </div>
            </div>
          </section>
""" % (
    "\n".join([
        kpi("Open Orders", "1,284", "", "46 fewer this period", "down", "good", [92, 90, 88, 84, 80, 76, 72, 70]),
        kpi("Overdue", "97", "", "7.6% of open population", "down", "warn", None),
        kpi("Preventive Share", "58", "%", "5 pts vs. last period", "up", "good", None),
        kpi("Avg. Days to Close", "11.4", "", "1.8 days faster", "down", "good", None),
    ]),
    "\n".join([
        bar("Preventive", 58, "745", "good", 0),
        bar("Reactive", 22, "282", "risk", 80),
        bar("Corrective", 11, "141", "warn", 160),
        bar("Regulatory", 6, "77", "gold", 240),
        bar("Planned capital", 3, "39", "", 320),
    ]),
    "\n".join([
        bar("0&ndash;14 days", 47, "603", "good", 0),
        bar("15&ndash;30 days", 26, "334", "good", 80),
        bar("31&ndash;60 days", 15, "193", "warn", 160),
        bar("61&ndash;90 days", 8, "103", "warn", 240),
        bar("Over 90 days", 4, "51", "risk", 320),
    ]),
    wo_rows,
)


# ------------------------------------------------------------
# TAB 5 — BUDGETS
# ------------------------------------------------------------
BUDGETS = [
    ("Public Works Operating", "$4,120,000", "$2,684,000", 65, "On Track", "good", "Seasonal overtime tracking to plan"),
    ("Water Utility Operating", "$3,450,000", "$2,415,000", 70, "Monitoring", "warn", "Chemical costs above forecast"),
    ("Facilities Operating", "$1,880,000", "$1,109,000", 59, "On Track", "good", "Within tolerance"),
    ("Fleet Operating", "$1,240,000", "$955,000", 77, "Monitoring", "warn", "Parts inflation and two major repairs"),
    ("Parks &amp; Recreation", "$860,000", "$447,000", 52, "On Track", "good", "Seasonal spend ahead"),
    ("Capital &mdash; Infrastructure", "$5,200,000", "$3,120,000", 60, "At Risk", "risk", "Culvert scope change pending"),
    ("Capital &mdash; Facilities", "$2,180,000", "$1,112,000", 51, "On Track", "good", "Roof project ahead of schedule"),
    ("Capital &mdash; Fleet", "$940,000", "$771,000", 82, "On Track", "good", "Two units delivered early"),
]

budget_rows = "\n".join(
    f"""                <tr>
                  <td><strong>{name}</strong></td>
                  <td class="num">{approved}</td>
                  <td class="num">{spent}</td>
                  <td>
                    <div class="mini-bar mini-bar--{'risk' if st == 'At Risk' else 'warn' if st == 'Monitoring' else 'good'}"><span style="width:{pct}%"></span></div>
                    <span style="font-size:0.6875rem;color:var(--dash-dim)">{pct}% committed</span>
                  </td>
                  <td><span class="chip chip--{cc}">{st}</span></td>
                  <td>{note}</td>
                </tr>"""
    for name, approved, spent, pct, st, cc, note in BUDGETS
)

tab_budgets = """
          <div class="kpi-grid">
%s
          </div>

          <section class="panel" style="margin-bottom:1.25rem">
            <div class="panel__head">
              <h3 class="panel__title">Budget Position by Fund</h3>
              <span class="demo-tag">Sample records</span>
            </div>
            <div class="panel__body panel__body--flush">
              <div class="dtable-wrap" tabindex="0" role="region" aria-label="Scrollable data table">
                <table class="dtable">
                  <caption>Illustrative demonstration data &mdash; operating and capital budget position</caption>
                  <thead>
                    <tr>
                      <th scope="col">Fund / Program</th>
                      <th scope="col" class="num">Approved</th>
                      <th scope="col" class="num">Committed</th>
                      <th scope="col">Utilization</th>
                      <th scope="col">Status</th>
                      <th scope="col">Note</th>
                    </tr>
                  </thead>
                  <tbody>
%s
                  </tbody>
                </table>
              </div>
            </div>
          </section>

          <div class="grid grid--2" style="gap:1.25rem">
            <section class="panel">
              <div class="panel__head"><h3 class="panel__title">Spend Trajectory vs. Straight-Line Plan</h3></div>
              <div class="panel__body">
                <svg viewBox="0 0 480 220" width="100%%" height="220" role="img" aria-label="Line chart of illustrative demonstration data comparing cumulative actual spend against a straight-line budget plan across eight periods. Actual spend tracks slightly below plan through period five, then converges by period eight.">
                  <g stroke="rgba(255,255,255,0.07)" stroke-width="1">
                    <line x1="40" y1="20" x2="470" y2="20" /><line x1="40" y1="60" x2="470" y2="60" />
                    <line x1="40" y1="100" x2="470" y2="100" /><line x1="40" y1="140" x2="470" y2="140" />
                    <line x1="40" y1="180" x2="470" y2="180" />
                  </g>
                  <g fill="#64748b" font-size="10" font-family="Inter, sans-serif">
                    <text x="4" y="24">100%%</text><text x="8" y="64">75%%</text>
                    <text x="8" y="104">50%%</text><text x="8" y="144">25%%</text><text x="14" y="184">0%%</text>
                  </g>
                  <polyline points="40,180 94,160 148,140 202,120 256,100 310,80 364,60 418,40 470,20"
                            fill="none" stroke="#1e88e5" stroke-width="2" stroke-dasharray="5 4" />
                  <polyline points="40,180 94,166 148,151 202,133 256,116 310,92 364,71 418,52 470,26"
                            fill="none" stroke="#c9a227" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" />
                  <g fill="#c9a227">
                    <circle cx="148" cy="151" r="3" /><circle cx="256" cy="116" r="3" />
                    <circle cx="364" cy="71" r="3" /><circle cx="470" cy="26" r="3" />
                  </g>
                </svg>
                <div class="legend">
                  <span class="legend__item"><span class="legend__swatch" style="background:#1e88e5"></span> Straight-line plan</span>
                  <span class="legend__item"><span class="legend__swatch" style="background:#c9a227"></span> Actual commitment</span>
                </div>
              </div>
            </section>

            <section class="panel">
              <div class="panel__head"><h3 class="panel__title">Variance Drivers</h3><span class="panel__hint">Largest deviations from plan</span></div>
              <div class="panel__body">
                <div class="chart">
%s
                </div>
                <p class="panel__hint" style="margin-top:1rem">Positive values indicate spend above the period plan. Each driver links to the originating work records in a live deployment.</p>
              </div>
            </section>
          </div>
""" % (
    "\n".join([
        kpi("Total Approved", "$19.87M", "", "Operating and capital", "flat", "gold", None),
        kpi("Committed", "$12.61M", "", "63% of approved", "flat", "", [10, 20, 28, 36, 44, 52, 58, 63]),
        kpi("Uncommitted", "$7.26M", "", "4 months remaining", "flat", "warn", None),
        kpi("Funds At Risk", "1", "/8", "Infrastructure capital", "up", "risk", None),
    ]),
    budget_rows,
    "\n".join([
        bar("Culvert scope change", 88, "+$137K", "risk", 0),
        bar("Fleet parts inflation", 62, "+$96K", "warn", 80),
        bar("Water treatment chemicals", 54, "+$84K", "warn", 160),
        bar("Emergency generator service", 31, "+$48K", "warn", 240),
        bar("Roof project savings", 26, "&minus;$41K", "good", 320),
        bar("Deferred parks paving", 19, "&minus;$29K", "good", 400),
    ]),
)


# ------------------------------------------------------------
# TAB 6 — ACTION CENTER
# ------------------------------------------------------------
ACTIONS = [
    ("Approve contingency draw &mdash; Ridge Road culvert",
     "Bid opening returned 11% above the engineer's estimate. Holding the fall construction window requires a $137,000 contingency draw approved before mobilization on the 14th. Deferring to the spring window is projected to add $84,000 in escalation and extends the detour through winter.",
     "Executive decision", "risk", "Due in 3 days", "Capital Program", "Ridge Road Culvert Replacement"),
    ("Direct backflow certification scheduling",
     "38 backflow prevention devices are inside the 30-day certification window with no appointment scheduled. Certification lapse creates a regulatory exposure on the potable water system and is reportable.",
     "Directive", "warn", "Due in 6 days", "Compliance", "Annual certification program"),
    ("Authorize emergency generator service",
     "The Public Works facility generator has failed two consecutive monthly load tests. The facility houses the emergency operations center. Recommend authorizing immediate service ahead of the storm season readiness review.",
     "Executive decision", "risk", "Due in 2 days", "Facilities", "AS-2231"),
    ("Confirm Lift Station 3 permit strategy",
     "The rehabilitation design requires a state permit with a 90-day review. Submitting the current design delays construction to next season; a reduced scope avoids the permit but leaves the secondary pump unaddressed.",
     "Decision required", "warn", "Due in 11 days", "Sewer Utility", "CP-2415"),
    ("Review Q3 executive report before distribution",
     "The automated quarterly operations report is assembled and ready for review. Distribution to the governing body is scheduled for the 22nd. Three narrative sections are flagged for confirmation.",
     "Review", "info", "Due in 8 days", "Operations", "Q3 reporting cycle"),
    ("Accept revised fleet replacement sequence",
     "Two heavy units were delivered ahead of schedule, creating an opportunity to advance one replacement from next fiscal year using released funds. Requires confirmation that the deferred unit remains serviceable.",
     "Approval", "info", "Due in 14 days", "Fleet Services", "CP-2409"),
]

action_items = "\n".join(
    f"""              <li class="queue__item">
                <div class="queue__head">
                  <p class="queue__title">{title}</p>
                  <span class="chip chip--{cc}">{kind}</span>
                </div>
                <p class="queue__desc">{desc}</p>
                <p class="queue__meta"><span>{due}</span><span>{dept}</span><span>Ref: {ref}</span></p>
                <div class="queue__actions">
                  <button type="button" class="btn-mini btn-mini--approve" data-queue-action="Approved">Approve</button>
                  <button type="button" class="btn-mini btn-mini--hold" data-queue-action="Held for review">Hold</button>
                  <button type="button" class="btn-mini" data-queue-action="Delegated">Delegate</button>
                </div>
              </li>"""
    for title, desc, kind, cc, due, dept, ref in ACTIONS
)

tab_actions = """
          <div class="kpi-grid">
%s
          </div>

          <div class="callout callout--dark" style="margin-bottom:1.25rem">
            <span class="callout__icon" aria-hidden="true">%s</span>
            <p><strong>The action buttons below are interactive but non-binding.</strong> They demonstrate how an approval queue behaves &mdash; selecting an option records a local, in-page result and nothing else. No data is transmitted, stored, or submitted anywhere.</p>
          </div>

          <section class="panel">
            <div class="panel__head">
              <h3 class="panel__title">Items Awaiting Decision</h3>
              <span class="demo-tag">Sample queue</span>
            </div>
            <ul class="queue" role="list" data-queue>
%s
            </ul>
          </section>

          <div class="grid grid--2" style="gap:1.25rem;margin-top:1.25rem">
            <section class="panel">
              <div class="panel__head"><h3 class="panel__title">Decision Throughput</h3><span class="panel__hint">Items resolved per period</span></div>
              <div class="panel__body">
                <div class="chart">
%s
                </div>
                <p class="panel__hint" style="margin-top:1rem">Aging decisions are the most common hidden constraint in operations. Nexus measures decision latency the same way it measures work order latency.</p>
              </div>
            </section>
            <section class="panel">
              <div class="panel__head"><h3 class="panel__title">Escalation Reasons</h3></div>
              <div class="panel__body">
                <div class="chart">
%s
                </div>
              </div>
            </section>
          </div>
""" % (
    "\n".join([
        kpi("Awaiting Decision", "6", "", "3 due within a week", "flat", "warn", None),
        kpi("Avg. Decision Age", "4.2", " days", "1.1 days faster", "down", "good", None),
        kpi("Resolved This Period", "23", "", "5 more than last period", "up", "good", None),
        kpi("Escalated to Executive", "3", "", "All within SLA", "flat", "", None),
    ]),
    icon("alert", 20),
    action_items,
    "\n".join([
        bar("Period 1", 62, "18", "", 0),
        bar("Period 2", 55, "16", "", 80),
        bar("Period 3", 72, "21", "good", 160),
        bar("Period 4", 62, "18", "", 240),
        bar("Period 5", 79, "23", "good", 320),
    ]),
    "\n".join([
        bar("Cost variance threshold", 42, "12", "risk", 0),
        bar("Compliance deadline", 28, "8", "warn", 80),
        bar("Scope change", 17, "5", "warn", 160),
        bar("Asset condition finding", 10, "3", "", 240),
        bar("Contract / procurement", 3, "1", "", 320),
    ]),
)


# ------------------------------------------------------------
# TAB 7 — RISKS
# ------------------------------------------------------------
RISKS = [
    ("RK-041", "Water main failure &mdash; Sector 4 trunk", "Asset Failure", "High", "Severe", "risk", "Critical", "Water Utility Director", "Replacement programmed FY27; interim pressure monitoring active"),
    ("RK-018", "Emergency generator unavailability", "Continuity", "High", "Severe", "risk", "Critical", "Facilities Manager", "Service authorization pending executive decision"),
    ("RK-052", "Backflow certification lapse", "Regulatory", "Medium", "Major", "warn", "High", "Compliance Coordinator", "38 devices being scheduled; directive issued"),
    ("RK-007", "Key-person dependency &mdash; water operations", "Knowledge Loss", "High", "Major", "risk", "High", "Operations Director", "Knowledge capture sessions in progress; SOP drafting underway"),
    ("RK-033", "Culvert 14 structural failure", "Asset Failure", "Medium", "Severe", "warn", "High", "Public Works Director", "Replacement project active; load restriction posted"),
    ("RK-060", "Winter storm response capacity", "Operational", "Medium", "Major", "warn", "Medium", "Public Works Director", "Fleet readiness review scheduled; contractor standby in place"),
    ("RK-025", "Stormwater permit compliance findings", "Regulatory", "Low", "Major", "info", "Medium", "Engineering", "Basin retrofit in design; documentation current"),
    ("RK-071", "Cyber exposure &mdash; SCADA remote access", "Technology", "Low", "Severe", "warn", "High", "IT / Water Utility", "Access review complete; MFA enforcement scheduled"),
]

risk_rows = "\n".join(
    f"""                <tr>
                  <td><b>{rid}</b></td>
                  <td><strong>{name}</strong></td>
                  <td>{cat}</td>
                  <td>{like}</td>
                  <td>{cons}</td>
                  <td><span class="chip chip--{cc}">{rate}</span></td>
                  <td>{owner}</td>
                  <td>{mit}</td>
                </tr>"""
    for rid, name, cat, like, cons, cc, rate, owner, mit in RISKS
)

tab_risks = """
          <div class="kpi-grid">
%s
          </div>

          <div class="grid grid--2" style="gap:1.25rem;margin-bottom:1.25rem">
            <section class="panel">
              <div class="panel__head"><h3 class="panel__title">Risk Heat Distribution</h3><span class="panel__hint">Likelihood &times; consequence</span></div>
              <div class="panel__body">
                <svg viewBox="0 0 320 240" width="100%%" height="240" role="img" aria-label="Risk matrix of illustrative demonstration data plotting eight risks by likelihood and consequence. Two risks fall in the high likelihood, severe consequence quadrant.">
                  <g font-family="Inter, sans-serif" font-size="9" fill="#64748b">
                    <text x="8" y="34">High</text><text x="4" y="104">Med</text><text x="10" y="174">Low</text>
                    <text x="66" y="222">Minor</text><text x="146" y="222">Major</text><text x="222" y="222">Severe</text>
                    <text x="150" y="236" text-anchor="middle" fill="#93a3b8">Consequence &rarr;</text>
                  </g>
                  <g>
                    <rect x="40" y="140" width="80" height="60" fill="rgba(16,185,129,0.12)" stroke="rgba(255,255,255,0.06)" />
                    <rect x="120" y="140" width="80" height="60" fill="rgba(16,185,129,0.10)" stroke="rgba(255,255,255,0.06)" />
                    <rect x="200" y="140" width="80" height="60" fill="rgba(245,158,11,0.12)" stroke="rgba(255,255,255,0.06)" />
                    <rect x="40" y="80" width="80" height="60" fill="rgba(16,185,129,0.10)" stroke="rgba(255,255,255,0.06)" />
                    <rect x="120" y="80" width="80" height="60" fill="rgba(245,158,11,0.14)" stroke="rgba(255,255,255,0.06)" />
                    <rect x="200" y="80" width="80" height="60" fill="rgba(244,63,94,0.16)" stroke="rgba(255,255,255,0.06)" />
                    <rect x="40" y="20" width="80" height="60" fill="rgba(245,158,11,0.12)" stroke="rgba(255,255,255,0.06)" />
                    <rect x="120" y="20" width="80" height="60" fill="rgba(244,63,94,0.16)" stroke="rgba(255,255,255,0.06)" />
                    <rect x="200" y="20" width="80" height="60" fill="rgba(244,63,94,0.26)" stroke="rgba(255,255,255,0.06)" />
                  </g>
                  <g>
                    <circle cx="240" cy="40" r="9" fill="#f43f5e" opacity="0.9" /><text x="240" y="44" text-anchor="middle" font-size="9" fill="#fff" font-family="Inter, sans-serif">2</text>
                    <circle cx="160" cy="45" r="8" fill="#fb7185" opacity="0.85" /><text x="160" y="49" text-anchor="middle" font-size="9" fill="#fff" font-family="Inter, sans-serif">1</text>
                    <circle cx="160" cy="105" r="8" fill="#f59e0b" opacity="0.85" /><text x="160" y="109" text-anchor="middle" font-size="9" fill="#1a1405" font-family="Inter, sans-serif">2</text>
                    <circle cx="240" cy="105" r="8" fill="#fb7185" opacity="0.8" /><text x="240" y="109" text-anchor="middle" font-size="9" fill="#fff" font-family="Inter, sans-serif">1</text>
                    <circle cx="240" cy="168" r="8" fill="#f59e0b" opacity="0.7" /><text x="240" y="172" text-anchor="middle" font-size="9" fill="#1a1405" font-family="Inter, sans-serif">1</text>
                    <circle cx="160" cy="168" r="7" fill="#60a5fa" opacity="0.7" /><text x="160" y="172" text-anchor="middle" font-size="9" fill="#0b1220" font-family="Inter, sans-serif">1</text>
                  </g>
                  <text x="20" y="14" font-size="9" fill="#93a3b8" font-family="Inter, sans-serif">&uarr; Likelihood</text>
                </svg>
              </div>
            </section>
            <section class="panel">
              <div class="panel__head"><h3 class="panel__title">Risks by Category</h3></div>
              <div class="panel__body">
                <div class="chart">
%s
                </div>
                <p class="panel__hint" style="margin-top:1rem">Knowledge loss is consistently under-registered in operational risk programs. Nexus treats it as a first-class category.</p>
              </div>
            </section>
          </div>

          <section class="panel">
            <div class="panel__head">
              <h3 class="panel__title">Risk Register</h3>
              <span class="demo-tag">Sample records</span>
            </div>
            <div class="panel__body panel__body--flush">
              <div class="dtable-wrap" tabindex="0" role="region" aria-label="Scrollable data table">
                <table class="dtable">
                  <caption>Illustrative demonstration data &mdash; operational risk register</caption>
                  <thead>
                    <tr>
                      <th scope="col">ID</th>
                      <th scope="col">Risk</th>
                      <th scope="col">Category</th>
                      <th scope="col">Likelihood</th>
                      <th scope="col">Consequence</th>
                      <th scope="col">Rating</th>
                      <th scope="col">Owner</th>
                      <th scope="col">Mitigation Status</th>
                    </tr>
                  </thead>
                  <tbody>
%s
                  </tbody>
                </table>
              </div>
            </div>
          </section>
""" % (
    "\n".join([
        kpi("Open Risks", "17", "", "2 escalated this period", "up", "risk", None),
        kpi("Critical Rated", "2", "", "Both with active mitigation", "flat", "risk", None),
        kpi("Mitigations Active", "14", "/17", "3 awaiting resourcing", "up", "good", None),
        kpi("Overdue Reviews", "1", "", "Stormwater permit risk", "flat", "warn", None),
    ]),
    "\n".join([
        bar("Asset failure", 100, "6", "risk", 0),
        bar("Regulatory", 67, "4", "warn", 80),
        bar("Continuity", 50, "3", "warn", 160),
        bar("Knowledge loss", 33, "2", "risk", 240),
        bar("Technology", 17, "1", "", 320),
        bar("Operational", 17, "1", "", 400),
    ]),
    risk_rows,
)


# ------------------------------------------------------------
# ASIDE — notifications + system status
# ------------------------------------------------------------
notifications = """
          <section class="panel">
            <div class="panel__head">
              <h3 class="panel__title">Notifications</h3>
              <span class="pulse-dot" aria-hidden="true"></span>
            </div>
            <ul class="feed" role="list">
%s
            </ul>
          </section>

          <section class="panel">
            <div class="panel__head"><h3 class="panel__title">System Status</h3></div>
            <div class="panel__body">
              <div class="status-strip">
                <div class="status-strip__cell"><span class="status-strip__label">Data sources</span><span class="status-strip__value">6 connected</span></div>
                <div class="status-strip__cell"><span class="status-strip__label">Last refresh</span><span class="status-strip__value">Illustrative</span></div>
                <div class="status-strip__cell"><span class="status-strip__label">Records synced</span><span class="status-strip__value">1,847</span></div>
                <div class="status-strip__cell"><span class="status-strip__label">Integrity checks</span><span class="status-strip__value">Passing</span></div>
              </div>
              <div style="margin-top:1.25rem">
                <span class="kpi__label">Data completeness</span>
                <div class="meter" aria-hidden="true"><span class="on"></span><span class="on"></span><span class="on"></span><span class="on"></span><span class="on"></span><span class="on"></span><span class="on"></span><span class="on--warn"></span><span></span><span></span></div>
                <p class="panel__hint" style="margin-top:0.5rem">78%% of tracked assets carry a complete condition record in this sample dataset.</p>
              </div>
            </div>
          </section>

          <section class="panel">
            <div class="panel__head"><h3 class="panel__title">Quick Reference</h3></div>
            <div class="panel__body">
              <p class="panel__hint" style="line-height:1.7">This demonstration mirrors the structure of a configured Nexus deployment. In a live environment, every number links to its source record, every status carries an owner, and every change is captured in the audit trail.</p>
              <div style="display:grid;gap:0.5rem;margin-top:1rem">
                <a href="%smap-intelligence/" class="btn-mini">Nexus Map Intelligence</a>
                <a href="%sfounder-command-center/" class="btn-mini">Founder Command Center</a>
                <a href="%sgenesis/" class="btn-mini">Genesis AI Workforce</a>
                <a href="%srequest-demo/" class="btn-mini btn-mini--approve">Request a Guided Demo</a>
              </div>
            </div>
          </section>
""" % (
    "\n".join([
        feed_item("risk", "Generator load test failed &mdash; DPW facility", "Facilities &middot; escalated to executive &middot; sample event"),
        feed_item("warn", "38 backflow devices entering certification window", "Compliance &middot; automated threshold &middot; sample event"),
        feed_item("warn", "Ridge Road culvert bid 11% over estimate", "Capital program &middot; variance alert &middot; sample event"),
        feed_item("good", "Salt storage facility reached substantial completion", "Public Works &middot; milestone &middot; sample event"),
        feed_item("info", "Q3 executive report assembled and ready for review", "Operations &middot; automated reporting &middot; sample event"),
        feed_item("good", "Reactive backlog down 46 orders this period", "Work management &middot; trend &middot; sample event"),
        feed_item("info", "Two heavy fleet units delivered ahead of schedule", "Fleet services &middot; milestone &middot; sample event"),
    ]),
    P, P, P, P,
)


# ------------------------------------------------------------
# PAGE ASSEMBLY
# ------------------------------------------------------------
TABS = [
    ("exec", "Executive Dashboard", tab_exec),
    ("projects", "Projects", tab_projects),
    ("assets", "Assets", tab_assets),
    ("workorders", "Work Orders", tab_wo),
    ("budgets", "Budgets", tab_budgets),
    ("actions", "Action Center", tab_actions),
    ("risks", "Risks", tab_risks),
]

tab_buttons = "\n".join(
    '            <button type="button" class="tabs__tab" id="tab-%s" role="tab" aria-controls="panel-%s" aria-selected="%s" tabindex="%s">%s</button>'
    % (k, k, "true" if i == 0 else "false", "0" if i == 0 else "-1", label)
    for i, (k, label, _) in enumerate(TABS)
)

tab_panels = "\n".join(
    '        <div class="tabs__panel" id="panel-%s" role="tabpanel" aria-labelledby="tab-%s" tabindex="0"%s>\n%s\n        </div>'
    % (k, k, "" if i == 0 else " hidden", content)
    for i, (k, label, content) in enumerate(TABS)
)

nexus_body = S.page_hero(
    P,
    "Nexus Enterprise Intelligence Platform",
    "One Operating Picture. Every Level.",
    "Nexus holds assets, work, capital, compliance, risk, and the decisions that connect them in a single model &mdash; so that the executive summary and the technician's work order are drawing on the same truth. Explore a working demonstration below.",
    [(None, "Nexus Platform")],
    actions='<a href="#nexus-demo" class="btn btn--gold">Open the Demonstration</a><a href="%srequest-demo/" class="btn btn--outline">Request a Guided Demo</a>' % P,
    dash=True,
) + """    <section class="section section--tight">
      <div class="container">
        <div class="grid grid--4">
          <div class="card card--flat">
            <span class="card__icon" aria-hidden="true">%s</span>
            <h3 class="card__title">Single operational model</h3>
            <p class="card__desc">Assets, work, cost, obligation, and risk share one data model. A pump station is the same object whether you reach it from a budget line, a work order, or a risk entry.</p>
          </div>
          <div class="card card--flat">
            <span class="card__icon" aria-hidden="true">%s</span>
            <h3 class="card__title">Decision surface, not just a report</h3>
            <p class="card__desc">The platform surfaces what needs a decision, who owns it, what it costs to wait, and routes it to the right person with the context attached.</p>
          </div>
          <div class="card card--flat">
            <span class="card__icon" aria-hidden="true">%s</span>
            <h3 class="card__title">Complete audit trail</h3>
            <p class="card__desc">Every change, approval, and override is recorded with actor and timestamp &mdash; structured to answer an auditor, an open records request, or a governing body years later.</p>
          </div>
          <div class="card card--flat">
            <span class="card__icon" aria-hidden="true">%s</span>
            <h3 class="card__title">Configured to your model</h3>
            <p class="card__desc">Nexus is configured to an operating model your organization agreed to during the diagnostic. It reflects how you decided to work, rather than imposing a vendor's assumptions.</p>
          </div>
        </div>
      </div>
    </section>

    <section class="dash" id="nexus-demo" style="scroll-margin-top:5rem">
      <div class="container">
        %s

        <div class="dash__bar" style="margin-top:1.25rem">
          <div class="dash__bar-brand">
            <span class="logo-mark logo-mark--sm" aria-hidden="true">GCS</span>
            <div>
              <div class="dash__bar-title">Nexus &mdash; Operations Console</div>
              <div class="dash__bar-sub">Demonstration environment &middot; sample municipal configuration</div>
            </div>
          </div>
          <div class="dash__bar-meta">
            <span><span class="pulse-dot" aria-hidden="true"></span> Demo mode</span>
            <span>Scope: 6 departments</span>
            <span>1,847 assets</span>
            <span>Fiscal period: Q3 (sample)</span>
          </div>
        </div>

        <div class="dash__layout">
          <div class="dash__main">
            <div class="tabs" data-tabs>
              <div class="tabs__list" role="tablist" aria-label="Nexus platform demonstration views">
%s
              </div>
%s
            </div>
          </div>
          <aside class="dash__aside" aria-label="Notifications and system status">
%s
          </aside>
        </div>
      </div>
    </section>

    <section class="section">
      <div class="container">
        <div class="section-header">
          <span class="section-label">Platform Architecture</span>
          <h2 class="section-title">How Nexus Is Structured</h2>
          <p class="section-subtitle">Four layers, each of which must be sound before the next one is worth building.</p>
        </div>
        <div class="grid grid--4">
          <article class="card">
            <span class="card__number">Layer 01</span>
            <h3 class="card__title">Foundation &mdash; The Register</h3>
            <p class="card__desc">Assets, locations, hierarchy, identity, and relationships. Every downstream capability resolves to this layer, which is why it is built first and audited continuously.</p>
            <ul class="card__list" role="list">
              <li>Hierarchical asset register</li>
              <li>Location and spatial reference</li>
              <li>Classification and criticality</li>
              <li>Document and specification linkage</li>
            </ul>
          </article>
          <article class="card">
            <span class="card__number">Layer 02</span>
            <h3 class="card__title">Activity &mdash; The Record</h3>
            <p class="card__desc">What happens to assets over time: work performed, cost incurred, inspections completed, conditions observed, obligations satisfied. Captured at the point of work.</p>
            <ul class="card__list" role="list">
              <li>Work order lifecycle</li>
              <li>Cost and labor capture</li>
              <li>Inspection and condition history</li>
              <li>Compliance evidence</li>
            </ul>
          </article>
          <article class="card">
            <span class="card__number">Layer 03</span>
            <h3 class="card__title">Intelligence &mdash; The Interpretation</h3>
            <p class="card__desc">Analysis over the record: condition trending, cost-of-ownership, backlog dynamics, deferral consequence, risk rating, and scenario comparison.</p>
            <ul class="card__list" role="list">
              <li>Condition and deterioration modeling</li>
              <li>Lifecycle cost analysis</li>
              <li>Capital scenario comparison</li>
              <li>Risk scoring and heat mapping</li>
            </ul>
          </article>
          <article class="card">
            <span class="card__number">Layer 04</span>
            <h3 class="card__title">Action &mdash; The Loop</h3>
            <p class="card__desc">Interpretation becomes an owned decision with a date and a verification step &mdash; and the outcome returns to the record, which improves the next interpretation.</p>
            <ul class="card__list" role="list">
              <li>Decision queue with named ownership</li>
              <li>Approval routing and thresholds</li>
              <li>Escalation on aging</li>
              <li>Outcome verification and audit trail</li>
            </ul>
          </article>
        </div>

        <hr class="divider" />

        <div class="split">
          <div>
            <div class="section-header section-header--left">
              <span class="section-label">Honest Status</span>
              <h2 class="section-title">What Is Available Today</h2>
            </div>
            <div class="prose prose--wide">
              <p>Nexus is under active development by GCS. We describe its status plainly rather than implying a maturity it has not reached.</p>
              <p><strong>Available in engagements today.</strong> Asset register construction, condition and criticality assessment methodology, capital planning models, compliance obligation registers, executive dashboards and reporting, and the operating cadence that keeps them current. These are delivered as configured work product within a GCS engagement.</p>
              <p><strong>In active development.</strong> The integrated platform experience shown in the demonstration above &mdash; unified navigation, live cross-module linkage, the action center with routed approvals, and self-service configuration.</p>
              <p><strong>Planned.</strong> Broader third-party system integration, expanded spatial analysis in Map Intelligence, and deeper Genesis agent participation in routine operational workflows.</p>
              <p>If you are evaluating Nexus for a near-term need, the productive conversation is about what GCS can deliver in an engagement now &mdash; not about a roadmap. We will be specific about that distinction.</p>
            </div>
          </div>
          <aside>
            <div class="card card--flat">
              <span class="card__eyebrow">Demonstration Notes</span>
              <h3 class="card__title">About the demo above</h3>
              <ul class="card__list" role="list">
                <li>All figures, names, IDs, and records are invented for demonstration.</li>
                <li>The interface runs entirely in your browser. No data is loaded from or sent to a server.</li>
                <li>Approval buttons record a local, in-page result only &mdash; nothing is transmitted or stored.</li>
                <li>Tab views, charts, and tables reflect the structure of a configured deployment, not a live system.</li>
                <li>A guided walkthrough with a person is available on request, including an accessible narrated version.</li>
              </ul>
              <a href="%srequest-demo/" class="btn btn--primary btn--sm" style="margin-top:1.25rem">Request a Guided Demo</a>
            </div>
          </aside>
        </div>
      </div>
    </section>

%s""" % (
    icon("layers"), icon("target"), icon("shield"), icon("compass"),
    S.demo_banner(
        "This console is a demonstration. Every organization, project, asset, dollar figure, name, and status shown "
        "below is invented to illustrate how Nexus is structured. Nothing here is a real client's data, and no figure "
        "represents a measured or promised outcome."
    ),
    tab_buttons,
    tab_panels,
    notifications,
    P,
    S.cta_band(
        P,
        "See Nexus against your own operation",
        "A guided demonstration uses your asset classes, your departments, and your actual constraints — which is considerably more useful than a generic tour.",
    ),
)

S.write(
    "nexus/",
    "Nexus Platform | Enterprise Operations Intelligence Demonstration — GCS",
    "Explore an interactive demonstration of the Nexus Enterprise Intelligence Platform: executive dashboards, projects, assets, work orders, budgets, action center, and risk register. All data is illustrative.",
    nexus_body,
    active="nexus",
)

print("nexus written")

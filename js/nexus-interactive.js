/**
 * nexus-interactive.js
 * GCS Nexus — Full interactive demo experience
 * KPI drill-downs, filters, action workflows, Ask Nexus Q&A
 * All data is synthetic. No real organizations or individuals represented.
 */
(function () {
  'use strict';

  /* ============================================================
     SYNTHETIC DEMO DATA — KPI DRILL-DOWNS
     ============================================================ */

  var KPI_DETAILS = {
    // Executive
    'budget-util': {
      title: 'Budget Utilization — 73.2%',
      summary: 'Overall budget utilization is on track. Facilities is the only department trending above the annual threshold.',
      nexusAnalysis: 'Budget pacing is healthy across 8 of 11 departments. Facilities spending at 88% with 3 months remaining requires a variance review. Proactive reforecast recommended.',
      recommendedAction: 'Schedule Facilities budget review with department director. Confirm no emergency spend is pending. Approve minor reallocation if needed.',
      estimatedSavings: '$42,000 potential reallocation from underspend in HR and Technology budgets.',
      records: [
        { label: 'Operations', value: '71% used', status: 'ok' },
        { label: 'Facilities', value: '88% used', status: 'warn' },
        { label: 'HR & Workforce', value: '64% used', status: 'ok' },
        { label: 'Capital Projects', value: '55% used', status: 'ok' },
        { label: 'Technology', value: '69% used', status: 'ok' },
        { label: 'Safety & Risk', value: '72% used', status: 'ok' }
      ],
      trend: 'Monthly spend consistent. Slight increase in Aug–Oct due to capital project milestones.'
    },
    'open-wo': {
      title: 'Open Work Orders — 142',
      summary: '142 work orders open organization-wide. 18 are past due and require immediate action.',
      nexusAnalysis: 'Work order backlog is 27% above seasonal average. Past-due items are concentrated in Facilities (11) and Fleet (7). Both queues spiked in September after planned PM deferrals.',
      recommendedAction: 'Dispatch Facilities crew to address 3 critical items. Schedule Fleet review with maintenance supervisor. Consider temporary contracted support for backlog clearance.',
      estimatedSavings: 'Resolving overdue PMs prevents estimated $28,000 in unplanned emergency repair costs.',
      records: [
        { label: 'Facilities — past due', value: '11 items', status: 'warn' },
        { label: 'Fleet — past due', value: '7 items', status: 'warn' },
        { label: 'IT — open', value: '14 items', status: 'ok' },
        { label: 'Safety — open', value: '8 items', status: 'ok' },
        { label: 'Operations — open', value: '102 items', status: 'ok' }
      ],
      trend: 'Backlog grew 18% over 60 days. Seasonal maintenance surge expected through December.'
    },
    'wf-cap': {
      title: 'Workforce Capacity — 87%',
      summary: 'Workforce capacity is within healthy range. 9 critical open positions are creating localized pressure.',
      nexusAnalysis: 'Operations and Facilities departments are running at 94–97% capacity due to vacancies. Current backfill timeline is 45–60 days for critical roles. Risk of overtime cost increase in Q4.',
      recommendedAction: 'Expedite hiring process for 3 highest-priority open roles. Consider temporary staffing for Facilities crew shortage. Review overtime tracking by department.',
      estimatedSavings: 'Filling 3 critical roles avoids estimated $18,000/month in overtime premiums.',
      records: [
        { label: 'Operations Dept', value: '97% capacity', status: 'warn' },
        { label: 'Facilities Dept', value: '94% capacity', status: 'warn' },
        { label: 'HR & Admin', value: '82% capacity', status: 'ok' },
        { label: 'Finance', value: '79% capacity', status: 'ok' },
        { label: 'Safety', value: '88% capacity', status: 'ok' }
      ],
      trend: 'Capacity has tightened 6% since August due to two retirements and one medical leave.'
    },
    'risk-open': {
      title: 'Open Risk Items — 31',
      summary: '31 risk items open. 4 rated HIGH priority. Infrastructure failure risk requires executive attention.',
      nexusAnalysis: 'Two HIGH-rated risks have been open for 30+ days without mitigation action: water main condition and data privacy compliance. Both require named owner assignment and formal mitigation plan.',
      recommendedAction: 'Assign water main risk to Public Works Director with 30-day action plan. Assign data privacy gap to IT Director. Schedule risk review committee meeting before year-end.',
      estimatedSavings: 'Proactive water main repair ($180K) avoids estimated $1.2M emergency response and service disruption cost.',
      records: [
        { label: 'Infrastructure failure — Water main', value: 'HIGH', status: 'warn' },
        { label: 'Data privacy compliance gap', value: 'HIGH', status: 'warn' },
        { label: 'Vendor single-source risk', value: 'MEDIUM', status: 'info' },
        { label: 'Budget variance — Facilities', value: 'MONITORING', status: 'ok' },
        { label: 'Cybersecurity training gap', value: 'IN PROGRESS', status: 'ok' }
      ],
      trend: 'Risk count has been stable. 4 items resolved last month. 2 new items added this month.'
    },
    // Finance
    'fin-budget': {
      title: 'Total Budget — $48.2M',
      summary: 'Full-year approved budget. Capital and operating appropriations confirmed.',
      nexusAnalysis: 'Budget is approved and allocated. Facilities and Operations account for 61% of total spend. Three capital line items remain subject to grant funding confirmation.',
      recommendedAction: 'Confirm grant award status for 3 capital items by December 1 to avoid budget reversion.',
      estimatedSavings: 'Confirmed grant funding locks in $2.1M of currently contingent capital spend.',
      records: [
        { label: 'Operating Budget', value: '$36.8M', status: 'ok' },
        { label: 'Capital Budget', value: '$8.4M', status: 'ok' },
        { label: 'Grant-Funded Items', value: '$3.0M', status: 'info' }
      ],
      trend: 'Budget growth: 4.1% over prior year, in line with approved plan.'
    },
    'fin-spent': {
      title: 'Spent YTD — $35.3M (73.2%)',
      summary: 'Expenditures are on track. Pace is consistent with prior year through October.',
      nexusAnalysis: 'Spending pace is healthy. Facilities trending above rate-of-year due to emergency HVAC repair in July. All other departments within ±5% of plan.',
      recommendedAction: 'Monitor Facilities closely through December. Flag any spend above $100K for CFO review.',
      estimatedSavings: null,
      records: [
        { label: 'Operations', value: '$8.4M', status: 'ok' },
        { label: 'Facilities', value: '$7.1M (88%)', status: 'warn' },
        { label: 'Capital Projects', value: '$4.6M', status: 'ok' },
        { label: 'HR & Workforce', value: '$5.2M', status: 'ok' },
        { label: 'Technology', value: '$3.1M', status: 'ok' }
      ],
      trend: 'Flat spend January–March. Uptick in July (facilities). Stable September–October.'
    },
    'fin-revenue': {
      title: 'Revenue Collected — $41.8M',
      summary: 'Revenue is 6.4% above prior year. Collections ahead of pace.',
      nexusAnalysis: 'Revenue performance is strong across all major sources. Property tax and service fee collections are outperforming. Grant reimbursements are 3 weeks behind schedule but no loss anticipated.',
      recommendedAction: 'Follow up on 3 pending grant reimbursements totaling $620K. Confirm Q4 collections timeline.',
      estimatedSavings: null,
      records: [
        { label: 'Tax Revenue', value: '$28.4M', status: 'ok' },
        { label: 'Service Fees', value: '$7.2M', status: 'ok' },
        { label: 'Grant Reimbursements', value: '$4.1M', status: 'info' },
        { label: 'Miscellaneous', value: '$2.1M', status: 'ok' }
      ],
      trend: 'Revenue 6.4% above prior year. On track to exceed annual projection by ~$800K.'
    },
    'fin-ap': {
      title: 'AP Outstanding — $2.1M',
      summary: '14 invoices over 30 days. Two vendors have flagged payment timing.',
      nexusAnalysis: 'AP aging is within acceptable range, but two strategic vendors have outstanding invoices over 45 days. Delayed payment may affect contract renewal negotiations in Q1.',
      recommendedAction: 'Process the two vendor invoices over 45 days immediately. Review AP approval workflow for recurring delays.',
      estimatedSavings: 'Timely payment maintains preferred vendor pricing — estimated $14,000 annual discount at risk.',
      records: [
        { label: 'Current (0–30 days)', value: '$1.4M', status: 'ok' },
        { label: 'Overdue (31–45 days)', value: '$420K — 8 invoices', status: 'info' },
        { label: 'Overdue (45+ days)', value: '$280K — 6 invoices', status: 'warn' }
      ],
      trend: 'AP aging has worsened slightly in October. Approval queue backed up 3 days above normal.'
    },
    // HR
    'hr-headcount': {
      title: 'Total Headcount — 384',
      summary: 'Organization grew by 12 employees since last quarter through new hires.',
      nexusAnalysis: 'Headcount growth is aligned with approved hiring plan. Operations added 8 positions ahead of service expansion. Finance added 2 analysts. Succession planning coverage remains below target for 3 senior roles.',
      recommendedAction: 'Complete succession plan documentation for 3 uncovered senior roles before year-end.',
      estimatedSavings: null,
      records: [
        { label: 'Operations', value: '124 FTE', status: 'ok' },
        { label: 'Facilities & Maintenance', value: '68 FTE', status: 'ok' },
        { label: 'Administrative & Finance', value: '54 FTE', status: 'ok' },
        { label: 'Safety & Risk', value: '28 FTE', status: 'ok' },
        { label: 'Other Departments', value: '110 FTE', status: 'ok' }
      ],
      trend: 'Net +12 this quarter. Turnover rate 8.4%, below 10% benchmark.'
    },
    'hr-openpos': {
      title: 'Open Positions — 27',
      summary: '27 open positions. 9 designated critical. Average time-to-fill at 52 days.',
      nexusAnalysis: 'Critical open roles are concentrated in Operations (4) and Facilities (3). Two positions have been open 90+ days with no viable candidates. Temporary staffing may be needed to maintain service levels.',
      recommendedAction: 'Expand candidate sourcing for 2 roles open 90+ days. Evaluate temp-to-hire option for Facilities crew role.',
      estimatedSavings: 'Filling 5 critical roles reduces overtime exposure by estimated $22,000/month.',
      records: [
        { label: 'Operations — Critical', value: '4 open', status: 'warn' },
        { label: 'Facilities — Critical', value: '3 open', status: 'warn' },
        { label: 'Finance — Critical', value: '2 open', status: 'info' },
        { label: 'Other Departments', value: '18 open', status: 'ok' }
      ],
      trend: 'Open position count stable. Fill rate has slowed since August due to competitive labor market.'
    },
    // Safety
    'safety-incidents': {
      title: 'Incidents YTD — 7',
      summary: '7 recordable incidents year-to-date. Down from 12 in prior year — a 42% reduction.',
      nexusAnalysis: 'Incident reduction is significant and attributable to enhanced PPE training and updated SOP rollout in Q1. Three incidents involved temporary workers. Safety onboarding for temps should be reviewed.',
      recommendedAction: 'Review temp worker safety onboarding procedures. Recognize safety improvement with department team.',
      estimatedSavings: 'Incident reduction saves estimated $85,000 in workers comp and investigation costs versus prior year.',
      records: [
        { label: 'Recordable — Temporary workers', value: '3 incidents', status: 'warn' },
        { label: 'Recordable — Full-time staff', value: '4 incidents', status: 'info' },
        { label: 'Resolved / Closed', value: '7 of 7', status: 'ok' }
      ],
      trend: 'Steady downward trend over 12 months. No incidents in October.'
    },
    'safety-nearmiss': {
      title: 'Near Misses — 14',
      summary: '14 near miss reports. 3 remain unresolved. Near misses are leading indicators of future incidents.',
      nexusAnalysis: 'Unresolved near misses in Building 3 share a common root cause: floor condition during shift change. Corrective action has been identified but not yet scheduled.',
      recommendedAction: 'Assign corrective action for Building 3 floor condition to Facilities within 5 business days.',
      estimatedSavings: 'Addressing root cause prevents estimated $40,000 in potential incident costs.',
      records: [
        { label: 'Slip/Trip — Building 3', value: 'OPEN', status: 'warn' },
        { label: 'Equipment guard failure', value: 'OPEN', status: 'warn' },
        { label: 'Forklift proximity — Dock 2', value: 'OPEN', status: 'warn' },
        { label: 'Resolved near misses', value: '11 of 14', status: 'ok' }
      ],
      trend: 'Near miss reporting has increased — a positive sign that safety culture is improving.'
    },
    // Facilities
    'fac-total': {
      title: 'Total Facilities — 23',
      summary: '23 buildings managed. Condition scores range from 28 (critical) to 92 (excellent).',
      nexusAnalysis: 'Three buildings scored below 40/100 — the threshold for emergency capital consideration. All three have been in the capital plan for 2+ years with funding deferred.',
      recommendedAction: 'Advance Building 4 roof replacement to FY capital priority. Schedule structural assessments for Buildings 8 and 12.',
      estimatedSavings: 'Early intervention on Building 4 avoids projected $340,000 in emergency repair costs if deferred past spring.',
      records: [
        { label: 'Condition 80–100 (Good)', value: '8 buildings', status: 'ok' },
        { label: 'Condition 50–79 (Fair)', value: '12 buildings', status: 'info' },
        { label: 'Condition below 50 (Poor)', value: '3 buildings', status: 'warn' }
      ],
      trend: 'Average condition score declined 3 points YoY. Capital investment needed to halt deterioration.'
    },
    'fac-wo': {
      title: 'Work Orders Open — 142',
      summary: '142 work orders open. 18 past due. Backlog is 27% above seasonal average.',
      nexusAnalysis: 'Past-due work orders are concentrated in three buildings — 4, 11, and the Admin Complex. Shared root cause: two vacancies in Facilities crew created in September.',
      recommendedAction: 'Authorize temporary crew augmentation for 60 days to clear backlog. Post Facilities crew positions immediately.',
      estimatedSavings: 'Clearing backlog prevents $28,000 in deferred maintenance cost escalation.',
      records: [
        { label: 'Building 4 — past due', value: '7 orders', status: 'warn' },
        { label: 'Building 11 — past due', value: '6 orders', status: 'warn' },
        { label: 'Admin Complex', value: '5 orders', status: 'warn' },
        { label: 'All other buildings', value: '124 orders', status: 'ok' }
      ],
      trend: 'Backlog grew 18% over 60 days following crew vacancy.'
    },
    // Fleet
    'fleet-units': {
      title: 'Fleet Units — 87',
      summary: '87 vehicles and equipment units. Average age 7.4 years, above the 6-year replacement threshold.',
      nexusAnalysis: 'Fleet age profile is above recommended threshold. 5 units have maintenance costs exceeding 3× the standard cost per unit — a clear replacement signal. Lease vs. purchase analysis is recommended.',
      recommendedAction: 'Initiate replacement planning for 5 highest-cost units. Complete lease-vs-purchase analysis by Q1.',
      estimatedSavings: 'Replacing 5 high-cost units saves estimated $94,000/year in excess maintenance spend.',
      records: [
        { label: 'Light Vehicles', value: '34 units', status: 'ok' },
        { label: 'Heavy Equipment', value: '22 units', status: 'info' },
        { label: 'Specialty Vehicles', value: '18 units', status: 'ok' },
        { label: 'Past replacement threshold', value: '5 units', status: 'warn' }
      ],
      trend: 'Fleet age has increased 0.8 years since last year. Replacement budget is below need.'
    },
    'fleet-serviceable': {
      title: 'Units Serviceable — 79',
      summary: '79 of 87 units available. 8 units in maintenance — above typical operational reserve.',
      nexusAnalysis: '6 of 8 down units have exceeded their scheduled return date. Unit A-14 has been in repair 18 days due to parts availability. Operational coverage is adequate but thin for peak service periods.',
      recommendedAction: 'Expedite parts order for Unit A-14. Review vendor SLA for maintenance turnaround times.',
      estimatedSavings: null,
      records: [
        { label: 'Unit A-14 — Overdue repair', value: '18 days', status: 'warn' },
        { label: 'Unit B-07 — Inspection failed', value: 'Awaiting repair', status: 'warn' },
        { label: 'Other units in maintenance', value: '6 units', status: 'info' }
      ],
      trend: 'Availability has dropped 4% over 30 days. Parts supply chain delays are the primary cause.'
    },
    // Projects
    'proj-active': {
      title: 'Active Projects — 24',
      summary: '24 capital and operational projects. 75% on schedule. 4 require attention.',
      nexusAnalysis: 'Two projects are delayed due to permit review delays outside organizational control. Two others are delayed due to contractor performance and scope changes. Recovery plans are in place for all four.',
      recommendedAction: 'Escalate contractor performance issue on Community Center project. Schedule recovery plan review with PM team.',
      estimatedSavings: null,
      records: [
        { label: 'On schedule', value: '18 projects', status: 'ok' },
        { label: 'Behind — permit/external', value: '2 projects', status: 'info' },
        { label: 'Behind — contractor/scope', value: '2 projects', status: 'warn' },
        { label: 'Completed YTD', value: '6 projects', status: 'ok' }
      ],
      trend: 'Schedule performance has been stable. Q4 is historically a milestone-heavy period.'
    },
    // Procurement
    'proc-pos': {
      title: 'Active POs — 68',
      summary: '68 open purchase orders. Processing time averaging 24 days, within target.',
      nexusAnalysis: 'PO volume is within normal range. 3 POs are awaiting department director approval for 7+ days — this is causing delivery timeline risk.',
      recommendedAction: 'Follow up with department directors on 3 pending approvals. Review approval delegation policy.',
      estimatedSavings: null,
      records: [
        { label: 'Pending approval (7+ days)', value: '3 POs', status: 'warn' },
        { label: 'In processing', value: '24 POs', status: 'ok' },
        { label: 'Awaiting delivery', value: '41 POs', status: 'ok' }
      ],
      trend: 'PO volume up 12% YoY reflecting capital project activity.'
    },
    'proc-spend': {
      title: 'Spend YTD — $8.7M',
      summary: 'Procurement spend is within approved budget. Contract savings of $204K realized YTD.',
      nexusAnalysis: 'Spend is well managed. Competitive bidding on janitorial and fleet parts contracts produced $204K in savings. Fuel contract renewal is the largest upcoming negotiation — $380K/year.',
      recommendedAction: 'Prepare fuel contract negotiation strategy. Research market rates. Engage 2 competing vendors before renewal window closes.',
      estimatedSavings: '$38,000–$57,000 projected savings on fuel contract if market benchmarking yields 10–15% reduction.',
      records: [
        { label: 'Facilities & Maintenance', value: '$2.8M', status: 'ok' },
        { label: 'Fleet Parts & Fuel', value: '$2.1M', status: 'ok' },
        { label: 'Technology & Equipment', value: '$1.6M', status: 'ok' },
        { label: 'Professional Services', value: '$1.4M', status: 'ok' },
        { label: 'Other', value: '$0.8M', status: 'ok' }
      ],
      trend: 'Spend pacing is consistent with budget. Fuel category is 8% above prior year.'
    }
  };

  /* ============================================================
     SYNTHETIC DEMO DATA — ASK NEXUS Q&A
     ============================================================ */

  var NEXUS_QA = [
    {
      q: "What needs my attention today?",
      a: "Three items require immediate action:\n\n1. **Building 4 roof** — condition score 28/100, emergency capital needed before winter. Estimated cost: $180K.\n\n2. **Unit A-14 (Fleet)** — in repair 18 days, parts delayed. Operational coverage is thin. Expedite parts order.\n\n3. **AP invoices 45+ days** — 6 invoices totaling $280K are at risk of affecting vendor relationships. Process before end of week.",
      category: 'priority'
    },
    {
      q: "Where are we overspending?",
      a: "Facilities is the only department trending above budget — currently at 88% of annual budget with 3 months remaining. The July emergency HVAC repair added $42K above plan. If current pace continues, Facilities will exceed budget by approximately $38,000. A reforecast and variance review is recommended this week.\n\nAll other departments are within ±5% of plan.",
      category: 'finance'
    },
    {
      q: "Which facilities have the greatest risk?",
      a: "Three facilities are rated critical:\n\n- **Building 4** — roof condition 28/100. Failure risk HIGH. Emergency capital needed.\n- **Building 11** — HVAC system aged 24 years. Replacement lead time 16 weeks. Funding partially identified.\n- **Admin Complex** — ADA compliance review pending. Liability risk if unaddressed before year-end audit.\n\nAll three are in the capital plan. Building 4 should be elevated to emergency status.",
      category: 'risk'
    },
    {
      q: "What work orders are overdue?",
      a: "18 work orders are past due organization-wide:\n\n- **Facilities — 11 overdue**: 7 in Building 4, 4 in Building 11\n- **Fleet — 7 overdue**: Unit A-14 (18 days), Unit B-07 (12 days), 5 others\n\nRoot cause: 2 Facilities crew vacancies since September are causing backlog growth. Temporary crew augmentation would clear the backlog in approximately 3 weeks.",
      category: 'operations'
    },
    {
      q: "What can we save this quarter?",
      a: "Nexus has identified four savings opportunities totaling an estimated **$192,000** this quarter:\n\n1. **Fuel contract renegotiation** — $38–57K savings potential\n2. **Clearing PM backlog** — prevents $28K in escalating repair costs\n3. **Filling 3 critical open positions** — avoids $18K/month overtime\n4. **AP discount preservation** — $14K in at-risk vendor discounts\n\nThe largest single opportunity is advancing the fleet replacement plan for 5 high-cost units — projected to save $94,000 annually.",
      category: 'finance'
    },
    {
      q: "Which projects are falling behind?",
      a: "Four of 24 active projects are behind schedule:\n\n- **Community Center Renovation** — DELAYED. Contractor performance issue. Recovery plan in place but requires escalation.\n- **Park District Improvements** — OVER BUDGET. $84K variance due to soil remediation not in original scope.\n- **Technology Infrastructure** — ON TRACK (minor permit delay, no schedule impact expected).\n- **Water Main Phase 2** — ON TRACK but monitoring permit timeline closely.\n\nRecommendation: Escalate Community Center contractor issue to executive leadership this week.",
      category: 'projects'
    },
    {
      q: "What changed this week?",
      a: "Key changes this week:\n\n- Unit A-14 repair extended 5 additional days due to parts delay. Fleet availability dropped to 79/87.\n- AP queue backed up — 6 invoices now 45+ days overdue (up from 3 last week).\n- Building 4 roof assessment completed. Score confirmed at 28/100 — lower than estimated. Emergency capital request should be filed immediately.\n- HR: 2 new candidates identified for the Operations crew role open since August.\n- Safety: No new incidents. Near miss report submitted for Building 3 floor condition.",
      category: 'updates'
    }
  ];

  /* ============================================================
     ACTION WORKFLOW SYSTEM
     ============================================================ */

  var ACTION_RESPONSES = {
    'investigate': function (context) {
      return {
        title: 'Investigation Opened',
        steps: [
          { icon: '🔍', text: 'Nexus has logged an investigation record for: <strong>' + context + '</strong>' },
          { icon: '📋', text: 'Work history and related records retrieved — 14 connected items found.' },
          { icon: '📊', text: 'Nexus analysis: Root cause is likely deferred maintenance from prior 18-month period. Contributing factor: parts procurement delay.' },
          { icon: '✅', text: 'Recommended action: Assign corrective action to Facilities Director. Target resolution: 14 days.' }
        ],
        nextActions: ['assign', 'create-wo', 'ask-nexus']
      };
    },
    'assign': function (context) {
      return {
        title: 'Action Assigned',
        steps: [
          { icon: '👤', text: 'Action assigned to: <strong>Department Director</strong>' },
          { icon: '📅', text: 'Due date set: <strong>14 days from today</strong>' },
          { icon: '🔔', text: 'Notification sent. Director has been alerted.' },
          { icon: '📈', text: 'Item status updated to: <strong>IN PROGRESS</strong>. Dashboard will reflect this change.' }
        ],
        nextActions: ['create-wo', 'escalate']
      };
    },
    'create-wo': function (context) {
      var woNum = 'WO-' + (Math.floor(Math.random() * 9000) + 1000);
      return {
        title: 'Work Order Created',
        steps: [
          { icon: '📝', text: 'Work order <strong>' + woNum + '</strong> created for: <strong>' + context + '</strong>' },
          { icon: '👷', text: 'Assigned to: Facilities Maintenance Team' },
          { icon: '📅', text: 'Scheduled: Next available slot — within 3 business days' },
          { icon: '✅', text: 'Work order is now active. View in Facilities dashboard.' }
        ],
        nextActions: ['assign', 'escalate']
      };
    },
    'escalate': function (context) {
      return {
        title: 'Escalated to Leadership',
        steps: [
          { icon: '⚠️', text: 'Issue escalated: <strong>' + context + '</strong>' },
          { icon: '👥', text: 'Escalation sent to: Executive Director and Department Head' },
          { icon: '📋', text: 'Nexus has generated an executive summary with context, history, and recommended response.' },
          { icon: '🔴', text: 'Priority level updated to: <strong>HIGH</strong>. Visible on Executive dashboard.' }
        ],
        nextActions: ['assign', 'create-wo']
      };
    },
    'resolve': function (context) {
      return {
        title: 'Marked Resolved',
        steps: [
          { icon: '✅', text: 'Item resolved: <strong>' + context + '</strong>' },
          { icon: '📝', text: 'Resolution notes saved. Documentation complete.' },
          { icon: '📊', text: 'Dashboard updated. Item removed from active alerts.' },
          { icon: '📅', text: 'Closure date recorded. Available in audit history.' }
        ],
        nextActions: []
      };
    },
    'approve': function (context) {
      return {
        title: 'Approved',
        steps: [
          { icon: '✅', text: 'Approval recorded for: <strong>' + context + '</strong>' },
          { icon: '📧', text: 'Confirmation sent to requestor and relevant team members.' },
          { icon: '🔄', text: 'Workflow advanced to next step automatically.' },
          { icon: '📊', text: 'Status updated in dashboard. Audit trail recorded.' }
        ],
        nextActions: []
      };
    },
    'generate-report': function (context) {
      return {
        title: 'Report Generated',
        steps: [
          { icon: '📊', text: 'Nexus has compiled a report for: <strong>' + context + '</strong>' },
          { icon: '📄', text: 'Report includes: current status, trend data, risk assessment, and recommended actions.' },
          { icon: '✉️', text: 'Report ready for review and distribution. (In the live platform, this would download as PDF.)' },
          { icon: '📅', text: 'Report archived with timestamp for audit purposes.' }
        ],
        nextActions: []
      };
    }
  };

  /* ============================================================
     FILTER SYSTEM
     ============================================================ */

  var activeFilters = {
    status: 'all',
    priority: 'all'
  };

  function applyFilters() {
    var rows = document.querySelectorAll('.dash-list__row, .dash-expand-row');
    rows.forEach(function (row) {
      var badge = row.querySelector('.dash-badge');
      var show = true;

      if (activeFilters.status !== 'all' && badge) {
        var text = badge.textContent.toLowerCase();
        if (activeFilters.status === 'critical' && !text.includes('critical') && !text.includes('warn') && !text.includes('overdue') && !text.includes('failed') && !text.includes('high')) {
          show = false;
        }
        if (activeFilters.status === 'pending' && !text.includes('pending') && !text.includes('scheduled') && !text.includes('in progress') && !text.includes('review') && !text.includes('upcoming') && !text.includes('due')) {
          show = false;
        }
        if (activeFilters.status === 'ok' && !text.includes('ok') && !text.includes('on track') && !text.includes('complete') && !text.includes('filed') && !text.includes('ready') && !text.includes('good') && !text.includes('submitted')) {
          show = false;
        }
      }

      row.style.display = show ? '' : 'none';
    });
    updateFilterCount();
  }

  function updateFilterCount() {
    var countEl = document.getElementById('nx-filter-count');
    if (!countEl) return;
    var hidden = document.querySelectorAll('.dash-list__row[style*="none"], .dash-expand-row[style*="none"]').length;
    var total = document.querySelectorAll('.dash-list__row, .dash-expand-row').length;
    if (hidden > 0) {
      countEl.textContent = 'Showing ' + (total - hidden) + ' of ' + total + ' items';
    } else {
      countEl.textContent = 'Showing all items';
    }
  }

  function resetFilters() {
    activeFilters.status = 'all';
    activeFilters.priority = 'all';
    document.querySelectorAll('.nx-filter-btn').forEach(function (b) {
      b.classList.toggle('active', b.getAttribute('data-filter-val') === 'all');
    });
    applyFilters();
  }

  /* ============================================================
     DRAWER SYSTEM
     ============================================================ */

  var drawerEl = null;
  var drawerOverlayEl = null;

  function createDrawer() {
    if (drawerEl) return;

    drawerOverlayEl = document.createElement('div');
    drawerOverlayEl.className = 'nx-drawer-overlay';
    drawerOverlayEl.setAttribute('aria-hidden', 'true');
    document.body.appendChild(drawerOverlayEl);

    drawerEl = document.createElement('div');
    drawerEl.className = 'nx-drawer';
    drawerEl.setAttribute('role', 'dialog');
    drawerEl.setAttribute('aria-modal', 'true');
    drawerEl.setAttribute('aria-labelledby', 'nx-drawer-title');
    drawerEl.setAttribute('tabindex', '-1');
    drawerEl.innerHTML = [
      '<div class="nx-drawer__handle" aria-hidden="true"></div>',
      '<div class="nx-drawer__header">',
      '  <div>',
      '    <div class="nx-drawer__badge">SYNTHETIC DEMO DATA</div>',
      '    <h2 class="nx-drawer__title" id="nx-drawer-title"></h2>',
      '  </div>',
      '  <button type="button" class="nx-drawer__close" aria-label="Close detail panel">&times;</button>',
      '</div>',
      '<div class="nx-drawer__body"></div>'
    ].join('');
    document.body.appendChild(drawerEl);

    drawerEl.querySelector('.nx-drawer__close').addEventListener('click', closeDrawer);
    drawerOverlayEl.addEventListener('click', closeDrawer);
    drawerEl.addEventListener('keydown', function (e) {
      if (e.key === 'Escape') closeDrawer();
    });

    // Touch swipe down to close
    var startY = 0;
    drawerEl.addEventListener('touchstart', function (e) { startY = e.touches[0].clientY; }, { passive: true });
    drawerEl.addEventListener('touchend', function (e) {
      var dy = e.changedTouches[0].clientY - startY;
      if (dy > 80) closeDrawer();
    }, { passive: true });
  }

  function openDrawer(titleText, bodyHTML) {
    createDrawer();
    drawerEl.querySelector('.nx-drawer__title').textContent = titleText;
    drawerEl.querySelector('.nx-drawer__body').innerHTML = bodyHTML;
    drawerOverlayEl.classList.add('active');
    drawerEl.classList.add('open');
    drawerEl.focus();
    document.body.classList.add('nx-drawer-open');
  }

  function closeDrawer() {
    if (!drawerEl) return;
    drawerEl.classList.remove('open');
    drawerOverlayEl.classList.remove('active');
    document.body.classList.remove('nx-drawer-open');
  }

  /* ============================================================
     KPI DRILL-DOWN RENDERER
     ============================================================ */

  function renderKpiDetail(key) {
    var data = KPI_DETAILS[key];
    if (!data) return;

    var recordsHTML = '';
    if (data.records && data.records.length) {
      recordsHTML = '<div class="nx-detail-records"><div class="nx-detail-section-title">Supporting Records</div>';
      data.records.forEach(function (r) {
        recordsHTML += '<div class="nx-detail-row"><span>' + r.label + '</span><span class="dash-badge dash-badge--' + r.status + '">' + r.value + '</span></div>';
      });
      recordsHTML += '</div>';
    }

    var trendHTML = data.trend ? '<div class="nx-detail-block nx-detail-block--trend"><div class="nx-detail-section-title">Trend</div><p>' + data.trend + '</p></div>' : '';

    var savingsHTML = data.estimatedSavings ? '<div class="nx-detail-block nx-detail-block--savings"><div class="nx-detail-section-title">💰 Estimated Savings Opportunity</div><p>' + data.estimatedSavings + '</p></div>' : '';

    var html = [
      '<div class="nx-detail-summary"><p>' + data.summary + '</p></div>',
      '<div class="nx-detail-block nx-detail-block--nexus">',
      '  <div class="nx-detail-section-title">🤖 Nexus Analysis</div>',
      '  <p>' + data.nexusAnalysis + '</p>',
      '</div>',
      recordsHTML,
      trendHTML,
      savingsHTML,
      data.recommendedAction ? '<div class="nx-detail-block nx-detail-block--action"><div class="nx-detail-section-title">✅ Recommended Action</div><p>' + data.recommendedAction + '</p></div>' : '',
      '<div class="nx-detail-actions">',
      '  <button type="button" class="nx-action-btn" data-action="investigate" data-context="' + escapeAttr(data.title) + '">🔍 Investigate</button>',
      '  <button type="button" class="nx-action-btn nx-action-btn--primary" data-action="assign" data-context="' + escapeAttr(data.title) + '">👤 Assign Action</button>',
      '  <button type="button" class="nx-action-btn" data-action="generate-report" data-context="' + escapeAttr(data.title) + '">📊 Generate Report</button>',
      '</div>'
    ].join('');

    openDrawer(data.title, html);
    wireActionButtons(drawerEl.querySelector('.nx-drawer__body'));
  }

  function escapeAttr(str) {
    return String(str).replace(/"/g, '&quot;').replace(/'/g, '&#39;');
  }

  /* ============================================================
     ACTION WORKFLOW RENDERER
     ============================================================ */

  function renderActionResult(action, context) {
    var fn = ACTION_RESPONSES[action];
    if (!fn) return;
    var result = fn(context || 'Selected item');

    var stepsHTML = result.steps.map(function (s) {
      return '<div class="nx-action-step"><span class="nx-action-step__icon" aria-hidden="true">' + s.icon + '</span><span>' + s.text + '</span></div>';
    }).join('');

    var nextHTML = '';
    if (result.nextActions && result.nextActions.length) {
      nextHTML = '<div class="nx-action-next"><div class="nx-detail-section-title">Next Steps</div><div class="nx-detail-actions">';
      result.nextActions.forEach(function (a) {
        var labels = { assign: '👤 Assign', 'create-wo': '📝 Create Work Order', escalate: '⚠️ Escalate', resolve: '✅ Resolve', 'ask-nexus': '🤖 Ask Nexus' };
        nextHTML += '<button type="button" class="nx-action-btn" data-action="' + a + '" data-context="' + escapeAttr(context) + '">' + (labels[a] || a) + '</button>';
      });
      nextHTML += '</div></div>';
    }

    var html = [
      '<div class="nx-action-success"><div class="nx-action-success__icon" aria-hidden="true">✓</div><div>' + result.title + '</div></div>',
      stepsHTML,
      nextHTML
    ].join('');

    openDrawer(result.title, html);
    wireActionButtons(drawerEl.querySelector('.nx-drawer__body'));

    // Update status badges in the page for visual feedback
    markItemInProgress(context);
  }

  function markItemInProgress(context) {
    // Try to find and update any matching list row
    var rows = document.querySelectorAll('.dash-list__row, .dash-expand-row');
    rows.forEach(function (row) {
      var text = row.textContent;
      if (context && text.includes(context.substring(0, 20))) {
        var badge = row.querySelector('.dash-badge');
        if (badge && !badge.classList.contains('dash-badge--ok')) {
          badge.classList.remove('dash-badge--warn', 'dash-badge--pend');
          badge.classList.add('dash-badge--ok');
          badge.textContent = 'IN PROGRESS';
        }
      }
    });
  }

  function wireActionButtons(container) {
    if (!container) return;
    container.querySelectorAll('.nx-action-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var action = btn.getAttribute('data-action');
        var ctx = btn.getAttribute('data-context') || '';
        if (action === 'ask-nexus') {
          closeDrawer();
          setTimeout(openAskNexus, 150);
        } else {
          renderActionResult(action, ctx);
        }
      });
    });
  }

  /* ============================================================
     KPI CARD CLICK SETUP
     ============================================================ */

  function setupKpiCards() {
    var kpiCards = document.querySelectorAll('.dash-kpi[data-kpi-key]');
    kpiCards.forEach(function (card) {
      card.setAttribute('role', 'button');
      card.setAttribute('tabindex', '0');
      card.style.cursor = 'pointer';
      var key = card.getAttribute('data-kpi-key');

      card.addEventListener('click', function () { renderKpiDetail(key); });
      card.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); renderKpiDetail(key); }
      });
    });
  }

  /* ============================================================
     ROW ACTION BUTTONS
     ============================================================ */

  function setupRowActions() {
    document.querySelectorAll('.nx-row-action-btn').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.stopPropagation();
        var action = btn.getAttribute('data-action');
        var ctx = btn.closest('[data-context]') ? btn.closest('[data-context]').getAttribute('data-context') : (btn.closest('.dash-list__row, .dash-expand-row') ? btn.closest('.dash-list__row, .dash-expand-row').querySelector('span:first-child')?.textContent : 'Selected item');
        renderActionResult(action, ctx || 'Selected item');
      });
    });
  }

  /* ============================================================
     ASK NEXUS PANEL
     ============================================================ */

  var askNexusEl = null;
  var askNexusOpenEl = null;

  function createAskNexusPanel() {
    askNexusEl = document.getElementById('ask-nexus-panel');
    if (!askNexusEl) return;

    var chatLog = askNexusEl.querySelector('.nx-chat-log');
    var input = askNexusEl.querySelector('.nx-chat-input');
    var sendBtn = askNexusEl.querySelector('.nx-chat-send');
    var closeBtn = askNexusEl.querySelector('.nx-chat-close');
    var suggestBtns = askNexusEl.querySelectorAll('.nx-chat-suggest');

    if (closeBtn) {
      closeBtn.addEventListener('click', function () {
        askNexusEl.classList.remove('open');
        if (askNexusOpenEl) askNexusOpenEl.setAttribute('aria-expanded', 'false');
      });
    }

    function sendQuestion(question) {
      if (!question || !question.trim()) return;

      // Add user message
      var userMsg = document.createElement('div');
      userMsg.className = 'nx-chat-msg nx-chat-msg--user';
      userMsg.textContent = question;
      chatLog.appendChild(userMsg);

      // Find answer
      var found = null;
      NEXUS_QA.forEach(function (qa) {
        if (qa.q.toLowerCase() === question.toLowerCase().trim()) {
          found = qa;
        }
      });
      if (!found) {
        // Fuzzy match
        var qLower = question.toLowerCase();
        NEXUS_QA.forEach(function (qa) {
          var words = qa.q.toLowerCase().split(/\s+/);
          var matches = words.filter(function (w) { return w.length > 4 && qLower.includes(w); });
          if (matches.length >= 2) found = qa;
        });
      }

      var answer = found ? found.a : "Nexus is analyzing your question. Based on current organizational data, I can see several relevant items across Finance, Facilities, and Operations. For the most specific analysis, try one of the suggested questions above — or ask about a specific department, project, or risk area.";

      // Show typing indicator
      var typing = document.createElement('div');
      typing.className = 'nx-chat-msg nx-chat-msg--nexus nx-chat-typing';
      typing.innerHTML = '<span class="nx-typing-dot"></span><span class="nx-typing-dot"></span><span class="nx-typing-dot"></span>';
      chatLog.appendChild(typing);
      chatLog.scrollTop = chatLog.scrollHeight;

      setTimeout(function () {
        chatLog.removeChild(typing);
        var nexusMsg = document.createElement('div');
        nexusMsg.className = 'nx-chat-msg nx-chat-msg--nexus';
        nexusMsg.innerHTML = '<span class="nx-chat-avatar">N</span><div class="nx-chat-text">' + formatAnswer(answer) + '</div>';
        chatLog.appendChild(nexusMsg);
        chatLog.scrollTop = chatLog.scrollHeight;
      }, 800);

      if (input) input.value = '';
    }

    function formatAnswer(text) {
      return text
        .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
        .replace(/\n\n/g, '</p><p>')
        .replace(/\n/g, '<br>')
        .replace(/^/, '<p>')
        .replace(/$/, '</p>');
    }

    if (sendBtn) {
      sendBtn.addEventListener('click', function () {
        if (input) sendQuestion(input.value);
      });
    }
    if (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); sendQuestion(input.value); }
      });
    }
    suggestBtns.forEach(function (btn) {
      btn.addEventListener('click', function () { sendQuestion(btn.textContent); });
    });
  }

  function openAskNexus() {
    if (!askNexusEl) return;
    askNexusEl.classList.add('open');
    var input = askNexusEl.querySelector('.nx-chat-input');
    if (input) input.focus();
    if (askNexusOpenEl) askNexusOpenEl.setAttribute('aria-expanded', 'true');
  }

  function setupAskNexusButton() {
    askNexusOpenEl = document.getElementById('ask-nexus-open');
    if (askNexusOpenEl) {
      askNexusOpenEl.addEventListener('click', openAskNexus);
    }
    // Also wire floating button if present
    var floatBtn = document.getElementById('ask-nexus-float');
    if (floatBtn) {
      floatBtn.addEventListener('click', openAskNexus);
    }
  }

  /* ============================================================
     FILTER BAR SETUP
     ============================================================ */

  function setupFilterBar() {
    document.querySelectorAll('.nx-filter-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var filterType = btn.getAttribute('data-filter-type');
        var filterVal = btn.getAttribute('data-filter-val');

        document.querySelectorAll('.nx-filter-btn[data-filter-type="' + filterType + '"]').forEach(function (b) {
          b.classList.remove('active');
        });
        btn.classList.add('active');

        activeFilters[filterType] = filterVal;
        applyFilters();
      });
    });
  }

  /* ============================================================
     INIT
     ============================================================ */

  function init() {
    setupKpiCards();
    setupRowActions();
    createAskNexusPanel();
    setupAskNexusButton();
    setupFilterBar();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

  // Export for inline use
  window.NexusInteractive = {
    openDrawer: openDrawer,
    closeDrawer: closeDrawer,
    openAskNexus: openAskNexus,
    renderKpiDetail: renderKpiDetail,
    renderActionResult: renderActionResult,
    resetFilters: resetFilters
  };

})();

/* ============================================================
   NEXUS MAP INTELLIGENCE — EMBEDDED SANDBOX MAP
   ============================================================ */
(function () {
  'use strict';

  var MAP_FEATURES = [
    { id: 'bldg-4', type: 'facility', label: 'Building 4', icon: '🏢', color: '#dc2626', x: 28, y: 35,
      detail: { name: 'Building 4 — Administration', condition: '28/100 — CRITICAL', status: 'Emergency action required', costYTD: '$42,000', risk: 'HIGH', nexus: 'Roof condition critical. Emergency capital request should be filed this week. Lead time for replacement: 6–8 weeks. Delay risks structural damage before spring.' },
      kpis: [{ val: '28/100', lbl: 'Condition' }, { val: '$180K', lbl: 'Est. Repair' }, { val: '31 yrs', lbl: 'Roof Age' }, { val: 'HIGH', lbl: 'Risk Level' }]
    },
    { id: 'bldg-11', type: 'facility', label: 'Building 11', icon: '🏭', color: '#d97706', x: 55, y: 22,
      detail: { name: 'Building 11 — Operations Center', condition: '38/100 — HIGH RISK', status: 'HVAC replacement needed', costYTD: '$28,000', risk: 'HIGH', nexus: 'HVAC system is 24 years old with a condition score of 38/100. Replacement lead time is 16 weeks. Partial funding available from infrastructure grant. Design scope needed before Q1.' },
      kpis: [{ val: '38/100', lbl: 'Condition' }, { val: '$280K', lbl: 'HVAC Repl.' }, { val: '24 yrs', lbl: 'System Age' }, { val: 'HIGH', lbl: 'Risk Level' }]
    },
    { id: 'bldg-main', type: 'facility', label: 'Main Campus', icon: '🏛️', color: '#16a34a', x: 42, y: 55,
      detail: { name: 'Main Campus Complex', condition: '84/100 — Good', status: 'Routine maintenance only', costYTD: '$12,400', risk: 'LOW', nexus: 'Main campus is in good condition. Two minor work orders are open — standard HVAC filter change and parking lot crack seal. No capital action required in current cycle.' },
      kpis: [{ val: '84/100', lbl: 'Condition' }, { val: '3', lbl: 'Open WOs' }, { val: '2015', lbl: 'Last Major' }, { val: 'LOW', lbl: 'Risk Level' }]
    },
    { id: 'proj-cc', type: 'project', label: 'Comm. Center', icon: '🔨', color: '#b45309', x: 68, y: 48,
      detail: { name: 'Community Center Renovation', condition: '62% Complete', status: 'DELAYED — 3 weeks behind', costYTD: '$1.3M of $2.1M', risk: 'MEDIUM', nexus: 'Project is 3 weeks behind schedule. Subcontractor staffing shortage is the root cause. Recovery plan adds $42K to budget. Escalation to executive sponsor recommended this week.' },
      kpis: [{ val: '62%', lbl: 'Complete' }, { val: '$2.1M', lbl: 'Budget' }, { val: '3 wks', lbl: 'Delay' }, { val: '$42K', lbl: 'Recovery Cost' }]
    },
    { id: 'proj-water', type: 'project', label: 'Water Main Ph2', icon: '💧', color: '#2563eb', x: 20, y: 65,
      detail: { name: 'Water Main Replacement — Phase 2', condition: 'ON TRACK', status: 'Construction active', costYTD: '$2.8M of $4.2M', risk: 'LOW', nexus: 'Phase 2 is on schedule and within budget. Current phase: trench and pipe installation on Maple corridor. Permit for Phase 3 connection point under review.' },
      kpis: [{ val: 'ON TRACK', lbl: 'Schedule' }, { val: '$4.2M', lbl: 'Budget' }, { val: '67%', lbl: 'Complete' }, { val: 'LOW', lbl: 'Risk Level' }]
    },
    { id: 'risk-water', type: 'risk', label: 'Water Main Risk', icon: '⚠️', color: '#dc2626', x: 35, y: 72,
      detail: { name: 'Infrastructure Risk — Water Main Segment 14-B', condition: 'Condition: 31/100 — CRITICAL', status: 'HIGH RISK — Action Required', costYTD: 'Mitigation: $180K identified', risk: 'HIGH', nexus: 'Segment 14-B has been flagged as critical for 18 months. Pipe age: 52 years. Failure risk is HIGH. Emergency repair would cost $420K vs. planned replacement at $180K. Delay is not recommended.' },
      kpis: [{ val: '31/100', lbl: 'Condition' }, { val: '52 yrs', lbl: 'Pipe Age' }, { val: '$180K', lbl: 'Repair Cost' }, { val: 'HIGH', lbl: 'Failure Risk' }]
    },
    { id: 'fleet-a14', type: 'fleet', label: 'Unit A-14', icon: '🚛', color: '#7c3aed', x: 75, y: 68,
      detail: { name: 'Fleet Unit A-14 — Heavy Truck', condition: 'IN REPAIR — 18 days', status: 'Parts delayed — overdue', costYTD: '$12,400 maintenance', risk: 'MEDIUM', nexus: 'A-14 maintenance cost this year is 3× standard rate. Parts delay has extended repair to 18 days. Lease-vs-purchase analysis recommends replacement — projected annual savings of $4,200.' },
      kpis: [{ val: 'REPAIR', lbl: 'Status' }, { val: '18 days', lbl: 'Down Time' }, { val: '$12.4K', lbl: 'Maint/Year' }, { val: '2018', lbl: 'Year' }]
    }
  ];

  var activeLayers = { facilities: true, projects: true, risks: true, fleet: false };
  var activePin = null;

  function init() {
    var canvas = document.getElementById('nx-map-canvas');
    if (!canvas) return;

    renderPins(canvas);
    setupLayerToggles();
  }

  function renderPins(canvas) {
    // Remove existing pins
    canvas.querySelectorAll('.nx-map-pin').forEach(function (p) { p.remove(); });

    var w = canvas.offsetWidth || 300;
    var h = canvas.offsetHeight || 380;

    MAP_FEATURES.forEach(function (feat) {
      var typeVisible = activeLayers[feat.type + 's'] !== false && activeLayers[feat.type] !== false;
      // Map feature type to layer key
      var layerKey = feat.type === 'facility' ? 'facilities' : feat.type === 'project' ? 'projects' : feat.type === 'risk' ? 'risks' : 'fleet';
      if (!activeLayers[layerKey]) return;

      var pin = document.createElement('div');
      pin.className = 'nx-map-pin' + (activePin === feat.id ? ' active' : '');
      pin.setAttribute('role', 'button');
      pin.setAttribute('tabindex', '0');
      pin.setAttribute('aria-label', feat.label + ' — tap for details');
      pin.style.left = (feat.x / 100 * w) + 'px';
      pin.style.top = (feat.y / 100 * h) + 'px';
      pin.dataset.id = feat.id;

      var dot = document.createElement('div');
      dot.className = 'nx-map-pin__dot';
      dot.style.background = feat.color;
      dot.textContent = feat.icon;

      var lbl = document.createElement('div');
      lbl.className = 'nx-map-pin__label';
      lbl.textContent = feat.label;

      pin.appendChild(dot);
      pin.appendChild(lbl);
      canvas.appendChild(pin);

      pin.addEventListener('click', function () { selectPin(feat.id, canvas); });
      pin.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); selectPin(feat.id, canvas); }
      });
    });
  }

  function selectPin(id, canvas) {
    activePin = id;
    var feat = MAP_FEATURES.find(function (f) { return f.id === id; });
    if (!feat) return;

    // Update active state on pins
    canvas.querySelectorAll('.nx-map-pin').forEach(function (p) {
      p.classList.toggle('active', p.dataset.id === id);
    });

    // Render detail panel
    var detail = document.getElementById('nx-map-detail');
    if (!detail) return;

    var kpisHTML = (feat.kpis || []).map(function (k) {
      return '<div class="nx-map-kpi"><div class="nx-map-kpi__val">' + k.val + '</div><div class="nx-map-kpi__lbl">' + k.lbl + '</div></div>';
    }).join('');

    var riskColor = feat.detail.risk === 'HIGH' ? '#dc2626' : feat.detail.risk === 'MEDIUM' ? '#d97706' : '#16a34a';

    detail.innerHTML = [
      '<div class="nx-map-detail-title">Selected Feature</div>',
      '<div class="nx-map-detail-name">' + feat.icon + ' ' + feat.detail.name + '</div>',
      '<div class="nx-map-detail-type">' + capitalizeType(feat.type) + ' &bull; <span style="color:' + riskColor + ';font-weight:700;">' + feat.detail.risk + ' RISK</span></div>',
      '<div class="nx-map-detail-kpis">' + kpisHTML + '</div>',
      '<div style="font-size:0.75rem;color:var(--text-muted);margin-bottom:0.375rem;">Status: <strong style="color:var(--text-primary);">' + feat.detail.status + '</strong></div>',
      '<div class="nx-map-detail-nexus"><strong>🤖 Nexus:</strong> ' + feat.detail.nexus + '</div>',
      '<div class="nx-detail-actions" style="margin-top:0.75rem;">',
      '  <button type="button" class="nx-action-btn" data-action="investigate" data-context="' + feat.detail.name + '">🔍 Investigate</button>',
      '  <button type="button" class="nx-action-btn nx-action-btn--primary" data-action="' + (feat.type === 'facility' ? 'create-wo' : 'assign') + '" data-context="' + feat.detail.name + '">' + (feat.type === 'facility' ? '📝 Work Order' : '👤 Assign Action') + '</button>',
      '</div>'
    ].join('');

    // Wire action buttons
    detail.querySelectorAll('.nx-action-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (window.NexusInteractive) {
          window.NexusInteractive.renderActionResult(btn.getAttribute('data-action'), btn.getAttribute('data-context'));
        }
      });
    });

    // Hide hint
    var hint = canvas.querySelector('.nx-map-hint');
    if (hint) hint.style.display = 'none';
  }

  function capitalizeType(t) {
    var map = { facility: 'Facility', project: 'Capital Project', risk: 'Risk Item', fleet: 'Fleet Asset' };
    return map[t] || t;
  }

  function setupLayerToggles() {
    document.querySelectorAll('.nx-map-layer-btn').forEach(function (btn) {
      btn.addEventListener('click', function () {
        var layer = btn.getAttribute('data-layer');
        activeLayers[layer] = !activeLayers[layer];
        btn.classList.toggle('active', activeLayers[layer]);
        var canvas = document.getElementById('nx-map-canvas');
        if (canvas) renderPins(canvas);
      });
    });
  }

  // Re-render on tab switch to map
  document.addEventListener('click', function (e) {
    if (e.target.getAttribute && e.target.getAttribute('data-view') === 'map') {
      setTimeout(function () {
        var canvas = document.getElementById('nx-map-canvas');
        if (canvas) renderPins(canvas);
      }, 50);
    }
  });

  // Init on DOM ready
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    setTimeout(init, 0);
  }

  window.addEventListener('resize', function () {
    var canvas = document.getElementById('nx-map-canvas');
    if (canvas && document.getElementById('view-map') && document.getElementById('view-map').classList.contains('active')) {
      renderPins(canvas);
    }
  });

})();

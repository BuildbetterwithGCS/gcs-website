(function () {
  'use strict';

  var root = document.querySelector('[data-interactive-gcs]');
  if (!root) return;

  var industries = {
    municipality: {
      name: 'Municipality',
      sources: 'Tax rolls, permits, utility billing, asset inventory, work orders',
      state: 'Disconnected capital, facilities, and service records',
      gap: 'Hard to compare levies, grants, condition, and service outcomes',
      dashboard: 'Council-ready revenue, capital, and service dashboard'
    },
    education: {
      name: 'Education',
      sources: 'Enrollment, facilities assessments, maintenance logs, budgets',
      state: 'Academic schedules, building conditions, and capital timing compete',
      gap: 'Leaders need one view of facilities, budgets, and service readiness',
      dashboard: 'Board-ready facilities and funding dashboard'
    },
    nonprofit: {
      name: 'Nonprofit',
      sources: 'Donor CRM, grant records, program outcomes, facilities costs',
      state: 'Fundraising, grants, and operations live in separate systems',
      gap: 'Restricted funds and program delivery need one accountability model',
      dashboard: 'Executive dashboard for donors, grants, programs, and facilities'
    },
    healthcare: {
      name: 'Healthcare',
      sources: 'CMMS, compliance logs, staffing, reimbursement, equipment records',
      state: 'Compliance, staffing, and capital decisions are reviewed separately',
      gap: 'Need shared visibility across patient-supporting operations',
      dashboard: 'Leadership dashboard for compliance, staffing, capital, and assets'
    },
    manufacturing: {
      name: 'Manufacturing',
      sources: 'ERP, CMMS, downtime logs, inventory, energy systems',
      state: 'Production, maintenance, and margin decisions are not synchronized',
      gap: 'Need to link downtime, inventory, energy, and capital planning',
      dashboard: 'Operations dashboard for margin, uptime, maintenance, and inventory'
    },
    facilities: {
      name: 'Facilities',
      sources: 'Space data, work orders, inspections, utility data, contracts',
      state: 'Portfolio condition and service levels are fragmented by location',
      gap: 'Need a defensible portfolio view for service and capital decisions',
      dashboard: 'Portfolio dashboard for service response, condition, and spend'
    },
    infrastructure: {
      name: 'Infrastructure',
      sources: 'GIS, inspections, projects, grants, condition scoring',
      state: 'Projects and asset condition are tracked in separate places',
      gap: 'Need one model for risk, grants, timing, and lifecycle',
      dashboard: 'Infrastructure dashboard for condition, risk, and capital'
    },
    'data-centers': {
      name: 'Data Centers',
      sources: 'BMS, power and cooling telemetry, tickets, asset records',
      state: 'Capacity, maintenance, and resilience data are siloed',
      gap: 'Need one operating picture for uptime-critical infrastructure',
      dashboard: 'Executive dashboard for capacity, maintenance, and resilience'
    },
    business: {
      name: 'Private Business',
      sources: 'Financials, workforce plans, facilities data, service operations',
      state: 'Growth decisions outpace shared operating intelligence',
      gap: 'Need connected decisions across growth, staffing, and assets',
      dashboard: 'Executive dashboard for growth, cost, staffing, and assets'
    }
  };

  var challenges = {
    revenue: 'Reveal demand, pricing, and collection patterns impacting revenue.',
    funding: 'Model funding availability against operational need and timing.',
    levies: 'Show service and infrastructure tradeoffs tied to levy decisions.',
    grants: 'Rank projects, evidence, and timing for stronger grant readiness.',
    fundraising: 'Connect donors, program results, and restricted funds to action.',
    budget: 'Compare budget assumptions against current operational reality.',
    'capital-planning': 'Sequence capital investments by condition, risk, and ROI.',
    facilities: 'Unify facilities condition, service tickets, and lifecycle planning.',
    assets: 'Build one trusted inventory with condition, cost, and accountability.',
    infrastructure: 'Tie projects, risk, condition, and geography together.',
    maintenance: 'Shift reactive work toward planned, prioritized maintenance.',
    operations: 'Turn cross-functional operations into one accountable workflow.',
    staffing: 'Compare workload, service levels, and staffing scenarios.',
    compliance: 'Track obligations, deadlines, evidence, and owners in one place.',
    risk: 'Surface operational, financial, and safety risk with named owners.',
    forecasting: 'Model multiple futures with transparent assumptions.',
    energy: 'Link energy use, equipment health, and cost reduction opportunities.',
    inventory: 'Expose critical spares, shortages, and excess carrying cost.',
    'cost-reduction': 'Target recurring cost reduction without losing service quality.',
    growth: 'Show what growth requires in assets, staffing, and capital.'
  };

  var workflowTemplate = [
    ['DATA SOURCES', function (industry) { return industry.sources; }],
    ['CURRENT STATE', function (industry) { return industry.state; }],
    ['GAP / OPPORTUNITY', function (industry, challenge) { return industry.gap + ' ' + challenges[challenge]; }],
    ['SCENARIOS', function (industry, challenge) { return 'Synthetic scenarios compare conservative, balanced, and accelerated responses for ' + industry.name + ' priorities.'; }],
    ['RECOMMENDED ACTIONS', function (industry, challengeLabel) { return 'Ask Nexus recommendations prioritize next actions around ' + challengeLabel.replace(/-/g, ' ') + '.'; }],
    ['EXECUTIVE DASHBOARD', function (industry) { return industry.dashboard; }],
    ['ACCOUNTABILITY', function (industry) { return 'Named owners, due dates, approvals, and KPI checkpoints remain visible across ' + industry.name + ' workflows.'; }],
    ['MAP INTELLIGENCE', function (industry) { return 'Synthetic geospatial layers connect location, condition, projects, and service geography for ' + industry.name + '.'; }],
    ['ASK NEXUS', function (industry) { return 'Governed AI analysis drafts analysis, reporting, documentation, and follow-up while human approval stays in control.'; }]
  ];

  var industryButtons = Array.prototype.slice.call(root.querySelectorAll('[data-industry]'));
  var challengeButtons = Array.prototype.slice.call(root.querySelectorAll('[data-challenge]'));
  var challengeStep = root.querySelector('[data-step="challenge"]');
  var responseStep = root.querySelector('[data-step="response"]');
  var selectedIndustryLabel = root.querySelector('[data-selected-industry]');
  var selectedChallengeLabel = root.querySelector('[data-selected-challenge]');
  var workflowTarget = root.querySelector('[data-workflow]');
  var summary = root.querySelector('[data-interactive-summary]');

  var selectedIndustry = null;
  var selectedChallenge = null;

  function renderWorkflow() {
    if (!selectedIndustry || !selectedChallenge || !workflowTarget) return;
    var industry = industries[selectedIndustry];
    var challengeLabel = selectedChallengeLabel.textContent;
    workflowTarget.replaceChildren();

    workflowTemplate.forEach(function (item) {
      var article = document.createElement('article');
      article.className = 'workflow-card reveal is-visible';

      var stage = document.createElement('div');
      stage.className = 'workflow-card__stage';

      var heading = document.createElement('h3');
      heading.textContent = item[0];

      var badge = document.createElement('span');
      badge.className = 'badge badge--synthetic';
      badge.textContent = 'SYNTHETIC DATA';

      var body = document.createElement('p');
      body.textContent = item[1](industry, selectedChallenge, challengeLabel);

      stage.appendChild(heading);
      stage.appendChild(badge);
      article.appendChild(stage);
      article.appendChild(body);
      workflowTarget.appendChild(article);
    });
  }

  function updateSummary() {
    if (!summary) return;
    summary.replaceChildren();

    [
      { className: 'badge', text: 'Industry: ' + industries[selectedIndustry].name },
      { className: 'badge', text: 'Challenge: ' + selectedChallengeLabel.textContent },
      { className: 'badge badge--synthetic', text: 'Synthetic workflow preview' }
    ].forEach(function (item) {
      var badge = document.createElement('span');
      badge.className = item.className;
      badge.textContent = item.text;
      summary.appendChild(badge);
    });
  }

  industryButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      selectedIndustry = button.getAttribute('data-industry');
      selectedChallenge = null;
      industryButtons.forEach(function (item) {
        var active = item === button;
        item.classList.toggle('is-selected', active);
        item.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      challengeButtons.forEach(function (item) {
        item.classList.remove('is-selected');
        item.setAttribute('aria-pressed', 'false');
      });
      if (selectedIndustryLabel) {
        selectedIndustryLabel.textContent = industries[selectedIndustry].name;
      }
      if (challengeStep) {
        challengeStep.hidden = false;
      }
      if (responseStep) {
        responseStep.hidden = true;
      }
    });
  });

  challengeButtons.forEach(function (button) {
    button.addEventListener('click', function () {
      if (!selectedIndustry) return;
      selectedChallenge = button.getAttribute('data-challenge');
      challengeButtons.forEach(function (item) {
        var active = item === button;
        item.classList.toggle('is-selected', active);
        item.setAttribute('aria-pressed', active ? 'true' : 'false');
      });
      if (selectedChallengeLabel) {
        selectedChallengeLabel.textContent = button.getAttribute('data-label') || button.textContent.trim();
      }
      if (responseStep) {
        responseStep.hidden = false;
      }
      updateSummary();
      renderWorkflow();
      responseStep.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();

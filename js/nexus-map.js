/**
 * GCS Nexus Radial Connectivity Map
 * Renders the interactive hub-and-spoke organizational connectivity diagram.
 * Signature graphic: NEXUS at center, every department connected.
 */

(function () {
  'use strict';

  var DEPTS = [
    { name: 'CEO',                     group: 'leadership'   },
    { name: 'Executive Leadership',    group: 'leadership'   },
    { name: 'Finance',                 group: 'finance'      },
    { name: 'Accounting',              group: 'finance'      },
    { name: 'Payroll',                 group: 'finance'      },
    { name: 'Human Resources',         group: 'people'       },
    { name: 'Risk',                    group: 'compliance'   },
    { name: 'Safety',                  group: 'compliance'   },
    { name: 'Legal',                   group: 'compliance'   },
    { name: 'Compliance',              group: 'compliance'   },
    { name: 'Emergency Management',    group: 'compliance'   },
    { name: 'Facilities',              group: 'operations'   },
    { name: 'Fleet',                   group: 'operations'   },
    { name: 'Maintenance',             group: 'operations'   },
    { name: 'Operations',              group: 'operations'   },
    { name: 'Customer Service',        group: 'people'       },
    { name: 'Projects',                group: 'projects'     },
    { name: 'Capital Planning',        group: 'projects'     },
    { name: 'Purchasing',              group: 'supply'       },
    { name: 'Procurement',             group: 'supply'       },
    { name: 'Warehousing',             group: 'supply'       },
    { name: 'Inventory',               group: 'supply'       },
    { name: 'Shipping',                group: 'supply'       },
    { name: 'Receiving',               group: 'supply'       },
    { name: 'Engineering',             group: 'technical'    },
    { name: 'GIS',                     group: 'technical'    },
    { name: 'Asset Management',        group: 'technical'    },
    { name: 'IT',                      group: 'technical'    },
    { name: 'Analytics',               group: 'intelligence' },
    { name: 'Dashboards',              group: 'intelligence' },
    { name: 'Knowledge',               group: 'intelligence' },
    { name: 'Documents',               group: 'intelligence' },
    { name: 'Artificial Intelligence', group: 'intelligence' },
    { name: 'Reporting',               group: 'intelligence' },
    { name: 'Maps',                    group: 'intelligence' }
  ];

  var GROUP_COLORS = {
    leadership:   '#0f1f3d',
    finance:      '#2e4a7a',
    people:       '#3a6b8e',
    compliance:   '#5a8a2a',
    operations:   '#7aaa35',
    supply:       '#4a8a25',
    technical:    '#3a7a35',
    intelligence: '#2a6a2e',
    projects:     '#1a5a7a'
  };

  function init() {
    var container = document.getElementById('nexus-radial');
    if (!container) return;

    // Hide the chip fallback grid — JS renders the radial
    var chipGrid = document.querySelector('.nexus-dept-grid');
    if (chipGrid) chipGrid.style.display = 'none';

    buildMap(container);

    var resizeTimer;
    window.addEventListener('resize', function () {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(function () { buildMap(container); }, 200);
    }, { passive: true });
  }

  function buildMap(container) {
    container.innerHTML = '';

    var isMobile = window.innerWidth < 600;
    if (isMobile) {
      buildChipCloud(container);
      return;
    }

    // Determine size
    var parentWidth = container.parentElement ? container.parentElement.offsetWidth : 820;
    var size = Math.min(parentWidth, 820);
    if (size < 400) size = 400;

    var cx = size / 2;
    var cy = size / 2;
    var innerR = size * 0.28;
    var outerR = size * 0.44;

    var innerDepts = DEPTS.slice(0, 17);
    var outerDepts = DEPTS.slice(17);

    container.style.position = 'relative';
    container.style.width = '100%';
    container.style.height = size + 'px';

    var NS = 'http://www.w3.org/2000/svg';
    var svg = document.createElementNS(NS, 'svg');
    svg.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;pointer-events:none;';
    svg.setAttribute('viewBox', '0 0 ' + size + ' ' + size);
    svg.setAttribute('aria-hidden', 'true');

    // Track all lines with metadata for hover reset
    var allLineData = [];

    // Inner ring lines + buttons
    innerDepts.forEach(function (dept, i) {
      var angle = (i / innerDepts.length) * 2 * Math.PI - Math.PI / 2;
      var x = cx + innerR * Math.cos(angle);
      var y = cy + innerR * Math.sin(angle);
      var color = GROUP_COLORS[dept.group] || '#7aaa35';

      var line = createLine(NS, cx, cy, x, y, color, 0.28);
      svg.appendChild(line);
      allLineData.push({ el: line, color: color, defaultOpacity: 0.28 });

      var btn = createNodeBtn(dept, x, y, size);
      container.appendChild(btn);
    });

    // Outer ring lines + buttons (offset by half-step for interleaving)
    outerDepts.forEach(function (dept, i) {
      var angle = (i / outerDepts.length) * 2 * Math.PI - Math.PI / 2 + (Math.PI / outerDepts.length);
      var x = cx + outerR * Math.cos(angle);
      var y = cy + outerR * Math.sin(angle);
      var color = GROUP_COLORS[dept.group] || '#7aaa35';

      var line = createLine(NS, cx, cy, x, y, color, 0.18);
      svg.appendChild(line);
      allLineData.push({ el: line, color: color, defaultOpacity: 0.18 });

      var btn = createNodeBtn(dept, x, y, size);
      container.appendChild(btn);
    });

    // SVG goes BEHIND buttons
    container.insertBefore(svg, container.firstChild);

    // Center hub
    var hub = document.createElement('div');
    hub.className = 'nexus-hub-el';
    hub.style.left = cx + 'px';
    hub.style.top  = cy + 'px';
    hub.innerHTML =
      '<div class="nexus-hub-el__gcs">GCS</div>' +
      '<div class="nexus-hub-el__name">NEXUS</div>' +
      '<div class="nexus-hub-el__sub">Operations Intelligence</div>';
    container.appendChild(hub);

    // Attach hover interactions
    var allBtns = Array.prototype.slice.call(container.querySelectorAll('.nexus-node-btn'));
    allBtns.forEach(function (btn, idx) {
      var lineData = allLineData[idx];
      if (!lineData) return;

      btn.addEventListener('mouseenter', function () {
        // Dim all lines
        allLineData.forEach(function (ld) {
          ld.el.setAttribute('stroke-opacity', '0.07');
          ld.el.setAttribute('stroke-width', '1');
        });
        // Highlight this line
        lineData.el.setAttribute('stroke', lineData.color);
        lineData.el.setAttribute('stroke-opacity', '1');
        lineData.el.setAttribute('stroke-width', '2.5');
        // Remove active from others, add to this
        allBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });

      btn.addEventListener('mouseleave', function () {
        // Restore all lines to default
        allLineData.forEach(function (ld) {
          ld.el.setAttribute('stroke', ld.color);
          ld.el.setAttribute('stroke-opacity', ld.defaultOpacity);
          ld.el.setAttribute('stroke-width', '1');
        });
        btn.classList.remove('active');
      });

      // Keyboard accessibility
      btn.addEventListener('focus', function () {
        allLineData.forEach(function (ld) {
          ld.el.setAttribute('stroke-opacity', '0.07');
        });
        lineData.el.setAttribute('stroke', lineData.color);
        lineData.el.setAttribute('stroke-opacity', '1');
        lineData.el.setAttribute('stroke-width', '2.5');
        allBtns.forEach(function (b) { b.classList.remove('active'); });
        btn.classList.add('active');
      });
      btn.addEventListener('blur', function () {
        allLineData.forEach(function (ld) {
          ld.el.setAttribute('stroke', ld.color);
          ld.el.setAttribute('stroke-opacity', ld.defaultOpacity);
          ld.el.setAttribute('stroke-width', '1');
        });
        btn.classList.remove('active');
      });
    });
  }

  function createLine(NS, x1, y1, x2, y2, color, opacity) {
    var line = document.createElementNS(NS, 'line');
    line.setAttribute('x1', x1);
    line.setAttribute('y1', y1);
    line.setAttribute('x2', x2);
    line.setAttribute('y2', y2);
    line.setAttribute('stroke', color);
    line.setAttribute('stroke-opacity', opacity);
    line.setAttribute('stroke-width', '1');
    line.setAttribute('stroke-linecap', 'round');
    return line;
  }

  function createNodeBtn(dept, x, y, size) {
    var btn = document.createElement('button');
    btn.className = 'nexus-node-btn';
    btn.setAttribute('type', 'button');
    btn.setAttribute('data-group', dept.group);
    btn.setAttribute('aria-label', dept.name + ' — connected through Nexus');
    btn.textContent = dept.name;
    btn.style.position = 'absolute';
    btn.style.left = x + 'px';
    btn.style.top  = y + 'px';
    if (size < 600) {
      btn.style.fontSize = '0.625rem';
      btn.style.padding = '0.18rem 0.45rem';
    }
    return btn;
  }

  function buildChipCloud(container) {
    container.style.height = 'auto';
    container.style.position = 'static';

    var hub = document.createElement('div');
    hub.className = 'nexus-outcome-hub';
    hub.style.cssText = 'display:inline-block;margin:0 auto 1.5rem;';
    hub.innerHTML =
      '<div class="nexus-outcome-hub__gcs">GCS</div>' +
      '<div class="nexus-outcome-hub__name">NEXUS</div>' +
      '<div class="nexus-outcome-hub__tag">Operations Intelligence</div>';

    var wrap = document.createElement('div');
    wrap.style.cssText = 'text-align:center;';
    wrap.appendChild(hub);

    var chips = document.createElement('div');
    chips.className = 'nexus-dept-grid';
    chips.style.display = 'flex';
    DEPTS.forEach(function (d) {
      var chip = document.createElement('span');
      chip.className = 'org-chip';
      var dot = document.createElement('span');
      dot.className = 'org-chip__dot';
      dot.style.background = GROUP_COLORS[d.group] || '#7aaa35';
      chip.appendChild(dot);
      chip.appendChild(document.createTextNode(d.name));
      chips.appendChild(chip);
    });

    container.appendChild(wrap);
    container.appendChild(chips);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }

}());

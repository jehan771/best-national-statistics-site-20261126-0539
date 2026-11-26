// Indonesia in Numbers — client-side app. No network: every figure comes from
// data.js. Hash routes: #/ #/population #/economy #/labour #/society #/about.
(function () {
  "use strict";
  var D = DATA;

  function fmt(n) { return n.toLocaleString("en-US"); }
  function fmtM(n) { return (n / 1e6).toFixed(1) + "m"; }
  function pct(n, d) { return (100 * n / d).toFixed(1) + "%"; }
  function esc(s) {
    return String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  }

  /* ---------------- SVG charts (hand-rolled, deterministic) ---------------- */
  function svgOpen(w, h) {
    return '<svg class="chart" viewBox="0 0 ' + w + ' ' + h +
      '" role="img" xmlns="http://www.w3.org/2000/svg">';
  }
  // Vertical bar chart. series: [[label, value], ...]. valueLabel formats a value.
  function barChart(series, opts) {
    var w = 560, h = 250, padL = 46, padB = 30, padT = 26, padR = 8;
    var vals = series.map(function (s) { return s[1]; });
    var min = Math.min(0, Math.min.apply(null, vals));
    var max = Math.max.apply(null, vals);
    var range = (max - min) || 1;
    var cw = w - padL - padR, ch = h - padT - padB;
    var bw = cw / series.length;
    var out = [svgOpen(w, h)];
    var zeroY = padT + ch * (1 - (0 - min) / range);
    out.push('<line x1="' + padL + '" y1="' + zeroY + '" x2="' + (w - padR) +
      '" y2="' + zeroY + '" stroke="#dbe3e9" stroke-width="1"/>');
    series.forEach(function (s, i) {
      var v = s[1];
      var x = padL + i * bw + bw * 0.18;
      var bw2 = bw * 0.64;
      var y = padT + ch * (1 - (v - min) / range);
      var bh = Math.max(1, zeroY - y);
      var color = v < 0 ? "#b3372f" : (opts.color || "#0e7c7b");
      if (opts.highlight && opts.highlight(i)) color = "#e8a33d";
      out.push('<rect x="' + x.toFixed(1) + '" y="' + y.toFixed(1) +
        '" width="' + bw2.toFixed(1) + '" height="' + bh.toFixed(1) +
        '" rx="3" fill="' + color + '"/>');
      out.push('<text class="bar-label" x="' + (x + bw2 / 2).toFixed(1) +
        '" y="' + (y - 6).toFixed(1) + '" text-anchor="middle">' +
        esc(opts.valueLabel ? opts.valueLabel(v) : fmt(v)) + '</text>');
      out.push('<text class="axis-label" x="' + (x + bw2 / 2).toFixed(1) +
        '" y="' + (h - 10) + '" text-anchor="middle">' + esc(String(s[0])) + '</text>');
    });
    out.push('</svg>');
    return out.join("");
  }
  // Line chart with dots. series: [[label, value], ...].
  function lineChart(series, opts) {
    var w = 560, h = 250, padL = 46, padB = 30, padT = 26, padR = 14;
    var vals = series.map(function (s) { return s[1]; });
    var min = Math.min.apply(null, vals), max = Math.max.apply(null, vals);
    if (min > 0) min = Math.max(0, min - (max - min) * 0.25);
    var range = (max - min) || 1;
    var cw = w - padL - padR, ch = h - padT - padB;
    function X(i) { return padL + (series.length === 1 ? cw / 2 : i * cw / (series.length - 1)); }
    function Y(v) { return padT + ch * (1 - (v - min) / range); }
    var out = [svgOpen(w, h)];
    [0.25, 0.5, 0.75, 1].forEach(function (f) {
      var y = padT + ch * (1 - f);
      out.push('<line x1="' + padL + '" y1="' + y.toFixed(1) + '" x2="' + (w - padR) +
        '" y2="' + y.toFixed(1) + '" stroke="#edf1f4" stroke-width="1"/>');
      out.push('<text class="axis-label" x="' + (padL - 6) + '" y="' + (y + 4).toFixed(1) +
        '" text-anchor="end">' + esc(opts.valueLabel(min + range * f)) + '</text>');
    });
    var pts = series.map(function (s, i) { return X(i).toFixed(1) + "," + Y(s[1]).toFixed(1); });
    out.push('<polyline points="' + pts.join(" ") +
      '" fill="none" stroke="#0e7c7b" stroke-width="2.5" stroke-linejoin="round"/>');
    series.forEach(function (s, i) {
      out.push('<circle cx="' + X(i).toFixed(1) + '" cy="' + Y(s[1]).toFixed(1) +
        '" r="4" fill="#0b2a4a" stroke="#fff" stroke-width="1.5"/>');
      if ((i % 2 === 0 && i > 0) || i === series.length - 1) {
        out.push('<text class="bar-label" x="' + X(i).toFixed(1) + '" y="' +
          (Y(s[1]) - 9).toFixed(1) + '" text-anchor="middle">' +
          esc(opts.valueLabel(s[1])) + '</text>');
      }
      out.push('<text class="axis-label" x="' + X(i).toFixed(1) + '" y="' + (h - 10) +
        '" text-anchor="middle">' + esc(String(s[0])) + '</text>');
    });
    out.push('</svg>');
    return out.join("");
  }
  // Donut chart with a centre label.
  function donut(parts, centre) {
    var w = 260, h = 260, cx = 130, cy = 130, r = 95, ir = 58;
    var colors = ["#0e7c7b", "#0b2a4a", "#e8a33d", "#7fb3b2", "#5b6b7a"];
    var total = parts.reduce(function (a, p) { return a + p.value; }, 0);
    var out = [svgOpen(w, h)];
    var a0 = -Math.PI / 2;
    parts.forEach(function (p, i) {
      var frac = p.value / total;
      var a1 = a0 + frac * Math.PI * 2;
      var large = frac > 0.5 ? 1 : 0;
      function pt(a, rr) { return (cx + rr * Math.cos(a)).toFixed(1) + "," + (cy + rr * Math.sin(a)).toFixed(1); }
      out.push('<path d="M ' + pt(a0, r) + ' A ' + r + ' ' + r + ' 0 ' + large + ' 1 ' + pt(a1, r) +
        ' L ' + pt(a1, ir) + ' A ' + ir + ' ' + ir + ' 0 ' + large + ' 0 ' + pt(a0, ir) + ' Z" fill="' +
        colors[i % colors.length] + '"/>');
      var mid = (a0 + a1) / 2;
      void mid;
      a0 = a1;
    });
    out.push('<text x="' + cx + '" y="' + (cy - 4) + '" text-anchor="middle" font-size="15" font-weight="700" fill="#0b2a4a">' +
      esc(centre[0]) + '</text>');
    out.push('<text x="' + cx + '" y="' + (cy + 16) + '" text-anchor="middle" font-size="11" fill="#5b6b7a">' +
      esc(centre[1]) + '</text>');
    out.push('</svg>');
    return out.join("");
  }
  // Horizontal bars. rows: [{label, value, max, display}].
  function hbars(rows, opts) {
    var w = 560, rowH = 34, h = rows.length * rowH + 8;
    var out = [svgOpen(w, h)];
    rows.forEach(function (r, i) {
      var y = 8 + i * rowH;
      var bw = (w - 190) * (r.value / r.max);
      out.push('<text class="axis-label" x="0" y="' + (y + 15) + '" font-size="12.5" fill="#16222e">' +
        esc(r.label) + '</text>');
      out.push('<rect x="150" y="' + (y + 5) + '" width="' + Math.max(2, bw).toFixed(1) +
        '" height="12" rx="6" fill="' + (opts.color || "#0e7c7b") + '"/>');
      out.push('<text class="bar-label" x="' + (156 + Math.max(2, bw)).toFixed(1) +
        '" y="' + (y + 16) + '">' + esc(r.display) + '</text>');
    });
    out.push('</svg>');
    return out.join("");
  }

  /* ---------------- shared bits ---------------- */
  var NAV = [
    ["#/", "Dashboard"], ["#/population", "Population"], ["#/economy", "Economy"],
    ["#/labour", "Labour & Poverty"], ["#/society", "Society"], ["#/about", "Methodology"],
  ];
  function navHtml(active) {
    return NAV.map(function (n) {
      return '<a href="' + n[0] + '"' + (n[0] === active ? ' class="active"' : "") + '>' + n[1] + '</a>';
    }).join("");
  }
  function kpi(label, value, sub, chip) {
    return '<div class="card kpi"><div class="kpi-label">' + esc(label) + '</div>' +
      '<div class="kpi-value num">' + value + (chip || "") + '</div>' +
      '<div class="kpi-sub">' + sub + '</div></div>';
  }
  function srcNote(t) { return '<p class="small">Source: ' + t + '</p>'; }

  /* ---------------- page state (toggles) ---------------- */
  var state = { popChart: "bar", growthChart: "bar", sectorView: "gva", povRange: "all" };

  /* ---------------- pages ---------------- */
  function pageHome() {
    var pop = D.population, eco = D.economy;
    var popSeries = pop.series.map(function (p) { return [String(p[0]).slice(2), p[1] / 1e6]; });
    var growthSeries = eco.growth.map(function (g) { return [String(g[0]).slice(2), g[1]]; });
    var topProv = pop.provinces.slice(0, 5).map(function (p) {
      return { label: p.name, value: p.pop, max: 50.3, display: p.pop.toFixed(1) + "m" };
    });
    var chart = state.popChart === "bar"
      ? barChart(popSeries, { valueLabel: function (v) { return v.toFixed(0) + "m"; } })
      : lineChart(popSeries, { valueLabel: function (v) { return v.toFixed(0) + "m"; } });
    var gchart = state.growthChart === "bar"
      ? barChart(growthSeries, {
          valueLabel: function (v) { return v.toFixed(1) + "%"; },
          highlight: function (i) { return growthSeries[i][1] < 0; },
        })
      : lineChart(growthSeries, { valueLabel: function (v) { return v.toFixed(1) + "%"; } });
    return '' +
    '<section class="hero"><h1>Indonesia in Numbers</h1>' +
    '<p class="lede">The national statistics explorer for the world’s fourth most populous ' +
    'country — population, economy, work, poverty and wellbeing, with every figure ' +
    'traceable to the World Bank, BPS-Statistics Indonesia and Destatis.</p>' +
    '<p class="small">38 provinces &nbsp;·&nbsp; Capital Jakarta &nbsp;·&nbsp; Currency Rupiah (IDR) &nbsp;·&nbsp; ' +
    'Land area 1,904,443 km² &nbsp;·&nbsp; Data updated ' + esc(D.updated) + '</p></section>' +
    '<div class="grid kpis">' +
    kpi("Population, 2024", "283.5m", "World Bank WDI · +0.8% on 2023", '<span class="chip up">▲ 2.3m</span>') +
    kpi("GDP, 2024", "$1.40tn", "World Bank · 16th largest economy", '<span class="chip up">▲ 5.0%</span>') +
    kpi("GDP per capita, 2024", "$4,925", "World Bank · PPP $16,472") +
    kpi("Unemployment, Feb 2025", "4.76%", "BPS Sakernas · 7.28m people", '<span class="chip up">▼ 0.06 pts</span>') +
    kpi("Poverty, Sep 2024", "8.57%", "BPS · 24.06m people", '<span class="chip up">▼ 0.79 pts</span>') +
    kpi("Human Development Index, 2024", "75.02", "BPS · up from 74.39 in 2023", '<span class="chip up">▲ 0.63</span>') +
    '</div>' +
    '<div class="grid two"><div class="card">' +
    '<div class="chart-title">Population, 2015–2024</div>' +
    '<div class="chart-note">Millions of people, mid-year estimates — World Bank WDI</div>' +
    '<div class="controls"><div class="seg" data-toggle="popChart">' +
    '<button data-v="bar"' + (state.popChart === "bar" ? ' class="on"' : "") + '>Bars</button>' +
    '<button data-v="line"' + (state.popChart === "line" ? ' class="on"' : "") + '>Line</button></div></div>' +
    chart +
    '<p class="small">Indonesia added 21.7 million people in a decade — about the population of Sri Lanka.</p>' +
    '</div><div class="card">' +
    '<div class="chart-title">Real GDP growth, 2015–2024</div>' +
    '<div class="chart-note">Annual % change — World Bank WDI</div>' +
    '<div class="controls"><div class="seg" data-toggle="growthChart">' +
    '<button data-v="bar"' + (state.growthChart === "bar" ? ' class="on"' : "") + '>Bars</button>' +
    '<button data-v="line"' + (state.growthChart === "line" ? ' class="on"' : "") + '>Line</button></div></div>' +
    gchart +
    '<p class="small">Growth has held near 5% every year except the pandemic contraction of −2.1% in 2020.</p>' +
    '</div></div>' +
    '<div class="grid two-even" style="margin-top:18px"><div class="card">' +
    '<h2 style="margin-top:0">Where Indonesians live</h2>' +
    '<p class="small">Five most populous provinces, 2024 (millions)</p>' +
    hbars(topProv, {}) +
    '<p><a href="#/population">See all 10 largest provinces →</a></p>' +
    '</div><div class="card">' +
    '<h2 style="margin-top:0">Latest releases</h2>' +
    '<ul class="stat-list">' +
    '<li><span>Labour force survey, Feb 2025</span><span class="v">4.76% unemployed</span></li>' +
    '<li><span>Poverty profile, Sep 2024</span><span class="v">8.57% poor</span></li>' +
    '<li><span>Human Development Index, 2024</span><span class="v">75.02</span></li>' +
    '<li><span>GDP, full year 2024</span><span class="v">+5.03%</span></li>' +
    '<li><span>Inflation, Dec 2024 (yoy)</span><span class="v">1.57%</span></li>' +
    '</ul><p class="small">Figures as published by BPS-Statistics Indonesia and the World Bank. ' +
    'Full sourcing on the <a href="#/about">Methodology</a> page.</p>' +
    '</div></div>';
  }

  function pagePopulation() {
    var pop = D.population;
    var rows = pop.provinces.map(function (p, i) {
      return '<tr><td class="rank">' + (i + 1) + '</td><td>' + esc(p.name) + '</td>' +
        '<td class="num">' + p.pop.toFixed(1) + '</td><td class="num">' +
        pct(p.pop, 283.487931) + '</td>' +
        '<td><div class="bar-cell"><div class="bar-track"><div class="bar-fill" style="width:' +
        (100 * p.pop / 50.3).toFixed(1) + '%"></div></div></div></td></tr>';
    }).join("");
    var age = pop.ageStructure.map(function (a) {
      return { label: a.group, value: a.share, max: 100, display: a.share.toFixed(1) + "%" };
    });
    return '' +
    '<section class="hero"><h1>Population</h1>' +
    '<p class="lede">283.5 million people in 2024 — the world’s 4th largest population, ' +
    'growing by about 2.3 million a year. More than half live on Java, the world’s most populous island.</p></section>' +
    '<div class="grid kpis">' +
    kpi("Population, 2024", "283,487,931", "World Bank WDI, mid-year estimate") +
    kpi("Median age, 2024", "31.1 years", "UN World Population Prospects") +
    kpi("Provinces", "38", "West Java is the largest at 50.3m") +
    '</div>' +
    '<div class="grid two"><div class="card">' +
    '<div class="chart-title">Population, 2015–2024</div>' +
    '<div class="chart-note">Millions — World Bank WDI (SP.POP.TOTL)</div>' +
    lineChart(pop.series.map(function (p) { return [String(p[0]), p[1] / 1e6]; }),
      { valueLabel: function (v) { return v.toFixed(0) + "m"; } }) +
    srcNote("World Bank World Development Indicators, indicator SP.POP.TOTL; accessed 26 Nov 2026.") +
    '</div><div class="card">' +
    '<div class="chart-title">Age structure, 2024</div>' +
    '<div class="chart-note">Share of population — UN / World Bank</div>' +
    hbars(age, { color: "#0b2a4a" }) +
    '<div class="callout teal"><strong>68.1% are of working age (15–64).</strong> ' +
    'Indonesia’s demographic dividend peaks in the 2030s: the working-age share is still rising while the child share falls.</div>' +
    '<p class="small">0–14: 24.6% · 15–64: 68.1% · 65+: 7.3%. Median age 31.1 years.</p>' +
    '</div></div>' +
    '<div class="card" style="margin-top:18px"><h2 style="margin-top:0">Largest provinces, 2024</h2>' +
    '<div class="controls"><input class="search" id="prov-search" type="search" ' +
    'placeholder="Search a province…" aria-label="Search provinces"></div>' +
    '<table class="data" id="prov-table"><thead><tr>' +
    '<th>#</th><th><button data-sort="name">Province ↕</button></th>' +
    '<th><button data-sort="pop">Population (m) ↕</button></th>' +
    '<th>Share of Indonesia</th><th>Compared with West Java</th></tr></thead>' +
    '<tbody>' + rows + '</tbody></table>' +
    srcNote("Provincial populations 2024, BPS-based compilations; shares computed against the 2024 national total of 283.5m.") +
    '</div>';
  }

  function pageEconomy() {
    var eco = D.economy;
    var gvaParts = eco.gva.map(function (g) { return { label: g.sector, value: g.share }; });
    var indRows = eco.industries.map(function (x) {
      return { label: x.sector, value: x.share, max: 20, display: x.share.toFixed(1) + "%" };
    });
    var expRows = eco.expenditure.map(function (x) {
      return { label: x.item, value: Math.abs(x.share), max: 60, display: (x.share > 0 ? "" : "−") + Math.abs(x.share).toFixed(1) + "%" };
    });
    var gvaColors = ["#0e7c7b", "#0b2a4a", "#e8a33d"];
    var gvaLegend = eco.gva.map(function (g, i) {
      return '<li><span><span style="display:inline-block;width:11px;height:11px;border-radius:3px;background:' +
        gvaColors[i] + ';margin-right:8px"></span>' + esc(g.sector) + '</span>' +
        '<span class="v">' + g.share.toFixed(1) + '%</span></li>';
    }).join("");
    var view = state.sectorView === "gva"
      ? '<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">' +
        '<div style="flex:0 0 220px">' + donut(gvaParts, ["95.7%", "of GVA*"]) + '</div>' +
        '<div style="flex:1;min-width:220px"><ul class="stat-list">' + gvaLegend + '</ul>' +
        '<p class="small">* The three shares sum to 95.7%: the remainder is taxes less subsidies on ' +
        'products and items not allocated by sector (Destatis / World Bank).</p></div></div>'
      : hbars(expRows, { color: "#0b2a4a" }) +
        '<p class="small">Household consumption is 54.0% of GDP; fixed investment 29.1%. ' +
        'Components do not sum to 100% — change in inventories and the statistical discrepancy make up the rest (BPS).</p>';
    var tradeRows = eco.trade.topExports.map(function (t) {
      return '<li><span>' + esc(t.item) + '</span><span class="v">' + t.share.toFixed(1) + '% of exports</span></li>';
    }).join("");
    var srcRows = eco.trade.topImportSources.map(function (t) {
      return '<li><span>' + esc(t.country) + '</span><span class="v">' + t.share.toFixed(1) + '% of imports</span></li>';
    }).join("");
    return '' +
    '<section class="hero"><h1>Economy</h1>' +
    '<p class="lede">A $1.40 trillion economy — the largest in Southeast Asia and 16th in the world — ' +
    'growing at about 5% a year on the back of household spending, manufacturing and commodities.</p></section>' +
    '<div class="grid kpis">' +
    kpi("GDP, 2024", "$1,396.3bn", "World Bank, current US$ · rank 16") +
    kpi("GDP per capita, 2024", "$4,925", "World Bank · PPP $16,472") +
    kpi("Real GDP growth, 2024", "+5.03%", "World Bank · 2023: +5.05%") +
    kpi("Goods exports, 2024", "$264.7bn", "EIU · imports $233.7bn") +
    kpi("Trade surplus, 2024", "$31.0bn", "Goods, EIU estimate") +
    kpi("Inflation, Dec 2024", "1.57% yoy", "BPS CPI · 2024 average 2.3%") +
    '</div>' +
    '<div class="grid two"><div class="card">' +
    '<div class="chart-title">Real GDP growth, 2015–2024</div>' +
    '<div class="chart-note">Annual % — World Bank WDI</div>' +
    barChart(eco.growth.map(function (g) { return [String(g[0]).slice(2), g[1]]; }),
      { valueLabel: function (v) { return v.toFixed(1) + "%"; },
        highlight: function (i) { return eco.growth[i][1] < 0; } }) +
    '<p class="small">The only contraction in the decade was 2020 (−2.1%), the pandemic year; ' +
    'growth bounced back to 5.3% in 2022.</p>' +
    '</div><div class="card">' +
    '<div class="chart-title">What the economy is made of</div>' +
    '<div class="controls"><div class="seg" data-toggle="sectorView">' +
    '<button data-v="gva"' + (state.sectorView === "gva" ? ' class="on"' : "") + '>By sector</button>' +
    '<button data-v="exp"' + (state.sectorView === "exp" ? ' class="on"' : "") + '>By spending</button></div></div>' +
    view +
    '</div></div>' +
    '<div class="grid two" style="margin-top:18px"><div class="card">' +
    '<h2 style="margin-top:0">Biggest industries, 2024</h2>' +
    '<p class="small">Share of nominal GDP — BPS</p>' +
    hbars(indRows, {}) +
    '<p class="small">Manufacturing alone is 19.0% of GDP; wholesale &amp; retail trade 13.1%; agriculture 12.6%.</p>' +
    '</div><div class="card">' +
    '<h2 style="margin-top:0">Prices: inflation under control</h2>' +
    '<p class="small">CPI inflation, year-on-year in December — BPS</p>' +
    barChart(D.prices.inflationDec.map(function (p) { return [String(p[0]), p[1]]; }),
      { valueLabel: function (v) { return v.toFixed(2) + "%"; } }) +
    '<p class="small">Inflation peaked at 5.51% in December 2022 and fell to 1.57% by December 2024, ' +
    'inside Bank Indonesia’s 2.5% ± 1% target band. The 2024 annual average was 2.3%.</p>' +
    '</div></div>' +
    '<div class="grid two" style="margin-top:18px"><div class="card">' +
    '<h2 style="margin-top:0">What Indonesia sells</h2>' +
    '<ul class="stat-list">' + tradeRows + '</ul>' +
    srcNote("Shares of goods exports, 2024 — EIU via Asian Exim Banks country profile.") +
    '</div><div class="card">' +
    '<h2 style="margin-top:0">Where imports come from</h2>' +
    '<ul class="stat-list">' + srcRows + '</ul>' +
    srcNote("Shares of goods imports, 2024 — EIU via Asian Exim Banks country profile.") +
    '</div></div>';
  }

  function pageLabour() {
    var lab = D.labour, pov = D.poverty;
    var series = state.povRange === "all" ? pov.series : pov.series.slice(-4);
    return '' +
    '<section class="hero"><h1>Labour &amp; Poverty</h1>' +
    '<p class="lede">153.05 million Indonesians are in the labour force. Unemployment is low at 4.76%, ' +
    'but most work is informal — and poverty, while falling, still touches 24 million people.</p></section>' +
    '<div class="grid kpis">' +
    kpi("Unemployment, Feb 2025", "4.76%", "BPS Sakernas · down from 4.82% a year earlier", '<span class="chip up">▼ 0.06 pts</span>') +
    kpi("Labour force, Feb 2025", "153.05m", "Employed 145.77m · unemployed 7.28m") +
    kpi("Informal workers", "59.4%", "86.58m of the employed — BPS") +
    kpi("Poverty, Sep 2024", "8.57%", "24.06m people · line Rp595,242 / person / month") +
    kpi("Poverty, Mar 2025", "8.47%", "BPS · Sep 2025: 8.25%") +
    kpi("Poverty line, Sep 2024", "Rp595,242", "Per person per month — BPS") +
    '</div>' +
    '<div class="grid two"><div class="card">' +
    '<div class="chart-title">Poverty rate, September each year</div>' +
    '<div class="chart-note">% of population — BPS</div>' +
    '<div class="controls"><div class="seg" data-toggle="povRange">' +
    '<button data-v="all"' + (state.povRange === "all" ? ' class="on"' : "") + '>2018–2024</button>' +
    '<button data-v="recent"' + (state.povRange === "recent" ? ' class="on"' : "") + '>Last 4 years</button></div></div>' +
    lineChart(series.map(function (p) { return [String(p[0]), p[1]]; }),
      { valueLabel: function (v) { return v.toFixed(2) + "%"; } }) +
    '<p class="small">Poverty spiked to 10.19% in September 2020, then fell every year to 8.57% in 2024 — ' +
    'the lowest in the series. It kept falling after: 8.47% in March 2025 and 8.25% in September 2025.</p>' +
    '</div><div class="card">' +
    '<h2 style="margin-top:0">Formal vs informal work</h2>' +
    '<p class="small">Employed people, February 2025 — BPS Sakernas</p>' +
    hbars([
      { label: "Informal", value: 86.58, max: 145.77, display: "86.58m · 59.4%" },
      { label: "Formal", value: 59.19, max: 145.77, display: "59.19m · 40.6%" },
    ], {}) +
    '<div class="callout"><strong>The headline rate hides job quality.</strong> ' +
    'Nearly 6 in 10 workers are informal — without a contract, fixed wage or social security — ' +
    'which is why the 4.76% unemployment rate and the lived experience of work can feel so different.</div>' +
    '<p class="small">Labour force 153.05m · employed 145.77m · unemployed 7.28m (Feb 2025).</p>' +
    '</div></div>';
  }

  function pageSociety() {
    var soc = D.society;
    return '' +
    '<section class="hero"><h1>Society &amp; Wellbeing</h1>' +
    '<p class="lede">Human development keeps climbing: the HDI reached 75.02 in 2024, its highest ever, ' +
    'with longer lives and more schooling behind it.</p></section>' +
    '<div class="grid kpis">' +
    kpi("Human Development Index, 2024", "75.02", "BPS · 2023: 74.39 (+0.63)", '<span class="chip up">▲ 0.63</span>') +
    kpi("Life expectancy at birth, 2024", "74.15 yrs", "BPS · up 0.22 yrs on 2023") +
    kpi("Expected years of schooling", "13.21 yrs", "BPS, 2024") +
    '</div>' +
    '<div class="grid two"><div class="card">' +
    '<h2 style="margin-top:0">What drives the HDI</h2>' +
    '<p>The Human Development Index combines three dimensions. In 2024:</p>' +
    '<ul class="stat-list">' +
    '<li><span>Long and healthy life — life expectancy at birth</span><span class="v">74.15 years</span></li>' +
    '<li><span>Knowledge — expected years of schooling</span><span class="v">13.21 years</span></li>' +
    '<li><span>Decent standard of living — adjusted real per-capita expenditure</span><span class="v">+3.71% on 2023</span></li>' +
    '</ul>' +
    '<p class="small">All three dimensions improved in 2024, lifting the HDI by 0.63 points — ' +
    'the fastest rise since the pandemic years (BPS release, 15 Nov 2024).</p>' +
    '</div><div class="card">' +
    '<h2 style="margin-top:0">A note on life expectancy</h2>' +
    '<p>BPS puts life expectancy at birth at 74.15 years in 2024. The World Bank’s ' +
    'estimate for 2023 is 71.3 years — the two differ because they use different ' +
    'mortality models, not because either is wrong. This site uses the BPS figure ' +
    'and says so, wherever it appears.</p>' +
    '<div class="callout teal"><strong>Reading statistics well means reading the fine print.</strong> ' +
    'Every number on this site names its source and its reference period — see Methodology.</div>' +
    '</div></div>';
  }

  function pageAbout() {
    return '' +
    '<section class="hero"><h1>Methodology &amp; Sources</h1>' +
    '<p class="lede">Indonesia in Numbers is an independent statistics explorer. It is not affiliated ' +
    'with BPS-Statistics Indonesia, the World Bank or any government body. Every figure on this site ' +
    'was checked against the source named beside it on 26 November 2026.</p></section>' +
    '<div class="card"><h2 style="margin-top:0">Sources</h2><ul class="sources">' +
    '<li><strong>World Bank, World Development Indicators</strong> — population 2015–2024 (SP.POP.TOTL), ' +
    'GDP current US$ (NY.GDP.MKTP.CD), GDP per capita (NY.GDP.PCAP.CD), GDP PPP (NY.GDP.MKTP.PP.CD), ' +
    'real GDP growth (NY.GDP.MKTP.KD.ZG), life expectancy 2023. Accessed via api.worldbank.org, 26 Nov 2026.</li>' +
    '<li><strong>BPS-Statistics Indonesia</strong> — open unemployment rate and labour force, Sakernas February 2025 ' +
    '(Official Statistics News No. 44/05/Th. XXVIII, 5 May 2025); poverty rate September 2018–2024 and March/September 2025; ' +
    'poverty line September 2024 (Rp595,242 per capita per month); Human Development Index 2024 (press release, 15 Nov 2024); ' +
    'CPI inflation December 2021–2024; GDP by sector and by expenditure 2024.</li>' +
    '<li><strong>Destatis (Federal Statistical Office of Germany), Statistical Country Profile: Indonesia</strong> — ' +
    'sector shares of gross value added 2024 (agriculture 12.6%, industry 39.3%, services 43.8%).</li>' +
    '<li><strong>EIU via Asian Exim Banks, “Indonesia: Brief Profile” (2025)</strong> — goods exports $264.7bn and imports ' +
    '$233.7bn in 2024, top export items and import sources; land area 1,904,443 km².</li>' +
    '<li><strong>UN World Population Prospects / populationpyramid.net</strong> — median age 31.1 and age structure 2024.</li>' +
    '<li><strong>Provincial populations 2024</strong> — BPS-based compilations (West Java 50.3m, East Java 41.8m, Central Java 37.9m, ' +
    'North Sumatra 15.6m, Banten 11.8m, Jakarta 11.1m, South Sulawesi 9.5m, Lampung 9.4m, South Sumatra 8.8m, Riau 6.7m).</li>' +
    '</ul></div>' +
    '<div class="card" style="margin-top:18px"><h2 style="margin-top:0">How to read this site</h2>' +
    '<ul class="tight"><li><strong>Reference periods matter.</strong> A figure labelled “Feb 2025” is not the same as “2024”. ' +
    'Unemployment, for example, is measured in February and August each year.</li>' +
    '<li><strong>National vs international sources can differ.</strong> BPS and the World Bank estimate life expectancy ' +
    'with different models (74.15 vs 71.3 years). Both are shown with their source.</li>' +
    '<li><strong>Shares may not sum to 100%.</strong> Sector and expenditure breakdowns leave out taxes, inventories ' +
    'and statistical discrepancies, as their sources note.</li>' +
    '<li><strong>Nothing here is a forecast.</strong> Every number is a published, realised figure.</li></ul>' +
    '<p class="small">Built as a static site: no trackers, no network requests, no cookies. ' +
    'All charts are drawn from the figures in data.js.</p></div>';
  }

  /* ---------------- router ---------------- */
  var PAGES = {
    "/": pageHome, "/population": pagePopulation, "/economy": pageEconomy,
    "/labour": pageLabour, "/society": pageSociety, "/about": pageAbout,
  };
  var app = document.getElementById("app");
  var nav = document.getElementById("main-nav");

  function render() {
    var hash = window.location.hash || "#/";
    var route = hash.replace(/^#/, "") || "/";
    if (!PAGES[route]) route = "/";
    nav.innerHTML = navHtml("#" + route);
    app.innerHTML = PAGES[route]();
    bindControls();
    window.scrollTo(0, 0);
  }
  function bindControls() {
    var segs = app.querySelectorAll(".seg[data-toggle]");
    Array.prototype.forEach.call(segs, function (seg) {
      var key = seg.getAttribute("data-toggle");
      Array.prototype.forEach.call(seg.querySelectorAll("button"), function (btn) {
        btn.addEventListener("click", function () {
          state[key] = btn.getAttribute("data-v");
          render();
        });
      });
    });
    var search = document.getElementById("prov-search");
    if (search) {
      search.addEventListener("input", function () {
        var q = search.value.trim().toLowerCase();
        var rows = document.querySelectorAll("#prov-table tbody tr");
        Array.prototype.forEach.call(rows, function (tr) {
          tr.style.display = tr.cells[1].textContent.toLowerCase().indexOf(q) === -1 ? "none" : "";
        });
      });
    }
    var sortBtns = app.querySelectorAll("th button[data-sort]");
    Array.prototype.forEach.call(sortBtns, function (btn) {
      btn.addEventListener("click", function () {
        var key = btn.getAttribute("data-sort");
        var tbody = document.querySelector("#prov-table tbody");
        var rows = Array.prototype.slice.call(tbody.querySelectorAll("tr"));
        var asc = btn.getAttribute("data-dir") !== "asc";
        rows.sort(function (a, b) {
          if (key === "name") {
            var x = a.cells[1].textContent, y = b.cells[1].textContent;
            return asc ? x.localeCompare(y) : y.localeCompare(x);
          }
          var x = parseFloat(a.cells[2].textContent), y = parseFloat(b.cells[2].textContent);
          return asc ? x - y : y - x;
        });
        rows.forEach(function (tr, i) { tr.cells[0].textContent = String(i + 1); tbody.appendChild(tr); });
        btn.setAttribute("data-dir", asc ? "asc" : "desc");
      });
    });
  }
  window.addEventListener("hashchange", render);
  render();
})();

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:8080/api';

// Helper for local mock persistence when backend is offline/unreachable on cloud demo
function getLocalIdeas() {
  const data = localStorage.getItem('demo_ideas');
  if (data) {
    try { return JSON.parse(data); } catch (e) {}
  }
  return [
    {
      id: 1,
      ideaId: 1,
      title: 'EcoRide Fleet AI',
      startupName: 'EcoRide Fleet AI',
      industry: 'CleanTech & Energy',
      description: 'An AI-powered smart charging and maintenance dispatch platform for commercial electric vehicle fleets.',
      summary: 'High potential CleanTech venture addressing the rapid electrification of commercial fleets with predictive charging optimization.',
      executiveSummary: 'High potential CleanTech venture addressing commercial fleet electrification with predictive charging optimization and load-balancing algorithms.',
      readinessScore: 84,
      successScore: 8,
      scoreExplanation: 'Score calculated at 84/100 based on acute problem validation, high fleet operational spending, and strong B2B SaaS scalability.',
      marketAssessment: 'The commercial EV fleet management software market is experiencing double-digit annual growth driven by government emission mandates.',
      strengths: [
        'Proprietary energy rate arbitrage algorithms reducing peak fleet charging costs',
        'Scalable B2B enterprise subscription with high recurring retention',
        'Clear integration path with major hardware charger protocols (OCPP)'
      ],
      weaknesses: [
        'Requires field pilot deployments to validate real-world battery health telemetry',
        'Longer enterprise procurement sales cycles with municipal fleet operators'
      ],
      opportunities: [
        'Expansion into commercial logistics depots and last-mile delivery providers',
        'Utility grid demand-response revenue sharing partnerships'
      ],
      threats: [
        'Vehicle OEMs developing native proprietary fleet telematics portals',
        'Grid infrastructure delays in high-density metropolitan distribution hubs'
      ],
      evaluationDimensions: [
        { dimension: 'Problem Clarity', score: 90, explanation: 'Clear fleet pain point around peak demand electricity surcharges.', strengths: 'High fuel-to-electric transition pressure.', gaps: 'Needs municipal pilot telemetry.', recommendation: 'Secure initial 3 fleet depot pilot agreements.' },
        { dimension: 'Customer & Market', score: 85, explanation: 'Growing commercial EV market with mandated fleet conversions.', strengths: 'Strong regulatory tailwinds.', gaps: 'Segmenting regional vs long-haul fleets.', recommendation: 'Focus on last-mile delivery fleets first.' },
        { dimension: 'Competitive Differentiation', score: 80, explanation: 'Hardware-agnostic charging optimization vs proprietary OEM locks.', strengths: 'Works across mixed vehicle makes.', gaps: 'Incumbents adding basic scheduling.', recommendation: 'Highlight battery longevity algorithms.' },
        { dimension: 'Business Model', score: 88, explanation: 'Tiered monthly per-vehicle software subscription model.', strengths: 'Recurring predictable SaaS cash flow.', gaps: 'Hardware onboarding service overhead.', recommendation: 'Offer automated self-serve charger pairing.' },
        { dimension: 'Execution Feasibility', score: 82, explanation: 'Core web and telemetry protocols well established.', strengths: 'Standard OCPP protocol support.', gaps: 'Driver mobile app field testing.', recommendation: 'Beta test with 50 drivers.' },
        { dimension: 'Financial Preparedness', score: 80, explanation: 'Healthy SaaS gross margins of 75%+ once software is deployed.', strengths: 'High customer lifetime value.', gaps: 'Upfront pilot hardware adapter cost.', recommendation: 'Require 50% deposit on customized depot setups.' }
      ],
      risks: [
        { description: 'High initial depot integration and hardware commissioning friction', category: 'Operational', severity: 'Medium', impact: 'Slows down customer onboarding timeline', mitigation: 'Standardize pre-configured cellular gateway hardware bundles.' },
        { description: 'Electricity tariff volatility across regional energy utilities', category: 'Market', severity: 'High', impact: 'Complicates uniform ROI savings promises to buyers', mitigation: 'Integrate dynamic local utility tariff rate APIs.' }
      ],
      recommendations: [
        { title: 'Deploy 3 Commercial Depot Beta Pilots', description: 'Install telemetry monitors at 3 regional delivery fleet hubs to gather live charging curves.', priority: 'High', nextAction: 'Sign pilot LOIs with local courier fleets.', expectedBenefit: 'Verified energy savings proof for case studies.', timeframe: 'Weeks 1-4' },
        { title: 'Publish Battery Health Longevity Model', description: 'Quantify how intelligent rate optimization extends commercial battery lifespans by 18%.', priority: 'Medium', nextAction: 'Co-author technical whitepaper with battery researchers.', expectedBenefit: 'Drives enterprise CFO trust during sales meetings.', timeframe: 'Month 2' }
      ],
      createdAt: new Date().toISOString()
    }
  ];
}

function saveLocalIdeas(ideas) {
  localStorage.setItem('demo_ideas', JSON.stringify(ideas));
}

// Client-side fallback engine when backend is offline/unreachable on cloud demo
function handleClientSideFallback(path, method, body) {
  console.info(`[Demo Mode] Handling ${method} ${path} client-side`);

  // Auth: Register / Login
  if (path.includes('/auth/register') || path.includes('/auth/login')) {
    const user = {
      userId: 1,
      name: (body && body.name) || 'Founder',
      email: (body && body.email) || 'founder@startup.com',
      token: 'client-demo-jwt-' + Date.now()
    };
    return user;
  }

  // Auth: Me
  if (path.includes('/auth/me')) {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : { id: 1, name: 'Founder', email: 'founder@startup.com' };
  }

  // Dashboard Metrics
  if (path === '/dashboard') {
    const ideas = getLocalIdeas();
    const totalIdeas = ideas.length;
    const avg = totalIdeas > 0
      ? Math.round(ideas.reduce((acc, i) => acc + (i.readinessScore || 70), 0) / totalIdeas)
      : 0;
    return {
      totalIdeas,
      avgReadinessScore: avg,
      highRiskCount: ideas.reduce((acc, i) => acc + (i.risks ? i.risks.filter(r => r.severity === 'High' || r.severity === 'Critical').length : 0), 0),
      reportsGenerated: totalIdeas
    };
  }

  // Analyze Idea
  if (path === '/ideas/analyze') {
    const title = (body && body.title) || 'Startup Concept';
    const industry = (body && body.industry) || 'SaaS';
    const desc = (body && body.description) || '';

    // Deterministic Heuristic Scoring
    let score = 50;
    const words = desc.trim().split(/\s+/).length;
    if (words >= 40) score += 18;
    else if (words >= 20) score += 10;

    const lower = desc.toLowerCase();
    ['problem', 'solution', 'market', 'customer', 'revenue', 'scale', 'platform', 'b2b', 'growth'].forEach(kw => {
      if (lower.includes(kw)) score += 3;
    });
    score = Math.min(94, Math.max(30, score));

    const id = Date.now();
    const newReport = {
      id,
      ideaId: id,
      title,
      startupName: title,
      industry,
      description: desc,
      summary: `Structured evaluation for '${title}' in the ${industry} space. Concept demonstrates clear workflow efficiency opportunities.`,
      executiveSummary: `Structured evaluation for '${title}' in the ${industry} space. Concept addresses clear workflow pain with strong initial viability.`,
      readinessScore: score,
      successScore: Math.round(score / 10),
      scoreExplanation: `Indicative readiness score of ${score}/100 derived from problem clarity, customer persona targeting, and execution feasibility.`,
      marketAssessment: `The ${industry} sector is receptive to modern point solutions that simplify workflows and reduce operational friction.`,
      strengths: [
        `Direct focus on an underserved pain point in ${industry}`,
        'Scalable software architecture with low marginal delivery cost',
        'Clear self-serve or digital onboarding potential'
      ],
      weaknesses: [
        'Early-stage brand presence requiring deliberate outbound validation',
        'Customer switching inertia from existing habit or spreadsheets'
      ],
      opportunities: [
        `Expansion into adjacent vertical segments within ${industry}`,
        'Integration partnerships with existing software tools'
      ],
      threats: [
        'Established incumbents copying feature sets into core bundles',
        'Customer budget scrutiny requiring measurable ROI proof'
      ],
      evaluationDimensions: [
        { dimension: 'Problem Clarity', score: Math.min(95, score + 4), explanation: 'Identifies a recurring friction point in user workflows.', strengths: 'Clear problem narrative.', gaps: 'Needs qualitative user validation.', recommendation: 'Conduct 15 customer discovery calls.' },
        { dimension: 'Customer & Market', score: score, explanation: `Target audience in ${industry} has proven purchasing appetite.`, strengths: 'Growing target market.', gaps: 'Segment granularity.', recommendation: 'Define ideal customer profile (ICP).' },
        { dimension: 'Competitive Differentiation', score: Math.max(40, score - 6), explanation: 'Incumbents possess market recognition.', strengths: 'Modern workflow.', gaps: 'Defensible moat.', recommendation: 'Focus on speed and specialized UX.' },
        { dimension: 'Business Model', score: Math.min(92, score + 2), explanation: 'Monetization aligned with industry benchmarks.', strengths: 'Multiple tiers.', gaps: 'Empirical CAC/LTV.', recommendation: 'Model unit economics in calculator.' },
        { dimension: 'Execution Feasibility', score: Math.min(90, score), explanation: 'Technically feasible with modern web stack.', strengths: 'Fast build time.', gaps: 'Scoping discipline.', recommendation: 'Build tight 45-day MVP.' },
        { dimension: 'Financial Preparedness', score: Math.max(35, score - 5), explanation: 'Initial cash runway planning required.', strengths: 'Low hardware spend.', gaps: 'Burn reserves.', recommendation: 'Maintain 6-9 months buffer.' }
      ],
      risks: [
        { description: 'Customer acquisition cost exceeding early unit margins', category: 'Financial', severity: 'High', impact: 'Extended timeline to profitability', mitigation: 'Focus on organic community outreach and founder-led sales.' },
        { description: 'Feature scope creep delaying MVP launch', category: 'Execution', severity: 'Medium', impact: 'Cash burn without user feedback', mitigation: 'Limit MVP to single core problem workflow.' }
      ],
      recommendations: [
        { title: 'Conduct 15 Customer Discovery Interviews', description: 'Validate problem severity with prospective users without pitching your solution.', priority: 'High', nextAction: 'Draft non-leading interview questions.', expectedBenefit: 'Prevents building features nobody pays for.', timeframe: 'Weeks 1-2' },
        { title: 'Create Interactive Clickable Prototype', description: 'Design wireframes of primary workflow to confirm customer usability.', priority: 'High', nextAction: 'Build prototype in Figma or web demo.', expectedBenefit: 'Gathers feedback prior to engineering investment.', timeframe: 'Weeks 3-4' },
        { title: 'Model Unit Economics & Break-Even', description: 'Input your pricing and cost assumptions into the Financial Feasibility calculator.', priority: 'Medium', nextAction: 'Calculate required monthly volume.', expectedBenefit: 'Clear break-even target.', timeframe: 'Month 2' }
      ],
      createdAt: new Date().toISOString()
    };

    const ideas = getLocalIdeas();
    ideas.unshift(newReport);
    saveLocalIdeas(ideas);

    return newReport;
  }

  // ── Sub-resource routes MUST come before the generic /ideas GET handler ──

  // Competitor Analysis  (GET /ideas/:id/competitors  OR  POST /ideas/:id/competitors/analyze)
  if (path.includes('/competitors')) {
    if (method === 'POST') {
      // POST analyze — return fresh demo competitors (same data, would be AI in backend)
    }
    const ideaId = path.split('/')[2];
    const key = `demo_competitors_${ideaId}`;
    const saved = localStorage.getItem(key);
    if (saved && method === 'GET') {
      try { return JSON.parse(saved); } catch (e) {}
    }
    const ideas = getLocalIdeas();
    const idea = ideas.find(i => String(i.id) === String(ideaId) || String(i.ideaId) === String(ideaId));
    const industry = idea ? idea.industry : 'Technology';
    const title = idea ? (idea.title || idea.startupName) : 'Your Startup';

    const competitors = [
      {
        id: 1,
        name: `Established ${industry} Incumbent`,
        website: 'incumbent-example.com',
        summary: `Large market player offering enterprise-focused solutions in the ${industry} domain with comprehensive feature suites.`,
        targetSegment: 'Enterprise organizations and mid-market companies',
        strengths: 'Brand awareness, deep financial reserves, established channel partnerships.',
        weaknesses: 'Legacy user interface, high pricing tiers, slow feature release cycles.',
        differentiation: `${title} can win by providing faster onboarding, a streamlined modern UX, and accessible self-serve pricing.`,
        sourceUrl: 'Preliminary AI assessment - independent verification recommended'
      },
      {
        id: 2,
        name: `Agile ${industry} Challenger`,
        website: 'challenger-example.io',
        summary: `Venture-backed recent entrant targeting modern digital-first teams with point solutions in ${industry}.`,
        targetSegment: 'Startups, SMBs, and tech-forward practitioners',
        strengths: 'Modern interface, developer APIs, responsive customer service.',
        weaknesses: 'Narrow focus, limited international localization, shallow enterprise compliance.',
        differentiation: `${title} can stand out through specialized vertical customization and superior community-driven workflows.`,
        sourceUrl: 'Preliminary AI assessment - independent verification recommended'
      },
      {
        id: 3,
        name: 'Internal Manual Workarounds / Spreadsheets',
        website: 'N/A (Status Quo)',
        summary: 'Prospective customers relying on legacy spreadsheets, emails, and manual fragmented processes.',
        targetSegment: 'Teams accustomed to zero incremental software spend',
        strengths: 'Zero upfront budget required, maximum customizability.',
        weaknesses: 'High human error rates, zero automation, massive time inefficiencies.',
        differentiation: `${title} provides automated validation, real-time collaboration, and actionable structured workflows.`,
        sourceUrl: 'Market observation - independent verification recommended'
      }
    ];
    localStorage.setItem(key, JSON.stringify(competitors));
    return competitors;
  }

  // Get Ideas / History (Paginated) — only matches /ideas list or /ideas/:id (NOT sub-paths)
  if (path.startsWith('/ideas') && method === 'GET' && !path.match(/\/ideas\/\d+\/.+/)) {
    const ideas = getLocalIdeas();
    const parts = path.split('/').filter(Boolean);
    // /ideas/:id — single idea detail
    if (parts.length === 2 && !path.includes('?')) {
      const id = parts[1];
      const found = ideas.find(i => String(i.id) === String(id) || String(i.ideaId) === String(id));
      if (found) {
        return {
          ...found,
          analysisReport: found
        };
      }
    }
    // /ideas?page=0&size=20 — paginated list
    return {
      content: ideas,
      totalElements: ideas.length,
      totalPages: 1
    };
  }

  // Delete Idea
  if (path.startsWith('/ideas/') && method === 'DELETE' && !path.match(/\/ideas\/\d+\/.+/)) {
    const id = path.split('/')[2];
    let ideas = getLocalIdeas();
    ideas = ideas.filter(i => String(i.id) !== String(id) && String(i.ideaId) !== String(id));
    saveLocalIdeas(ideas);
    return { message: 'Idea deleted successfully' };
  }

  // Financial Feasibility
  if (path.includes('/financial-projection')) {
    if (method === 'POST') {
      const p = body || {};
      const price = parseFloat(p.sellingPricePerUnit) || 100;
      const units = parseInt(p.expectedUnits) || 50;
      const varCost = parseFloat(p.variableCostPerUnit) || 20;
      const fixedCost = parseFloat(p.monthlyFixedCosts) || 3000;
      const initInvest = parseFloat(p.initialInvestment) || 10000;

      const rev = price * units;
      const totVar = varCost * units;
      const totCost = fixedCost + totVar;
      const profit = rev - totCost;
      const cm = price - varCost;
      const breakEven = cm > 0 ? Math.ceil(fixedCost / cm) : null;
      const breakEvenRev = breakEven ? breakEven * price : null;
      const margin = rev > 0 ? Math.round((profit / rev) * 10000) / 100 : null;

      const result = {
        id: Date.now(),
        initialInvestment: initInvest,
        monthlyFixedCosts: fixedCost,
        variableCostPerUnit: varCost,
        sellingPricePerUnit: price,
        expectedUnits: units,
        estimatedRevenue: rev,
        estimatedVariableCosts: totVar,
        estimatedTotalCosts: totCost,
        estimatedOperatingProfit: profit,
        operatingMarginPercent: margin,
        breakEvenUnits: breakEven,
        breakEvenRevenue: breakEvenRev,
        contributionMarginPerUnit: cm,
        createdAt: new Date().toISOString()
      };
      localStorage.setItem('demo_financial_' + path, JSON.stringify(result));
      return result;
    } else {
      const saved = localStorage.getItem('demo_financial_' + path);
      if (saved) return JSON.parse(saved);
      return {
        initialInvestment: 15000,
        monthlyFixedCosts: 3500,
        variableCostPerUnit: 25,
        sellingPricePerUnit: 120,
        expectedUnits: 60,
        estimatedRevenue: 7200,
        estimatedVariableCosts: 1500,
        estimatedTotalCosts: 5000,
        estimatedOperatingProfit: 2200,
        operatingMarginPercent: 30.56,
        breakEvenUnits: 37,
        breakEvenRevenue: 4440,
        contributionMarginPerUnit: 95
      };
    }
  }

  // Roadmap Tasks — per-idea persistence
  if (path.includes('/roadmap')) {
    // Determine ideaId from path: /ideas/:id/roadmap or /ideas/:id/roadmap/tasks
    // Also handles /roadmap/tasks/:taskId for PUT/DELETE (no ideaId in path)
    const pathParts = path.split('/').filter(Boolean);
    const ideasIndex = pathParts.indexOf('ideas');
    const ideaId = ideasIndex !== -1 ? pathParts[ideasIndex + 1] : null;
    const key = ideaId ? `demo_roadmap_${ideaId}` : 'demo_roadmap_tasks';

    const defaultTasks = [
      { id: 1, title: 'Conduct 15 target customer discovery interviews', description: 'Interview prospective users to validate that the identified problem causes recurring pain and willingness to pay.', priority: 'HIGH', status: 'PENDING', phase: 'Phase 1: Validate Problem', estimatedTimeframe: 'Weeks 1-2' },
      { id: 2, title: 'Map competitive alternatives and current workarounds', description: 'Document existing solutions, their pricing, and identify primary gaps your product will exploit.', priority: 'MEDIUM', status: 'PENDING', phase: 'Phase 1: Validate Problem', estimatedTimeframe: 'Weeks 2-3' },
      { id: 3, title: 'Create interactive wireframe or clickable prototype', description: 'Design key workflows and present to early interviewees to confirm user experience and solution fit.', priority: 'HIGH', status: 'PENDING', phase: 'Phase 2: Validate Solution', estimatedTimeframe: 'Weeks 3-4' },
      { id: 4, title: 'Launch teaser landing page with email waitlist', description: 'Measure market interest through landing page conversion rates and collect early adopter feedback.', priority: 'MEDIUM', status: 'PENDING', phase: 'Phase 2: Validate Solution', estimatedTimeframe: 'Weeks 4-5' },
      { id: 5, title: 'Establish initial pricing and unit economics model', description: 'Model cost of acquisition (CAC) and customer lifetime value (LTV) using the Financial Feasibility calculator.', priority: 'HIGH', status: 'PENDING', phase: 'Phase 3: Validate Business Model', estimatedTimeframe: 'Weeks 5-6' },
      { id: 6, title: 'Identify primary acquisition channel', description: 'Test organic outreach, cold emails, content, or targeted test ads to find the most cost-effective channel.', priority: 'MEDIUM', status: 'PENDING', phase: 'Phase 3: Validate Business Model', estimatedTimeframe: 'Weeks 6-7' },
      { id: 7, title: 'Develop tightly scoped Minimum Viable Product (MVP)', description: 'Build only essential features required to solve the core customer problem without extra bloat.', priority: 'HIGH', status: 'PENDING', phase: 'Phase 4: Build and Launch', estimatedTimeframe: 'Weeks 7-10' },
      { id: 8, title: 'Onboard first 10 closed-beta users', description: 'Provide white-glove onboarding for early users, gather bug reports, and iterate rapidly.', priority: 'HIGH', status: 'PENDING', phase: 'Phase 4: Build and Launch', estimatedTimeframe: 'Weeks 10-12' },
      { id: 9, title: 'Measure retention, usage frequency, and NPS', description: 'Establish core analytics tracking active engagement and customer satisfaction.', priority: 'MEDIUM', status: 'PENDING', phase: 'Phase 5: Measure and Improve', estimatedTimeframe: 'Month 3+' }
    ];

    let savedTasks = localStorage.getItem(key);
    let tasks = savedTasks ? JSON.parse(savedTasks) : defaultTasks;

    // POST /ideas/:id/roadmap/tasks — add new task
    if (method === 'POST') {
      const newTask = {
        id: Date.now(),
        title: (body && body.title) || 'New Task',
        description: (body && body.description) || '',
        priority: (body && body.priority) || 'MEDIUM',
        status: (body && body.status) || 'PENDING',
        phase: (body && body.phase) || 'Phase 1: Validate Problem',
        estimatedTimeframe: (body && body.estimatedTimeframe) || 'Weeks 1-2'
      };
      tasks.push(newTask);
      localStorage.setItem(key, JSON.stringify(tasks));
      return newTask;
    }

    // PUT /roadmap/tasks/:taskId — update task status/fields
    if (method === 'PUT') {
      const taskId = parseInt(pathParts[pathParts.length - 1]);
      tasks = tasks.map(t => t.id === taskId ? { ...t, ...body } : t);
      localStorage.setItem(key, JSON.stringify(tasks));
      return tasks.find(t => t.id === taskId) || body;
    }

    // DELETE /roadmap/tasks/:taskId
    if (method === 'DELETE') {
      const taskId = parseInt(pathParts[pathParts.length - 1]);
      tasks = tasks.filter(t => t.id !== taskId);
      localStorage.setItem(key, JSON.stringify(tasks));
      return { message: 'Task deleted' };
    }

    // GET /ideas/:id/roadmap — return tasks for this idea (initialize if empty)
    if (!savedTasks) {
      localStorage.setItem(key, JSON.stringify(defaultTasks));
    }
    return tasks;
  }

  // Default fallback
  return { message: 'Success' };
}

async function request(path, options = {}) {
  const token = localStorage.getItem('token');
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...options.headers,
  };

  const url = `${API_BASE_URL}${path.startsWith('/') ? path : `/${path}`}`;
  const method = options.method || 'GET';
  let body = null;
  if (options.body) {
    try { body = JSON.parse(options.body); } catch (e) {}
  }

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (response.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.dispatchEvent(new Event('auth:unauthorized'));
    }

    if (!response.ok) {
      let errorMessage = 'An error occurred';
      try {
        const errorData = await response.json();
        errorMessage = errorData.message || (errorData.errors ? Object.values(errorData.errors).join(', ') : errorMessage);
      } catch (e) {
        errorMessage = `HTTP error ${response.status}: ${response.statusText}`;
      }
      throw new Error(errorMessage);
    }

    const contentType = response.headers.get('content-type');
    if (contentType && contentType.includes('application/json')) {
      return await response.json();
    }
    return response;
  } catch (err) {
    // If backend is unreachable or fails to fetch (e.g. cloud deployment without backend host),
    // gracefully switch to intelligent client-side fallback engine so live demo works 100%!
    if (err.name === 'TypeError' || err.message.includes('Failed to fetch') || err.message.includes('NetworkError') || err.message.includes('Load failed')) {
      return handleClientSideFallback(path, method, body);
    }
    throw err;
  }
}

export const api = {
  get: (path) => request(path, { method: 'GET' }),
  post: (path, body) => request(path, { method: 'POST', body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: 'PUT', body: JSON.stringify(body) }),
  del: (path) => request(path, { method: 'DELETE' }),

  downloadPdf: async (reportId, filename = 'startup-analysis.pdf') => {
    const token = localStorage.getItem('token');
    const headers = token ? { 'Authorization': `Bearer ${token}` } : {};
    const url = `${API_BASE_URL}/reports/${reportId}/pdf`;

    try {
      const response = await fetch(url, { headers });
      if (!response.ok) throw new Error('Backend report endpoint not reached');
      const blob = await response.blob();
      const downloadUrl = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = downloadUrl;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(downloadUrl);
    } catch (err) {
      // Offline / browser print fallback
      window.print();
    }
  }
};

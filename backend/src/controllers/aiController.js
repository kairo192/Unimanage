import { getFullStats, getModuleStats, storeSnapshot, getLatestSnapshots } from '../utils/dataAggregator.js';
import { logActivity } from '../utils/activityLogger.js';

const HEALTH = {};

const MODEL_TIERS = {
  reliable: [
    'meta-llama/llama-3.3-70b-instruct:free',
    'google/gemma-4-26b-a4b-it:free',
    'microsoft/phi-4-multimodal-instruct:free',
    'nousresearch/hermes-3-llama-3.1-405b:free',
  ],
  fallback: [
    'qwen/qwen-2.5-72b-instruct:free',
    'minimax/minimax-m2.5:free',
    'deepseek/deepseek-chat:free',
    'meta-llama/llama-3.2-3b-instruct:free',
  ],
};

const getModelPriority = () => {
  const configured = process.env.AI_MODEL;
  const candidates = [];
  if (configured) candidates.push(configured);
  candidates.push(...MODEL_TIERS.reliable);
  const scored = candidates.map(m => {
    const h = HEALTH[m];
    let score = 100;
    if (h) { score -= h.failures * 20; score -= h.imageErrors * 50; score += h.successes * 5; score = Math.max(10, score); }
    return { model: m, score };
  });
  scored.sort((a, b) => b.score - a.score);
  const ordered = scored.map(s => s.model);
  for (const m of MODEL_TIERS.fallback) { if (!ordered.includes(m)) ordered.push(m); }
  return ordered;
};

const textContent = (text) => [{ type: 'text', text }];

const wrapMessages = (messages) =>
  messages.map(m => ({
    role: m.role,
    content: Array.isArray(m.content) ? m.content : textContent(m.content),
  }));

const callModel = async (model, messages) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('No API key configured');

  const body = {
    model,
    messages: wrapMessages(messages),
    temperature: 0.2,
    max_tokens: 2048,
  };

  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
      'HTTP-Referer': process.env.APP_URL || 'http://localhost:5173',
      'X-Title': 'UniManage AI',
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();
  if (!response.ok) throw new Error(data.error?.message || `HTTP ${response.status}`);
  const content = data.choices?.[0]?.message?.content;
  if (!content) throw new Error(`Model ${model} returned empty content`);
  return content;
};

const fetchAIWithCascade = async (messages) => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) throw new Error('No API key configured');

  const modelsToTry = getModelPriority();
  let lastError;

  for (const model of modelsToTry) {
    try {
      console.log(`[AI] Trying ${model}...`);
      const result = await callModel(model, messages);
      if (!HEALTH[model]) HEALTH[model] = { successes: 0, failures: 0, imageErrors: 0 };
      HEALTH[model].successes++;
      console.log(`[AI] OK ${model}`);
      return { result, model };
    } catch (err) {
      const isImg = /image|vision|multimodal|figure out what/i.test(err.message);
      if (!HEALTH[model]) HEALTH[model] = { successes: 0, failures: 0, imageErrors: 0 };
      HEALTH[model].failures++;
      if (isImg) HEALTH[model].imageErrors++;
      if (isImg) continue;
      lastError = err;
    }
  }

  throw lastError || new Error('All AI models failed');
};

const buildSmartFallback = (stats) => {
  const problems = [];
  const risks = [];
  const recs = [];

  const occRate = stats.rooms > 0 ? Math.round((stats.students / stats.rooms) * 100) : 0;

  if (occRate >= 95) {
    problems.push(`Critical occupancy at ${occRate}% — residence is at maximum capacity`);
    risks.push('Risk of student discomfort and emergency housing requests');
    recs.push('Immediately review room redistribution options between blocs');
  } else if (occRate >= 80) {
    problems.push(`High occupancy at ${occRate}% — limited room availability`);
    risks.push('Potential capacity issues if new student intakes proceed');
    recs.push('Begin planning additional capacity or waitlist management');
  } else {
    recs.push(`Current occupancy is ${occRate}% — room capacity is well-managed`);
  }

  if (stats.activeTickets > 10) {
    problems.push(`${stats.activeTickets} active maintenance tickets require attention`);
    risks.push('Unresolved tickets may escalate to structural or safety issues');
    recs.push('Prioritize high-priority maintenance tickets for immediate resolution');
  } else if (stats.activeTickets > 0) {
    recs.push(`${stats.activeTickets} pending maintenance ticket(s) — schedule resolution this week`);
  } else {
    recs.push('No active maintenance tickets — maintenance team is performing well');
  }

  if (stats.catering) {
    if (stats.catering.expired > 0) {
      problems.push(`${stats.catering.expired} catering item(s) have expired — food safety risk`);
      risks.push('Expired food may cause health violations if not disposed promptly');
      recs.push('Conduct immediate kitchen inspection and dispose of expired stock');
    }
    if (stats.catering.expiringWithin7Days > 0) {
      problems.push(`${stats.catering.expiringWithin7Days} catering item(s) expiring within 7 days`);
      recs.push('Plan usage of expiring ingredients before they perish');
    }
    if (stats.catering.lowStock > 0) {
      recs.push(`${stats.catering.lowStock} catering item(s) below minimum threshold — restock soon`);
    }
  }

  if (stats.housing) {
    if (stats.housing.lowStock > 0) {
      recs.push(`${stats.housing.lowStock} housing supply item(s) below minimum threshold — reorder`);
    }
    if (stats.housing.transfersLast30Days > 0) {
      recs.push(`${stats.housing.transfersLast30Days} housing transfers made in the last 30 days`);
    }
  }

  if (stats.it) {
    if (stats.it.openIssues > 0) {
      problems.push(`${stats.it.openIssues} open IT issues across ${stats.it.services} service locations`);
      risks.push('Unresolved IT issues may disrupt administrative and academic work');
      recs.push('Assign technicians to critical IT issues first');
    }
    recs.push(`${stats.it.devices} IT devices monitored across ${stats.it.services} service points`);
  }

  recs.push('Generate weekly Excel reports to track operational trends over time');

  const summary = occRate >= 90
    ? `University residence is at ${occRate}% capacity with ${stats.activeTickets} active maintenance tickets, ${stats.catering?.expired || 0} expired catering items, and ${stats.it?.openIssues || 0} open IT issues. Immediate administrative action is recommended.`
    : `University residence is operating at ${occRate}% capacity. ${stats.students} students housed across ${stats.rooms} rooms. ${stats.activeTickets} maintenance ticket(s) active. Catering: ${stats.catering?.totalItems || 0} items tracked. IT: ${stats.it?.services || 0} services, ${stats.it?.openIssues || 0} open issues. ${stats.staff} staff users.`;

  return { summary, problems, risks, recommendations: recs };
};

// ── Main insights endpoint ───────────────────────────────────────────────────
export const getInsights = async (req, res) => {
  try {
    const stats = await getFullStats();

    const apiKey = process.env.OPENROUTER_API_KEY;
    let parsedData;
    let usedModel = null;

    if (apiKey) {
      const prompt = `
You are a university residence operations analyst for جامعة البليدة 2 (Université Lounici Ali).
Analyze this real system data and produce a comprehensive management report covering ALL departments:

--- RESIDENCE CAPACITY ---
- Total students housed: ${stats.students}
- Total rooms available: ${stats.rooms}
- Occupancy rate: ${stats.occupancyRate}%
- Students by level: ${JSON.stringify(stats.studentsByLevel)}
- Students by faculty: ${JSON.stringify(stats.studentsByFaculty)}
- Bloc / Building status: ${JSON.stringify(stats.roomsByBloc)}

--- MAINTENANCE (Tickets) ---
- Active (unresolved) tickets: ${stats.activeTickets}
- Ticket status breakdown: ${JSON.stringify(stats.ticketStatusBreakdown)}

--- CATERING (Kitchen & Food Stock) ---
- Total inventory items: ${stats.catering.totalItems}
- Expired items: ${stats.catering.expired}
- Expiring within 7 days: ${stats.catering.expiringWithin7Days}
- Low stock items: ${stats.catering.lowStock}

--- HOUSING (Supplies & Equipment) ---
- Total inventory items: ${stats.housing.totalItems}
- Low stock items: ${stats.housing.lowStock}
- Transfers in last 30 days: ${stats.housing.transfersLast30Days}

--- IT (Services, Devices, Issues) ---
- Service locations: ${stats.it.services}
- Monitored devices: ${stats.it.devices}
- Open issues: ${stats.it.openIssues}
- Issues by severity: ${JSON.stringify(stats.it.issuesBySeverity)}

--- ADMIN ---
- Staff users: ${stats.staff}
- Recent activity (last 10 entries): ${JSON.stringify(stats.recentActivity)}

Return ONLY this JSON (no markdown, no extra text):
{
  "summary": "3-4 sentence executive summary covering residence, maintenance, catering, housing, and IT. Highlight any cross-department risks.",
  "problems": ["problem 1", "problem 2", "problem 3", "problem 4"],
  "risks": ["risk 1", "risk 2", "risk 3"],
  "recommendations": ["recommendation 1", "recommendation 2", "recommendation 3", "recommendation 4"]
}`;

      try {
        const { result, model } = await fetchAIWithCascade([
          { role: 'system', content: 'You are a university operations analyst. Output ONLY valid JSON. No markdown, no code blocks.' },
          { role: 'user', content: prompt },
        ]);
        usedModel = model;
        const clean = result.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(clean);
      } catch (e) {
        console.warn('[AI] All models failed, using smart fallback:', e.message);
        parsedData = buildSmartFallback(stats);
      }
    } else {
      parsedData = buildSmartFallback(stats);
    }

    res.status(200).json({
      ...parsedData,
      _meta: {
        generatedAt: new Date().toISOString(),
        model: usedModel || 'smart-fallback',
        stats,
      },
    });

  } catch (error) {
    console.error('[AI] getInsights critical error:', error);
    res.status(500).json({ error: 'Server error while generating insights' });
  }
};

export const getMonthlyReport = async (req, res) => {
  try {
    const stats = await getFullStats();

    const prompt = `Generate a professional monthly operations report for the university residence administration at Université Lounici Ali — جامعة البليدة 2.

Use this real data from ALL departments:

--- RESIDENCE ---
Students: ${stats.students} | Rooms: ${stats.rooms} | Occupancy: ${stats.occupancyRate}%
Students by level: ${JSON.stringify(stats.studentsByLevel)}
Students by faculty: ${JSON.stringify(stats.studentsByFaculty)}
Bloc breakdown: ${JSON.stringify(stats.roomsByBloc)}

--- MAINTENANCE ---
Ticket statuses: ${JSON.stringify(stats.ticketStatusBreakdown)}

--- CATERING ---
Items tracked: ${stats.catering.totalItems} | Expired: ${stats.catering.expired} | Expiring soon: ${stats.catering.expiringWithin7Days} | Low stock: ${stats.catering.lowStock}

--- HOUSING ---
Items tracked: ${stats.housing.totalItems} | Low stock: ${stats.housing.lowStock} | Recent transfers: ${stats.housing.transfersLast30Days}

--- IT ---
Services: ${stats.it.services} | Devices: ${stats.it.devices} | Open issues: ${stats.it.openIssues} | By severity: ${JSON.stringify(stats.it.issuesBySeverity)}

Write 4-5 professional paragraphs covering residence capacity, maintenance, catering & food safety, housing supplies, IT infrastructure, and cross-department recommendations. Format as a formal letter to the university director.`;

    let report;
    try {
      const { result } = await fetchAIWithCascade([
        { role: 'system', content: 'You are a professional university administrator writing formal monthly reports in French or English.' },
        { role: 'user', content: prompt },
      ]);
      report = result;
    } catch {
      report = `Monthly Operations Report — ${new Date().toLocaleDateString('fr-DZ', { year: 'numeric', month: 'long' })}

The university residence currently houses ${stats.students} students across ${stats.rooms} rooms (${stats.occupancyRate}% occupancy). ${stats.studentsByLevel.map(l => `${l.name}: ${l.value}`).join(', ')}.

Maintenance: ${stats.activeTickets} active tickets, ${stats.ticketStatusBreakdown.map(t => `${t.status}: ${t.count}`).join(', ')}.

Catering: ${stats.catering.totalItems} items tracked — ${stats.catering.expired} expired, ${stats.catering.expiringWithin7Days} expiring within 7 days, ${stats.catering.lowStock} below minimum threshold.

Housing supplies: ${stats.housing.totalItems} items — ${stats.housing.lowStock} below threshold, ${stats.housing.transfersLast30Days} transfers in last 30 days.

IT: ${stats.it.services} service points, ${stats.it.devices} devices, ${stats.it.openIssues} open issues (${stats.it.issuesBySeverity.map(s => `${s.severity}: ${s.count}`).join(', ')}).

Administrative staff: ${stats.staff} users. This report was generated automatically from live database records.`;

    }

    res.status(200).json({ report, generated_at: new Date() });
  } catch (error) {
    console.error('[AI] getMonthlyReport error:', error);
    res.status(500).json({ error: 'Server error while generating monthly report' });
  }
};

const MODULE_PROMPTS = {
  residence: 'You are a residence capacity analyst. Analyze student housing data and provide insights on occupancy, distribution by level/faculty, and bloc-level recommendations.',
  maintenance: 'You are a maintenance operations analyst. Analyze the maintenance ticket data and provide insights on backlog, priority breakdown, and resource allocation.',
  catering: 'You are a catering and food safety analyst. Analyze the kitchen inventory data and provide insights on stock levels, expiry risks, consumption, and procurement recommendations.',
  housing: 'You are a housing supplies and logistics analyst. Analyze the housing inventory data and provide insights on stock levels, transfer activity, and reorder recommendations.',
  it: 'You are an IT infrastructure analyst. Analyze the IT services, devices, and issues data and provide insights on system health, incident priorities, and maintenance recommendations.',
  activity: 'You are an administrative audit analyst. Analyze the recent activity log data and provide insights on staff activity patterns, system usage, and operational trends.',
};

export const getModuleInsights = async (req, res) => {
  try {
    const { module } = req.params;
    const validModules = Object.keys(MODULE_PROMPTS);
    if (!validModules.includes(module)) {
      return res.status(400).json({ error: `Invalid module. Valid: ${validModules.join(', ')}` });
    }

    const data = await getModuleStats(module);
    if (!data) {
      return res.status(400).json({ error: 'Module data unavailable' });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    let parsedData;
    let usedModel = null;

    if (apiKey) {
      const prompt = `${MODULE_PROMPTS[module]}

Here is the raw system data:
${JSON.stringify(data, null, 2)}

Return ONLY this JSON (no markdown, no extra text):
{
  "summary": "2-3 sentence analysis specific to this department",
  "findings": ["finding 1", "finding 2", "finding 3"],
  "risks": ["risk 1", "risk 2"],
  "recommendations": ["action 1", "action 2", "action 3"]
}`;

      try {
        const { result, model } = await fetchAIWithCascade([
          { role: 'system', content: `You are a ${module} analyst. Output ONLY valid JSON. No markdown, no code blocks.` },
          { role: 'user', content: prompt },
        ]);
        usedModel = model;
        const clean = result.replace(/```json/g, '').replace(/```/g, '').trim();
        parsedData = JSON.parse(clean);
      } catch (e) {
        console.warn(`[AI] ${module} module analysis failed, using raw data:`, e.message);
        parsedData = { summary: `${module} data retrieved`, findings: [`${Object.keys(data).length} data fields available`], risks: [], recommendations: ['Enable AI API for deeper analysis'] };
      }
    } else {
      parsedData = { summary: `${module} data retrieved`, findings: [`${Object.keys(data).length} data fields available`], risks: [], recommendations: ['Configure OPENROUTER_API_KEY for AI analysis'] };
    }

    res.status(200).json({ module, data, analysis: parsedData, _meta: { generatedAt: new Date().toISOString(), model: usedModel || 'raw-data' } });
  } catch (error) {
    console.error('[AI] getModuleInsights error:', error);
    res.status(500).json({ error: 'Server error while generating module insights' });
  }
};

export const queryAI = async (req, res) => {
  try {
    const { question } = req.body;
    if (!question || typeof question !== 'string' || question.trim().length === 0) {
      return res.status(400).json({ error: 'Please provide a question' });
    }

    const stats = await getFullStats();

    const apiKey = process.env.OPENROUTER_API_KEY;
    let answer;
    let usedModel = null;

    if (apiKey) {
      const prompt = `You are a university residence AI assistant with access to the full system database. Answer the user's question using ONLY the provided data. If the data doesn't contain enough information, say so.

SYSTEM DATA (live from database):
${JSON.stringify(stats, null, 2)}

USER QUESTION: ${question.trim()}

Provide a concise, factual answer based on the data above. If you cannot answer from the data, suggest what data would be needed.`;

      try {
        const { result, model } = await fetchAIWithCascade([
          { role: 'system', content: 'You are a data-driven assistant for a university residence management system. Answer questions based ONLY on the provided data.' },
          { role: 'user', content: prompt },
        ]);
        usedModel = model;
        answer = result;
      } catch (e) {
        console.warn('[AI] Query failed:', e.message);
        answer = 'AI service unavailable. Please try again later or contact IT support.';
      }
    } else {
      answer = 'AI query service is not configured. Set OPENROUTER_API_KEY to enable natural language queries.';
    }

    res.status(200).json({ question: question.trim(), answer, _meta: { generatedAt: new Date().toISOString(), model: usedModel || 'offline' } });
  } catch (error) {
    console.error('[AI] queryAI error:', error);
    res.status(500).json({ error: 'Server error while processing query' });
  }
};

export const snapshotStats = async (req, res) => {
  try {
    const stats = await getFullStats();
    await storeSnapshot(stats);
    await logActivity(req, req.user.id, 'AI Snapshot', 'Manual stats snapshot stored');
    res.status(201).json({ message: 'Snapshot stored', snapshot_date: new Date().toISOString().split('T')[0], stats });
  } catch (error) {
    console.error('[AI] snapshotStats error:', error);
    res.status(500).json({ error: 'Server error while storing snapshot' });
  }
};

export const compareSnapshots = async (req, res) => {
  try {
    const snapshots = await getLatestSnapshots(2);
    if (snapshots.length < 2) {
      const current = await getFullStats();
      return res.status(200).json({
        message: 'Only one snapshot available. Take another snapshot tomorrow for comparison.',
        current, previous: null, changes: [],
      });
    }

    const [latest, previous] = snapshots;
    const curr = latest.data;
    const prev = previous.data;

    const changes = [];
    const diffFields = ['students', 'rooms', 'activeTickets', 'occupancyRate', 'staff'];
    diffFields.forEach(f => {
      const diff = (curr[f] || 0) - (prev[f] || 0);
      if (diff !== 0) {
        changes.push({ field: f, from: prev[f], to: curr[f], change: diff > 0 ? 'increase' : 'decrease', absolute: diff });
      }
    });

    if (curr.catering && prev.catering) {
      const catDiff = (curr.catering.expired || 0) - (prev.catering.expired || 0);
      if (catDiff !== 0) changes.push({ field: 'catering.expired', from: prev.catering.expired, to: curr.catering.expired, change: catDiff > 0 ? 'increase' : 'decrease', absolute: catDiff });
    }

    if (curr.it && prev.it) {
      const itDiff = (curr.it.openIssues || 0) - (prev.it.openIssues || 0);
      if (itDiff !== 0) changes.push({ field: 'it.openIssues', from: prev.it.openIssues, to: curr.it.openIssues, change: itDiff > 0 ? 'increase' : 'decrease', absolute: itDiff });
    }

    const apiKey = process.env.OPENROUTER_API_KEY;
    let analysis = null;
    if (apiKey && changes.length > 0) {
      const prompt = `Compare these two system snapshots and explain the key changes:

SNAPSHOT FROM ${previous.snapshot_date}:
${JSON.stringify(prev, null, 2)}

SNAPSHOT FROM ${latest.snapshot_date} (current):
${JSON.stringify(curr, null, 2)}

DETECTED CHANGES: ${JSON.stringify(changes)}

Return ONLY this JSON:
{
  "summary": "1-2 sentence overview of what changed between the two periods",
  "notableChanges": ["change 1", "change 2"],
  "actionItems": ["item 1", "item 2"]
}`;

      try {
        const { result } = await fetchAIWithCascade([
          { role: 'system', content: 'You are a trend analyst. Output ONLY valid JSON.' },
          { role: 'user', content: prompt },
        ]);
        analysis = JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim());
      } catch {
        analysis = null;
      }
    }

    res.status(200).json({ snapshotDate: latest.snapshot_date, previousDate: previous.snapshot_date, current: curr, previous: prev, changes, analysis, _meta: { generatedAt: new Date().toISOString() } });
  } catch (error) {
    console.error('[AI] compareSnapshots error:', error);
    res.status(500).json({ error: 'Server error while comparing snapshots' });
  }
};

export const compareModules = async (req, res) => {
  try {
    const valid = ['residence', 'maintenance', 'catering', 'housing', 'it'];
    const { a, b } = req.query;
    if (!a || !b || !valid.includes(a) || !valid.includes(b)) {
      return res.status(400).json({ error: `Provide two modules: ?a=module&b=module. Valid: ${valid.join(', ')}` });
    }
    if (a === b) {
      return res.status(400).json({ error: 'Cannot compare a module with itself' });
    }

    const [dataA, dataB] = await Promise.all([getModuleStats(a), getModuleStats(b)]);

    const apiKey = process.env.OPENROUTER_API_KEY;
    let analysis;
    let usedModel = null;

    if (apiKey) {
      const prompt = `You are a cross-department analyst for a university residence. Compare these two modules and find correlations, tensions, or opportunities.

MODULE A (${a}):
${JSON.stringify(dataA, null, 2)}

MODULE B (${b}):
${JSON.stringify(dataB, null, 2)}

Return ONLY this JSON:
{
  "summary": "2-3 sentence cross-module analysis. Highlight any relationships between the two areas.",
  "correlations": ["finding 1", "finding 2"],
  "conflicts": ["tension or trade-off 1"],
  "recommendations": ["action 1", "action 2"]
}`;

      try {
        const { result, model } = await fetchAIWithCascade([
          { role: 'system', content: 'You are a cross-department analyst. Output ONLY valid JSON.' },
          { role: 'user', content: prompt },
        ]);
        usedModel = model;
        analysis = JSON.parse(result.replace(/```json/g, '').replace(/```/g, '').trim());
      } catch (e) {
        console.warn('[AI] Module comparison failed:', e.message);
        analysis = null;
      }
    }

    res.status(200).json({ moduleA: a, moduleB: b, comparison: analysis, dataA, dataB, _meta: { generatedAt: new Date().toISOString(), model: usedModel || 'raw' } });
  } catch (error) {
    console.error('[AI] compareModules error:', error);
    res.status(500).json({ error: 'Server error while comparing modules' });
  }
};

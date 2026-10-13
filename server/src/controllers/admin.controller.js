const { db, seedDatabase } = require('../database/db');
const { knowledgeBase } = require('../services/ai.service');

function getDashboardStats(req, res) {
  // Ticket counts by status
  const statusCounts = db.prepare(`
    SELECT status, COUNT(*) AS count 
    FROM tickets 
    GROUP BY status
  `).all();

  const statusMap = { Open: 0, 'In Progress': 0, Resolved: 0, Closed: 0 };
  statusCounts.forEach(r => { statusMap[r.status] = r.count; });

  const totalTickets = db.prepare('SELECT COUNT(*) AS total FROM tickets').get().total;

  // Urgent counts
  const urgentCount = db.prepare(`
    SELECT COUNT(*) AS count 
    FROM tickets 
    WHERE status IN ('Open', 'In Progress') 
      AND (COALESCE(priority_override, ai_priority) IN ('Critical', 'High'))
  `).get().count;

  // Category breakdown
  const categoryCounts = db.prepare(`
    SELECT COALESCE(category_override, ai_category) AS category, COUNT(*) AS count 
    FROM tickets 
    GROUP BY category
  `).all();

  // Overrides count
  const overriddenCount = db.prepare(`
    SELECT COUNT(*) AS count 
    FROM tickets 
    WHERE category_override IS NOT NULL OR priority_override IS NOT NULL
  `).get().count;

  // Financial catalog summary
  const financialSummary = db.prepare(`
    SELECT 
      COUNT(*) AS total_books,
      SUM(total_copies_sold) AS total_copies_sold,
      SUM(total_royalty_earned) AS total_royalty_earned,
      SUM(royalty_paid) AS total_royalty_paid,
      SUM(royalty_pending) AS total_royalty_pending
    FROM books
  `).get();

  // Author count
  const authorCount = db.prepare('SELECT COUNT(*) AS count FROM authors').get().count;

  // Average response time simulation based on resolved tickets
  const resolvedTickets = db.prepare(`
    SELECT created_at, updated_at 
    FROM tickets 
    WHERE status IN ('Resolved', 'Closed')
  `).all();

  let avgHoursToResolve = 18; // default SLA baseline
  if (resolvedTickets.length > 0) {
    const totalDiffHours = resolvedTickets.reduce((acc, t) => {
      const diff = (new Date(t.updated_at).getTime() - new Date(t.created_at).getTime()) / (1000 * 60 * 60);
      return acc + (diff > 0 ? diff : 1);
    }, 0);
    avgHoursToResolve = Math.round((totalDiffHours / resolvedTickets.length) * 10) / 10;
  }

  return res.json({
    success: true,
    stats: {
      total_tickets: totalTickets,
      status_breakdown: statusMap,
      urgent_unresolved: urgentCount,
      category_breakdown: categoryCounts,
      ai_overridden_tickets: overriddenCount,
      ai_agreement_rate: totalTickets > 0 ? Math.round(((totalTickets - overriddenCount) / totalTickets) * 100) : 100,
      avg_hours_to_resolve: avgHoursToResolve,
      authors_count: authorCount,
      financials: financialSummary
    }
  });
}

function getAuthors(req, res) {
  const authors = db.prepare(`
    SELECT 
      a.id, a.name, a.email, a.phone, a.country, a.city, a.package, a.bank_details_json, a.created_at,
      COUNT(DISTINCT b.id) AS book_count,
      COALESCE(SUM(b.total_copies_sold), 0) AS total_copies_sold,
      COALESCE(SUM(b.total_royalty_earned), 0) AS total_royalty_earned,
      COALESCE(SUM(b.royalty_paid), 0) AS royalty_paid,
      COALESCE(SUM(b.royalty_pending), 0) AS royalty_pending,
      (SELECT COUNT(*) FROM tickets WHERE author_id = a.id AND status IN ('Open', 'In Progress')) AS open_tickets_count
    FROM authors a
    LEFT JOIN books b ON a.id = b.author_id
    GROUP BY a.id
    ORDER BY total_copies_sold DESC
  `).all();

  const formatted = authors.map(author => {
    let bankDetails = {};
    try { bankDetails = JSON.parse(author.bank_details_json || '{}'); } catch (e) {}
    return {
      ...author,
      bank_details: bankDetails
    };
  });

  return res.json({
    success: true,
    count: formatted.length,
    authors: formatted
  });
}

function getKnowledgeBase(req, res) {
  return res.json({
    success: true,
    knowledge_base: knowledgeBase
  });
}

function resetSeed(req, res) {
  try {
    const result = seedDatabase(true);
    return res.json({
      success: true,
      message: 'System database successfully reset and re-seeded with 10 authors, 18 books, and 7 tickets.',
      result
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      error: { code: 'RESET_FAILED', message: err.message }
    });
  }
}

module.exports = {
  getDashboardStats,
  getAuthors,
  getKnowledgeBase,
  resetSeed
};

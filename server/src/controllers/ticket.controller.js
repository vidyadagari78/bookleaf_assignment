const { db } = require('../database/db');
const { classifyAndScoreTicket, generateAiDraftResponse } = require('../services/ai.service');
const { broadcastEvent } = require('../services/websocket.service');
const { z } = require('zod');

const createTicketSchema = z.object({
  book_id: z.string().nullable().optional(),
  subject: z.string().min(3, 'Subject must be at least 3 characters long'),
  description: z.string().min(5, 'Description must be at least 5 characters long'),
  attachment_url: z.string().nullable().optional(),
  attachment_name: z.string().nullable().optional()
});

const addMessageSchema = z.object({
  message: z.string().min(1, 'Message cannot be empty'),
  update_status_to: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']).optional()
});

const updateTicketSchema = z.object({
  status: z.enum(['Open', 'In Progress', 'Resolved', 'Closed']).optional(),
  category_override: z.string().nullable().optional(),
  priority_override: z.enum(['Critical', 'High', 'Medium', 'Low']).nullable().optional(),
  assigned_to: z.string().nullable().optional()
});

const addNoteSchema = z.object({
  note: z.string().min(1, 'Internal note cannot be empty')
});

function getTickets(req, res) {
  const isAuthor = req.user.role === 'author';
  const {
    status,
    category,
    priority,
    authorId,
    bookId,
    search,
    sort = 'newest'
  } = req.query;

  let query = `
    SELECT 
      t.*,
      a.name AS author_name,
      a.email AS author_email,
      a.country AS author_country,
      b.title AS book_title,
      b.isbn AS book_isbn,
      b.status AS book_status,
      b.royalty_pending AS book_royalty_pending,
      adm.name AS assigned_to_name,
      (SELECT COUNT(*) FROM ticket_messages WHERE ticket_id = t.id) AS message_count,
      (SELECT COUNT(*) FROM internal_notes WHERE ticket_id = t.id) AS note_count
    FROM tickets t
    JOIN authors a ON t.author_id = a.id
    LEFT JOIN books b ON t.book_id = b.id
    LEFT JOIN admins adm ON t.assigned_to = adm.id
  `;

  const whereClauses = [];
  const params = [];

  if (isAuthor) {
    whereClauses.push('t.author_id = ?');
    params.push(req.user.id);
  } else if (authorId) {
    whereClauses.push('t.author_id = ?');
    params.push(authorId);
  }

  if (bookId) {
    whereClauses.push('t.book_id = ?');
    params.push(bookId);
  }

  if (status && status !== 'All') {
    whereClauses.push('t.status = ?');
    params.push(status);
  }

  if (category && category !== 'All') {
    whereClauses.push('(COALESCE(t.category_override, t.ai_category) = ?)');
    params.push(category);
  }

  if (priority && priority !== 'All') {
    whereClauses.push('(COALESCE(t.priority_override, t.ai_priority) = ?)');
    params.push(priority);
  }

  if (search && search.trim() !== '') {
    const term = `%${search.trim().toLowerCase()}%`;
    whereClauses.push(`(
      LOWER(t.subject) LIKE ? OR 
      LOWER(t.description) LIKE ? OR 
      LOWER(a.name) LIKE ? OR 
      LOWER(COALESCE(b.title, '')) LIKE ? OR 
      LOWER(t.id) LIKE ?
    )`);
    params.push(term, term, term, term, term);
  }

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }

  // Sorting
  switch (sort) {
    case 'oldest':
      query += ' ORDER BY t.created_at ASC';
      break;
    case 'oldest_unresolved':
      query += ` ORDER BY CASE WHEN t.status IN ('Open', 'In Progress') THEN 0 ELSE 1 END, t.created_at ASC`;
      break;
    case 'priority_desc':
      query += ` ORDER BY t.ai_priority_score DESC, t.created_at DESC`;
      break;
    case 'newest':
    default:
      query += ' ORDER BY t.created_at DESC';
      break;
  }

  const rows = db.prepare(query).all(...params);

  // Mark urgent flags for admin queue
  const enrichedTickets = rows.map(t => {
    const effectiveCategory = t.category_override || t.ai_category;
    const effectivePriority = t.priority_override || t.ai_priority;

    // A ticket is considered urgent if Critical, High, or if it has been open for > 48 hours
    const ageHours = (Date.now() - new Date(t.created_at).getTime()) / (1000 * 60 * 60);
    const isUrgent = (effectivePriority === 'Critical' || effectivePriority === 'High') && t.status !== 'Resolved' && t.status !== 'Closed';
    const isOverdue = ageHours > 48 && t.status !== 'Resolved' && t.status !== 'Closed';

    return {
      ...t,
      effective_category: effectiveCategory,
      effective_priority: effectivePriority,
      is_urgent: isUrgent,
      is_overdue: isOverdue,
      age_hours: Math.round(ageHours)
    };
  });

  return res.json({
    success: true,
    count: enrichedTickets.length,
    tickets: enrichedTickets
  });
}

function getTicketById(req, res) {
  const { id } = req.params;
  const isAuthor = req.user.role === 'author';

  const ticket = db.prepare(`
    SELECT 
      t.*,
      a.name AS author_name,
      a.email AS author_email,
      a.country AS author_country,
      a.city AS author_city,
      a.package AS author_package,
      a.bank_details_json,
      b.title AS book_title,
      b.isbn AS book_isbn,
      b.status AS book_status,
      b.production_stage AS book_production_stage,
      b.mrp AS book_mrp,
      b.total_copies_sold AS book_total_copies_sold,
      b.total_royalty_earned AS book_total_royalty_earned,
      b.royalty_paid AS book_royalty_paid,
      b.royalty_pending AS book_royalty_pending,
      adm.name AS assigned_to_name
    FROM tickets t
    JOIN authors a ON t.author_id = a.id
    LEFT JOIN books b ON t.book_id = b.id
    LEFT JOIN admins adm ON t.assigned_to = adm.id
    WHERE t.id = ?
  `).get(id);

  if (!ticket) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Ticket not found.' }
    });
  }

  // Authorization check
  if (isAuthor && ticket.author_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You do not have permission to view this ticket.' }
    });
  }

  // Fetch messages thread
  const messages = db.prepare(`
    SELECT * FROM ticket_messages 
    WHERE ticket_id = ? 
    ORDER BY created_at ASC
  `).all(id);

  // Fetch internal notes strictly for admins
  let internalNotes = [];
  if (!isAuthor) {
    internalNotes = db.prepare(`
      SELECT * FROM internal_notes 
      WHERE ticket_id = ? 
      ORDER BY created_at ASC
    `).all(id);
  }

  // Parse author bank details
  let bankDetails = {};
  try {
    bankDetails = JSON.parse(ticket.bank_details_json || '{}');
  } catch (e) {}

  return res.json({
    success: true,
    ticket: {
      ...ticket,
      effective_category: ticket.category_override || ticket.ai_category,
      effective_priority: ticket.priority_override || ticket.ai_priority,
      author_bank_details: bankDetails,
      messages,
      internal_notes: internalNotes // hidden from author
    }
  });
}

async function createTicket(req, res) {
  const parseResult = createTicketSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Invalid ticket input.',
        details: parseResult.error.issues
      }
    });
  }

  const { book_id, subject, description, attachment_url, attachment_name } = parseResult.data;
  const authorId = req.user.id;

  // Retrieve book if provided
  let book = null;
  if (book_id) {
    book = db.prepare('SELECT * FROM books WHERE id = ?').get(book_id);
    if (!book && req.user.role === 'author') {
      return res.status(400).json({
        success: false,
        error: { code: 'INVALID_BOOK', message: 'Selected book not found.' }
      });
    }
  }

  // Auto-classify and calculate priority score
  const aiResult = classifyAndScoreTicket(subject, description, book);

  const ticketId = `tkt-${Math.floor(100 + Math.random() * 900)}`;
  const messageId = `msg-${ticketId}-1`;
  const now = new Date().toISOString();

  const insertTicket = db.prepare(`
    INSERT INTO tickets (
      id, author_id, book_id, subject, description, attachment_url, attachment_name,
      status, ai_category, ai_priority, ai_priority_score, ai_rationale,
      category_override, priority_override, assigned_to, created_at, updated_at
    )
    VALUES (
      @id, @author_id, @book_id, @subject, @description, @attachment_url, @attachment_name,
      'Open', @ai_category, @ai_priority, @ai_priority_score, @ai_rationale,
      NULL, NULL, NULL, @created_at, @updated_at
    )
  `);

  const insertMessage = db.prepare(`
    INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_role, sender_name, message, created_at)
    VALUES (@id, @ticket_id, @sender_id, @sender_role, @sender_name, @message, @created_at)
  `);

  const tx = db.transaction(() => {
    insertTicket.run({
      id: ticketId,
      author_id: authorId,
      book_id: book_id || null,
      subject,
      description,
      attachment_url: attachment_url || null,
      attachment_name: attachment_name || null,
      ai_category: aiResult.category,
      ai_priority: aiResult.priority,
      ai_priority_score: aiResult.score,
      ai_rationale: aiResult.rationale,
      created_at: now,
      updated_at: now
    });

    insertMessage.run({
      id: messageId,
      ticket_id: ticketId,
      sender_id: authorId,
      sender_role: 'author',
      sender_name: req.user.name,
      message: description,
      created_at: now
    });
  });

  tx();

  const createdTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(ticketId);

  // Broadcast WebSocket notification to admins
  broadcastEvent('TICKET_CREATED', {
    ticket_id: ticketId,
    author_name: req.user.name,
    subject,
    ai_category: aiResult.category,
    ai_priority: aiResult.priority,
    ai_priority_score: aiResult.score,
    created_at: now
  });

  return res.status(201).json({
    success: true,
    message: 'Support ticket raised successfully.',
    ticket: {
      ...createdTicket,
      effective_category: createdTicket.ai_category,
      effective_priority: createdTicket.ai_priority
    }
  });
}

function addMessage(req, res) {
  const { id } = req.params;
  const parseResult = addMessageSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Message cannot be empty.',
        details: parseResult.error.issues
      }
    });
  }

  const { message, update_status_to } = parseResult.data;
  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);

  if (!ticket) {
    return res.status(404).json({ success: false, error: { message: 'Ticket not found.' } });
  }

  // Authorization check
  if (req.user.role === 'author' && ticket.author_id !== req.user.id) {
    return res.status(403).json({ success: false, error: { message: 'Unauthorized.' } });
  }

  const messageId = `msg-${id}-${Date.now().toString().slice(-4)}`;
  const now = new Date().toISOString();

  let nextStatus = ticket.status;
  if (req.user.role === 'author') {
    // If ticket was resolved/closed and author replies, mark In Progress
    if (ticket.status === 'Resolved' || ticket.status === 'Closed') {
      nextStatus = 'In Progress';
    }
  } else if (req.user.role === 'admin') {
    if (update_status_to) {
      nextStatus = update_status_to;
    } else if (ticket.status === 'Open') {
      nextStatus = 'In Progress';
    }
  }

  const tx = db.transaction(() => {
    db.prepare(`
      INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_role, sender_name, message, created_at)
      VALUES (?, ?, ?, ?, ?, ?, ?)
    `).run(messageId, id, req.user.id, req.user.role, req.user.name, message, now);

    db.prepare(`
      UPDATE tickets SET status = ?, updated_at = ? WHERE id = ?
    `).run(nextStatus, now, id);
  });

  tx();

  const newMessage = {
    id: messageId,
    ticket_id: id,
    sender_id: req.user.id,
    sender_role: req.user.role,
    sender_name: req.user.name,
    message,
    created_at: now
  };

  // Broadcast WebSocket update to both Author and Admins
  broadcastEvent('MESSAGE_ADDED', {
    ticket_id: id,
    status: nextStatus,
    message: newMessage
  }, ticket.author_id);

  return res.json({
    success: true,
    message: newMessage,
    ticket_status: nextStatus
  });
}

function updateTicket(req, res) {
  const { id } = req.params;
  const parseResult = updateTicketSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Invalid update payload.' }
    });
  }

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
  if (!ticket) {
    return res.status(404).json({ success: false, error: { message: 'Ticket not found.' } });
  }

  const updates = parseResult.data;
  const now = new Date().toISOString();

  const newStatus = updates.status !== undefined ? updates.status : ticket.status;
  const newCatOverride = updates.category_override !== undefined ? updates.category_override : ticket.category_override;
  const newPriOverride = updates.priority_override !== undefined ? updates.priority_override : ticket.priority_override;
  const newAssignedTo = updates.assigned_to !== undefined ? updates.assigned_to : ticket.assigned_to;

  db.prepare(`
    UPDATE tickets 
    SET status = ?, category_override = ?, priority_override = ?, assigned_to = ?, updated_at = ?
    WHERE id = ?
  `).run(newStatus, newCatOverride, newPriOverride, newAssignedTo, now, id);

  const updatedTicket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);

  // Broadcast update to Author and Admins
  broadcastEvent('TICKET_UPDATED', {
    ticket_id: id,
    status: newStatus,
    category_override: newCatOverride,
    priority_override: newPriOverride,
    assigned_to: newAssignedTo,
    effective_category: newCatOverride || updatedTicket.ai_category,
    effective_priority: newPriOverride || updatedTicket.ai_priority,
    updated_at: now
  }, ticket.author_id);

  return res.json({
    success: true,
    message: 'Ticket updated successfully.',
    ticket: {
      ...updatedTicket,
      effective_category: newCatOverride || updatedTicket.ai_category,
      effective_priority: newPriOverride || updatedTicket.ai_priority
    }
  });
}

function addInternalNote(req, res) {
  const { id } = req.params;
  const parseResult = addNoteSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: { code: 'VALIDATION_ERROR', message: 'Internal note text is required.' }
    });
  }

  const ticket = db.prepare('SELECT id FROM tickets WHERE id = ?').get(id);
  if (!ticket) {
    return res.status(404).json({ success: false, error: { message: 'Ticket not found.' } });
  }

  const noteId = `note-${id}-${Date.now().toString().slice(-4)}`;
  const now = new Date().toISOString();

  db.prepare(`
    INSERT INTO internal_notes (id, ticket_id, admin_id, admin_name, note, created_at)
    VALUES (?, ?, ?, ?, ?, ?)
  `).run(noteId, id, req.user.id, req.user.name, parseResult.data.note, now);

  const newNote = {
    id: noteId,
    ticket_id: id,
    admin_id: req.user.id,
    admin_name: req.user.name,
    note: parseResult.data.note,
    created_at: now
  };

  // Broadcast only to Admins (strictly hidden from author)
  broadcastEvent('NOTE_ADDED', {
    ticket_id: id,
    note: newNote
  });

  return res.json({
    success: true,
    note: newNote
  });
}

async function generateAiDraft(req, res) {
  const { id } = req.params;
  const toneStyle = req.body?.toneStyle || 'Empathetic & Professional';

  const ticket = db.prepare('SELECT * FROM tickets WHERE id = ?').get(id);
  if (!ticket) {
    return res.status(404).json({ success: false, error: { message: 'Ticket not found.' } });
  }

  const author = db.prepare('SELECT * FROM authors WHERE id = ?').get(ticket.author_id);
  const book = ticket.book_id ? db.prepare('SELECT * FROM books WHERE id = ?').get(ticket.book_id) : null;

  try {
    const aiResult = await generateAiDraftResponse({
      ticket,
      author,
      book,
      toneStyle
    });

    return res.json({
      success: true,
      draft: aiResult.draft,
      metadata: {
        category: aiResult.category,
        priority: aiResult.priority,
        priority_score: aiResult.priority_score,
        rationale: aiResult.rationale,
        provider: aiResult.provider,
        tokens_used: aiResult.tokens_used,
        cost_savings: aiResult.cost_savings,
        is_fallback: aiResult.is_fallback
      }
    });
  } catch (err) {
    console.error('Error generating AI draft:', err);
    return res.status(500).json({
      success: false,
      error: { code: 'AI_ERROR', message: 'Failed to generate AI draft.' }
    });
  }
}

module.exports = {
  getTickets,
  getTicketById,
  createTicket,
  addMessage,
  updateTicket,
  addInternalNote,
  generateAiDraft
};

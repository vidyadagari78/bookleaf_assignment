const { db } = require('../database/db');

function getBooks(req, res) {
  const isAuthor = req.user.role === 'author';
  const authorIdQuery = req.query.authorId;
  const statusFilter = req.query.status;

  let query = 'SELECT * FROM books';
  const params = [];
  const whereClauses = [];

  if (isAuthor) {
    whereClauses.push('author_id = ?');
    params.push(req.user.id);
  } else if (authorIdQuery) {
    whereClauses.push('author_id = ?');
    params.push(authorIdQuery);
  }

  if (statusFilter && statusFilter !== 'All') {
    whereClauses.push('status = ?');
    params.push(statusFilter);
  }

  if (whereClauses.length > 0) {
    query += ' WHERE ' + whereClauses.join(' AND ');
  }

  query += ' ORDER BY created_at DESC';

  const rows = db.prepare(query).all(...params);

  const formattedBooks = rows.map(book => {
    let distribution = [];
    let salesBreakdown = {};
    let productionDetails = {};

    try { distribution = JSON.parse(book.distribution_platforms_json || '[]'); } catch (e) {}
    try { salesBreakdown = JSON.parse(book.sales_breakdown_json || '{}'); } catch (e) {}
    try { productionDetails = JSON.parse(book.production_details_json || '{}'); } catch (e) {}

    // Get author name if admin
    let authorName = null;
    if (!isAuthor) {
      const a = db.prepare('SELECT name FROM authors WHERE id = ?').get(book.author_id);
      authorName = a ? a.name : null;
    }

    return {
      ...book,
      author_name: authorName,
      distribution_platforms: distribution,
      sales_breakdown: salesBreakdown,
      production_details: productionDetails
    };
  });

  // Calculate summary metrics for the author
  const summary = {
    total_books: formattedBooks.length,
    published_books: formattedBooks.filter(b => b.status === 'Published').length,
    in_production: formattedBooks.filter(b => b.status === 'In Production').length,
    total_copies_sold: formattedBooks.reduce((sum, b) => sum + (b.total_copies_sold || 0), 0),
    total_royalty_earned: formattedBooks.reduce((sum, b) => sum + (b.total_royalty_earned || 0), 0),
    royalty_paid: formattedBooks.reduce((sum, b) => sum + (b.royalty_paid || 0), 0),
    royalty_pending: formattedBooks.reduce((sum, b) => sum + (b.royalty_pending || 0), 0)
  };

  return res.json({
    success: true,
    summary,
    books: formattedBooks
  });
}

function getBookById(req, res) {
  const { id } = req.params;
  const book = db.prepare('SELECT * FROM books WHERE id = ?').get(id);

  if (!book) {
    return res.status(404).json({
      success: false,
      error: { code: 'NOT_FOUND', message: 'Book not found.' }
    });
  }

  // Authorization check: Authors can only view their own books
  if (req.user.role === 'author' && book.author_id !== req.user.id) {
    return res.status(403).json({
      success: false,
      error: { code: 'FORBIDDEN', message: 'You do not have permission to view this book.' }
    });
  }

  let distribution = [];
  let salesBreakdown = {};
  let productionDetails = {};

  try { distribution = JSON.parse(book.distribution_platforms_json || '[]'); } catch (e) {}
  try { salesBreakdown = JSON.parse(book.sales_breakdown_json || '{}'); } catch (e) {}
  try { productionDetails = JSON.parse(book.production_details_json || '{}'); } catch (e) {}

  const author = db.prepare('SELECT id, name, email, country, package FROM authors WHERE id = ?').get(book.author_id);

  // Tickets associated with this book
  const tickets = db.prepare('SELECT id, subject, status, created_at FROM tickets WHERE book_id = ? ORDER BY created_at DESC').all(id);

  return res.json({
    success: true,
    book: {
      ...book,
      author,
      distribution_platforms: distribution,
      sales_breakdown: salesBreakdown,
      production_details: productionDetails,
      tickets
    }
  });
}

module.exports = {
  getBooks,
  getBookById
};

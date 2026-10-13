const Database = require('better-sqlite3');
const path = require('path');
const fs = require('fs');
const bcrypt = require('bcryptjs');

const DB_DIR = path.join(__dirname, '..', '..', 'data');
if (!fs.existsSync(DB_DIR)) {
  fs.mkdirSync(DB_DIR, { recursive: true });
}

const DB_PATH = process.env.DB_PATH || path.join(DB_DIR, 'bookleaf.db');
const db = new Database(DB_PATH);

// Enable WAL mode for high concurrency & foreign keys
db.pragma('journal_mode = WAL');
db.pragma('foreign_keys = ON');

function initSchema() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS authors (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      phone TEXT,
      country TEXT DEFAULT 'India',
      city TEXT,
      bank_details_json TEXT,
      package TEXT DEFAULT 'Standard Free',
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS admins (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT DEFAULT 'admin',
      title TEXT,
      avatar TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS books (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
      title TEXT NOT NULL,
      isbn TEXT,
      genre TEXT,
      publication_date TEXT,
      status TEXT NOT NULL,
      production_stage TEXT DEFAULT 'Published & Live',
      mrp REAL NOT NULL,
      currency TEXT DEFAULT 'INR',
      page_count INTEGER,
      printing_partner TEXT,
      package TEXT,
      total_copies_sold INTEGER DEFAULT 0,
      total_royalty_earned REAL DEFAULT 0,
      royalty_paid REAL DEFAULT 0,
      royalty_pending REAL DEFAULT 0,
      distribution_platforms_json TEXT,
      stock_status TEXT DEFAULT 'In Stock',
      production_details_json TEXT,
      sales_breakdown_json TEXT,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tickets (
      id TEXT PRIMARY KEY,
      author_id TEXT NOT NULL REFERENCES authors(id) ON DELETE CASCADE,
      book_id TEXT REFERENCES books(id) ON DELETE SET NULL,
      subject TEXT NOT NULL,
      description TEXT NOT NULL,
      attachment_url TEXT,
      attachment_name TEXT,
      status TEXT NOT NULL DEFAULT 'Open',
      ai_category TEXT NOT NULL,
      ai_priority TEXT NOT NULL,
      ai_priority_score INTEGER DEFAULT 50,
      ai_rationale TEXT,
      category_override TEXT,
      priority_override TEXT,
      assigned_to TEXT REFERENCES admins(id) ON DELETE SET NULL,
      created_at TEXT NOT NULL,
      updated_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ticket_messages (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      sender_id TEXT NOT NULL,
      sender_role TEXT NOT NULL,
      sender_name TEXT NOT NULL,
      message TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS internal_notes (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      admin_id TEXT NOT NULL REFERENCES admins(id) ON DELETE CASCADE,
      admin_name TEXT NOT NULL,
      note TEXT NOT NULL,
      created_at TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS ai_drafts (
      id TEXT PRIMARY KEY,
      ticket_id TEXT NOT NULL REFERENCES tickets(id) ON DELETE CASCADE,
      draft_text TEXT NOT NULL,
      category_detected TEXT,
      priority_detected TEXT,
      tokens_used INTEGER,
      provider TEXT,
      created_at TEXT NOT NULL
    );

    CREATE INDEX IF NOT EXISTS idx_books_author_id ON books(author_id);
    CREATE INDEX IF NOT EXISTS idx_tickets_author_id ON tickets(author_id);
    CREATE INDEX IF NOT EXISTS idx_tickets_status ON tickets(status);
    CREATE INDEX IF NOT EXISTS idx_tickets_created_at ON tickets(created_at);
    CREATE INDEX IF NOT EXISTS idx_messages_ticket_id ON ticket_messages(ticket_id);
    CREATE INDEX IF NOT EXISTS idx_notes_ticket_id ON internal_notes(ticket_id);
  `);
}

function seedDatabase(force = false) {
  initSchema();

  const authorCount = db.prepare('SELECT COUNT(*) AS count FROM authors').get().count;
  if (authorCount > 0 && !force) {
    return { seeded: false, message: 'Database already populated with existing records.' };
  }

  // Load sample dataset
  const sampleDataPath = path.join(__dirname, '..', 'data', 'bookleaf_sample_data.json');
  if (!fs.existsSync(sampleDataPath)) {
    throw new Error(`Sample data file not found at ${sampleDataPath}`);
  }

  const sampleData = JSON.parse(fs.readFileSync(sampleDataPath, 'utf8'));

  // Transaction for atomic wipe and seed
  const runSeed = db.transaction(() => {
    if (force) {
      db.exec(`
        DELETE FROM ai_drafts;
        DELETE FROM internal_notes;
        DELETE FROM ticket_messages;
        DELETE FROM tickets;
        DELETE FROM books;
        DELETE FROM admins;
        DELETE FROM authors;
      `);
    }

    const salt = bcrypt.genSaltSync(10);
    const defaultAuthorHash = bcrypt.hashSync('password123', salt);
    const defaultAdminHash = bcrypt.hashSync('adminpassword123', salt);

    // Insert Authors
    const insertAuthor = db.prepare(`
      INSERT INTO authors (id, name, email, password_hash, phone, country, city, bank_details_json, package, created_at)
      VALUES (@id, @name, @email, @password_hash, @phone, @country, @city, @bank_details_json, @package, @created_at)
    `);

    for (const author of sampleData.authors) {
      insertAuthor.run({
        id: author.id,
        name: author.name,
        email: author.email.toLowerCase(),
        password_hash: defaultAuthorHash,
        phone: author.phone || null,
        country: author.country || 'India',
        city: author.city || null,
        bank_details_json: JSON.stringify(author.bank_details || {}),
        package: author.package || 'Standard Free',
        created_at: author.created_at || new Date().toISOString()
      });
    }

    // Insert Admins
    const insertAdmin = db.prepare(`
      INSERT INTO admins (id, name, email, password_hash, role, title, avatar, created_at)
      VALUES (@id, @name, @email, @password_hash, @role, @title, @avatar, @created_at)
    `);

    for (const admin of sampleData.admins) {
      insertAdmin.run({
        id: admin.id,
        name: admin.name,
        email: admin.email.toLowerCase(),
        password_hash: defaultAdminHash,
        role: admin.role || 'admin',
        title: admin.title || 'Support Representative',
        avatar: admin.avatar || null,
        created_at: new Date().toISOString()
      });
    }

    // Insert Books
    const insertBook = db.prepare(`
      INSERT INTO books (
        id, author_id, title, isbn, genre, publication_date, status, production_stage,
        mrp, currency, page_count, printing_partner, package, total_copies_sold,
        total_royalty_earned, royalty_paid, royalty_pending, distribution_platforms_json,
        stock_status, production_details_json, sales_breakdown_json, created_at
      )
      VALUES (
        @id, @author_id, @title, @isbn, @genre, @publication_date, @status, @production_stage,
        @mrp, @currency, @page_count, @printing_partner, @package, @total_copies_sold,
        @total_royalty_earned, @royalty_paid, @royalty_pending, @distribution_platforms_json,
        @stock_status, @production_details_json, @sales_breakdown_json, @created_at
      )
    `);

    for (const book of sampleData.books) {
      insertBook.run({
        id: book.id,
        author_id: book.author_id,
        title: book.title,
        isbn: book.isbn || null,
        genre: book.genre || 'General',
        publication_date: book.publication_date || null,
        status: book.status || 'Published',
        production_stage: book.production_stage || (book.status === 'Published' ? 'Published & Live' : 'Typesetting'),
        mrp: book.mrp || 0,
        currency: book.currency || 'INR',
        page_count: book.page_count || 200,
        printing_partner: book.printing_partner || 'In-House Delhi',
        package: book.package || 'Standard Free',
        total_copies_sold: book.total_copies_sold || 0,
        total_royalty_earned: book.total_royalty_earned || 0,
        royalty_paid: book.royalty_paid || 0,
        royalty_pending: book.royalty_pending || 0,
        distribution_platforms_json: JSON.stringify(book.distribution_platforms || []),
        stock_status: book.stock_status || 'In Stock',
        production_details_json: JSON.stringify(book.production_details || {}),
        sales_breakdown_json: JSON.stringify(book.sales_breakdown || {}),
        created_at: book.publication_date ? `${book.publication_date}T00:00:00Z` : new Date().toISOString()
      });
    }

    // Insert Tickets and Messages
    const insertTicket = db.prepare(`
      INSERT INTO tickets (
        id, author_id, book_id, subject, description, attachment_url, attachment_name,
        status, ai_category, ai_priority, ai_priority_score, ai_rationale,
        category_override, priority_override, assigned_to, created_at, updated_at
      )
      VALUES (
        @id, @author_id, @book_id, @subject, @description, @attachment_url, @attachment_name,
        @status, @ai_category, @ai_priority, @ai_priority_score, @ai_rationale,
        @category_override, @priority_override, @assigned_to, @created_at, @updated_at
      )
    `);

    const insertMessage = db.prepare(`
      INSERT INTO ticket_messages (id, ticket_id, sender_id, sender_role, sender_name, message, created_at)
      VALUES (@id, @ticket_id, @sender_id, @sender_role, @sender_name, @message, @created_at)
    `);

    const insertNote = db.prepare(`
      INSERT INTO internal_notes (id, ticket_id, admin_id, admin_name, note, created_at)
      VALUES (@id, @ticket_id, @admin_id, @admin_name, @note, @created_at)
    `);

    for (const tkt of sampleData.sample_tickets) {
      insertTicket.run({
        id: tkt.id,
        author_id: tkt.author_id,
        book_id: tkt.book_id || null,
        subject: tkt.subject,
        description: tkt.description,
        attachment_url: tkt.attachment_url || null,
        attachment_name: tkt.attachment_name || null,
        status: tkt.status || 'Open',
        ai_category: tkt.ai_category || 'General Inquiry',
        ai_priority: tkt.ai_priority || 'Medium',
        ai_priority_score: tkt.ai_priority_score || 50,
        ai_rationale: tkt.ai_rationale || '',
        category_override: tkt.category_override || null,
        priority_override: tkt.priority_override || null,
        assigned_to: tkt.assigned_to || null,
        created_at: tkt.created_at || new Date().toISOString(),
        updated_at: tkt.updated_at || new Date().toISOString()
      });

      if (tkt.messages && Array.isArray(tkt.messages)) {
        for (const msg of tkt.messages) {
          insertMessage.run({
            id: msg.id,
            ticket_id: tkt.id,
            sender_id: msg.sender_id,
            sender_role: msg.sender_role,
            sender_name: msg.sender_name,
            message: msg.message,
            created_at: msg.created_at
          });
        }
      }

      if (tkt.internal_notes && Array.isArray(tkt.internal_notes)) {
        for (const note of tkt.internal_notes) {
          insertNote.run({
            id: note.id,
            ticket_id: tkt.id,
            admin_id: note.admin_id,
            admin_name: note.admin_name,
            note: note.note,
            created_at: note.created_at
          });
        }
      }
    }
  });

  runSeed();
  return {
    seeded: true,
    authors: sampleData.authors.length,
    books: sampleData.books.length,
    tickets: sampleData.sample_tickets.length
  };
}

module.exports = {
  db,
  initSchema,
  seedDatabase
};

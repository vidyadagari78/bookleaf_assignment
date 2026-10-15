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
      author_royalty_per_copy REAL DEFAULT 0,
      page_count INTEGER,
      printing_partner TEXT,
      package TEXT,
      total_copies_sold INTEGER DEFAULT 0,
      total_royalty_earned REAL DEFAULT 0,
      royalty_paid REAL DEFAULT 0,
      royalty_pending REAL DEFAULT 0,
      last_royalty_payout_date TEXT,
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
        DROP TABLE IF EXISTS ai_drafts;
        DROP TABLE IF EXISTS internal_notes;
        DROP TABLE IF EXISTS ticket_messages;
        DROP TABLE IF EXISTS tickets;
        DROP TABLE IF EXISTS books;
        DROP TABLE IF EXISTS admins;
        DROP TABLE IF EXISTS authors;
      `);
      initSchema();
    }

    const salt = bcrypt.genSaltSync(10);
    const defaultAuthorHash = bcrypt.hashSync('password123', salt);
    const defaultAdminHash = bcrypt.hashSync('adminpassword123', salt);

    // 1. Insert Admins (Operations Leadership)
    const insertAdmin = db.prepare(`
      INSERT INTO admins (id, name, email, password_hash, role, title, avatar, created_at)
      VALUES (@id, @name, @email, @password_hash, @role, @title, @avatar, @created_at)
    `);

    const adminsList = sampleData.admins || [
      {
        id: 'adm-001',
        name: 'Sunita Kapoor',
        email: 'admin@bookleafpublishing.com',
        role: 'admin',
        title: 'Head of Publishing Operations',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150'
      },
      {
        id: 'adm-002',
        name: 'Kabir Verma',
        email: 'support@bookleafpublishing.com',
        role: 'admin',
        title: 'Senior Author Success Specialist',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150'
      }
    ];

    for (const admin of adminsList) {
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

    // 2. Insert Authors
    const insertAuthor = db.prepare(`
      INSERT INTO authors (id, name, email, password_hash, phone, country, city, bank_details_json, package, created_at)
      VALUES (@id, @name, @email, @password_hash, @phone, @country, @city, @bank_details_json, @package, @created_at)
    `);

    // 3. Insert Books
    const insertBook = db.prepare(`
      INSERT INTO books (
        id, author_id, title, isbn, genre, publication_date, status, production_stage,
        mrp, currency, author_royalty_per_copy, page_count, printing_partner, package,
        total_copies_sold, total_royalty_earned, royalty_paid, royalty_pending,
        last_royalty_payout_date, distribution_platforms_json, stock_status,
        production_details_json, sales_breakdown_json, created_at
      )
      VALUES (
        @id, @author_id, @title, @isbn, @genre, @publication_date, @status, @production_stage,
        @mrp, @currency, @author_royalty_per_copy, @page_count, @printing_partner, @package,
        @total_copies_sold, @total_royalty_earned, @royalty_paid, @royalty_pending,
        @last_royalty_payout_date, @distribution_platforms_json, @stock_status,
        @production_details_json, @sales_breakdown_json, @created_at
      )
    `);

    const bankLookup = {
      'AUTH001': { account_holder: 'Priya Sharma', account_number: 'XXXXXX4821', ifsc_code: 'HDFC0001234', bank_name: 'HDFC Bank', is_verified: true },
      'AUTH002': { account_holder: 'Rohit Kapoor', account_number: 'XXXXXX3312', ifsc_code: 'SBIN0001122', bank_name: 'State Bank of India', is_verified: true },
      'AUTH003': { account_holder: 'Ananya Reddy', account_number: 'XXXXXX5912', ifsc_code: 'ICIC0000456', bank_name: 'ICICI Bank', is_verified: true },
      'AUTH004': { account_holder: 'Vikram Joshi', account_number: 'XXXXXX7190', ifsc_code: 'UTIB0000789', bank_name: 'Axis Bank', is_verified: true },
      'AUTH005': { account_holder: 'Meera Nair', account_number: 'XXXXXX8823', ifsc_code: 'KKBK0001920', bank_name: 'Kotak Mahindra Bank', is_verified: true },
      'AUTH006': { account_holder: 'Arjun Malhotra', account_number: 'XXXXXX6643', ifsc_code: 'PUNB0002341', bank_name: 'Punjab National Bank', is_verified: true },
      'AUTH007': { account_holder: 'Sneha Kulkarni', account_number: 'XXXXXX1198', ifsc_code: 'HDFC0000543', bank_name: 'HDFC Bank', is_verified: true },
      'AUTH008': { account_holder: 'Farhan Sheikh', account_number: 'XXXXXX9041', ifsc_code: 'BARB0LUCKNO', bank_name: 'Bank of Baroda', is_verified: true },
      'AUTH009': { account_holder: 'Kavita Deshmukh', account_number: 'XXXXXX2834', ifsc_code: 'MAHB0000312', bank_name: 'Bank of Maharashtra', is_verified: true },
      'AUTH010': { account_holder: 'Diya Chatterjee', account_number: 'XXXXXX7752', ifsc_code: 'SBIN0000011', bank_name: 'State Bank of India', is_verified: true }
    };

    let totalBooksInserted = 0;

    for (const author of sampleData.authors) {
      const authorId = author.author_id || author.id;
      const bankDetails = author.bank_details || bankLookup[authorId] || {
        account_holder: author.name,
        account_number: 'XXXXXX' + Math.floor(1000 + Math.random() * 9000),
        ifsc_code: 'HDFC000' + Math.floor(1000 + Math.random() * 9000),
        bank_name: 'HDFC Bank',
        is_verified: true
      };

      insertAuthor.run({
        id: authorId,
        name: author.name,
        email: author.email.toLowerCase(),
        password_hash: defaultAuthorHash,
        phone: author.phone || null,
        country: author.country || 'India',
        city: author.city || null,
        bank_details_json: JSON.stringify(bankDetails),
        package: author.package || (author.author_id === 'AUTH002' || author.author_id === 'AUTH007' ? 'Bestseller Breakthrough' : 'Standard Free'),
        created_at: author.joined_date ? `${author.joined_date}T00:00:00Z` : (author.created_at || new Date().toISOString())
      });

      // Insert books for this author
      const booksList = author.books || [];
      for (const book of booksList) {
        totalBooksInserted++;
        const bookId = book.book_id || book.id;
        const rawStatus = book.status || 'Published & Live';
        
        let productionStage = 'Published & Live';
        if (rawStatus.includes('Cover Design')) {
          productionStage = 'Cover Design';
        } else if (rawStatus.includes('Typesetting')) {
          productionStage = 'Typesetting';
        } else if (rawStatus.includes('In Production')) {
          productionStage = book.production_stage || 'Typesetting';
        } else {
          productionStage = 'Published & Live';
        }

        const isProduction = productionStage !== 'Published & Live';

        const productionDetails = isProduction ? {
          current_stage: productionStage,
          stage_number: productionStage === 'Cover Design' ? 3 : 4,
          total_stages: 9,
          estimated_completion: productionStage === 'Cover Design' ? '2026-11-05' : '2026-11-20',
          awaiting_author_approval: productionStage === 'Cover Design',
          notes: productionStage === 'Cover Design' 
            ? 'Cover layout shared. Waiting for author feedback on palette.' 
            : 'Interior proofing and hyphenation checks in progress with typesetting team.'
        } : {
          current_stage: 'Published & Live',
          completed_at: book.publication_date || '2024-01-01'
        };

        const totalSold = book.total_copies_sold || 0;
        const salesBreakdown = {
          amazon_india: Math.round(totalSold * 0.55),
          flipkart: Math.round(totalSold * 0.25),
          bookleaf_store: Math.round(totalSold * 0.15),
          international: Math.max(0, totalSold - Math.round(totalSold * 0.55) - Math.round(totalSold * 0.25) - Math.round(totalSold * 0.15))
        };

        insertBook.run({
          id: bookId,
          author_id: authorId,
          title: book.title,
          isbn: book.isbn || null,
          genre: book.genre || 'General',
          publication_date: book.publication_date || null,
          status: rawStatus,
          production_stage: productionStage,
          mrp: book.mrp || 0,
          currency: 'INR',
          author_royalty_per_copy: book.author_royalty_per_copy || 0,
          page_count: book.page_count || (book.mrp ? Math.round(book.mrp * 0.65) : 220),
          printing_partner: book.print_partner || book.printing_partner || 'In-House',
          package: author.package || 'Standard Free',
          total_copies_sold: totalSold,
          total_royalty_earned: book.total_royalty_earned || 0,
          royalty_paid: book.royalty_paid || 0,
          royalty_pending: book.royalty_pending || 0,
          last_royalty_payout_date: book.last_royalty_payout_date || null,
          distribution_platforms_json: JSON.stringify(book.available_on || ['Amazon India', 'Flipkart', 'BookLeaf Store']),
          stock_status: isProduction ? 'In Production' : 'In Stock',
          production_details_json: JSON.stringify(productionDetails),
          sales_breakdown_json: JSON.stringify(salesBreakdown),
          created_at: book.publication_date ? `${book.publication_date}T00:00:00Z` : new Date().toISOString()
        });
      }
    }

    // 4. Insert Initial Tickets covering all required scenarios
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

    const insertDraft = db.prepare(`
      INSERT INTO ai_drafts (id, ticket_id, draft_text, category_detected, priority_detected, tokens_used, provider, created_at)
      VALUES (@id, @ticket_id, @draft_text, @category_detected, @priority_detected, @tokens_used, @provider, @created_at)
    `);

    const seededTickets = [
      {
        id: 'TKT-1001',
        author_id: 'AUTH009',
        book_id: 'BK016',
        subject: 'Royalty statement shows ₹850 pending — when will this be credited?',
        description: 'Hello BookLeaf team, I checked my author atelier and noticed I have earned ₹850 in royalties for The Nagpur Notebooks. However, I haven\'t received a bank transfer yet. Could you clarify when this will be credited to my account?',
        status: 'Open',
        ai_category: 'Royalty & Payments',
        ai_priority: 'Medium',
        ai_priority_score: 62,
        ai_rationale: 'Inquiry regarding accumulated royalty balance below the ₹1,000 disbursement threshold. Governed by BookLeaf quarterly rollover policy.',
        created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString(),
        messages: [
          {
            id: 'msg-101',
            sender_id: 'AUTH009',
            sender_role: 'author',
            sender_name: 'Kavita Deshmukh',
            message: 'Hello BookLeaf team, I checked my author atelier and noticed I have earned ₹850 in royalties for The Nagpur Notebooks. However, I haven\'t received a bank transfer yet. Could you clarify when this will be credited to my account?',
            created_at: new Date(Date.now() - 4 * 3600 * 1000).toISOString()
          }
        ],
        draft: `Dear Kavita,

Thank you for reaching out to BookLeaf Publishing. We are delighted to see readers discovering "The Nagpur Notebooks" with 34 copies sold so far!

I understand your query regarding your current royalty balance of ₹850. Under BookLeaf's author royalty policy, earnings are disbursed quarterly with a minimum payout threshold of ₹1,000. 

Because your accumulated balance is currently ₹850, it will automatically roll over to the next quarter. As soon as additional sales push your earnings past ₹1,000, the full accumulated amount will be transferred directly to your verified Bank of Maharashtra account during the next scheduled 45-day payout window.

You can monitor real-time sales and track your progress in your Author Atelier. Please let us know if you have any questions or if you would like marketing tips to boost your upcoming quarterly sales!

Warm regards,
Author Success Team
BookLeaf Publishing`
      },
      {
        id: 'TKT-1002',
        author_id: 'AUTH004',
        book_id: 'BK006',
        subject: 'Defective author copies received — spine shifted and cover colors washed out',
        description: 'We received our 10 author copies of Debugging Life from the recent print run yesterday. The spine text is shifted by nearly 4mm onto the front cover, and the cover lamination has bubbling along the edge. These cannot be distributed to readers.',
        status: 'In Progress',
        ai_category: 'Printing & Quality',
        ai_priority: 'Critical',
        ai_priority_score: 94,
        ai_rationale: 'Critical physical printing defect reported on delivered author copies with misaligned spine and lamination failure. Triggers BookLeaf 100% free reprint guarantee.',
        assigned_to: 'adm-001',
        created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        messages: [
          {
            id: 'msg-102',
            sender_id: 'AUTH004',
            sender_role: 'author',
            sender_name: 'Vikram Joshi',
            message: 'We received our 10 author copies of Debugging Life from the recent print run yesterday. The spine text is shifted by nearly 4mm onto the front cover, and the cover lamination has bubbling along the edge. These cannot be distributed to readers.',
            created_at: new Date(Date.now() - 28 * 3600 * 1000).toISOString()
          },
          {
            id: 'msg-103',
            sender_id: 'adm-001',
            sender_role: 'admin',
            sender_name: 'Sunita Kapoor',
            message: 'Dear Vikram, please accept our sincere apologies for the substandard copies you received. That certainly does not meet BookLeaf standards. I have escalated this directly to our Delhi printing press supervisor. A complimentary replacement batch of 10 copies is being expedited immediately.',
            created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
          }
        ],
        internal_notes: [
          {
            id: 'note-101',
            admin_id: 'adm-001',
            admin_name: 'Sunita Kapoor',
            note: 'Reviewed defect photos against In-House Delhi press run #4491. Alignment calibration error confirmed. Replacement batch of 10 copies queued for expedited reprint at zero cost.',
            created_at: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
          }
        ],
        draft: `Dear Vikram,

Thank you for bringing this to our attention. Please accept our sincere apologies for the print quality issues on your 10 copies of "Debugging Life". We take immense pride in our craftsmanship, and spine misalignment and lamination defects are completely unacceptable.

Under BookLeaf's Quality Guarantee, we are arranging a 100% free expedited reprint of your 10 copies through our Delhi facility. The replacement copies will be dispatched within 5–7 business days, and we will share the tracking link as soon as they ship.

Thank you for your patience and partnership.

Warm regards,
Sunita Kapoor
Head of Operations, BookLeaf Publishing`
      },
      {
        id: 'TKT-1003',
        author_id: 'AUTH002',
        book_id: 'BK004',
        subject: 'Amazon US listing subtitle and page count mismatch with Indian edition',
        description: 'Hi, I noticed that on Amazon US the subtitle of Startup Sutra is missing and the page count is listed as 180 instead of 320 pages. Can this metadata be corrected on the US storefront?',
        status: 'Open',
        ai_category: 'ISBN & Metadata Issues',
        ai_priority: 'High',
        ai_priority_score: 84,
        ai_rationale: 'Retail catalog metadata discrepancy on international distribution storefront (Amazon US). Requires catalog team metadata feed push.',
        created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString(),
        messages: [
          {
            id: 'msg-104',
            sender_id: 'AUTH002',
            sender_role: 'author',
            sender_name: 'Rohit Kapoor',
            message: 'Hi, I noticed that on Amazon US the subtitle of Startup Sutra is missing and the page count is listed as 180 instead of 320 pages. Can this metadata be corrected on the US storefront?',
            created_at: new Date(Date.now() - 6 * 3600 * 1000).toISOString()
          }
        ],
        draft: `Dear Rohit,

Thank you for alerting us to this metadata discrepancy on Amazon US for "Startup Sutra". 

Accurate listing metadata is crucial for reader discovery, and we treat catalog mismatches with high priority. Our distribution and metadata team has submitted an expedited ONIX catalog feed update directly to Amazon US to correct the subtitle and update the page count to 320 pages.

Amazon typically synchronizes metadata updates within 3 to 5 business days. We will monitor the US product page and notify you as soon as the corrections reflect live.

Best regards,
Author Success Team
BookLeaf Publishing`
      },
      {
        id: 'TKT-1004',
        author_id: 'AUTH005',
        book_id: 'BK009',
        subject: 'Paperback showing as "Currently Unavailable" on Amazon India',
        description: 'My readers are messaging me saying Letters from Lakshadweep is showing "Currently Unavailable" on Amazon India, even though the BookLeaf Store shows it in stock. Could you check the inventory status?',
        status: 'Resolved',
        ai_category: 'Distribution & Availability',
        ai_priority: 'High',
        ai_priority_score: 79,
        ai_rationale: 'Active catalog title showing unavailable on primary retail channel (Amazon India). Indicates API stock catalog sync desynchronization.',
        assigned_to: 'adm-002',
        created_at: new Date(Date.now() - 52 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString(),
        messages: [
          {
            id: 'msg-105',
            sender_id: 'AUTH005',
            sender_role: 'author',
            sender_name: 'Meera Nair',
            message: 'My readers are messaging me saying Letters from Lakshadweep is showing "Currently Unavailable" on Amazon India, even though the BookLeaf Store shows it in stock. Could you check the inventory status?',
            created_at: new Date(Date.now() - 52 * 3600 * 1000).toISOString()
          },
          {
            id: 'msg-106',
            sender_id: 'adm-002',
            sender_role: 'admin',
            sender_name: 'Kabir Verma',
            message: 'Dear Meera, our distribution team triggered an API inventory refresh with Amazon India yesterday. The listing is now back live and available for Prime 1-day delivery. Please verify on your end!',
            created_at: new Date(Date.now() - 12 * 3600 * 1000).toISOString()
          }
        ]
      },
      {
        id: 'TKT-1005',
        author_id: 'AUTH007',
        book_id: 'BK013',
        subject: 'Production update request for Cover Design and estimated proofreading timeline',
        description: 'Hello, my thriller "Midnight in Mysore" has been in Cover Design for two weeks. I wanted to check on the layout proofs and understand the timeline for moving into Proofreading and Printing.',
        status: 'In Progress',
        ai_category: 'Book Status & Production Updates',
        ai_priority: 'Medium',
        ai_priority_score: 58,
        ai_rationale: 'Status inquiry on book in active production stage (Cover Design). Requires milestone progress clarification.',
        assigned_to: 'adm-001',
        created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString(),
        messages: [
          {
            id: 'msg-107',
            sender_id: 'AUTH007',
            sender_role: 'author',
            sender_name: 'Sneha Kulkarni',
            message: 'Hello, my thriller "Midnight in Mysore" has been in Cover Design for two weeks. I wanted to check on the layout proofs and understand the timeline for moving into Proofreading and Printing.',
            created_at: new Date(Date.now() - 18 * 3600 * 1000).toISOString()
          }
        ],
        internal_notes: [
          {
            id: 'note-102',
            admin_id: 'adm-001',
            admin_name: 'Sunita Kapoor',
            note: 'Design team uploaded 3 jacket proofs to Dropbox. Sending review link to author today.',
            created_at: new Date(Date.now() - 10 * 3600 * 1000).toISOString()
          }
        ],
        draft: `Dear Sneha,

Thank you for checking in on "Midnight in Mysore"! We are thrilled with the dark noir atmosphere of this thriller.

Your book is currently in Stage 3 (Cover Design). The design team has prepared three front jacket concepts incorporating the vintage Mysore Palace silhouette. We are uploading these high-resolution proofs to your dashboard today for your review.

Once you approve your preferred cover option, the manuscript will immediately progress to Typesetting and Proofreading (Stage 4 & 5), which takes approximately 7–10 business days.

Warm regards,
Sunita Kapoor
BookLeaf Production Desk`
      },
      {
        id: 'TKT-1006',
        author_id: 'AUTH001',
        book_id: 'BK001',
        subject: 'Status of pending royalty payout ₹3,570 for Q3',
        description: 'Hello team, my dashboard shows ₹3,570 pending royalty for Whispers of the Ganges after the October statement. Could you confirm the payout schedule and bank reference?',
        status: 'Open',
        ai_category: 'Royalty & Payments',
        ai_priority: 'Medium',
        ai_priority_score: 68,
        ai_rationale: 'Quarterly royalty inquiry exceeding the ₹1,000 threshold. Bank details verified.',
        created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString(),
        messages: [
          {
            id: 'msg-108',
            sender_id: 'AUTH001',
            sender_role: 'author',
            sender_name: 'Priya Sharma',
            message: 'Hello team, my dashboard shows ₹3,570 pending royalty for Whispers of the Ganges after the October statement. Could you confirm the payout schedule and bank reference?',
            created_at: new Date(Date.now() - 8 * 3600 * 1000).toISOString()
          }
        ],
        draft: `Dear Priya,

Thank you for contacting BookLeaf Publishing, and congratulations on the strong continued performance of "Whispers of the Ganges" with 342 copies sold!

Your pending balance of ₹3,570 has surpassed our ₹1,000 minimum threshold and is queued in our Q3 disbursement cycle. Under our policy, quarterly royalties are disbursed within 45 days of the quarter ending.

Your payment will be processed via direct NEFT to your verified HDFC Bank account ending in 4821 by the upcoming cycle date. A detailed transaction receipt with UTR reference will be sent to this email address.

Warm regards,
Author Success Team
BookLeaf Publishing`
      },
      {
        id: 'TKT-1007',
        author_id: 'AUTH006',
        book_id: 'BK010',
        subject: 'Ordering 50 discounted author copies for regional literature fest',
        description: 'I am speaking at a literary festival next month in Chandigarh and would like to order 50 copies of Turban Tales. What is the author discount rate and shipping turnaround to Chandigarh?',
        status: 'Open',
        ai_category: 'General Inquiry',
        ai_priority: 'Low',
        ai_priority_score: 35,
        ai_rationale: 'Standard inquiry regarding bulk author copy discount ordering and shipping turnaround.',
        created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        updated_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString(),
        messages: [
          {
            id: 'msg-109',
            sender_id: 'AUTH006',
            sender_role: 'author',
            sender_name: 'Arjun Malhotra',
            message: 'I am speaking at a literary festival next month in Chandigarh and would like to order 50 copies of Turban Tales. What is the author discount rate and shipping turnaround to Chandigarh?',
            created_at: new Date(Date.now() - 14 * 3600 * 1000).toISOString()
          }
        ],
        draft: `Dear Arjun,

Congratulations on your speaking invitation at the Chandigarh literary festival!

As a BookLeaf author, you are entitled to order author copies at exclusive printing cost without retail channel markups. For a 50-copy batch of "Turban Tales" (MRP ₹325), your special author price is ₹115 per copy plus standard surface shipping.

Standard production and transit turnaround from our Delhi printing press to Chandigarh is 4–6 business days. We would love to support your event—please confirm your delivery address, and we will generate an instant checkout invoice.

Warm regards,
Author Support Desk
BookLeaf Publishing`
      }
    ];

    for (const tkt of seededTickets) {
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

      if (tkt.draft) {
        insertDraft.run({
          id: 'drf-' + tkt.id,
          ticket_id: tkt.id,
          draft_text: tkt.draft,
          category_detected: tkt.ai_category,
          priority_detected: tkt.ai_priority,
          tokens_used: 340,
          provider: 'Deterministic Knowledge Base Engine (Fallback / Pre-computed)',
          created_at: tkt.created_at
        });
      }
    }
  });

  runSeed();
  return {
    seeded: true,
    authors: sampleData.authors.length,
    books: 18,
    tickets: 7
  };
}

module.exports = {
  db,
  initSchema,
  seedDatabase
};

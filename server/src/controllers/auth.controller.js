const bcrypt = require('bcryptjs');
const { db } = require('../database/db');
const { generateToken } = require('../middleware/auth.middleware');
const { z } = require('zod');

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1)
});

function login(req, res) {
  const parseResult = loginSchema.safeParse(req.body);
  if (!parseResult.success) {
    return res.status(400).json({
      success: false,
      error: {
        code: 'VALIDATION_ERROR',
        message: 'Valid email and password required.',
        details: parseResult.error.issues
      }
    });
  }

  const { email, password } = parseResult.data;
  const normalizedEmail = email.trim().toLowerCase();

  // 1. Check Admins first
  const admin = db.prepare('SELECT * FROM admins WHERE email = ?').get(normalizedEmail);
  if (admin) {
    const isMatch = bcrypt.compareSync(password, admin.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    const token = generateToken({
      id: admin.id,
      email: admin.email,
      name: admin.name,
      role: 'admin',
      title: admin.title
    });

    return res.json({
      success: true,
      token,
      user: {
        id: admin.id,
        name: admin.name,
        email: admin.email,
        role: 'admin',
        title: admin.title,
        avatar: admin.avatar
      }
    });
  }

  // 2. Check Authors
  const author = db.prepare('SELECT * FROM authors WHERE email = ?').get(normalizedEmail);
  if (author) {
    const isMatch = bcrypt.compareSync(password, author.password_hash);
    if (!isMatch) {
      return res.status(401).json({
        success: false,
        error: { code: 'INVALID_CREDENTIALS', message: 'Invalid email or password.' }
      });
    }

    const token = generateToken({
      id: author.id,
      email: author.email,
      name: author.name,
      role: 'author'
    });

    let bankDetails = {};
    try {
      bankDetails = JSON.parse(author.bank_details_json || '{}');
    } catch (e) {}

    return res.json({
      success: true,
      token,
      user: {
        id: author.id,
        name: author.name,
        email: author.email,
        role: 'author',
        phone: author.phone,
        country: author.country,
        city: author.city,
        package: author.package,
        bank_details: bankDetails
      }
    });
  }

  return res.status(401).json({
    success: false,
    error: { code: 'USER_NOT_FOUND', message: 'No account registered with this email.' }
  });
}

function getMe(req, res) {
  if (req.user.role === 'admin') {
    const admin = db.prepare('SELECT id, name, email, role, title, avatar, created_at FROM admins WHERE id = ?').get(req.user.id);
    if (!admin) {
      return res.status(404).json({ success: false, error: { message: 'Admin not found.' } });
    }
    return res.json({ success: true, user: admin });
  }

  const author = db.prepare('SELECT id, name, email, phone, country, city, bank_details_json, package, created_at FROM authors WHERE id = ?').get(req.user.id);
  if (!author) {
    return res.status(404).json({ success: false, error: { message: 'Author not found.' } });
  }

  let bankDetails = {};
  try {
    bankDetails = JSON.parse(author.bank_details_json || '{}');
  } catch (e) {}

  return res.json({
    success: true,
    user: {
      ...author,
      role: 'author',
      bank_details: bankDetails
    }
  });
}

/**
 * Return demo credentials so reviewers can log in with 1 click
 */
function getDemoAccounts(req, res) {
  const admins = db.prepare('SELECT id, name, email, role, title, avatar FROM admins').all();
  const authors = db.prepare('SELECT id, name, email, country, city, package FROM authors').all();

  // Attach quick book count & pending royalty
  const enrichedAuthors = authors.map(a => {
    const stats = db.prepare(`
      SELECT 
        COUNT(*) AS book_count,
        SUM(royalty_pending) AS total_pending,
        SUM(total_copies_sold) AS total_sales
      FROM books WHERE author_id = ?
    `).get(a.id);

    return {
      ...a,
      role: 'author',
      book_count: stats.book_count || 0,
      total_pending: stats.total_pending || 0,
      total_sales: stats.total_sales || 0
    };
  });

  return res.json({
    success: true,
    default_password: 'password123',
    admin_default_password: 'adminpassword123',
    admins,
    authors: enrichedAuthors
  });
}

module.exports = {
  login,
  getMe,
  getDemoAccounts
};

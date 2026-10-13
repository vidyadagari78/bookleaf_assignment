const express = require('express');
const cors = require('cors');
const http = require('http');
const path = require('path');
const fs = require('fs');
const dotenv = require('dotenv');
const swaggerUi = require('swagger-ui-express');

dotenv.config();

const { initSchema, seedDatabase } = require('./database/db');
const { initWebSocketServer } = require('./services/websocket.service');

// Import routes
const authRoutes = require('./routes/auth.routes');
const bookRoutes = require('./routes/book.routes');
const ticketRoutes = require('./routes/ticket.routes');
const adminRoutes = require('./routes/admin.routes');
const systemRoutes = require('./routes/system.routes');

// Initialize database schema and initial seed
initSchema();
const seedResult = seedDatabase(false);
if (seedResult.seeded) {
  console.log(`[Database] Initial seed complete: ${seedResult.authors} authors, ${seedResult.books} books, ${seedResult.tickets} tickets.`);
} else {
  console.log(`[Database] Connected to existing records.`);
}

const app = express();
const server = http.createServer(app);

// Mount real-time WebSocket server
initWebSocketServer(server);

// Middleware
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PATCH', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Ensure upload directory exists
const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}
app.use('/uploads', express.static(UPLOADS_DIR));

// OpenAPI Documentation
const openapiSpecPath = path.join(__dirname, 'docs', 'openapi.json');
if (fs.existsSync(openapiSpecPath)) {
  const openapiSpec = JSON.parse(fs.readFileSync(openapiSpecPath, 'utf8'));
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(openapiSpec, {
    customSiteTitle: 'BookLeaf Publishing API Docs',
    customCss: '.swagger-ui .topbar { display: none }'
  }));
  app.get('/api/v1/docs.json', (req, res) => res.json(openapiSpec));
}

// API Routes
app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/books', bookRoutes);
app.use('/api/v1/tickets', ticketRoutes);
app.use('/api/v1/admin', adminRoutes);
app.use('/api/v1/system', systemRoutes);

// Root API Welcome probe
app.get('/api/v1', (req, res) => {
  res.json({
    name: 'BookLeaf Publishing Author Support & Communication Portal API',
    version: '1.0.0',
    documentation: '/api-docs',
    endpoints: {
      auth: '/api/v1/auth',
      books: '/api/v1/books',
      tickets: '/api/v1/tickets',
      admin: '/api/v1/admin',
      system: '/api/v1/system'
    }
  });
});

// Serve frontend in production if built
const clientDistPath = path.join(__dirname, '..', '..', 'client', 'dist');
if (fs.existsSync(clientDistPath)) {
  app.use(express.static(clientDistPath));
}

// Fallback for API 404s
app.use((req, res, next) => {
  if (req.path.startsWith('/api')) {
    return res.status(404).json({
      success: false,
      error: {
        code: 'ROUTE_NOT_FOUND',
        message: `The requested endpoint ${req.method} ${req.originalUrl} does not exist.`
      }
    });
  }
  
  if (req.method === 'GET' && fs.existsSync(clientDistPath)) {
    return res.sendFile(path.join(clientDistPath, 'index.html'));
  }
  
  next();
});

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('[Global Error]', err);
  res.status(err.status || 500).json({
    success: false,
    error: {
      code: err.code || 'INTERNAL_SERVER_ERROR',
      message: err.message || 'An unexpected error occurred on the server.'
    }
  });
});

const PORT = process.env.PORT || 5000;

if (require.main === module) {
  server.listen(PORT, () => {
    console.log(`=======================================================`);
    console.log(`🌿 BookLeaf Author Support Portal Backend`);
    console.log(`🚀 Running at: http://localhost:${PORT}`);
    console.log(`📖 API Docs: http://localhost:${PORT}/api-docs`);
    console.log(`⚡ WebSocket Stream: ws://localhost:${PORT}/ws`);
    console.log(`=======================================================`);
  });
}

module.exports = { app, server };

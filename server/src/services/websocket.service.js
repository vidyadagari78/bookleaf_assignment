const { WebSocketServer } = require('ws');
const jwt = require('jsonwebtoken');
const { JWT_SECRET } = require('../middleware/auth.middleware');

let wss = null;
const clients = new Map(); // ws -> { userId, role, email, name }

function initWebSocketServer(server) {
  wss = new WebSocketServer({ server, path: '/ws' });

  wss.on('connection', (ws, req) => {
    // Optional query param token: ws://localhost:5000/ws?token=xyz
    const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
    const token = url.searchParams.get('token');

    let user = null;
    if (token) {
      try {
        user = jwt.verify(token, JWT_SECRET);
      } catch (err) {
        // Unauthenticated or expired
      }
    }

    clients.set(ws, user || { role: 'anonymous' });

    ws.send(JSON.stringify({
      type: 'CONNECTED',
      data: { message: 'Real-time WebSocket connection established', user: user || null }
    }));

    ws.on('message', (messageRaw) => {
      try {
        const payload = JSON.parse(messageRaw);
        if (payload.type === 'AUTHENTICATE' && payload.token) {
          try {
            const decoded = jwt.verify(payload.token, JWT_SECRET);
            clients.set(ws, decoded);
            ws.send(JSON.stringify({ type: 'AUTHENTICATED', user: decoded }));
          } catch (e) {
            ws.send(JSON.stringify({ type: 'AUTH_ERROR', message: 'Invalid token' }));
          }
        }
      } catch (err) {
        // ignore malformed message
      }
    });

    ws.on('close', () => {
      clients.delete(ws);
    });

    ws.on('error', () => {
      clients.delete(ws);
    });
  });

  return wss;
}

function broadcastEvent(eventType, payload, targetAuthorId = null) {
  if (!wss) return;

  const message = JSON.stringify({
    type: eventType,
    payload,
    timestamp: new Date().toISOString()
  });

  for (const [ws, user] of clients.entries()) {
    if (ws.readyState === ws.OPEN) {
      // Admins always get all ticket events
      if (user.role === 'admin') {
        ws.send(message);
      }
      // If target author specified, author gets their ticket event
      else if (targetAuthorId && user.id === targetAuthorId) {
        ws.send(message);
      }
      // General broadcast if no targetAuthorId
      else if (!targetAuthorId) {
        ws.send(message);
      }
    }
  }
}

module.exports = {
  initWebSocketServer,
  broadcastEvent
};

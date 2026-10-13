import React, { useState, useEffect, useCallback } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { LoginPage } from './components/LoginPage';
import { MyBooks } from './components/author/MyBooks';
import { SubmitQuery } from './components/author/SubmitQuery';
import { MyTickets } from './components/author/MyTickets';
import { AdminTicketQueue } from './components/admin/AdminTicketQueue';
import { AdminTicketDetail } from './components/admin/AdminTicketDetail';
import { AdminAuthorsView } from './components/admin/AdminAuthorsView';
import { AdminAnalytics } from './components/admin/AdminAnalytics';
import { KnowledgeBaseExplorer } from './components/admin/KnowledgeBaseExplorer';
import { useWebSocket } from './services/useWebSocket';
import { api } from './services/api';
import { 
  BookOpen, 
  Send, 
  MessageSquare, 
  Users, 
  BarChart3, 
  FileText, 
  CheckCircle2, 
  AlertCircle,
  Bell
} from 'lucide-react';

function MainPortal() {
  const { user, isAdmin, isAuthor } = useAuth();

  // Author State
  const [authorTab, setAuthorTab] = useState('books'); // 'books' | 'submit' | 'tickets'
  const [booksData, setBooksData] = useState({ summary: {}, books: [] });
  const [authorTickets, setAuthorTickets] = useState([]);
  const [preselectedBookId, setPreselectedBookId] = useState(null);
  const [selectedAuthorTicketId, setSelectedAuthorTicketId] = useState(null);

  // Admin State
  const [adminTab, setAdminTab] = useState('queue'); // 'queue' | 'authors' | 'analytics' | 'kb'
  const [adminTickets, setAdminTickets] = useState([]);
  const [selectedAdminTicketId, setSelectedAdminTicketId] = useState(null);
  const [adminFilters, setAdminFilters] = useState({
    status: 'All',
    category: 'All',
    priority: 'All',
    sort: 'newest',
    search: ''
  });

  // Real-time toast state
  const [toastMessage, setToastMessage] = useState(null);

  // Load Author Data
  const loadAuthorData = useCallback(async () => {
    if (!isAuthor) return;
    try {
      const [booksRes, ticketsRes] = await Promise.all([
        api.getBooks(),
        api.getTickets()
      ]);
      setBooksData(booksRes);
      setAuthorTickets(ticketsRes.tickets || []);
    } catch (err) {
      console.error('Failed to load author data:', err);
    }
  }, [isAuthor]);

  // Load Admin Data
  const loadAdminData = useCallback(async () => {
    if (!isAdmin) return;
    try {
      const ticketsRes = await api.getTickets(adminFilters);
      setAdminTickets(ticketsRes.tickets || []);
      if (!selectedAdminTicketId && ticketsRes.tickets?.length > 0) {
        setSelectedAdminTicketId(ticketsRes.tickets[0].id);
      }
    } catch (err) {
      console.error('Failed to load admin tickets:', err);
    }
  }, [isAdmin, adminFilters, selectedAdminTicketId]);

  useEffect(() => {
    if (isAuthor) {
      loadAuthorData();
    } else if (isAdmin) {
      loadAdminData();
    }
  }, [isAuthor, isAdmin, loadAuthorData, loadAdminData]);

  // Handle WebSocket Real-Time Events
  const handleWsEvent = useCallback((event) => {
    if (event.type === 'TICKET_CREATED') {
      setToastMessage(`New query received: "${event.payload.subject}" [${event.payload.ai_category}]`);
      if (isAdmin) loadAdminData();
    } else if (event.type === 'MESSAGE_ADDED') {
      setToastMessage(`New message added to ticket #${event.payload.ticket_id}`);
      if (isAuthor) loadAuthorData();
      if (isAdmin) loadAdminData();
    } else if (event.type === 'TICKET_UPDATED') {
      if (isAuthor) loadAuthorData();
      if (isAdmin) loadAdminData();
    }

    setTimeout(() => setToastMessage(null), 4000);
  }, [isAdmin, isAuthor, loadAdminData, loadAuthorData]);

  const { isConnected: isWsConnected } = useWebSocket(handleWsEvent);

  return (
    <div className="app-container">
      <Navbar 
        isWsConnected={isWsConnected} 
        onResetSuccess={() => {
          if (isAuthor) loadAuthorData();
          if (isAdmin) loadAdminData();
        }} 
      />

      {/* Floating Notification Toast */}
      {toastMessage && (
        <div style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          zIndex: 99,
          background: 'rgba(17, 24, 39, 0.95)',
          backdropFilter: 'blur(12px)',
          border: '1px solid var(--primary)',
          color: '#ffffff',
          borderRadius: 'var(--radius-md)',
          padding: '0.85rem 1.25rem',
          boxShadow: 'var(--shadow-glow)',
          display: 'flex',
          alignItems: 'center',
          gap: '0.65rem',
          animation: 'slideUp 0.25s ease-out'
        }}>
          <Bell size={18} style={{ color: 'var(--primary)' }} />
          <span style={{ fontSize: '0.85rem', fontWeight: 600 }}>{toastMessage}</span>
        </div>
      )}

      <main className="main-content">
        {/* =================================================== */}
        {/* AUTHOR-FACING INTERFACE                             */}
        {/* =================================================== */}
        {isAuthor && (
          <div>
            {/* Author Tab Navigation */}
            <div className="portal-tabs">
              <button 
                className={`tab-btn ${authorTab === 'books' ? 'active' : ''}`}
                onClick={() => setAuthorTab('books')}
              >
                <BookOpen size={16} />
                <span>My Books & Royalties</span>
                <span className="tab-badge">{booksData.books?.length || 0}</span>
              </button>

              <button 
                className={`tab-btn ${authorTab === 'submit' ? 'active' : ''}`}
                onClick={() => {
                  setPreselectedBookId(null);
                  setAuthorTab('submit');
                }}
              >
                <Send size={16} />
                <span>Submit a Query</span>
              </button>

              <button 
                className={`tab-btn ${authorTab === 'tickets' ? 'active' : ''}`}
                onClick={() => setAuthorTab('tickets')}
              >
                <MessageSquare size={16} />
                <span>My Tickets & Responses</span>
                <span className="tab-badge">{authorTickets.length}</span>
              </button>
            </div>

            {/* Author Tab Views */}
            {authorTab === 'books' && (
              <MyBooks 
                booksData={booksData}
                onSelectBookForTicket={(bId) => {
                  setPreselectedBookId(bId);
                  setAuthorTab('submit');
                }}
              />
            )}

            {authorTab === 'submit' && (
              <SubmitQuery 
                books={booksData.books}
                preselectedBookId={preselectedBookId}
                onTicketCreated={(newTkt) => {
                  loadAuthorData();
                  setSelectedAuthorTicketId(newTkt.id);
                  setAuthorTab('tickets');
                }}
              />
            )}

            {authorTab === 'tickets' && (
              <MyTickets 
                tickets={authorTickets}
                selectedTicketId={selectedAuthorTicketId}
                onSelectTicket={setSelectedAuthorTicketId}
                onRefreshNeeded={loadAuthorData}
              />
            )}
          </div>
        )}

        {/* =================================================== */}
        {/* ADMIN-FACING INTERFACE (OPERATIONS TEAM)            */}
        {/* =================================================== */}
        {isAdmin && (
          <div>
            {/* Admin Tab Navigation */}
            <div className="portal-tabs">
              <button 
                className={`tab-btn ${adminTab === 'queue' ? 'active' : ''}`}
                onClick={() => setAdminTab('queue')}
              >
                <MessageSquare size={16} />
                <span>Ticket Queue & AI Studio</span>
                <span className="tab-badge">{adminTickets.length}</span>
              </button>

              <button 
                className={`tab-btn ${adminTab === 'authors' ? 'active' : ''}`}
                onClick={() => setAdminTab('authors')}
              >
                <Users size={16} />
                <span>Authors Catalog</span>
              </button>

              <button 
                className={`tab-btn ${adminTab === 'analytics' ? 'active' : ''}`}
                onClick={() => setAdminTab('analytics')}
              >
                <BarChart3 size={16} />
                <span>Operations Analytics</span>
              </button>

              <button 
                className={`tab-btn ${adminTab === 'kb' ? 'active' : ''}`}
                onClick={() => setAdminTab('kb')}
              >
                <FileText size={16} />
                <span>BookLeaf Knowledge Base</span>
              </button>
            </div>

            {/* Admin Tab Views */}
            {adminTab === 'queue' && (
              <div style={{ display: 'grid', gridTemplateColumns: '380px 1fr', gap: '1.5rem', alignItems: 'start' }}>
                <AdminTicketQueue 
                  tickets={adminTickets}
                  selectedTicketId={selectedAdminTicketId}
                  onSelectTicket={setSelectedAdminTicketId}
                  filters={adminFilters}
                  onFilterChange={(newFilters) => {
                    setAdminFilters(newFilters);
                  }}
                />

                <AdminTicketDetail 
                  ticketId={selectedAdminTicketId}
                  onTicketUpdated={loadAdminData}
                />
              </div>
            )}

            {adminTab === 'authors' && (
              <AdminAuthorsView />
            )}

            {adminTab === 'analytics' && (
              <AdminAnalytics />
            )}

            {adminTab === 'kb' && (
              <KnowledgeBaseExplorer />
            )}
          </div>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

function AppContent() {
  const { user, isLoading } = useAuth();

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'var(--bg-main)', color: 'var(--text-muted)' }}>
        <p>Connecting to BookLeaf Publishing Portal...</p>
      </div>
    );
  }

  if (!user) {
    return <LoginPage />;
  }

  return <MainPortal />;
}

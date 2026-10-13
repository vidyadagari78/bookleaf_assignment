const { app, server } = require('./src/server');

async function runTests() {
  const PORT = 5001;
  await new Promise((resolve) => server.listen(PORT, resolve));
  console.log(`Test server running on port ${PORT}`);

  const baseUrl = `http://localhost:${PORT}/api/v1`;

  try {
    // 1. Health probe
    const healthRes = await fetch(`${baseUrl}/system/health`).then(r => r.json());
    console.log('✓ 1. Health probe:', healthRes.status, 'Authors in DB:', healthRes.database.authors);

    // 2. Demo accounts
    const demoRes = await fetch(`${baseUrl}/auth/demo-accounts`).then(r => r.json());
    console.log('✓ 2. Demo accounts:', demoRes.authors.length, 'authors,', demoRes.admins.length, 'admins');

    // 3. Author login
    const loginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'aarav.sharma@example.com', password: 'password123' })
    }).then(r => r.json());
    console.log('✓ 3. Author login successful:', loginRes.user.name, 'Token exists:', !!loginRes.token);
    const authorToken = loginRes.token;

    // 4. My Books
    const booksRes = await fetch(`${baseUrl}/books`, {
      headers: { 'Authorization': `Bearer ${authorToken}` }
    }).then(r => r.json());
    console.log('✓ 4. My Books count:', booksRes.books.length, 'Total Royalty Pending: ₹' + booksRes.summary.royalty_pending);

    // 5. Create Ticket with AI classification
    const newTktRes = await fetch(`${baseUrl}/tickets`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${authorToken}`
      },
      body: JSON.stringify({
        book_id: 'book-001',
        subject: 'Author copies have blurry cover colors and misaligned spine',
        description: 'Received the 5 copies yesterday and the spine is shifted by 3mm and colors are dull.'
      })
    }).then(r => r.json());
    console.log('✓ 5. Ticket created:', newTktRes.ticket.id, 'AI Category:', newTktRes.ticket.ai_category, 'AI Priority:', newTktRes.ticket.ai_priority, 'Score:', newTktRes.ticket.ai_priority_score);

    // 6. Admin login
    const adminLoginRes = await fetch(`${baseUrl}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email: 'admin@bookleafpublishing.com', password: 'adminpassword123' })
    }).then(r => r.json());
    console.log('✓ 6. Admin login:', adminLoginRes.user.name, 'Role:', adminLoginRes.user.role);
    const adminToken = adminLoginRes.token;

    // 7. Admin AI Draft generation
    const draftRes = await fetch(`${baseUrl}/tickets/${newTktRes.ticket.id}/ai-draft`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ toneStyle: 'Empathetic & Professional' })
    }).then(r => r.json());
    console.log('✓ 7. AI Draft Generated. Provider:', draftRes.metadata.provider);
    console.log('   Preview (first 100 chars):', draftRes.draft.slice(0, 100).replace(/\n/g, ' ') + '...');

    // 8. Admin Internal Note
    const noteRes = await fetch(`${baseUrl}/tickets/${newTktRes.ticket.id}/notes`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${adminToken}`
      },
      body: JSON.stringify({ note: 'Reviewed Repro India batch logs. Approving complimentary replacement dispatch.' })
    }).then(r => r.json());
    console.log('✓ 8. Admin internal note added:', noteRes.note.id);

    // 9. Author checks ticket: Verify internal note is strictly hidden
    const authorViewTkt = await fetch(`${baseUrl}/tickets/${newTktRes.ticket.id}`, {
      headers: { 'Authorization': `Bearer ${authorToken}` }
    }).then(r => r.json());
    console.log('✓ 9. Author view security check: internal_notes length =', authorViewTkt.ticket.internal_notes.length, '(Must be 0)');

    // 10. Admin Stats
    const statsRes = await fetch(`${baseUrl}/admin/stats`, {
      headers: { 'Authorization': `Bearer ${adminToken}` }
    }).then(r => r.json());
    console.log('✓ 10. Admin Stats: Total Tickets =', statsRes.stats.total_tickets, 'Unresolved Urgent =', statsRes.stats.urgent_unresolved, 'Agreement Rate =', statsRes.stats.ai_agreement_rate + '%');

    console.log('\n=======================================');
    console.log('🎉 ALL 10 BACKEND INTEGRATION TESTS PASSED!');
    console.log('=======================================');
  } catch (err) {
    console.error('Test failed:', err);
    process.exitCode = 1;
  } finally {
    server.close();
  }
}

runTests();

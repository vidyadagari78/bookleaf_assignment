# 📝 Engineering Approach & Architectural Trade-offs

**Project:** Author Support & Communication Portal  
**Candidate:** Vidyashree Dagari (Full-Stack & AI Systems Engineering)  
**Submission:** BookLeaf Technical Assignment Evaluation  

---

### 1. What We Prioritised
When handling 1,200+ new titles each month and an active catalog of 22,000+ books, the primary operational challenge is **triaging velocity and communication consistency**. We prioritized:

1. **AI Integration Quality & Policy Grounding (25% Weight):**
   - The AI must not produce generic boilerplate responses. It must sound like an empathetic BookLeaf representative who knows the author's exact book, copies sold, pending royalty balance, and publication status.
   - We prioritized **Token-Aware Dynamic Policy Slicing**. Instead of dumping the full 3,000+ token Knowledge Base on every call, the engine dynamically selects only the relevant policy module (Royalty, ISBN, Quality, or Distribution), reducing input token consumption by **~85%**.
2. **Graceful Degradation & High Availability:**
   - In a production environment, LLM APIs experience rate limits (HTTP 429), timeouts, and transient network failures. Ticket submission and operations triage **must never fail**. We built a deterministic **Knowledge Base Semantic Fallback Engine** that generates tailored drafts and accurate classifications even if third-party APIs are down.
3. **Product Thinking & Operational Ergonomics:**
   - We prioritized a cohesive dual-portal experience: author transparency (royalty rollover rules, 9-stage production stepper) and admin control (urgency highlighting, priority scoring, admin category/priority overrides, and private internal notes).
   - Reviewer convenience: a built-in **1-click Demo Account Switcher** allows instant testing across all 10 authors and 2 admins.

---

### 2. Trade-offs Made
1. **SQLite (`better-sqlite3`) vs. Multi-Node PostgreSQL Cluster:**
   - *Trade-off:* We opted for `better-sqlite3` with WAL mode over an external PostgreSQL/Docker setup.
   - *Rationale:* Portability and zero-dependency evaluator experience. A reviewer can clone the repo and run `npm test` or `npm start` in seconds without configuring connection strings, Docker containers, or migration credentials. The codebase uses clean repository abstractions, allowing a drop-in replacement with PostgreSQL (`pg` / Prisma) for horizontal multi-server scaling.
2. **Server-Sent WebSockets vs. Dedicated Message Broker (RabbitMQ/Kafka):**
   - *Trade-off:* We implemented native Node.js WebSockets (`ws`) rather than an external message queue.
   - *Rationale:* For a single-instance service, native WebSockets provide instantaneous bi-directional updates with minimal resource overhead. In a distributed multi-replica cluster, this would be backed by Redis Pub/Sub.
3. **Simulated File Upload UI vs. AWS S3 Presigned URLs:**
   - *Trade-off:* File attachment handling includes full client-side metadata extraction, preview generation, and local upload storage rather than direct-to-S3 presigned multipart uploads.
   - *Rationale:* Keeps the prototype self-contained and immediately testable without requiring active AWS IAM credentials.

---

### 3. How We Would Evolve This in Production
If scaling this system across BookLeaf’s full 22,000+ book catalog:

1. **Enterprise RAG Pipeline with pgvector:**
   - Ingest past resolved ticket threads, author contracts, and printing press quality logs into PostgreSQL 16 using `pgvector` HNSW vector indexes. This enables semantic retrieval of historical precedent (e.g., *"How was Repro India print defect batch #981 resolved last month?"*).
2. **Automated RazorpayX / Stripe Connect Payouts:**
   - Connect the royalty calculation engine directly to RazorpayX APIs. When an author’s quarterly balance exceeds ₹1,000 and bank details are verified, the admin can approve one-click batch NEFT disbursements directly from the ticket thread.
3. **Human-in-the-Loop Feedback & Active Learning:**
   - When admins override an AI category or priority, log the delta into an automated evaluation pipeline (e.g., Langfuse / Phoenix). Fine-tune or refine prompt few-shot examples on recurring false positives.
4. **Omnichannel Ingestion (Email & WhatsApp):**
   - Bind the ticket API to SendGrid/Postmark inbound parse webhooks and the WhatsApp Business API. Authors can reply via email or WhatsApp while BookLeaf operations manages everything within the centralized portal.

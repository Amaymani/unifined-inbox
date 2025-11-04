

# 📨 Unified Inbox — Multi-Channel Customer Outreach Platform

A **Next.js 16** full-stack communication suite that aggregates **SMS**, **WhatsApp**, and optional **email/social media** messages into a single inbox.
Built for team collaboration, analytics, and seamless customer engagement.

---

## 🚀 Features

✅ **Unified Inbox** — view and reply to conversations from multiple channels
✅ **Secure Authentication** — BetterAuth (credentials + Google)
✅ **Team Collaboration** — shared threads, private/public notes
✅ **Twilio Integration** — outbound + inbound SMS/WhatsApp
✅ **Analytics Dashboard** — response time, message volume, channel usage
✅ **Realtime Updates** — lightweight Server-Sent Events (SSE) stream
✅ **Scalable Architecture** — Prisma + Supabase Postgres
✅ **Modern UI** — Next.js App Router + ShadCN UI + TailwindCSS

---

## 🧩 Tech Stack

| Layer                  | Technology                          | Purpose                      |
| ---------------------- | ----------------------------------- | ---------------------------- |
| **Frontend / Backend** | Next.js 16 (App Router, TypeScript) | Unified codebase             |
| **Database**           | Supabase Postgres + Prisma ORM      | Relational data, migrations  |
| **Auth**               | BetterAuth (prisma adapter)         | Sessions + role-based access |
| **Messaging**          | Twilio SDK (SMS + WhatsApp)         | Multi-channel communication  |
| **UI Kit**             | ShadCN UI + Tailwind CSS            | Clean, responsive styling    |
| **Charts**             | Recharts                            | Data visualization           |
| **Realtime**           | Custom SSE (EventSource)            | Instant inbox refresh        |
| **Validation**         | Zod                                 | Type-safe API validation     |

---

## ⚙️ Setup Guide

### 1️⃣ Clone & Install

```bash
git clone https://github.com/Amaymani/unifined-inbox.git
cd unified-inbox
npm install
```

### 2️⃣ Configure Environment

Create `.env` in the project root:

```env
DATABASE_URL=postgresql://user:pass@host:5432/db
DIRECT_URL=postgresql://user:pass@host:5432/db
BETTER_AUTH_SECRET=<string>
BETTER_AUTH_URL=<ngrokurl>
```
```.env.local
# .env.local.example
# Rename this file to `.env.local` and fill in real values.

# ---------- DATABASE ----------
# Pooled connection for Prisma at runtime
DATABASE_URL="postgresql://USER:PASSWORD@HOST:6543/DATABASE?pgbouncer=true"

# Direct connection for Prisma migrations
DIRECT_URL="postgresql://USER:PASSWORD@HOST:5432/DATABASE"

# ---------- TWILIO ----------
TWILIO_ACCOUNT_SID="your_twilio_account_sid"
TWILIO_AUTH_TOKEN="your_twilio_auth_token"
TWILIO_SMS_NUMBER="+1234567890"
TWILIO_WHATSAPP_NUMBER="+14155238886" # Twilio sandbox number

# ---------- GOOGLE OAUTH ----------
GOOGLE_CLIENT_ID="your_google_client_id"
GOOGLE_CLIENT_SECRET="your_google_client_secret"

# ---------- AUTH ----------
BETTER_AUTH_SECRET="your_random_secret_string"

# BETTER_AUTH_URL="https://your-ngrok-url.ngrok-free.dev"
# NEXT_PUBLIC_APP_URL="https://your-ngrok-url.ngrok-free.dev"

```
### 3️⃣ Database & Run

```bash
npx prisma migrate deploy
npm run dev
```

### 4️⃣ Configure Twilio Webhook

In the **Twilio Console**, set:

```
When a message comes in → https://your-app.com/api/webhooks/twilio
```

---

## 🧾 Integration Comparison Table

| Channel                           | Integration                   | Avg Latency | Cost / Msg    | Reliability | Notes                   |
| --------------------------------- | ----------------------------- | ----------- | ------------- | ----------- | ----------------------- |
| **SMS**                           | Twilio REST API               | ~1 sec      | ₹0.70 – ₹1.00 | ⭐⭐⭐⭐☆       | Core text channel       |
| **WhatsApp**                      | Twilio Business API (Sandbox) | ~2 sec      | ₹0.90         | ⭐⭐⭐⭐☆       | Template-based outbound |


---

## 🧠 Key Design Decisions

| Area          | Decision                            | Rationale                      |
| ------------- | ----------------------------------- | ------------------------------ |
| **Auth**      | BetterAuth with Google & Email      | Simplicity + role support      |
| **DB**        | Supabase Postgres via Prisma        | Type-safe ORM + migrations     |
| **Messaging** | Twilio abstraction (`createSender`) | Channel-agnostic send API      |
| **Realtime**  | Server-Sent Events (`/api/events`)  | Minimal overhead vs WebSockets |
| **Frontend**  | Next.js 14 + ShadCN                 | Modern UI + SSR/CSR hybrid     |
| **Analytics** | Prisma aggregations + Recharts      | No external BI dependency      |
| **Collab**    | Notes w/ Private toggle             | CRM-like team workflow         |

---

## 📊 Analytics Metrics

| Metric                    | Description                             |
| ------------------------- | --------------------------------------- |
| **Messages per Channel**  | Distribution of traffic by SMS/WhatsApp |
| **Daily Activity**        | 7-day line chart of message volume      |
| **Average Response Time** | Mean time between inbound and outbound  |
| **Thread Status**         | Open vs Closed vs Snoozed threads       |

---

## ERD 
erDiagram
    USER {
        String id PK
        String email
        String name
        String avatar
        String password
        Role role
        Boolean emailVerified
        DateTime createdAt
        DateTime updatedAt
    }

    TEAM {
        String id PK
        String name
        DateTime createdAt
    }

    TEAMUSER {
        String id PK
        String userId FK
        String teamId FK
        Role role
    }

    CONTACT {
        String id PK
        String name
        String phone
        String email
        String externalId
        DateTime createdAt
        DateTime updatedAt
    }

    THREAD {
        String id PK
        String contactId FK
        String assignedToId FK
        ThreadStatus status
        DateTime createdAt
        DateTime updatedAt
    }

    MESSAGE {
        String id PK
        String threadId FK
        String createdById FK
        Direction direction
        Channel channel
        String body
        String mediaUrl
        String providerMsgId
        String from
        String to
        DateTime createdAt
    }

    NOTE {
        String id PK
        String threadId FK
        String authorId FK
        String contactId FK
        String content
        Boolean isPrivate
        DateTime createdAt
    }

    SESSION {
        String id PK
        String token
        String userId FK
        DateTime expiresAt
        DateTime createdAt
        String ipAddress
        String userAgent
    }

    ACCOUNT {
        String id PK
        String accountId
        String providerId
        String userId FK
        String accessToken
        String refreshToken
        String idToken
        DateTime accessTokenExpiresAt
        DateTime createdAt
    }

    %% === Relationships ===
    USER ||--o{ TEAMUSER : "member of"
    TEAM ||--o{ TEAMUSER : "has many members"

    USER ||--o{ THREAD : "assigned threads"
    CONTACT ||--o{ THREAD : "has threads"

    THREAD ||--o{ MESSAGE : "contains messages"
    THREAD ||--o{ NOTE : "contains notes"
    USER ||--o{ NOTE : "writes"
    CONTACT ||--o{ NOTE : "linked to"

    USER ||--o{ SESSION : "has sessions"
    USER ||--o{ ACCOUNT : "has accounts"

---

## 🧱 System Architecture

```mermaid
graph TD
A[Next.js Frontend] -->|fetch| B[API Routes]
B -->|ORM| C[Prisma + Supabase Postgres]
B -->|Send| D[Twilio API (SMS/WhatsApp)]
D -->|Webhook Inbound| B
B -->|Emit| E[SSE Stream → Inbox UI]
C -->|Aggregate| F[Analytics Dashboard]
```

---



## 🎥 Demo Video

📹 **[Watch Loom Demo (3-5 min)](https://drive.google.com/file/d/1OdHHc99qkE3-VGEoNIfOvljokBphmjie/view?usp=sharing)**
Shows sending + receiving messages, adding notes, and viewing analytics.

---

## 🧩 Authors & Acknowledgments

**Developed by:** Amay Mani
**Assignment:** Attack Capital — Associate Position (“Unified Inbox for Multi-Channel Customer Outreach”)


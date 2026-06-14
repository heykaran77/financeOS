# Finance OS

A self-built, full-stack personal finance workspace. No templates. No workarounds. Just a purpose-built tool that does exactly what I need.

---

## The Story

I spent a long time managing my finances inside Notion. Custom databases, linked properties, rollup formulas, filtered views — the whole setup. And for a while, it worked. But as my financial life grew in complexity, so did the cracks.

Notion is fundamentally a document tool. It is exceptionally good at what it was designed for. But personal finance is not a document problem. It is a data problem. The moment I wanted a real spending trend chart, a live budget tracker, or a savings goal linked directly to actual transaction records, I hit walls that no template could fix. Calculated properties only go so far. Rollups lie when the data model underneath them does not match your mental model. Filters reset. Views break. Every month, I spent more time maintaining the system than actually understanding my money.

I decided that if I was going to spend time on a tool, I should spend it building one that fits the problem correctly from the start — one where the data model is mine, the UI is deliberate, and the behavior is exactly what I want. That is where Finance OS came from.

This project is not trying to replace Notion for everyone. It is a personal statement: that sometimes the right answer to "there is no perfect tool" is to build it yourself.

---

## What It Does

Finance OS is a personal financial operating system. It is structured around the core primitives of personal finance and gives you a clean, fast interface to work with them.

### Dashboard

The central overview of your financial life. At a glance, you see your total net worth across all accounts, your cash flow balance (income vs. expenses) for the current period, and a visual breakdown of how your accounts are distributed. Below the summary row, the dashboard presents:

- A monthly spending trend chart spanning the last twelve months
- A real-time budget status tracker per category
- A category-level spending breakdown (pie chart, monthly or yearly)
- A goals progress overview showing how far each savings goal has come
- Recent transaction activity
- Upcoming recurring payments

All chart data is fetched in parallel using React's `Suspense` boundaries with passed promises, so the page skeleton renders immediately and charts stream in as data resolves.

### Transactions

A unified ledger for all money movement. Every transaction is typed as either an expense, an income, or a transfer. Transactions carry metadata including the payment method, the source (for income), a category, tags, a linked bank account, and an optional link to a savings goal. The data model enforces that amounts are always positive and that transaction types are constrained at the database level.

### Budgets

Spending limits set per category, per period. Budget periods can be monthly, weekly, or yearly. The system enforces one budget per user per category per period through a database-level unique constraint. Budget status is computed live against actual transaction data, giving you an honest read on where you stand.

### Goals

Savings goals with a target amount, an optional target date, and three possible states: in progress, paused, and completed. Goals are linked directly to transactions — when you add funds to a goal, the system atomically deducts from the source bank account, records a transfer transaction with the goal linked, and updates the goal's current amount. If the new amount meets or exceeds the target, the goal is automatically marked complete. All of this happens inside a single database transaction, so the state is always consistent.

### Recurring Transactions

Templates for expenses and incomes that repeat on a schedule (daily, weekly, monthly, or yearly). These are designed to be processed by a server action or scheduled job, which creates real transaction records and advances the next due date.

### Bank Accounts

A registry of the user's financial accounts — checking, savings, credit cards, cash wallets, investments, and others. Each account tracks a running balance, a currency (defaulting to INR), and optional UI metadata like a hex color and an icon identifier.

---

## Tech Stack

### Framework

**Next.js 16** with the App Router. The application uses Server Components as the default rendering mode, keeping the client bundle lean. Data fetching happens on the server, close to the database. Server Actions handle all mutations, which means no API routes to maintain for standard CRUD operations. The route structure uses route groups to separate the authenticated dashboard shell from the public landing page without affecting the URL.

### Authentication

**Better Auth** handles authentication end-to-end. Users can sign in with email and password (with email verification enforced) or through Google OAuth. Better Auth is integrated with the Drizzle ORM adapter, which means the auth tables live in the same PostgreSQL database alongside the application data — no separate auth service to manage. On user creation, the system hooks in to generate an avatar from the DiceBear API using the user's name as a seed, so every account has a distinct identity without requiring a profile photo.

### Email

**Nodemailer** handles all transactional email delivery. Because Better Auth requires email verification before an account is activated, Nodemailer is wired into the auth layer as the transport for sending verification links and any other system-generated emails (such as password reset flows). The SMTP configuration is kept entirely in environment variables, which means the transport can be pointed at any provider — a self-hosted mail server, a relay service like Resend or SendGrid, or a development catcher like Ethereal — without touching application code.

### Database

**PostgreSQL** hosted on Supabase, accessed through the `postgres` driver. The schema is defined entirely in TypeScript using **Drizzle ORM**, which provides type-safe query building and schema management without code generation overhead at runtime. All schema files live in `db/schema/` and are organized one-file-per-table. Database constraints (type enumerations, amount positivity checks, unique indexes) are declared at the schema level so they are enforced at the database, not just in application code.

The schema includes:

| Table                                        | Description                                                 |
| -------------------------------------------- | ----------------------------------------------------------- |
| `user`, `session`, `account`, `verification` | Managed by Better Auth                                      |
| `bank_account`                               | User's financial accounts with balance and currency         |
| `category`                                   | Both system-default and user-created transaction categories |
| `transaction`                                | Core ledger: expenses, incomes, and transfers               |
| `recurring_transaction`                      | Templates for scheduled repeating transactions              |
| `budget`                                     | Spending limits per category per period                     |
| `goal`                                       | Savings goals with live progress tracking                   |
| `tag`, `transaction_tag`                     | Tagging system for cross-cutting transaction labels         |

Schema migrations are managed with **Drizzle Kit**, and the migration output lives in the `drizzle/` directory.

### UI and Styling

**Tailwind CSS v4** for all styling, with `@tailwindcss/postcss` handling the PostCSS integration. The design leans into neutral base tones with a dark-first default theme. Typography uses **Inter** as the primary sans-serif and **Geist Mono** for monospaced contexts, both loaded from Google Fonts via Next.js font optimization.

The component library is built on top of a combination of **Base UI** (`@base-ui/react`) and **Radix UI** primitives, which provide accessible, unstyled behaviors. These are wrapped into a cohesive design system in `components/ui/` that covers the full range of interactive patterns: buttons, inputs, selects, comboboxes, dialogs, drawers, menus, toasts, tooltips, progress bars, tabs, calendars, number fields, and more.

Animation is handled at two levels:

- **Framer Motion** (`motion`) for component-level transitions and layout animations
- **GSAP** (`@gsap/react`) for more complex timeline and scroll-driven animations
- **`@number-flow/react`** for animated numeric transitions, used in the financial summary cards where values update smoothly as data loads

**Recharts** powers the data visualization layer, providing the spending trend bar chart, budget status indicators, category spending pie chart, and goals progress chart.

**`class-variance-authority`** and **`tailwind-merge`** handle variant-based component styling and class conflict resolution, respectively.

### Forms and Validation

**React Hook Form** manages all form state, paired with **Zod** for schema-based validation. The `@hookform/resolvers` package bridges the two. The same Zod schemas used for form validation serve as the single source of truth for form shape, so validation logic is not duplicated between the client and server.

### Code Quality

**ESLint** with the `eslint-config-next` ruleset enforces code quality. **Prettier** handles formatting, with `prettier-plugin-tailwindcss` sorting Tailwind utility classes automatically. **Husky** and **lint-staged** enforce that both ESLint and Prettier run on staged files before each commit, keeping the codebase consistent.

---

## Project Structure

```
finance-os/
  app/
    (landing)/          # Public landing page
    (dashboard)/        # Authenticated application shell
      layout.tsx        # Sidebar, header, and progressive blur overlay
      dashboard/        # Overview page with all summary cards and charts
      transactions/     # Transaction ledger and management
      budgets/          # Budget configuration and status
      goals/            # Savings goals with fund allocation
    api/                # Next.js API route handlers (auth endpoints)
    auth/               # Auth pages (sign in, sign up, verify)
    globals.css         # Global styles and CSS custom properties
    layout.tsx          # Root layout with font variables and providers
  components/
    ui/                 # Design system: all primitive and composed components
    common/             # Shared application-level components (sidebar, search)
    forms/              # Form components for transactions, goals, budgets
    evilcharts/         # Chart wrapper components built on Recharts
    landing/            # Components specific to the landing page
    providers/          # Context providers (theme, etc.)
  db/
    schema/             # Drizzle ORM table definitions, one file per table
    index.ts            # Database client initialization
    seed.ts             # Development seed data script
  lib/
    auth.ts             # Better Auth configuration
    auth.server.ts      # Server-side auth helpers
    auth-client.ts      # Client-side auth helpers
    queries/            # Read-only database query functions
    utils.ts            # Utility functions (cn, etc.)
  actions/              # Next.js Server Actions for all mutations
  config/               # Navigation and application configuration
  types/                # TypeScript type definitions
  hooks/                # Custom React hooks
  drizzle/              # Generated migration files
  proxy.ts              # Next.js 16 routing middleware and auth protection
  drizzle.config.ts     # Drizzle Kit configuration
```

---

## Getting Started

### Prerequisites

- Node.js 20 or later
- A PostgreSQL database (Supabase recommended)
- A Google Cloud project with OAuth credentials configured

### Environment Variables

Create a `.env` file in the root of the project with the following variables:

```env
DATABASE_URL=postgresql://user:password@host:port/database

BETTER_AUTH_SECRET=your_random_secret_string
BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

`BETTER_AUTH_SECRET` should be a long, randomly generated string. You can generate one with `openssl rand -base64 32`.

### Installation

```bash
npm install
```

### Database Setup

Push the schema to your database:

```bash
npx drizzle-kit push
```

Optionally, seed the database with sample data for development:

```bash
npx tsx db/seed.ts
```

### Development Server

```bash
npm run dev
```

The application will be available at [http://localhost:3000](http://localhost:3000).

---

## Available Commands

| Command                | Description                              |
| ---------------------- | ---------------------------------------- |
| `npm run dev`          | Start the development server             |
| `npm run build`        | Build the application for production     |
| `npm run start`        | Start the built production server        |
| `npm run lint`         | Run ESLint across the codebase           |
| `npm run lint-fix`     | Auto-fix ESLint issues where possible    |
| `npm run format`       | Format all source files with Prettier    |
| `npm run format:check` | Check formatting without writing changes |

---

## Design Decisions

**Server Components as the default.** The entire dashboard shell fetches data on the server. Client components are used only where interactivity requires it — forms, animated values, chart rendering. This keeps Time to First Byte low and eliminates loading spinners for the initial page render.

**Parallel data fetching with promise passing.** On the dashboard page, all chart queries are initiated at the top of the Server Component and their promises are passed down to child components wrapped in `Suspense`. This means all queries run in parallel on the server rather than sequentially, and each chart resolves and hydrates independently.

**Atomic goal funding.** When a user allocates funds to a savings goal, the operation touches three tables (bank account balance, transaction record, and goal current amount) and must succeed or fail as a unit. This is done inside a `db.transaction()` call in the Server Action, which guarantees consistency even if the request fails midway.

**Database-level constraints over application-level guards.** Type enumerations, amount positivity, and uniqueness requirements are enforced with `CHECK` constraints and `UNIQUE` indexes at the PostgreSQL level. Application validation is a convenience layer on top of what the database already guarantees.

**INR as the default currency.** Finance OS is built for personal use with the Indian financial context in mind. INR is the default currency on bank accounts, though the field accepts any currency string.

---

## License

This project is personal software, built for personal use. It is shared publicly for reference and learning purposes.

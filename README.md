# FinanceOS

A modern, full-stack financial workspace and dashboard built with Next.js 16.

## Tech Stack

- **Framework:** Next.js 16 (App Router, Turbopack, Proxy Middleware)
- **Authentication:** Better Auth (Email/Password & Google Social Sign-In)
- **Database & ORM:** PostgreSQL (Supabase) with Drizzle ORM
- **Styling & UI:** Tailwind CSS v4, Motion, Radix UI, Base UI, Shadcn/ui components

## Getting Started

### Prerequisites

Create a `.env` file in the root directory and configure the following environment variables:

```env
DATABASE_URL=postgresql://...
BETTER_AUTH_SECRET=your_better_auth_secret
BETTER_AUTH_URL=http://localhost:3000

GOOGLE_CLIENT_ID=your_google_client_id.apps.googleusercontent.com
GOOGLE_CLIENT_SECRET=your_google_client_secret
```

### Installation

Install dependencies:

```bash
npm install
```

### Running the App

Start the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

- `app/`: Next.js App Router paths and pages (e.g., auth, dashboard, API routes)
- `components/`: Reusable UI components (shadcn/ui primitives, custom forms, sidebar layout)
- `config/`: Configuration files (navigation configurations, etc.)
- `lib/`: Initialization code (better-auth instance, DB setup)
- `types/`: Zod and TypeScript schema definitions
- `proxy.ts`: Next.js 16 routing and authentication protection middleware

## Commands

- `npm run dev` - Start the development server
- `npm run build` - Build the application for production
- `npm run start` - Start the built production server
- `npm run lint` - Run ESLint diagnostics
- `npm run lint-fix` - Auto-fix ESLint issues
- `npm run format` - Format code with Prettier
- `npm run format:check` - Check formatting status

# Technology Stack

## Architecture

SPA with feature-first organization. API communication via custom JWT-authenticated fetch client. Type safety from Zod schemas to TypeScript types.

## Core Technologies

- **Language**: TypeScript 5.6+
- **Framework**: React 18
- **Build Tool**: Vite 5
- **Runtime**: Node.js (Docker development environment)

## Key Libraries

- **UI**: Tailwind CSS + shadcn/ui (Radix primitives) + MUI v6
- **Routing**: React Router v6
- **State Management**: TanStack Query v5 (server state)
- **Validation**: Zod (schemas are source of truth for types)
- **Hosting**: Firebase

## Development Standards

### Type Safety
- Zod schemas define types; use `z.infer<typeof Schema>` for type definitions
- Path alias `@/` maps to `./src/`
- TypeScript strict mode enabled

### Code Quality
- ESLint flat config with import ordering rules
- Prettier for formatting
- Pre-commit: `pnpm lint`

### Testing
(No test framework configured yet)

## Development Environment

### Required Tools
- Docker / Docker Compose (recommended)
- pnpm (package manager)

### Common Commands
```bash
# Dev: pnpm dev
# Build: pnpm build
# Lint: pnpm lint
# Mock API: pnpm start-mock (Prism mock server)
```

## Key Technical Decisions

- **shadcn/ui + MUI**: shadcn/ui for base components, MUI for icons/specific components
- **Custom API client**: JWT authentication with automatic token refresh, snake_case ↔ camel_case conversion
- **Feature-first structure**: Each feature has `routes/`, `components/`, `hooks/`, `types/`, `schemas/`

---
_Document standards and patterns, not every dependency_

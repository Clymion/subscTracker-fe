# Project Structure

## Organization Philosophy

Feature-first architecture: Each domain is a self-contained module with its own routes, components, hooks, types, and schemas.

## Directory Patterns

### Features (`/src/features/`)
**Location**: `/src/features/{feature-name}/`
**Purpose**: Domain-specific modules (auth, subscriptions, settings, labels, history, misc)
**Structure**:
```
features/
├── auth/           # Login, register
├── subscriptions/  # Main subscription management
├── settings/       # User preferences
├── labels/         # Tag management
├── history/        # Payment history
└── misc/           # Test pages
```

### Feature Module Pattern
**Location**: `/src/features/{feature}/`
**Purpose**: Co-locate feature-related code
**Example**:
```
subscriptions/
├── routes/         # Page components (MainPage.tsx)
├── components/     # Feature-specific components
├── hooks/          # Feature-specific hooks
├── types/          # Re-exports from schemas
└── schemas/        # Zod schemas (source of truth)
```

### Shared UI Components (`/src/components/ui/`)
**Location**: `/src/components/ui/`
**Purpose**: Reusable design-system primitives (shadcn/ui)
**Pattern**: Named by function (Button, Input, Dialog), no business logic

### Layout Components (`/src/components/layout/`)
**Location**: `/src/components/layout/`
**Purpose**: Structural components (SideNavigation)

### Library (`/src/lib/`)
**Location**: `/src/lib/`
**Purpose**: Shared utilities (api-client, utils)

### Constants (`/src/constants/`)
**Location**: `/src/constants/`
**Purpose**: Static values and enums (subscription.ts, label.ts)

### Config (`/src/config/`)
**Location**: `/src/config/`
**Purpose**: Environment configuration (env.ts)

## Naming Conventions

- **Files**: PascalCase for components (`MainPage.tsx`), camelCase for utilities
- **Components**: PascalCase exports (`export const Button`)
- **Types**: PascalCase, derived from schemas (`export type Subscription = z.infer<typeof SubscriptionSchema>`)

## Import Organization

```typescript
// 1. External (react, third-party)
import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';

// 2. Internal aliases (@/)
import { api } from '@/lib/api-client';
import { Button } from '@/components/ui/button';

// 3. Relative
import { SubscriptionSchema } from '../schemas';
```

**Path Aliases**:
- `@/`: Maps to `./src/`

## Code Organization Principles

- **Schemas are source of truth**: Types are derived from Zod schemas via `z.infer`
- **Feature isolation**: Features should not directly import from other features
- **Route components**: Page-level components live in `routes/`
- **Shared hooks**: `/src/hooks/` for cross-cutting hooks

---
_Document patterns, not file trees. New files following patterns shouldn't require updates_

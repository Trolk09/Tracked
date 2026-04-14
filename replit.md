# Workspace

## Overview

pnpm workspace monorepo using TypeScript. Each package manages its own dependencies.

## Current Product

- **Tracked**: React + Vite web app at `artifacts/tracked`, served from `/`.
- Tracked is a frontend-first student study planner that stores data in browser localStorage under `tracked_store` for the first build.
- Students add their own subjects and chapters; no syllabus data is preloaded.
- Main features include dashboard stats, daily tasks and future goals, subject-specific chapter tables, spaced revision dates, monthly revision calendar, flashcards, digital mistake journal, focus timer, weekly feedback, student/teacher profile mode, exam dates, class progress, and local reminder scheduling.
- Mistake journal entries can include uploaded question images stored as browser data URLs.
- Focus sessions require a chapter selection, unlock feedback after the session stops or completes, and save goal, completion note, feedback, confidence, and minutes against that chapter.
- Subject chapter tables show focus session counts/latest goals/latest feedback and weekly confidence ratings; confidence can be changed directly from the table.
- Dashboard shows weak and confident chapter lists using weakness notes and latest weekly feedback.
- Profile lets student or teacher mode create a class, add students/classmates, and track local progress fields for each student.
- Email reminder dates are shown in the UI, but real email delivery is explicitly not active until an email service is connected.

## Stack

- **Monorepo tool**: pnpm workspaces
- **Node.js version**: 24
- **Package manager**: pnpm
- **TypeScript version**: 5.9
- **API framework**: Express 5
- **Database**: PostgreSQL + Drizzle ORM
- **Validation**: Zod (`zod/v4`), `drizzle-zod`
- **API codegen**: Orval (from OpenAPI spec)
- **Frontend**: React + Vite + Tailwind CSS
- **Build**: esbuild (CJS bundle)

## Key Commands

- `pnpm run typecheck` — full typecheck across all packages
- `pnpm run build` — typecheck + build all packages
- `pnpm --filter @workspace/api-spec run codegen` — regenerate API hooks and Zod schemas from OpenAPI spec
- `pnpm --filter @workspace/db run push` — push DB schema changes (dev only)
- `pnpm --filter @workspace/api-server run dev` — run API server locally
- `pnpm --filter @workspace/tracked run dev` — run Tracked locally

See the `pnpm-workspace` skill for workspace structure, TypeScript setup, and package details.

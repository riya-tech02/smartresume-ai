# SmartResume AI — Architecture & Design Decisions (ADR)

## ADR-001: Monorepo Workspace Structure
- **Context:** PRD and ARCHITECTURE specify a monorepo containing `client`, `server`, and `shared`.
- **Decision:** Use npm workspaces (`shared`, `server`, `client`) with TypeScript project references / tsup bundling for `shared` to provide single source of truth for Zod schemas, constants, and types.
- **Consequences:** Eliminates schema duplication between Express 5 and React 19.

## ADR-002: Modular Monolith Backend
- **Context:** Need clean separation of concerns without distributed systems overhead.
- **Decision:** Feature modules (`auth`, `users`, `resumes`, `templates`, `ai`, `ats`, `jobmatch`, `pdf`) organized with strict route -> controller -> service -> model layering.

---
description: How to coordinate multiple agents working on LeukemiaLens
---

# Agent Coordination Guide

## Overview

LeukemiaLens uses a **domain-based agent ownership model** where different AI agents can own specific parts of the codebase. This document explains how to assign, coordinate, and hand off work between agents.

## Active Agent Domains

| Domain | Workflow File | Scope |
|--------|--------------|-------|
| Educational Content | `educational-content.md` | Patient education pages |
| Disease Pages | `disease-pages.md` | Disease-specific resource pages |
| API Development | `api-development.md` | Workers API endpoints |
| Data Ingestion | `data-ingestion.md` | PubMed ingestion pipeline |
| Frontend UI | `frontend-ui.md` | General UI components and styling |
| Auth & Users | `auth-users.md` | Clerk integration, user management |
| RAG Pipeline | `rag-pipeline.md` | Document ingestion and retrieval |

## How to Assign an Agent to a Domain

When starting work in a specific domain:

1. **Read the workflow file** for that domain first
2. **Follow the guidelines** and structure patterns defined
3. **Update progress** in the workflow file as you work
4. **Don't cross boundaries** without coordination (see below)

Example prompt to assign an agent:
```
You are the Education Content Agent for LeukemiaLens.
Read and follow the workflow at .agent/workflows/educational-content.md.
Your task is to [specific task within that domain].
```

## Cross-Domain Coordination

When work requires changes across multiple domains:

### Scenario: Adding a new education page that needs a new API endpoint

1. **Education Agent** creates the page component and UI
2. **Education Agent** documents the API requirement in their workflow file
3. **API Agent** is assigned to implement the endpoint
4. **API Agent** documents the endpoint contract
5. **Education Agent** integrates with the new endpoint

### Handoff Protocol

When completing work that another agent will need:

```markdown
## Handoff: [Feature Name]
- **From**: [Your Domain]
- **To**: [Target Domain]
- **What's Done**: [Summary of completed work]
- **What's Needed**: [What the other agent should do]
- **Files Modified**: [List of files]
- **Contract/Interface**: [Any API contracts, props, etc.]
```

## Shared Resources

These files are shared across all agents and require extra care:

| File | Usage |
|------|-------|
| `frontend/src/App.tsx` | Routing, state management - coordinate changes |
| `frontend/src/components/index.ts` | Shared component exports |
| `schema.sql` | Database schema - major changes need coordination |
| `ROADMAP.md` | Track all features and architectural decisions |
| `README.md` | Public documentation - update after major features |

## Conflict Resolution

If two agents need to modify the same file:

1. **Smaller scope wins** - Agent with smaller change waits
2. **Document dependencies** - Add notes to workflow files
3. **Sequential execution** - Don't run conflicting agents in parallel

## Quality Standards

All agents must ensure:

- [ ] Code follows existing patterns in the codebase
- [ ] TypeScript types are properly defined
- [ ] Mobile responsive design (all frontend work)
- [ ] No console errors or warnings
- [ ] Tests pass (when applicable)
- [ ] Documentation updated

## Creating a New Domain

To add a new agent domain:

1. Create `.agent/workflows/[domain-name].md`
2. Define scope, files, and guidelines
3. Add to this coordination document
4. Update `ROADMAP.md` if it affects the feature plan

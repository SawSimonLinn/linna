# Linna — MVP Feature Reference

**Linna** (Live Intelligent Notes and Navigation Assistant) is an open-source, project-aware AI assistant for indie developers and solo builders. It remembers your stack, goals, blockers, decisions, and chat history, then helps you keep building and launch.

---

## The Problem It Solves

| Problem | How Linna Fixes It |
|---|---|
| **Restart Problem** | Linna remembers your stack, goals, blockers, decisions, and chat history |
| **Launch Problem** | Devs don't know how to write marketing copy — Linna generates it |
| **Context-Switch Problem** | No single place holds the full project picture — Linna is that place |
| **Isolation Problem** | No thinking partner — Linna is your rubber-duck AI that knows your stack |
| **Momentum Problem** | Side projects die from losing the thread — Linna keeps it alive |

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | Next.js 15 (App Router, Turbopack) |
| UI | Tailwind CSS + shadcn/ui + Radix UI |
| AI | OpenAI GPT-4o-mini via Vercel AI SDK + Google GenAI via Genkit |
| Auth | Supabase Auth (email/password + OAuth) |
| Database | Supabase Postgres with Row Level Security |
| Payments | Stripe (subscription billing) |
| Deployment | Vercel |

---

## Pricing Plans

| Feature | Free | Pro ($12/mo) | Team ($29/mo) | Self-Host |
|---|---|---|---|---|
| Projects | 3 | Unlimited | Unlimited | Unlimited |
| Messages/month | 50 | Unlimited | Unlimited | Unlimited |
| Chat history | 7 days | Full | Full | Full |
| AI model | GPT-4o-mini | GPT-4o | GPT-4o | Your key |
| GitHub import & sync | ✓ | ✓ | ✓ | ✓ |
| Task tracker | ✓ | ✓ | ✓ | ✓ |
| Claude Code prompt gen | ✓ | ✓ | ✓ | ✓ |
| Launch Assistant | ✗ | ✓ | ✓ | ✓ |
| Team collaboration | ✗ | ✗ | ✓ (up to 10) | ✓ |
| Priority support | ✗ | ✓ | ✓ | Community |

---

## Pages

### Public Pages

| Route | Description |
|---|---|
| `/` | Landing page — hero, features overview, 3-step onboarding flow, pricing table, project chat mockup |
| `/sign-up` | Account creation — Google/GitHub OAuth + email/password, momentum snapshot sidebar |
| `/sign-in` | Login — email/password + Google/GitHub OAuth |
| `/pricing` | Full pricing tiers with feature comparison matrix and FAQ |
| `/open-source` | GitHub repo info and open source documentation |
| `/about` | Project philosophy and backstory |
| `/changelog` | Version history and release notes |
| `/roadmap` | Feature roadmap with status (shipped / in-progress / planned) |
| `/contact` | Support and contact page |
| `/privacy` | Privacy policy |
| `/terms` | Terms of service |
| `/invite/[token]` | Accept team project invitation (token-based, 7-day expiry) |

### Authenticated Pages (Protected)

#### Dashboard (`/dashboard`)
The main workspace listing all of a user's projects.

- Project cards (pastel colors, slight tilts for visual interest)
- Search and filter projects by name, description, or tech stack
- New project creation modal:
  - **Manual entry**: name, description, tech stack, goals, blockers, target user
  - **GitHub import tab**: browse and import repos with auto-extracted metadata
- Project sync button to pull latest GitHub data
- Task progress bar per project card
- Edit / delete project from overflow menu
- Plan badge (Free / Pro) shown in header
- Empty state with onboarding prompt
- Upgrade prompt when free plan project limit (3) is reached

#### Project Chat (`/project/[id]`)
The core workspace for each project. Everything is grounded in project context.

**Left sidebar**
- Project metadata: description, tech stack, goals, blockers, target user
- Editable in-place via settings panel

**Chat interface**
- Plan-aware message history (Free: last 7 days; paid plans: full history, sorted oldest → newest)
- Real-time streaming responses from AI (Server-Sent Events)
- AI always receives full project context as system prompt — no re-explaining needed
- Message actions:
  - Pin / unpin messages (bookmark important decisions)
  - Delete message with undo
  - Copy response to clipboard
  - **Generate Claude Code prompt** — formats AI response into a ready-to-paste executable prompt (file paths, component names, acceptance criteria, max 300 words)
- Session history panel to browse past messages

**Task panel**
- View all project tasks with completion checkboxes
- Manual task creation
- AI-generated tasks from MVP scope (OpenAI breaks scope into 5–15 actionable steps)
- Task completion tracked with counts on project card

**Team panel** (Pro)
- View all project members with roles (owner / member)
- Invite teammate by email (creates token-based invite, 7-day expiry)
- Cancel pending invitations
- Remove members

**Extras**
- Export visible chat history as Markdown file
- Next action extracted automatically from recent messages (shown at top)
- Project `last_active` timestamp auto-updated on every message

#### Launch Assistant (`/project/[id]/launch`) — Pro only
One-click generation of all launch marketing content.

| Section | Content Generated |
|---|---|
| **Product Hunt** | Tagline, description, maker comment, first comment |
| **Reddit Post** | Title + body (r/indiehackers / r/webdev style) |
| **Twitter/X Thread** | 5-tweet thread: hook → problem → solution → demo → CTA |
| **Landing Page Copy** | Hero headline, sub-headline, 3 feature bullets, pricing CTA |
| **Community List** | Relevant subreddits, Discord servers, Slack groups to post in |

Each section has a copy-to-clipboard button.

#### Settings (`/settings`)
- Profile display (avatar, name, email, plan status)
- AI response style toggle: Concise vs Detailed
- Compact sidebar toggle
- Show/hide project descriptions on dashboard
- Plan info with feature comparison
- Manage billing button (opens Stripe customer portal)
- Sign out

---

## API Routes

### Projects
| Method | Route | Description |
|---|---|---|
| GET | `/api/projects` | List all projects (ordered by last_active) |
| POST | `/api/projects` | Create project (enforces 3-project free plan limit) |
| GET | `/api/projects/[id]` | Get single project |
| PATCH | `/api/projects/[id]` | Update project fields |
| DELETE | `/api/projects/[id]` | Delete project and all related data |

### Messages & Chat
| Method | Route | Description |
|---|---|---|
| GET | `/api/projects/[id]/messages` | Fetch all messages |
| POST | `/api/projects/[id]/messages` | Create message (enforces 50 msg/month free limit) |
| PATCH | `/api/projects/[id]/messages/[messageId]` | Update message (pin/unpin) |
| DELETE | `/api/projects/[id]/messages/[messageId]` | Delete message |
| POST | `/api/projects/[id]/chat` | Streaming chat — SSE token-by-token, auto-saves response |

### GitHub
| Method | Route | Description |
|---|---|---|
| GET | `/api/github/repos` | List user's GitHub repos (requires GitHub token) |
| POST | `/api/github/import` | Import repo as new project (extracts README, languages, issues) |
| POST | `/api/projects/[id]/sync` | Re-sync project with latest GitHub data |

### Tasks
| Method | Route | Description |
|---|---|---|
| GET | `/api/projects/[id]/tasks` | List all tasks |
| POST | `/api/projects/[id]/tasks` | Create task(s) — manual or AI-generated from MVP scope |
| PATCH | `/api/projects/[id]/tasks/[taskId]` | Toggle task completion |
| DELETE | `/api/projects/[id]/tasks/[taskId]` | Delete task |

### Team Collaboration
| Method | Route | Description |
|---|---|---|
| GET | `/api/projects/[id]/members` | List members + pending invitations |
| POST | `/api/projects/[id]/members` | Invite teammate by email (Pro only) |
| DELETE | `/api/projects/[id]/members/[memberId]` | Remove member |
| GET | `/api/projects/[id]/invitations/[id]` | View invitation details |
| DELETE | `/api/projects/[id]/invitations/[id]` | Cancel invitation |
| POST | `/api/invite/[token]` | Accept invitation, join project |

### Billing
| Method | Route | Description |
|---|---|---|
| POST | `/api/stripe/checkout` | Create Stripe checkout session for Pro plan ($12/mo) |
| POST | `/api/stripe/portal` | Redirect to Stripe customer portal |
| POST | `/api/stripe/webhook` | Handle Stripe events (idempotent — deduped by event ID) |
| GET | `/api/user/plan` | Get current user plan + project count |

---

## AI Flows

### Context-Aware Chat
- **File**: `src/ai/flows/context-aware-chat-flow.ts`
- Injects full project context (name, description, tech stack, goals, blockers, target user) as system prompt
- Includes the plan-available chat history in every request
- Streams token-by-token via Vercel AI SDK
- Auto-retries up to 3× on transient errors (503, 529, rate limits)
- Model: OpenAI GPT-4o-mini

### Extract Next Action
- **File**: `src/ai/flows/extract-next-action-flow.ts`
- Reads last 10 messages and extracts the single most concrete next action
- Returns a verb-starting sentence (e.g., "Set up the database schema")
- Shown at top of project chat page

### Generate Claude Code Prompt
- **File**: `src/ai/flows/generate-codex-prompt-flow.ts`
- Takes last AI response + project context
- Formats it into a ready-to-paste prompt with file paths, component names, acceptance criteria
- Max 300 words, self-contained, immediately executable in Claude Code or Codex

### Generate Launch Content
- **File**: `src/ai/flows/generate-launch-content.ts`
- Takes all project metadata and generates all 5 launch sections simultaneously
- Uses Google GenAI via Genkit for flow orchestration
- One call produces Product Hunt, Reddit, Twitter, landing page copy, and community list

---

## Database Schema

### Tables

**`projects`** — Core project record
- `user_id`, `name`, `description`, `tech_stack`, `goals`, `blockers`, `target_user`
- `message_count`, `task_count`, `completed_task_count`, `mvp_scope`, `next_action`
- `github_repo_url`, `github_repo_name`, `github_owner`, `readme`, `last_synced_at`
- `last_active`, `created_at`

**`messages`** — Chat history
- `project_id`, `role` (user | assistant), `content`, `pinned`, `created_at`

**`tasks`** — Project task tracker
- `project_id`, `title`, `completed`, `order`, `created_at`

**`profiles`** — User settings and billing
- `id` (FK → auth.users), `github_token`, `plan` (free | pro), `stripe_customer_id`, `stripe_subscription_id`

**`project_members`** — Team membership
- `project_id`, `user_id`, `role` (owner | member)
- Unique constraint on `(project_id, user_id)`

**`project_invitations`** — Pending team invites
- `project_id`, `invited_email`, `invited_by`, `token` (unique hex), `accepted_at`, `expires_at` (7 days)

**`stripe_events`** — Webhook idempotency
- `event_id` (PK) — prevents duplicate processing

### Security
- All tables have Row Level Security (RLS) enabled
- Owners and team members both get project read/write access
- Service role key used only for Stripe webhook (bypasses RLS safely)

---

## Environment Variables

```bash
NEXT_PUBLIC_SUPABASE_URL=
NEXT_PUBLIC_SUPABASE_ANON_KEY=
SUPABASE_SERVICE_ROLE_KEY=
OPENAI_API_KEY=
STRIPE_SECRET_KEY=
STRIPE_WEBHOOK_SECRET=
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=
NEXT_PUBLIC_STRIPE_PRO_PRICE_ID=
```

---

## Roadmap (Planned / In-Progress)

- Message search across chat history
- Daily standup mode (AI summarizes what you did yesterday, what's next today)
- Idea validator (sanity-check your idea against market signals)
- Co-founder mode (AI takes on a devil's advocate persona)
- AI code review (inline review linked to GitHub PRs)

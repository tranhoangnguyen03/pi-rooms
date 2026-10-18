# Pi Rooms — Product and Functional Handoff

**Status:** Agreed product direction; engineering discovery and implementation planning requested  
**Date:** 18 October 2026  
**Audience:** Development team  
**Source context:** Product discussion about replacing the manual `pi-consultants` branch-and-merge workflow

## 1. Purpose

Build **Pi Rooms**: a way for a person to work in several connected, persistent **1:1 human–Pi sessions**, while Pi handles their creation, navigation, live communication, and recovery.

A user works with one session (the **parent**), chooses to open other sessions (the **children**), visits and personally steers each child, then returns to the parent to ask it to gather and reconcile the work. A child may itself become a parent if the user approves. The same experience must support coding and non-coding work.

**Guiding principle:** *The user manages the work. Pi manages the agents and sessions. Agents handle their reasoning, work products, and collaboration.*

This is **not** an autonomous multi-agent orchestration framework or a multi-agent chatroom. Its primary value is separating complex scopes into focused human–AI conversations without burdening the user with session administration.

## 2. Key terms

- **Room:** One ordinary, full-featured, persistent, interactive Pi session. It is identified by its Pi session identity, not by a terminal tab.
- **Parent:** The session from which the user initiates a branch. It prepares the children's initial context and later handles user-requested consolidation. A parent has no fixed profession or profile.
- **Child:** A newly created or attached room related to a parent. A child is a normal Pi session, not an automatically terminating subagent job.
- **Room group:** The navigable set of related parent and child rooms. A room may be both a child and a parent in an approved nested branch.
- **Branching:** Creating and linking one or more rooms at the user's request. Not a Git branch.
- **Consolidation:** An agent-led reconciliation of work from selected rooms, initiated by the user. Its output may be a discussion, document, design, code, plan, report, or any appropriate artifact. Not a forced template, completion gate, or automatic code merge.

The terms *PM*, *User Expert*, *System Expert*, and *AI Expert* are **examples only**. They must not appear as hard-coded system roles.

## 3. The intended user experience

### A. Enter a managed environment

For ordinary work, the user's normal `pi` command remains unchanged. For room-based collaboration, the user deliberately enters a managed environment through a proposed `pi-rooms` executable:

```bash
pi-rooms                 # start a new managed Pi session
pi-rooms --session <id>  # resume an existing Pi session in that environment
```

The executable should feel like Pi where practical, especially for `--session <id>`. The user can obtain the session ID from Pi's exit display or `/session`. The built-in Pi `/resume` must continue to work normally inside managed rooms.

Starting rooms from an already-running standalone Pi process need **not** be seamless in V1. The user may exit and reopen that saved conversation via the managed launcher. Never silently discard the session or duplicate a live instance.

### B. Work with any parent

The user discusses a project or large scope in an ordinary Pi conversation. Any agent can suggest that separate rooms may help, but **only the user decides whether to branch, how many rooms to open, and their intended roles**.

### C. Review and create child rooms

The parent proposes the children, prepares an appropriate brief for each, and seeks approval. Pi then creates the approved independent Pi sessions automatically, associates them with the parent, and makes them available for navigation.

**UX candidate:** a compact child-configuration modal using one card per proposed child. Each card could show:

| Field | Behavior |
|---|---|
| Room label | Editable human-readable name; no mandatory agent taxonomy |
| Focus / objective | Plain-language purpose, prepared by parent |
| Initial brief / references | Preview or expand to inspect parent-chosen context |
| Working directory | Defaults to parent's working directory; user can select another directory |

Keep the default path easy: approve the proposed cards in one action. Do not force users to fill an intake form or edit technical settings. The team should assess whether a Pi modal is the best way to deliver this preview and directory choice.

### D. Child startup behavior

After creation, a child should:

1. Receive its parent-prepared brief and references.
2. Conduct **bounded preliminary context gathering** from the materials available to it within the approved scope.
3. Introduce itself in its own room and report preliminary findings, relevant gaps, and a useful starting point for discussion.
4. Then await the user's personal direction; it must not treat room creation as permission for an open-ended autonomous assignment.

The user can visit children in any order and have long, ordinary conversations with each. Children can write code, documents, research notes, designs, or other work products as directed. Their conversations continue to exist when the user goes elsewhere.

### E. Navigate freely

Inside any managed room, `/rooms` opens a small native Pi modal listing related rooms. Selecting a room should focus its **existing full Pi terminal** rather than replace the current chat with a limited client. Returning to the parent must be easy.

Unfocused rooms remain live and connected when their Pi processes are running. Hiding a room must not terminate it. A stopped room remains discoverable and should be recoverable from its persisted Pi session.

Full ordinary Pi behavior is non-negotiable: normal slash commands, `/resume`, tools, skills, global and applicable project configuration, model selection, editor behavior, and custom UI extensions such as **`/bro simplify`** must still work.

### F. Cross-room live communication

Parent–child and peer–peer messages are valid and useful. Do **not** create a hard technical restriction on messaging among group members.

Add an **agent-facing conduct instruction**: before initiating a live cross-room message, the agent must tell the user **who it intends to contact and why**, and seek **explicit permission**. If the user has just expressly requested that precise communication, that request supplies the permission. This is an agent behavior rule, **not** a mandatory message-approval gate in the transport or UI.

The infrastructure should deliver live messages, replies, and pointers to work products. Messages should not force a combined chatroom UI, take focus from the user, or prevent normal 1:1 discussion. The team should verify pi-intercom's behavior with idle, busy, and stopped sessions.

### G. Consolidate on demand

When the user returns to the parent and requests consolidation, the parent must have workable means to obtain relevant child findings, reports, artifacts, and—where needed—saved session context. It uses its own judgment, instructions, and tools to reconcile the material with the user.

There is **no fixed consolidation format**, compulsory handoff ritual, or automatic consensus algorithm. The system provides reliable access and communication; the parent does the intellectual work.

Consolidation **does not close, delete, reset, or overwrite** the child conversations.

### H. Continue and repeat

The user and parent refine the consolidated work. At any time, the user may reopen an old room, create new rooms, or mix old and new. **Persistence is required; reuse is optional.** Do not force a formal round system or compel the parent to reuse prior rooms.

## 4. V1 functional expectations

The first useful version should support:

1. A dedicated launcher that enters the managed environment and supports `--session <id>`.
2. Creation of ordinary, persistent Pi child sessions with a parent-prepared brief.
3. User review of proposed children, including **optional per-child working-directory selection**.
4. Initial child context gathering, self-introduction, and preliminary findings.
5. A native `/rooms` navigator from any managed room.
6. Live parent–child and peer–peer communication via approved agent behavior.
7. Parent access to relevant work so it can consolidate when asked.
8. Normal Pi functionality inside every room, including custom modals such as pi-bro.
9. Basic session continuity: switch, leave, resume, recover; preserve room identity and avoid duplicate live processes.
10. Native `/resume` compatibility without silently corrupting room membership or replacing the identity of another room.
11. User-approved branching from a child, with a simple UI for related rooms.

These are **user-visible outcomes**, not a prescribed implementation design.

## 5. Product boundaries

### In scope for V1

- Generic Pi sessions using the user's global Pi configuration and applicable local/project configuration.
- Session grouping, creation, navigation, and recovery.
- Parent-prepared initial context and bounded preliminary child startup.
- Live communication among related rooms.
- Reports and artifact pointers suitable for the parent to gather and reconcile.
- Coding and non-coding conversations and work products.

### Not V1 requirements

- Autonomous task delegation or task scheduling.
- Multi-agent chatroom interface.
- A new knowledge base, prescribed evidence schema, decision ledger, or consolidation algorithm.
- A mandatory report or deliverable format.
- Forced reuse, forced closure, or forced numbered rounds.
- Automatic Git worktrees or code merges.
- A replacement for Pi's terminal UI or extension runtime.
- Seamless migration of a *currently running* standalone Pi process into the managed host.

## 6. Agreed technical direction — open to verification

**Proposed product form:** an independent, Pi-dependent open-source project shipped as **one npm package**, containing a `pi-rooms` CLI and Pi extension, with shared small room-management logic. Do not put the core capability inside `pi-consultants`.

**Proposed V1 integration:**

| Component | Intended responsibility |
|---|---|
| Pi | Full native, persistent 1:1 session runtime and UI |
| Dedicated launcher | Enter managed environment; start/resume parent; dependency checks |
| Pi extension | `/rooms`, agent-facing room operations, session lifecycle hooks |
| Herdr | Host and focus live Pi terminals; keep out-of-focus processes running |
| pi-intercom | Candidate for live messages and replies among rooms |
| Small local room record | Relationships between Pi session IDs and current host/communication identities |

**Important:** Herdr is the selected **working direction for V1**, not an excuse to rebuild the terminal host. pi-intercom is the preferred communication candidate, not an immutable requirement. Developers should verify both against the experience above, and recommend the smallest sound change if a documented capability fails in practice.

Do not couple the meaning or identity of a room to a transient Herdr tab or intercom address. Keep normal Pi extension loading and native UI intact.

## 7. Cases the developers should demonstrate

A convincing implementation demonstration should cover:

1. Resume an existing saved Pi conversation using `pi-rooms --session <id>`.
2. Parent proposes three children; user adjusts one child's working directory and approves.
3. Three full Pi sessions appear, each with a relevant brief and an initial local report.
4. User enters each child through `/rooms`, carries on a normal 1:1 discussion, and runs `/bro simplify` in a child.
5. With user permission, a child messages another room while that recipient is out of focus; the message is delivered and handled.
6. User returns to parent and requests a consolidated document or response; parent obtains child material without the user manually copying it.
7. Conversations remain intact; user opens new children without having to reuse the old ones.
8. Exit and resume the managed workspace without losing session relationships; native `/resume` still behaves as Pi users expect.
9. A child can become a parent when authorized; nested rooms remain navigable.
10. A temporarily stopped or disconnected room is shown accurately rather than silently treated as live or lost.

## 8. What the dev team should decide

Please **investigate and propose**, rather than assume the above technology choices are already proven:

- The best launcher/CLI contract and npm installation path.
- How to invoke Herdr, create/focus terminals, attach existing sessions, and handle already-running sessions.
- Which session identifiers Pi exposes, how `--session` and `/resume` behave, and how to avoid wrong-directory resumes or accidental forks.
- How the Pi-native `/rooms` modal should open/focus the correct terminal and handle stopped sessions.
- How to preserve custom Pi modals, input, tools, configuration, and extensions in every child.
- How to integrate live messaging, route replies, and handle busy/disconnected recipients.
- Minimal persisted room associations and recovery behavior.
- Practical treatment of user-selected working directories and applicable project instructions.
- A realistic phased delivery plan, test approach, risks, and effort estimate based on verified APIs and a small technical proof where needed.

Do not introduce new product concepts or extra approval systems merely because they simplify implementation. Surface material product trade-offs for user decision.

## 9. Requested engineering handback

Return a **focused feasibility assessment and implementation proposal**, covering:

1. Recommended high-level architecture and package layout.
2. Proven and unproven assumptions about Pi, Herdr, and pi-intercom.
3. A minimal technical proof of the riskiest integration points, especially `/bro simplify`, focus switching, and exact-session resume.
4. Milestones, effort estimates, dependencies, and known limitations.
5. The **few material choices** that require a product decision before implementation.

Do not begin full implementation until the proposal is reviewed.

## 10. Deferred investigation backlog

These are deliberate future investigations, **not requirements for the initial handoff or V1**:

1. **Defined agent profiles:** Design, feasibility, UX, and effort of using predefined role/tool/instruction profiles instead of generic global-config Pi sessions.
2. **Pi Consultants office integration:** Design, feasibility, UX, and effort of opening rooms from existing consultant offices while preserving their normal HQ configuration, tools, skills, and behavior and avoiding unnecessary integration complexity.

## 11. References

- Pi: https://pi.dev
- Pi Consultants: https://github.com/tranhoangnguyen03/pi-consultants
- Current `pi-consultants` branch skill: https://github.com/tranhoangnguyen03/pi-consultants/blob/main/firm/skills/coordination/parallel-branches/SKILL.md
- pi-intercom: https://github.com/nicobailon/pi-intercom
- pi-bro: https://github.com/tranhoangnguyen03/pi-bro

---

**Success criterion:** The user discusses work with any Pi session, approves opening several focused 1:1 rooms, personally works in them with full Pi features, lets agents communicate when permitted, and returns to a parent session to reconcile the work. Pi manages the sessions, not the user.

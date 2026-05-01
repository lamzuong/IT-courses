# Restaurant Table Booking Manager (inferred — please confirm)

## 1. Overview
**What it is:** A web-based floor-plan and reservations tool for small-to-mid restaurants. Staff drag reservations onto tables, drag tables around a snap-to-grid floor plan, and drag tables together to combine them for large parties. The app shows the live state of the dining room — who's seated, who's waiting, which tables are linked — and persists changes so the host stand and the kitchen see the same picture.

**Who it's for:** Front-of-house staff (host, manager) at independent restaurants and small chains who currently track bookings on paper, a spreadsheet, or a generic calendar tool. Used primarily on a tablet at the host stand and on a manager's laptop in the back office.

**Main goal:** Take a reservation from "booked in the system" to "party seated at the right table" with a few intuitive drags, including handling parties large enough to need joined tables.

**Platform:** Web app, responsive, optimized for tablet (landscape) and desktop. Mobile phone is supported for read-only "see what's happening" use. (inferred — please confirm)

## 2. User roles

| Role name | Scope | Main tasks |
|-----------|-------|------------|
| Host | Single restaurant, current shift | Take reservations, drag reservations onto tables, mark parties as seated/finished, combine tables for large parties |
| Manager | Single restaurant, all shifts and configuration | Edit floor plan, add/remove tables, set capacities, view daily/weekly history, manage staff accounts |
| Owner | One or more restaurants | Everything Manager can do, plus create restaurants, billing, view across-restaurant reports (inferred — please confirm) |
| Read-only viewer | Single restaurant, current state | View live floor plan and reservation list — no edits. For kitchen monitor or front-window display (inferred — please confirm) |

## 3. Main modules

### Floor plan editor
**Purpose:** Lay out the restaurant's tables on a 2D canvas so the booking view matches reality.
**Key features:**
- Drag tables anywhere on the floor with snap-to-grid (default 20px grid)
- Add / remove / rename tables; set capacity (2-top, 4-top, etc.) and shape (round / square / rectangle)
- Multiple zones per restaurant (patio, bar, main room) with tabs or separate canvases (inferred — please confirm)
- Background image upload for tracing real floor plan (inferred — please confirm)
- Save / publish — drafts don't affect live booking view
**Main screens:** Floor plan edit canvas, table properties side panel, zone selector
**Primary role:** Manager

### Live floor plan (booking view)
**Purpose:** The host's main working surface during service — see every table, who's there, and what's coming.
**Key features:**
- Color-coded table state: free / reserved / seated / finishing / overdue
- Drag a reservation card from the sidebar onto a table to seat the party
- Drag two adjacent tables together to combine them into one logical "joined table" for a larger party
- Drag a seated party between tables to relocate them
- Click a table for details (party name, size, time seated, server, notes)
- Time bar across the top showing current shift; auto-scrolls as time passes (inferred — please confirm)
**Main screens:** Floor plan canvas, reservation sidebar, table detail panel
**Primary role:** Host

### Reservations
**Purpose:** Capture and manage upcoming bookings.
**Key features:**
- Sortable list of upcoming reservations in the sidebar (today / next hour / waiting now)
- Create reservation: party name, size, contact, date/time, special requests
- Edit / cancel / mark no-show
- Walk-in flow: create + seat in one step (inferred — please confirm)
- Search by guest name or phone (inferred — please confirm)
**Main screens:** Reservation list (sidebar), create/edit reservation modal, walk-in modal
**Primary role:** Host

### Table combinations
**Purpose:** Handle parties larger than any single table.
**Key features:**
- Drag a table within ~80px of another to enter "connect" mode; drop to combine
- Combined tables show as a single drop target with summed capacity
- Visual link (line / shading) between joined tables on the floor plan
- One drag-apart gesture (or button) to split them again (inferred — please confirm)
- Combinations are per-shift, not permanent — auto-disband at end of service (inferred — please confirm)
**Main screens:** Live floor plan (combinations are an overlay, not a separate screen)
**Primary role:** Host

### Service timeline / shift state
**Purpose:** Track each party's lifecycle and surface tables that need attention.
**Key features:**
- States: reserved → seated → ordered → entrée served → check requested → finished (inferred — please confirm)
- "Overdue" flag if a party is past its expected duration (e.g., 90 min for dinner) (inferred — please confirm)
- "Coming up" flag when a reservation is < 15 min away and its assigned table is still occupied
- Quick state transitions from the table popover
**Main screens:** Live floor plan (state shown via color and badges), table detail panel
**Primary role:** Host

### Daily summary & history
**Purpose:** Let managers review what happened.
**Key features:**
- End-of-shift summary: covers seated, no-shows, average turnaround (inferred — please confirm)
- Per-day reservation log with all state transitions
- Export to CSV (inferred — please confirm)
**Main screens:** Daily view, history list, single-day detail
**Primary role:** Manager

### Staff & restaurant settings
**Purpose:** Manage who can access the app and per-restaurant configuration.
**Key features:**
- Invite staff by email; assign role
- Set service hours, default party duration, time-zone
- (Owner only) Create new restaurants, switch between them
**Main screens:** Settings, staff list, restaurant list
**Primary role:** Manager / Owner

### Authentication & accounts
**Purpose:** Sign-in, password reset, account ownership.
**Key features:**
- Email + password login with "stay signed in" for the host stand tablet (inferred — please confirm)
- Password reset by email
- Magic-link option for occasional staff (inferred — please confirm)
**Main screens:** Sign in, sign up, forgot password
**Primary role:** All

## 4. Data model

| Entity | Scope | Key fields |
|--------|-------|------------|
| Restaurant | Owner | id, name, timezone, service hours, ownerId |
| Zone | Restaurant | id, restaurantId, name, gridSize, backgroundImageUrl |
| Table | Zone | id, zoneId, label, shape, capacity, x, y, rotation |
| TableCombination | Restaurant (per-shift) | id, restaurantId, shiftId, tableIds[], createdAt, dissolvedAt |
| Reservation | Restaurant | id, restaurantId, partyName, partySize, phone, scheduledAt, expectedDurationMin, notes, status |
| Seating | Reservation | id, reservationId, tableIds[], seatedAt, finishedAt, currentState |
| StateTransition | Seating | id, seatingId, fromState, toState, at, byUserId |
| Shift | Restaurant | id, restaurantId, date, startsAt, endsAt |
| User | Global | id, email, name, passwordHash |
| Membership | User × Restaurant | userId, restaurantId, role |

(Inference flag — schema, field names, and per-shift vs. permanent scope of combinations are all inferred — please confirm.)

## 5. Key matrices

### Reservation status × seating state

|              | No seating yet | Currently seated | Finished |
|--------------|----------------|------------------|----------|
| Booked       | reserved       | seated           | finished |
| Walk-in      | n/a            | seated (walk-in) | finished |
| No-show      | no-show        | n/a              | n/a      |
| Cancelled    | cancelled      | n/a              | n/a      |

### Permissions × role

| Action                                  | Host | Manager | Owner | Viewer |
|-----------------------------------------|------|---------|-------|--------|
| View live floor plan                    | ✓    | ✓       | ✓     | ✓      |
| Create / edit reservations              | ✓    | ✓       | ✓     |        |
| Drag-to-seat parties                    | ✓    | ✓       | ✓     |        |
| Combine / split tables                  | ✓    | ✓       | ✓     |        |
| Edit floor plan layout                  |      | ✓       | ✓     |        |
| Add / remove tables                     |      | ✓       | ✓     |        |
| Invite staff                            |      | ✓       | ✓     |        |
| View daily summary / history            |      | ✓       | ✓     |        |
| Create / delete restaurant              |      |         | ✓     |        |
| Billing                                 |      |         | ✓     |        |

## 6. Business rules

- A reservation can only be seated at a table whose effective capacity ≥ party size. (For combined tables, effective capacity = sum minus 1 per join, to account for table junctions.) (inferred — please confirm)
- A table marked **seated** cannot accept a second reservation until the current seating is moved to **finished**.
- Combining tables is allowed only when both tables are currently free. Cannot combine an already-seated table.
- Splitting a combined table is allowed only when no party is currently seated at the combination.
- Dragging a seated party between tables transfers the seating; the source table becomes free, the destination becomes seated. Source must be in the same restaurant. (inferred — please confirm)
- A "Coming up" alert fires for any reservation < 15 minutes away whose preferred table is still occupied.
- A reservation past its expected duration is flagged "Overdue" but not auto-finished — staff must confirm.
- All drag actions (seat / combine / move) are reversible: a single Undo restores the previous state for the last 30 seconds. (inferred — please confirm)
- Time zones: every reservation time is stored in UTC, displayed in the restaurant's local TZ. Daylight savings transitions inside a shift are handled by storing the absolute timestamp. (inferred — please confirm)
- Floor plan edits in "draft" mode never affect live booking view. Only after explicit Publish.
- A user can belong to multiple restaurants (e.g. multi-location servers). Role is per-restaurant via Membership.
- All actions that change state are recorded with userId + timestamp for audit. (inferred — please confirm)

## 7. In scope — Wave 1

1. **Single-restaurant, single-zone floor plan** — Manager can place tables with snap-to-grid, set capacity and shape, save layout.
2. **Reservations sidebar with create / edit / cancel** — covering the next 24 hours.
3. **Drag-to-seat from reservation sidebar onto a table on the live floor plan**, with state transition reserved → seated → finished.
4. **Drag-to-combine adjacent tables** for large parties, with auto-disband at end of shift.
5. **Move a seated party** from one table to another by drag.
6. **Two roles only — Manager and Host** — with the permissions matrix above limited to those two roles.
7. **Mobile / touch / keyboard support** for the live floor plan (drag works on tablet; keyboard pick-and-move for accessibility).
8. **End-of-shift summary**: covers seated, no-shows, average turnaround. Read-only.

## 8. Out of scope (for now)

- Multi-restaurant accounts and Owner role
- Multi-zone floor plan with tabs
- Background image upload for floor plan tracing
- Walk-in flow (Wave 1: create reservation then immediately seat)
- Online booking widget for guests
- SMS / email confirmations and reminders
- Server / section assignments and tip tracking
- POS integration (kitchen tickets, check totals)
- Read-only "Viewer" role (kitchen / lobby screens)
- Cross-restaurant reports and exports
- Offline mode / local-first sync
- Native mobile apps (iOS / Android) — Wave 1 is web only
- Audit log UI (data is captured; viewing it is deferred)
- Magic-link auth (Wave 1: email + password only)

## 9. Open questions & inferences

- [ ] Platform: web-only with tablet-first responsive design — confirm no native iOS/Android needed in Wave 1.
- [ ] **Owner** role and multi-restaurant support — included as a role, deferred to Wave 2; confirm.
- [ ] **Read-only Viewer** role for kitchen / lobby screens — needed in Wave 1?
- [ ] Walk-in flow — separate "create + seat in one step" UX, or use create-then-drag in Wave 1?
- [ ] Guest search by name or phone — needed in Wave 1?
- [ ] Multiple zones per restaurant (patio, bar, main) — Wave 1 or Wave 2?
- [ ] Floor-plan background image upload — needed in Wave 1?
- [ ] Time-bar / shift timeline at the top of the live view — needed?
- [ ] State machine specifics: is `ordered → entrée served → check requested` granularity needed, or is `seated → finished` enough for Wave 1?
- [ ] Default expected dinner duration of 90 minutes — confirm.
- [ ] Combined-table effective capacity formula (sum minus 1 per join) — confirm or replace with explicit per-combination override.
- [ ] Auto-disband table combinations at end of shift — confirm.
- [ ] Move-seated-party between tables — restricted to same restaurant only — confirm.
- [ ] Single 30-second Undo for last drag action — confirm scope.
- [ ] Daylight savings / timezone storage strategy (UTC + local TZ display) — confirm.
- [ ] Audit log: every state change records userId + timestamp — confirm.
- [ ] End-of-shift summary metrics (covers, no-shows, turnaround) — confirm those three; add others?
- [ ] CSV export from history — needed in Wave 1?
- [ ] Auth: email + password with "stay signed in" for shared host-stand tablet — confirm; add device-trust handling?
- [ ] Magic-link sign-in — Wave 2; confirm.
- [ ] How are staff invited — email link only, or pre-assigned PIN? (inferred email-link.)
- [ ] Per-shift vs. permanent table combinations — Wave 1 chose per-shift; confirm.
- [ ] Concurrency: two hosts on different devices acting at once — last-write-wins or real-time sync? Wave 1 assumed real-time sync via WebSocket; confirm.
- [ ] No notes were attached to this prompt — entire PRD was inferred from prior session context (the table-booking project mentioned during course design). If this is the wrong product entirely, please reset.

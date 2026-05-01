'use client';
import {
  DndContext,
  DragOverlay,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  pointerWithin,
  useDraggable,
  useDroppable,
  useSensor,
  useSensors,
  type CollisionDetection,
  type DragEndEvent,
  type DragStartEvent,
  type Modifier,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from 'react';

// ──────────────────────────────────────────────────────────────────────────
// types & seed data
// ──────────────────────────────────────────────────────────────────────────

type Reservation = { id: string; partyName: string; partySize: number; time: string };
type Table = { id: string; label: string; capacity: number; x: number; y: number; seatedId?: string };

const FLOOR_W = 520;
const FLOOR_H = 380;
const GRID = 20;
const COMBINE_RADIUS = 80;

const SEED_RESERVATIONS: Reservation[] = [
  { id: 'r1', partyName: 'Chen, Wei',     partySize: 2, time: '6:30' },
  { id: 'r2', partyName: 'Garcia, Ana',   partySize: 4, time: '7:00' },
  { id: 'r3', partyName: 'Patel, Anika',  partySize: 6, time: '7:30' },
  { id: 'r4', partyName: 'Vuong, Phuoc',  partySize: 3, time: '8:00' },
  { id: 'r5', partyName: 'Okafor, Ada',   partySize: 5, time: '8:30' },
];

const SEED_TABLES: Table[] = [
  { id: 't1', label: 'T1', capacity: 2, x:  40, y:  40 },
  { id: 't2', label: 'T2', capacity: 2, x: 180, y:  40 },
  { id: 't3', label: 'T3', capacity: 4, x: 320, y:  40 },
  { id: 't4', label: 'T4', capacity: 4, x:  40, y: 200 },
  { id: 't5', label: 'T5', capacity: 4, x: 200, y: 200 },
  { id: 't6', label: 'T6', capacity: 6, x: 360, y: 200 },
];

// adjacency map — pairs of table ids that are combined
type Combo = string[]; // a group is a list of table ids

function tableSize(capacity: number) {
  if (capacity <= 2) return { w: 80, h: 60 };
  if (capacity <= 4) return { w: 100, h: 80 };
  return { w: 140, h: 90 };
}

function clamp(n: number, min: number, max: number) {
  return Math.max(min, Math.min(max, n));
}

function centerOf(t: Table) {
  const { w, h } = tableSize(t.capacity);
  return { x: t.x + w / 2, y: t.y + h / 2 };
}

function distance(a: Table, b: Table) {
  const ca = centerOf(a);
  const cb = centerOf(b);
  return Math.hypot(ca.x - cb.x, ca.y - cb.y);
}

function findGroup(groups: Combo[], id: string): Combo | null {
  return groups.find((g) => g.includes(id)) ?? null;
}

// ──────────────────────────────────────────────────────────────────────────
// custom collision: reservations prefer tables; otherwise sortable
// ──────────────────────────────────────────────────────────────────────────

const reservationsPreferTables: CollisionDetection = (args) => {
  const t = args.active.data.current?.type;
  if (t !== 'reservation') return closestCenter(args);

  const tableTargets = args.droppableContainers.filter(
    (c) => c.data.current?.type === 'table',
  );
  const tableHits = pointerWithin({ ...args, droppableContainers: tableTargets });
  if (tableHits.length > 0) return tableHits;

  const sortableTargets = args.droppableContainers.filter(
    (c) => c.data.current?.type !== 'table',
  );
  return closestCenter({ ...args, droppableContainers: sortableTargets });
};

// snap modifier — applied only when the active drag is a table
const snapTablesToGrid: Modifier = ({ transform, active }) => {
  if (active?.data.current?.type !== 'table') return transform;
  return {
    ...transform,
    x: Math.round(transform.x / GRID) * GRID,
    y: Math.round(transform.y / GRID) * GRID,
  };
};

// ──────────────────────────────────────────────────────────────────────────
// reservation card (in sidebar)
// ──────────────────────────────────────────────────────────────────────────

function ReservationCard({ r }: { r: Reservation }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: r.id,
    data: { type: 'reservation' },
  });
  return (
    <li>
      <div
        ref={setNodeRef}
        style={{
          transform: CSS.Translate.toString(transform),
          transition,
          opacity: isDragging ? 0.35 : 1,
          touchAction: 'none',
        }}
        {...attributes}
        {...listeners}
        className="rounded border border-[color:var(--color-border)] bg-white px-3 py-2 cursor-grab active:cursor-grabbing select-none flex items-center gap-2"
      >
        <span className="font-mono text-xs text-[color:var(--color-text-faint)] w-7 text-right">
          {r.time}
        </span>
        <span className="flex-1 min-w-0">
          <span className="block font-serif text-[0.95rem] truncate">{r.partyName}</span>
          <span className="block text-[0.72rem] text-[color:var(--color-text-soft)]">
            party of {r.partySize}
          </span>
        </span>
      </div>
    </li>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// table on the floor (draggable + droppable)
// ──────────────────────────────────────────────────────────────────────────

function TableNode({
  table,
  reservation,
  inGroup,
  groupCapacity,
}: {
  table: Table;
  reservation?: Reservation;
  inGroup: boolean;
  groupCapacity?: number;
}) {
  const drag = useDraggable({ id: `drag-${table.id}`, data: { type: 'table', tableId: table.id } });
  const drop = useDroppable({ id: `drop-${table.id}`, data: { type: 'table', tableId: table.id } });
  const { w, h } = tableSize(table.capacity);

  const setNodeRef = (el: HTMLDivElement | null) => {
    drag.setNodeRef(el);
    drop.setNodeRef(el);
  };

  const occupied = !!reservation;
  const isOver = drop.isOver && !occupied;

  return (
    <div
      ref={setNodeRef}
      style={{
        position: 'absolute',
        left: table.x,
        top: table.y,
        width: w,
        height: h,
        transform: CSS.Translate.toString(drag.transform),
        touchAction: 'none',
        zIndex: drag.isDragging ? 30 : 10,
        cursor: drag.isDragging ? 'grabbing' : 'grab',
      }}
      {...drag.attributes}
      {...drag.listeners}
      className={`rounded-lg border-2 px-2.5 py-2 select-none transition-shadow shadow-sm ${
        occupied
          ? 'bg-[color:var(--color-bg-deep)] border-[color:var(--color-accent)]'
          : isOver
            ? 'bg-white border-[color:var(--color-accent)] shadow-md'
            : drag.isDragging
              ? 'bg-white border-[color:var(--color-accent)] shadow-md'
              : 'bg-white border-[color:var(--color-border)]'
      }`}
    >
      <div className="flex items-center justify-between text-[0.65rem] uppercase tracking-wider text-[color:var(--color-text-faint)]">
        <span>{table.label}</span>
        <span>
          {table.capacity}
          {inGroup && groupCapacity !== undefined ? <> · grp {groupCapacity}</> : null}
        </span>
      </div>
      <div className="mt-1 font-serif text-[0.92rem] leading-tight">
        {reservation ? (
          <span className="block">
            {reservation.partyName.split(',')[0]}
            <span className="block text-[0.7rem] text-[color:var(--color-text-soft)]">
              party of {reservation.partySize}
            </span>
          </span>
        ) : (
          <span className="text-[color:var(--color-text-faint)] italic text-[0.85rem]">free</span>
        )}
      </div>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// group outline — drawn behind connected tables
// ──────────────────────────────────────────────────────────────────────────

function GroupOutline({ tables, onSplit }: { tables: Table[]; onSplit: () => void }) {
  if (tables.length < 2) return null;
  const pad = 10;
  let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
  for (const t of tables) {
    const { w, h } = tableSize(t.capacity);
    minX = Math.min(minX, t.x);
    minY = Math.min(minY, t.y);
    maxX = Math.max(maxX, t.x + w);
    maxY = Math.max(maxY, t.y + h);
  }
  return (
    <div
      style={{
        position: 'absolute',
        left: minX - pad,
        top: minY - pad,
        width: maxX - minX + pad * 2,
        height: maxY - minY + pad * 2,
        pointerEvents: 'none',
        zIndex: 1,
      }}
      className="rounded-xl border-2 border-dashed border-[color:var(--color-accent)]/50 bg-[color:var(--color-accent)]/5"
    >
      <button
        type="button"
        onClick={onSplit}
        style={{ pointerEvents: 'auto' }}
        className="absolute -top-3 right-2 text-[0.62rem] uppercase tracking-wider px-2 py-0.5 rounded bg-white border border-[color:var(--color-accent)] text-[color:var(--color-accent)] hover:bg-[color:var(--color-bg-soft)]"
      >
        split
      </button>
    </div>
  );
}

// ──────────────────────────────────────────────────────────────────────────
// main demo
// ──────────────────────────────────────────────────────────────────────────

export function TableBookingDemo() {
  const [reservations, setReservations] = useState<Reservation[]>(SEED_RESERVATIONS);
  const [tables, setTables] = useState<Record<string, Table>>(() =>
    Object.fromEntries(SEED_TABLES.map((t) => [t.id, { ...t }]))
  );
  const [groups, setGroups] = useState<Combo[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [status, setStatus] = useState<string>('Drag a reservation onto a table — or drag tables together.');

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const tableList = useMemo(() => Object.values(tables), [tables]);

  function onDragStart(e: DragStartEvent) {
    setActiveId(String(e.active.id));
  }

  function onDragEnd(e: DragEndEvent) {
    setActiveId(null);
    const { active, over, delta } = e;
    const activeData = active.data.current;

    // ── reservation drop ─────────────────────────────────────────────────
    if (activeData?.type === 'reservation') {
      if (over?.data.current?.type === 'table') {
        const tableId = over.data.current.tableId as string;
        const resId = String(active.id);
        const r = reservations.find((x) => x.id === resId);
        if (!r) return;
        // capacity check (group-aware)
        const grp = findGroup(groups, tableId);
        const cap = grp
          ? grp.reduce((s, id) => s + (tables[id]?.capacity ?? 0), 0) - (grp.length - 1)
          : tables[tableId].capacity;
        if (r.partySize > cap) {
          setStatus(`${r.partyName.split(',')[0]} (party of ${r.partySize}) is too large for ${tables[tableId].label} (seats ${cap}).`);
          return;
        }
        // unseat any existing on this table or its group
        const targetIds = grp ?? [tableId];
        const wasOccupied = targetIds.some((id) => tables[id].seatedId);
        setTables((cur) => {
          const next = { ...cur };
          for (const id of targetIds) next[id] = { ...next[id], seatedId: undefined };
          next[tableId] = { ...next[tableId], seatedId: resId };
          return next;
        });
        setReservations((cur) => cur.filter((x) => x.id !== resId));
        setStatus(`${wasOccupied ? 'Replaced — ' : ''}seated ${r.partyName.split(',')[0]} at ${tables[tableId].label}.`);
        return;
      }

      // sortable reorder within sidebar
      if (over && over.id !== active.id) {
        setReservations((cur) => {
          const fromIdx = cur.findIndex((x) => x.id === active.id);
          const toIdx = cur.findIndex((x) => x.id === over.id);
          if (fromIdx === -1 || toIdx === -1) return cur;
          return arrayMove(cur, fromIdx, toIdx);
        });
      }
      return;
    }

    // ── table reposition ─────────────────────────────────────────────────
    if (activeData?.type === 'table') {
      const tableId = activeData.tableId as string;
      const t = tables[tableId];
      if (!t) return;
      const { w, h } = tableSize(t.capacity);
      const nx = clamp(t.x + delta.x, 0, FLOOR_W - w);
      const ny = clamp(t.y + delta.y, 0, FLOOR_H - h);

      // if part of a group, move all members together by the same delta
      const grp = findGroup(groups, tableId);
      const ids = grp ?? [tableId];
      const dx = nx - t.x;
      const dy = ny - t.y;
      setTables((cur) => {
        const next = { ...cur };
        for (const id of ids) {
          const cur_t = cur[id];
          const sz = tableSize(cur_t.capacity);
          next[id] = {
            ...cur_t,
            x: clamp(cur_t.x + dx, 0, FLOOR_W - sz.w),
            y: clamp(cur_t.y + dy, 0, FLOOR_H - sz.h),
          };
        }
        return next;
      });

      // proximity-combine if not already grouped, and not currently moving a group
      if (!grp) {
        const movedTable: Table = { ...t, x: nx, y: ny };
        const partner = tableList.find(
          (other) => other.id !== tableId
            && !findGroup(groups, other.id)
            && distance(movedTable, other) < COMBINE_RADIUS,
        );
        if (partner) {
          setGroups((cur) => [...cur, [tableId, partner.id]]);
          setStatus(`Combined ${t.label} + ${partner.label}.`);
          return;
        }
      }
      setStatus(`Moved ${t.label}.`);
    }
  }

  function splitGroup(group: Combo) {
    setGroups((cur) => cur.filter((g) => g !== group));
    setStatus(`Split ${group.map((id) => tables[id].label).join(' + ')}.`);
  }

  function reset() {
    setReservations(SEED_RESERVATIONS);
    setTables(Object.fromEntries(SEED_TABLES.map((t) => [t.id, { ...t }])));
    setGroups([]);
    setStatus('Reset.');
  }

  const seatedReservations = useMemo(() => {
    const map = new Map<string, Reservation>();
    SEED_RESERVATIONS.forEach((r) => map.set(r.id, r));
    return map;
  }, []);

  const activeRes = activeId ? reservations.find((r) => r.id === activeId) : null;

  return (
    <DndContext
      sensors={sensors}
      collisionDetection={reservationsPreferTables}
      modifiers={[snapTablesToGrid]}
      onDragStart={onDragStart}
      onDragEnd={onDragEnd}
      onDragCancel={() => setActiveId(null)}
    >
      <div className="grid md:grid-cols-[220px_1fr] gap-4">
        {/* reservations panel */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)]">
              Reservations
            </p>
            <button type="button" onClick={reset} className="text-[0.66rem] uppercase tracking-wider text-[color:var(--color-text-soft)] hover:text-[color:var(--color-ink)] underline-offset-2 hover:underline">
              reset all
            </button>
          </div>
          <SortableContext
            items={reservations.map((r) => r.id)}
            strategy={verticalListSortingStrategy}
          >
            <ol className="space-y-1.5 min-h-32">
              {reservations.map((r) => <ReservationCard key={r.id} r={r} />)}
              {reservations.length === 0 && (
                <li className="text-xs italic text-[color:var(--color-text-faint)] py-3 text-center">
                  all seated.
                </li>
              )}
            </ol>
          </SortableContext>
        </div>

        {/* floor plan */}
        <div>
          <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)] mb-2">
            Floor plan
          </p>
          <div
            style={{
              width: FLOOR_W,
              height: FLOOR_H,
              maxWidth: '100%',
              backgroundImage: `linear-gradient(to right, color-mix(in oklab, var(--color-rule), transparent 70%) 1px, transparent 1px), linear-gradient(to bottom, color-mix(in oklab, var(--color-rule), transparent 70%) 1px, transparent 1px)`,
              backgroundSize: `${GRID}px ${GRID}px`,
            }}
            className="demo-canvas relative rounded-lg border border-[color:var(--color-border)] overflow-hidden"
          >
            {/* group outlines below tables */}
            {groups.map((grp, i) => (
              <GroupOutline
                key={i}
                tables={grp.map((id) => tables[id])}
                onSplit={() => splitGroup(grp)}
              />
            ))}
            {tableList.map((t) => {
              const grp = findGroup(groups, t.id);
              const groupCap = grp
                ? grp.reduce((s, id) => s + tables[id].capacity, 0) - (grp.length - 1)
                : undefined;
              const seatedRes = t.seatedId
                ? reservations.find((r) => r.id === t.seatedId) ?? seatedReservations.get(t.seatedId)
                : undefined;
              return (
                <TableNode
                  key={t.id}
                  table={t}
                  reservation={seatedRes}
                  inGroup={!!grp}
                  groupCapacity={groupCap}
                />
              );
            })}
          </div>

          <div role="status" aria-live="polite" className="mt-3 font-serif italic text-[0.9rem] text-[color:var(--color-text-soft)] min-h-5">
            {status}
          </div>
        </div>
      </div>

      <DragOverlay>
        {activeRes ? (
          <div className="rounded border-2 border-[color:var(--color-accent)] bg-white px-3 py-2 shadow-lg rotate-1 max-w-60">
            <div className="font-serif">{activeRes.partyName}</div>
            <div className="text-[0.72rem] text-[color:var(--color-text-soft)]">party of {activeRes.partySize} · {activeRes.time}</div>
          </div>
        ) : null}
      </DragOverlay>
    </DndContext>
  );
}

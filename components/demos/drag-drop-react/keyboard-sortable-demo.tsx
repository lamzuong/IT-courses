'use client';
import {
  DndContext,
  KeyboardSensor,
  PointerSensor,
  closestCenter,
  useSensor,
  useSensors,
  type Announcements,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

const SEED = [
  { id: '1', label: 'Reservation: Chen, party of 2' },
  { id: '2', label: 'Reservation: Garcia, party of 4' },
  { id: '3', label: 'Reservation: Patel, party of 6' },
  { id: '4', label: 'Reservation: Vuong, party of 3' },
];

function labelFor(items: { id: string; label: string }[], id: string | number) {
  return items.find((it) => it.id === String(id))?.label ?? String(id);
}

function Item({ id, label, position, total }: { id: string; label: string; position: number; total: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id,
    attributes: { roleDescription: 'sortable reservation' },
  });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: isDragging ? 0.4 : 1,
        touchAction: 'none',
      }}
      {...attributes}
      {...listeners}
      className="rounded border border-[color:var(--color-border)] bg-white px-3 py-2 font-serif text-sm focus-visible:outline focus-visible:outline-2 focus-visible:outline-[color:var(--color-link)] focus-visible:outline-offset-2"
      aria-label={`${label}, position ${position} of ${total}`}
    >
      <span className="font-mono text-xs text-[color:var(--color-text-faint)] mr-2">{String(position).padStart(2, '0')}</span>
      {label}
    </li>
  );
}

export function KeyboardSortableDemo() {
  const [items, setItems] = useState(SEED);
  const [feed, setFeed] = useState<string[]>([]);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const announcements: Announcements = {
    onDragStart({ active }) {
      const m = `Picked up ${labelFor(items, active.id)}.`;
      setFeed((f) => [m, ...f].slice(0, 5));
      return m;
    },
    onDragOver({ active, over }) {
      if (!over) return undefined;
      const idx = items.findIndex((it) => it.id === over.id);
      const m = `${labelFor(items, active.id)} moved to position ${idx + 1} of ${items.length}.`;
      setFeed((f) => [m, ...f].slice(0, 5));
      return m;
    },
    onDragEnd({ active, over }) {
      const m = over
        ? `Dropped ${labelFor(items, active.id)} on ${labelFor(items, over.id)}.`
        : `Dropped ${labelFor(items, active.id)} without a target.`;
      setFeed((f) => [m, ...f].slice(0, 5));
      return m;
    },
    onDragCancel({ active }) {
      const m = `Movement of ${labelFor(items, active.id)} cancelled.`;
      setFeed((f) => [m, ...f].slice(0, 5));
      return m;
    },
  };

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setItems((cur) => {
      const oldIdx = cur.findIndex((it) => it.id === active.id);
      const newIdx = cur.findIndex((it) => it.id === over.id);
      return arrayMove(cur, oldIdx, newIdx);
    });
  }

  return (
    <div className="grid md:grid-cols-2 gap-5">
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={onDragEnd}
        accessibility={{ announcements }}
      >
        <SortableContext items={items.map((it) => it.id)} strategy={verticalListSortingStrategy}>
          <ol className="space-y-1.5">
            {items.map((it, i) => <Item key={it.id} id={it.id} label={it.label} position={i + 1} total={items.length} />)}
          </ol>
        </SortableContext>
      </DndContext>
      <div>
        <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)] mb-2">Announcer (visible for demo)</p>
        <div className="rounded border border-[color:var(--color-border)] bg-white p-3 font-serif text-sm space-y-1.5 min-h-32">
          {feed.length === 0 && <p className="italic text-[color:var(--color-text-faint)]">— no messages yet —</p>}
          {feed.map((m, i) => (
            <p key={i} className={i === 0 ? 'text-[color:var(--color-ink)]' : 'text-[color:var(--color-text-soft)]'}>
              {i === 0 && <span aria-hidden className="text-[color:var(--color-accent)] mr-1">▸</span>}
              {m}
            </p>
          ))}
        </div>
        <p className="text-xs text-[color:var(--color-text-soft)] mt-3 leading-relaxed">
          Tab into the list, press Space, use ↑/↓, Space to drop. Each transition is announced — the panel above is what a screen reader hears.
        </p>
      </div>
    </div>
  );
}

'use client';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
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
  { id: '1', label: 'Buy groceries' },
  { id: '2', label: 'Pick up laundry' },
  { id: '3', label: 'Call mom' },
  { id: '4', label: 'Ship the PR' },
  { id: '5', label: 'Refill coffee' },
];

function Item({ id, label, num }: { id: string; label: string; num: number }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
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
      className={`rounded border bg-white px-3 py-2.5 cursor-grab active:cursor-grabbing select-none flex items-center gap-3 font-serif ${isDragging ? 'border-[color:var(--color-accent)]' : 'border-[color:var(--color-border)]'}`}
    >
      <span className="font-mono text-xs text-[color:var(--color-text-faint)]">{String(num).padStart(2, '0')}</span>
      <span>{label}</span>
      <span className="ml-auto text-[color:var(--color-text-faint)] select-none" aria-hidden>⋮⋮</span>
    </li>
  );
}

export function SortableListDemo() {
  const [items, setItems] = useState(SEED);
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over || active.id === over.id) return;
    setItems((cur) => {
      const oldIndex = cur.findIndex((it) => it.id === active.id);
      const newIndex = cur.findIndex((it) => it.id === over.id);
      return arrayMove(cur, oldIndex, newIndex);
    });
  }

  return (
    <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
      <SortableContext items={items.map((it) => it.id)} strategy={verticalListSortingStrategy}>
        <ol className="space-y-2 max-w-md mx-auto">
          {items.map((it, i) => <Item key={it.id} id={it.id} label={it.label} num={i + 1} />)}
        </ol>
      </SortableContext>
    </DndContext>
  );
}

'use client';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

const SEED = ['Espresso', 'Cortado', 'Macchiato', 'Flat white'];

function Item({ id, hideWhileDragging }: { id: string; hideWhileDragging: boolean }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  return (
    <li
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        transition,
        opacity: hideWhileDragging && isDragging ? 0 : 1,
        touchAction: 'none',
      }}
      {...attributes}
      {...listeners}
      className="rounded border border-[color:var(--color-border)] bg-white px-3 py-2 cursor-grab active:cursor-grabbing font-serif"
    >
      {id}
    </li>
  );
}

export function OverlayToggleDemo() {
  const [items, setItems] = useState(SEED);
  const [active, setActive] = useState<string | null>(null);
  const [withOverlay, setWithOverlay] = useState(true);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function onDragStart(e: DragStartEvent) { setActive(String(e.active.id)); }
  function onDragEnd(e: DragEndEvent) {
    setActive(null);
    const { active: a, over } = e;
    if (!over || a.id === over.id) return;
    setItems((cur) => arrayMove(cur, cur.indexOf(String(a.id)), cur.indexOf(String(over.id))));
  }

  return (
    <div>
      <label className="flex items-center gap-2 mb-3 text-sm cursor-pointer">
        <input type="checkbox" checked={withOverlay} onChange={(e) => setWithOverlay(e.target.checked)} />
        <span className="font-mono text-xs">Render with DragOverlay</span>
      </label>
      <DndContext sensors={sensors} onDragStart={onDragStart} onDragEnd={onDragEnd} onDragCancel={() => setActive(null)}>
        <SortableContext items={items} strategy={verticalListSortingStrategy}>
          <ol className="space-y-2 max-w-md">
            {items.map((id) => <Item key={id} id={id} hideWhileDragging={withOverlay} />)}
          </ol>
        </SortableContext>
        {withOverlay && (
          <DragOverlay>
            {active ? (
              <div className="rounded border border-[color:var(--color-accent)] bg-white px-3 py-2 font-serif shadow-lg rotate-2">
                {active}
              </div>
            ) : null}
          </DragOverlay>
        )}
      </DndContext>
      <p className="mt-3 text-xs text-[color:var(--color-text-soft)] leading-relaxed">
        With overlay on, the dragged ghost rotates and casts a shadow — and isn&rsquo;t constrained by the list&rsquo;s layout. Toggle it off to see the source transformed in place.
      </p>
    </div>
  );
}

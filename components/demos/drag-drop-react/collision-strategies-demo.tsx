'use client';
import {
  DndContext,
  closestCenter,
  closestCorners,
  pointerWithin,
  rectIntersection,
  useDraggable,
  useDroppable,
  type CollisionDetection,
} from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

const STRATEGIES: Record<string, CollisionDetection> = {
  rectIntersection,
  closestCenter,
  closestCorners,
  pointerWithin,
};

function Drag() {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: 'puck' });
  return (
    <button
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        touchAction: 'none',
      }}
      {...attributes}
      {...listeners}
      className={`absolute left-3 top-3 rounded-full w-14 h-14 border-2 bg-white cursor-grab active:cursor-grabbing flex items-center justify-center font-serif text-sm ${isDragging ? 'border-[color:var(--color-accent)]' : 'border-[color:var(--color-border)]'}`}
    >
      drag
    </button>
  );
}

function Zone({ id, label, x, y }: { id: string; label: string; x: number; y: number }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      style={{ left: x, top: y }}
      className={`absolute w-24 h-24 rounded border-2 border-dashed flex items-center justify-center font-serif text-sm transition ${isOver ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)]' : 'border-[color:var(--color-border)]'}`}
    >
      {label}
    </div>
  );
}

export function CollisionStrategiesDemo() {
  const [strat, setStrat] = useState<keyof typeof STRATEGIES>('rectIntersection');
  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-3">
        {Object.keys(STRATEGIES).map((s) => (
          <button
            key={s}
            type="button"
            onClick={() => setStrat(s as keyof typeof STRATEGIES)}
            className={`text-xs uppercase tracking-wider px-3 py-1.5 rounded border font-mono transition ${strat === s ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)] text-[color:var(--color-accent)]' : 'border-[color:var(--color-border)] hover:border-[color:var(--color-text-soft)]'}`}
          >
            {s}
          </button>
        ))}
      </div>
      <DndContext collisionDetection={STRATEGIES[strat]}>
        <div className="demo-canvas relative h-72 rounded border border-[color:var(--color-border)]">
          <Zone id="A" label="Zone A" x={140} y={20} />
          <Zone id="B" label="Zone B" x={250} y={20} />
          <Zone id="C" label="Zone C" x={140} y={140} />
          <Zone id="D" label="Zone D" x={250} y={140} />
          <Drag />
        </div>
      </DndContext>
      <p className="mt-3 text-xs text-[color:var(--color-text-soft)] leading-relaxed">
        Hold the puck so it overlaps two zones at once and switch strategies. Notice which one wins.
      </p>
    </div>
  );
}

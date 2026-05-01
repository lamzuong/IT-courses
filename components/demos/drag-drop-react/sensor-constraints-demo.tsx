'use client';
import { DndContext, PointerSensor, useDraggable, useSensor, useSensors } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useMemo, useState } from 'react';

function Card({ onClick }: { onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: 'c' });
  return (
    <button
      ref={setNodeRef}
      onClick={onClick}
      style={{ transform: CSS.Translate.toString(transform), touchAction: 'none' }}
      {...attributes}
      {...listeners}
      className={`w-full rounded border bg-white px-4 py-3 text-left cursor-grab active:cursor-grabbing font-serif ${isDragging ? 'border-[color:var(--color-accent)] shadow' : 'border-[color:var(--color-border)]'}`}
    >
      <span className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)] block">Card with a click handler</span>
      drag me · or click me
    </button>
  );
}

export function SensorConstraintsDemo() {
  const [distance, setDistance] = useState(5);
  const [clicks, setClicks] = useState(0);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance } }));
  // re-mount DndContext when distance changes so the sensor picks up the new constraint
  const dndKey = useMemo(() => `d-${distance}`, [distance]);

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div>
        <DndContext key={dndKey} sensors={sensors}>
          <Card onClick={() => setClicks((c) => c + 1)} />
        </DndContext>
      </div>
      <div className="space-y-4">
        <label className="block text-sm">
          <span className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)] block mb-1">Activation distance</span>
          <input
            type="range"
            min={0}
            max={40}
            value={distance}
            onChange={(e) => setDistance(Number(e.target.value))}
            className="w-full"
          />
          <span className="font-mono text-sm">{distance}px</span>
        </label>
        <p className="text-sm text-[color:var(--color-text-soft)] leading-relaxed">
          With distance <span className="font-mono">0</span>, every press starts a drag — the click never fires.
          With distance <span className="font-mono">≥ 5</span>, a quick press-and-release counts as a click.
        </p>
        <p className="text-sm font-mono">
          clicks captured: <span className="text-[color:var(--color-accent)] font-semibold">{clicks}</span>
        </p>
      </div>
    </div>
  );
}

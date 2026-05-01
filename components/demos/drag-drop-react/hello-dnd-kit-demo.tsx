'use client';
import { DndContext, useDraggable, useDroppable, type DragEndEvent } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { useState } from 'react';

function Draggable() {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: 'card' });
  return (
    <button
      ref={setNodeRef}
      style={{
        transform: CSS.Translate.toString(transform),
        opacity: isDragging ? 0.4 : 1,
        touchAction: 'none',
      }}
      {...attributes}
      {...listeners}
      className="rounded border border-[color:var(--color-border)] bg-white px-4 py-3 cursor-grab active:cursor-grabbing font-serif"
    >
      drag me
    </button>
  );
}

function Bin({ children, isFull }: { children: React.ReactNode; isFull: boolean }) {
  const { setNodeRef, isOver } = useDroppable({ id: 'bin' });
  return (
    <div
      ref={setNodeRef}
      className={`rounded border-2 border-dashed p-6 min-h-32 flex items-center justify-center font-serif italic transition ${
        isOver ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)]' : 'border-[color:var(--color-border)]'
      } ${isFull ? 'text-[color:var(--color-ink)] not-italic' : 'text-[color:var(--color-text-faint)]'}`}
    >
      {children}
    </div>
  );
}

export function HelloDndKitDemo() {
  const [dropped, setDropped] = useState(false);

  function onDragEnd(e: DragEndEvent) {
    if (e.over?.id === 'bin') setDropped(true);
  }

  return (
    <DndContext onDragEnd={onDragEnd}>
      <div className="grid grid-cols-2 gap-6 items-center">
        <div className="flex justify-center">
          {!dropped && <Draggable />}
          {dropped && <p className="font-serif italic text-[color:var(--color-text-faint)]">— gone —</p>}
        </div>
        <Bin isFull={dropped}>
          {dropped ? 'caught it.' : 'drop here'}
        </Bin>
      </div>
    </DndContext>
  );
}

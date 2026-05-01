'use client';
import {
  DndContext,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragOverEvent,
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

type ColKey = 'todo' | 'doing' | 'done';

type State = Record<ColKey, { id: string; label: string }[]>;

const SEED: State = {
  todo:  [{ id: 'a', label: 'Draft RFC' }, { id: 'b', label: 'Audit imports' }],
  doing: [{ id: 'c', label: 'Migrate flag' }],
  done:  [{ id: 'd', label: 'Ship hotfix' }],
};

function Item({ id, label }: { id: string; label: string }) {
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
      className="rounded border border-[color:var(--color-border)] bg-white px-3 py-2 cursor-grab active:cursor-grabbing font-serif text-sm shadow-sm"
    >
      {label}
    </li>
  );
}

function Column({ id, title, items }: { id: ColKey; title: string; items: State[ColKey] }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <div
      ref={setNodeRef}
      className={`rounded border p-3 transition flex flex-col min-h-40 ${isOver ? 'border-[color:var(--color-accent)] bg-[color:var(--color-bg-soft)]' : 'border-[color:var(--color-border)] bg-[color:var(--color-bg-soft)]/50'}`}
    >
      <p className="text-xs uppercase tracking-wider text-[color:var(--color-text-faint)] mb-2">{title}</p>
      <SortableContext items={items.map((it) => it.id)} strategy={verticalListSortingStrategy}>
        <ul className="space-y-2 flex-1">
          {items.map((it) => <Item key={it.id} id={it.id} label={it.label} />)}
          {items.length === 0 && <li className="text-xs italic text-[color:var(--color-text-faint)]">empty</li>}
        </ul>
      </SortableContext>
    </div>
  );
}

export function TrelloDemo() {
  const [state, setState] = useState<State>(SEED);
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  function findContainer(id: string): ColKey | null {
    if (id === 'todo' || id === 'doing' || id === 'done') return id;
    for (const k of Object.keys(state) as ColKey[]) {
      if (state[k].some((it) => it.id === id)) return k;
    }
    return null;
  }

  function onDragOver(e: DragOverEvent) {
    const { active, over } = e;
    if (!over) return;
    const from = findContainer(active.id as string);
    const to = findContainer(over.id as string);
    if (!from || !to || from === to) return;
    setState((cur) => {
      const fromList = [...cur[from]];
      const toList = [...cur[to]];
      const fromIdx = fromList.findIndex((it) => it.id === active.id);
      const overIdx = toList.findIndex((it) => it.id === over.id);
      const [moved] = fromList.splice(fromIdx, 1);
      toList.splice(overIdx === -1 ? toList.length : overIdx, 0, moved);
      return { ...cur, [from]: fromList, [to]: toList };
    });
  }

  function onDragEnd(e: DragEndEvent) {
    const { active, over } = e;
    if (!over) return;
    const c = findContainer(over.id as string);
    if (!c) return;
    const list = state[c];
    const from = list.findIndex((it) => it.id === active.id);
    const to = list.findIndex((it) => it.id === over.id);
    if (from === -1 || to === -1 || from === to) return;
    setState((cur) => ({ ...cur, [c]: arrayMove(cur[c], from, to) }));
  }

  return (
    <DndContext sensors={sensors} onDragOver={onDragOver} onDragEnd={onDragEnd}>
      <div className="grid grid-cols-3 gap-3">
        <Column id="todo"  title="To do"   items={state.todo} />
        <Column id="doing" title="Doing"   items={state.doing} />
        <Column id="done"  title="Done"    items={state.done} />
      </div>
    </DndContext>
  );
}

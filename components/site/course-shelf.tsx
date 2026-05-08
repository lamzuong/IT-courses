'use client';
import { useMemo, useState } from 'react';
import type { ReactNode } from 'react';

export type Category = 'ai' | 'frontend';

type CardEntry = {
  slug: string;
  category: Category;
  node: ReactNode;
};

type Filter = 'all' | Category;

const FILTERS: { id: Filter; label: string; description: string }[] = [
  { id: 'all', label: 'All courses', description: 'Everything on the shelf.' },
  { id: 'ai', label: 'AI engineering', description: 'LLMs, agents, tooling.' },
  { id: 'frontend', label: 'Frontend craft', description: 'React, DnD, motion, a11y.' },
];

export function CourseShelf({ cards }: { cards: CardEntry[] }) {
  const [active, setActive] = useState<Filter>('all');

  const counts = useMemo<Record<Filter, number>>(
    () => ({
      all: cards.length,
      ai: cards.filter((c) => c.category === 'ai').length,
      frontend: cards.filter((c) => c.category === 'frontend').length,
    }),
    [cards],
  );

  const visible = active === 'all' ? cards : cards.filter((c) => c.category === active);

  return (
    <div className="course-shelf">
      <aside className="course-shelf-filter" aria-label="Filter courses">
        <h3 className="course-shelf-filter-heading">Browse</h3>
        <ul className="course-shelf-filter-list">
          {FILTERS.map((f) => {
            const isActive = active === f.id;
            return (
              <li key={f.id}>
                <button
                  type="button"
                  className={`course-shelf-filter-btn${isActive ? ' is-active' : ''}`}
                  onClick={() => setActive(f.id)}
                  aria-pressed={isActive}
                >
                  <span className="course-shelf-filter-row">
                    <span className="course-shelf-filter-label">{f.label}</span>
                    <span className="course-shelf-filter-count">{counts[f.id]}</span>
                  </span>
                  <span className="course-shelf-filter-desc">{f.description}</span>
                </button>
              </li>
            );
          })}
        </ul>
      </aside>
      <div className="course-shelf-grid">
        {visible.length === 0 ? (
          <p className="course-shelf-empty">No courses match this filter yet.</p>
        ) : (
          visible.map((c) => (
            <div key={c.slug} className="course-shelf-cell">
              {c.node}
            </div>
          ))
        )}
      </div>
    </div>
  );
}

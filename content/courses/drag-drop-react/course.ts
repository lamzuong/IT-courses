import type { Course } from '@/content/courses/types';

export const course: Course = {
  slug: 'drag-drop-react',
  title: 'Drag and Drop in React',
  summary: 'From native HTML5 DnD to @dnd-kit, ending in a real-world restaurant table-booking app.',
  longDescription:
    'A hands-on course that takes you from the browser\'s native drag-and-drop primitives all the way to building production-grade React drag interactions with @dnd-kit. You\'ll build cross-device drag from scratch using Pointer Events, then learn the modern library approach, and put it all together by building a Trello-style restaurant table-booking app.',
  whatYoullLearn: [
    'How the browser\'s HTML5 DnD API works — and why it falls apart on mobile',
    'How to use Pointer Events to build cross-device drag from scratch',
    'How to use @dnd-kit/core, sortable lists, multi-container drag, sensors, modifiers, and custom collision detection',
    'How to make drag interactions accessible with keyboard navigation and screen-reader announcements',
  ],
  whatYoullBuild:
    'A Restaurant Table Booking Manager — drag reservations onto tables, drag tables on a snap-to-grid floor plan, and drag-to-connect tables for large parties. Works on desktop, touch, and keyboard.',
  parts: [
    {
      title: 'Foundations (native, every device)',
      lessons: [
        { slug: '01-intro-and-landscape',     title: 'Intro & DnD landscape',                   summary: 'What drag-and-drop is, the browser\'s native options, and the library ecosystem.' },
        { slug: '02-html5-events',            title: 'HTML5 DnD: events & lifecycle',           summary: 'draggable, dragstart → dragover → drop → dragend, event order, gotchas.' },
        { slug: '03-html5-data-transfer',     title: 'HTML5 DnD: dataTransfer, dropEffect, drag image', summary: 'MIME types, effectAllowed/dropEffect, setDragImage, ghost styling.' },
        { slug: '04-html5-hands-on',          title: 'Hands-on: vanilla HTML5 drag-into-bin',   summary: 'Build a working HTML5 DnD demo with no React.' },
        { slug: '05-html5-limitations',       title: 'Limitations of HTML5 DnD',                summary: 'Why it fails on mobile, accessibility issues, custom UI pain.' },
        { slug: '06-pointer-events',          title: 'Pointer Events API',                      summary: 'Unified mouse/touch/pen, setPointerCapture, scroll prevention.' },
        { slug: '07-cross-device-drag-1',     title: 'Cross-device drag from scratch — part 1', summary: 'Make one element draggable on desktop, touch, and pen.' },
        { slug: '08-cross-device-drag-2',     title: 'Cross-device drag from scratch — part 2', summary: 'Drop zones, hit-testing, edge auto-scroll.' },
        { slug: '09-accessibility-from-scratch', title: 'Accessibility from scratch',           summary: 'Keyboard nav, ARIA live announcements, focus management.' },
      ],
    },
    {
      title: '@dnd-kit (the modern React way)',
      lessons: [
        { slug: '10-library-landscape',       title: 'Library landscape',                       summary: '@dnd-kit vs react-dnd vs deprecated react-beautiful-dnd vs react-grid-layout.' },
        { slug: '11-dnd-kit-first-drag',      title: '@dnd-kit/core first drag',                summary: 'DndContext, useDraggable, useDroppable.' },
        { slug: '12-sensors',                 title: 'Sensors & activation constraints',        summary: 'Pointer/touch/keyboard sensors, distance/delay, debouncing.' },
        { slug: '13-modifiers',               title: 'Modifiers',                               summary: 'restrictToWindowEdges, axis locks, snap-to-grid.' },
        { slug: '14-sortable-lists',          title: 'Sortable lists',                          summary: '@dnd-kit/sortable, SortableContext, arrayMove.' },
        { slug: '15-multi-container',         title: 'Multi-container DnD',                     summary: 'Moving items between lists, onDragOver vs onDragEnd.' },
        { slug: '16-drag-overlay',            title: 'DragOverlay & animations',                summary: 'Separating the rendered drag from the source, drop animations.' },
        { slug: '17-custom-collision',        title: 'Custom collision detection',              summary: 'closestCenter, closestCorners, pointerWithin, writing your own.' },
        { slug: '18-accessibility-dnd-kit',   title: 'Accessibility in @dnd-kit',               summary: 'Keyboard navigation, screen-reader announcements, customizing them.' },
      ],
    },
  ],
  project: { slug: 'project', title: 'Restaurant Table Booking Manager' },
};

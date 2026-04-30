import { describe, it, expect } from 'vitest';
import {
  getAllCourses,
  getCourse,
  getLesson,
  flattenLessons,
} from './courses';

describe('getAllCourses', () => {
  it('returns at least the drag-drop course', () => {
    const courses = getAllCourses();
    expect(courses.some((c) => c.slug === 'drag-drop-react')).toBe(true);
  });
});

describe('getCourse', () => {
  it('returns the course by slug', () => {
    const course = getCourse('drag-drop-react');
    expect(course?.title).toBe('Drag and Drop in React');
  });

  it('returns null for an unknown slug', () => {
    expect(getCourse('nonexistent')).toBeNull();
  });
});

describe('flattenLessons', () => {
  it('returns lessons in part order, preserving array order', () => {
    const course = getCourse('drag-drop-react')!;
    const flat = flattenLessons(course);
    expect(flat).toHaveLength(18);
    expect(flat[0].slug).toBe('01-intro-and-landscape');
    expect(flat[8].slug).toBe('09-accessibility-from-scratch');
    expect(flat[9].slug).toBe('10-library-landscape');
    expect(flat[17].slug).toBe('18-accessibility-dnd-kit');
  });
});

describe('getLesson', () => {
  it('returns lesson + neighbors for a middle lesson', () => {
    const result = getLesson('drag-drop-react', '06-pointer-events');
    expect(result).not.toBeNull();
    expect(result!.lesson.title).toBe('Pointer Events API');
    expect(result!.prev?.slug).toBe('05-html5-limitations');
    expect(result!.next?.slug).toBe('07-cross-device-drag-1');
    expect(result!.index).toBe(5); // zero-based
    expect(result!.total).toBe(18);
  });

  it('returns null prev for the first lesson', () => {
    const result = getLesson('drag-drop-react', '01-intro-and-landscape');
    expect(result!.prev).toBeNull();
    expect(result!.next?.slug).toBe('02-html5-events');
  });

  it('returns null next for the last lesson', () => {
    const result = getLesson('drag-drop-react', '18-accessibility-dnd-kit');
    expect(result!.prev?.slug).toBe('17-custom-collision');
    expect(result!.next).toBeNull();
  });

  it('returns null for unknown course or lesson', () => {
    expect(getLesson('nope', '01-intro-and-landscape')).toBeNull();
    expect(getLesson('drag-drop-react', 'nope')).toBeNull();
  });
});

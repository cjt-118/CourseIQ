import { beforeEach, describe, expect, it, vi } from 'vitest';
import {
  getSavedCourseIds,
  isCourseSaved,
  removeCourse,
  saveCourse,
} from './savedCoursesService';

// Use an in-memory localStorage mock so tests are isolated and do not touch
// the real browser storage.
const storage = {};
const localStorageMock = {
  getItem: vi.fn(key => storage[key] ?? null),
  setItem: vi.fn((key, value) => { storage[key] = value; }),
  removeItem: vi.fn(key => { delete storage[key]; }),
  clear: vi.fn(() => { Object.keys(storage).forEach(k => delete storage[k]); }),
};
vi.stubGlobal('localStorage', localStorageMock);

beforeEach(() => {
  localStorageMock.clear();
  vi.clearAllMocks();
});

describe('getSavedCourseIds', () => {
  it('returns an empty array when nothing is saved', () => {
    expect(getSavedCourseIds()).toEqual([]);
  });

  it('returns previously saved ids', () => {
    storage['courseiq_saved_courses'] = JSON.stringify([1, 3]);
    expect(getSavedCourseIds()).toEqual([1, 3]);
  });

  it('returns an empty array when storage contains invalid JSON', () => {
    storage['courseiq_saved_courses'] = 'not-json{{';
    expect(getSavedCourseIds()).toEqual([]);
  });
});

describe('saveCourse', () => {
  it('adds a course id and returns the updated list', () => {
    const result = saveCourse(1);
    expect(result).toEqual([1]);
    expect(getSavedCourseIds()).toEqual([1]);
  });

  it('does not add a duplicate course id', () => {
    saveCourse(2);
    const result = saveCourse(2);
    expect(result).toEqual([2]);
    expect(getSavedCourseIds()).toHaveLength(1);
  });

  it('can save multiple distinct courses', () => {
    saveCourse(1);
    saveCourse(3);
    saveCourse(5);
    expect(getSavedCourseIds()).toEqual([1, 3, 5]);
  });
});

describe('removeCourse', () => {
  it('removes a saved course id', () => {
    saveCourse(1);
    saveCourse(2);
    const result = removeCourse(1);
    expect(result).toEqual([2]);
    expect(getSavedCourseIds()).toEqual([2]);
  });

  it('is a no-op when the course is not saved', () => {
    saveCourse(4);
    const result = removeCourse(99);
    expect(result).toEqual([4]);
  });

  it('results in an empty list when the last course is removed', () => {
    saveCourse(7);
    const result = removeCourse(7);
    expect(result).toEqual([]);
    expect(getSavedCourseIds()).toEqual([]);
  });
});

describe('isCourseSaved', () => {
  it('returns true for a saved course', () => {
    saveCourse(5);
    expect(isCourseSaved(5)).toBe(true);
  });

  it('returns false for an unsaved course', () => {
    expect(isCourseSaved(42)).toBe(false);
  });

  it('returns false after a course is removed', () => {
    saveCourse(3);
    removeCourse(3);
    expect(isCourseSaved(3)).toBe(false);
  });
});

describe('duplicate prevention', () => {
  it('a course saved multiple times appears only once', () => {
    saveCourse(10);
    saveCourse(10);
    saveCourse(10);
    expect(getSavedCourseIds()).toEqual([10]);
  });
});

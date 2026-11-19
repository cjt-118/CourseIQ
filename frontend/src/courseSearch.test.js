import { describe, expect, it } from 'vitest';
import { courses } from './data';
import {
  ALL_DEPARTMENTS,
  EMPTY_FILTERS,
  NOT_ENOUGH_DATA,
  filterCourses,
  formatDifficulty,
  getDepartments,
  hasActiveFilters,
  hasDifficultyData,
} from './courseSearch';

const search = overrides => filterCourses(courses, { ...EMPTY_FILTERS, ...overrides });
const codes = results => results.map(c => c.code);

describe('filterCourses', () => {
  it('returns every course when no filters are active', () => {
    expect(search({})).toHaveLength(999);
  });

  it('filters by department', () => {
    expect(codes(search({ department: 'Computer Science' }))).toEqual(['CS 1501', 'CS 1550', 'CS 0401']);
    expect(codes(search({ department: 'Economics' }))).toEqual(['ECON 0100']);
  });

  it('filters by professor (partial match)', () => {
    expect(codes(search({ professor: 'Smith' }))).toEqual(['CS 1501']);
    expect(codes(search({ professor: 'Dr. Patel' }))).toEqual(['ECON 0100']);
  });

  it('filters by course code (partial match, spaces optional)', () => {
    expect(codes(search({ code: 'CS 1501' }))).toEqual(['CS 1501']);
    expect(codes(search({ code: 'cs1501' }))).toEqual(['CS 1501']);
    expect(codes(search({ code: 'MATH' }))).toEqual(['MATH 0220']);
  });

  it('combines filters with AND logic', () => {
    expect(codes(search({ department: 'Computer Science', professor: 'johnson' }))).toEqual(['CS 1550']);
    expect(codes(search({ department: 'Computer Science', code: '0401', professor: 'Lee' }))).toEqual(['CS 0401']);
    // Each filter matches something on its own, but no course matches both.
    expect(search({ department: 'Economics', professor: 'Smith' })).toEqual([]);
    expect(search({ code: 'CS 1501', professor: 'Patel' })).toEqual([]);
  });

  it('matches professor and course code case-insensitively', () => {
    expect(codes(search({ professor: 'SMITH' }))).toEqual(['CS 1501']);
    expect(codes(search({ professor: 'dr. smith' }))).toEqual(['CS 1501']);
    expect(codes(search({ code: 'econ 0100' }))).toEqual(['ECON 0100']);
  });

  it('ignores leading, trailing, and repeated whitespace', () => {
    expect(codes(search({ professor: '   Smith  ' }))).toEqual(['CS 1501']);
    expect(codes(search({ professor: 'Dr.    Smith' }))).toEqual(['CS 1501']);
    expect(codes(search({ code: '  CS 1501 ' }))).toEqual(['CS 1501']);
    expect(search({ professor: '   ', code: '  ' })).toHaveLength(courses.length);
  });

  it('returns an empty list when nothing matches', () => {
    expect(search({ code: 'xyz-not-a-course' })).toEqual([]);
    expect(search({ professor: 'Nobody' })).toEqual([]);
    expect(filterCourses([], EMPTY_FILTERS)).toEqual([]);
  });

  it('does not mutate the input array', () => {
    const copy = [...courses];
    search({ department: 'Economics' });
    expect(courses).toEqual(copy);
  });
});

describe('difficulty display', () => {
  it('shows "Not enough data" for a course without reviews', () => {
    const psy = courses.find(c => c.code === 'PSY 0010');
    expect(hasDifficultyData(psy)).toBe(false);
    expect(formatDifficulty(psy)).toBe(NOT_ENOUGH_DATA);
    expect(NOT_ENOUGH_DATA).toBe('Not enough data');
  });

  it('shows "Not enough data" for missing, empty, or zero-review difficulty values', () => {
    expect(formatDifficulty({ difficulty: undefined, reviews: 5 })).toBe(NOT_ENOUGH_DATA);
    expect(formatDifficulty({ difficulty: '', reviews: 5 })).toBe(NOT_ENOUGH_DATA);
    expect(formatDifficulty({ difficulty: 3.2, reviews: 0 })).toBe(NOT_ENOUGH_DATA);
  });

  it('formats the average difficulty to one decimal place', () => {
    const cs1501 = courses.find(c => c.code === 'CS 1501');
    expect(formatDifficulty(cs1501)).toBe('4.2 / 5');
    expect(formatDifficulty({ difficulty: '3', reviews: 2 })).toBe('3.0 / 5');
  });
});

describe('helpers', () => {
  it('lists each department once, sorted, after "All departments"', () => {
    expect(getDepartments(courses)).toEqual([
      ALL_DEPARTMENTS, 'Computer Science', 'Economics', 'Mathematics', 'Psychology',
    ]);
  });

  it('detects whether any filter is active', () => {
    expect(hasActiveFilters(EMPTY_FILTERS)).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, professor: '   ' })).toBe(false);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, code: 'CS' })).toBe(true);
    expect(hasActiveFilters({ ...EMPTY_FILTERS, department: 'Economics' })).toBe(true);
  });
});

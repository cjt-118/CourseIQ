// Pure course-search logic for US5 (FR3). No React or data-source code lives here,
// so these functions can be unit tested directly and later moved behind a backend API.

export const ALL_DEPARTMENTS = 'All departments';
export const NOT_ENOUGH_DATA = 'Not enough data';

// Empty string means "no difficulty limit". A string (not null) is used so it can be
// bound directly to a <select> value, which always yields strings.
export const ANY_DIFFICULTY = '';
export const DIFFICULTY_LEVELS = Object.freeze([1, 2, 3, 4, 5]);

export const EMPTY_FILTERS = Object.freeze({
  department: ALL_DEPARTMENTS,
  professor: '',
  code: '',
  maxDifficulty: ANY_DIFFICULTY,
});

// Lowercase, trim, and collapse repeated inner whitespace ("  Dr.   Smith " -> "dr. smith").
export function normalizeText(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

// Course codes also ignore spaces entirely, so "cs1501" matches "CS 1501".
function normalizeCode(value) {
  return normalizeText(value).replace(/\s/g, '');
}

// Accepts 3, "3", "", null, or undefined. Returns a number, or null when the filter is inactive.
export function parseMaxDifficulty(value) {
  if (value === null || value === undefined || String(value).trim() === '') return null;
  const max = Number(value);
  return Number.isFinite(max) ? max : null;
}

export function hasActiveFilters(filters) {
  return (
    filters.department !== ALL_DEPARTMENTS ||
    normalizeText(filters.professor) !== '' ||
    normalizeText(filters.code) !== '' ||
    parseMaxDifficulty(filters.maxDifficulty) !== null
  );
}

// The difficulty value the user actually sees (rounded to one decimal, same as
// formatDifficulty). Comparing against this keeps the filter consistent with the
// display: a course shown as "3.0 / 5" always passes a "3 / 5 or easier" filter.
function displayedDifficulty(course) {
  return Number(Number(course.difficulty).toFixed(1));
}

// True when the course is at or below the max difficulty.
// Courses without difficulty data are excluded while the filter is active,
// since we can't confirm they meet the limit.
export function matchesMaxDifficulty(course, maxDifficulty) {
  const max = parseMaxDifficulty(maxDifficulty);
  if (max === null) return true;
  if (!hasDifficultyData(course)) return false;
  return displayedDifficulty(course) <= max;
}

// Returns the courses that satisfy EVERY active filter (AND logic).
// An empty text field, "All departments", or ANY_DIFFICULTY means that filter is inactive.
export function filterCourses(courses, filters = EMPTY_FILTERS) {
  const department = filters.department ?? ALL_DEPARTMENTS;
  const professor = normalizeText(filters.professor);
  const code = normalizeCode(filters.code);
  const maxDifficulty = parseMaxDifficulty(filters.maxDifficulty);

  return courses.filter(course => {
    const matchesDepartment = department === ALL_DEPARTMENTS || course.department === department;
    const matchesProfessor = professor === '' || normalizeText(course.professor).includes(professor);
    const matchesCode = code === '' || normalizeCode(course.code).includes(code);
    const matchesDifficulty = matchesMaxDifficulty(course, maxDifficulty);
    return matchesDepartment && matchesProfessor && matchesCode && matchesDifficulty;
  });
}

// Department dropdown options: "All departments" followed by each department once, sorted.
export function getDepartments(courses) {
  const unique = [...new Set(courses.map(c => c.department).filter(Boolean))].sort();
  return [ALL_DEPARTMENTS, ...unique];
}

// Difficulty dropdown options: "Any difficulty" followed by "1 / 5 or easier" ... "5 / 5 or easier".
export function getDifficultyOptions() {
  return [
    { value: ANY_DIFFICULTY, label: 'Any difficulty' },
    ...DIFFICULTY_LEVELS.map(level => ({ value: String(level), label: `${level} / 5 or easier` })),
  ];
}

// True when a course has a usable average difficulty from at least one review.
export function hasDifficultyData(course) {
  const difficulty = course.difficulty;
  if (difficulty === null || difficulty === undefined || difficulty === '') return false;
  if (!Number.isFinite(Number(difficulty))) return false;
  return !(typeof course.reviews === 'number' && course.reviews <= 0);
}

// Text shown for a course's average difficulty in search results.
export function formatDifficulty(course) {
  return hasDifficultyData(course) ? `${Number(course.difficulty).toFixed(1)} / 5` : NOT_ENOUGH_DATA;
}
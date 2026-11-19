// Pure course-search logic for US5 (FR3). No React or data-source code lives here,
// so these functions can be unit tested directly and later moved behind a backend API.

export const ALL_DEPARTMENTS = 'All departments';
export const NOT_ENOUGH_DATA = 'Not enough data';

export const EMPTY_FILTERS = Object.freeze({
  department: ALL_DEPARTMENTS,
  professor: '',
  code: '',
});

// Lowercase, trim, and collapse repeated inner whitespace ("  Dr.   Smith " -> "dr. smith").
export function normalizeText(value) {
  return String(value ?? '').trim().replace(/\s+/g, ' ').toLowerCase();
}

// Course codes also ignore spaces entirely, so "cs1501" matches "CS 1501".
function normalizeCode(value) {
  return normalizeText(value).replace(/\s/g, '');
}

export function hasActiveFilters(filters) {
  return (
    filters.department !== ALL_DEPARTMENTS ||
    normalizeText(filters.professor) !== '' ||
    normalizeText(filters.code) !== ''
  );
}

// Returns the courses that satisfy EVERY active filter (AND logic).
// An empty text field or "All departments" means that filter is inactive.
export function filterCourses(courses, filters = EMPTY_FILTERS) {
  const department = filters.department ?? ALL_DEPARTMENTS;
  const professor = normalizeText(filters.professor);
  const code = normalizeCode(filters.code);

  return courses.filter(course => {
    const matchesDepartment = department === ALL_DEPARTMENTS || course.department === department;
    const matchesProfessor = professor === '' || normalizeText(course.professor).includes(professor);
    const matchesCode = code === '' || normalizeCode(course.code).includes(code);
    return matchesDepartment && matchesProfessor && matchesCode;
  });
}

// Department dropdown options: "All departments" followed by each department once, sorted.
export function getDepartments(courses) {
  const unique = [...new Set(courses.map(c => c.department).filter(Boolean))].sort();
  return [ALL_DEPARTMENTS, ...unique];
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

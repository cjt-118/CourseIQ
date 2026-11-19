// Temporary localStorage implementation of saved-course persistence.
// When authentication is added (US1), replace this with Supabase calls
// scoped to the authenticated user, using the saved_courses table.
const STORAGE_KEY = 'courseiq_saved_courses';

export function getSavedCourseIds() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCourse(courseId) {
  const ids = getSavedCourseIds();
  if (ids.includes(courseId)) return ids;
  const updated = [...ids, courseId];
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function removeCourse(courseId) {
  const ids = getSavedCourseIds();
  const updated = ids.filter(id => id !== courseId);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
  return updated;
}

export function isCourseSaved(courseId) {
  return getSavedCourseIds().includes(courseId);
}

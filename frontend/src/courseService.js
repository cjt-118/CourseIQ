// Data access for the course catalog. App.jsx only calls fetchCourses(), so swapping
// this for a backend API call in a later sprint does not require UI changes.
import { supabase } from './supabaseClient';
import { courses as mockCourses } from './data';

// Resolves to { courses, source } where source is 'database' or 'sample'.
// Throws if the database is configured but the query fails.
export async function fetchCourses() {
  if (!supabase) {
    return { courses: mockCourses, source: 'sample' };
  }
  const { data, error } = await supabase.from('courses').select('*').order('code');
  if (error) throw new Error(error.message);
  return { courses: data ?? [], source: 'database' };
}

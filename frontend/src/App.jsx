import React, { useEffect, useMemo, useState } from 'react';
import { fetchCourses } from './courseService';
import {
  EMPTY_FILTERS,
  filterCourses,
  formatDifficulty,
  getDepartments,
  hasActiveFilters,
  hasDifficultyData,
} from './courseSearch';
import './styles.css';
import CourseDetailsModal from './components/CourseDetailsModal';

export default function App() {
  const [courses, setCourses] = useState([]);
  const [source, setSource] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState(EMPTY_FILTERS);
  const [selected, setSelected] = useState(null);

  useEffect(() => {
    let ignore = false;
    fetchCourses()
      .then(result => {
        if (ignore) return;
        setCourses(result.courses);
        setSource(result.source);
      })
      .catch(err => { if (!ignore) setError(err.message) })
      .finally(() => { if (!ignore) setLoading(false) });
    return () => { ignore = true };
  }, []);

  const departments = useMemo(() => getDepartments(courses), [courses]);
  const filtered = useMemo(() => filterCourses(courses, filters), [courses, filters]);

  const updateFilter = name => e => setFilters(prev => ({ ...prev, [name]: e.target.value }));
  const clearFilters = () => setFilters(EMPTY_FILTERS);
  const reset = () => { clearFilters(); setSelected(null) };

  return <>
    <header className="topbar"><div className="container nav"><button className="brand" onClick={reset} aria-label="CourseIQ home"><span className="brand-icon">▣</span> CourseIQ</button><span className="nav-label">Course Discovery · Sprint 5</span></div></header>
    <section className="hero"><div className="container hero-inner"><span className="eyebrow">MAKE INFORMED COURSE DECISIONS</span><h1>Find your next course.</h1><p>Explore courses, compare workload and difficulty, and discover what to expect before enrollment.</p></div></section>
    <main className="container main">
      <form className="filters" role="search" aria-label="Search courses" onSubmit={e => e.preventDefault()}>
        <label className="field department">
          <span>Department</span>
          <select value={filters.department} onChange={updateFilter('department')}>
            {departments.map(d => <option key={d}>{d}</option>)}
          </select>
        </label>
        <label className="field">
          <span>Professor</span>
          <input type="search" value={filters.professor} onChange={updateFilter('professor')} placeholder="e.g. Smith" />
        </label>
        <label className="field">
          <span>Course code</span>
          <input type="search" value={filters.code} onChange={updateFilter('code')} placeholder="e.g. CS 1501" />
        </label>
        <button type="button" className="clear-button" onClick={clearFilters} disabled={!hasActiveFilters(filters)}>Clear filters</button>
      </form>

      <div className="section-title">
        <div><h2>Explore courses</h2><p aria-live="polite">{loading ? 'Loading courses…' : `${filtered.length} ${filtered.length === 1 ? 'course' : 'courses'} found`}</p></div>
        {source === 'sample' && <span className="demo-tag">Sample data</span>}
      </div>

      {error && <div className="empty" role="alert"><h3>Could not load courses</h3><p>{error}</p></div>}

      {!loading && !error && <>
        <div className="course-grid">{filtered.map(course => <article className="course-card" key={course.id}>
          <div className="card-top"><span className="course-code">{course.code}</span><span className="rating">{hasDifficultyData(course) ? `★ ${formatDifficulty(course)} difficulty` : `Difficulty: ${formatDifficulty(course)}`}</span></div>
          <h3>{course.title}</h3>
          <p className="professor">{course.professor} · {course.department}</p>
          <div className="stats"><div><strong>{course.workload === null ? '—' : `${Number(course.workload).toFixed(1)}h`}</strong><span>Weekly workload</span></div><div><strong>{course.reviews}</strong><span>Student reviews</span></div></div>
          <button className="details-button" onClick={() => setSelected(course)}>View course details <span aria-hidden="true">→</span></button>
        </article>)}</div>
        {filtered.length === 0 && <div className="empty"><h3>No courses found</h3><p>Try another department, professor, or course code.</p><button onClick={clearFilters}>Clear filters</button></div>}
      </>}

      <p className="disclaimer">Demo only: all courses, ratings, workloads, and instructors are illustrative. No real student records or university APIs are used.</p>
    </main>
    {selected && (<CourseDetailsModal course={selected} onClose={() => setSelected(null)}/>)}
  </>;
}

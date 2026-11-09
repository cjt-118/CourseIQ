import React, {useMemo, useState} from 'react';
import {courses} from './data';
import './styles.css';

export default function App(){
  const [query,setQuery]=useState('');
  const [department,setDepartment]=useState('All departments');
  const [selected,setSelected]=useState(null);
  const departments=['All departments',...new Set(courses.map(c=>c.department))];
  const filtered=useMemo(()=>courses.filter(c=>{
    const q=query.trim().toLowerCase();
    return (department==='All departments'||c.department===department) &&
      [c.code,c.title,c.professor].some(value=>value.toLowerCase().includes(q));
  }),[query,department]);
  const reset=()=>{setQuery('');setDepartment('All departments');setSelected(null)};
  return <>
    <header className="topbar"><div className="container nav"><button className="brand" onClick={reset} aria-label="CourseScope home"><span className="brand-icon">▣</span> CourseScope</button><span className="nav-label">Course Discovery · Sprint 4 Demo</span></div></header>
    <section className="hero"><div className="container hero-inner"><span className="eyebrow">MAKE INFORMED COURSE DECISIONS</span><h1>Find your next course.</h1><p>Explore courses, compare workload and difficulty, and discover what to expect before enrollment.</p></div></section>
    <main className="container main"><div className="filters"><label className="field"><span>Search courses</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Course code, title, or professor"/></label><label className="field department"><span>Department</span><select value={department} onChange={e=>setDepartment(e.target.value)}>{departments.map(d=><option key={d}>{d}</option>)}</select></label></div>
      <div className="section-title"><div><h2>Explore courses</h2><p>{filtered.length} {filtered.length===1?'course':'courses'} found</p></div><span className="demo-tag">Sample data</span></div>
      <div className="course-grid">{filtered.map(course=><article className="course-card" key={course.id}><div className="card-top"><span className="course-code">{course.code}</span><span className="rating">{course.difficulty===null?'No rating':`★ ${course.difficulty.toFixed(1)} / 5 difficulty`}</span></div><h3>{course.title}</h3><p className="professor">{course.professor} · {course.department}</p><div className="stats"><div><strong>{course.workload===null?'—':`${course.workload.toFixed(1)}h`}</strong><span>Weekly workload</span></div><div><strong>{course.reviews}</strong><span>Student reviews</span></div></div><button className="details-button" onClick={()=>setSelected(course)}>View course details <span aria-hidden="true">→</span></button></article>)}</div>
      {filtered.length===0&&<div className="empty"><h3>No courses found</h3><p>Try another course code, professor, or department.</p><button onClick={reset}>Clear filters</button></div>}
      <p className="disclaimer">Demo only: all courses, ratings, workloads, and instructors are illustrative. No real student records or university APIs are used.</p>
    </main>
    {selected&&<div className="modal-backdrop" onMouseDown={e=>{if(e.target===e.currentTarget)setSelected(null)}}><section className="modal" role="dialog" aria-modal="true" aria-labelledby="modal-title"><button className="close" onClick={()=>setSelected(null)} aria-label="Close details">×</button><span className="course-code">{selected.code}</span><h2 id="modal-title">{selected.title}</h2><p className="professor">{selected.professor} · {selected.department}</p><p>{selected.description}</p><div className="modal-stats"><div><strong>{selected.difficulty===null?'Not enough data':`${selected.difficulty.toFixed(1)} / 5`}</strong><span>Average difficulty</span></div><div><strong>{selected.workload===null?'Not enough data':`${selected.workload.toFixed(1)} hours`}</strong><span>Weekly workload</span></div><div><strong>{selected.reviews}</strong><span>Reviews</span></div></div><p className="coming-soon">Review submission and authentication are planned for later sprints.</p></section></div>}
  </>;
}

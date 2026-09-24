import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { apiRequest } from '../services/api.js';
import CourseCard from '../components/CourseCard.jsx';
import CourseForm from '../components/CourseForm.jsx';

export default function CoursesPage({ token, onMessage }) {
  const navigate = useNavigate();
  const [courses, setCourses] = useState([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState(undefined);
  const [busy, setBusy] = useState(false);

  async function loadCourses() {
    try {
      const data = await apiRequest('/courses');
      setCourses(Array.isArray(data) ? data : data.courses || []);
    } catch (error) { onMessage(error.message); }
  }

  useEffect(() => {
    let cancelled = false;
    apiRequest('/courses')
      .then(data => {
        if (!cancelled) setCourses(Array.isArray(data) ? data : data.courses || []);
      })
      .catch(error => onMessage(error.message));
    return () => { cancelled = true; };
  }, [onMessage]);

  async function saveCourse(values) {
    if (!token) { setSelected(undefined); onMessage('Sign in as an instructor to manage courses.'); navigate('/login'); return; }
    setBusy(true);
    const courseId = selected?._id || selected?.id;
    try {
      await apiRequest(`/courses${courseId ? `/${courseId}` : ''}`, courseId ? 'PUT' : 'POST', values, token);
      setSelected(undefined);
      onMessage(courseId ? 'Course updated.' : 'Course created.');
      await loadCourses();
    } catch (error) { onMessage(error.message); }
    finally { setBusy(false); }
  }

  async function deleteCourse(id) {
    if (!token) { onMessage('Sign in as an instructor to manage courses.'); navigate('/login'); return; }
    if (!window.confirm('Delete this course?')) return;
    try {
      await apiRequest(`/courses/${id}`, 'DELETE', null, token);
      onMessage('Course deleted.');
      await loadCourses();
    } catch (error) { onMessage(error.message); }
  }

  const filtered = courses.filter(course => `${course.title} ${course.description} ${course.category} ${course.instructor}`.toLowerCase().includes(query.toLowerCase()));
  return <>
    <section className="hero">
      <div><span className="eyebrow">A LITTLE KNOWLEDGE GOES A LONG WAY</span><h1>Make room for<br/><em>what’s next.</em></h1><p>Thoughtful courses for wherever you want to go.</p><button className="primary" onClick={() => document.getElementById('course-library')?.scrollIntoView({ behavior: 'smooth' })}>Explore courses</button></div>
      <div className="hero-art" aria-hidden="true"><div className="hero-book">✳<span>LEARN<br/>SOMETHING<br/>NEW</span></div></div>
    </section>
    <section className="section" id="course-library">
      <div className="section-heading"><div><span className="eyebrow">A PATH THAT’S YOURS</span><h2 className="section-title">Find your next <em>favorite.</em></h2><p className="section-description">Browse the collection and find something worth learning.</p></div><button className="primary" onClick={() => setSelected(null)}>＋ Add course</button></div>
      <div className="toolbar"><input className="search" value={query} onChange={event => setQuery(event.target.value)} placeholder="Search courses"/><span>{filtered.length} courses</span></div>
      {filtered.length ? <div className="course-grid">{filtered.map((course, index) => <CourseCard key={course._id || course.id} course={course} index={index} onEdit={setSelected} onDelete={deleteCourse}/>)}</div>
        : <div className="empty-state"><h3>{courses.length ? 'No matching courses.' : 'No courses yet.'}</h3><p>{courses.length ? 'Try a different search.' : 'Add the first course to get started.'}</p><button className="primary" onClick={() => setSelected(null)}>＋ Add course</button></div>}
    </section>
    {selected !== undefined && <CourseForm course={selected} busy={busy} onCancel={() => setSelected(undefined)} onSave={saveCourse}/>}
  </>;
}

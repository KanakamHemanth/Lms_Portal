import { useEffect, useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { apiRequest } from '../services/api.js';
import CourseForm from '../components/CourseForm.jsx';

export default function CourseDetailPage({ token, user, onMessage }) {
  const { id } = useParams();
  const navigate = useNavigate();
  const [course, setCourse] = useState(null);
  const [loading, setLoading] = useState(true);
  const [enrolled, setEnrolled] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [busy, setBusy] = useState(false);

  const canManage = user && (user.role === 'admin' || user.role === 'instructor');


  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    apiRequest(`/courses/${id}`)
      .then(data => {
        if (!cancelled) setCourse(data);
      })
      .catch(err => {
        if (!cancelled) {
          onMessage(err.message || 'Course not found');
          navigate('/courses');
        }
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [id, navigate, onMessage]);

  async function handleSave(values) {
    if (!token) {
      onMessage('Please sign in as instructor to update courses.');
      navigate('/login');
      return;
    }

    setBusy(true);
    try {
      const result = await apiRequest(`/courses/${id}`, 'PUT', values, token);
      setCourse(result.course || { ...course, ...values });
      setIsEditing(false);
      onMessage('Course updated successfully!');
    } catch (err) {
      onMessage(err.message);
    } finally {
      setBusy(false);
    }
  }

  async function handleDelete() {
    if (!token) {
      onMessage('Please sign in as instructor to delete courses.');
      navigate('/login');
      return;
    }

    if (!window.confirm('Are you sure you want to delete this course?')) return;

    try {
      await apiRequest(`/courses/${id}`, 'DELETE', null, token);
      onMessage('Course deleted successfully.');
      navigate('/courses');
    } catch (err) {
      onMessage(err.message);
    }
  }

  function handleEnroll() {
    setEnrolled(true);
    onMessage(`You have enrolled in "${course.title}"! Happy learning!`);
  }

  if (loading) {
    return (
      <div className="course-detail-loading">
        <p>Loading course details...</p>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="empty-state">
        <h3>Course not found</h3>
        <p>The requested course does not exist or has been removed.</p>
        <Link to="/courses" className="primary link-button">
          Browse Courses
        </Link>
      </div>
    );
  }

  const instructorName =
    typeof course.instructor === 'object'
      ? course.instructor?.name || 'Lead Instructor'
      : course.instructor || 'Lead Instructor';

  const instructorEmail =
    typeof course.instructor === 'object' ? course.instructor?.email : null;

  return (
    <article className="course-detail-page">
      <nav className="detail-breadcrumb">
        <Link to="/courses" className="back-link">
          ← Back to all courses
        </Link>
      </nav>

      <header className="detail-hero">
        <div className="detail-hero-content">
          <div className="detail-badges">
            <span className="badge category-badge">{course.category || 'Course'}</span>
            <span className="badge level-badge">{course.level || 'All Levels'}</span>
            <span className="badge duration-badge">{course.duration} Hours</span>
          </div>

          <h1 className="detail-title">{course.title}</h1>
          <p className="detail-description">{course.description}</p>

          <div className="detail-instructor-strip">
            <div className="instructor-avatar">
              {instructorName.charAt(0).toUpperCase()}
            </div>
            <div>
              <span className="instructor-label">Instructor</span>
              <strong className="instructor-name">{instructorName}</strong>
              {instructorEmail && (
                <span className="instructor-email">({instructorEmail})</span>
              )}
            </div>
          </div>
        </div>

        <aside className="detail-sidebar-card">
          <div className="sidebar-price">
            {Number(course.price) === 0 ? 'Free' : `$${course.price}`}
          </div>
          <p className="sidebar-guarantee">Full lifetime access & verified certificate</p>

          <button
            className={`primary enroll-button ${enrolled ? 'enrolled' : ''}`}
            onClick={handleEnroll}
            disabled={enrolled}
          >
            {enrolled ? '✓ Enrolled' : Number(course.price) === 0 ? 'Enroll for Free' : 'Enroll Now'}
          </button>

          <div className="sidebar-meta-list">
            <div>
              <span>Level:</span>
              <strong>{course.level}</strong>
            </div>
            <div>
              <span>Duration:</span>
              <strong>{course.duration} hours</strong>
            </div>
            <div>
              <span>Category:</span>
              <strong>{course.category}</strong>
            </div>
            <div>
              <span>Certificate:</span>
              <strong>Included</strong>
            </div>
          </div>

          {token && canManage && (
            <div className="detail-admin-actions">
              <button
                type="button"
                className="secondary"
                onClick={() => setIsEditing(true)}
              >
                Edit Course
              </button>
              <button
                type="button"
                className="secondary delete-btn"
                onClick={handleDelete}
              >
                Delete
              </button>
            </div>
          )}

        </aside>
      </header>

      <section className="detail-section">
        <h2>What You Will Learn</h2>
        <div className="learn-grid">
          <div className="learn-item">
            <span className="learn-icon">✦</span>
            <div>
              <strong>Complete Mastery</strong>
              <p>Thorough coverage of all core concepts, design principles, and modern workflows.</p>
            </div>
          </div>
          <div className="learn-item">
            <span className="learn-icon">✦</span>
            <div>
              <strong>Real-World Projects</strong>
              <p>Build scalable, production-grade applications that can be showcased on your portfolio.</p>
            </div>
          </div>
          <div className="learn-item">
            <span className="learn-icon">✦</span>
            <div>
              <strong>Best Practices & Patterns</strong>
              <p>Learn clean code architectures, security fundamentals, and performance optimization.</p>
            </div>
          </div>
          <div className="learn-item">
            <span className="learn-icon">✦</span>
            <div>
              <strong>Certificate of Completion</strong>
              <p>Earn an industry-recognized certificate to share on LinkedIn and with employers.</p>
            </div>
          </div>
        </div>
      </section>

      <section className="detail-section">
        <h2>Curriculum & Syllabus</h2>
        <div className="curriculum-list">
          <div className="curriculum-item">
            <div className="curriculum-header">
              <strong>Module 1: Orientation & Foundations</strong>
              <span>3 Lessons · 1.5 hrs</span>
            </div>
            <p>Environment setup, foundational concepts, syntax walkthrough, and core patterns.</p>
          </div>
          <div className="curriculum-item">
            <div className="curriculum-header">
              <strong>Module 2: Core Architecture & Hands-on Implementation</strong>
              <span>6 Lessons · 4.5 hrs</span>
            </div>
            <p>Deep-dive into component models, state flows, API communication, and data validation.</p>
          </div>
          <div className="curriculum-item">
            <div className="curriculum-header">
              <strong>Module 3: Advanced Optimization & Production Readiness</strong>
              <span>5 Lessons · 3.5 hrs</span>
            </div>
            <p>Performance profiling, automated testing, security hardening, and deployment pipelines.</p>
          </div>
        </div>
      </section>

      {isEditing && (
        <CourseForm
          course={course}
          busy={busy}
          onCancel={() => setIsEditing(false)}
          onSave={handleSave}
        />
      )}
    </article>
  );
}

import { useNavigate } from 'react-router-dom';

export default function CourseCard({ course, index, user, onEdit, onDelete }) {
  const navigate = useNavigate();
  const courseId = course._id || course.id;
  const canManage = user && (user.role === 'admin' || user.role === 'instructor');


  const instructorName = typeof course.instructor === 'object'
    ? (course.instructor?.name || 'Course instructor')
    : (course.instructor || 'Course instructor');

  function openCourse(e) {
    if (e.target.closest('button')) return;
    navigate(`/courses/${courseId}`);
  }

  return (
    <article
      className="course-card"
      onClick={openCourse}
      role="button"
      tabIndex={0}
      onKeyDown={e => { if (e.key === 'Enter') openCourse(e); }}
    >
      <div className="course-cover">
        <span>{course.category || 'Course'}</span>
        <strong>{['◒', '✳', '◉', '✦'][index % 4]}</strong>
      </div>
      <div className="course-content">
        <div className="course-meta">
          {course.level || 'All levels'} · {course.duration || '—'} hours
        </div>
        <h3 className="course-title-link">{course.title}</h3>
        <p className="course-description">{course.description}</p>
        <div className="course-bottom">
          <span>{instructorName}</span>
          <strong>{Number(course.price) === 0 ? 'Free' : `$${course.price}`}</strong>
        </div>
        <div className="course-actions">
          <button
            type="button"
            className="action-view"
            onClick={(e) => {
              e.stopPropagation();
              navigate(`/courses/${courseId}`);
            }}
          >
            View Details →
          </button>
          {canManage && (
            <>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(course);
                }}
              >
                Edit
              </button>
              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  onDelete(courseId);
                }}
              >
                Delete
              </button>
            </>
          )}
        </div>

      </div>
    </article>
  );
}

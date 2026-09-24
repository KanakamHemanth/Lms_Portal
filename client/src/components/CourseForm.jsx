import { useState } from 'react';

const emptyCourse = { title: '', description: '', category: '', level: 'Beginner', price: 0, duration: 1 };

export default function CourseForm({ course, busy, onCancel, onSave }) {
  const [form, setForm] = useState({ ...emptyCourse, ...(course || {}) });

  function update(event) {
    setForm({ ...form, [event.target.name]: event.target.value });
  }

  function submit(event) {
    event.preventDefault();
    const courseFields = { ...form };
    delete courseFields.instructor;
    onSave({ ...courseFields, price: Number(form.price), duration: Number(form.duration) });
  }

  return <div className="modal-backdrop" onMouseDown={event => { if (event.target === event.currentTarget) onCancel(); }}>
    <section className="course-form" aria-labelledby="course-form-title">
      <h2 id="course-form-title">{course ? 'Edit course' : 'Add a course'}</h2>
      <form className="form" onSubmit={submit}>
        <label>Title<input name="title" value={form.title} onChange={update} required /></label>
        <label>Description<textarea name="description" rows="3" value={form.description} onChange={update} required /></label>
        <label>Category<input name="category" value={form.category} onChange={update} required /></label>
        <div className="form-row">
          <label>Level<select name="level" value={form.level} onChange={update}><option>Beginner</option><option>Intermediate</option><option>Advanced</option></select></label>
          <label>Duration (hours)<input name="duration" type="number" min="1" value={form.duration} onChange={update} required /></label>
        </div>
        <label>Price (0 for free)<input name="price" type="number" min="0" value={form.price} onChange={update} required /></label>
        <div className="form-actions"><button type="button" className="secondary" onClick={onCancel}>Cancel</button><button className="primary" disabled={busy}>{busy ? 'Saving…' : 'Save course'}</button></div>
      </form>
    </section>
  </div>;
}

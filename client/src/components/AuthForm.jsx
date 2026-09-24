import { useState } from 'react';
import { apiRequest } from '../services/api.js';

export default function AuthForm({ mode, onLogin, onMessage }) {
  const [busy, setBusy] = useState(false);

  async function submit(event) {
    event.preventDefault();
    setBusy(true);
    const formData = Object.fromEntries(new FormData(event.currentTarget));
    try {
      const result = await apiRequest(`/auth/${mode}`, 'POST', formData);
      if (mode === 'login') onLogin(result.token || result.Token);
      else onMessage('Account created. Please log in.');
    } catch (error) {
      onMessage(error.message);
    } finally {
      setBusy(false);
    }
  }

  const registering = mode === 'register';
  return <section className="auth-card">
    <span className="eyebrow">YOUR LEARNING SPACE</span>
    <h1>{registering ? 'Create an account.' : 'Welcome back.'}</h1>
    <p>{registering ? 'Create an account to start learning.' : 'Sign in to continue learning.'}</p>
    <form className="form" onSubmit={submit}>
      {registering && <label>Name<input name="name" placeholder="Your name" required /></label>}
      <label>Email<input name="email" type="email" placeholder="you@example.com" required /></label>
      <label>Password<input name="password" type="password" minLength="6" required /></label>
      {registering && <label>Account type<select name="role" defaultValue="student"><option value="student">Student</option><option value="instructor">Instructor</option></select></label>}
      <button className="primary" disabled={busy}>{busy ? 'Please wait…' : registering ? 'Register' : 'Login'}</button>
    </form>
    {!registering && <small className="token-hint">Login token is saved in localStorage.</small>}
  </section>;
}

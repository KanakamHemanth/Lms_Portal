import { useState } from 'react';
import { BrowserRouter, Navigate, Route, Routes, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import HomePage from './pages/HomePage.jsx';
import CoursesPage from './pages/CoursesPage.jsx';
import CourseDetailPage from './pages/CourseDetailPage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import RegisterPage from './pages/RegisterPage.jsx';
import './App.css';
import './routing.css';

function AppLayout() {
  const [token, setToken] = useState(() => localStorage.getItem('lms_token') || '');
  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem('lms_user') || 'null'); }
    catch { return null; }
  });
  const [message, setMessage] = useState('');
  const navigate = useNavigate();

  function login(newToken, userData) {
    localStorage.setItem('lms_token', newToken);
    if (userData) {
      localStorage.setItem('lms_user', JSON.stringify(userData));
      setUser(userData);
    }
    setToken(newToken);
  }

  function logout() {
    localStorage.removeItem('lms_token');
    localStorage.removeItem('lms_user');
    setToken('');
    setUser(null);
    setMessage('You are signed out.');
    navigate('/');
  }

  return <>
    <Navbar token={token} user={user} onLogout={logout} />

    <main className="container">
      {message && <div className="message" role="status">{message}<button onClick={() => setMessage('')}>×</button></div>}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/courses" element={<CoursesPage token={token} user={user} onMessage={setMessage} />} />
        <Route path="/courses/:id" element={<CourseDetailPage token={token} user={user} onMessage={setMessage} />} />

        <Route path="/login" element={<LoginPage onLogin={login} onMessage={setMessage} />} />
        <Route path="/register" element={<RegisterPage onMessage={setMessage} />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </main>
    <footer className="footer">CourseCraft · Keep learning, one course at a time.</footer>
  </>;
}

export default function App() {
  return <BrowserRouter><AppLayout /></BrowserRouter>;
}

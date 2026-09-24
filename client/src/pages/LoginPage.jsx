import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm.jsx';

export default function LoginPage({ onLogin, onMessage }) {
  const navigate = useNavigate();
  function login(token) {
    onLogin(token);
    onMessage('You are signed in.');
    navigate('/courses');
  }

  return <><AuthForm mode="login" onLogin={login} onMessage={onMessage} /><p className="page-link">New to Learnly? <Link to="/register">Create an account</Link></p></>;
}

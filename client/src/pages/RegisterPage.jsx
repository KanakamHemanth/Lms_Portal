import { Link, useNavigate } from 'react-router-dom';
import AuthForm from '../components/AuthForm.jsx';

export default function RegisterPage({ onMessage }) {
  const navigate = useNavigate();
  function registered() {
    onMessage('Account created. Please log in.');
    navigate('/login');
  }

  return <><AuthForm mode="register" onMessage={registered} /><p className="page-link">Already have an account? <Link to="/login">Login</Link></p></>;
}

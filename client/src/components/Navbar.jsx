import { Link, NavLink } from 'react-router-dom';

export default function Navbar({ token, onLogout }) {
  return <header className="navbar">
    <Link className="brand" to="/">Course<span>Craft</span></Link>
    <nav className="nav-links" aria-label="Main navigation">
      <NavLink to="/">Home</NavLink>
      <NavLink to="/courses">Courses</NavLink>
      {token
        ? <button className="nav-primary" onClick={onLogout}>Sign out</button>
        : <><NavLink to="/login">Login</NavLink><NavLink className="nav-primary" to="/register">Register</NavLink></>}
    </nav>
  </header>;
}

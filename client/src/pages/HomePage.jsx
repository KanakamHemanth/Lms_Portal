import { Link } from 'react-router-dom';

export default function HomePage() {
  return <>
    <section className="hero">
      <div><span className="eyebrow">A LITTLE KNOWLEDGE GOES A LONG WAY</span><h1>Make room for<br/><em>what’s next.</em></h1><p>Thoughtful courses for wherever you want to go.</p><Link className="primary link-button" to="/courses">Explore courses</Link></div>
      <div className="hero-art" aria-hidden="true"><div className="hero-book">✳<span>LEARN<br/>SOMETHING<br/>NEW</span></div></div>
    </section>
    <section className="home-links"><h2>Start learning today</h2><p>Browse courses or create an account to get started.</p><Link className="primary link-button" to="/register">Create an account</Link></section>
  </>;
}

import { Link } from 'react-router-dom';

function About() {
  return (
    <div>
      <div className="card" style={{ padding: '16px' }}>
        <h1>About SmartSamadhan</h1>
        <p>
          SmartSamadhan is an innovative platform that connects citizens with local governments to resolve civic issues efficiently.
          Our mission is to make reporting and tracking of public problems seamless and transparent.
        </p>
        <p>
          Features include real-time reporting, multimedia support, automated routing, and comprehensive dashboards for both users and administrators.
        </p>
        <Link to="/">Back to Home</Link>
      </div>
    </div>
  );
}

export default About;

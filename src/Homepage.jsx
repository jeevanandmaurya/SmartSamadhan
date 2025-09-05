import { Link } from 'react-router-dom';
import { useState } from 'react';

function Homepage() {
  const [currentSlide, setCurrentSlide] = useState(0);
  const slides = [
    { color: 'red', text: 'Report Civic Issues Easily' },
    { color: 'green', text: 'Track Your Reports in Real-Time' },
    { color: 'blue', text: 'Help Improve Your Community' }
  ];

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length);
  };

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length);
  };

  return (
    <div>
      {/* Main Content */}
      <div style={{ padding: '10px', textAlign: 'center', width: '100%' }}>
        {/* Image Slider */}
        <div style={{ position: 'relative', width: '100%', height: '300px', overflow: 'hidden', marginBottom: '16px', borderRadius: '12px' }}>
          {slides.map((slide, index) => (
            <div
              key={index}
              style={{
                position: 'absolute',
                top: 0,
                left: `${(index - currentSlide) * 100}%`,
                width: '100%',
                height: '100%',
                backgroundColor: slide.color,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
                fontSize: '24px',
                transition: 'left 0.5s ease-in-out'
              }}
            >
              {slide.text}
            </div>
          ))}
          {/* Left Button */}
          <button
            onClick={prevSlide}
            style={{
              position: 'absolute',
              top: '50%',
              left: '10px',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(17,24,39,0.5)',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            &#10094;
          </button>
          {/* Right Button */}
          <button
            onClick={nextSlide}
            style={{
              position: 'absolute',
              top: '50%',
              right: '10px',
              transform: 'translateY(-50%)',
              backgroundColor: 'rgba(17,24,39,0.5)',
              color: 'white',
              border: 'none',
              padding: '8px 12px',
              cursor: 'pointer',
              fontSize: '18px'
            }}
          >
            &#10095;
          </button>
        </div>

        {/* Purpose Description */}
  <div className="card" style={{ marginBottom: '20px', textAlign: 'left' }}>
          <h2>About SmartSamadhan</h2>
          <p>
            SmartSamadhan is a platform designed to empower citizens to report civic issues like potholes, broken streetlights, and overflowing trash bins.
            Our goal is to bridge the gap between community members and local governments, ensuring prompt identification, prioritization, and resolution of everyday problems.
            With a mobile-first approach, real-time reporting, and an interactive dashboard, we aim to drive better civic engagement and government accountability.
          </p>
        </div>

        {/* Buttons */}
        <div style={{ display: 'flex', justifyContent: 'center', gap: '20px', flexWrap: 'wrap' }}>
          <Link to="/login">
            <button style={{
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: '2px solid var(--primary)',
              borderRadius: '10px',
              backgroundColor: 'var(--primary)',
              color: '#fff',
              cursor: 'pointer',
              transition: 'background-color 0.3s, color 0.3s'
            }}>Login</button>
          </Link>
          <Link to="/view-status">
            <button style={{
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: '2px solid var(--primary)',
              borderRadius: '10px',
              backgroundColor: 'var(--bg)',
              color: 'var(--primary)',
              cursor: 'pointer',
              transition: 'background-color 0.3s, color 0.3s'
            }}>View Status</button>
          </Link>
          <Link to="/contact-us">
            <button style={{
              padding: '15px 30px',
              fontSize: '18px',
              fontWeight: 'bold',
              border: '2px solid var(--primary)',
              borderRadius: '10px',
              backgroundColor: 'var(--bg)',
              color: 'var(--primary)',
              cursor: 'pointer',
              transition: 'background-color 0.3s, color 0.3s'
            }}>Contact Us</button>
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Homepage;

// LoadingScreen.jsx — Full-screen animated loading splash
import React, { useEffect, useState } from 'react';

const icons = [
  { emoji: '🎤', label: 'Microphone' },
  { emoji: '🎬', label: 'Movie Camera' },
  { emoji: '🎵', label: 'Music' },
  { emoji: '🎟️', label: 'Ticket' },
  { emoji: '🎉', label: 'Party Popper' },
  { emoji: '🎭', label: 'Theatre Masks' },
];

export default function LoadingScreen({ onComplete }) {
  const [visibleIcons, setVisibleIcons] = useState(0);
  const title = 'Event Sphere';

  useEffect(() => {
    // Show icons one by one
    const iconInterval = setInterval(() => {
      setVisibleIcons((prev) => {
        if (prev < icons.length) return prev + 1;
        clearInterval(iconInterval);
        return prev;
      });
    }, 400);

    // Redirect after 5 seconds
    const timer = setTimeout(() => {
      if (onComplete) onComplete();
    }, 5000);

    return () => {
      clearInterval(iconInterval);
      clearTimeout(timer);
    };
  }, [onComplete]);

  return (
    <div className="loading-screen">
      {/* Animated background particles */}
      <div className="loading-particles">
        {[...Array(20)].map((_, i) => (
          <div key={i} className="particle" style={{
            left: `${Math.random() * 100}%`,
            animationDelay: `${Math.random() * 5}s`,
            animationDuration: `${5 + Math.random() * 5}s`,
          }} />
        ))}
      </div>

      {/* Main content */}
      <div className="loading-content">
        {/* Animated title */}
        <h1 className="loading-title">
          {title.split('').map((letter, idx) => (
            <span
              key={idx}
              className="loading-letter"
              style={{ animationDelay: `${idx * 0.1}s` }}
            >
              {letter === ' ' ? '\u00A0' : letter}
            </span>
          ))}
        </h1>

        {/* Animated icons */}
        <div className="loading-icons">
          {icons.map((icon, idx) => (
            <span
              key={idx}
              className={`loading-icon ${idx < visibleIcons ? 'visible' : ''}`}
              style={{ animationDelay: `${idx * 0.2}s` }}
              aria-label={icon.label}
            >
              {icon.emoji}
            </span>
          ))}
        </div>

        {/* Loading indicator */}
        <div className="loading-indicator">
          <div className="loading-bar">
            <div className="loading-bar-progress" />
          </div>
        </div>

        {/* Tagline */}
        <p className="loading-tagline">
          Preparing unforgettable experiences
          <span className="loading-dots">
            <span className="dot">.</span>
            <span className="dot">.</span>
            <span className="dot">.</span>
          </span>
        </p>
      </div>
    </div>
  );
}

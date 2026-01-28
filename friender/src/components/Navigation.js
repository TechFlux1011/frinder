import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './Navigation.css';

const Navigation = () => {
  const location = useLocation();

  const isActive = (path) => location.pathname === path;

  return (
    <nav className="navigation">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          <span className="logo-icon">🤝</span>
          <span className="logo-text">Friender</span>
        </Link>
        <div className="nav-links">
          <Link 
            to="/" 
            className={`nav-link ${isActive('/') ? 'active' : ''}`}
          >
            <span className="nav-icon">🏠</span>
            <span className="nav-text">Home</span>
          </Link>
          <Link 
            to="/swipe" 
            className={`nav-link ${isActive('/swipe') ? 'active' : ''}`}
          >
            <span className="nav-icon">👆</span>
            <span className="nav-text">Discover</span>
          </Link>
          <Link 
            to="/recommendations" 
            className={`nav-link ${isActive('/recommendations') ? 'active' : ''}`}
          >
            <span className="nav-icon">⭐</span>
            <span className="nav-text">For You</span>
          </Link>
          <Link 
            to="/groups" 
            className={`nav-link ${isActive('/groups') ? 'active' : ''}`}
          >
            <span className="nav-icon">👥</span>
            <span className="nav-text">Groups</span>
          </Link>
          <Link 
            to="/matches" 
            className={`nav-link ${isActive('/matches') ? 'active' : ''}`}
          >
            <span className="nav-icon">💚</span>
            <span className="nav-text">Matches</span>
          </Link>
          <Link 
            to="/profile" 
            className={`nav-link ${isActive('/profile') ? 'active' : ''}`}
          >
            <span className="nav-icon">👤</span>
            <span className="nav-text">Profile</span>
          </Link>
        </div>
      </div>
    </nav>
  );
};

export default Navigation;

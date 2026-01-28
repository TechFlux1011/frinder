import React from 'react';
import './SwipeCard.css';

const SwipeCard = ({ user, onSwipe }) => {
  const handleSwipe = (direction) => {
    onSwipe(user.id, direction);
  };

  return (
    <div className="swipe-card">
      <div className="card-header">
        <div className="user-avatar">{user.avatar}</div>
        <div className="user-info">
          <h2 className="user-name">{user.name}, {user.age}</h2>
          <p className="user-location">📍 {user.location}</p>
        </div>
      </div>
      
      <div className="card-bio">
        <p>{user.bio}</p>
      </div>

      <div className="card-interests">
        <h3>Interests</h3>
        <div className="tags">
          {user.interests.map((interest, idx) => (
            <span key={idx} className="tag interest-tag">
              {interest}
            </span>
          ))}
        </div>
      </div>

      <div className="card-values">
        <h3>Values</h3>
        <div className="tags">
          {user.values.map((value, idx) => (
            <span key={idx} className="tag value-tag">
              {value}
            </span>
          ))}
        </div>
      </div>

      <div className="card-actions">
        <button 
          className="action-btn pass-btn"
          onClick={() => handleSwipe('left')}
          aria-label="Pass"
        >
          ✕
        </button>
        <button 
          className="action-btn like-btn"
          onClick={() => handleSwipe('right')}
          aria-label="Like"
        >
          ♥
        </button>
      </div>
    </div>
  );
};

export default SwipeCard;

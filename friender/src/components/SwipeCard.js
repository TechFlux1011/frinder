import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './SwipeCard.css';

const ZODIAC_EMOJI = {
  aries: '♈', taurus: '♉', gemini: '♊', cancer: '♋',
  leo: '♌', virgo: '♍', libra: '♎', scorpio: '♏',
  sagittarius: '♐', capricorn: '♑', aquarius: '♒', pisces: '♓',
};

const SwipeCard = ({ user, currentUser, onSwipe }) => {
  const { calculateMatchScore, users } = useApp();
  const navigate = useNavigate();

  const handleSwipe = (direction) => {
    onSwipe(user.id, direction);
  };

  const handleCardTap = () => {
    navigate(`/profile?user=${user.id}`);
  };

  const matchResult = currentUser ? calculateMatchScore(currentUser, user, users) : null;
  const matchScore = matchResult ? matchResult.overall : 0;

  return (
    <div className="swipe-card-wrapper">
      <div className="swipe-card" onClick={handleCardTap} style={{ cursor: 'pointer' }}>
        {/* Full photo background */}
        <div className="card-photo">
          {user.avatarUrl ? (
            <img src={user.avatarUrl} alt={user.name} className="card-photo-img" />
          ) : (
            <div className="card-photo-placeholder">
              <span className="card-photo-emoji">{user.avatar}</span>
            </div>
          )}

          {/* Top left overlay: MBTI + Zodiac */}
          <div className="card-overlay-top-left">
            {user.mbtiType && (
              <span className="overlay-mbti">{user.mbtiType}</span>
            )}
            {user.zodiacSign && (
              <span className="overlay-zodiac">{ZODIAC_EMOJI[user.zodiacSign]}</span>
            )}
          </div>

          {/* Top right overlay: Match score */}
          {currentUser && (
            <div className="card-overlay-top-right">
              <div className="overlay-score">{matchScore}%</div>
              <div className="overlay-score-label">Match</div>
            </div>
          )}

          {/* Bottom overlay: Name, age, location */}
          <div className="card-overlay-bottom">
            <h2 className="overlay-name">{user.name}, {user.age}</h2>
            <p className="overlay-location">📍 {user.location}</p>
          </div>
        </div>
      </div>

      {/* Action buttons underneath the card */}
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

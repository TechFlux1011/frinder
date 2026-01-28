import React from 'react';
import './SwipeCard.css';

const SwipeCard = ({ user, currentUser, onSwipe }) => {
  const handleSwipe = (direction) => {
    onSwipe(user.id, direction);
  };

  // Calculate match score
  const calculateMatchScore = () => {
    if (!currentUser) return 0;

    const topInterests = currentUser.interests || [];
    const topValues = currentUser.values || [];
    const extraInterests = currentUser.extraInterests || [];
    const extraValues = currentUser.extraValues || [];

    const userInterests = user.interests || [];
    const userValues = user.values || [];
    const userExtraInterests = user.extraInterests || [];
    const userExtraValues = user.extraValues || [];

    // Combine all user interests/values for matching
    const allUserInterests = [...userInterests, ...userExtraInterests];
    const allUserValues = [...userValues, ...userExtraValues];

    // Count matches: user's interests/values that match currentUser's top picks (10% each)
    const topInterestMatches = allUserInterests.filter(interest =>
      topInterests.includes(interest)
    ).length;
    const topValueMatches = allUserValues.filter(value =>
      topValues.includes(value)
    ).length;

    // Count matches: user's interests/values that match currentUser's extra picks (1% each)
    // But exclude ones already counted in top matches
    const extraInterestMatches = allUserInterests.filter(interest =>
      extraInterests.includes(interest) && !topInterests.includes(interest)
    ).length;
    const extraValueMatches = allUserValues.filter(value =>
      extraValues.includes(value) && !topValues.includes(value)
    ).length;

    // Top picks are worth 10% each, extra picks are worth 1% each.
    const topOverlapCount = topInterestMatches + topValueMatches;
    const extraOverlapCount = extraInterestMatches + extraValueMatches;
    const matchScore = Math.min(100, topOverlapCount * 10 + extraOverlapCount * 1);

    return matchScore;
  };

  const matchScore = calculateMatchScore();

  return (
    <div className="swipe-card">
      <div className="card-header">
        <div className="user-avatar">{user.avatar}</div>
        <div className="user-info">
          <h2 className="user-name">{user.name}, {user.age}</h2>
          <p className="user-location">📍 {user.location}</p>
        </div>
        {currentUser && (
          <div className="card-match-score">
            <div className="match-score-value">{matchScore}%</div>
            <div className="match-score-label">Match</div>
          </div>
        )}
      </div>
      
      <div className="card-bio">
        <p>{user.bio}</p>
      </div>

      <div className="card-interests">
        <h3>Interests</h3>
        <div className="tags">
          {(() => {
            const topInterests = user.interests || [];
            const extraInterests = user.extraInterests || [];
            const allInterests = [...topInterests, ...extraInterests];
            return allInterests.map((interest, idx) => {
              const isTop = idx < 5;
              const tagClass = isTop ? 'tag tag-top' : 'tag tag-extra';
              return (
                <span key={idx} className={tagClass}>
                  {interest}
                </span>
              );
            });
          })()}
        </div>
      </div>

      <div className="card-values">
        <h3>Values</h3>
        <div className="tags">
          {(() => {
            const topValues = user.values || [];
            const extraValues = user.extraValues || [];
            const allValues = [...topValues, ...extraValues];
            return allValues.map((value, idx) => {
              const isTop = idx < 5;
              const baseClass = 'tag value-tag';
              const tagClass = isTop ? `${baseClass} tag-top` : `${baseClass} tag-extra`;
              return (
                <span key={idx} className={tagClass}>
                  {value}
                </span>
              );
            });
          })()}
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

import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import SwipeCard from '../components/SwipeCard';
import './SwipePage.css';

const SwipePage = () => {
  const { users, swipedUsers, swipeUser } = useApp();
  const [currentIndex, setCurrentIndex] = useState(0);

  const availableUsers = users.filter(user => !swipedUsers.has(user.id));
  const currentUser = availableUsers[currentIndex];

  const handleSwipe = (userId, direction) => {
    swipeUser(userId, direction);
    
    if (currentIndex < availableUsers.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      // No more users
      setCurrentIndex(availableUsers.length);
    }
  };

  if (availableUsers.length === 0 || !currentUser) {
    return (
      <div className="swipe-page">
        <div className="empty-state">
          <div className="empty-icon">🎉</div>
          <h2>You've seen everyone!</h2>
          <p>Check back later for more friends, or explore groups to meet new people.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="swipe-page">
      <div className="swipe-container">
        <div className="swipe-header">
          <h1>Discover Friends</h1>
          <p>Swipe right to connect, left to pass</p>
        </div>
        <SwipeCard user={currentUser} onSwipe={handleSwipe} />
        <div className="swipe-progress">
          <p>{currentIndex + 1} of {availableUsers.length}</p>
        </div>
      </div>
    </div>
  );
};

export default SwipePage;

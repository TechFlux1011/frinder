import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import './FloatingMessagesButton.css';

const FloatingMessagesButton = () => {
  const location = useLocation();

  // Don’t show the “go to Messages” button while already on the Messages page
  if (location.pathname === '/messages') return null;

  return (
    <Link
      to="/messages"
      className="floating-messages-btn"
      aria-label="Open messages"
      title="Messages"
    >
      💬
    </Link>
  );
};

export default FloatingMessagesButton;


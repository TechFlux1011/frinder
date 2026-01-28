import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './MessagesPage.css';

const MessagesPage = () => {
  const { matches, getMessagesForMatch, sendMessage } = useApp();
  const [activeMatchId, setActiveMatchId] = useState(matches[0]?.id || null);
  const [draft, setDraft] = useState('');

  const handleSend = (e) => {
    e.preventDefault();
    if (!activeMatchId || !draft.trim()) return;
    sendMessage(activeMatchId, draft, 'me');
    setDraft('');
  };

  if (matches.length === 0) {
    return (
      <div className="messages-page">
        <div className="messages-empty-state">
          <div className="messages-empty-icon">💬</div>
          <h2>No conversations yet</h2>
          <p>Start swiping and matching to unlock messaging with new friends.</p>
        </div>
      </div>
    );
  }

  const activeMatch = matches.find(m => m.id === activeMatchId) || matches[0];
  const conversation = activeMatch ? getMessagesForMatch(activeMatch.id) : [];

  return (
    <div className="messages-page">
      <div className="messages-container">
        <div className="messages-sidebar">
          <h2 className="messages-title">Chats</h2>
          <ul className="messages-match-list">
            {matches.map(match => (
              <li
                key={match.id}
                className={`messages-match-item ${activeMatch && match.id === activeMatch.id ? 'active' : ''}`}
                onClick={() => setActiveMatchId(match.id)}
              >
                <div className="messages-match-avatar">{match.user.avatar}</div>
                <div className="messages-match-info">
                  <div className="messages-match-name">{match.user.name}</div>
                  <div className="messages-match-preview">
                    {getMessagesForMatch(match.id).slice(-1)[0]?.text || 'Say hi 👋'}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {activeMatch && (
          <div className="messages-chat">
            <div className="messages-chat-header">
              <div className="messages-chat-avatar">{activeMatch.user.avatar}</div>
              <div>
                <h2>{activeMatch.user.name}</h2>
                <p>Start building a real friendship with a simple hello.</p>
              </div>
            </div>

            <div className="messages-chat-body">
              {conversation.map(msg => (
                <div
                  key={msg.id}
                  className={`messages-bubble ${msg.from === 'me' ? 'me' : msg.from === 'system' ? 'system' : 'them'}`}
                >
                  <span>{msg.text}</span>
                </div>
              ))}
            </div>

            <form className="messages-input-bar" onSubmit={handleSend}>
              <input
                type="text"
                placeholder={`Message ${activeMatch.user.name}...`}
                value={draft}
                onChange={(e) => setDraft(e.target.value)}
              />
              <button type="submit">Send</button>
            </form>
          </div>
        )}
      </div>
    </div>
  );
};

export default MessagesPage;


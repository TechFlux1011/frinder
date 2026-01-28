import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './GroupsPage.css';

const GroupsPage = () => {
  const { groups, createGroup, joinGroup } = useApp();
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [newGroup, setNewGroup] = useState({
    name: '',
    description: '',
    interests: []
  });

  const handleCreateGroup = (e) => {
    e.preventDefault();
    if (newGroup.name && newGroup.description) {
      createGroup({
        ...newGroup,
        avatar: '👥',
        interests: newGroup.interests.length > 0 
          ? newGroup.interests 
          : ['social', 'community']
      });
      setNewGroup({ name: '', description: '', interests: [] });
      setShowCreateForm(false);
    }
  };

  const handleJoinGroup = (groupId) => {
    joinGroup(groupId);
  };

  return (
    <div className="groups-page">
      <div className="groups-container">
        <div className="page-header">
          <h1>Groups</h1>
          <p>Join communities or create your own to meet friends with shared interests</p>
          <button 
            className="create-group-btn"
            onClick={() => setShowCreateForm(!showCreateForm)}
          >
            {showCreateForm ? 'Cancel' : '+ Create Group'}
          </button>
        </div>

        {showCreateForm && (
          <div className="create-group-form">
            <form onSubmit={handleCreateGroup}>
              <input
                type="text"
                placeholder="Group name"
                value={newGroup.name}
                onChange={(e) => setNewGroup({ ...newGroup, name: e.target.value })}
                required
              />
              <textarea
                placeholder="Description"
                value={newGroup.description}
                onChange={(e) => setNewGroup({ ...newGroup, description: e.target.value })}
                required
              />
              <button type="submit">Create Group</button>
            </form>
          </div>
        )}

        <div className="groups-grid">
          {groups.map((group) => (
            <div key={group.id} className="group-card">
              <div className="group-avatar">{group.avatar}</div>
              <div className="group-content">
                <h3 className="group-name">{group.name}</h3>
                <p className="group-description">{group.description}</p>
                <div className="group-stats">
                  <span className="members-count">👥 {group.members} members</span>
                </div>
                <div className="group-interests">
                  {group.interests.map((interest, idx) => (
                    <span key={idx} className="interest-badge">
                      {interest}
                    </span>
                  ))}
                </div>
                <button 
                  className="join-btn"
                  onClick={() => handleJoinGroup(group.id)}
                >
                  Join Group
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GroupsPage;

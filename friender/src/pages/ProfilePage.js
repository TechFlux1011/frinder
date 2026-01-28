import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { currentUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(currentUser || {
    name: '',
    age: '',
    bio: '',
    interests: [],
    values: [],
    location: ''
  });

  const availableInterests = [
    'hiking', 'coffee', 'board games', 'photography', 'yoga', 'reading',
    'food', 'travel', 'music', 'art', 'sports', 'cooking', 'dancing',
    'movies', 'gaming', 'fitness', 'nature', 'writing', 'volunteering'
  ];

  const availableValues = [
    'authenticity', 'adventure', 'kindness', 'growth', 'community',
    'creativity', 'wellness', 'fun', 'intelligence', 'humor', 'mindfulness',
    'environment', 'sharing', 'respect', 'empathy', 'curiosity'
  ];

  const handleAddInterest = (interest) => {
    if (!profile.interests.includes(interest)) {
      setProfile({
        ...profile,
        interests: [...profile.interests, interest]
      });
    }
  };

  const handleRemoveInterest = (interest) => {
    setProfile({
      ...profile,
      interests: profile.interests.filter(i => i !== interest)
    });
  };

  const handleAddValue = (value) => {
    if (!profile.values.includes(value)) {
      setProfile({
        ...profile,
        values: [...profile.values, value]
      });
    }
  };

  const handleRemoveValue = (value) => {
    setProfile({
      ...profile,
      values: profile.values.filter(v => v !== value)
    });
  };

  const handleSave = () => {
    // In a real app, this would save to backend
    setIsEditing(false);
  };

  if (!currentUser) {
    return <div>Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-header">
          <h1>Your Profile</h1>
          <button 
            className="edit-btn"
            onClick={() => setIsEditing(!isEditing)}
          >
            {isEditing ? 'Cancel' : 'Edit Profile'}
          </button>
        </div>

        <div className="profile-card">
          <div className="profile-avatar-section">
            <div className="profile-avatar">{profile.avatar || '👤'}</div>
            {isEditing ? (
              <div className="profile-form">
                <input
                  type="text"
                  placeholder="Name"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                />
                <input
                  type="number"
                  placeholder="Age"
                  value={profile.age}
                  onChange={(e) => setProfile({ ...profile, age: e.target.value })}
                />
                <input
                  type="text"
                  placeholder="Location"
                  value={profile.location}
                  onChange={(e) => setProfile({ ...profile, location: e.target.value })}
                />
                <textarea
                  placeholder="Bio"
                  value={profile.bio}
                  onChange={(e) => setProfile({ ...profile, bio: e.target.value })}
                />
                <button onClick={handleSave} className="save-btn">Save Changes</button>
              </div>
            ) : (
              <>
                <h2>{profile.name}, {profile.age}</h2>
                <p className="profile-location">📍 {profile.location}</p>
                <p className="profile-bio">{profile.bio}</p>
              </>
            )}
          </div>

          <div className="profile-section">
            <h3>Interests</h3>
            {isEditing ? (
              <div className="editable-tags">
                <div className="selected-tags">
                  {profile.interests.map((interest, idx) => (
                    <span 
                      key={idx} 
                      className="tag selected"
                      onClick={() => handleRemoveInterest(interest)}
                    >
                      {interest} ×
                    </span>
                  ))}
                </div>
                <div className="available-tags">
                  {availableInterests
                    .filter(i => !profile.interests.includes(i))
                    .map((interest, idx) => (
                      <span
                        key={idx}
                        className="tag available"
                        onClick={() => handleAddInterest(interest)}
                      >
                        + {interest}
                      </span>
                    ))}
                </div>
              </div>
            ) : (
              <div className="tags">
                {profile.interests.map((interest, idx) => (
                  <span key={idx} className="tag">{interest}</span>
                ))}
              </div>
            )}
          </div>

          <div className="profile-section">
            <h3>Values</h3>
            {isEditing ? (
              <div className="editable-tags">
                <div className="selected-tags">
                  {profile.values.map((value, idx) => (
                    <span 
                      key={idx} 
                      className="tag selected value-tag"
                      onClick={() => handleRemoveValue(value)}
                    >
                      {value} ×
                    </span>
                  ))}
                </div>
                <div className="available-tags">
                  {availableValues
                    .filter(v => !profile.values.includes(v))
                    .map((value, idx) => (
                      <span
                        key={idx}
                        className="tag available value-tag"
                        onClick={() => handleAddValue(value)}
                      >
                        + {value}
                      </span>
                    ))}
                </div>
              </div>
            ) : (
              <div className="tags">
                {profile.values.map((value, idx) => (
                  <span key={idx} className="tag value-tag">{value}</span>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;

import React, { useEffect, useMemo, useState } from 'react';
import { useApp } from '../context/AppContext';
import './ProfilePage.css';

const ProfilePage = () => {
  const { currentUser, updateCurrentUser } = useApp();
  const [isEditing, setIsEditing] = useState(false);
  const [profile, setProfile] = useState(currentUser || {
    name: '',
    age: '',
    bio: '',
    interests: [],
    values: [],
    location: ''
  });

  const maxTopInterests = 5;
  const maxTopValues = 5;

  const interestsRemaining = useMemo(
    () => Math.max(0, maxTopInterests - (profile.interests?.length || 0)),
    [profile.interests]
  );
  const valuesRemaining = useMemo(
    () => Math.max(0, maxTopValues - (profile.values?.length || 0)),
    [profile.values]
  );

  const canSaveTopPicks =
    (profile.interests?.length || 0) === maxTopInterests &&
    (profile.values?.length || 0) === maxTopValues;

  useEffect(() => {
    if (!currentUser) return;
    setProfile(currentUser);
  }, [currentUser]);

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
    if ((profile.interests?.length || 0) >= maxTopInterests) return;
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
    if ((profile.values?.length || 0) >= maxTopValues) return;
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
    updateCurrentUser({
      name: profile.name,
      age: profile.age,
      bio: profile.bio,
      location: profile.location,
      interests: profile.interests?.slice(0, maxTopInterests) || [],
      values: profile.values?.slice(0, maxTopValues) || []
    });
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
                <button onClick={handleSave} className="save-btn" disabled={!canSaveTopPicks}>
                  Save Changes
                </button>
                {!canSaveTopPicks && (
                  <p className="profile-save-hint">
                    Choose exactly {maxTopInterests} interests and {maxTopValues} values to enable saving.
                  </p>
                )}
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
            <h3>Top Interests <span className="profile-limit">({profile.interests.length}/{maxTopInterests})</span></h3>
            {isEditing ? (
              <div className="editable-tags">
                {interestsRemaining === 0 ? (
                  <p className="profile-limit-hint">You’ve picked your top {maxTopInterests}. Tap one to remove it.</p>
                ) : (
                  <p className="profile-limit-hint">Pick {interestsRemaining} more to complete your top {maxTopInterests}.</p>
                )}
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
                    .filter(() => (profile.interests?.length || 0) < maxTopInterests)
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
            <h3>Top Values <span className="profile-limit">({profile.values.length}/{maxTopValues})</span></h3>
            {isEditing ? (
              <div className="editable-tags">
                {valuesRemaining === 0 ? (
                  <p className="profile-limit-hint">You’ve picked your top {maxTopValues}. Tap one to remove it.</p>
                ) : (
                  <p className="profile-limit-hint">Pick {valuesRemaining} more to complete your top {maxTopValues}.</p>
                )}
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
                    .filter(() => (profile.values?.length || 0) < maxTopValues)
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

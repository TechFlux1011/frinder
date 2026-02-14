import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './ProfilePage.css';

const maxTopInterests = 5;
const maxTopValues = 5;

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

const OnboardingInterestsPage = () => {
  const { currentUser, updateCurrentUser, markOnboardingComplete } = useApp();
  const navigate = useNavigate();

  const [allInterests, setAllInterests] = useState([]);
  const [allValues, setAllValues] = useState([]);

  useEffect(() => {
    if (!currentUser) return;

    const existingTopInterests = currentUser.interests || [];
    const existingExtraInterests = currentUser.extraInterests || [];
    const existingTopValues = currentUser.values || [];
    const existingExtraValues = currentUser.extraValues || [];

    setAllInterests([...existingTopInterests, ...existingExtraInterests]);
    setAllValues([...existingTopValues, ...existingExtraValues]);
  }, [currentUser]);

  const topInterests = allInterests.slice(0, maxTopInterests);
  const extraInterests = allInterests.slice(maxTopInterests);
  const topValues = allValues.slice(0, maxTopValues);
  const extraValues = allValues.slice(maxTopValues);

  const interestsRemaining = Math.max(0, maxTopInterests - topInterests.length);
  const valuesRemaining = Math.max(0, maxTopValues - topValues.length);

  const canContinue = interestsRemaining === 0 && valuesRemaining === 0;

  const toggleInterest = (interest) => {
    const isSelected = allInterests.includes(interest);
    if (isSelected) {
      setAllInterests(allInterests.filter(i => i !== interest));
    } else {
      setAllInterests([...allInterests, interest]);
    }
  };

  const toggleValue = (value) => {
    const isSelected = allValues.includes(value);
    if (isSelected) {
      setAllValues(allValues.filter(v => v !== value));
    } else {
      setAllValues([...allValues, value]);
    }
  };

  const handleFinish = () => {
    if (!canContinue) return;

    updateCurrentUser({
      interests: topInterests,
      values: topValues,
      extraInterests: extraInterests,
      extraValues: extraValues
    });
    markOnboardingComplete();

    navigate('/onboarding/personality');
  };

  if (!currentUser) {
    return <div className="profile-page">Loading...</div>;
  }

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card">
          <div className="profile-section">
            <h1 className="onboarding-title">Choose your vibe</h1>
            <p className="onboarding-subtitle">
              Pick your top {maxTopInterests} interests and {maxTopValues} values.
              Anything beyond your top picks still helps matches, just a bit less.
            </p>
          </div>

          <div className="profile-section">
            <h3>Interests <span className="profile-limit">({topInterests.length}/{maxTopInterests} top picks)</span></h3>
            <div className="editable-tags">
              {interestsRemaining === 0 ? (
                <p className="profile-limit-hint">
                  You’ve picked your top {maxTopInterests}. Tap one to remove it. Extra ones will be shown in green.
                </p>
              ) : (
                <p className="profile-limit-hint">
                  Pick {interestsRemaining} more to complete your top {maxTopInterests}. Extra ones will be shown in green.
                </p>
              )}
              <div className="selected-tags">
                {allInterests.map((interest, idx) => {
                  const isTop = idx < maxTopInterests;
                  const tagClass = isTop ? 'tag selected tag-top' : 'tag selected tag-extra';
                  return (
                    <span
                      key={idx}
                      className={tagClass}
                      onClick={() => toggleInterest(interest)}
                    >
                      {interest} ×
                    </span>
                  );
                })}
              </div>
              <div className="available-tags">
                {availableInterests
                  .filter(i => !allInterests.includes(i))
                  .map((interest, idx) => (
                    <span
                      key={idx}
                      className="tag available"
                      onClick={() => toggleInterest(interest)}
                    >
                      + {interest}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          <div className="profile-section">
            <h3>Values <span className="profile-limit">({topValues.length}/{maxTopValues} top picks)</span></h3>
            <div className="editable-tags">
              {valuesRemaining === 0 ? (
                <p className="profile-limit-hint">
                  You’ve picked your top {maxTopValues}. Tap one to remove it. Extra ones will be shown in orange.
                </p>
              ) : (
                <p className="profile-limit-hint">
                  Pick {valuesRemaining} more to complete your top {maxTopValues}. Extra ones will be shown in orange.
                </p>
              )}
              <div className="selected-tags">
                {allValues.map((value, idx) => {
                  const isTop = idx < maxTopValues;
                  const base = 'tag selected value-tag';
                  const tagClass = isTop ? `${base} tag-top` : `${base} tag-extra`;
                  return (
                    <span
                      key={idx}
                      className={tagClass}
                      onClick={() => toggleValue(value)}
                    >
                      {value} ×
                    </span>
                  );
                })}
              </div>
              <div className="available-tags">
                {availableValues
                  .filter(v => !allValues.includes(v))
                  .map((value, idx) => (
                    <span
                      key={idx}
                      className="tag available value-tag"
                      onClick={() => toggleValue(value)}
                    >
                      + {value}
                    </span>
                  ))}
              </div>
            </div>
          </div>

          <button
            className="save-btn"
            disabled={!canContinue}
            onClick={handleFinish}
          >
            Go to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default OnboardingInterestsPage;


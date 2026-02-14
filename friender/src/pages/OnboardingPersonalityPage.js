import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import './OnboardingPersonalityPage.css';

const MBTI_TYPES = [
  'INTJ', 'INTP', 'ENTJ', 'ENTP',
  'INFJ', 'INFP', 'ENFJ', 'ENFP',
  'ISTJ', 'ISFJ', 'ESTJ', 'ESFJ',
  'ISTP', 'ISFP', 'ESTP', 'ESFP',
];

const ZODIAC_SIGNS = [
  { id: 'aries', symbol: '♈', name: 'Aries', dates: 'Mar 21 - Apr 19' },
  { id: 'taurus', symbol: '♉', name: 'Taurus', dates: 'Apr 20 - May 20' },
  { id: 'gemini', symbol: '♊', name: 'Gemini', dates: 'May 21 - Jun 20' },
  { id: 'cancer', symbol: '♋', name: 'Cancer', dates: 'Jun 21 - Jul 22' },
  { id: 'leo', symbol: '♌', name: 'Leo', dates: 'Jul 23 - Aug 22' },
  { id: 'virgo', symbol: '♍', name: 'Virgo', dates: 'Aug 23 - Sep 22' },
  { id: 'libra', symbol: '♎', name: 'Libra', dates: 'Sep 23 - Oct 22' },
  { id: 'scorpio', symbol: '♏', name: 'Scorpio', dates: 'Oct 23 - Nov 21' },
  { id: 'sagittarius', symbol: '♐', name: 'Sagittarius', dates: 'Nov 22 - Dec 21' },
  { id: 'capricorn', symbol: '♑', name: 'Capricorn', dates: 'Dec 22 - Jan 19' },
  { id: 'aquarius', symbol: '♒', name: 'Aquarius', dates: 'Jan 20 - Feb 18' },
  { id: 'pisces', symbol: '♓', name: 'Pisces', dates: 'Feb 19 - Mar 20' },
];

const QUIZ_QUESTIONS = [
  {
    dimension: 'ei',
    question: 'At a party, you usually...',
    options: [
      { value: 'E', label: 'Work the room and meet new people' },
      { value: 'I', label: 'Find a cozy corner with close friends' },
    ],
  },
  {
    dimension: 'sn',
    question: 'You prefer ideas that are...',
    options: [
      { value: 'S', label: 'Practical and grounded in reality' },
      { value: 'N', label: 'Imaginative and full of possibilities' },
    ],
  },
  {
    dimension: 'tf',
    question: 'When a friend has a problem, you first...',
    options: [
      { value: 'T', label: 'Help them think through solutions logically' },
      { value: 'F', label: 'Listen and validate how they feel' },
    ],
  },
  {
    dimension: 'jp',
    question: 'Your ideal weekend is...',
    options: [
      { value: 'J', label: 'Planned out with a schedule' },
      { value: 'P', label: 'Spontaneous, see where the day takes you' },
    ],
  },
];

const AVAILABILITY_OPTIONS = [
  { id: 'weekday-mornings', label: 'Weekday Mornings' },
  { id: 'weekday-evenings', label: 'Weekday Evenings' },
  { id: 'weekends', label: 'Weekends' },
];

const GROUP_SIZE_OPTIONS = [
  { id: 'one-on-one', label: '1-on-1' },
  { id: 'small-group', label: 'Small Group (3-5)' },
  { id: 'large-group', label: 'Large Group (6+)' },
];

const FRIENDSHIP_GOALS = [
  { id: 'activity-partner', label: 'Activity Partner', icon: '🏃' },
  { id: 'deep-conversations', label: 'Deep Conversations', icon: '💬' },
  { id: 'adventure-buddy', label: 'Adventure Buddy', icon: '🌄' },
  { id: 'creative-collaborator', label: 'Creative Collab', icon: '🎨' },
  { id: 'fitness-buddy', label: 'Fitness Buddy', icon: '💪' },
  { id: 'foodie-friend', label: 'Foodie Friend', icon: '🍕' },
  { id: 'study-work-buddy', label: 'Study/Work Buddy', icon: '📚' },
  { id: 'travel-companion', label: 'Travel Companion', icon: '✈️' },
  { id: 'chill-hangouts', label: 'Chill Hangouts', icon: '🛋️' },
];

const OnboardingPersonalityPage = () => {
  const { updateCurrentUser } = useApp();
  const navigate = useNavigate();

  // MBTI state
  const [mbtiMode, setMbtiMode] = useState(null); // 'select' | 'quiz' | null
  const [selectedMbti, setSelectedMbti] = useState(null);
  const [quizAnswers, setQuizAnswers] = useState({});
  const [currentQuizQ, setCurrentQuizQ] = useState(0);

  // Zodiac state
  const [selectedZodiac, setSelectedZodiac] = useState(null);

  // Lifestyle state
  const [availability, setAvailability] = useState([]);
  const [activityLevel, setActivityLevel] = useState(0.5);
  const [groupSize, setGroupSize] = useState([]);

  // Friendship goals state
  const [friendshipGoals, setFriendshipGoals] = useState([]);

  const toggleArrayItem = (arr, setArr, item) => {
    if (arr.includes(item)) {
      setArr(arr.filter(i => i !== item));
    } else {
      setArr([...arr, item]);
    }
  };

  const toggleGoal = (goalId) => {
    if (friendshipGoals.includes(goalId)) {
      setFriendshipGoals(friendshipGoals.filter(g => g !== goalId));
    } else if (friendshipGoals.length < 3) {
      setFriendshipGoals([...friendshipGoals, goalId]);
    }
  };

  const handleQuizAnswer = (value) => {
    const dim = QUIZ_QUESTIONS[currentQuizQ].dimension;
    const newAnswers = { ...quizAnswers, [dim]: value };
    setQuizAnswers(newAnswers);

    if (currentQuizQ < QUIZ_QUESTIONS.length - 1) {
      setCurrentQuizQ(currentQuizQ + 1);
    } else {
      // Build MBTI type from answers
      const type = `${newAnswers.ei}${newAnswers.sn}${newAnswers.tf}${newAnswers.jp}`;
      setSelectedMbti(type);
      setMbtiMode('select'); // Switch to show the result
    }
  };

  const getMbtiFromQuiz = () => {
    if (Object.keys(quizAnswers).length === 4) {
      return `${quizAnswers.ei}${quizAnswers.sn}${quizAnswers.tf}${quizAnswers.jp}`;
    }
    return null;
  };

  const handleSave = () => {
    const updates = {};

    if (selectedMbti) updates.mbtiType = selectedMbti;
    if (selectedZodiac) updates.zodiacSign = selectedZodiac;

    if (availability.length > 0 || groupSize.length > 0) {
      updates.lifestyle = {
        availability,
        activityLevel,
        groupSize,
      };
    }

    if (friendshipGoals.length > 0) {
      updates.friendshipGoals = friendshipGoals;
    }

    if (Object.keys(updates).length > 0) {
      updateCurrentUser(updates);
    }

    navigate('/home');
  };

  const handleSkip = () => {
    navigate('/home');
  };

  return (
    <div className="profile-page">
      <div className="profile-container">
        <div className="profile-card personality-card">
          <div className="profile-section">
            <h1 className="onboarding-title">Fine-tune your matches</h1>
            <p className="onboarding-subtitle">
              Help us find your people. Fill in what you'd like -- skip the rest.
            </p>
          </div>

          {/* MBTI Section */}
          <div className="personality-section">
            <h3 className="section-title">Personality Type (MBTI)</h3>
            
            {!mbtiMode && !selectedMbti && (
              <div className="mbti-choice">
                <button className="mbti-choice-btn" onClick={() => setMbtiMode('select')}>
                  I know my type
                </button>
                <button className="mbti-choice-btn quiz-btn" onClick={() => setMbtiMode('quiz')}>
                  Help me find out
                </button>
              </div>
            )}

            {mbtiMode === 'quiz' && !selectedMbti && (
              <div className="mbti-quiz">
                <div className="quiz-progress">
                  Question {currentQuizQ + 1} of {QUIZ_QUESTIONS.length}
                </div>
                <p className="quiz-question">{QUIZ_QUESTIONS[currentQuizQ].question}</p>
                <div className="quiz-options">
                  {QUIZ_QUESTIONS[currentQuizQ].options.map(opt => (
                    <button
                      key={opt.value}
                      className="quiz-option-btn"
                      onClick={() => handleQuizAnswer(opt.value)}
                    >
                      {opt.label}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {(mbtiMode === 'select' || selectedMbti) && (
              <div className="mbti-grid">
                {selectedMbti && getMbtiFromQuiz() && (
                  <p className="quiz-result-hint">Your quiz result: <strong>{getMbtiFromQuiz()}</strong> -- tap to change</p>
                )}
                {MBTI_TYPES.map(type => (
                  <button
                    key={type}
                    className={`mbti-type-btn ${selectedMbti === type ? 'selected' : ''}`}
                    onClick={() => setSelectedMbti(type)}
                  >
                    {type}
                  </button>
                ))}
                {selectedMbti && (
                  <button className="clear-btn" onClick={() => { setSelectedMbti(null); setMbtiMode(null); setQuizAnswers({}); setCurrentQuizQ(0); }}>
                    Clear
                  </button>
                )}
              </div>
            )}
          </div>

          {/* Zodiac Section */}
          <div className="personality-section">
            <h3 className="section-title">Zodiac Sign</h3>
            <div className="zodiac-grid">
              {ZODIAC_SIGNS.map(sign => (
                <button
                  key={sign.id}
                  className={`zodiac-btn ${selectedZodiac === sign.id ? 'selected' : ''}`}
                  onClick={() => setSelectedZodiac(selectedZodiac === sign.id ? null : sign.id)}
                >
                  <span className="zodiac-symbol">{sign.symbol}</span>
                  <span className="zodiac-name">{sign.name}</span>
                  <span className="zodiac-dates">{sign.dates}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Lifestyle Section */}
          <div className="personality-section">
            <h3 className="section-title">Lifestyle</h3>
            
            <div className="lifestyle-subsection">
              <h4>When are you usually free?</h4>
              <div className="chip-group">
                {AVAILABILITY_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`chip ${availability.includes(opt.id) ? 'selected' : ''}`}
                    onClick={() => toggleArrayItem(availability, setAvailability, opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            <div className="lifestyle-subsection">
              <h4>Activity Level</h4>
              <div className="slider-container">
                <span className="slider-label">Chill</span>
                <input
                  type="range"
                  min="0"
                  max="1"
                  step="0.1"
                  value={activityLevel}
                  onChange={(e) => setActivityLevel(parseFloat(e.target.value))}
                  className="activity-slider"
                />
                <span className="slider-label">Active</span>
              </div>
            </div>

            <div className="lifestyle-subsection">
              <h4>Preferred group size</h4>
              <div className="chip-group">
                {GROUP_SIZE_OPTIONS.map(opt => (
                  <button
                    key={opt.id}
                    className={`chip ${groupSize.includes(opt.id) ? 'selected' : ''}`}
                    onClick={() => toggleArrayItem(groupSize, setGroupSize, opt.id)}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Friendship Goals Section */}
          <div className="personality-section">
            <h3 className="section-title">Friendship Goals <span className="section-limit">(pick up to 3)</span></h3>
            <div className="goals-grid">
              {FRIENDSHIP_GOALS.map(goal => (
                <button
                  key={goal.id}
                  className={`goal-card ${friendshipGoals.includes(goal.id) ? 'selected' : ''} ${friendshipGoals.length >= 3 && !friendshipGoals.includes(goal.id) ? 'disabled' : ''}`}
                  onClick={() => toggleGoal(goal.id)}
                >
                  <span className="goal-icon">{goal.icon}</span>
                  <span className="goal-label">{goal.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="personality-actions">
            <button className="save-btn" onClick={handleSave}>
              Continue
            </button>
            <button className="skip-btn" onClick={handleSkip}>
              I'll do this later
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OnboardingPersonalityPage;

import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

// ========== MATCHING ALGORITHM ==========

// Zodiac compatibility data
const ZODIAC_ELEMENTS = {
  aries: 'fire', leo: 'fire', sagittarius: 'fire',
  taurus: 'earth', virgo: 'earth', capricorn: 'earth',
  gemini: 'air', libra: 'air', aquarius: 'air',
  cancer: 'water', scorpio: 'water', pisces: 'water',
};

const ELEMENT_COMPAT = {
  'fire-fire': 0.90, 'earth-earth': 0.90, 'air-air': 0.90, 'water-water': 0.90,
  'fire-air': 0.80, 'air-fire': 0.80,
  'earth-water': 0.80, 'water-earth': 0.80,
  'fire-earth': 0.50, 'earth-fire': 0.50,
  'air-water': 0.50, 'water-air': 0.50,
  'fire-water': 0.35, 'water-fire': 0.35,
  'earth-air': 0.35, 'air-earth': 0.35,
};

// Helper functions
const arrIntersection = (a, b) => (a || []).filter(x => (b || []).includes(x));
const arrUnion = (a, b) => [...new Set([...(a || []), ...(b || [])])];
const jaccard = (a, b) => {
  const inter = arrIntersection(a, b).length;
  const uni = arrUnion(a, b).length;
  return uni === 0 ? 0 : inter / uni;
};

const hasLifestyle = (user) => {
  const ls = user.lifestyle;
  return ls && (
    (ls.availability && ls.availability.length > 0) ||
    ls.activityLevel !== null ||
    (ls.groupSize && ls.groupSize.length > 0)
  );
};

const hasGoals = (user) => user.friendshipGoals && user.friendshipGoals.length > 0;

// Parse MBTI type string into components
const parseMBTI = (type) => {
  if (!type || type.length !== 4) return null;
  return { ei: type[0], sn: type[1], tf: type[2], jp: type[3] };
};

// 1. Interest Score - Weighted Jaccard with IDF rarity bonus
const computeIDF = (allUsers) => {
  const idf = {};
  const totalUsers = allUsers.length;
  allUsers.forEach(user => {
    const all = [...(user.interests || []), ...(user.extraInterests || [])];
    new Set(all).forEach(interest => {
      idf[interest] = (idf[interest] || 0) + 1;
    });
  });
  Object.keys(idf).forEach(key => {
    idf[key] = Math.log((totalUsers + 1) / (idf[key] + 1)) + 1;
  });
  return idf;
};

const interestScore = (userA, userB, allUsers) => {
  const tierWeights = { top: 3.0, extra: 1.0 };
  const idf = computeIDF(allUsers);

  const buildSet = (top, extra) => {
    const set = {};
    (top || []).forEach(i => { set[i] = tierWeights.top; });
    (extra || []).forEach(i => { if (!set[i]) set[i] = tierWeights.extra; });
    return set;
  };

  const setA = buildSet(userA.interests, userA.extraInterests);
  const setB = buildSet(userB.interests, userB.extraInterests);

  let score = 0, maxScore = 0;
  const allKeys = arrUnion(Object.keys(setA), Object.keys(setB));

  for (const key of allKeys) {
    const wA = setA[key] || 0;
    const wB = setB[key] || 0;
    const rarity = idf[key] || 1;
    if (wA > 0 && wB > 0) {
      score += Math.min(wA, wB) * rarity;
    }
    maxScore += Math.max(wA, wB) * rarity;
  }

  return maxScore > 0 ? score / maxScore : 0;
};

// 2. Values Score - Position-weighted overlap
const valuesScore = (userA, userB) => {
  const rankWeight = [5, 4, 3, 2, 1];
  let score = 0, maxScore = 0;

  const aVals = userA.values || [];
  const bVals = userB.values || [];

  for (let i = 0; i < aVals.length; i++) {
    const wA = rankWeight[i] || 0.5;
    for (let j = 0; j < bVals.length; j++) {
      if (aVals[i] === bVals[j]) {
        const wB = rankWeight[j] || 0.5;
        score += (wA + wB) / 2;
      }
    }
    maxScore += wA;
  }

  const extraOverlap = arrIntersection(userA.extraValues, userB.extraValues).length;
  score += extraOverlap * 0.5;
  const maxExtra = Math.max((userA.extraValues || []).length, (userB.extraValues || []).length);
  maxScore += maxExtra * 0.5;

  return maxScore > 0 ? Math.min(1, score / maxScore) : 0;
};

// 3. MBTI Score - Cognitive function compatibility
const mbtiScore = (typeA, typeB) => {
  const a = parseMBTI(typeA);
  const b = parseMBTI(typeB);
  if (!a || !b) return 0;

  let score = 0;
  if (a.sn === b.sn) score += 0.35;
  if (a.tf === b.tf) score += 0.30;
  if (a.ei === b.ei) score += 0.20;
  else score += 0.10;
  if (a.jp === b.jp) score += 0.15;
  else score += 0.08;

  return score;
};

// 4. Astrology Score - Zodiac element compatibility
const astrologyScore = (signA, signB) => {
  if (!signA || !signB) return 0;
  const elemA = ZODIAC_ELEMENTS[signA];
  const elemB = ZODIAC_ELEMENTS[signB];
  if (!elemA || !elemB) return 0;

  let base = ELEMENT_COMPAT[`${elemA}-${elemB}`] || 0.5;
  if (signA === signB) base = Math.min(1.0, base + 0.10);
  return base;
};

// 5. Lifestyle Score - Practical compatibility
const lifestyleScoreFn = (userA, userB) => {
  const lsA = userA.lifestyle;
  const lsB = userB.lifestyle;
  if (!lsA || !lsB) return 0;

  const availOverlap = jaccard(lsA.availability, lsB.availability);

  let activityCompat = 0.5;
  if (lsA.activityLevel !== null && lsA.activityLevel !== undefined &&
      lsB.activityLevel !== null && lsB.activityLevel !== undefined) {
    activityCompat = 1 - Math.abs(lsA.activityLevel - lsB.activityLevel);
  }

  const groupOverlap = jaccard(lsA.groupSize, lsB.groupSize);

  return (availOverlap * 0.4) + (activityCompat * 0.3) + (groupOverlap * 0.3);
};

// 6. Friendship Goals Score
const goalScoreFn = (userA, userB) => {
  return jaccard(userA.friendshipGoals, userB.friendshipGoals);
};

// Dynamic weight redistribution
const getActiveWeights = (userA, userB) => {
  const baseWeights = {
    interests: 0.23,
    values: 0.25,
    mbti: 0.20,
    astrology: 0.10,
    lifestyle: 0.12,
    goals: 0.10,
  };

  const active = {
    interests: true,
    values: true,
    mbti: !!(userA.mbtiType && userB.mbtiType),
    astrology: !!(userA.zodiacSign && userB.zodiacSign),
    lifestyle: hasLifestyle(userA) && hasLifestyle(userB),
    goals: hasGoals(userA) && hasGoals(userB),
  };

  const totalActive = Object.entries(baseWeights)
    .filter(([k]) => active[k])
    .reduce((sum, [, v]) => sum + v, 0);

  const weights = {};
  for (const [key, base] of Object.entries(baseWeights)) {
    weights[key] = active[key] ? base / totalActive : 0;
  }
  return weights;
};

// Generate highlight badges
const generateHighlights = (userA, userB, scores) => {
  const highlights = [];
  const shared = arrIntersection(
    [...(userA.interests || []), ...(userA.extraInterests || [])],
    [...(userB.interests || []), ...(userB.extraInterests || [])]
  );

  if (shared.some(i => ['hiking', 'fitness', 'sports', 'yoga'].includes(i)))
    highlights.push('Active Buddy');
  if (shared.some(i => ['coffee', 'food', 'cooking'].includes(i)))
    highlights.push('Foodie Friend');
  if (shared.some(i => ['travel', 'hiking', 'nature'].includes(i)))
    highlights.push('Adventure Pal');
  if (shared.some(i => ['art', 'music', 'writing', 'photography', 'dancing'].includes(i)))
    highlights.push('Creative Soul');
  if (scores.values > 0.7)
    highlights.push('Kindred Spirit');
  if (scores.mbti > 0.8)
    highlights.push('Same Wavelength');
  if (scores.astrology > 0.8)
    highlights.push('Cosmic Connection');
  if (userA.mbtiType && userB.mbtiType && userA.mbtiType === userB.mbtiType)
    highlights.push('MBTI Twin');

  return [...new Set(highlights)].slice(0, 3);
};

// Main matching function
const calculateMatchScore = (userA, userB, allUsers) => {
  const weights = getActiveWeights(userA, userB);

  const scores = {
    interests: interestScore(userA, userB, allUsers),
    values: valuesScore(userA, userB),
    mbti: weights.mbti > 0 ? mbtiScore(userA.mbtiType, userB.mbtiType) : 0,
    astrology: weights.astrology > 0 ? astrologyScore(userA.zodiacSign, userB.zodiacSign) : 0,
    lifestyle: weights.lifestyle > 0 ? lifestyleScoreFn(userA, userB) : 0,
    goals: weights.goals > 0 ? goalScoreFn(userA, userB) : 0,
  };

  const finalScore = Object.entries(weights).reduce(
    (sum, [key, w]) => sum + w * scores[key], 0
  );

  return {
    overall: Math.round(finalScore * 100),
    breakdown: {
      interests: Math.round(scores.interests * 100),
      values: Math.round(scores.values * 100),
      mbti: weights.mbti > 0 ? Math.round(scores.mbti * 100) : null,
      astrology: weights.astrology > 0 ? Math.round(scores.astrology * 100) : null,
      lifestyle: weights.lifestyle > 0 ? Math.round(scores.lifestyle * 100) : null,
      goals: weights.goals > 0 ? Math.round(scores.goals * 100) : null,
    },
    highlights: generateHighlights(userA, userB, scores),
  };
};

// ========== END MATCHING ALGORITHM ==========

export const AppProvider = ({ children }) => {
  const [currentUser, setCurrentUser] = useState(null);
  const [users, setUsers] = useState([]);
  const [matches, setMatches] = useState([]);
  const [messages, setMessages] = useState({});
  const [groups, setGroups] = useState([]);
  const [swipedUsers, setSwipedUsers] = useState(new Set());
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState(false);

  // Initialize with sample data
  useEffect(() => {
    const storedOnboarding = window.localStorage.getItem('friender_hasOnboarded');
    if (storedOnboarding === 'true') {
      setHasCompletedOnboarding(true);
    }

    // Current user
    const user = {
      id: 'current-user',
      name: 'You',
      age: '',
      bio: '',
      interests: [],
      values: [],
      extraInterests: [],
      extraValues: [],
      mbtiType: null,
      zodiacSign: null,
      lifestyle: null,
      friendshipGoals: [],
      location: '',
      avatar: '👤',
      avatarUrl: ''
    };
    setCurrentUser(user);

    // Sample users
    const sampleUsers = [
      {
        id: '1',
        name: 'Alex',
        age: 27,
        bio: 'Coffee enthusiast and weekend hiker. Always up for trying new restaurants!',
        interests: ['coffee', 'hiking', 'food', 'travel', 'reading'],
        extraInterests: ['photography', 'music'],
        values: ['adventure', 'authenticity', 'community', 'curiosity', 'growth'],
        extraValues: [],
        mbtiType: 'ENFP',
        zodiacSign: 'sagittarius',
        lifestyle: { availability: ['weekday-evenings', 'weekends'], activityLevel: 0.7, groupSize: ['one-on-one', 'small-group'] },
        friendshipGoals: ['adventure-buddy', 'foodie-friend', 'activity-partner'],
        location: 'San Francisco, CA',
        avatar: '🧑‍💼'
      },
      {
        id: '2',
        name: 'Sam',
        age: 24,
        bio: 'Board game collector and trivia night regular. Let\'s play!',
        interests: ['board games', 'gaming', 'movies', 'music', 'food'],
        extraInterests: ['coffee'],
        values: ['fun', 'intelligence', 'humor', 'community', 'sharing'],
        extraValues: [],
        mbtiType: 'INTP',
        zodiacSign: 'aquarius',
        lifestyle: null,
        friendshipGoals: [],
        location: 'Oakland, CA',
        avatar: '👨‍🎨'
      },
      {
        id: '3',
        name: 'Jordan',
        age: 26,
        bio: 'Yoga instructor and bookworm. Looking for workout buddies and book club members!',
        interests: ['yoga', 'reading', 'fitness', 'nature', 'cooking'],
        extraInterests: ['writing'],
        values: ['wellness', 'growth', 'mindfulness', 'authenticity', 'kindness'],
        extraValues: ['empathy'],
        mbtiType: 'INFJ',
        zodiacSign: 'pisces',
        lifestyle: { availability: ['weekday-mornings', 'weekday-evenings'], activityLevel: 0.5, groupSize: ['one-on-one'] },
        friendshipGoals: ['deep-conversations', 'fitness-buddy', 'chill-hangouts'],
        location: 'Berkeley, CA',
        avatar: '🧘‍♀️'
      },
      {
        id: '4',
        name: 'Taylor',
        age: 28,
        bio: 'Photography hobbyist and nature lover. Always exploring new trails!',
        interests: ['photography', 'hiking', 'nature', 'art', 'travel'],
        extraInterests: ['fitness', 'writing'],
        values: ['creativity', 'adventure', 'environment', 'curiosity', 'authenticity'],
        extraValues: [],
        mbtiType: 'ISFP',
        zodiacSign: 'virgo',
        lifestyle: { availability: ['weekends'], activityLevel: 0.8, groupSize: ['one-on-one', 'small-group'] },
        friendshipGoals: ['adventure-buddy', 'creative-collaborator'],
        location: 'San Francisco, CA',
        avatar: '📸'
      },
      {
        id: '5',
        name: 'Morgan',
        age: 25,
        bio: 'Foodie and social butterfly. Love trying new restaurants and hosting game nights!',
        interests: ['food', 'board games', 'cooking', 'travel', 'music'],
        extraInterests: ['dancing'],
        values: ['community', 'fun', 'sharing', 'kindness', 'respect'],
        extraValues: [],
        mbtiType: 'ESFJ',
        zodiacSign: 'leo',
        lifestyle: { availability: ['weekday-evenings', 'weekends'], activityLevel: 0.5, groupSize: ['small-group', 'large-group'] },
        friendshipGoals: ['foodie-friend', 'activity-partner', 'chill-hangouts'],
        location: 'San Francisco, CA',
        avatar: '🍕'
      },
      {
        id: '6',
        name: 'Riley',
        age: 29,
        bio: 'Tech worker by day, rock climber by weekend. Always looking for adventure partners!',
        interests: ['hiking', 'fitness', 'nature', 'travel', 'photography'],
        extraInterests: ['sports', 'gaming'],
        values: ['adventure', 'growth', 'authenticity', 'curiosity', 'respect'],
        extraValues: ['fun'],
        mbtiType: 'ISTP',
        zodiacSign: 'aries',
        lifestyle: { availability: ['weekends'], activityLevel: 0.9, groupSize: ['one-on-one', 'small-group'] },
        friendshipGoals: ['adventure-buddy', 'fitness-buddy', 'activity-partner'],
        location: 'San Francisco, CA',
        avatar: '🧗'
      },
      {
        id: '7',
        name: 'Casey',
        age: 23,
        bio: 'Artist and coffee shop regular. Love deep conversations and creative projects.',
        interests: ['art', 'coffee', 'writing', 'reading', 'music'],
        extraInterests: ['photography', 'volunteering'],
        values: ['creativity', 'authenticity', 'empathy', 'community', 'kindness'],
        extraValues: ['growth'],
        mbtiType: 'INFP',
        zodiacSign: 'cancer',
        lifestyle: { availability: ['weekday-evenings', 'weekends'], activityLevel: 0.3, groupSize: ['one-on-one'] },
        friendshipGoals: ['deep-conversations', 'creative-collaborator', 'chill-hangouts'],
        location: 'Oakland, CA',
        avatar: '🎨'
      },
      {
        id: '8',
        name: 'Quinn',
        age: 31,
        bio: 'Fitness coach and wellness advocate. Passionate about helping others reach their goals.',
        interests: ['fitness', 'yoga', 'cooking', 'nature', 'reading'],
        extraInterests: ['volunteering'],
        values: ['wellness', 'growth', 'kindness', 'empathy', 'respect'],
        extraValues: ['community'],
        mbtiType: 'ENFJ',
        zodiacSign: 'taurus',
        lifestyle: { availability: ['weekday-mornings', 'weekday-evenings', 'weekends'], activityLevel: 0.7, groupSize: ['one-on-one', 'small-group'] },
        friendshipGoals: ['fitness-buddy', 'deep-conversations', 'activity-partner'],
        location: 'Berkeley, CA',
        avatar: '💪'
      },
      {
        id: '9',
        name: 'Avery',
        age: 26,
        bio: 'Musician and music producer. Always down for jam sessions and concerts!',
        interests: ['music', 'art', 'coffee', 'travel', 'food'],
        extraInterests: ['dancing', 'gaming'],
        values: ['creativity', 'fun', 'authenticity', 'community', 'sharing'],
        extraValues: [],
        mbtiType: 'ESFP',
        zodiacSign: 'libra',
        lifestyle: { availability: ['weekday-evenings', 'weekends'], activityLevel: 0.6, groupSize: ['small-group', 'large-group'] },
        friendshipGoals: ['activity-partner', 'creative-collaborator', 'chill-hangouts'],
        location: 'San Francisco, CA',
        avatar: '🎵'
      },
      {
        id: '10',
        name: 'Blake',
        age: 28,
        bio: 'Environmental activist and outdoor enthusiast. Let\'s make a difference together!',
        interests: ['nature', 'hiking', 'volunteering', 'fitness', 'reading'],
        extraInterests: ['writing', 'photography'],
        values: ['environment', 'community', 'respect', 'empathy', 'authenticity'],
        extraValues: ['kindness'],
        mbtiType: 'INFJ',
        zodiacSign: 'capricorn',
        lifestyle: { availability: ['weekends'], activityLevel: 0.7, groupSize: ['small-group'] },
        friendshipGoals: ['adventure-buddy', 'deep-conversations'],
        location: 'Oakland, CA',
        avatar: '🌱'
      },
      {
        id: '11',
        name: 'Dakota',
        age: 24,
        bio: 'Gamer and tech enthusiast. Love competitive gaming and exploring new tech!',
        interests: ['gaming', 'movies', 'music', 'food', 'coffee'],
        extraInterests: ['board games', 'sports'],
        values: ['fun', 'intelligence', 'curiosity', 'growth', 'humor'],
        extraValues: [],
        mbtiType: 'ENTP',
        zodiacSign: 'gemini',
        lifestyle: null,
        friendshipGoals: [],
        location: 'San Francisco, CA',
        avatar: '🎮'
      },
      {
        id: '12',
        name: 'Emery',
        age: 30,
        bio: 'Chef and food blogger. Always experimenting with new recipes and cuisines!',
        interests: ['cooking', 'food', 'travel', 'photography', 'art'],
        extraInterests: ['reading', 'music'],
        values: ['creativity', 'sharing', 'community', 'authenticity', 'kindness'],
        extraValues: ['fun'],
        mbtiType: 'ISFJ',
        zodiacSign: 'taurus',
        lifestyle: { availability: ['weekday-evenings', 'weekends'], activityLevel: 0.4, groupSize: ['one-on-one', 'small-group'] },
        friendshipGoals: ['foodie-friend', 'creative-collaborator', 'chill-hangouts'],
        location: 'San Francisco, CA',
        avatar: '👨‍🍳'
      },
      {
        id: '13',
        name: 'Finley',
        age: 25,
        bio: 'Dancer and choreographer. Love expressing myself through movement!',
        interests: ['dancing', 'music', 'fitness', 'art', 'travel'],
        extraInterests: ['movies', 'coffee'],
        values: ['creativity', 'authenticity', 'fun', 'growth', 'community'],
        extraValues: [],
        mbtiType: 'ESFP',
        zodiacSign: 'leo',
        lifestyle: { availability: ['weekday-evenings', 'weekends'], activityLevel: 0.8, groupSize: ['small-group', 'large-group'] },
        friendshipGoals: ['activity-partner', 'creative-collaborator'],
        location: 'Oakland, CA',
        avatar: '💃'
      },
      {
        id: '14',
        name: 'Harper',
        age: 27,
        bio: 'Writer and book club organizer. Always looking for new reading recommendations!',
        interests: ['reading', 'writing', 'coffee', 'art', 'music'],
        extraInterests: ['volunteering', 'travel'],
        values: ['intelligence', 'curiosity', 'growth', 'empathy', 'authenticity'],
        extraValues: ['community'],
        mbtiType: 'INTJ',
        zodiacSign: 'scorpio',
        lifestyle: null,
        friendshipGoals: [],
        location: 'Berkeley, CA',
        avatar: '📚'
      },
      {
        id: '15',
        name: 'Indigo',
        age: 22,
        bio: 'Yoga teacher and meditation guide. Helping others find inner peace.',
        interests: ['yoga', 'nature', 'reading', 'cooking', 'art'],
        extraInterests: ['music', 'volunteering'],
        values: ['mindfulness', 'wellness', 'empathy', 'kindness', 'growth'],
        extraValues: ['authenticity'],
        mbtiType: 'INFP',
        zodiacSign: 'pisces',
        lifestyle: { availability: ['weekday-mornings', 'weekends'], activityLevel: 0.4, groupSize: ['one-on-one'] },
        friendshipGoals: ['deep-conversations', 'chill-hangouts'],
        location: 'San Francisco, CA',
        avatar: '🧘'
      },
      {
        id: '16',
        name: 'Jules',
        age: 29,
        bio: 'Travel blogger and adventure seeker. Always planning the next trip!',
        interests: ['travel', 'photography', 'hiking', 'food', 'writing'],
        extraInterests: ['reading', 'nature'],
        values: ['adventure', 'curiosity', 'authenticity', 'growth', 'fun'],
        extraValues: ['respect'],
        mbtiType: 'ESTP',
        zodiacSign: 'sagittarius',
        lifestyle: { availability: ['weekends'], activityLevel: 0.9, groupSize: ['one-on-one', 'small-group'] },
        friendshipGoals: ['adventure-buddy', 'travel-companion', 'activity-partner'],
        location: 'San Francisco, CA',
        avatar: '✈️'
      },
      {
        id: '17',
        name: 'Kai',
        age: 26,
        bio: 'Surfer and beach volleyball player. Love the ocean and staying active!',
        interests: ['sports', 'fitness', 'nature', 'travel', 'food'],
        extraInterests: ['music', 'gaming'],
        values: ['adventure', 'fun', 'community', 'respect', 'wellness'],
        extraValues: [],
        mbtiType: 'ESTP',
        zodiacSign: 'aries',
        lifestyle: null,
        friendshipGoals: [],
        location: 'Oakland, CA',
        avatar: '🏄'
      },
      {
        id: '18',
        name: 'Lane',
        age: 28,
        bio: 'Film buff and movie critic. Always up for a good film discussion!',
        interests: ['movies', 'reading', 'writing', 'coffee', 'art'],
        extraInterests: ['music', 'board games'],
        values: ['creativity', 'intelligence', 'curiosity', 'humor', 'authenticity'],
        extraValues: [],
        mbtiType: 'INTP',
        zodiacSign: 'scorpio',
        lifestyle: null,
        friendshipGoals: [],
        location: 'San Francisco, CA',
        avatar: '🎬'
      },
      {
        id: '19',
        name: 'Morgan B',
        age: 24,
        bio: 'Volunteer coordinator and community organizer. Making the world a better place!',
        interests: ['volunteering', 'reading', 'nature', 'cooking', 'writing'],
        extraInterests: ['coffee', 'art'],
        values: ['kindness', 'empathy', 'community', 'respect', 'authenticity'],
        extraValues: ['growth'],
        mbtiType: null,
        zodiacSign: 'virgo',
        lifestyle: { availability: ['weekday-evenings', 'weekends'], activityLevel: 0.4, groupSize: ['small-group', 'large-group'] },
        friendshipGoals: ['deep-conversations', 'chill-hangouts', 'activity-partner'],
        location: 'Berkeley, CA',
        avatar: '🤝'
      },
      {
        id: '20',
        name: 'Noah',
        age: 31,
        bio: 'Photographer and visual storyteller. Capturing life\'s beautiful moments.',
        interests: ['photography', 'art', 'travel', 'nature', 'hiking'],
        extraInterests: ['music', 'coffee'],
        values: ['creativity', 'authenticity', 'curiosity', 'respect', 'empathy'],
        extraValues: [],
        mbtiType: 'ISFP',
        zodiacSign: 'libra',
        lifestyle: { availability: ['weekends'], activityLevel: 0.6, groupSize: ['one-on-one'] },
        friendshipGoals: ['creative-collaborator', 'adventure-buddy'],
        location: 'San Francisco, CA',
        avatar: '📷'
      },
      {
        id: '21',
        name: 'Parker',
        age: 25,
        bio: 'Marathon runner and fitness enthusiast. Training for my next race!',
        interests: ['fitness', 'sports', 'nature', 'hiking', 'cooking'],
        extraInterests: ['reading', 'music'],
        values: ['growth', 'wellness', 'respect', 'community', 'fun'],
        extraValues: [],
        mbtiType: 'ESTJ',
        zodiacSign: 'capricorn',
        lifestyle: { availability: ['weekday-mornings', 'weekends'], activityLevel: 0.9, groupSize: ['small-group'] },
        friendshipGoals: ['fitness-buddy', 'activity-partner'],
        location: 'Oakland, CA',
        avatar: '🏃'
      },
      {
        id: '22',
        name: 'River',
        age: 27,
        bio: 'Nature photographer and bird watcher. Love exploring local parks!',
        interests: ['photography', 'nature', 'hiking', 'reading', 'art'],
        extraInterests: ['writing', 'volunteering'],
        values: ['environment', 'curiosity', 'respect', 'mindfulness', 'authenticity'],
        extraValues: [],
        mbtiType: null,
        zodiacSign: 'cancer',
        lifestyle: { availability: ['weekends'], activityLevel: 0.6, groupSize: ['one-on-one'] },
        friendshipGoals: ['adventure-buddy', 'deep-conversations'],
        location: 'Berkeley, CA',
        avatar: '🦅'
      },
      {
        id: '23',
        name: 'Sage',
        age: 29,
        bio: 'Meditation teacher and wellness coach. Helping others find balance.',
        interests: ['yoga', 'fitness', 'reading', 'nature', 'cooking'],
        extraInterests: ['art', 'writing'],
        values: ['mindfulness', 'wellness', 'empathy', 'growth', 'authenticity'],
        extraValues: ['kindness'],
        mbtiType: null,
        zodiacSign: null,
        lifestyle: { availability: ['weekday-mornings', 'weekday-evenings'], activityLevel: 0.4, groupSize: ['one-on-one'] },
        friendshipGoals: ['deep-conversations', 'chill-hangouts'],
        location: 'San Francisco, CA',
        avatar: '🧘‍♂️'
      },
      {
        id: '24',
        name: 'Skylar',
        age: 23,
        bio: 'DJ and music producer. Always spinning at local events!',
        interests: ['music', 'dancing', 'gaming', 'food', 'travel'],
        extraInterests: ['art', 'coffee'],
        values: ['creativity', 'fun', 'community', 'sharing', 'authenticity'],
        extraValues: [],
        mbtiType: 'ENTJ',
        zodiacSign: null,
        lifestyle: { availability: ['weekday-evenings', 'weekends'], activityLevel: 0.6, groupSize: ['small-group', 'large-group'] },
        friendshipGoals: ['activity-partner', 'creative-collaborator', 'chill-hangouts'],
        location: 'San Francisco, CA',
        avatar: '🎧'
      },
      {
        id: '25',
        name: 'Tatum',
        age: 26,
        bio: 'Rock climber and outdoor guide. Leading adventures in the mountains!',
        interests: ['hiking', 'nature', 'fitness', 'photography', 'travel'],
        extraInterests: ['sports', 'gaming'],
        values: ['adventure', 'respect', 'community', 'growth', 'fun'],
        extraValues: ['authenticity'],
        mbtiType: 'ISTP',
        zodiacSign: 'aries',
        lifestyle: null,
        friendshipGoals: [],
        location: 'Oakland, CA',
        avatar: '⛰️'
      },
      {
        id: '26',
        name: 'Wren',
        age: 28,
        bio: 'Poet and spoken word artist. Sharing stories through words.',
        interests: ['writing', 'reading', 'art', 'music', 'coffee'],
        extraInterests: ['volunteering', 'travel'],
        values: ['creativity', 'authenticity', 'empathy', 'curiosity', 'growth'],
        extraValues: ['community'],
        mbtiType: 'INFP',
        zodiacSign: null,
        lifestyle: { availability: ['weekday-evenings'], activityLevel: 0.3, groupSize: ['one-on-one'] },
        friendshipGoals: ['deep-conversations', 'creative-collaborator'],
        location: 'Berkeley, CA',
        avatar: '✍️'
      },
      {
        id: '27',
        name: 'Zoe',
        age: 24,
        bio: 'Food truck owner and culinary explorer. Bringing flavors from around the world!',
        interests: ['food', 'cooking', 'travel', 'photography', 'art'],
        extraInterests: ['music', 'coffee'],
        values: ['sharing', 'creativity', 'community', 'kindness', 'fun'],
        extraValues: ['respect'],
        mbtiType: null,
        zodiacSign: 'cancer',
        lifestyle: { availability: ['weekday-mornings', 'weekday-evenings', 'weekends'], activityLevel: 0.5, groupSize: ['small-group'] },
        friendshipGoals: ['foodie-friend', 'creative-collaborator', 'chill-hangouts'],
        location: 'San Francisco, CA',
        avatar: '🍜'
      },
      {
        id: '28',
        name: 'Ashton',
        age: 30,
        bio: 'Cyclist and bike mechanic. Love long rides and fixing bikes!',
        interests: ['fitness', 'sports', 'nature', 'travel', 'photography'],
        extraInterests: ['coffee', 'gaming'],
        values: ['adventure', 'environment', 'community', 'respect', 'fun'],
        extraValues: [],
        mbtiType: 'ISTJ',
        zodiacSign: null,
        lifestyle: { availability: ['weekday-evenings', 'weekends'], activityLevel: 0.8, groupSize: ['one-on-one', 'small-group'] },
        friendshipGoals: ['fitness-buddy', 'adventure-buddy'],
        location: 'San Francisco, CA',
        avatar: '🚴'
      },
      {
        id: '29',
        name: 'Cameron',
        age: 25,
        bio: 'Theater actor and improv performer. Always ready for a good laugh!',
        interests: ['art', 'movies', 'music', 'dancing', 'reading'],
        extraInterests: ['coffee', 'board games'],
        values: ['creativity', 'humor', 'fun', 'authenticity', 'community'],
        extraValues: ['empathy'],
        mbtiType: null,
        zodiacSign: 'leo',
        lifestyle: { availability: ['weekday-evenings', 'weekends'], activityLevel: 0.5, groupSize: ['small-group', 'large-group'] },
        friendshipGoals: ['creative-collaborator', 'chill-hangouts', 'activity-partner'],
        location: 'Oakland, CA',
        avatar: '🎭'
      },
      {
        id: '30',
        name: 'Drew',
        age: 27,
        bio: 'Scientist and science communicator. Making complex topics accessible!',
        interests: ['reading', 'writing', 'nature', 'photography', 'travel'],
        extraInterests: ['coffee', 'volunteering'],
        values: ['intelligence', 'curiosity', 'growth', 'authenticity', 'empathy'],
        extraValues: ['respect'],
        mbtiType: 'INTJ',
        zodiacSign: null,
        lifestyle: { availability: ['weekday-evenings'], activityLevel: 0.5, groupSize: ['one-on-one'] },
        friendshipGoals: ['deep-conversations', 'study-work-buddy'],
        location: 'Berkeley, CA',
        avatar: '🔬'
      }
    ];
    setUsers(sampleUsers);

    // Sample groups
    const sampleGroups = [
      {
        id: '1',
        name: 'SF Hiking Enthusiasts',
        description: 'Weekly hikes around the Bay Area',
        members: 45,
        interests: ['hiking', 'nature', 'outdoors'],
        avatar: '⛰️'
      },
      {
        id: '2',
        name: 'Board Game Night',
        description: 'Monthly board game meetups at local cafes',
        members: 32,
        interests: ['board games', 'social', 'fun'],
        avatar: '🎲'
      },
      {
        id: '3',
        name: 'Coffee & Conversation',
        description: 'Casual coffee meetups for meaningful chats',
        members: 28,
        interests: ['coffee', 'conversation', 'community'],
        avatar: '☕'
      }
    ];
    setGroups(sampleGroups);
  }, []);

  const swipeUser = (userId, direction) => {
    setSwipedUsers(prev => new Set([...prev, userId]));
    
    if (direction === 'right') {
      const swipedUser = users.find(u => u.id === userId);
      if (swipedUser && Math.random() > 0.5) {
        const matchId = `match-${Date.now()}`;
        const newMatch = {
          id: matchId,
          user: swipedUser,
          matchedAt: new Date()
        };
        setMatches(prev => [...prev, newMatch]);
        setMessages(prev => ({
          ...prev,
          [matchId]: [
            {
              id: `msg-${Date.now()}`,
              from: 'system',
              text: `You matched with ${swipedUser.name}! Say hi 👋`,
              createdAt: new Date()
            }
          ]
        }));
      }
    }
  };

  const createGroup = (groupData) => {
    const newGroup = {
      id: `group-${Date.now()}`,
      ...groupData,
      members: 1,
      createdBy: currentUser.id
    };
    setGroups(prev => [...prev, newGroup]);
    return newGroup;
  };

  const joinGroup = (groupId) => {
    setGroups(prev => prev.map(group => 
      group.id === groupId 
        ? { ...group, members: group.members + 1 }
        : group
    ));
  };

  const createMeetup = (matchId, meetupData) => {
    const meetupWithStatus = {
      ...meetupData,
      status: 'pending',
      createdAt: new Date()
    };

    setMatches(prev => {
      const match = prev.find(m => m.id === matchId);
      if (!match) return prev;

      const meetupMessage = {
        id: `meetup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        from: 'them',
        type: 'meetup',
        meetupData: meetupWithStatus,
        text: `${currentUser?.name || 'Someone'} wants to meet up!`,
        createdAt: new Date()
      };

      setMessages(prevMessages => ({
        ...prevMessages,
        [matchId]: [...(prevMessages[matchId] || []), meetupMessage]
      }));

      return prev.map(m => 
        m.id === matchId
          ? { ...m, meetup: meetupWithStatus }
          : m
      );
    });
  };

  const respondToMeetup = (matchId, response) => {
    setMatches(prev => prev.map(match => {
      if (match.id === matchId && match.meetup) {
        const updatedMeetup = {
          ...match.meetup,
          status: response === 'yes' ? 'confirmed' : 'declined',
          respondedAt: new Date()
        };
        
        const responseMessage = {
          id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
          from: 'me',
          text: response === 'yes' 
            ? `Great! Looking forward to ${match.meetup.activity} on ${match.meetup.date}! 🎉`
            : `No worries! Maybe another time. 😊`,
          createdAt: new Date()
        };

        setMessages(prevMessages => ({
          ...prevMessages,
          [matchId]: [...(prevMessages[matchId] || []), responseMessage]
        }));

        return { ...match, meetup: updatedMeetup };
      }
      return match;
    }));
  };

  const sendMessage = (matchId, text, from = 'me') => {
    if (!text.trim()) return;

    const message = {
      id: `msg-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      from,
      text: text.trim(),
      createdAt: new Date()
    };

    setMessages(prev => ({
      ...prev,
      [matchId]: [...(prev[matchId] || []), message]
    }));
  };

  const getMessagesForMatch = (matchId) => {
    return messages[matchId] || [];
  };

  const updateCurrentUser = (updates) => {
    setCurrentUser(prev => {
      if (!prev) return prev;
      const updated = { ...prev, ...updates };

      const hasBasics =
        !!updated.name &&
        !!updated.age &&
        !!updated.location &&
        !!updated.avatarUrl;
      const hasCorePicks =
        (updated.interests?.length || 0) >= 5 &&
        (updated.values?.length || 0) >= 5;

      if (hasBasics && hasCorePicks) {
        setHasCompletedOnboarding(true);
        window.localStorage.setItem('friender_hasOnboarded', 'true');
      }

      return updated;
    });
  };

  const markOnboardingComplete = () => {
    setHasCompletedOnboarding(true);
    window.localStorage.setItem('friender_hasOnboarded', 'true');
  };

  const resetOnboarding = () => {
    setHasCompletedOnboarding(false);
    window.localStorage.removeItem('friender_hasOnboarded');
    setCurrentUser({
      id: 'current-user',
      name: 'You',
      age: '',
      bio: '',
      interests: [],
      values: [],
      extraInterests: [],
      extraValues: [],
      mbtiType: null,
      zodiacSign: null,
      lifestyle: null,
      friendshipGoals: [],
      location: '',
      avatar: '👤',
      avatarUrl: ''
    });
    setSwipedUsers(new Set());
    setMatches([]);
    setMessages({});
  };

  const getRecommendedUsers = () => {
    if (!currentUser) return [];

    const matchedUserIds = new Set(matches.map(match => match.user.id));

    return users
      .filter(user => 
        user.id !== currentUser.id &&
        !swipedUsers.has(user.id) &&
        !matchedUserIds.has(user.id)
      )
      .map(user => {
        const result = calculateMatchScore(currentUser, user, users);
        return { ...user, matchScore: result.overall, matchBreakdown: result.breakdown, matchHighlights: result.highlights };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const value = {
    currentUser,
    users,
    matches,
    groups,
    messages,
    swipedUsers,
    swipeUser,
    createGroup,
    joinGroup,
    createMeetup,
    respondToMeetup,
    getRecommendedUsers,
    calculateMatchScore,
    sendMessage,
    getMessagesForMatch,
    updateCurrentUser,
    hasCompletedOnboarding,
    markOnboardingComplete,
    resetOnboarding
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

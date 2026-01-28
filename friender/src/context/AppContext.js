import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

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
        interests: ['coffee', 'hiking', 'food', 'travel', 'reading', 'photography', 'music'],
        values: ['adventure', 'authenticity', 'community', 'curiosity', 'growth'],
        location: 'San Francisco, CA',
        avatar: '🧑‍💼'
      },
      {
        id: '2',
        name: 'Sam',
        age: 24,
        bio: 'Board game collector and trivia night regular. Let\'s play!',
        interests: ['board games', 'gaming', 'movies', 'music', 'food', 'coffee'],
        values: ['fun', 'intelligence', 'humor', 'community', 'sharing'],
        location: 'Oakland, CA',
        avatar: '👨‍🎨'
      },
      {
        id: '3',
        name: 'Jordan',
        age: 26,
        bio: 'Yoga instructor and bookworm. Looking for workout buddies and book club members!',
        interests: ['yoga', 'reading', 'fitness', 'nature', 'cooking', 'wellness', 'writing'],
        values: ['wellness', 'growth', 'mindfulness', 'authenticity', 'kindness', 'empathy'],
        location: 'Berkeley, CA',
        avatar: '🧘‍♀️'
      },
      {
        id: '4',
        name: 'Taylor',
        age: 28,
        bio: 'Photography hobbyist and nature lover. Always exploring new trails!',
        interests: ['photography', 'hiking', 'nature', 'art', 'travel', 'fitness', 'writing'],
        values: ['creativity', 'adventure', 'environment', 'curiosity', 'authenticity'],
        location: 'San Francisco, CA',
        avatar: '📸'
      },
      {
        id: '5',
        name: 'Morgan',
        age: 25,
        bio: 'Foodie and social butterfly. Love trying new restaurants and hosting game nights!',
        interests: ['food', 'board games', 'cooking', 'travel', 'music', 'dancing'],
        values: ['community', 'fun', 'sharing', 'kindness', 'respect'],
        location: 'San Francisco, CA',
        avatar: '🍕'
      },
      {
        id: '6',
        name: 'Riley',
        age: 29,
        bio: 'Tech worker by day, rock climber by weekend. Always looking for adventure partners!',
        interests: ['hiking', 'fitness', 'nature', 'travel', 'photography', 'sports', 'gaming'],
        values: ['adventure', 'growth', 'authenticity', 'curiosity', 'respect', 'fun'],
        location: 'San Francisco, CA',
        avatar: '🧗'
      },
      {
        id: '7',
        name: 'Casey',
        age: 23,
        bio: 'Artist and coffee shop regular. Love deep conversations and creative projects.',
        interests: ['art', 'coffee', 'writing', 'reading', 'music', 'photography', 'volunteering'],
        values: ['creativity', 'authenticity', 'empathy', 'community', 'kindness', 'growth'],
        location: 'Oakland, CA',
        avatar: '🎨'
      },
      {
        id: '8',
        name: 'Quinn',
        age: 31,
        bio: 'Fitness coach and wellness advocate. Passionate about helping others reach their goals.',
        interests: ['fitness', 'yoga', 'cooking', 'nature', 'reading', 'volunteering', 'wellness'],
        values: ['wellness', 'growth', 'kindness', 'empathy', 'respect', 'community'],
        location: 'Berkeley, CA',
        avatar: '💪'
      },
      {
        id: '9',
        name: 'Avery',
        age: 26,
        bio: 'Musician and music producer. Always down for jam sessions and concerts!',
        interests: ['music', 'art', 'coffee', 'travel', 'food', 'dancing', 'gaming'],
        values: ['creativity', 'fun', 'authenticity', 'community', 'sharing'],
        location: 'San Francisco, CA',
        avatar: '🎵'
      },
      {
        id: '10',
        name: 'Blake',
        age: 28,
        bio: 'Environmental activist and outdoor enthusiast. Let\'s make a difference together!',
        interests: ['nature', 'hiking', 'volunteering', 'fitness', 'reading', 'writing', 'photography'],
        values: ['environment', 'community', 'respect', 'empathy', 'authenticity', 'kindness'],
        location: 'Oakland, CA',
        avatar: '🌱'
      },
      {
        id: '11',
        name: 'Dakota',
        age: 24,
        bio: 'Gamer and tech enthusiast. Love competitive gaming and exploring new tech!',
        interests: ['gaming', 'movies', 'music', 'food', 'coffee', 'board games', 'sports'],
        values: ['fun', 'intelligence', 'curiosity', 'growth', 'humor'],
        location: 'San Francisco, CA',
        avatar: '🎮'
      },
      {
        id: '12',
        name: 'Emery',
        age: 30,
        bio: 'Chef and food blogger. Always experimenting with new recipes and cuisines!',
        interests: ['cooking', 'food', 'travel', 'photography', 'art', 'reading', 'music'],
        values: ['creativity', 'sharing', 'community', 'authenticity', 'kindness', 'fun'],
        location: 'San Francisco, CA',
        avatar: '👨‍🍳'
      },
      {
        id: '13',
        name: 'Finley',
        age: 25,
        bio: 'Dancer and choreographer. Love expressing myself through movement!',
        interests: ['dancing', 'music', 'fitness', 'art', 'travel', 'movies', 'coffee'],
        values: ['creativity', 'authenticity', 'fun', 'growth', 'community'],
        location: 'Oakland, CA',
        avatar: '💃'
      },
      {
        id: '14',
        name: 'Harper',
        age: 27,
        bio: 'Writer and book club organizer. Always looking for new reading recommendations!',
        interests: ['reading', 'writing', 'coffee', 'art', 'music', 'volunteering', 'travel'],
        values: ['intelligence', 'curiosity', 'growth', 'empathy', 'authenticity', 'community'],
        location: 'Berkeley, CA',
        avatar: '📚'
      },
      {
        id: '15',
        name: 'Indigo',
        age: 22,
        bio: 'Yoga teacher and meditation guide. Helping others find inner peace.',
        interests: ['yoga', 'nature', 'reading', 'cooking', 'art', 'music', 'volunteering'],
        values: ['mindfulness', 'wellness', 'empathy', 'kindness', 'growth', 'authenticity'],
        location: 'San Francisco, CA',
        avatar: '🧘'
      },
      {
        id: '16',
        name: 'Jules',
        age: 29,
        bio: 'Travel blogger and adventure seeker. Always planning the next trip!',
        interests: ['travel', 'photography', 'hiking', 'food', 'writing', 'reading', 'nature'],
        values: ['adventure', 'curiosity', 'authenticity', 'growth', 'fun', 'respect'],
        location: 'San Francisco, CA',
        avatar: '✈️'
      },
      {
        id: '17',
        name: 'Kai',
        age: 26,
        bio: 'Surfer and beach volleyball player. Love the ocean and staying active!',
        interests: ['sports', 'fitness', 'nature', 'travel', 'food', 'music', 'gaming'],
        values: ['adventure', 'fun', 'community', 'respect', 'wellness'],
        location: 'Oakland, CA',
        avatar: '🏄'
      },
      {
        id: '18',
        name: 'Lane',
        age: 28,
        bio: 'Film buff and movie critic. Always up for a good film discussion!',
        interests: ['movies', 'reading', 'writing', 'coffee', 'art', 'music', 'board games'],
        values: ['creativity', 'intelligence', 'curiosity', 'humor', 'authenticity'],
        location: 'San Francisco, CA',
        avatar: '🎬'
      },
      {
        id: '19',
        name: 'Morgan',
        age: 24,
        bio: 'Volunteer coordinator and community organizer. Making the world a better place!',
        interests: ['volunteering', 'community', 'reading', 'nature', 'cooking', 'writing', 'art'],
        values: ['kindness', 'empathy', 'community', 'respect', 'authenticity', 'growth'],
        location: 'Berkeley, CA',
        avatar: '🤝'
      },
      {
        id: '20',
        name: 'Noah',
        age: 31,
        bio: 'Photographer and visual storyteller. Capturing life\'s beautiful moments.',
        interests: ['photography', 'art', 'travel', 'nature', 'hiking', 'music', 'coffee'],
        values: ['creativity', 'authenticity', 'curiosity', 'respect', 'empathy'],
        location: 'San Francisco, CA',
        avatar: '📷'
      },
      {
        id: '21',
        name: 'Parker',
        age: 25,
        bio: 'Marathon runner and fitness enthusiast. Training for my next race!',
        interests: ['fitness', 'sports', 'nature', 'hiking', 'cooking', 'reading', 'music'],
        values: ['growth', 'wellness', 'respect', 'community', 'fun'],
        location: 'Oakland, CA',
        avatar: '🏃'
      },
      {
        id: '22',
        name: 'River',
        age: 27,
        bio: 'Nature photographer and bird watcher. Love exploring local parks!',
        interests: ['photography', 'nature', 'hiking', 'reading', 'art', 'writing', 'volunteering'],
        values: ['environment', 'curiosity', 'respect', 'mindfulness', 'authenticity'],
        location: 'Berkeley, CA',
        avatar: '🦅'
      },
      {
        id: '23',
        name: 'Sage',
        age: 29,
        bio: 'Meditation teacher and wellness coach. Helping others find balance.',
        interests: ['yoga', 'meditation', 'reading', 'nature', 'cooking', 'art', 'writing'],
        values: ['mindfulness', 'wellness', 'empathy', 'growth', 'authenticity', 'kindness'],
        location: 'San Francisco, CA',
        avatar: '🧘‍♂️'
      },
      {
        id: '24',
        name: 'Skylar',
        age: 23,
        bio: 'DJ and music producer. Always spinning at local events!',
        interests: ['music', 'dancing', 'gaming', 'food', 'travel', 'art', 'coffee'],
        values: ['creativity', 'fun', 'community', 'sharing', 'authenticity'],
        location: 'San Francisco, CA',
        avatar: '🎧'
      },
      {
        id: '25',
        name: 'Tatum',
        age: 26,
        bio: 'Rock climber and outdoor guide. Leading adventures in the mountains!',
        interests: ['hiking', 'nature', 'fitness', 'photography', 'travel', 'sports', 'gaming'],
        values: ['adventure', 'respect', 'community', 'growth', 'fun', 'authenticity'],
        location: 'Oakland, CA',
        avatar: '⛰️'
      },
      {
        id: '26',
        name: 'Wren',
        age: 28,
        bio: 'Poet and spoken word artist. Sharing stories through words.',
        interests: ['writing', 'reading', 'art', 'music', 'coffee', 'volunteering', 'travel'],
        values: ['creativity', 'authenticity', 'empathy', 'curiosity', 'growth', 'community'],
        location: 'Berkeley, CA',
        avatar: '✍️'
      },
      {
        id: '27',
        name: 'Zoe',
        age: 24,
        bio: 'Food truck owner and culinary explorer. Bringing flavors from around the world!',
        interests: ['food', 'cooking', 'travel', 'photography', 'art', 'music', 'community'],
        values: ['sharing', 'creativity', 'community', 'kindness', 'fun', 'respect'],
        location: 'San Francisco, CA',
        avatar: '🍜'
      },
      {
        id: '28',
        name: 'Ashton',
        age: 30,
        bio: 'Cyclist and bike mechanic. Love long rides and fixing bikes!',
        interests: ['fitness', 'sports', 'nature', 'travel', 'photography', 'coffee', 'gaming'],
        values: ['adventure', 'environment', 'community', 'respect', 'fun'],
        location: 'San Francisco, CA',
        avatar: '🚴'
      },
      {
        id: '29',
        name: 'Cameron',
        age: 25,
        bio: 'Theater actor and improv performer. Always ready for a good laugh!',
        interests: ['art', 'movies', 'music', 'dancing', 'reading', 'coffee', 'board games'],
        values: ['creativity', 'humor', 'fun', 'authenticity', 'community', 'empathy'],
        location: 'Oakland, CA',
        avatar: '🎭'
      },
      {
        id: '30',
        name: 'Drew',
        age: 27,
        bio: 'Scientist and science communicator. Making complex topics accessible!',
        interests: ['reading', 'writing', 'nature', 'photography', 'travel', 'coffee', 'volunteering'],
        values: ['intelligence', 'curiosity', 'growth', 'authenticity', 'empathy', 'respect'],
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
      // Check if it's a match (simplified - in real app, check if they swiped right on you)
      const swipedUser = users.find(u => u.id === userId);
      if (swipedUser && Math.random() > 0.5) { // 50% chance of match for demo
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

    // Update the match with meetup data
    setMatches(prev => {
      const match = prev.find(m => m.id === matchId);
      if (!match) return prev;

      // Send a meetup preview message to the other person
      const meetupMessage = {
        id: `meetup-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        from: 'them',
        type: 'meetup',
        meetupData: meetupWithStatus,
        text: `${currentUser?.name || 'Someone'} wants to meet up!`,
        createdAt: new Date()
      };

      // Add the message
      setMessages(prevMessages => ({
        ...prevMessages,
        [matchId]: [...(prevMessages[matchId] || []), meetupMessage]
      }));

      // Update the match
      return prev.map(m => 
        m.id === matchId
          ? { ...m, meetup: meetupWithStatus }
          : m
      );
    });
  };

  const respondToMeetup = (matchId, response) => {
    // Find the match and update meetup status
    setMatches(prev => prev.map(match => {
      if (match.id === matchId && match.meetup) {
        const updatedMeetup = {
          ...match.meetup,
          status: response === 'yes' ? 'confirmed' : 'declined',
          respondedAt: new Date()
        };
        
        // Send a response message
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
    // Reset current user to initial state
    setCurrentUser({
      id: 'current-user',
      name: 'You',
      age: '',
      bio: '',
      interests: [],
      values: [],
      extraInterests: [],
      extraValues: [],
      location: '',
      avatar: '👤',
      avatarUrl: ''
    });
    // Clear swiped users and matches
    setSwipedUsers(new Set());
    setMatches([]);
    setMessages({});
  };

  const getRecommendedUsers = () => {
    if (!currentUser) return [];

    const topInterests = currentUser.interests || [];
    const topValues = currentUser.values || [];
    const extraInterests = currentUser.extraInterests || [];
    const extraValues = currentUser.extraValues || [];

    // Get list of matched user IDs to exclude them
    const matchedUserIds = new Set(matches.map(match => match.user.id));

    return users
      .filter(user => 
        user.id !== currentUser.id && // Don't show current user
        !swipedUsers.has(user.id) && // Don't show swiped users
        !matchedUserIds.has(user.id) // Don't show matched users
      )
      .map(user => {
        const userTopInterests = user.interests || [];
        const userExtraInterests = user.extraInterests || [];
        const userTopValues = user.values || [];
        const userExtraValues = user.extraValues || [];

        // Combine all user interests/values for matching
        const allUserInterests = [...userTopInterests, ...userExtraInterests];
        const allUserValues = [...userTopValues, ...userExtraValues];

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

        return { ...user, matchScore };
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
    sendMessage,
    getMessagesForMatch,
    updateCurrentUser,
    hasCompletedOnboarding,
    markOnboardingComplete,
    resetOnboarding
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

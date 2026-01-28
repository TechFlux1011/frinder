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
  const [groups, setGroups] = useState([]);
  const [swipedUsers, setSwipedUsers] = useState(new Set());

  // Initialize with sample data
  useEffect(() => {
    // Current user
    const user = {
      id: 'current-user',
      name: 'You',
      age: 25,
      bio: 'Looking for friends who love hiking, coffee, and board games!',
      interests: ['hiking', 'coffee', 'board games', 'photography', 'yoga'],
      values: ['authenticity', 'adventure', 'kindness', 'growth'],
      location: 'San Francisco, CA',
      avatar: '👤'
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
        values: ['adventure', 'authenticity', 'community'],
        location: 'San Francisco, CA',
        avatar: '🧑‍💼'
      },
      {
        id: '2',
        name: 'Sam',
        age: 24,
        bio: 'Board game collector and trivia night regular. Let\'s play!',
        interests: ['board games', 'trivia', 'craft beer', 'comedy shows'],
        values: ['fun', 'intelligence', 'humor'],
        location: 'Oakland, CA',
        avatar: '👨‍🎨'
      },
      {
        id: '3',
        name: 'Jordan',
        age: 26,
        bio: 'Yoga instructor and bookworm. Looking for workout buddies and book club members!',
        interests: ['yoga', 'reading', 'meditation', 'plant-based cooking'],
        values: ['wellness', 'growth', 'mindfulness'],
        location: 'Berkeley, CA',
        avatar: '🧘‍♀️'
      },
      {
        id: '4',
        name: 'Taylor',
        age: 28,
        bio: 'Photography hobbyist and nature lover. Always exploring new trails!',
        interests: ['photography', 'hiking', 'nature', 'art', 'camping'],
        values: ['creativity', 'adventure', 'environment'],
        location: 'San Francisco, CA',
        avatar: '📸'
      },
      {
        id: '5',
        name: 'Morgan',
        age: 25,
        bio: 'Foodie and social butterfly. Love trying new restaurants and hosting game nights!',
        interests: ['food', 'board games', 'cooking', 'social events'],
        values: ['community', 'fun', 'sharing'],
        location: 'San Francisco, CA',
        avatar: '🍕'
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
        const newMatch = {
          id: `match-${Date.now()}`,
          user: swipedUser,
          matchedAt: new Date(),
          messages: []
        };
        setMatches(prev => [...prev, newMatch]);
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
    setMatches(prev => prev.map(match => 
      match.id === matchId
        ? { ...match, meetup: meetupData }
        : match
    ));
  };

  const getRecommendedUsers = () => {
    if (!currentUser) return [];
    
    return users
      .filter(user => !swipedUsers.has(user.id))
      .map(user => {
        const interestMatch = user.interests.filter(interest => 
          currentUser.interests.includes(interest)
        ).length;
        const valueMatch = user.values.filter(value => 
          currentUser.values.includes(value)
        ).length;
        const score = interestMatch * 2 + valueMatch * 3;
        return { ...user, matchScore: score };
      })
      .sort((a, b) => b.matchScore - a.matchScore);
  };

  const value = {
    currentUser,
    users,
    matches,
    groups,
    swipedUsers,
    swipeUser,
    createGroup,
    joinGroup,
    createMeetup,
    getRecommendedUsers
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

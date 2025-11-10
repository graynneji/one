// Types and Interfaces
export interface Author {
  id?: string;
  name: string;
  avatar: string;
}

export interface Comment {
  id: string;
  content: string;
  author: Author;
  timestamp: string;
  likes: number;
  isLiked: boolean;
}

export interface Discussion {
  id: string;
  title: string;
  content: string;
  author: Author;
  category: string;
  timestamp: string;
  likes: number;
  isLiked: boolean;
  views: number;
  isUrgent: boolean;
  comments: Comment[];
}

export interface CommunityCategory {
  id: string;
  name: string;
  icon: string;
  color: string;
}

export interface CrisisResource {
  name: string;
  phone?: string;
  website?: string;
  description: string;
  country: string;
}

export interface CommunityGuideline {
  title: string;
  description: string;
}

export interface ValidationErrors {
  title?: string;
  content?: string;
  category?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationErrors;
}

export interface CategoryDistribution {
  [category: string]: number;
}

export interface PopularCategory {
  category: string;
  count: number;
}

export type SortOption = "recent" | "popular" | "mostCommented" | "urgent";

// Community Categories Configuration
export const COMMUNITY_CATEGORIES: CommunityCategory[] = [
  { id: "all", name: "All Topics", icon: "people-outline", color: "#3b82f6" },
  { id: "anxiety", name: "Anxiety", icon: "heart-outline", color: "#8b5cf6" },
  {
    id: "depression",
    name: "Depression",
    icon: "chatbubble-outline",
    color: "#6366f1",
  },
  {
    id: "relationships",
    name: "Relationships",
    icon: "heart",
    color: "#ec4899",
  },
  {
    id: "career",
    name: "Career & Work",
    icon: "briefcase-outline",
    color: "#10b981",
  },
  { id: "family", name: "Family", icon: "home-outline", color: "#f97316" },
  {
    id: "self-care",
    name: "Self-Care",
    icon: "star-outline",
    color: "#eab308",
  },
  {
    id: "growth",
    name: "Personal Growth",
    icon: "trending-up-outline",
    color: "#14b8a6",
  },
];

// Sample Data for Development/Testing
// export const SAMPLE_DISCUSSIONS: Discussion[] = [
export const initialDiscussions: Discussion[] = [
  {
    id: "1",
    title: "Dealing with workplace anxiety",
    content:
      "I've been struggling with anxiety at work lately. The constant pressure and deadlines are overwhelming. Has anyone found effective ways to manage work-related stress?",
    author: {
      id: "user1",
      name: "Sarah M.",
      avatar:
        "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    },
    category: "anxiety",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(), // 2 hours ago
    likes: 24,
    isLiked: false,
    views: 127,
    isUrgent: false,
    comments: [
      {
        id: "c1",
        content:
          "I've found that taking short breaks every hour really helps. Even just a 5-minute walk can reset my mind.",
        author: {
          name: "Mike D.",
          avatar:
            "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
        },
        timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
        likes: 8,
        isLiked: false,
      },
    ],
  },
  {
    id: "2",
    title: "Building healthy morning routines",
    content:
      "After months of struggling with depression, I'm trying to establish a morning routine that sets a positive tone for the day. What has worked for you?",
    author: {
      id: "user2",
      name: "Alex K.",
      avatar:
        "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    },
    category: "self-care",
    timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000).toISOString(), // 5 hours ago
    likes: 31,
    isLiked: true,
    views: 203,
    isUrgent: false,
    comments: [
      {
        id: "c2",
        content:
          "I start with 10 minutes of meditation and then write in my gratitude journal. It's made a huge difference!",
        author: {
          name: "Emma R.",
          avatar:
            "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
        },
        timestamp: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(),
        likes: 12,
        isLiked: true,
      },
      {
        id: "c3",
        content:
          "Exercise has been key for me. Even 15 minutes of yoga or stretching helps me feel more centered.",
        author: {
          name: "James L.",
          avatar:
            "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
        },
        timestamp: new Date(Date.now() - 3 * 60 * 60 * 1000).toISOString(),
        likes: 9,
        isLiked: false,
      },
    ],
  },
  {
    id: "3",
    title: "Supporting a partner through difficult times",
    content:
      "My partner has been going through a tough period with their mental health. I want to be supportive but sometimes feel helpless. Any advice on how to be there for someone you love?",
    author: {
      id: "user3",
      name: "Taylor W.",
      avatar:
        "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face",
    },
    category: "relationships",
    timestamp: new Date(Date.now() - 8 * 60 * 60 * 1000).toISOString(), // 8 hours ago
    likes: 18,
    isLiked: false,
    views: 156,
    isUrgent: false,
    comments: [],
  },
  {
    id: "4",
    title: "Career change anxiety - need encouragement",
    content:
      "I'm considering a major career change at 35, but I'm paralyzed by fear. Has anyone successfully pivoted careers later in life? How did you overcome the uncertainty?",
    author: {
      id: "user4",
      name: "Jordan P.",
      avatar:
        "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face",
    },
    category: "career",
    timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(), // 12 hours ago
    likes: 42,
    isLiked: true,
    views: 298,
    isUrgent: false,
    comments: [
      {
        id: "c4",
        content:
          "I made a career change at 38 and it was the best decision I ever made. The fear is normal, but don't let it stop you from pursuing what makes you happy.",
        author: {
          name: "Lisa M.",
          avatar:
            "https://images.unsplash.com/photo-1487412720507-e7ab37603c6f?w=150&h=150&fit=crop&crop=face",
        },
        timestamp: new Date(Date.now() - 10 * 60 * 60 * 1000).toISOString(),
        likes: 15,
        isLiked: false,
      },
    ],
  },
  {
    id: "5",
    title: "Struggling with family expectations",
    content:
      "My family has very high expectations for my life and career, but their vision doesn't align with what makes me happy. The pressure is affecting my mental health. How do I set boundaries?",
    author: {
      id: "user5",
      name: "Casey H.",
      avatar:
        "https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&h=150&fit=crop&crop=face",
    },
    category: "family",
    timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(), // 18 hours ago
    likes: 27,
    isLiked: false,
    views: 189,
    isUrgent: true,
    comments: [],
  },
];

// Utility Functions
export const formatTimeAgo = (timestamp: string): string => {
  const now = new Date();
  const postTime = new Date(timestamp);
  const diffInMinutes = Math.floor(
    (now.getTime() - postTime.getTime()) / (1000 * 60)
  );

  if (diffInMinutes < 1) return "Just now";
  if (diffInMinutes < 60) return `${diffInMinutes}m ago`;

  const diffInHours = Math.floor(diffInMinutes / 60);
  if (diffInHours < 24) return `${diffInHours}h ago`;

  const diffInDays = Math.floor(diffInHours / 24);
  if (diffInDays < 7) return `${diffInDays}d ago`;

  const diffInWeeks = Math.floor(diffInDays / 7);
  if (diffInWeeks < 4) return `${diffInWeeks}w ago`;

  const diffInMonths = Math.floor(diffInDays / 30);
  return `${diffInMonths}mo ago`;
};

export const getCategoryInfo = (categoryId: string): CommunityCategory => {
  return (
    COMMUNITY_CATEGORIES.find((cat) => cat.id === categoryId) ||
    COMMUNITY_CATEGORIES[0]
  );
};

export const filterDiscussions = (
  discussions: Discussion[],
  activeCategory?: string,
  searchTerm?: string
): Discussion[] => {
  let filtered = [...discussions];

  // Filter by category
  if (activeCategory && activeCategory !== "all") {
    filtered = filtered.filter(
      (discussion) => discussion.category === activeCategory
    );
  }

  // Filter by search term
  if (searchTerm && searchTerm.trim()) {
    const term = searchTerm.toLowerCase().trim();
    filtered = filtered.filter(
      (discussion) =>
        discussion.title.toLowerCase().includes(term) ||
        discussion.content.toLowerCase().includes(term) ||
        discussion.author.name.toLowerCase().includes(term)
    );
  }

  return filtered;
};

export const sortDiscussions = (
  discussions: Discussion[],
  sortBy: SortOption = "recent"
): Discussion[] => {
  const sorted = [...discussions];

  switch (sortBy) {
    case "recent":
      return sorted.sort(
        (a, b) =>
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
      );
    case "popular":
      return sorted.sort(
        (a, b) =>
          b.likes +
          (b.comments?.length || 0) * 2 -
          (a.likes + (a.comments?.length || 0) * 2)
      );
    case "mostCommented":
      return sorted.sort(
        (a, b) => (b.comments?.length || 0) - (a.comments?.length || 0)
      );
    case "urgent":
      return sorted.sort((a, b) => {
        if (a.isUrgent && !b.isUrgent) return -1;
        if (!a.isUrgent && b.isUrgent) return 1;
        return (
          new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
        );
      });
    default:
      return sorted;
  }
};

// Validation Functions
export const validatePostData = (
  title?: string,
  content?: string,
  category?: string
): ValidationResult => {
  const errors: ValidationErrors = {};

  if (!title || title.trim().length === 0) {
    errors.title = "Title is required";
  } else if (title.trim().length > 100) {
    errors.title = "Title must be less than 100 characters";
  }

  if (!content || content.trim().length === 0) {
    errors.content = "Content is required";
  } else if (content.trim().length > 1000) {
    errors.content = "Content must be less than 1000 characters";
  }

  if (!category) {
    errors.category = "Category is required";
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

// Crisis Resources
export const CRISIS_RESOURCES: CrisisResource[] = [
  {
    name: "National Suicide Prevention Lifeline",
    phone: "988",
    description: "24/7 crisis support",
    country: "US",
  },
  {
    name: "Crisis Text Line",
    phone: "Text HOME to 741741",
    description: "24/7 text-based crisis support",
    country: "US",
  },
  {
    name: "Samaritans",
    phone: "116 123",
    description: "24/7 emotional support",
    country: "UK",
  },
  {
    name: "International Association for Suicide Prevention",
    website: "https://www.iasp.info/resources/Crisis_Centres/",
    description: "Crisis centers worldwide",
    country: "International",
  },
];

// Community Guidelines
export const COMMUNITY_GUIDELINES: CommunityGuideline[] = [
  {
    title: "Be Respectful and Kind",
    description:
      "Treat all community members with respect and empathy. No harassment, discrimination, or hate speech.",
  },
  {
    title: "Share Constructively",
    description:
      "Share your experiences and insights to help others. Focus on support and encouragement.",
  },
  {
    title: "Protect Privacy",
    description:
      "Respect others' privacy and confidentiality. Don't share personal information without consent.",
  },
  {
    title: "Stay On Topic",
    description:
      "Keep discussions relevant to mental health and wellness topics.",
  },
  {
    title: "No Medical Advice",
    description:
      "Don't provide medical advice. Encourage professional help when appropriate.",
  },
  {
    title: "Report Concerns",
    description:
      "Report any concerning content or behavior to moderators immediately.",
  },
];

// Post Categories for Analytics
export const POST_ANALYTICS = {
  getEngagementScore: (discussion: Discussion): number => {
    const likes = discussion.likes || 0;
    const comments = discussion.comments?.length || 0;
    const views = discussion.views || 0;

    // Weighted score: likes worth 1, comments worth 3, views worth 0.1
    return likes + comments * 3 + views * 0.1;
  },

  getCategoryDistribution: (
    discussions: Discussion[]
  ): CategoryDistribution => {
    const distribution: CategoryDistribution = {};
    discussions.forEach((discussion) => {
      const category = discussion.category;
      distribution[category] = (distribution[category] || 0) + 1;
    });
    return distribution;
  },

  getPopularCategories: (
    discussions: Discussion[],
    limit: number = 5
  ): PopularCategory[] => {
    const distribution = POST_ANALYTICS.getCategoryDistribution(discussions);
    return Object.entries(distribution)
      .sort((a, b) => b[1] - a[1])
      .slice(0, limit)
      .map(([category, count]) => ({ category, count }));
  },
};

// Export default object with all utilities
const communityUtils = {
  COMMUNITY_CATEGORIES,
  //   SAMPLE_DISCUSSIONS,
  initialDiscussions,
  CRISIS_RESOURCES,
  COMMUNITY_GUIDELINES,
  formatTimeAgo,
  getCategoryInfo,
  filterDiscussions,
  sortDiscussions,
  validatePostData,
  POST_ANALYTICS,
};

export default communityUtils;

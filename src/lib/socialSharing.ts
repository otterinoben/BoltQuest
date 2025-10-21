import { awardCoinsForSocialShare } from './coinSystem';
import { getUserProfile } from './userStorage';

export interface ShareData {
  score?: number;
  streak?: number;
  level?: number;
  achievement?: string;
  gameMode?: string;
  difficulty?: string;
  category?: string;
  accuracy?: number;
  mode?: string; // Add mode property
}

export interface ShareResult {
  success: boolean;
  message: string;
  coinsAwarded?: number;
}

// Social sharing URLs
const SOCIAL_URLS = {
  twitter: 'https://twitter.com/intent/tweet',
  linkedin: 'https://www.linkedin.com/sharing/share-offsite/',
  facebook: 'https://www.facebook.com/sharer/sharer.php',
  discord: 'https://discord.gg/buzzbolt' // Placeholder
};

// Share message templates
const SHARE_TEMPLATES = {
  score: {
    twitter: "Just scored {score} points in BuzzBolt! 🚀 Can you beat my score? #BuzzBolt #QuizGame",
    linkedin: "Achieved a score of {score} points in BuzzBolt! Sharpening my knowledge skills. #Learning #QuizGame #BuzzBolt",
    facebook: "Check out my BuzzBolt score: {score} points! Think you can do better? 🧠✨"
  },
  streak: {
    twitter: "On fire! 🔥 Just hit a {streak} streak in BuzzBolt! My brain is buzzing! #BuzzBolt #Streak",
    linkedin: "Maintained a {streak} question streak in BuzzBolt! Consistency is key to learning. #Learning #BuzzBolt",
    facebook: "Streak alert! 🎯 {streak} questions in a row on BuzzBolt! Who's up for the challenge?"
  },
  achievement: {
    twitter: "Achievement unlocked! 🏆 {achievement} in BuzzBolt! Leveling up my knowledge game! #BuzzBolt #Achievement",
    linkedin: "Proud to announce: {achievement} achievement unlocked in BuzzBolt! Continuous learning pays off. #BuzzBolt #ProfessionalDevelopment",
    facebook: "Achievement unlocked! 🎉 {achievement} in BuzzBolt! Celebrating small wins! 🏆"
  },
  level: {
    twitter: "Level up! 🚀 Just reached level {level} in BuzzBolt! Knowledge is power! #BuzzBolt #LevelUp",
    linkedin: "Reached level {level} in BuzzBolt! Continuous learning and skill development in action. #BuzzBolt #ProfessionalGrowth",
    facebook: "Level up! ⬆️ Now at level {level} in BuzzBolt! Who's ready to challenge me? 🧠"
  }
};

// Format share message
const formatShareMessage = (template: string, data: ShareData): string => {
  return template
    .replace('{score}', data.score?.toString() || '0')
    .replace('{streak}', data.streak?.toString() || '0')
    .replace('{level}', data.level?.toString() || '1')
    .replace('{achievement}', data.achievement || 'Achievement')
    .replace('{gameMode}', data.gameMode || 'Classic')
    .replace('{difficulty}', data.difficulty || 'Medium')
    .replace('{category}', data.category || 'General');
};

// Share to Twitter
export const shareToTwitter = (data: ShareData): ShareResult => {
  try {
    let message = '';
    
    if (data.score) {
      message = formatShareMessage(SHARE_TEMPLATES.score.twitter, data);
    } else if (data.streak) {
      message = formatShareMessage(SHARE_TEMPLATES.streak.twitter, data);
    } else if (data.achievement) {
      message = formatShareMessage(SHARE_TEMPLATES.achievement.twitter, data);
    } else if (data.level) {
      message = formatShareMessage(SHARE_TEMPLATES.level.twitter, data);
    } else {
      message = "Just had an amazing session on BuzzBolt! 🚀 Test your knowledge at buzzbolt.app #BuzzBolt #QuizGame";
    }

    const url = `${SOCIAL_URLS.twitter}?text=${encodeURIComponent(message)}&url=${encodeURIComponent('https://buzzbolt.app')}`;
    
    // Open in new window
    window.open(url, '_blank', 'width=600,height=400');
    
    // Award coins for sharing
    const coinsAwarded = awardCoinsForSocialShare('Twitter');
    
    return {
      success: true,
      message: 'Shared to Twitter successfully!',
      coinsAwarded: coinsAwarded ? 50 : 0
    };
  } catch (error) {
    console.error('Error sharing to Twitter:', error);
    return {
      success: false,
      message: 'Failed to share to Twitter'
    };
  }
};

// Share to LinkedIn
export const shareToLinkedIn = (data: ShareData): ShareResult => {
  try {
    let message = '';
    
    if (data.score) {
      message = formatShareMessage(SHARE_TEMPLATES.score.linkedin, data);
    } else if (data.streak) {
      message = formatShareMessage(SHARE_TEMPLATES.streak.linkedin, data);
    } else if (data.achievement) {
      message = formatShareMessage(SHARE_TEMPLATES.achievement.linkedin, data);
    } else if (data.level) {
      message = formatShareMessage(SHARE_TEMPLATES.level.linkedin, data);
    } else {
      message = "Enhancing my knowledge skills with BuzzBolt! A great platform for continuous learning. Check it out at buzzbolt.app #Learning #ProfessionalDevelopment";
    }

    // LinkedIn sharing - use the newer sharing format
    const url = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent('https://buzzbolt.app')}`;
    
    // Open in new window
    window.open(url, '_blank', 'width=600,height=400');
    
    // Show a toast with the message they can copy/paste
    setTimeout(() => {
      console.log('LinkedIn share message:', message);
    }, 1000);
    
    // Award coins for sharing
    const coinsAwarded = awardCoinsForSocialShare('LinkedIn');
    
    return {
      success: true,
      message: 'Shared to LinkedIn successfully!',
      coinsAwarded: coinsAwarded ? 50 : 0
    };
  } catch (error) {
    console.error('Error sharing to LinkedIn:', error);
    return {
      success: false,
      message: 'Failed to share to LinkedIn'
    };
  }
};

// Share to Facebook
export const shareToFacebook = (data: ShareData): ShareResult => {
  try {
    let message = '';
    
    if (data.score) {
      message = formatShareMessage(SHARE_TEMPLATES.score.facebook, data);
    } else if (data.streak) {
      message = formatShareMessage(SHARE_TEMPLATES.streak.facebook, data);
    } else if (data.achievement) {
      message = formatShareMessage(SHARE_TEMPLATES.achievement.facebook, data);
    } else if (data.level) {
      message = formatShareMessage(SHARE_TEMPLATES.level.facebook, data);
    } else {
      message = "Just discovered BuzzBolt - an amazing quiz game! Test your knowledge and challenge your friends! 🧠✨";
    }

    // Facebook sharing - use a simpler, more reliable method
    // Facebook's sharing API is limited, but we can use the basic sharer
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent('https://buzzbolt.app')}`;
    
    // Open in new window
    window.open(url, '_blank', 'width=600,height=400');
    
    // Show a toast with the message they can copy/paste
    setTimeout(() => {
      // This will be handled by the component's toast system
      console.log('Facebook share message:', message);
    }, 1000);
    
    // Award coins for sharing
    const coinsAwarded = awardCoinsForSocialShare('Facebook');
    
    return {
      success: true,
      message: 'Shared to Facebook successfully!',
      coinsAwarded: coinsAwarded ? 50 : 0
    };
  } catch (error) {
    console.error('Error sharing to Facebook:', error);
    return {
      success: false,
      message: 'Failed to share to Facebook'
    };
  }
};

// Generate shareable image (placeholder for future implementation)
export const generateShareImage = (data: ShareData): string => {
  // This would generate a custom image with the user's score/achievement
  // For now, return a placeholder URL
  return `https://via.placeholder.com/600x400/10b981/ffffff?text=BuzzBolt+Score:+${data.score || 'Amazing!'}`;
};

// Quick share function that determines the best platform based on data
export const quickShare = (data: ShareData, platform?: 'twitter' | 'linkedin' | 'facebook'): ShareResult => {
  if (platform) {
    switch (platform) {
      case 'twitter':
        return shareToTwitter(data);
      case 'linkedin':
        return shareToLinkedIn(data);
      case 'facebook':
        return shareToFacebook(data);
      default:
        return shareToTwitter(data);
    }
  }

  // Auto-select platform based on data type
  if (data.achievement || data.level) {
    return shareToLinkedIn(data); // Professional achievements
  } else if (data.streak) {
    return shareToTwitter(data); // Fun streaks
  } else {
    return shareToFacebook(data); // General sharing
  }
};

// Get share statistics
export const getShareStats = (): { platform: string; count: number }[] => {
  try {
    const profile = getUserProfile();
    const coinHistory = profile?.coinHistory || [];
    
    const shareCounts: { [platform: string]: number } = {};
    
    coinHistory.forEach(transaction => {
      if (transaction.source === 'social' && transaction.metadata?.socialPlatform) {
        const platform = transaction.metadata.socialPlatform;
        shareCounts[platform] = (shareCounts[platform] || 0) + 1;
      }
    });
    
    return Object.entries(shareCounts).map(([platform, count]) => ({
      platform,
      count
    }));
  } catch (error) {
    console.error('Error getting share stats:', error);
    return [];
  }
};

// Check if user has shared recently (to prevent spam)
export const canShare = (platform: string): boolean => {
  try {
    const profile = getUserProfile();
    const coinHistory = profile?.coinHistory || [];
    
    const recentShares = coinHistory.filter(transaction => 
      transaction.source === 'social' && 
      transaction.metadata?.socialPlatform === platform &&
      transaction.timestamp > Date.now() - (24 * 60 * 60 * 1000) // 24 hours
    );
    
    return recentShares.length < 3; // Max 3 shares per platform per day
  } catch (error) {
    console.error('Error checking share eligibility:', error);
    return true;
  }
};


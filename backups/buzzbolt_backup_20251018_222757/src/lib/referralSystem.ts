import { getUserProfile, saveUserProfile } from './userStorage';
import { awardCoinsForReferralSignup } from './coinSystem';

export interface ReferralData {
  code: string;
  userId: string;
  createdAt: number;
  totalReferrals: number;
  successfulReferrals: number;
  totalCoinsEarned: number;
}

export interface ReferralStats {
  totalReferrals: number;
  successfulReferrals: number;
  pendingReferrals: number;
  totalCoinsEarned: number;
  conversionRate: number;
}

const REFERRAL_STORAGE_KEY = 'buzzbolt_referral_data';

// Generate unique referral code
const generateReferralCode = (userId: string): string => {
  const timestamp = Date.now().toString(36);
  const random = Math.random().toString(36).substr(2, 5);
  return `${userId.substr(0, 3)}${timestamp}${random}`.toUpperCase();
};

// Get or create referral data for user
export const getReferralData = (): ReferralData => {
  try {
    const profile = getUserProfile();
    if (!profile) {
      throw new Error('No user profile found');
    }

    const stored = localStorage.getItem(REFERRAL_STORAGE_KEY);
    if (stored) {
      const data = JSON.parse(stored);
      if (data.userId === profile.id) {
        return data;
      }
    }

    // Create new referral data
    const referralData: ReferralData = {
      code: generateReferralCode(profile.id),
      userId: profile.id,
      createdAt: Date.now(),
      totalReferrals: 0,
      successfulReferrals: 0,
      totalCoinsEarned: 0
    };

    saveReferralData(referralData);
    return referralData;
  } catch (error) {
    console.error('Error getting referral data:', error);
    return {
      code: 'ERROR',
      userId: 'anonymous',
      createdAt: Date.now(),
      totalReferrals: 0,
      successfulReferrals: 0,
      totalCoinsEarned: 0
    };
  }
};

// Save referral data
export const saveReferralData = (data: ReferralData): void => {
  try {
    localStorage.setItem(REFERRAL_STORAGE_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving referral data:', error);
  }
};

// Process referral signup
export const processReferralSignup = (referralCode: string, newUserId: string): boolean => {
  try {
    // Find the referrer
    const allReferralData = getAllReferralData();
    const referrerData = allReferralData.find(data => data.code === referralCode);
    
    if (!referrerData) {
      console.log('Referral code not found:', referralCode);
      return false;
    }

    // Check if this user was already referred
    const existingReferral = getReferralByUserId(newUserId);
    if (existingReferral) {
      console.log('User already has referral data');
      return false;
    }

    // Update referrer's stats
    referrerData.totalReferrals += 1;
    referrerData.successfulReferrals += 1;
    referrerData.totalCoinsEarned += 200; // 200 coins per successful referral

    // Award coins to referrer
    const coinsAwarded = awardCoinsForReferralSignup(referralCode);
    if (coinsAwarded) {
      saveReferralData(referrerData);
    }

    // Create referral record for new user
    const newUserReferral: ReferralData = {
      code: generateReferralCode(newUserId),
      userId: newUserId,
      createdAt: Date.now(),
      totalReferrals: 0,
      successfulReferrals: 0,
      totalCoinsEarned: 0
    };

    saveReferralData(newUserReferral);

    return true;
  } catch (error) {
    console.error('Error processing referral signup:', error);
    return false;
  }
};

// Get referral link
export const getReferralLink = (): string => {
  const referralData = getReferralData();
  return `${window.location.origin}?ref=${referralData.code}`;
};

// Get referral stats
export const getReferralStats = (): ReferralStats => {
  const referralData = getReferralData();
  
  return {
    totalReferrals: referralData.totalReferrals,
    successfulReferrals: referralData.successfulReferrals,
    pendingReferrals: referralData.totalReferrals - referralData.successfulReferrals,
    totalCoinsEarned: referralData.totalCoinsEarned,
    conversionRate: referralData.totalReferrals > 0 
      ? (referralData.successfulReferrals / referralData.totalReferrals) * 100 
      : 0
  };
};

// Get all referral data (for leaderboard)
export const getAllReferralData = (): ReferralData[] => {
  try {
    // This would typically come from a server
    // For now, we'll return just the current user's data
    return [getReferralData()];
  } catch (error) {
    console.error('Error getting all referral data:', error);
    return [];
  }
};

// Get referral by user ID
export const getReferralByUserId = (userId: string): ReferralData | null => {
  try {
    const allData = getAllReferralData();
    return allData.find(data => data.userId === userId) || null;
  } catch (error) {
    console.error('Error getting referral by user ID:', error);
    return null;
  }
};

// Check if referral code is valid
export const isValidReferralCode = (code: string): boolean => {
  try {
    const allData = getAllReferralData();
    return allData.some(data => data.code === code);
  } catch (error) {
    console.error('Error validating referral code:', error);
    return false;
  }
};

// Get top referrers (for leaderboard)
export const getTopReferrers = (limit: number = 10): ReferralData[] => {
  try {
    const allData = getAllReferralData();
    return allData
      .sort((a, b) => b.successfulReferrals - a.successfulReferrals)
      .slice(0, limit);
  } catch (error) {
    console.error('Error getting top referrers:', error);
    return [];
  }
};

// Copy referral link to clipboard
export const copyReferralLink = async (): Promise<boolean> => {
  try {
    const link = getReferralLink();
    await navigator.clipboard.writeText(link);
    return true;
  } catch (error) {
    console.error('Error copying referral link:', error);
    return false;
  }
};

// Generate referral invitation message
export const generateInvitationMessage = (): string => {
  const referralData = getReferralData();
  
  return `🚀 Join me on BuzzBolt - the ultimate quiz game! 

Test your knowledge, compete with friends, and level up your skills! 

Use my referral code: ${referralData.code}
Or click this link: ${getReferralLink()}

Let's see who's smarter! 🧠✨

#BuzzBolt #QuizGame #Learning`;
};

// Share referral link
export const shareReferralLink = (platform: 'twitter' | 'linkedin' | 'facebook'): boolean => {
  try {
    const message = generateInvitationMessage();
    const link = getReferralLink();
    
    let shareUrl = '';
    
    switch (platform) {
      case 'twitter':
        shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(message)}`;
        break;
      case 'linkedin':
        shareUrl = `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(link)}&summary=${encodeURIComponent(message)}`;
        break;
      case 'facebook':
        shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(link)}&quote=${encodeURIComponent(message)}`;
        break;
    }
    
    window.open(shareUrl, '_blank', 'width=600,height=400');
    return true;
  } catch (error) {
    console.error('Error sharing referral link:', error);
    return false;
  }
};

// Track referral click (when someone clicks the link)
export const trackReferralClick = (referralCode: string): void => {
  try {
    const allData = getAllReferralData();
    const referrerData = allData.find(data => data.code === referralCode);
    
    if (referrerData) {
      referrerData.totalReferrals += 1;
      saveReferralData(referrerData);
    }
  } catch (error) {
    console.error('Error tracking referral click:', error);
  }
};


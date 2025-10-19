import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Twitter, 
  Linkedin, 
  Instagram, 
  MessageCircle, 
  ExternalLink, 
  Check,
  Coins,
  Users
} from 'lucide-react';
import { awardCoinsForSocialFollow } from '@/lib/coinSystem';
import { getUserProfile } from '@/lib/userStorage';
import { toast } from 'sonner';

interface SocialPlatform {
  id: string;
  name: string;
  icon: React.ComponentType<{ className?: string }>;
  url: string;
  description: string;
  color: string;
  coinsReward: number;
}

const SOCIAL_PLATFORMS: SocialPlatform[] = [
  {
    id: 'twitter',
    name: 'Twitter',
    icon: Twitter,
    url: 'https://twitter.com/buzzbolt_app',
    description: 'Follow us for daily quizzes, tips, and community updates',
    color: 'bg-blue-500',
    coinsReward: 25
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    icon: Linkedin,
    url: 'https://linkedin.com/company/buzzbolt',
    description: 'Professional insights and learning resources',
    color: 'bg-blue-700',
    coinsReward: 25
  },
  {
    id: 'instagram',
    name: 'Instagram',
    icon: Instagram,
    url: 'https://instagram.com/buzzbolt_app',
    description: 'Visual content and behind-the-scenes updates',
    color: 'bg-pink-500',
    coinsReward: 25
  },
  {
    id: 'discord',
    name: 'Discord',
    icon: MessageCircle,
    url: 'https://discord.gg/buzzbolt',
    description: 'Join our community for discussions and events',
    color: 'bg-indigo-500',
    coinsReward: 25
  }
];

const SocialConnect: React.FC = () => {
  const [followedPlatforms, setFollowedPlatforms] = useState<string[]>([]);
  const [coinBalance, setCoinBalance] = useState(0);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = () => {
    const profile = getUserProfile();
    if (profile) {
      // Check which platforms user has followed (stored in coin history)
      const coinHistory = profile.coinHistory || [];
      const socialFollows = coinHistory
        .filter(transaction => 
          transaction.source === 'social' && 
          transaction.description.includes('Followed')
        )
        .map(transaction => transaction.metadata?.socialPlatform)
        .filter(Boolean) as string[];
      
      setFollowedPlatforms(socialFollows);
      setCoinBalance(profile.coins || 0);
    }
  };

  const handleFollowClick = async (platform: SocialPlatform) => {
    try {
      // Open platform in new tab
      window.open(platform.url, '_blank');
      
      // Check if already followed
      if (followedPlatforms.includes(platform.id)) {
        toast.info('Already Followed!', {
          description: `You've already followed ${platform.name} and received your coins!`,
        });
        return;
      }

      // Award coins for following
      const coinsAwarded = awardCoinsForSocialFollow(platform.name);
      
      if (coinsAwarded) {
        setFollowedPlatforms(prev => [...prev, platform.id]);
        setCoinBalance(prev => prev + platform.coinsReward);
        
        toast.success('Coins Earned!', {
          description: `+${platform.coinsReward} coins for following ${platform.name}!`,
        });
      }
    } catch (error) {
      console.error('Error handling follow click:', error);
      toast.error('Error', {
        description: 'Failed to process follow action.',
      });
    }
  };

  const isFollowed = (platformId: string): boolean => {
    return followedPlatforms.includes(platformId);
  };

  const getTotalCoinsAvailable = (): number => {
    return SOCIAL_PLATFORMS.reduce((total, platform) => {
      return total + (isFollowed(platform.id) ? 0 : platform.coinsReward);
    }, 0);
  };

  const getFollowedCount = (): number => {
    return followedPlatforms.length;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="text-center">
        <h2 className="text-2xl font-bold text-black mb-2">Connect With Us</h2>
        <p className="text-gray-600 mb-4">
          Follow our social media platforms and earn coins for staying connected!
        </p>
        
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">{getFollowedCount()}</div>
            <div className="text-sm text-gray-600">Platforms Followed</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">{getTotalCoinsAvailable()}</div>
            <div className="text-sm text-gray-600">Coins Available</div>
          </div>
        </div>
      </div>

      {/* Social Platforms Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SOCIAL_PLATFORMS.map((platform) => {
          const IconComponent = platform.icon;
          const followed = isFollowed(platform.id);
          
          return (
            <Card 
              key={platform.id} 
              className={`transition-all duration-200 hover:shadow-lg ${
                followed ? 'ring-2 ring-green-500 bg-green-50' : 'hover:shadow-md'
              }`}
            >
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${platform.color} text-white`}>
                      <IconComponent className="w-6 h-6" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{platform.name}</CardTitle>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">
                          <Coins className="w-3 h-3 mr-1" />
                          {platform.coinsReward} coins
                        </Badge>
                        {followed && (
                          <Badge variant="secondary" className="bg-green-100 text-green-800">
                            <Check className="w-3 h-3 mr-1" />
                            Followed
                          </Badge>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </CardHeader>
              
              <CardContent>
                <CardDescription className="mb-4">
                  {platform.description}
                </CardDescription>
                
                <div className="flex gap-2">
                  <Button
                    onClick={() => handleFollowClick(platform)}
                    className={`flex-1 ${
                      followed 
                        ? 'bg-green-600 hover:bg-green-700' 
                        : 'bg-blue-600 hover:bg-blue-700'
                    }`}
                    disabled={followed}
                  >
                    {followed ? (
                      <>
                        <Check className="w-4 h-4 mr-2" />
                        Followed
                      </>
                    ) : (
                      <>
                        <ExternalLink className="w-4 h-4 mr-2" />
                        Follow & Earn Coins
                      </>
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Community Benefits */}
      <Card className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-blue-800">
            <Users className="w-5 h-5" />
            Community Benefits
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">What You Get:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• Daily quiz challenges</li>
                <li>• Exclusive tips and strategies</li>
                <li>• Early access to new features</li>
                <li>• Community discussions</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-blue-800 mb-2">Coin Rewards:</h4>
              <ul className="text-sm text-blue-700 space-y-1">
                <li>• 25 coins per platform followed</li>
                <li>• Bonus coins for community participation</li>
                <li>• Special event rewards</li>
                <li>• Referral bonuses</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Call to Action */}
      {getTotalCoinsAvailable() > 0 && (
        <Alert>
          <Coins className="h-4 w-4" />
          <AlertDescription>
            <strong>Don't miss out!</strong> You can still earn {getTotalCoinsAvailable()} coins by following our remaining social platforms. 
            Use these coins in the shop to unlock premium features and customization options!
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
};

export default SocialConnect;


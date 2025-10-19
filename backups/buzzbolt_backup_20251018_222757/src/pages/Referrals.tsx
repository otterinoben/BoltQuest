import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  Users, 
  Copy, 
  Share2, 
  Coins, 
  TrendingUp, 
  CheckCircle,
  ExternalLink,
  MessageCircle,
  Twitter,
  Linkedin,
  Facebook
} from 'lucide-react';
import { 
  getReferralData, 
  getReferralStats, 
  getReferralLink, 
  copyReferralLink, 
  generateInvitationMessage,
  shareReferralLink,
  getTopReferrers
} from '@/lib/referralSystem';
import { toast } from 'sonner';

const Referrals: React.FC = () => {
  const [referralData, setReferralData] = useState(getReferralData());
  const [referralStats, setReferralStats] = useState(getReferralStats());
  const [referralLink, setReferralLink] = useState('');
  const [topReferrers, setTopReferrers] = useState(getTopReferrers());

  useEffect(() => {
    loadReferralData();
  }, []);

  const loadReferralData = () => {
    setReferralData(getReferralData());
    setReferralStats(getReferralStats());
    setReferralLink(getReferralLink());
    setTopReferrers(getTopReferrers());
  };

  const handleCopyLink = async () => {
    const success = await copyReferralLink();
    if (success) {
      toast.success('Link Copied!', {
        description: 'Your referral link has been copied to clipboard.',
      });
    } else {
      toast.error('Failed to Copy', {
        description: 'Could not copy the link. Please try again.',
      });
    }
  };

  const handleShareToSocial = (platform: 'twitter' | 'linkedin' | 'facebook') => {
    const success = shareReferralLink(platform);
    if (success) {
      toast.success('Shared!', {
        description: `Your referral link has been shared to ${platform}.`,
      });
    } else {
      toast.error('Share Failed', {
        description: 'Could not share the link. Please try again.',
      });
    }
  };

  const getConversionRateColor = (rate: number) => {
    if (rate >= 80) return 'text-green-600';
    if (rate >= 60) return 'text-yellow-600';
    if (rate >= 40) return 'text-orange-600';
    return 'text-red-600';
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Referral Program</h1>
        <p className="text-gray-600">
          Invite friends to join BuzzBolt and earn coins for every successful referral!
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-blue-700">{referralStats.totalReferrals}</div>
                <div className="text-sm text-blue-600">Total Referrals</div>
              </div>
              <Users className="w-8 h-8 text-blue-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-green-700">{referralStats.successfulReferrals}</div>
                <div className="text-sm text-green-600">Successful</div>
              </div>
              <CheckCircle className="w-8 h-8 text-green-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-yellow-50 to-yellow-100 border-yellow-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className="text-2xl font-bold text-yellow-700">{referralStats.totalCoinsEarned}</div>
                <div className="text-sm text-yellow-600">Coins Earned</div>
              </div>
              <Coins className="w-8 h-8 text-yellow-500" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <div className={`text-2xl font-bold ${getConversionRateColor(referralStats.conversionRate)}`}>
                  {(referralStats.conversionRate || 0).toFixed(1)}%
                </div>
                <div className="text-sm text-purple-600">Conversion Rate</div>
              </div>
              <TrendingUp className="w-8 h-8 text-purple-500" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Your Referral Code */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="w-5 h-5" />
              Your Referral Code
            </CardTitle>
            <CardDescription>
              Share this code with friends to earn 200 coins for each successful referral
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="bg-gray-50 p-4 rounded-lg">
              <div className="text-center">
                <div className="text-2xl font-bold text-gray-900 mb-2">{referralData.code}</div>
                <div className="text-sm text-gray-600">Your unique referral code</div>
              </div>
            </div>

            <div className="space-y-2">
              <Button 
                onClick={handleCopyLink}
                className="w-full bg-blue-600 hover:bg-blue-700"
              >
                <Copy className="w-4 h-4 mr-2" />
                Copy Referral Link
              </Button>
              
              <div className="text-xs text-gray-500 text-center">
                Link: {referralLink}
              </div>
            </div>

            {/* Social Sharing */}
            <div className="space-y-3">
              <div className="text-sm font-medium text-gray-700">Share on social media:</div>
              <div className="grid grid-cols-3 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareToSocial('twitter')}
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Twitter className="w-4 h-4 mr-1" />
                  Twitter
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareToSocial('linkedin')}
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Linkedin className="w-4 h-4 mr-1" />
                  LinkedIn
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleShareToSocial('facebook')}
                  className="bg-blue-50 border-blue-200 text-blue-700 hover:bg-blue-100"
                >
                  <Facebook className="w-4 h-4 mr-1" />
                  Facebook
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* How It Works */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <MessageCircle className="w-5 h-5" />
              How It Works
            </CardTitle>
            <CardDescription>
              Simple steps to start earning referral rewards
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-3">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  1
                </div>
                <div>
                  <div className="font-medium text-gray-900">Share Your Code</div>
                  <div className="text-sm text-gray-600">Copy your referral link or code and share it with friends</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  2
                </div>
                <div>
                  <div className="font-medium text-gray-900">Friend Signs Up</div>
                  <div className="text-sm text-gray-600">Your friend creates an account using your referral code</div>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-bold">
                  3
                </div>
                <div>
                  <div className="font-medium text-gray-900">Earn Coins</div>
                  <div className="text-sm text-gray-600">You receive 200 coins for each successful referral!</div>
                </div>
              </div>
            </div>

            <Alert>
              <Coins className="h-4 w-4" />
              <AlertDescription>
                <strong>Bonus:</strong> Your friends also get a welcome bonus when they sign up with your code!
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>

      {/* Referral Leaderboard */}
      {topReferrers.length > 1 && (
        <Card className="mt-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="w-5 h-5" />
              Top Referrers
            </CardTitle>
            <CardDescription>
              See who's leading the referral program
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {topReferrers.slice(0, 5).map((referrer, index) => (
                <div key={referrer.userId} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
                      index === 0 ? 'bg-yellow-100 text-yellow-700' :
                      index === 1 ? 'bg-gray-100 text-gray-700' :
                      index === 2 ? 'bg-orange-100 text-orange-700' :
                      'bg-blue-100 text-blue-700'
                    }`}>
                      {index + 1}
                    </div>
                    <div>
                      <div className="font-medium text-gray-900">
                        {referrer.userId === referralData.userId ? 'You' : `User ${referrer.userId.substr(0, 8)}`}
                      </div>
                      <div className="text-sm text-gray-600">
                        {referrer.successfulReferrals} successful referrals
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="font-bold text-green-600">{referrer.totalCoinsEarned}</div>
                    <div className="text-sm text-gray-600">coins earned</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Tips for Success */}
      <Card className="mt-8 bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
        <CardHeader>
          <CardTitle className="text-green-800">Tips for Referral Success</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h4 className="font-semibold text-green-800 mb-2">Best Practices:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Share with friends who love quizzes</li>
                <li>• Post on social media regularly</li>
                <li>• Include personal recommendations</li>
                <li>• Follow up with friends who signed up</li>
              </ul>
            </div>
            <div>
              <h4 className="font-semibold text-green-800 mb-2">What to Share:</h4>
              <ul className="text-sm text-green-700 space-y-1">
                <li>• Your high scores and achievements</li>
                <li>• Fun quiz categories you enjoy</li>
                <li>• Daily challenges and streaks</li>
                <li>• Community features and competitions</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Referrals;


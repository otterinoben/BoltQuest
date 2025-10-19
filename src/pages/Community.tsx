import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { 
  MessageCircle, 
  Twitter, 
  Linkedin, 
  Instagram, 
  ExternalLink, 
  Users, 
  Coins,
  Calendar,
  Trophy,
  Zap
} from 'lucide-react';
import SocialConnect from '@/components/SocialConnect';
import { toast } from 'sonner';

const Community: React.FC = () => {
  const handleSocialClick = (platform: string, url: string) => {
    window.open(url, '_blank');
    toast.success(`Opening ${platform}`, {
      description: 'Thanks for connecting with our community!',
    });
  };

  const communityStats = {
    discordMembers: '2,500+',
    twitterFollowers: '1,200+',
    linkedinFollowers: '800+',
    instagramFollowers: '950+',
    totalCommunity: '5,450+'
  };

  const upcomingEvents = [
    {
      id: 1,
      title: 'Weekly Quiz Championship',
      date: 'Every Sunday',
      time: '7:00 PM EST',
      description: 'Compete with community members for the highest score',
      reward: '500 coins + exclusive badge',
      type: 'tournament'
    },
    {
      id: 2,
      title: 'Knowledge Sharing Session',
      date: 'Every Wednesday',
      time: '6:00 PM EST',
      description: 'Learn tips and strategies from top players',
      reward: '100 coins + XP bonus',
      type: 'learning'
    },
    {
      id: 3,
      title: 'Community Challenge',
      date: 'Monthly',
      time: 'All day',
      description: 'Special themed quizzes with unique rewards',
      reward: '1000 coins + legendary badge',
      type: 'special'
    }
  ];

  const communityBenefits = [
    {
      icon: <Trophy className="w-5 h-5 text-yellow-500" />,
      title: 'Exclusive Competitions',
      description: 'Join tournaments and challenges only available to community members'
    },
    {
      icon: <Zap className="w-5 h-5 text-blue-500" />,
      title: 'Early Access',
      description: 'Get first access to new features, categories, and game modes'
    },
    {
      icon: <Coins className="w-5 h-5 text-green-500" />,
      title: 'Bonus Rewards',
      description: 'Earn extra coins and XP for community participation'
    },
    {
      icon: <Users className="w-5 h-5 text-purple-500" />,
      title: 'Connect & Learn',
      description: 'Share strategies and learn from other quiz enthusiasts'
    }
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      {/* Header */}
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold text-black mb-2">Join Our Community</h1>
        <p className="text-gray-600 mb-4">
          Connect with fellow quiz enthusiasts, participate in events, and earn exclusive rewards!
        </p>
        
        <div className="flex items-center justify-center gap-6 mb-6">
          <div className="text-center">
            <div className="text-2xl font-bold text-blue-600">{communityStats.totalCommunity}</div>
            <div className="text-sm text-gray-600">Community Members</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-green-600">3</div>
            <div className="text-sm text-gray-600">Weekly Events</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-yellow-600">500+</div>
            <div className="text-sm text-gray-600">Coins Available</div>
          </div>
        </div>
      </div>

      {/* Social Connect Component */}
      <div className="mb-8">
        <SocialConnect />
      </div>

      {/* Community Platforms */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-indigo-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <MessageCircle className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Discord</h3>
            <p className="text-sm text-gray-600 mb-3">{communityStats.discordMembers} members</p>
            <Button 
              size="sm" 
              className="w-full bg-indigo-600 hover:bg-indigo-700"
              onClick={() => handleSocialClick('Discord', 'https://discord.gg/buzzbolt')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Join Server
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Twitter className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Twitter</h3>
            <p className="text-sm text-gray-600 mb-3">{communityStats.twitterFollowers} followers</p>
            <Button 
              size="sm" 
              className="w-full bg-blue-600 hover:bg-blue-700"
              onClick={() => handleSocialClick('Twitter', 'https://twitter.com/buzzbolt_app')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Follow Us
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-blue-700 rounded-full flex items-center justify-center mx-auto mb-3">
              <Linkedin className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">LinkedIn</h3>
            <p className="text-sm text-gray-600 mb-3">{communityStats.linkedinFollowers} followers</p>
            <Button 
              size="sm" 
              className="w-full bg-blue-700 hover:bg-blue-800"
              onClick={() => handleSocialClick('LinkedIn', 'https://linkedin.com/company/buzzbolt')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Connect
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all duration-200 cursor-pointer">
          <CardContent className="p-4 text-center">
            <div className="w-12 h-12 bg-pink-500 rounded-full flex items-center justify-center mx-auto mb-3">
              <Instagram className="w-6 h-6 text-white" />
            </div>
            <h3 className="font-semibold text-gray-900 mb-1">Instagram</h3>
            <p className="text-sm text-gray-600 mb-3">{communityStats.instagramFollowers} followers</p>
            <Button 
              size="sm" 
              className="w-full bg-pink-600 hover:bg-pink-700"
              onClick={() => handleSocialClick('Instagram', 'https://instagram.com/buzzbolt_app')}
            >
              <ExternalLink className="w-4 h-4 mr-1" />
              Follow Us
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Upcoming Events */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5" />
            Upcoming Events
          </CardTitle>
          <CardDescription>
            Join our community events and earn exclusive rewards
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {upcomingEvents.map((event) => (
              <div key={event.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-4">
                  <div className={`w-12 h-12 rounded-full flex items-center justify-center ${
                    event.type === 'tournament' ? 'bg-yellow-100' :
                    event.type === 'learning' ? 'bg-blue-100' :
                    'bg-purple-100'
                  }`}>
                    {event.type === 'tournament' ? <Trophy className="w-6 h-6 text-yellow-600" /> :
                     event.type === 'learning' ? <Zap className="w-6 h-6 text-blue-600" /> :
                     <Calendar className="w-6 h-6 text-purple-600" />}
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900">{event.title}</h3>
                    <p className="text-sm text-gray-600">{event.description}</p>
                    <div className="flex items-center gap-4 mt-1">
                      <span className="text-xs text-gray-500">{event.date}</span>
                      <span className="text-xs text-gray-500">{event.time}</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <Badge variant="secondary" className="bg-green-100 text-green-800 mb-1">
                    <Coins className="w-3 h-3 mr-1" />
                    {event.reward}
                  </Badge>
                  <Button size="sm" variant="outline">
                    Learn More
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Community Benefits */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Why Join Our Community?</CardTitle>
            <CardDescription>
              Exclusive benefits for active community members
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {communityBenefits.map((benefit, index) => (
                <div key={index} className="flex items-start gap-3">
                  {benefit.icon}
                  <div>
                    <h4 className="font-semibold text-gray-900">{benefit.title}</h4>
                    <p className="text-sm text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Community Guidelines</CardTitle>
            <CardDescription>
              Help us maintain a positive environment
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-sm text-gray-700">Be respectful and supportive of all members</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-sm text-gray-700">Share knowledge and help others improve</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-sm text-gray-700">Participate actively in discussions and events</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-sm text-gray-700">Report any inappropriate behavior</span>
              </div>
              <div className="flex items-start gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full mt-2"></div>
                <span className="text-sm text-gray-700">Have fun and celebrate achievements together</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Call to Action */}
      <Alert className="bg-gradient-to-r from-blue-50 to-indigo-50 border-blue-200">
        <Users className="h-4 w-4" />
        <AlertDescription>
          <strong>Ready to join?</strong> Follow our social media platforms above to start earning coins and connecting with the community. 
          Don't forget to join our Discord server for real-time discussions and exclusive events!
        </AlertDescription>
      </Alert>
    </div>
  );
};

export default Community;


import { Home, Zap, Trophy, BarChart3, User, HelpCircle, Award, Settings, Calendar, ShoppingCart, Coins, Users, MessageCircle, Sparkles, Target } from "lucide-react";
import { NavLink } from "react-router-dom";
import { getUserProfile } from "@/lib/userStorage";
import { EloSystem } from "@/lib/eloSystem";
import { EloRankSystem } from "@/lib/eloRankSystem";
import { Badge } from "@/components/ui/badge";
import DynamicLevelIndicator from "./DynamicLevelIndicator";
import { useUserStats } from "@/hooks/useUserStats";
import { useState, useEffect } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarTrigger,
  useSidebar,
} from "@/components/ui/sidebar";

const menuItems = [
  { title: "Dashboard", url: "/", icon: Home },
  { title: "Play", url: "/play", icon: Zap },
  { title: "What's New", url: "/whats-new", icon: Sparkles },
  { title: "Shop", url: "/shop", icon: ShoppingCart },
  { title: "Referrals", url: "/referrals", icon: Users },
  { title: "Community", url: "/community", icon: MessageCircle },
  { title: "Leaderboards", url: "/leaderboards", icon: Trophy },
  { title: "Achievements", url: "/achievements", icon: Award },
  { title: "Daily Tasks", url: "/daily-tasks", icon: Calendar },
  { title: "Analytics", url: "/analytics", icon: BarChart3 },
  { title: "Profile", url: "/profile", icon: User },
  { title: "Preferences", url: "/preferences", icon: Settings },
  { title: "Help", url: "/help", icon: HelpCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const isCollapsed = state === "collapsed";
  const userProfile = getUserProfile();
  const userStats = useUserStats();
  const [eloData, setEloData] = useState<any>(null);

  // Update ELO data in real-time
  useEffect(() => {
    const updateEloData = () => {
      try {
        const eloSystem = new EloSystem();
        
        // Initialize ELO data for existing users who don't have it
        eloSystem.initializeForExistingUser();
        
        const eloRating = eloSystem.getOverallRating();
        const eloRankDisplay = EloRankSystem.getEloRankDisplay(eloRating, 0);
        
        setEloData({
          rating: eloRating,
          rankDisplay: eloRankDisplay
        });
      } catch (error) {
        console.error('Error updating ELO data in sidebar:', error);
      }
    };

    // Update immediately
    updateEloData();

    // Update every 2 seconds for real-time feel
    const interval = setInterval(updateEloData, 2000);

    return () => clearInterval(interval);
  }, []);

  // ELO data with fallbacks
  const eloRating = eloData?.rating || 1000;
  const eloRankDisplay = eloData?.rankDisplay || EloRankSystem.getEloRankDisplay(1000, 0);

  // ELO Rank Colors - Get color from EloRankSystem
  const getEloRankColor = (rankDisplay: any) => {
    if (!rankDisplay?.currentRank?.color) return 'text-blue-700';
    
    // Convert hex color to Tailwind text color class
    const color = rankDisplay.currentRank.color;
    
    // Map hex colors to Tailwind classes
    switch (color) {
      case '#8B4513': return 'text-gray-700'; // Iron - more grey/brown
      case '#CD7F32': return 'text-amber-700'; // Bronze - more brown than orange
      case '#C0C0C0': return 'text-gray-600'; // Silver
      case '#FFD700': return 'text-yellow-700'; // Gold
      case '#00CED1': return 'text-teal-700'; // Platinum - more blue/green mix
      case '#B9F2FF': return 'text-blue-600'; // Diamond
      case '#8A2BE2': return 'text-purple-700'; // Master
      case '#FF4500': return 'text-red-700'; // Grandmaster
      case '#FFD700': return 'text-yellow-600'; // Challenger (same as Gold but different context)
      default: return 'text-blue-700';
    }
  };

  const getEloRankBorderColor = (rankDisplay: any) => {
    if (!rankDisplay?.currentRank?.color) return 'border-blue-500';
    
    const color = rankDisplay.currentRank.color;
    
    switch (color) {
      case '#8B4513': return 'border-gray-500'; // Iron - more grey/brown
      case '#CD7F32': return 'border-amber-500'; // Bronze - more brown than orange
      case '#C0C0C0': return 'border-gray-400'; // Silver
      case '#FFD700': return 'border-yellow-500'; // Gold
      case '#00CED1': return 'border-teal-500'; // Platinum - more blue/green mix
      case '#B9F2FF': return 'border-blue-400'; // Diamond
      case '#8A2BE2': return 'border-purple-500'; // Master
      case '#FF4500': return 'border-red-500'; // Grandmaster
      case '#FFD700': return 'border-yellow-400'; // Challenger
      default: return 'border-blue-500';
    }
  };

  const getEloRankBgColor = (rankDisplay: any) => {
    if (!rankDisplay?.currentRank?.color) return 'bg-blue-50';
    
    const color = rankDisplay.currentRank.color;
    
    switch (color) {
      case '#8B4513': return 'bg-gray-100'; // Iron - more grey/brown
      case '#CD7F32': return 'bg-amber-50'; // Bronze - more brown than orange
      case '#C0C0C0': return 'bg-gray-50'; // Silver
      case '#FFD700': return 'bg-yellow-50'; // Gold
      case '#00CED1': return 'bg-teal-50'; // Platinum - more blue/green mix
      case '#B9F2FF': return 'bg-blue-50'; // Diamond
      case '#8A2BE2': return 'bg-purple-50'; // Master
      case '#FF4500': return 'bg-red-50'; // Grandmaster
      case '#FFD700': return 'bg-yellow-50'; // Challenger
      default: return 'bg-blue-50';
    }
  };

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border" variant="sidebar">
      <SidebarContent className="overflow-y-auto sidebar-content">
        <SidebarGroup>
          {isCollapsed ? (
            <SidebarMenuItem>
              <SidebarMenuButton asChild tooltip="Toggle Sidebar">
                <SidebarTrigger className="w-full h-8 p-2 flex items-center justify-center">
                  <div className="w-4 h-4 flex flex-col justify-center items-center space-y-0.5">
                    <div className="w-2.5 h-0.5 bg-orange-500 rounded-full transition-all duration-200"></div>
                    <div className="w-2.5 h-0.5 bg-orange-500 rounded-full transition-all duration-200"></div>
                    <div className="w-2.5 h-0.5 bg-orange-500 rounded-full transition-all duration-200"></div>
                  </div>
                </SidebarTrigger>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ) : (
            <div className="flex items-center justify-between px-2 py-2">
              <SidebarGroupLabel className="text-orange-500 font-bold text-base">
                BoltQuest
              </SidebarGroupLabel>
              <SidebarTrigger className="group relative w-8 h-8 rounded-full bg-sidebar-accent/20 hover:bg-sidebar-accent/40 border border-sidebar-border/50 hover:border-sidebar-border transition-all duration-200 ease-out flex items-center justify-center">
                <div className="w-4 h-4 flex flex-col justify-center items-center space-y-0.5">
                  <div className="w-2.5 h-0.5 bg-orange-500 rounded-full transition-all duration-200"></div>
                  <div className="w-2.5 h-0.5 bg-orange-500 rounded-full transition-all duration-200"></div>
                  <div className="w-2.5 h-0.5 bg-orange-500 rounded-full transition-all duration-200"></div>
                </div>
              </SidebarTrigger>
            </div>
          )}
          <SidebarGroupContent>
            <SidebarMenu>
              {menuItems.map((item) => (
                <SidebarMenuItem key={item.title}>
                  <SidebarMenuButton asChild tooltip={item.title}>
                    <NavLink
                      to={item.url}
                      end
                      className={({ isActive }) =>
                        isActive
                          ? "bg-sidebar-accent text-sidebar-accent-foreground"
                          : "hover:bg-sidebar-accent/50"
                      }
                    >
                      <item.icon />
                      <span>{item.title}</span>
                    </NavLink>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>

        {/* User Stats Section */}
        <SidebarGroup>
          <SidebarGroupContent>
            <div className="px-2 py-3 space-y-2">
              {isCollapsed ? (
                <div className="flex flex-col items-center space-y-2">
                  <DynamicLevelIndicator 
                    level={userProfile?.level || 1} 
                    variant="sidebar" 
                    showTierName={false}
                    showProgress={false}
                  />
                  <Badge variant="outline" className={`${getEloRankBorderColor(eloRankDisplay)} ${getEloRankColor(eloRankDisplay)} ${getEloRankBgColor(eloRankDisplay)} text-xs px-1 py-0`}>
                    {eloRating}
                  </Badge>
                </div>
              ) : (
                <div className="space-y-2">
                  <DynamicLevelIndicator 
                    level={userProfile?.level || 1} 
                    variant="sidebar" 
                    showTierName={true}
                    showProgress={false}
                  />
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Target className="h-3 w-3 text-blue-600" />
                      <span className="text-xs">{eloRankDisplay.currentRank.tier} {eloRankDisplay.currentRank.division}</span>
                    </div>
                    <Badge variant="outline" className={`${getEloRankBorderColor(eloRankDisplay)} ${getEloRankColor(eloRankDisplay)} ${getEloRankBgColor(eloRankDisplay)} text-xs px-1 py-0`}>
                      {eloRating}
                    </Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1">
                      <Coins className="h-3 w-3 text-yellow-600" />
                      <span className="text-xs">{userProfile?.coins || 0}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}

import { Home, Zap, Trophy, BarChart3, User, HelpCircle, Award, Settings, Calendar, ShoppingCart, Coins, Users, MessageCircle, Sparkles, Target } from "lucide-react";
import { NavLink } from "react-router-dom";
import { getUserProfile } from "@/lib/userStorage";
import { EloSystem } from "@/lib/eloSystem";
import { Badge } from "@/components/ui/badge";
import DynamicLevelIndicator from "./DynamicLevelIndicator";
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
  const eloSystem = new EloSystem();
  const overallRating = eloSystem.getOverallRating();
  const eloCategory = eloSystem.getEloCategory(overallRating);

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
                  <Badge variant="outline" className={`border-${eloCategory.color}-500 text-${eloCategory.color}-700 bg-${eloCategory.color}-50 text-xs px-1 py-0`}>
                    {overallRating}
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
                      <span className="text-xs">{eloCategory.label}</span>
                    </div>
                    <Badge variant="outline" className={`border-${eloCategory.color}-500 text-${eloCategory.color}-700 bg-${eloCategory.color}-50 text-xs px-1 py-0`}>
                      {overallRating}
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

import { Home, Zap, Trophy, BarChart3, User, HelpCircle, Award, Settings, Calendar } from "lucide-react";
import { NavLink } from "react-router-dom";
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

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarContent>
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
      </SidebarContent>
    </Sidebar>
  );
}

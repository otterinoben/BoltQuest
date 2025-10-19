import React from 'react';
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Menu } from "lucide-react";
import usePageTitle from "@/hooks/usePageTitle";

interface MobileHeaderProps {
  title?: string;
}

const MobileHeader: React.FC<MobileHeaderProps> = ({ title }) => {
  const pageTitle = usePageTitle();
  const displayTitle = title || pageTitle;

  return (
    <header className="lg:hidden mobile-header flex items-center justify-between p-4 border-b border-gray-200 bg-white shadow-sm">
      <SidebarTrigger className="lg:hidden p-2 hover:bg-gray-100 rounded-lg transition-colors">
        <Menu className="h-5 w-5 text-gray-700" />
      </SidebarTrigger>
      <h1 className="text-lg font-semibold text-black">{displayTitle}</h1>
      <div className="w-9" /> {/* Spacer for centering */}
    </header>
  );
};

export default MobileHeader;

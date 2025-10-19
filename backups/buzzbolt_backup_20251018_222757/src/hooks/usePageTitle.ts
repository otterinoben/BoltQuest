import { useLocation } from 'react-router-dom';

const usePageTitle = () => {
  const location = useLocation();
  
  const getPageTitle = (pathname: string) => {
    switch (pathname) {
      case '/':
        return 'Dashboard';
      case '/play':
        return 'Play';
      case '/game':
        return 'Game';
      case '/shop':
        return 'Shop';
      case '/referrals':
        return 'Referrals';
      case '/community':
        return 'Community';
      case '/leaderboards':
        return 'Leaderboards';
      case '/achievements':
        return 'Achievements';
      case '/daily-tasks':
        return 'Daily Tasks';
      case '/analytics':
        return 'Analytics';
      case '/profile':
        return 'Profile';
      case '/preferences':
        return 'Preferences';
      case '/help':
        return 'Help';
      default:
        return 'BoltQuest';
    }
  };
  
  return getPageTitle(location.pathname);
};

export default usePageTitle;


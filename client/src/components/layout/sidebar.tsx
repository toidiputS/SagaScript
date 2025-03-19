import { useLocation, Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import {
  BookIcon,
  HomeIcon,
  UsersIcon,
  MapPinIcon,
  CalendarIcon,
  LayoutGridIcon,
  EyeIcon,
  LogOutIcon
} from "lucide-react";
import { apiRequest } from "@/lib/queryClient";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useWritingStats } from "@/hooks/use-writing-stats";

export default function Sidebar() {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { toast } = useToast();
  const { stats } = useWritingStats();

  const handleLogout = async () => {
    try {
      await apiRequest("POST", "/api/logout", {});
      logout();
      toast({
        title: "Logged out successfully",
        description: "You have been logged out of your account",
      });
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const navItems = [
    { path: "/", icon: <HomeIcon className="h-5 w-5" />, label: "Dashboard" },
    { path: "/series", icon: <BookIcon className="h-5 w-5" />, label: "Series Management" },
    { path: "/characters", icon: <UsersIcon className="h-5 w-5" />, label: "Characters" },
    { path: "/world-building", icon: <MapPinIcon className="h-5 w-5" />, label: "World Building" },
    { path: "/timeline", icon: <CalendarIcon className="h-5 w-5" />, label: "Timeline" },
    { path: "/ai-companion", icon: <EyeIcon className="h-5 w-5" />, label: "AI Companion" },
  ];

  // Get the user's tier based on the database value
  const getTierLabel = (tier: string) => {
    switch(tier) {
      case 'apprentice': return 'The Apprentice';
      case 'wordsmith': return 'The Wordsmith';
      case 'loremaster': return 'The Loremaster';
      case 'chronicler': return 'The Legendary Chronicler';
      default: return 'The Apprentice';
    }
  };

  return (
    <aside className="hidden md:flex flex-col w-64 bg-white border-r border-neutral-200 shadow-sm h-screen fixed z-10 overflow-y-auto">
      <div className="p-4 border-b border-neutral-200">
        <div className="flex items-center space-x-2">
          <svg className="w-8 h-8 text-primary" fill="currentColor" viewBox="0 0 20 20">
            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z"></path>
          </svg>
          <h1 className="text-lg font-heading font-bold text-neutral-800">Saga Scribe</h1>
        </div>
      </div>
      
      <div className="pt-4 pb-2 px-4">
        {user && (
          <div className="flex flex-col items-center mb-4">
            <div className="relative">
              <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center text-primary border-2 border-primary">
                {user.displayName ? (
                  <span className="text-xl font-bold">{user.displayName.charAt(0).toUpperCase()}</span>
                ) : (
                  <span className="text-xl font-bold">{user.username.charAt(0).toUpperCase()}</span>
                )}
              </div>
              <div className="absolute bottom-0 right-0 bg-secondary rounded-full w-5 h-5 flex items-center justify-center border-2 border-white">
                <span className="text-white text-xs font-medium">{stats?.currentStreak || 0}</span>
              </div>
            </div>
            <h2 className="mt-2 font-medium">{user.displayName || user.username}</h2>
            <span className="text-xs text-neutral-500 font-medium">{getTierLabel(user.tier)}</span>
          </div>
        )}
        
        <div className="space-y-1.5">
          {navItems.map((item) => (
            <Link 
              key={item.path} 
              href={item.path}
            >
              <a className={`flex items-center space-x-3 ${
                location === item.path 
                  ? "text-primary font-medium px-3 py-2 rounded-lg bg-primary/10" 
                  : "text-neutral-600 hover:text-primary hover:bg-primary/5 px-3 py-2 rounded-lg transition-colors"
              }`}>
                {item.icon}
                <span>{item.label}</span>
              </a>
            </Link>
          ))}
          <button 
            onClick={handleLogout}
            className="w-full flex items-center space-x-3 text-neutral-600 hover:text-red-500 hover:bg-red-50 px-3 py-2 rounded-lg transition-colors"
          >
            <LogOutIcon className="h-5 w-5" />
            <span>Log Out</span>
          </button>
        </div>
      </div>
      
      <div className="mt-auto p-4 border-t border-neutral-200">
        <div className="bg-primary/10 rounded-lg p-3">
          <div className="flex justify-between items-center mb-2">
            <h3 className="text-sm font-medium text-primary">Your Journey</h3>
            <span className="text-xs bg-primary text-white px-2 py-0.5 rounded-full">Level {stats?.achievementsCount || 0}</span>
          </div>
          <Progress value={stats?.currentStreak ? Math.min(stats.currentStreak * 10, 100) : 0} className="h-2 mb-2" />
          <p className="text-xs text-neutral-600">{stats?.totalWordCount?.toLocaleString() || 0} words written</p>
        </div>
      </div>
    </aside>
  );
}

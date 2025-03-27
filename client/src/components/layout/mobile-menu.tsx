import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useSeries } from "@/hooks/use-series";
import { useTheme } from "@/contexts/theme-context";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [location] = useLocation();
  const { user, logoutMutation } = useAuth();
  const { currentSeries } = useSeries();

  // Navigation links
  const navLinks = [
    { name: "Dashboard", path: "/", icon: "ri-dashboard-line" },
    { name: "Series", path: "/series", icon: "ri-book-2-line" },
    { name: "Characters", path: "/characters", icon: "ri-user-star-line" },
    { name: "World", path: "/world", icon: "ri-earth-line" },
    { name: "Timeline", path: "/timeline", icon: "ri-time-line" },
    { name: "Collaboration", path: "/collaboration", icon: "ri-team-line" },
    { name: "Achievements", path: "/achievements", icon: "ri-award-line" },
    { name: "Products", path: "/products", icon: "ri-shopping-bag-3-line" },
    { name: "Subscriptions", path: "/subscriptions", icon: "ri-vip-crown-line" },
    { name: "Writer's Companion", path: "/ai-companion", icon: "ri-pencil-ruler-2-line" }, // Added Writer's Companion
  ];

  if (!isOpen) return null;

  const { theme } = useTheme();

  return (
    <>
      {/* Backdrop */}
      <div 
        className="md:hidden fixed inset-0 z-20 bg-background/80 backdrop-blur-sm" 
        onClick={onClose}
      />

      {/* Overlay */}
      <div 
        className="md:hidden fixed inset-0 z-20 bg-black/50 transition-opacity"
        onClick={onClose}
      />

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed inset-y-0 left-0 z-30 w-72 flex flex-col bg-background shadow-xl">
        <div className="p-4 border-b border-border flex items-center justify-between">
          <h1 className="font-serif font-bold text-lg">
            <span className="text-foreground">SagaScript</span>
            <span className="text-[#0097FB]">Life</span>
          </h1>
          <div className="flex items-center space-x-2">
            <ThemeSwitcher />
            <button 
              onClick={onClose} 
              className="p-2 rounded-md text-muted-foreground hover:text-foreground hover:bg-accent"
            >
              <i className="ri-close-line text-xl"></i>
            </button>
          </div>
        </div>

        {/* Mobile Navigation */}
        <div className="flex-1 overflow-y-auto p-4">
          {/* Navigation Links */}
          <div className="flex flex-col space-y-1 mb-6">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                onClick={onClose}
                className={`flex items-center p-2.5 rounded-md ${
                  location === link.path
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-foreground hover:bg-accent hover:text-foreground"
                }`}
              >
                <i className={`${link.icon} mr-3 text-lg`}></i>
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Current Series Section */}
          {currentSeries && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Current Series
              </h3>
              <div className="bg-card rounded-md p-3">
                <div className="font-medium text-card-foreground">{currentSeries.title}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-muted-foreground">
                    Book {currentSeries.currentBook} of {currentSeries.totalBooks}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {Math.round((currentSeries.currentBook / currentSeries.totalBooks) * 100)}% Complete
                  </div>
                </div>
                <div className="w-full bg-muted rounded-full h-1.5 mt-2">
                  <div
                    className="bg-primary h-1.5 rounded-full"
                    style={{
                      width: `${Math.round((currentSeries.currentBook / currentSeries.totalBooks) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Recent Activity */}
              <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mt-6 mb-3">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {currentSeries.recentActivities?.map((activity, index) => (
                  <div key={index} className="text-xs text-foreground flex items-start">
                    <i className={`${activity.icon} ${activity.iconColor} mt-0.5 mr-2`}></i>
                    <div>
                      <p>{activity.description}</p>
                      <p className="text-muted-foreground mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Section */}
          {user && (
            <div className="mt-6 pt-6 border-t border-border">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary text-primary-foreground flex items-center justify-center">
                  <span className="font-medium">
                    {user.displayName.split(" ").map(word => word[0]).join("").toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-foreground">{user.displayName}</p>
                  <p className="text-xs text-muted-foreground">{user.plan} Plan</p>
                </div>
              </div>

              {/* Logout Button */}
              <div className="mt-4 flex">
                <button
                  onClick={() => {
                    logoutMutation.mutate();
                    onClose();
                  }}
                  className="w-full py-2.5 px-4 border border-border rounded-md text-foreground hover:bg-accent flex items-center justify-center"
                >
                  <i className="ri-logout-box-line mr-2"></i>
                  Sign Out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
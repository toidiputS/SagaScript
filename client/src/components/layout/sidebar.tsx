import { useState, useEffect } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useSeries } from "@/hooks/use-series";
import { ThemeSwitcher } from "@/components/ui/theme-switcher";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function Sidebar() {
  const [location] = useLocation();
  const { user } = useAuth();
  const { currentSeries } = useSeries();
  const { toast } = useToast();
  const [isCollapsed, setIsCollapsed] = useState(() => {
    // Initialize from localStorage if available
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('sidebar-collapsed');
      return saved ? JSON.parse(saved) : false;
    }
    return false;
  });

  // Save to localStorage when changed
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('sidebar-collapsed', JSON.stringify(isCollapsed));
    }
  }, [isCollapsed]);

  // Create logout mutation
  const logoutMutation = useMutation({
    mutationFn: async () => {
      const response = await apiRequest("POST", "/api/logout");
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Logged out",
        description: "You have been successfully logged out",
      });
      // Reload the page to reset the auth state
      window.location.href = "/";
    },
    onError: (error: any) => {
      toast({
        title: "Logout failed",
        description: error.message || "An error occurred while logging out",
        variant: "destructive",
      });
    }
  });

  // Navigation links
  const navLinks = [
    { name: "Dashboard", path: "/", icon: "ri-dashboard-line" },
    { name: "Series", path: "/series", icon: "ri-book-2-line" },
    { name: "Characters", path: "/characters", icon: "ri-user-star-line" },
    { name: "World", path: "/world", icon: "ri-earth-line" },
    { name: "Timeline", path: "/timeline", icon: "ri-time-line" },
    { name: "AI Companion", path: "/ai-companion", icon: "ri-robot-line" },
    { name: "Writer's Companion", path: "/writers-companion", icon: "ri-quill-pen-line" }, // Added Writer's Companion
    { name: "Collaboration", path: "/collaboration", icon: "ri-team-line" },
    { name: "Achievements", path: "/achievements", icon: "ri-award-line" },
    { name: "Products", path: "/products", icon: "ri-shopping-bag-3-line" },
    { name: "Subscriptions", path: "/subscriptions", icon: "ri-vip-crown-line" },
  ];

  return (
    <aside 
      className={cn(
        "hidden lg:flex h-screen flex-col fixed left-0 top-0 bottom-0 bg-background border-r transition-all duration-300 ease-in-out z-30",
        isCollapsed ? "w-16" : "w-64" 
      )}
    >
      <div className="flex flex-col h-full">
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-3 sm:px-4 border-b border-border">
          <div className={cn("flex items-center", isCollapsed ? "justify-center w-full" : "")}>
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground">
              <i className="ri-quill-pen-line"></i>
            </div>
            {!isCollapsed && (
              <h1 className="font-serif font-bold text-lg text-foreground ml-2">
                <span className="text-foreground">SagaScript</span>
                <span className="text-[#00A3FF]">Life</span>
              </h1>
            )}
          </div>
          {!isCollapsed && (
            <div className="flex items-center space-x-2">
              <ThemeSwitcher />
            </div>
          )}
        </div>

        {/* Toggle Button - Fixed at bottom of sidebar */}
        <button
          onClick={() => setIsCollapsed((prev: boolean) => !prev)}
          className="absolute bottom-20 right-0 translate-x-1/2 w-6 h-16 flex items-center justify-center bg-background border border-border rounded-r-md text-muted-foreground hover:text-foreground hover:bg-accent"
        >
          <i className={`ri-arrow-${isCollapsed ? 'right' : 'left'}-s-line text-sm`}></i>
        </button>

        {/* Main Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-2">
          {/* Navigation Links */}
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                title={isCollapsed ? link.name : undefined}
                className={cn(
                  "flex items-center p-2 rounded-md",
                  isCollapsed ? "justify-center" : "",
                  location === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <i className={cn(link.icon, "text-lg", isCollapsed ? "" : "mr-3")}></i>
                {!isCollapsed && <span>{link.name}</span>}
              </Link>
            ))}
          </div>

          {/* Current Series Section - Only show on writing-related pages and when not collapsed */}
          {!isCollapsed && currentSeries && (location === '/' || location === '/series' || location.startsWith('/book/') || location.startsWith('/chapter/')) && (
            <div className="mt-6 pt-6 border-t border-border">
              <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mb-3">
                Current Series
              </h3>
              <div className="bg-card rounded-md p-3">
                <div className="font-medium text-card-foreground truncate">{currentSeries.title}</div>
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

              {/* Recent Activity - Only show on dashboard */}
              {location === '/' && (
                <>
                  <h3 className="px-2 text-xs font-medium text-muted-foreground uppercase tracking-wider mt-6 mb-3">
                    Recent Activity
                  </h3>
                  <div className="space-y-3">
                    {currentSeries.recentActivities?.map((activity, index) => (
                      <div key={index} className="text-xs text-foreground flex items-start">
                        <i className={`${activity.icon} ${activity.iconColor} mt-0.5 mr-2`}></i>
                        <div>
                          <p className="truncate">{activity.description}</p>
                          <p className="text-muted-foreground mt-1">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </>
              )}
            </div>
          )}
        </nav>

        {/* User Section */}
        <div className={cn(
          "border-t border-border", 
          isCollapsed ? "p-2" : "p-4"
        )}>
          {user && (
            <div className={cn(
              "flex items-center", 
              isCollapsed ? "justify-center" : ""
            )}>
              <div className="w-9 h-9 rounded-full bg-primary text-primary-foreground flex items-center justify-center flex-shrink-0">
                <span className="font-medium text-sm">
                  {user.displayName.split(" ").map(word => word[0]).join("").toUpperCase()}
                </span>
              </div>
              {!isCollapsed && (
                <>
                  <div className="ml-3 overflow-hidden">
                    <p className="text-sm font-medium text-foreground truncate">{user.displayName}</p>
                    <p className="text-xs text-muted-foreground capitalize">{user.plan} Plan</p>
                  </div>
                  <div className="ml-auto">
                    <button
                      onClick={() => logoutMutation.mutate()}
                      className="p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
                    >
                      <i className="ri-logout-box-line"></i>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
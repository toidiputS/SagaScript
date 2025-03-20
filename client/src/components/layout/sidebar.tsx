import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useSeries } from "@/hooks/use-series";
import { ThemeToggle } from "@/components/ui/theme-toggle";
import { useTheme } from "@/contexts/theme-context";

export default function Sidebar() {
  const [location] = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const { user, logoutMutation } = useAuth();
  const { currentSeries } = useSeries();
  const { theme } = useTheme();

  // Navigation links
  const navLinks = [
    { name: "Dashboard", path: "/", icon: "ri-dashboard-line" },
    { name: "Series", path: "/series", icon: "ri-book-2-line" },
    { name: "Characters", path: "/characters", icon: "ri-user-star-line" },
    { name: "World", path: "/world", icon: "ri-earth-line" },
    { name: "Timeline", path: "/timeline", icon: "ri-time-line" },
    { name: "Achievements", path: "/achievements", icon: "ri-award-line" },
    { name: "Products", path: "/products", icon: "ri-shopping-bag-3-line" },
  ];

  return (
    <aside className="hidden md:flex md:flex-shrink-0">
      <div className={`flex flex-col ${isSidebarOpen ? 'w-64' : 'w-20'} bg-background border-r border-border transition-width duration-200`}>
        {/* Sidebar Header */}
        <div className="h-16 flex items-center justify-between px-4 border-b border-border">
          <div className="flex items-center">
            <div className="w-8 h-8 bg-primary rounded-md flex items-center justify-center text-primary-foreground mr-2">
              <i className="ri-quill-pen-line"></i>
            </div>
            {isSidebarOpen && <span className="font-serif font-bold text-lg text-foreground">Saga Scribe</span>}
          </div>
          <div className="flex items-center space-x-1">
            {isSidebarOpen && <ThemeToggle />}
            <button
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-1 rounded-md text-muted-foreground hover:text-foreground"
            >
              <i className={`ri-arrow-${isSidebarOpen ? 'left' : 'right'}-s-line text-xl`}></i>
            </button>
          </div>
        </div>

        {/* Main Sidebar Navigation */}
        <nav className="flex-1 overflow-y-auto p-4 space-y-2">
          {/* Navigation Links */}
          <div className="flex flex-col space-y-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                href={link.path}
                className={`flex items-center p-2 rounded-md ${
                  location === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-foreground hover:bg-accent hover:text-accent-foreground"
                }`}
              >
                <i className={`${link.icon} mr-3 text-lg`}></i>
                {isSidebarOpen && <span>{link.name}</span>}
              </Link>
            ))}
          </div>

          {/* Current Series Section */}
          {isSidebarOpen && currentSeries && (
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
        </nav>

        {/* User Section */}
        <div className="p-4 border-t border-border">
          {user && isSidebarOpen ? (
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
              <div className="ml-auto flex items-center">
                {!isSidebarOpen && <ThemeToggle />}
                <button
                  onClick={() => logoutMutation.mutate()}
                  className="p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
                >
                  <i className="ri-logout-box-line"></i>
                </button>
              </div>
            </div>
          ) : (
            <div className="flex justify-center space-x-2">
              <ThemeToggle />
              <button
                onClick={() => logoutMutation.mutate()}
                className="p-1.5 rounded-full hover:bg-accent text-muted-foreground hover:text-foreground"
              >
                <i className="ri-logout-box-line"></i>
              </button>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}

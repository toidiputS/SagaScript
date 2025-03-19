import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/auth-context";
import { useSeries } from "@/hooks/use-series";

interface MobileMenuProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MobileMenu({ isOpen, onClose }: MobileMenuProps) {
  const [location] = useLocation();
  const { user, logout } = useAuth();
  const { currentSeries } = useSeries();

  // Navigation links
  const navLinks = [
    { name: "Dashboard", path: "/", icon: "ri-dashboard-line" },
    { name: "Series", path: "/series", icon: "ri-book-2-line" },
    { name: "Characters", path: "/characters", icon: "ri-user-star-line" },
    { name: "World", path: "/world", icon: "ri-earth-line" },
    { name: "Timeline", path: "/timeline", icon: "ri-time-line" },
    { name: "Achievements", path: "/achievements", icon: "ri-award-line" },
  ];

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <div 
        className="md:hidden fixed inset-0 z-20 bg-neutral-800 bg-opacity-75" 
        onClick={onClose}
      />

      {/* Mobile Sidebar */}
      <div className="md:hidden fixed inset-y-0 left-0 z-30 w-72 flex flex-col bg-white shadow-xl transform transition duration-300">
        <div className="p-4 border-b border-neutral-200 flex items-center justify-between">
          <span className="font-serif font-bold text-lg">Saga Scribe</span>
          <button 
            onClick={onClose} 
            className="p-2 rounded-md text-neutral-500 hover:text-neutral-700"
          >
            <i className="ri-close-line text-xl"></i>
          </button>
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
                className={`flex items-center p-2 rounded-md ${
                  location === link.path
                    ? "bg-primary/10 text-primary"
                    : "text-neutral-700 hover:bg-neutral-100"
                }`}
              >
                <i className={`${link.icon} mr-3 text-lg`}></i>
                <span>{link.name}</span>
              </Link>
            ))}
          </div>

          {/* Current Series Section */}
          {currentSeries && (
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <h3 className="px-2 text-xs font-medium text-neutral-500 uppercase tracking-wider mb-3">
                Current Series
              </h3>
              <div className="bg-neutral-100 rounded-md p-3">
                <div className="font-medium text-neutral-800">{currentSeries.title}</div>
                <div className="flex items-center justify-between mt-2">
                  <div className="text-xs text-neutral-500">
                    Book {currentSeries.currentBook} of {currentSeries.totalBooks}
                  </div>
                  <div className="text-xs text-neutral-500">
                    {Math.round((currentSeries.currentBook / currentSeries.totalBooks) * 100)}% Complete
                  </div>
                </div>
                <div className="w-full bg-neutral-200 rounded-full h-1.5 mt-2">
                  <div
                    className="bg-primary h-1.5 rounded-full"
                    style={{
                      width: `${Math.round((currentSeries.currentBook / currentSeries.totalBooks) * 100)}%`,
                    }}
                  ></div>
                </div>
              </div>

              {/* Recent Activity */}
              <h3 className="px-2 text-xs font-medium text-neutral-500 uppercase tracking-wider mt-6 mb-3">
                Recent Activity
              </h3>
              <div className="space-y-3">
                {currentSeries.recentActivities?.map((activity, index) => (
                  <div key={index} className="text-xs text-neutral-600 flex items-start">
                    <i className={`${activity.icon} ${activity.iconColor} mt-0.5 mr-2`}></i>
                    <div>
                      <p>{activity.description}</p>
                      <p className="text-neutral-400 mt-1">{activity.time}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* User Section */}
          {user && (
            <div className="mt-6 pt-6 border-t border-neutral-200">
              <div className="flex items-center">
                <div className="w-10 h-10 rounded-full bg-primary text-white flex items-center justify-center">
                  <span className="font-medium">
                    {user.displayName.split(" ").map(word => word[0]).join("").toUpperCase()}
                  </span>
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-neutral-700">{user.displayName}</p>
                  <p className="text-xs text-neutral-500">{user.plan} Plan</p>
                </div>
              </div>
              <button
                onClick={() => {
                  logout();
                  onClose();
                }}
                className="mt-4 w-full py-2 px-4 border border-neutral-300 rounded-md text-neutral-700 hover:bg-neutral-100 flex items-center justify-center"
              >
                <i className="ri-logout-box-line mr-2"></i>
                Sign Out
              </button>
            </div>
          )}
        </div>
      </div>
    </>
  );
}

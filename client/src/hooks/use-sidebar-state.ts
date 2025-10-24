import { useState, useEffect } from 'react';

export function useSidebarState() {
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isLargeScreen, setIsLargeScreen] = useState(false);

  useEffect(() => {
    // Check initial screen size
    const checkScreenSize = () => {
      setIsLargeScreen(window.innerWidth >= 1024);
    };

    checkScreenSize();
    window.addEventListener('resize', checkScreenSize);

    // Check sidebar state from localStorage
    const handleStorageChange = () => {
      const saved = localStorage.getItem('sidebar-collapsed');
      if (saved) {
        setIsSidebarCollapsed(JSON.parse(saved));
      }
    };
    
    // Initial check
    handleStorageChange();
    
    // Listen for changes (needed for cross-tab syncing)
    window.addEventListener('storage', handleStorageChange);
    
    // Custom event listener for sidebar state changes
    const handleSidebarToggle = (event: CustomEvent) => {
      setIsSidebarCollapsed(event.detail.collapsed);
    };
    
    window.addEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    
    return () => {
      window.removeEventListener('resize', checkScreenSize);
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('sidebar-toggle', handleSidebarToggle as EventListener);
    };
  }, []);

  const getMainContentStyle = (isAuthRoute: boolean) => {
    if (isAuthRoute) {
      return { marginLeft: '0', width: '100%' };
    }

    if (!isLargeScreen) {
      return { marginLeft: '0', width: '100%' };
    }

    return {
      marginLeft: isSidebarCollapsed ? '4rem' : '16rem',
      width: isSidebarCollapsed ? 'calc(100% - 4rem)' : 'calc(100% - 16rem)'
    };
  };

  return {
    isSidebarCollapsed,
    isLargeScreen,
    getMainContentStyle
  };
}
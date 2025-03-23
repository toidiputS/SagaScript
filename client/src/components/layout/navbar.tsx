import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/router';
import { HelpCircle, Bell, Settings, User, BookOpen } from 'lucide-react'; // Added BookOpen import
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';

export default function Navbar() {
  const router = useRouter();
  const { user, logout } = useAuth();

  return (
    <nav className="bg-background border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex">
            <Link href="/dashboard" className="flex-shrink-0 flex items-center">
              <img className="h-8 w-auto" src="/logo.svg" alt="Saga Scribe" />
              <span className="ml-2 text-xl font-bold text-foreground">Saga Scribe</span>
            </Link>
            <div className="hidden sm:ml-6 sm:flex sm:space-x-8">
              <Link href="/dashboard" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${router.pathname === '/dashboard' ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                Dashboard
              </Link>
              <Link href="/series" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${router.pathname.startsWith('/series') ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                Series
              </Link>
              <Link href="/characters" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${router.pathname.startsWith('/characters') ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                Characters
              </Link>
              <Link href="/world" className={`inline-flex items-center px-1 pt-1 text-sm font-medium ${router.pathname.startsWith('/world') ? 'border-b-2 border-primary text-foreground' : 'text-muted-foreground hover:text-foreground'}`}>
                World
              </Link>
            </div>
          </div>
          <div className="flex items-center">
            <Link href="/help" className="p-2 rounded-full text-muted-foreground hover:text-foreground hover:bg-accent mr-2">
              <HelpCircle className="h-5 w-5" />
              <span className="sr-only">Help</span>
            </Link>
            <Button variant="ghost" size="icon" className="mr-2">
              <Bell className="h-5 w-5" />
              <span className="sr-only">Notifications</span>
            </Button>
            <DropdownMenu> {/* Help Dropdown */}
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <HelpCircle className="h-5 w-5" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>Help & Support</DropdownMenuLabel>
                <DropdownMenuItem>
                  <Link href="/help">
                    <div className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Help Center</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <Link href="/help/tutorials">
                    <div className="flex items-center">
                      <BookOpen className="mr-2 h-4 w-4" />
                      <span>Tutorials</span>
                    </div>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem>
                  <a href="mailto:support@sagascribe.com" className="flex items-center">
                    <HelpCircle className="mr-2 h-4 w-4" />
                    <span>Contact Support</span>
                  </a>
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
            <DropdownMenu> {/* User Dropdown */}
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="relative">
                  <User className="h-5 w-5" />
                  <span className="sr-only">User menu</span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuLabel>
                  {user ? user.displayName : 'Account'}
                </DropdownMenuLabel>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => router.push('/profile')}>
                  Profile
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/settings')}>
                  Settings
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/subscriptions')}>
                  Subscription
                </DropdownMenuItem>
                <DropdownMenuItem onSelect={() => router.push('/help')}>
                  Help & Support
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuItem onSelect={() => logout()}>
                  Logout
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </div>
      </div>
    </nav>
  );
}
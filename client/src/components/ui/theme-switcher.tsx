import { useState } from 'react';
import { useTheme } from '@/contexts/theme-context';
import { Button } from './button';
import { Sun, Moon, Skull, Sunset } from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from './dropdown-menu';
import { toast } from '@/hooks/use-toast';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const handleThemeChange = (newTheme: 'light' | 'dark' | 'spooky' | 'sunset') => {
    setTheme(newTheme);
    setOpen(false);
    
    // Show toast notification
    const themeName = newTheme.charAt(0).toUpperCase() + newTheme.slice(1);
    toast({
      title: `${themeName} Theme Applied`,
      description: `The application theme has been changed to ${themeName}.`,
    });
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="icon">
          {theme === 'light' && <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />}
          {theme === 'dark' && <Moon className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />}
          {theme === 'spooky' && <Skull className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />}
          {theme === 'sunset' && <Sunset className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />}
          <span className="sr-only">Toggle theme</span>
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuItem onClick={() => handleThemeChange('light')}>
          <Sun className="h-4 w-4 mr-2" />
          <span>Light</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('dark')}>
          <Moon className="h-4 w-4 mr-2" />
          <span>Dark</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('spooky')}>
          <Skull className="h-4 w-4 mr-2" />
          <span>Spooky</span>
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => handleThemeChange('sunset')}>
          <Sunset className="h-4 w-4 mr-2" />
          <span>Sunset</span>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
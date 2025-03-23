import { useState } from "react";
import { useTheme } from "@/contexts/theme-context";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import { Sun, Moon, Palette, Sunset } from "lucide-react";

type ThemeOption = 'light' | 'dark' | 'spooky' | 'sunset';

export function ThemeSwitcher() {
  const { theme, setTheme } = useTheme();
  const [open, setOpen] = useState(false);

  const themeIcons = {
    light: <Sun className="h-4 w-4" />,
    dark: <Moon className="h-4 w-4" />,
    spooky: <Palette className="h-4 w-4" />,
    sunset: <Sunset className="h-4 w-4" />,
  };

  const themeNames = {
    light: "Light",
    dark: "Dark",
    spooky: "Spooky",
    sunset: "Sunset",
  };

  const handleThemeChange = (newTheme: ThemeOption) => {
    setTheme(newTheme);
    setOpen(false);
  };

  return (
    <DropdownMenu open={open} onOpenChange={setOpen}>
      <DropdownMenuTrigger asChild>
        <Button 
          variant="outline" 
          size="icon" 
          className="rounded-full border-input bg-background text-foreground hover:bg-accent hover:text-accent-foreground"
          aria-label="Change theme"
        >
          {theme && themeIcons[theme as ThemeOption]}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="bg-background border-input">
        {(Object.keys(themeNames) as ThemeOption[]).map((themeOption) => (
          <DropdownMenuItem
            key={themeOption}
            onClick={() => handleThemeChange(themeOption)}
            className={theme === themeOption 
              ? "bg-accent text-accent-foreground" 
              : "text-foreground hover:bg-accent/50 hover:text-accent-foreground"
            }
          >
            <div className="flex items-center gap-2">
              <span className="text-foreground">{themeIcons[themeOption]}</span>
              <span>{themeNames[themeOption]}</span>
            </div>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
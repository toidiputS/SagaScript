import React, { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { X, Minimize, Maximize } from 'lucide-react';
import { cn } from '@/lib/utils';

interface FocusModeProps {
  isActive: boolean;
  onExit: () => void;
  children: React.ReactNode;
  className?: string;
}

export default function FocusMode({ 
  isActive, 
  onExit, 
  children, 
  className = '' 
}: FocusModeProps) {
  const [isMinimized, setIsMinimized] = useState(false);

  useEffect(() => {
    if (isActive) {
      // Hide scrollbars and prevent body scroll
      document.body.style.overflow = 'hidden';
      
      // Add escape key listener
      const handleEscape = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          onExit();
        }
      };
      
      document.addEventListener('keydown', handleEscape);
      
      return () => {
        document.body.style.overflow = 'auto';
        document.removeEventListener('keydown', handleEscape);
      };
    }
  }, [isActive, onExit]);

  if (!isActive) return <>{children}</>;

  return (
    <div className="fixed inset-0 z-50 bg-background">
      {/* Focus Mode Header */}
      <div className={cn(
        "absolute top-4 right-4 z-10 flex items-center gap-2 transition-opacity duration-300",
        isMinimized ? "opacity-30 hover:opacity-100" : "opacity-100"
      )}>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsMinimized(!isMinimized)}
          className="h-8 w-8 p-0 bg-card/80 backdrop-blur-sm border-0"
        >
          {isMinimized ? <Maximize className="h-4 w-4" /> : <Minimize className="h-4 w-4" />}
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onExit}
          className="h-8 w-8 p-0 bg-card/80 backdrop-blur-sm border-0"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      {/* Focus Mode Content */}
      <div className={cn(
        "h-full w-full flex flex-col items-center justify-center p-8",
        className
      )}>
        <div className="w-full max-w-4xl h-full flex flex-col">
          {children}
        </div>
      </div>

      {/* Focus Mode Instructions (only show initially) */}
      {!isMinimized && (
        <div className="absolute bottom-4 left-1/2 transform -translate-x-1/2 text-center">
          <p className="text-sm text-muted-foreground">
            Press <kbd className="px-2 py-1 bg-muted rounded text-xs">Esc</kbd> to exit focus mode
          </p>
        </div>
      )}
    </div>
  );
}
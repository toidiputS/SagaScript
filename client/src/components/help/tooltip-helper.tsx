
import React, { ReactNode } from 'react';
import { HelpCircle } from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface TooltipHelperProps {
  content: ReactNode;
  side?: 'top' | 'right' | 'bottom' | 'left';
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export default function TooltipHelper({
  content,
  side = 'top',
  size = 'md',
  className = '',
}: TooltipHelperProps) {
  const sizeMap = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
  };

  return (
    <TooltipProvider>
      <Tooltip delayDuration={300}>
        <TooltipTrigger asChild>
          <span className={`inline-flex items-center justify-center cursor-help text-muted-foreground hover:text-foreground transition-colors ${className}`}>
            <HelpCircle className={sizeMap[size]} />
          </span>
        </TooltipTrigger>
        <TooltipContent side={side} className="max-w-sm">
          {content}
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

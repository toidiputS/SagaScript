import React from 'react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { 
  Bold, 
  Italic, 
  Underline,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
  Search,
  Zap,
  BookOpen,
  Save,
  Eye,
  Maximize,
  Minimize,
  Target,
  Clock
} from 'lucide-react';
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from '@/components/ui/tooltip';

interface ChapterToolbarProps {
  onAction?: (action: string, value?: any) => void;
  onSave?: () => void;
  onPreview?: () => void;
  onFocusMode?: () => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  wordCount?: number;
  targetWordCount?: number;
  readingTime?: number;
  canUndo?: boolean;
  canRedo?: boolean;
  className?: string;
}

export default function ChapterToolbar({
  onAction,
  onSave,
  onPreview,
  onFocusMode,
  isFullscreen = false,
  onToggleFullscreen,
  wordCount = 0,
  targetWordCount = 0,
  readingTime = 0,
  canUndo = false,
  canRedo = false,
  className = ''
}: ChapterToolbarProps) {

  const handleAction = (action: string, value?: any) => {
    onAction?.(action, value);
  };

  const ToolbarButton = ({ 
    icon: Icon, 
    tooltip, 
    onClick, 
    active = false,
    disabled = false,
    variant = "ghost" as const
  }: {
    icon: React.ComponentType<any>;
    tooltip: string;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
    variant?: "ghost" | "default" | "outline";
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={active ? "default" : variant}
            size="sm"
            onClick={onClick}
            disabled={disabled}
            className="h-8 w-8 p-0 border-0 hover:bg-accent/50"
          >
            <Icon className="h-4 w-4" />
          </Button>
        </TooltipTrigger>
        <TooltipContent>
          <p>{tooltip}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );

  return (
    <div className={`rounded-[30px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(33,150,243,0.12),-10px_-10px_20px_rgba(66,165,245,0.08)] hover:shadow-[15px_15px_25px_rgba(33,150,243,0.18),-15px_-15px_25px_rgba(66,165,245,0.12)] transition-shadow duration-300 p-3 border-0 ${className}`}>
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* Primary Actions */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Save}
            tooltip="Save Chapter (Ctrl+S)"
            onClick={onSave || (() => handleAction('save'))}
            variant="outline"
          />
          <ToolbarButton
            icon={Eye}
            tooltip="Preview"
            onClick={onPreview || (() => handleAction('preview'))}
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Undo}
            tooltip="Undo (Ctrl+Z)"
            onClick={() => handleAction('undo')}
            disabled={!canUndo}
          />
          <ToolbarButton
            icon={Redo}
            tooltip="Redo (Ctrl+Y)"
            onClick={() => handleAction('redo')}
            disabled={!canRedo}
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Bold}
            tooltip="Bold (Ctrl+B)"
            onClick={() => handleAction('bold')}
          />
          <ToolbarButton
            icon={Italic}
            tooltip="Italic (Ctrl+I)"
            onClick={() => handleAction('italic')}
          />
          <ToolbarButton
            icon={Underline}
            tooltip="Underline (Ctrl+U)"
            onClick={() => handleAction('underline')}
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists & Quotes */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={List}
            tooltip="Bullet List"
            onClick={() => handleAction('list', 'bullet')}
          />
          <ToolbarButton
            icon={ListOrdered}
            tooltip="Numbered List"
            onClick={() => handleAction('list', 'numbered')}
          />
          <ToolbarButton
            icon={Quote}
            tooltip="Quote"
            onClick={() => handleAction('quote')}
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Writing Tools */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Search}
            tooltip="Find & Replace (Ctrl+F)"
            onClick={() => handleAction('find')}
          />
          <ToolbarButton
            icon={Zap}
            tooltip="AI Writing Assistant"
            onClick={() => handleAction('ai-assist')}
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* View Options */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Target}
            tooltip="Focus Mode"
            onClick={onFocusMode || (() => handleAction('focus-mode'))}
          />
          <ToolbarButton
            icon={isFullscreen ? Minimize : Maximize}
            tooltip={isFullscreen ? "Exit Fullscreen (F11)" : "Fullscreen (F11)"}
            onClick={onToggleFullscreen || (() => handleAction('fullscreen'))}
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Stats */}
        <div className="flex items-center gap-4 px-2">
          {/* Word Count */}
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span className="font-medium">{wordCount.toLocaleString()}</span>
            {targetWordCount > 0 && (
              <span className="text-xs">/ {targetWordCount.toLocaleString()}</span>
            )}
          </div>

          {/* Progress Bar */}
          {targetWordCount > 0 && (
            <div className="flex items-center gap-2">
              <div className="w-20 h-2 bg-muted rounded-full overflow-hidden">
                <div 
                  className="h-full bg-primary transition-all duration-300"
                  style={{ width: `${Math.min((wordCount / targetWordCount) * 100, 100)}%` }}
                />
              </div>
              <span className="text-xs text-muted-foreground">
                {Math.round((wordCount / targetWordCount) * 100)}%
              </span>
            </div>
          )}

          {/* Reading Time */}
          {readingTime > 0 && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span className="text-xs">{readingTime}min read</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
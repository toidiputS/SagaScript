import React from "react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  List,
  ListOrdered,
  Quote,
  Link,
  Image,
  Code,
  Heading1,
  Heading2,
  Heading3,
  Undo,
  Redo,
  Search,
  Replace,
  Palette,
  Type,
  Minus,
  MoreHorizontal,
  Save,
  Download,
  Upload,
  Printer,
  Eye,
  Maximize,
  Minimize,
  Moon,
  Sun,
  Zap,
  BookOpen,
  FileText,
  Clock,
  Target,
  BarChart3,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";

interface WritingToolbarProps {
  onAction?: (action: string, value?: any) => void;
  isFullscreen?: boolean;
  onToggleFullscreen?: () => void;
  isDarkMode?: boolean;
  onToggleDarkMode?: () => void;
  wordCount?: number;
  targetWordCount?: number;
  className?: string;
}

export default function WritingToolbar({
  onAction,
  isFullscreen = false,
  onToggleFullscreen,
  isDarkMode = false,
  onToggleDarkMode,
  wordCount = 0,
  targetWordCount = 0,
  className = "",
}: WritingToolbarProps) {
  const handleAction = (action: string, value?: any) => {
    onAction?.(action, value);
  };

  const ToolbarButton = ({
    icon: Icon,
    tooltip,
    onClick,
    active = false,
    disabled = false,
  }: {
    icon: React.ComponentType<any>;
    tooltip: string;
    onClick: () => void;
    active?: boolean;
    disabled?: boolean;
  }) => (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Button
            variant={active ? "default" : "ghost"}
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
    <div
      className={`rounded-[30px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(33,150,243,0.12),-10px_-10px_20px_rgba(66,165,245,0.08)] hover:shadow-[15px_15px_25px_rgba(33,150,243,0.18),-15px_-15px_25px_rgba(66,165,245,0.12)] transition-shadow duration-300 p-3 border-0 ${className}`}
    >
      <div className="flex items-center justify-between flex-wrap gap-2">
        {/* File Operations */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Save}
            tooltip="Save (Ctrl+S)"
            onClick={() => handleAction("save")}
          />
          <ToolbarButton
            icon={Download}
            tooltip="Export"
            onClick={() => handleAction("export")}
          />
          <ToolbarButton
            icon={Upload}
            tooltip="Import"
            onClick={() => handleAction("import")}
          />
          <ToolbarButton
            icon={Printer}
            tooltip="Print"
            onClick={() => handleAction("print")}
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Undo/Redo */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Undo}
            tooltip="Undo (Ctrl+Z)"
            onClick={() => handleAction("undo")}
          />
          <ToolbarButton
            icon={Redo}
            tooltip="Redo (Ctrl+Y)"
            onClick={() => handleAction("redo")}
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Text Formatting */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Bold}
            tooltip="Bold (Ctrl+B)"
            onClick={() => handleAction("bold")}
          />
          <ToolbarButton
            icon={Italic}
            tooltip="Italic (Ctrl+I)"
            onClick={() => handleAction("italic")}
          />
          <ToolbarButton
            icon={Underline}
            tooltip="Underline (Ctrl+U)"
            onClick={() => handleAction("underline")}
          />
          <ToolbarButton
            icon={Strikethrough}
            tooltip="Strikethrough"
            onClick={() => handleAction("strikethrough")}
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Headings */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 border-0 hover:bg-accent/50">
                <Heading1 className="h-4 w-4 mr-1" />
                <span className="text-xs">H</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleAction("heading", 1)}>
                <Heading1 className="h-4 w-4 mr-2" />
                Heading 1
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("heading", 2)}>
                <Heading2 className="h-4 w-4 mr-2" />
                Heading 2
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("heading", 3)}>
                <Heading3 className="h-4 w-4 mr-2" />
                Heading 3
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Alignment */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={AlignLeft}
            tooltip="Align Left"
            onClick={() => handleAction("align", "left")}
          />
          <ToolbarButton
            icon={AlignCenter}
            tooltip="Align Center"
            onClick={() => handleAction("align", "center")}
          />
          <ToolbarButton
            icon={AlignRight}
            tooltip="Align Right"
            onClick={() => handleAction("align", "right")}
          />
          <ToolbarButton
            icon={AlignJustify}
            tooltip="Justify"
            onClick={() => handleAction("align", "justify")}
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Lists */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={List}
            tooltip="Bullet List"
            onClick={() => handleAction("list", "bullet")}
          />
          <ToolbarButton
            icon={ListOrdered}
            tooltip="Numbered List"
            onClick={() => handleAction("list", "numbered")}
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Insert Elements */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Link}
            tooltip="Insert Link"
            onClick={() => handleAction("link")}
          />
          <ToolbarButton
            icon={Image}
            tooltip="Insert Image"
            onClick={() => handleAction("image")}
          />
          <ToolbarButton
            icon={Quote}
            tooltip="Quote"
            onClick={() => handleAction("quote")}
          />
          <ToolbarButton
            icon={Code}
            tooltip="Code Block"
            onClick={() => handleAction("code")}
          />
          <ToolbarButton
            icon={Minus}
            tooltip="Horizontal Rule"
            onClick={() => handleAction("hr")}
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Search & Replace */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={Search}
            tooltip="Find (Ctrl+F)"
            onClick={() => handleAction("find")}
          />
          <ToolbarButton
            icon={Replace}
            tooltip="Replace (Ctrl+H)"
            onClick={() => handleAction("replace")}
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Writing Tools */}
        <div className="flex items-center gap-1">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="h-8 px-2 border-0 hover:bg-accent/50">
                <Zap className="h-4 w-4 mr-1" />
                <span className="text-xs">AI</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent>
              <DropdownMenuItem onClick={() => handleAction("ai-suggest")}>
                <Zap className="h-4 w-4 mr-2" />
                AI Suggestions
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("ai-grammar")}>
                <FileText className="h-4 w-4 mr-2" />
                Grammar Check
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("ai-style")}>
                <Palette className="h-4 w-4 mr-2" />
                Style Analysis
              </DropdownMenuItem>
              <DropdownMenuItem onClick={() => handleAction("ai-tone")}>
                <Type className="h-4 w-4 mr-2" />
                Tone Adjustment
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* View Options */}
        <div className="flex items-center gap-1">
          <ToolbarButton
            icon={isFullscreen ? Minimize : Maximize}
            tooltip={isFullscreen ? "Exit Fullscreen" : "Fullscreen"}
            onClick={onToggleFullscreen || (() => handleAction("fullscreen"))}
          />
          <ToolbarButton
            icon={isDarkMode ? Sun : Moon}
            tooltip="Toggle Dark Mode"
            onClick={onToggleDarkMode || (() => handleAction("dark-mode"))}
          />
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* Word Count & Progress */}
        <div className="flex items-center gap-2 px-2">
          <div className="flex items-center gap-1 text-sm text-muted-foreground">
            <BookOpen className="h-4 w-4" />
            <span>{wordCount.toLocaleString()}</span>
            {targetWordCount > 0 && (
              <>
                <span>/</span>
                <span>{targetWordCount.toLocaleString()}</span>
              </>
            )}
          </div>
          {targetWordCount > 0 && (
            <div className="w-16 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full bg-primary transition-all duration-300"
                style={{
                  width: `${Math.min(
                    (wordCount / targetWordCount) * 100,
                    100
                  )}%`,
                }}
              />
            </div>
          )}
        </div>

        <Separator orientation="vertical" className="h-6" />

        {/* More Options */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="h-8 w-8 p-0 border-0 hover:bg-accent/50">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Type className="h-4 w-4 mr-2" />
                Font Size
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => handleAction("font-size", "small")}
                >
                  Small
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAction("font-size", "medium")}
                >
                  Medium
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAction("font-size", "large")}
                >
                  Large
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAction("font-size", "xl")}
                >
                  Extra Large
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSub>
              <DropdownMenuSubTrigger>
                <Palette className="h-4 w-4 mr-2" />
                Theme
              </DropdownMenuSubTrigger>
              <DropdownMenuSubContent>
                <DropdownMenuItem
                  onClick={() => handleAction("theme", "light")}
                >
                  Light
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleAction("theme", "dark")}>
                  Dark
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAction("theme", "sepia")}
                >
                  Sepia
                </DropdownMenuItem>
                <DropdownMenuItem
                  onClick={() => handleAction("theme", "high-contrast")}
                >
                  High Contrast
                </DropdownMenuItem>
              </DropdownMenuSubContent>
            </DropdownMenuSub>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => handleAction("focus-mode")}>
              <Eye className="h-4 w-4 mr-2" />
              Focus Mode
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("typewriter-mode")}>
              <Target className="h-4 w-4 mr-2" />
              Typewriter Mode
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("reading-time")}>
              <Clock className="h-4 w-4 mr-2" />
              Reading Time
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleAction("statistics")}>
              <BarChart3 className="h-4 w-4 mr-2" />
              Document Statistics
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
}

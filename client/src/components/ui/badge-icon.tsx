import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "@/lib/utils";

// Badge icon variants
const badgeIconVariants = cva(
  "flex items-center justify-center rounded-full",
  {
    variants: {
      variant: {
        streak: "bg-yellow-100 text-yellow-500 dark:bg-yellow-900/30 dark:text-yellow-400 spooky:bg-yellow-900/30 spooky:text-yellow-400",
        words: "bg-blue-100 text-blue-500 dark:bg-blue-900/30 dark:text-blue-400 spooky:bg-blue-900/30 spooky:text-blue-400",
        chapters: "bg-green-100 text-green-500 dark:bg-green-900/30 dark:text-green-400 spooky:bg-green-900/30 spooky:text-green-400",
        characters: "bg-purple-100 text-purple-500 dark:bg-purple-900/30 dark:text-purple-400 spooky:bg-purple-900/30 spooky:text-purple-400",
        locations: "bg-red-100 text-red-500 dark:bg-red-900/30 dark:text-red-400 spooky:bg-red-900/30 spooky:text-red-400",
        books: "bg-indigo-100 text-indigo-500 dark:bg-indigo-900/30 dark:text-indigo-400 spooky:bg-indigo-900/30 spooky:text-indigo-400",
        default: "bg-gray-100 text-gray-500 dark:bg-gray-900/30 dark:text-gray-400 spooky:bg-gray-900/30 spooky:text-gray-400",
      },
      size: {
        xs: "h-6 w-6 text-xs",
        sm: "h-8 w-8 text-sm",
        md: "h-10 w-10 text-base",
        lg: "h-12 w-12 text-lg",
        xl: "h-16 w-16 text-xl",
      },
      state: {
        earned: "ring-2",
        locked: "opacity-50",
        default: "",
      }
    },
    defaultVariants: {
      variant: "default",
      size: "md",
      state: "default",
    }
  }
);

// Badge background variants
const badgeBgVariants = cva(
  "rounded-lg border p-2",
  {
    variants: {
      variant: {
        streak: "bg-yellow-50 border-yellow-100 dark:bg-yellow-950/20 dark:border-yellow-900/50 spooky:bg-yellow-950/10 spooky:border-yellow-900/30",
        words: "bg-blue-50 border-blue-100 dark:bg-blue-950/20 dark:border-blue-900/50 spooky:bg-blue-950/10 spooky:border-blue-900/30",
        chapters: "bg-green-50 border-green-100 dark:bg-green-950/20 dark:border-green-900/50 spooky:bg-green-950/10 spooky:border-green-900/30",
        characters: "bg-purple-50 border-purple-100 dark:bg-purple-950/20 dark:border-purple-900/50 spooky:bg-purple-950/10 spooky:border-purple-900/30",
        locations: "bg-red-50 border-red-100 dark:bg-red-950/20 dark:border-red-900/50 spooky:bg-red-950/10 spooky:border-red-900/30",
        books: "bg-indigo-50 border-indigo-100 dark:bg-indigo-950/20 dark:border-indigo-900/50 spooky:bg-indigo-950/10 spooky:border-indigo-900/30",
        default: "bg-gray-50 border-gray-100 dark:bg-gray-950/20 dark:border-gray-900/50 spooky:bg-gray-950/10 spooky:border-gray-900/30",
      },
      state: {
        earned: "",
        locked: "opacity-60",
        default: "",
      }
    },
    defaultVariants: {
      variant: "default",
      state: "default",
    }
  }
);

// Ring variants for earned badges
const ringVariants = cva("", {
  variants: {
    variant: {
      streak: "ring-yellow-300 dark:ring-yellow-700 spooky:ring-yellow-800/70",
      words: "ring-blue-300 dark:ring-blue-700 spooky:ring-blue-800/70",
      chapters: "ring-green-300 dark:ring-green-700 spooky:ring-green-800/70",
      characters: "ring-purple-300 dark:ring-purple-700 spooky:ring-purple-800/70",
      locations: "ring-red-300 dark:ring-red-700 spooky:ring-red-800/70",
      books: "ring-indigo-300 dark:ring-indigo-700 spooky:ring-indigo-800/70",
      default: "ring-gray-300 dark:ring-gray-700 spooky:ring-gray-800/70",
    },
  },
  defaultVariants: {
    variant: "default",
  }
});

export interface BadgeIconProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeIconVariants> {
  icon: string;
  withBackground?: boolean;
  tooltipText?: string;
  progress?: number;
}

export function BadgeIcon({
  className,
  variant,
  size,
  state,
  icon,
  withBackground = false,
  tooltipText,
  progress,
  ...props
}: BadgeIconProps) {
  const iconClasses = cn(
    badgeIconVariants({ variant, size, state }),
    state === "earned" ? ringVariants({ variant }) : "",
    className
  );
  
  const bgClasses = cn(
    badgeBgVariants({ variant, state }),
    className
  );
  
  const iconComponent = (
    <div className={iconClasses} data-tooltip={tooltipText} {...props}>
      <i className={icon}></i>
      {progress !== undefined && progress < 100 && state !== "earned" && (
        <div className="absolute -bottom-1 -right-1 bg-white dark:bg-gray-800 spooky:bg-gray-900/80 text-xs rounded-full h-4 w-4 flex items-center justify-center border border-gray-200 dark:border-gray-700 spooky:border-gray-800/70">
          {progress}%
        </div>
      )}
    </div>
  );
  
  if (withBackground) {
    return (
      <div className={bgClasses}>
        {iconComponent}
      </div>
    );
  }
  
  return iconComponent;
}

// Badge container for multiple badges
export interface BadgeContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  direction?: "horizontal" | "vertical";
  compact?: boolean;
}

export function BadgeContainer({
  className,
  children,
  direction = "horizontal",
  compact = false,
  ...props
}: BadgeContainerProps) {
  return (
    <div 
      className={cn(
        "flex",
        direction === "horizontal" ? "flex-row" : "flex-col",
        compact ? "gap-1" : "gap-3",
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
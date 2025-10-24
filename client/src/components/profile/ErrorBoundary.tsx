import React, { Component, ReactNode } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface Props {
  children: ReactNode;
  fallback?: ReactNode;
  onRetry?: () => void;
  title?: string;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("ErrorBoundary caught an error:", error, errorInfo);
  }

  handleRetry = () => {
    this.setState({ hasError: false, error: undefined });
    this.props.onRetry?.();
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-destructive">
              <i className="ri-error-warning-line"></i>
              {this.props.title || "Something went wrong"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Alert variant="destructive">
              <AlertDescription>
                {this.state.error?.message || "An unexpected error occurred while loading this section."}
              </AlertDescription>
            </Alert>
            
            <div className="flex gap-3">
              <Button onClick={this.handleRetry} variant="outline" size="sm">
                <i className="ri-refresh-line mr-2"></i>
                Try Again
              </Button>
              <Button 
                onClick={() => window.location.reload()} 
                variant="ghost" 
                size="sm"
              >
                <i className="ri-restart-line mr-2"></i>
                Reload Page
              </Button>
            </div>
          </CardContent>
        </Card>
      );
    }

    return this.props.children;
  }
}

// Hook-based error boundary for functional components
interface ErrorFallbackProps {
  error: Error;
  resetError: () => void;
  title?: string;
}

export function ErrorFallback({ error, resetError, title }: ErrorFallbackProps) {
  return (
    <Card className="rounded-[20px] bg-card text-card-foreground shadow-[10px_10px_20px_rgba(59,130,246,0.12),-10px_-10px_20px_rgba(147,197,253,0.08)]">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <i className="ri-error-warning-line"></i>
          {title || "Something went wrong"}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="destructive">
          <AlertDescription>
            {error.message || "An unexpected error occurred while loading this section."}
          </AlertDescription>
        </Alert>
        
        <div className="flex gap-3">
          <Button onClick={resetError} variant="outline" size="sm">
            <i className="ri-refresh-line mr-2"></i>
            Try Again
          </Button>
          <Button 
            onClick={() => window.location.reload()} 
            variant="ghost" 
            size="sm"
          >
            <i className="ri-restart-line mr-2"></i>
            Reload Page
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

// Inline error component for smaller errors
interface InlineErrorProps {
  error: Error | string;
  onRetry?: () => void;
  className?: string;
}

export function InlineError({ error, onRetry, className = "" }: InlineErrorProps) {
  const errorMessage = typeof error === 'string' ? error : error.message;
  
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="text-center space-y-3">
        <i className="ri-error-warning-line text-4xl text-destructive"></i>
        <div>
          <p className="text-sm font-medium text-destructive mb-1">Error</p>
          <p className="text-xs text-muted-foreground max-w-sm">
            {errorMessage || "Something went wrong"}
          </p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <i className="ri-refresh-line mr-2"></i>
            Retry
          </Button>
        )}
      </div>
    </div>
  );
}

// Network error component with offline detection
interface NetworkErrorProps {
  onRetry?: () => void;
  className?: string;
}

export function NetworkError({ onRetry, className = "" }: NetworkErrorProps) {
  const isOnline = navigator.onLine;
  
  return (
    <div className={`flex items-center justify-center py-8 ${className}`}>
      <div className="text-center space-y-3">
        <i className={`text-4xl ${isOnline ? 'ri-wifi-off-line text-orange-500' : 'ri-signal-wifi-off-line text-red-500'}`}></i>
        <div>
          <p className="text-sm font-medium text-destructive mb-1">
            {isOnline ? 'Connection Error' : 'You\'re Offline'}
          </p>
          <p className="text-xs text-muted-foreground max-w-sm">
            {isOnline 
              ? 'Unable to connect to the server. Please check your connection and try again.'
              : 'Please check your internet connection and try again.'
            }
          </p>
        </div>
        {onRetry && (
          <Button onClick={onRetry} variant="outline" size="sm">
            <i className="ri-refresh-line mr-2"></i>
            {isOnline ? 'Retry' : 'Try Again'}
          </Button>
        )}
      </div>
    </div>
  );
}
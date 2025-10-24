import { useState, useCallback } from "react";
import { useToast } from "@/hooks/use-toast";

interface RetryOptions {
  maxAttempts?: number;
  delay?: number;
  backoff?: boolean;
  onRetry?: (attempt: number) => void;
  onMaxAttemptsReached?: () => void;
}

interface RetryState {
  isRetrying: boolean;
  attempts: number;
  lastError: Error | null;
}

export function useRetry(options: RetryOptions = {}) {
  const {
    maxAttempts = 3,
    delay = 1000,
    backoff = true,
    onRetry,
    onMaxAttemptsReached,
  } = options;

  const { toast } = useToast();
  const [retryState, setRetryState] = useState<RetryState>({
    isRetrying: false,
    attempts: 0,
    lastError: null,
  });

  const executeWithRetry = useCallback(
    async <T>(operation: () => Promise<T>): Promise<T> => {
      let currentAttempt = 0;
      let lastError: Error;

      while (currentAttempt < maxAttempts) {
        try {
          setRetryState({
            isRetrying: currentAttempt > 0,
            attempts: currentAttempt,
            lastError: null,
          });

          const result = await operation();
          
          // Reset state on success
          setRetryState({
            isRetrying: false,
            attempts: 0,
            lastError: null,
          });

          return result;
        } catch (error) {
          lastError = error instanceof Error ? error : new Error(String(error));
          currentAttempt++;

          setRetryState({
            isRetrying: true,
            attempts: currentAttempt,
            lastError,
          });

          if (currentAttempt < maxAttempts) {
            onRetry?.(currentAttempt);
            
            // Calculate delay with optional backoff
            const currentDelay = backoff ? delay * Math.pow(2, currentAttempt - 1) : delay;
            
            toast({
              title: "Retrying...",
              description: `Attempt ${currentAttempt + 1} of ${maxAttempts}`,
              duration: 2000,
            });

            await new Promise(resolve => setTimeout(resolve, currentDelay));
          }
        }
      }

      // Max attempts reached
      setRetryState({
        isRetrying: false,
        attempts: maxAttempts,
        lastError: lastError!,
      });

      onMaxAttemptsReached?.();
      
      toast({
        title: "Operation failed",
        description: `Failed after ${maxAttempts} attempts: ${lastError!.message}`,
        variant: "destructive",
      });

      throw lastError!;
    },
    [maxAttempts, delay, backoff, onRetry, onMaxAttemptsReached, toast]
  );

  const reset = useCallback(() => {
    setRetryState({
      isRetrying: false,
      attempts: 0,
      lastError: null,
    });
  }, []);

  return {
    executeWithRetry,
    reset,
    ...retryState,
  };
}

// Hook for manual retry functionality
export function useManualRetry() {
  const [isRetrying, setIsRetrying] = useState(false);
  const { toast } = useToast();

  const retry = useCallback(async (operation: () => Promise<void>) => {
    if (isRetrying) return;

    setIsRetrying(true);
    try {
      await operation();
      toast({
        title: "Success",
        description: "Operation completed successfully",
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : "Operation failed";
      toast({
        title: "Retry failed",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsRetrying(false);
    }
  }, [isRetrying, toast]);

  return { retry, isRetrying };
}
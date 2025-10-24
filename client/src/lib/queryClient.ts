import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export async function apiRequest(
  method: string,
  url: string,
  data?: unknown | undefined,
): Promise<Response> {
  console.log(`Making API request: ${method} ${url}`, data ? JSON.stringify(data) : 'no data');
  
  try {
    const res = await fetch(url, {
      method,
      headers: data ? { "Content-Type": "application/json" } : {},
      body: data ? JSON.stringify(data) : undefined,
      credentials: "include",
    });
    
    console.log(`API response: ${res.status} ${res.statusText}`);
    
    if (!res.ok) {
      const errorText = await res.text();
      console.error(`API error (${res.status}): ${errorText}`);
      throw new Error(`${res.status}: ${errorText || res.statusText}`);
    }
    
    return res;
  } catch (error) {
    console.error(`API request failed: ${error}`);
    throw error;
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    console.log(`Making query request: GET ${queryKey[0]}`);
    
    try {
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });
      
      console.log(`Query response: ${res.status} ${res.statusText}`);
      
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        console.log("Returning null due to 401 with returnNull behavior");
        return null;
      }
      
      if (!res.ok) {
        const errorText = await res.text();
        console.error(`Query error (${res.status}): ${errorText}`);
        throw new Error(`${res.status}: ${errorText || res.statusText}`);
      }
      
      const data = await res.json();
      console.log(`Query successful with data:`, data);
      return data;
    } catch (error) {
      console.error(`Query request failed: ${error}`);
      throw error;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 1000 * 60 * 5, // 5 minutes default stale time
      gcTime: 1000 * 60 * 30, // 30 minutes garbage collection time
      retry: (failureCount, error) => {
        // Don't retry on 4xx errors except 408, 429
        if (error instanceof Error && error.message.includes('4')) {
          const status = parseInt(error.message.split(':')[0]);
          if (status >= 400 && status < 500 && status !== 408 && status !== 429) {
            return false;
          }
        }
        return failureCount < 3;
      },
      retryDelay: (attemptIndex) => Math.min(1000 * 2 ** attemptIndex, 30000),
    },
    mutations: {
      retry: (failureCount, error) => {
        // Don't retry mutations on client errors
        if (error instanceof Error && error.message.includes('4')) {
          const status = parseInt(error.message.split(':')[0]);
          if (status >= 400 && status < 500) {
            return false;
          }
        }
        return failureCount < 2;
      },
      retryDelay: 1000,
    },
  },
});

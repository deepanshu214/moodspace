import { QueryClient } from '@tanstack/react-query';
import { storage } from '@/utils/storage';

const QUERY_CACHE_STORAGE_KEY = 'moodspace_query_cache';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      networkMode: 'offlineFirst',
      staleTime: 1000 * 60 * 5, // 5 minutes fresh
      gcTime: 1000 * 60 * 60 * 24, // 24 hours persistent retention
      retry: (failureCount, error: any) => {
        // Don't hammer on 4xx client errors
        if (error?.statusCode >= 400 && error?.statusCode < 500) return false;
        return failureCount < 2;
      },
      refetchOnWindowFocus: false,
      refetchOnReconnect: 'always',
    },
    mutations: {
      networkMode: 'offlineFirst',
      retry: 0,
    },
  },
});

/**
 * Persist critical cached queries to local storage
 */
export async function persistQueryCache(): Promise<void> {
  try {
    const cache = queryClient.getQueryCache();
    const serializableQueries: Record<string, any> = {};

    cache.getAll().forEach((query) => {
      // Only persist stable user and feed queries
      const keyStr = JSON.stringify(query.queryKey);
      if (
        keyStr.includes('currentUser') ||
        keyStr.includes('feed') ||
        keyStr.includes('mood') ||
        keyStr.includes('userStats')
      ) {
        serializableQueries[keyStr] = query.state.data;
      }
    });

    await storage.setItem(QUERY_CACHE_STORAGE_KEY, JSON.stringify(serializableQueries));
  } catch {
    // Graceful fallback for storage quota
  }
}

/**
 * Hydrate React Query cache from local storage on app startup
 */
export async function hydrateQueryCache(): Promise<void> {
  try {
    const raw = await storage.getItem(QUERY_CACHE_STORAGE_KEY);
    if (!raw) return;

    const dataMap: Record<string, any> = JSON.parse(raw);
    Object.entries(dataMap).forEach(([keyStr, data]) => {
      try {
        const queryKey = JSON.parse(keyStr);
        queryClient.setQueryData(queryKey, data);
      } catch {
        // Skip malformed key
      }
    });
  } catch {
    // Storage read fallback
  }
}

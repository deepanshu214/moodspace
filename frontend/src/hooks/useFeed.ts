import { useQuery } from '@tanstack/react-query';
import { feedApi } from '@/api/feed';
import { FeedResponse } from '@/api/types';

export const useFeed = (cursor?: string, limit = 20) => {
  return useQuery<FeedResponse>({
    queryKey: ['feed', cursor, limit],
    queryFn: () => feedApi.getFeed(cursor, limit),
  });
};

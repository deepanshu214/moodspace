import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { communityApi } from '@/api/community';
import { CommunityCreatePayload, CommunityResponse, CreatePostPayload, PostResponse } from '@/api/types';

export const useCommunities = () => {
  return useQuery<CommunityResponse[]>({
    queryKey: ['communities'],
    queryFn: () => communityApi.getCommunities(),
  });
};

export const useCommunityPosts = (communityId: string) => {
  return useQuery<PostResponse[]>({
    queryKey: ['community', communityId, 'posts'],
    queryFn: () => communityApi.getCommunityPosts(communityId),
    enabled: !!communityId,
  });
};

export const useCreateCommunityPost = (communityId: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePostPayload) => communityApi.createPost(communityId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['community', communityId, 'posts'] });
    },
  });
};

export const useCreateCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CommunityCreatePayload) => communityApi.createCommunity(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

export const useJoinCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (communityId: string) => communityApi.joinCommunity(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

export const useLeaveCommunity = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (communityId: string) => communityApi.leaveCommunity(communityId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['communities'] });
    },
  });
};

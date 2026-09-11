import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const FRONTEND_DIR = process.cwd();

test('Stage 8: Community API & Types Verification', async (t) => {
  await t.test('types.ts defines complete community schemas', () => {
    const typesPath = path.join(FRONTEND_DIR, 'src/api/types.ts');
    assert.ok(fs.existsSync(typesPath), 'types.ts must exist');
    const content = fs.readFileSync(typesPath, 'utf8');

    assert.ok(content.includes('export interface CommunityCreatePayload'), 'Must export CommunityCreatePayload');
    assert.ok(content.includes('export interface CommunityResponse'), 'Must export CommunityResponse');
    assert.ok(content.includes('export interface CreatePostPayload'), 'Must export CreatePostPayload');
    assert.ok(content.includes('export interface PostResponse'), 'Must export PostResponse');

    // Field checks
    assert.ok(content.includes('category: string;'), 'Community payload includes category');
    assert.ok(content.includes('privacy?: string;') || content.includes("privacy?: 'public'"), 'Community payload includes privacy');
    assert.ok(content.includes('member_count: number;'), 'CommunityResponse includes member_count');
    assert.ok(content.includes('is_anonymous?: boolean;'), 'CreatePostPayload includes is_anonymous');
    assert.ok(content.includes('has_content_warning?: boolean;'), 'CreatePostPayload includes has_content_warning');
    assert.ok(content.includes('is_pinned?: boolean;'), 'PostResponse includes is_pinned');
  });

  await t.test('community.ts provides full API communication suite', () => {
    const apiPath = path.join(FRONTEND_DIR, 'src/api/community.ts');
    assert.ok(fs.existsSync(apiPath), 'community.ts must exist');
    const content = fs.readFileSync(apiPath, 'utf8');

    assert.ok(content.includes('getCommunities()'), 'Must have getCommunities method');
    assert.ok(content.includes('createCommunity('), 'Must have createCommunity method');
    assert.ok(content.includes('getCommunityPosts('), 'Must have getCommunityPosts method');
    assert.ok(content.includes('createPost('), 'Must have createPost method');
    assert.ok(content.includes('joinCommunity('), 'Must have joinCommunity method');
    assert.ok(content.includes('leaveCommunity('), 'Must have leaveCommunity method');

    assert.ok(content.includes("apiClient.get<CommunityResponse[]>('/community')"), 'getCommunities queries /community');
    assert.ok(content.includes("apiClient.post<CommunityResponse>('/community', payload)"), 'createCommunity posts to /community');
    assert.ok(content.includes('/posts'), 'Post methods target community posts sub-resource');
  });
});

test('Stage 8: React Query Community Hooks Verification', async (t) => {
  await t.test('useCommunity.ts exports query and mutation hooks', () => {
    const hooksPath = path.join(FRONTEND_DIR, 'src/hooks/useCommunity.ts');
    assert.ok(fs.existsSync(hooksPath), 'useCommunity.ts must exist');
    const content = fs.readFileSync(hooksPath, 'utf8');

    const expectedHooks = [
      'useCommunities',
      'useCommunityPosts',
      'useCreateCommunityPost',
      'useCreateCommunity',
      'useJoinCommunity',
      'useLeaveCommunity',
    ];

    for (const hook of expectedHooks) {
      assert.ok(content.includes(`export const ${hook}`), `useCommunity.ts must export ${hook}`);
    }

    // Cache invalidation checks
    assert.ok(content.includes("queryKey: ['communities']"), 'useCommunities caches under communities key');
    assert.ok(content.includes("queryKey: ['community', communityId, 'posts']"), 'useCommunityPosts caches per community');
    assert.ok(content.includes("invalidateQueries({ queryKey: ['community', communityId, 'posts'] })"), 'useCreateCommunityPost invalidates community posts');
    assert.ok(content.includes("invalidateQueries({ queryKey: ['communities'] })"), 'useCreateCommunity invalidates communities cache');
  });

  await t.test('src/hooks/index.ts re-exports all community hooks', () => {
    const indexPath = path.join(FRONTEND_DIR, 'src/hooks/index.ts');
    assert.ok(fs.existsSync(indexPath), 'hooks/index.ts must exist');
    const content = fs.readFileSync(indexPath, 'utf8');
    assert.ok(content.includes("export * from './useCommunity';"), 'hooks index must export useCommunity');
  });
});

test('Stage 8: Community Components Verification', async (t) => {
  await t.test('CommunityMoodGauge component displays atmospheric climate and resonance', () => {
    const gaugePath = path.join(FRONTEND_DIR, 'src/components/community/CommunityMoodGauge.tsx');
    assert.ok(fs.existsSync(gaugePath), 'CommunityMoodGauge.tsx must exist');
    const content = fs.readFileSync(gaugePath, 'utf8');

    assert.ok(content.includes('export interface CommunityMoodGaugeProps'), 'Exports CommunityMoodGaugeProps');
    assert.ok(content.includes('dominantEmotion'), 'Accepts dominantEmotion prop');
    assert.ok(content.includes('resonanceScore'), 'Accepts resonanceScore prop');
    assert.ok(content.includes('distribution'), 'Accepts distribution array prop');
    assert.ok(content.includes('gaugeTrack'), 'Renders gaugeTrack multi-segment bar');
    assert.ok(content.includes('legendRow'), 'Renders legend breakdown row');
    assert.ok(content.includes('theme.getEmotionConfig'), 'Resolves emotion configs dynamically');
  });

  await t.test('CommunityCard component renders category, emotion badge, and join toggle', () => {
    const cardPath = path.join(FRONTEND_DIR, 'src/components/community/CommunityCard.tsx');
    assert.ok(fs.existsSync(cardPath), 'CommunityCard.tsx must exist');
    const content = fs.readFileSync(cardPath, 'utf8');

    assert.ok(content.includes('export interface CommunityCardProps'), 'Exports CommunityCardProps');
    assert.ok(content.includes('useJoinCommunity'), 'Integrates useJoinCommunity hook');
    assert.ok(content.includes('useLeaveCommunity'), 'Integrates useLeaveCommunity hook');
    assert.ok(content.includes('handleToggleJoin'), 'Implements join/leave mutation handler');
    assert.ok(content.includes('categoryPill'), 'Renders category pill');
    assert.ok(content.includes('memberCount'), 'Renders memberCount');
    assert.ok(content.includes('dominantEmotion'), 'Renders dominantEmotion indicator');
    assert.ok(content.includes('privacy'), 'Supports privacy status');
  });

  await t.test('CommunityPostCard component handles anonymization and content warnings', () => {
    const postCardPath = path.join(FRONTEND_DIR, 'src/components/community/CommunityPostCard.tsx');
    assert.ok(fs.existsSync(postCardPath), 'CommunityPostCard.tsx must exist');
    const content = fs.readFileSync(postCardPath, 'utf8');

    assert.ok(content.includes('export interface CommunityPostCardProps'), 'Exports CommunityPostCardProps');
    assert.ok(content.includes('isAnonymous'), 'Supports isAnonymous prop');
    assert.ok(content.includes('hasContentWarning'), 'Supports hasContentWarning prop');
    assert.ok(content.includes('isPinned'), 'Supports isPinned prop');
    assert.ok(content.includes('Wandering Spirit'), 'Renders Wandering Spirit for cloaked posts');
    assert.ok(content.includes('handleToggleLike'), 'Implements optimistic like reaction handler');
    assert.ok(content.includes('setRevealed'), 'Implements spoiler reveal for sensitive posts');
  });

  await t.test('src/components/community/index.ts exports all components', () => {
    const indexPath = path.join(FRONTEND_DIR, 'src/components/community/index.ts');
    assert.ok(fs.existsSync(indexPath), 'components/community/index.ts must exist');
    const content = fs.readFileSync(indexPath, 'utf8');

    assert.ok(content.includes("export * from './CommunityMoodGauge';"), 'Exports CommunityMoodGauge');
    assert.ok(content.includes("export * from './CommunityCard';"), 'Exports CommunityCard');
    assert.ok(content.includes("export * from './CommunityPostCard';"), 'Exports CommunityPostCard');
  });
});

test('Stage 8: Community Screens Verification', async (t) => {
  await t.test('CommunityListScreen provides category filters, search, and list feed', () => {
    const screenPath = path.join(FRONTEND_DIR, 'src/screens/community/CommunityListScreen.tsx');
    assert.ok(fs.existsSync(screenPath), 'CommunityListScreen.tsx must exist');
    const content = fs.readFileSync(screenPath, 'utf8');

    assert.ok(content.includes('useCommunities'), 'Uses useCommunities hook');
    assert.ok(content.includes('selectedCategory'), 'Manages category filter state');
    assert.ok(content.includes('searchQuery'), 'Manages search query state');
    assert.ok(content.includes('filteredCircles'), 'Computes filtered circles');
    assert.ok(content.includes('CommunityCard'), 'Renders CommunityCard items');
    assert.ok(content.includes("navigation.navigate('CreateCommunity')"), 'Navigates to CreateCommunity');
    assert.ok(content.includes("navigation.navigate('CommunityDetail'"), 'Navigates to CommunityDetail with params');
    assert.ok(content.includes('EmptyState'), 'Renders EmptyState when no circles match');
  });

  await t.test('CommunityDetailScreen provides climate gauge, guidelines, and reflection feed', () => {
    const detailPath = path.join(FRONTEND_DIR, 'src/screens/community/CommunityDetailScreen.tsx');
    assert.ok(fs.existsSync(detailPath), 'CommunityDetailScreen.tsx must exist');
    const content = fs.readFileSync(detailPath, 'utf8');

    assert.ok(content.includes('useCommunityPosts'), 'Uses useCommunityPosts hook');
    assert.ok(content.includes('useJoinCommunity'), 'Uses useJoinCommunity hook');
    assert.ok(content.includes('useLeaveCommunity'), 'Uses useLeaveCommunity hook');
    assert.ok(content.includes('CommunityMoodGauge'), 'Renders CommunityMoodGauge atmospheric climate');
    assert.ok(content.includes('guidelinesExpanded'), 'Supports collapsible safe space charter');
    assert.ok(content.includes('CommunityPostCard'), 'Renders CommunityPostCard items');
    assert.ok(content.includes('POST_FILTER_TABS'), 'Provides post filter tabs');
    assert.ok(content.includes("navigation.navigate('CreateCommunityPost'"), 'Floating FAB navigates to CreateCommunityPost');
  });

  await t.test('CreateCommunityModal enforces validation and calls useCreateCommunity', () => {
    const modalPath = path.join(FRONTEND_DIR, 'src/screens/community/CreateCommunityModal.tsx');
    assert.ok(fs.existsSync(modalPath), 'CreateCommunityModal.tsx must exist');
    const content = fs.readFileSync(modalPath, 'utf8');

    assert.ok(content.includes('useCreateCommunity'), 'Uses useCreateCommunity hook');
    assert.ok(content.includes('CATEGORIES'), 'Provides category options');
    assert.ok(content.includes('PRIVACY_OPTIONS'), 'Provides privacy settings (public, restricted, private)');
    assert.ok(content.includes('name.trim().length < 2'), 'Validates minimum name length');
    assert.ok(content.includes('description.trim().length < 10'), 'Validates minimum description length');
    assert.ok(content.includes('navigation.goBack()'), 'Dismisses modal on completion');
  });

  await t.test('CreateCommunityPostModal provides emotion picker, cloaking, and shield toggles', () => {
    const postModalPath = path.join(FRONTEND_DIR, 'src/screens/community/CreateCommunityPostModal.tsx');
    assert.ok(fs.existsSync(postModalPath), 'CreateCommunityPostModal.tsx must exist');
    const content = fs.readFileSync(postModalPath, 'utf8');

    assert.ok(content.includes('useCreateCommunityPost'), 'Uses useCreateCommunityPost hook');
    assert.ok(content.includes('POST_TYPES'), 'Supports reflection types (reflection, discussion, question, win)');
    assert.ok(content.includes('EMOTIONS'), 'Offers full emotion selector spectrum');
    assert.ok(content.includes('isAnonymous'), 'Supports cloaked identity toggle');
    assert.ok(content.includes('hasContentWarning'), 'Supports sensitive content shield toggle');
    assert.ok(content.includes('content.trim().length < 5'), 'Validates reflection text length');
    assert.ok(content.includes('navigation.goBack()'), 'Dismisses modal on release');
  });

  await t.test('src/screens/community/index.ts exports all 4 screens', () => {
    const indexPath = path.join(FRONTEND_DIR, 'src/screens/community/index.ts');
    assert.ok(fs.existsSync(indexPath), 'screens/community/index.ts must exist');
    const content = fs.readFileSync(indexPath, 'utf8');

    assert.ok(content.includes('CommunityListScreen'), 'Exports CommunityListScreen');
    assert.ok(content.includes('CommunityDetailScreen'), 'Exports CommunityDetailScreen');
    assert.ok(content.includes('CreateCommunityModal'), 'Exports CreateCommunityModal');
    assert.ok(content.includes('CreateCommunityPostModal'), 'Exports CreateCommunityPostModal');
  });
});

test('Stage 8: Navigation Architecture Integration Verification', async (t) => {
  await t.test('types.ts exports CommunityStackParamList and registers routes', () => {
    const navTypesPath = path.join(FRONTEND_DIR, 'src/navigation/types.ts');
    const content = fs.readFileSync(navTypesPath, 'utf8');

    assert.ok(content.includes('export type CommunityStackParamList'), 'Must export CommunityStackParamList');
    assert.ok(content.includes('CommunityList: undefined;'), 'CommunityList route declared');
    assert.ok(content.includes('CommunityDetail:'), 'CommunityDetail route declared with params');
    assert.ok(content.includes('CreateCommunity: undefined;'), 'CreateCommunity route declared');
    assert.ok(content.includes('CreateCommunityPost:'), 'CreateCommunityPost route declared with params');

    assert.ok(content.includes('CommunityFlow: NavigatorScreenParams<CommunityStackParamList>'), 'HomeStackParamList references CommunityFlow');
    assert.ok(content.includes('CommunityFlow: NavigatorScreenParams<CommunityStackParamList>'), 'RootStackParamList references CommunityFlow');
  });

  await t.test('CommunityNavigator.tsx configures stack and modal presentations', () => {
    const navPath = path.join(FRONTEND_DIR, 'src/navigation/CommunityNavigator.tsx');
    assert.ok(fs.existsSync(navPath), 'CommunityNavigator.tsx must exist');
    const content = fs.readFileSync(navPath, 'utf8');

    assert.ok(content.includes('CommunityListScreen'), 'Mounts CommunityListScreen');
    assert.ok(content.includes('CommunityDetailScreen'), 'Mounts CommunityDetailScreen');
    assert.ok(content.includes('CreateCommunityModal'), 'Mounts CreateCommunityModal');
    assert.ok(content.includes('CreateCommunityPostModal'), 'Mounts CreateCommunityPostModal');
    assert.ok(content.includes("presentation: 'modal'"), 'Uses modal presentation for creation flows');
  });

  await t.test('HomeNavigator registers CommunityFlow and AtmosphericPulseRibbon links to it', () => {
    const homeNavPath = path.join(FRONTEND_DIR, 'src/navigation/HomeNavigator.tsx');
    const homeContent = fs.readFileSync(homeNavPath, 'utf8');
    assert.ok(homeContent.includes('CommunityNavigator'), 'Imports CommunityNavigator');
    assert.ok(homeContent.includes('name="CommunityFlow"'), 'Mounts CommunityFlow in HomeNavigator');

    const ribbonPath = path.join(FRONTEND_DIR, 'src/components/mood/AtmosphericPulseRibbon.tsx');
    const ribbonContent = fs.readFileSync(ribbonPath, 'utf8');
    assert.ok(ribbonContent.includes('onCirclesPress?: () => void;'), 'AtmosphericPulseRibbon exposes onCirclesPress');
    assert.ok(ribbonContent.includes('planet-outline'), 'AtmosphericPulseRibbon renders community planet icon');

    const homeScreenPath = path.join(FRONTEND_DIR, 'src/screens/home/HomeScreen.tsx');
    const homeScreenContent = fs.readFileSync(homeScreenPath, 'utf8');
    assert.ok(homeScreenContent.includes("navigation.navigate('CommunityFlow')"), 'HomeScreen wires onCirclesPress to navigate to CommunityFlow');
  });
});

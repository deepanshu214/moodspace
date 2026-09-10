const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const FRONTEND_DIR = __dirname;

test('Stage 7: Users API & Social Hooks Architecture', async (t) => {
  await t.test('usersApi exposes complete profile & connection methods', () => {
    const usersApiPath = path.join(FRONTEND_DIR, 'src/api/users.ts');
    assert.strictEqual(fs.existsSync(usersApiPath), true);
    const content = fs.readFileSync(usersApiPath, 'utf8');

    assert.ok(content.includes('getMe():'), 'Must define getMe');
    assert.ok(content.includes('updateMe('), 'Must define updateMe');
    assert.ok(content.includes('getUserProfile('), 'Must define getUserProfile');
    assert.ok(content.includes('deleteAccount():'), 'Must define deleteAccount');
    assert.ok(content.includes('getFollowers('), 'Must define getFollowers');
    assert.ok(content.includes('getFollowing('), 'Must define getFollowing');
  });

  await t.test('useAuth.ts exports profile management hooks', () => {
    const authHooksPath = path.join(FRONTEND_DIR, 'src/hooks/useAuth.ts');
    assert.strictEqual(fs.existsSync(authHooksPath), true);
    const content = fs.readFileSync(authHooksPath, 'utf8');

    assert.ok(content.includes('useCurrentUser'), 'Must export useCurrentUser');
    assert.ok(content.includes('useUserProfile'), 'Must export useUserProfile');
    assert.ok(content.includes('useUpdateProfile'), 'Must export useUpdateProfile');
    assert.ok(content.includes('useDeleteAccount'), 'Must export useDeleteAccount');
  });

  await t.test('useSocial.ts exports connection & follower query hooks', () => {
    const socialHooksPath = path.join(FRONTEND_DIR, 'src/hooks/useSocial.ts');
    assert.strictEqual(fs.existsSync(socialHooksPath), true);
    const content = fs.readFileSync(socialHooksPath, 'utf8');

    assert.ok(content.includes('useReact'), 'Must export useReact');
    assert.ok(content.includes('useSendConnection'), 'Must export useSendConnection');
    assert.ok(content.includes('useRespondConnection'), 'Must export useRespondConnection');
    assert.ok(content.includes('useFollowers'), 'Must export useFollowers');
    assert.ok(content.includes('useFollowing'), 'Must export useFollowing');
  });
});

test('Stage 7: Social Components & Feed Card', async (t) => {
  await t.test('FeedCard component with empathy reactions and share', () => {
    const feedCardPath = path.join(FRONTEND_DIR, 'src/components/social/FeedCard.tsx');
    assert.strictEqual(fs.existsSync(feedCardPath), true);
    const content = fs.readFileSync(feedCardPath, 'utf8');

    assert.ok(content.includes('export const FeedCard'), 'Must export FeedCard');
    assert.ok(content.includes('useReact()'), 'Must connect useReact hook');
    assert.ok(content.includes('Share.share'), 'Must support social sharing');
    assert.ok(content.includes('AuraDisplay'), 'Must display Aura tier');
    assert.ok(content.includes('weatherCapsule'), 'Must render weather capsule');
  });

  await t.test('FollowUserTile component with connection toggle', () => {
    const tilePath = path.join(FRONTEND_DIR, 'src/components/social/FollowUserTile.tsx');
    assert.strictEqual(fs.existsSync(tilePath), true);
    const content = fs.readFileSync(tilePath, 'utf8');

    assert.ok(content.includes('export const FollowUserTile'), 'Must export FollowUserTile');
    assert.ok(content.includes('onFollowToggle'), 'Must support follow toggle');
    assert.ok(content.includes('AuraDisplay'), 'Must render Aura score');
  });

  await t.test('social index.ts exports all components', () => {
    const indexPath = path.join(FRONTEND_DIR, 'src/components/social/index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');

    assert.ok(content.includes('FeedCard'), 'Must export FeedCard');
    assert.ok(content.includes('FollowUserTile'), 'Must export FollowUserTile');
    assert.ok(content.includes('AuraDisplay'), 'Must export AuraDisplay');
    assert.ok(content.includes('CommentCard'), 'Must export CommentCard');
    assert.ok(content.includes('RequestCard'), 'Must export RequestCard');
  });
});

test('Stage 7: Profile Screens Implementation', async (t) => {
  await t.test('ProfileScreen wires useCurrentUser, useMoodHistory, and connections', () => {
    const profilePath = path.join(FRONTEND_DIR, 'src/screens/profile/ProfileScreen.tsx');
    assert.strictEqual(fs.existsSync(profilePath), true);
    const content = fs.readFileSync(profilePath, 'utf8');

    assert.ok(content.includes('useCurrentUser()'), 'Must call useCurrentUser');
    assert.ok(content.includes('useMoodHistory('), 'Must call useMoodHistory');
    assert.ok(content.includes('AuraDisplay'), 'Must render Aura card');
    assert.ok(content.includes('FollowersList'), 'Must navigate to FollowersList');
    assert.ok(content.includes('EditProfile'), 'Must navigate to EditProfile');
  });

  await t.test('UserProfileScreen wires useUserProfile and useSendConnection', () => {
    const userProfilePath = path.join(FRONTEND_DIR, 'src/screens/profile/UserProfileScreen.tsx');
    assert.strictEqual(fs.existsSync(userProfilePath), true);
    const content = fs.readFileSync(userProfilePath, 'utf8');

    assert.ok(content.includes('useUserProfile('), 'Must call useUserProfile');
    assert.ok(content.includes('useSendConnection()'), 'Must call useSendConnection');
    assert.ok(content.includes('handleFollowToggle'), 'Must handle follow toggle');
    assert.ok(content.includes('ChatsTab'), 'Must support direct messaging');
  });

  await t.test('EditProfileScreen enforces validation and calls useUpdateProfile', () => {
    const editPath = path.join(FRONTEND_DIR, 'src/screens/profile/EditProfileScreen.tsx');
    assert.strictEqual(fs.existsSync(editPath), true);
    const content = fs.readFileSync(editPath, 'utf8');

    assert.ok(content.includes('useUpdateProfile()'), 'Must call useUpdateProfile');
    assert.ok(content.includes('validation.validateDisplayName'), 'Must validate display name');
    assert.ok(content.includes('validation.validateBio'), 'Must validate bio');
    assert.ok(content.includes('EMOTION_PRESETS'), 'Must allow aura tone selection');
  });

  await t.test('FollowRequestsScreen connects to useRespondConnection', () => {
    const reqPath = path.join(FRONTEND_DIR, 'src/screens/profile/FollowRequestsScreen.tsx');
    assert.strictEqual(fs.existsSync(reqPath), true);
    const content = fs.readFileSync(reqPath, 'utf8');

    assert.ok(content.includes('useRespondConnection()'), 'Must call useRespondConnection');
    assert.ok(content.includes('handleAction'), 'Must handle accept/decline');
  });

  await t.test('FollowersListScreen renders segmented tabs for followers and following', () => {
    const listPath = path.join(FRONTEND_DIR, 'src/screens/profile/FollowersListScreen.tsx');
    assert.strictEqual(fs.existsSync(listPath), true);
    const content = fs.readFileSync(listPath, 'utf8');

    assert.ok(content.includes('useFollowers()'), 'Must call useFollowers');
    assert.ok(content.includes('useFollowing()'), 'Must call useFollowing');
    assert.ok(content.includes('FollowUserTile'), 'Must render FollowUserTile items');
  });

  await t.test('SettingsScreen wires useLogout, useDeleteAccount, and privacy switches', () => {
    const settingsPath = path.join(FRONTEND_DIR, 'src/screens/profile/SettingsScreen.tsx');
    assert.strictEqual(fs.existsSync(settingsPath), true);
    const content = fs.readFileSync(settingsPath, 'utf8');

    assert.ok(content.includes('useLogout()'), 'Must call useLogout');
    assert.ok(content.includes('useDeleteAccount()'), 'Must call useDeleteAccount');
    assert.ok(content.includes('incognitoByDefault'), 'Must support incognito toggle');
    assert.ok(content.includes('locationFuzzing'), 'Must support location fuzzing toggle');
  });
});

test('Stage 7: Feed Screen & Navigation Flow', async (t) => {
  await t.test('FeedScreen supports Resonant/Latest modes and emotion filters', () => {
    const feedPath = path.join(FRONTEND_DIR, 'src/screens/feed/FeedScreen.tsx');
    assert.strictEqual(fs.existsSync(feedPath), true);
    const content = fs.readFileSync(feedPath, 'utf8');

    assert.ok(content.includes('useFeed()'), 'Must call useFeed hook');
    assert.ok(content.includes('resonant'), 'Must support resonant mode');
    assert.ok(content.includes('chronological'), 'Must support chronological mode');
    assert.ok(content.includes('EMOTION_FILTERS'), 'Must support emotion filters');
    assert.ok(content.includes('FeedCard'), 'Must render FeedCard items');
    assert.ok(content.includes('RefreshControl'), 'Must support pull-to-refresh');
  });

  await t.test('HomeNavigator and ProfileNavigator register new routes', () => {
    const homeNavPath = path.join(FRONTEND_DIR, 'src/navigation/HomeNavigator.tsx');
    const profileNavPath = path.join(FRONTEND_DIR, 'src/navigation/ProfileNavigator.tsx');
    const homeNavContent = fs.readFileSync(homeNavPath, 'utf8');
    const profileNavContent = fs.readFileSync(profileNavPath, 'utf8');

    assert.ok(homeNavContent.includes('FeedStream'), 'HomeNavigator must register FeedStream');
    assert.ok(profileNavContent.includes('FollowersList'), 'ProfileNavigator must register FollowersList');
  });
});

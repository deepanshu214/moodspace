const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const FRONTEND_DIR = __dirname;

test('Stage 4: Storage & Secure Token Persistence Verification', async (t) => {
  await t.test('storage.ts exists and provides full CRUD interface', () => {
    const storagePath = path.join(FRONTEND_DIR, 'src/utils/storage.ts');
    assert.strictEqual(fs.existsSync(storagePath), true);
    const content = fs.readFileSync(storagePath, 'utf8');
    assert.ok(content.includes('getItem('), 'Must provide getItem');
    assert.ok(content.includes('setItem('), 'Must provide setItem');
    assert.ok(content.includes('removeItem('), 'Must provide removeItem');
    assert.ok(content.includes('STORAGE_KEYS'), 'Must export STORAGE_KEYS constants');
  });

  await t.test('authStore.ts has persistent session lifecycle', () => {
    const authStorePath = path.join(FRONTEND_DIR, 'src/stores/authStore.ts');
    assert.strictEqual(fs.existsSync(authStorePath), true);
    const content = fs.readFileSync(authStorePath, 'utf8');
    assert.ok(content.includes('loadStoredSession:'), 'Must implement loadStoredSession');
    assert.ok(content.includes('storage.setItem(STORAGE_KEYS.AUTH_TOKEN'), 'Must save token on login');
    assert.ok(content.includes('storage.removeItem(STORAGE_KEYS.AUTH_TOKEN'), 'Must clear token on logout');
  });
});

test('Stage 4: Axios Client & QueryClient Architecture Verification', async (t) => {
  await t.test('client.ts configures interceptors for token attachment and error parsing', () => {
    const clientPath = path.join(FRONTEND_DIR, 'src/api/client.ts');
    assert.strictEqual(fs.existsSync(clientPath), true);
    const content = fs.readFileSync(clientPath, 'utf8');
    assert.ok(content.includes('apiClient.interceptors.request.use'), 'Must register request interceptor');
    assert.ok(content.includes('Authorization = `Bearer ${token}`'), 'Must attach bearer token');
    assert.ok(content.includes('apiClient.interceptors.response.use'), 'Must register response interceptor');
    assert.ok(content.includes('statusCode === 401'), 'Must handle 401 token expiration');
  });

  await t.test('queryClient.ts sets up caching and retry policies', () => {
    const qcPath = path.join(FRONTEND_DIR, 'src/api/queryClient.ts');
    assert.strictEqual(fs.existsSync(qcPath), true);
    const content = fs.readFileSync(qcPath, 'utf8');
    assert.ok(content.includes('staleTime:'), 'Must define staleTime');
    assert.ok(content.includes('gcTime:'), 'Must define gcTime');
    assert.ok(content.includes('new QueryClient('), 'Must instantiate QueryClient');
  });
});

test('Stage 4: Complete API Service Modules Verification', async (t) => {
  const apiModules = [
    { file: 'types.ts', exports: ['UserResponse', 'MoodCheckinPayload', 'GlobalPulseResponse', 'FeedResponse'] },
    { file: 'auth.ts', exports: ['login(', 'register(', 'getMe(', 'logout('] },
    { file: 'users.ts', exports: ['getMe(', 'updateMe('] },
    { file: 'mood.ts', exports: ['checkin(', 'getHistory(', 'getNearby('] },
    { file: 'map.ts', exports: ['getHeatmap(', 'getPulse('] },
    { file: 'feed.ts', exports: ['getFeed('] },
    { file: 'social.ts', exports: ['react(', 'sendConnectionRequest(', 'respondToConnection(', 'addComment('] },
    { file: 'notification.ts', exports: ['getNotifications(', 'markRead('] },
    { file: 'community.ts', exports: ['getCommunities(', 'getCommunityPosts(', 'createPost('] },
    { file: 'matching.ts', exports: ['getMatches('] },
    { file: 'index.ts', exports: ['export * from \'./auth\'', 'export * from \'./mood\'', 'export * from \'./map\''] },
  ];

  for (const mod of apiModules) {
    await t.test(`API module src/api/${mod.file} exists and contains required methods`, () => {
      const modPath = path.join(FRONTEND_DIR, 'src/api', mod.file);
      assert.strictEqual(fs.existsSync(modPath), true, `Module ${mod.file} must exist`);
      const content = fs.readFileSync(modPath, 'utf8');
      for (const exp of mod.exports) {
        assert.ok(content.includes(exp), `src/api/${mod.file} must include ${exp}`);
      }
    });
  }
});

test('Stage 4: React Query Hooks Architecture Verification', async (t) => {
  const hookModules = [
    { file: 'useAuth.ts', hooks: ['useLogin', 'useRegister', 'useCurrentUser', 'useLogout'] },
    { file: 'useMood.ts', hooks: ['useMoodCheckin', 'useMoodHistory', 'useNearbyBubbles'] },
    { file: 'useMap.ts', hooks: ['useHeatmap', 'useAtmosphericPulse'] },
    { file: 'useFeed.ts', hooks: ['useFeed'] },
    { file: 'useSocial.ts', hooks: ['useReact', 'useSendConnection', 'useRespondConnection', 'useAddComment'] },
    { file: 'useNotifications.ts', hooks: ['useNotifications', 'useMarkNotificationRead'] },
    { file: 'useCommunity.ts', hooks: ['useCommunities', 'useCommunityPosts', 'useCreateCommunityPost'] },
    { file: 'index.ts', hooks: ['export * from \'./useAuth\'', 'export * from \'./useMood\'', 'export * from \'./useSocial\''] },
  ];

  for (const hookMod of hookModules) {
    await t.test(`Hook module src/hooks/${hookMod.file} exports all required hooks`, () => {
      const hookPath = path.join(FRONTEND_DIR, 'src/hooks', hookMod.file);
      assert.strictEqual(fs.existsSync(hookPath), true, `Hook file ${hookMod.file} must exist`);
      const content = fs.readFileSync(hookPath, 'utf8');
      for (const hook of hookMod.hooks) {
        assert.ok(content.includes(hook), `src/hooks/${hookMod.file} must define ${hook}`);
      }
    });
  }
});

test('Stage 4: App Root Integration Verification', async (t) => {
  await t.test('App.tsx correctly connects QueryClientProvider and session loader', () => {
    const appPath = path.join(FRONTEND_DIR, 'App.tsx');
    const content = fs.readFileSync(appPath, 'utf8');
    assert.ok(content.includes('QueryClientProvider'), 'App.tsx must include QueryClientProvider');
    assert.ok(content.includes('loadStoredSession'), 'App.tsx must trigger loadStoredSession');
  });
});

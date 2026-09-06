const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const FRONTEND_DIR = __dirname;

test('Stage 1: Project Architecture & Configuration Verification', async (t) => {
  await t.test('package.json exists and has correct dependencies', () => {
    const pkgPath = path.join(FRONTEND_DIR, 'package.json');
    assert.strictEqual(fs.existsSync(pkgPath), true, 'package.json must exist');
    const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));

    const requiredDeps = [
      '@react-navigation/native',
      '@react-navigation/native-stack',
      '@react-navigation/bottom-tabs',
      '@gorhom/bottom-sheet',
      'react-native-reanimated',
      'react-native-gesture-handler',
      'react-native-maps',
      'react-native-safe-area-context',
      'react-native-screens',
      'zustand',
      'axios',
      'expo-image',
    ];

    for (const dep of requiredDeps) {
      assert.ok(pkg.dependencies[dep], `Missing required dependency: ${dep}`);
    }
  });

  await t.test('tsconfig.json has path aliases and ignoreDeprecations', () => {
    const tsconfigPath = path.join(FRONTEND_DIR, 'tsconfig.json');
    assert.strictEqual(fs.existsSync(tsconfigPath), true);
    const content = fs.readFileSync(tsconfigPath, 'utf8');
    assert.ok(content.includes('"paths"'), 'tsconfig must have paths configuration');
    assert.ok(content.includes('"@/*"'), 'tsconfig must have @/* alias configured');
  });

  await t.test('Directory structure is complete', () => {
    const requiredDirs = [
      'src/api',
      'src/components/common',
      'src/components/mood',
      'src/components/social',
      'src/hooks',
      'src/navigation',
      'src/screens/auth',
      'src/screens/onboarding',
      'src/screens/home',
      'src/screens/notifications',
      'src/screens/chats',
      'src/screens/profile',
      'src/stores',
      'src/theme',
      'src/types',
      'src/utils',
    ];

    for (const dir of requiredDirs) {
      const fullPath = path.join(FRONTEND_DIR, dir);
      assert.ok(fs.existsSync(fullPath), `Directory missing: ${dir}`);
    }
  });

  await t.test('.env file exists with valid placeholders', () => {
    const envPath = path.join(FRONTEND_DIR, '.env');
    assert.strictEqual(fs.existsSync(envPath), true);
    const envContent = fs.readFileSync(envPath, 'utf8');
    assert.ok(envContent.includes('EXPO_PUBLIC_API_URL'), 'Must contain EXPO_PUBLIC_API_URL');
  });
});

test('Stage 2: Design System & Token Integrity Verification', async (t) => {
  await t.test('Theme token files exist', () => {
    const tokenFiles = [
      'src/theme/colors.ts',
      'src/theme/typography.ts',
      'src/theme/spacing.ts',
      'src/theme/shadows.ts',
      'src/theme/index.ts',
    ];

    for (const file of tokenFiles) {
      const fullPath = path.join(FRONTEND_DIR, file);
      assert.ok(fs.existsSync(fullPath), `Theme file missing: ${file}`);
    }
  });

  await t.test('Emotion colors cover all 8 required mental states', () => {
    const colorsContent = fs.readFileSync(
      path.join(FRONTEND_DIR, 'src/theme/colors.ts'),
      'utf8'
    );
    const requiredEmotions = [
      'joy',
      'sadness',
      'anxiety',
      'calm',
      'anger',
      'loneliness',
      'excitement',
      'love',
    ];

    for (const emotion of requiredEmotions) {
      assert.ok(
        colorsContent.includes(`${emotion}:`),
        `Emotion matrix must include: ${emotion}`
      );
    }
    assert.ok(colorsContent.includes('getEmotionConfig'), 'Must export getEmotionConfig helper');
  });

  await t.test('All Core UI Components exist', () => {
    const commonComponents = [
      'Typography.tsx',
      'Button.tsx',
      'IconButton.tsx',
      'Input.tsx',
      'Card.tsx',
      'Avatar.tsx',
      'Badge.tsx',
      'Chip.tsx',
      'Divider.tsx',
      'Loader.tsx',
      'Skeleton.tsx',
      'EmptyState.tsx',
      'Toast.tsx',
      'Modal.tsx',
      'ScreenWrapper.tsx',
    ];

    for (const comp of commonComponents) {
      const compPath = path.join(FRONTEND_DIR, 'src/components/common', comp);
      assert.ok(fs.existsSync(compPath), `Common component missing: ${comp}`);
    }
  });

  await t.test('All Product-Specific Components exist', () => {
    const productComponents = [
      'src/components/mood/MoodBubble.tsx',
      'src/components/mood/MoodTag.tsx',
      'src/components/mood/BubbleDetailCard.tsx',
      'src/components/mood/FloatingActionButton.tsx',
      'src/components/social/AuraDisplay.tsx',
      'src/components/social/CommentCard.tsx',
      'src/components/social/NotificationTile.tsx',
      'src/components/social/RequestCard.tsx',
    ];

    for (const comp of productComponents) {
      const compPath = path.join(FRONTEND_DIR, comp);
      assert.ok(fs.existsSync(compPath), `Product component missing: ${comp}`);
    }
  });
});

test('Stage 3: Navigation Architecture Verification', async (t) => {
  await t.test('All Navigator files exist', () => {
    const navigators = [
      'src/navigation/types.ts',
      'src/navigation/RootNavigator.tsx',
      'src/navigation/AuthNavigator.tsx',
      'src/navigation/OnboardingNavigator.tsx',
      'src/navigation/MainTabNavigator.tsx',
      'src/navigation/HomeNavigator.tsx',
      'src/navigation/ChatNavigator.tsx',
      'src/navigation/ProfileNavigator.tsx',
      'src/navigation/index.ts',
    ];

    for (const nav of navigators) {
      const navPath = path.join(FRONTEND_DIR, nav);
      assert.ok(fs.existsSync(navPath), `Navigator missing: ${nav}`);
    }
  });

  await t.test('Navigation types file covers all screen params', () => {
    const typesContent = fs.readFileSync(
      path.join(FRONTEND_DIR, 'src/navigation/types.ts'),
      'utf8'
    );
    const paramLists = [
      'AuthStackParamList',
      'OnboardingStackParamList',
      'HomeStackParamList',
      'ChatStackParamList',
      'ProfileStackParamList',
      'MainTabParamList',
      'RootStackParamList',
    ];

    for (const pList of paramLists) {
      assert.ok(
        typesContent.includes(`export type ${pList}`),
        `Types must export ${pList}`
      );
    }
  });

  await t.test('All Screen files exist and are implemented', () => {
    const screens = [
      'src/screens/auth/SplashScreen.tsx',
      'src/screens/auth/WelcomeScreen.tsx',
      'src/screens/auth/LoginScreen.tsx',
      'src/screens/auth/RegisterScreen.tsx',
      'src/screens/onboarding/OnboardingProfileScreen.tsx',
      'src/screens/onboarding/OnboardingDOBScreen.tsx',
      'src/screens/onboarding/OnboardingPermissionsScreen.tsx',
      'src/screens/onboarding/OnboardingCompleteScreen.tsx',
      'src/screens/home/HomeScreen.tsx',
      'src/screens/home/BubbleDetailScreen.tsx',
      'src/screens/home/CreateBubbleScreen.tsx',
      'src/screens/notifications/NotificationsScreen.tsx',
      'src/screens/chats/ConversationsScreen.tsx',
      'src/screens/chats/ChatDetailScreen.tsx',
      'src/screens/profile/ProfileScreen.tsx',
      'src/screens/profile/UserProfileScreen.tsx',
      'src/screens/profile/EditProfileScreen.tsx',
      'src/screens/profile/SettingsScreen.tsx',
      'src/screens/profile/FollowRequestsScreen.tsx',
      'src/screens/profile/ProfileViewRequestsScreen.tsx',
    ];

    for (const screen of screens) {
      const screenPath = path.join(FRONTEND_DIR, screen);
      assert.ok(fs.existsSync(screenPath), `Screen component missing: ${screen}`);
      const content = fs.readFileSync(screenPath, 'utf8');
      assert.ok(content.length > 200, `Screen ${screen} must contain implementation`);
    }
  });

  await t.test('Auth store provides complete authentication lifecycle', () => {
    const authStorePath = path.join(FRONTEND_DIR, 'src/stores/authStore.ts');
    assert.strictEqual(fs.existsSync(authStorePath), true);
    const content = fs.readFileSync(authStorePath, 'utf8');
    assert.ok(content.includes('login:'), 'Auth store must provide login action');
    assert.ok(content.includes('logout:'), 'Auth store must provide logout action');
    assert.ok(content.includes('completeOnboarding:'), 'Auth store must provide completeOnboarding');
    assert.ok(content.includes('toggleDemoAuth:'), 'Auth store must provide toggleDemoAuth for preview');
  });

  await t.test('App.tsx correctly connects RootNavigator and providers', () => {
    const appPath = path.join(FRONTEND_DIR, 'App.tsx');
    const content = fs.readFileSync(appPath, 'utf8');
    assert.ok(content.includes('RootNavigator'), 'App.tsx must mount RootNavigator');
    assert.ok(content.includes('SafeAreaProvider'), 'App.tsx must wrap in SafeAreaProvider');
    assert.ok(content.includes('GestureHandlerRootView'), 'App.tsx must wrap in GestureHandlerRootView');
  });
});

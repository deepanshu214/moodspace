import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const FRONTEND_DIR = process.cwd();

test('Stage 13: Animation & Motion Physics Tokens Verification', async (t) => {
  await t.test('animations.ts defines organic spring configurations and timing tokens', () => {
    const animPath = path.join(FRONTEND_DIR, 'src/theme/animations.ts');
    assert.ok(fs.existsSync(animPath), 'animations.ts must exist');
    const content = fs.readFileSync(animPath, 'utf8');

    // Springs
    assert.ok(content.includes('export const springs'), 'Exports springs');
    assert.ok(content.includes('default:'), 'Defines default spring');
    assert.ok(content.includes('bouncy:'), 'Defines bouncy spring');
    assert.ok(content.includes('slow:'), 'Defines slow spring');
    assert.ok(content.includes('snappy:'), 'Defines snappy spring');
    assert.ok(content.includes('gentle:'), 'Defines gentle spring');

    // Timing
    assert.ok(content.includes('export const timing'), 'Exports timing tokens');
    assert.ok(content.includes('quick: 200'), 'Defines quick timing');
    assert.ok(content.includes('standard: 350'), 'Defines standard timing');
    assert.ok(content.includes('breathe: 2000'), 'Defines breathe timing');

    // Easings
    assert.ok(content.includes('export const easings'), 'Exports easings');
    assert.ok(content.includes('breathe:'), 'Defines breathe easing curve');
  });

  await t.test('theme index.ts re-exports springs, timing, and easings', () => {
    const indexPath = path.join(FRONTEND_DIR, 'src/theme/index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');
    assert.ok(content.includes('springs,'), 'Exports springs in theme');
    assert.ok(content.includes('timing,'), 'Exports timing in theme');
    assert.ok(content.includes('easings,'), 'Exports easings in theme');
  });
});

test('Stage 13: Safe Haptic Feedback Engine Verification', async (t) => {
  await t.test('haptics.ts provides multi-tier tactile feedback with web safe fallback', () => {
    const hapticPath = path.join(FRONTEND_DIR, 'src/theme/haptics.ts');
    assert.ok(fs.existsSync(hapticPath), 'haptics.ts must exist');
    const content = fs.readFileSync(hapticPath, 'utf8');

    assert.ok(content.includes('export const haptics'), 'Exports haptics object');
    assert.ok(content.includes('light:'), 'Provides light feedback');
    assert.ok(content.includes('medium:'), 'Provides medium feedback');
    assert.ok(content.includes('heavy:'), 'Provides heavy feedback');
    assert.ok(content.includes('selection:'), 'Provides selection feedback');
    assert.ok(content.includes('success:'), 'Provides success notification');
    assert.ok(content.includes('warning:'), 'Provides warning notification');
    assert.ok(content.includes('error:'), 'Provides error notification');
    assert.ok(content.includes("Platform.OS === 'web'"), 'Protects against Web crashes');
  });
});

test('Stage 13: Atmospheric Visual Effects Components Verification', async (t) => {
  await t.test('GlowOrb renders breathing animated radial light aura', () => {
    const orbPath = path.join(FRONTEND_DIR, 'src/components/effects/GlowOrb.tsx');
    assert.ok(fs.existsSync(orbPath), 'GlowOrb.tsx must exist');
    const content = fs.readFileSync(orbPath, 'utf8');

    assert.ok(content.includes('export const GlowOrb'), 'Exports GlowOrb');
    assert.ok(content.includes('scale.value = withRepeat'), 'Uses repeating scale animation');
    assert.ok(content.includes('opacity.value = withRepeat'), 'Uses repeating opacity animation');
    assert.ok(content.includes('glowOuter'), 'Renders outer glow layer');
    assert.ok(content.includes('glowInner'), 'Renders inner concentrated core');
  });

  await t.test('ParticleCanvas renders drifting ambient particles', () => {
    const canvasPath = path.join(FRONTEND_DIR, 'src/components/effects/ParticleCanvas.tsx');
    assert.ok(fs.existsSync(canvasPath), 'ParticleCanvas.tsx must exist');
    const content = fs.readFileSync(canvasPath, 'utf8');

    assert.ok(content.includes('export const ParticleCanvas'), 'Exports ParticleCanvas');
    assert.ok(content.includes('translateY.value = withRepeat'), 'Animates vertical drift');
    assert.ok(content.includes('SingleParticle'), 'Encapsulates single particle component');
  });

  await t.test('NoiseBackground orchestrates layered atmospheric backdrops', () => {
    const bgPath = path.join(FRONTEND_DIR, 'src/components/effects/NoiseBackground.tsx');
    assert.ok(fs.existsSync(bgPath), 'NoiseBackground.tsx must exist');
    const content = fs.readFileSync(bgPath, 'utf8');

    assert.ok(content.includes('export const NoiseBackground'), 'Exports NoiseBackground');
    assert.ok(content.includes('<GlowOrb'), 'Mounts GlowOrb elements');
    assert.ok(content.includes('overlay'), 'Includes depth overlay');
  });

  await t.test('effects barrel and components index.ts export all effects', () => {
    const barrelPath = path.join(FRONTEND_DIR, 'src/components/effects/index.ts');
    assert.ok(fs.existsSync(barrelPath), 'effects/index.ts must exist');

    const globalPath = path.join(FRONTEND_DIR, 'src/components/index.ts');
    const globalContent = fs.readFileSync(globalPath, 'utf8');
    assert.ok(globalContent.includes("export * from './effects';"), 'Components index re-exports ./effects');
  });
});

test('Stage 13: Core Components Motion & Interaction Upgrades Verification', async (t) => {
  await t.test('Button provides spring press scale and tactile haptic response', () => {
    const buttonPath = path.join(FRONTEND_DIR, 'src/components/common/Button.tsx');
    const content = fs.readFileSync(buttonPath, 'utf8');

    assert.ok(content.includes('withSpring'), 'Uses spring physics for button press');
    assert.ok(content.includes('haptics.light()'), 'Triggers light haptic feedback');
    assert.ok(content.includes('theme.radius.round'), 'Supports pill button shape');
  });

  await t.test('Card provides spring scale press, haptics, and emotion accent strip', () => {
    const cardPath = path.join(FRONTEND_DIR, 'src/components/common/Card.tsx');
    const content = fs.readFileSync(cardPath, 'utf8');

    assert.ok(content.includes('accentStrip'), 'Renders emotion accent indicator strip');
    assert.ok(content.includes('withSpring'), 'Uses spring physics on interactive press');
  });

  await t.test('Avatar provides pulsing online presence dot animation', () => {
    const avatarPath = path.join(FRONTEND_DIR, 'src/components/common/Avatar.tsx');
    const content = fs.readFileSync(avatarPath, 'utf8');

    assert.ok(content.includes('pulseScale.value = withRepeat'), 'Loops presence pulse scale');
    assert.ok(content.includes('isAnonymous'), 'Supports anonymous spirit avatar state');
  });

  await t.test('Toast provides slide-in spring physics and auto-dismiss timer', () => {
    const toastPath = path.join(FRONTEND_DIR, 'src/components/common/Toast.tsx');
    const content = fs.readFileSync(toastPath, 'utf8');

    assert.ok(content.includes('translateY.value = withSpring'), 'Enters with spring slide-in');
    assert.ok(content.includes('autoDismissMs'), 'Provides configurable auto-dismiss');
  });

  await t.test('EmptyState provides levitation floating physics', () => {
    const emptyPath = path.join(FRONTEND_DIR, 'src/components/common/EmptyState.tsx');
    const content = fs.readFileSync(emptyPath, 'utf8');

    assert.ok(content.includes('floatY.value = withRepeat'), 'Floats with gentle repeating levitation');
  });
});

test('Stage 13: Navigation & Virtualized List Motion Verification', async (t) => {
  await t.test('FeedScreen uses FlashList for virtualized 60fps performance', () => {
    const feedPath = path.join(FRONTEND_DIR, 'src/screens/feed/FeedScreen.tsx');
    const content = fs.readFileSync(feedPath, 'utf8');

    assert.ok(content.includes("from '@shopify/flash-list'"), 'Imports from @shopify/flash-list');
    assert.ok(content.includes('<FlashList'), 'Renders high-performance FlashList component');
  });

  await t.test('MainTabNavigator integrates frosted BlurView and spring center button', () => {
    const tabPath = path.join(FRONTEND_DIR, 'src/navigation/MainTabNavigator.tsx');
    const content = fs.readFileSync(tabPath, 'utf8');

    assert.ok(content.includes('BlurView'), 'Uses BlurView for frosted glass effect');
    assert.ok(content.includes('CenterFabButton'), 'Uses animated spring CenterFabButton');
    assert.ok(content.includes('haptics.medium()'), 'Triggers haptics on FAB press');
  });
});

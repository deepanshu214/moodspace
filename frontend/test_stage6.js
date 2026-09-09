const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const FRONTEND_DIR = __dirname;

test('Stage 6: Custom Map Style & Obsidian Theme', async (t) => {
  await t.test('mapStyle.ts exists and defines darkMapStyle', () => {
    const mapStylePath = path.join(FRONTEND_DIR, 'src/theme/mapStyle.ts');
    assert.strictEqual(fs.existsSync(mapStylePath), true);
    const content = fs.readFileSync(mapStylePath, 'utf8');
    assert.ok(content.includes('export const darkMapStyle'), 'Must export darkMapStyle');
    assert.ok(content.includes('#0B0D15'), 'Must feature obsidian dark background');
    assert.ok(content.includes('featureType: \'poi\''), 'Must style POI layers');
  });

  await t.test('theme/index.ts exports darkMapStyle', () => {
    const themeIndexPath = path.join(FRONTEND_DIR, 'src/theme/index.ts');
    const content = fs.readFileSync(themeIndexPath, 'utf8');
    assert.ok(content.includes('darkMapStyle'), 'theme/index.ts must export darkMapStyle');
  });
});

test('Stage 6: Atmospheric Pulse Ribbon Header', async (t) => {
  const ribbonPath = path.join(FRONTEND_DIR, 'src/components/mood/AtmosphericPulseRibbon.tsx');
  assert.strictEqual(fs.existsSync(ribbonPath), true);
  const content = fs.readFileSync(ribbonPath, 'utf8');

  assert.ok(content.includes('export const AtmosphericPulseRibbon'), 'Must export AtmosphericPulseRibbon');
  assert.ok(content.includes('useAnimatedStyle'), 'Must use Reanimated for pulsing halo');
  assert.ok(content.includes('dominantEmotion'), 'Must display dominant atmospheric emotion');
  assert.ok(content.includes('intensityAverage'), 'Must display average intensity');
  assert.ok(content.includes('activeBubblesCount'), 'Must display active bubble count');
  assert.ok(content.includes('onSelectFilter'), 'Must support interactive emotion filtering');
  assert.ok(content.includes('onRecenterPress'), 'Must support recentering map viewport');
});

test('Stage 6: Luminous Breathing Mood Bubble Marker', async (t) => {
  const bubblePath = path.join(FRONTEND_DIR, 'src/components/mood/LuminousMoodBubble.tsx');
  assert.strictEqual(fs.existsSync(bubblePath), true);
  const content = fs.readFileSync(bubblePath, 'utf8');

  assert.ok(content.includes('export const LuminousMoodBubble'), 'Must export LuminousMoodBubble');
  assert.ok(content.includes('withRepeat'), 'Must use continuous harmonic breathing animation');
  assert.ok(content.includes('animatedHalo1Style'), 'Must render responsive inner corona');
  assert.ok(content.includes('animatedHalo2Style'), 'Must render harmonic outer halo');
  assert.ok(content.includes('floatY'), 'Must feature levitation float animation');
  assert.ok(content.includes('isAnonymous'), 'Must support Incognito ghost echo representation');
  assert.ok(content.includes('intensityFactor'), 'Must dynamically scale glow size by intensity');
});

test('Stage 6: Interactive Bubble Detail Bottom Sheet', async (t) => {
  const sheetPath = path.join(FRONTEND_DIR, 'src/components/mood/BubbleDetailSheet.tsx');
  assert.strictEqual(fs.existsSync(sheetPath), true);
  const content = fs.readFileSync(sheetPath, 'utf8');

  assert.ok(content.includes('export const BubbleDetailSheet'), 'Must export BubbleDetailSheet');
  assert.ok(content.includes('Modal'), 'Must render smooth modal overlay');
  assert.ok(content.includes('handleResonate'), 'Must handle resonance heart burst reaction');
  assert.ok(content.includes('animatedHeartStyle'), 'Must feature spring physics heart pulse');
  assert.ok(content.includes('weatherPill'), 'Must render weather context capsule');
  assert.ok(content.includes('intensityBarFill'), 'Must render visual intensity progress indicator');
  assert.ok(content.includes('replyBar'), 'Must support quick empathy echo reply input');
});

test('Stage 6: Upgraded Home Map Screen', async (t) => {
  const homePath = path.join(FRONTEND_DIR, 'src/screens/home/HomeScreen.tsx');
  assert.strictEqual(fs.existsSync(homePath), true);
  const content = fs.readFileSync(homePath, 'utf8');

  assert.ok(content.includes('AtmosphericPulseRibbon'), 'HomeScreen must render AtmosphericPulseRibbon');
  assert.ok(content.includes('LuminousMoodBubble'), 'HomeScreen must render LuminousMoodBubble markers');
  assert.ok(content.includes('BubbleDetailSheet'), 'HomeScreen must render BubbleDetailSheet');
  assert.ok(content.includes('FloatingActionButton'), 'HomeScreen must render FloatingActionButton');
  assert.ok(content.includes('useAtmosphericPulse'), 'HomeScreen must wire useAtmosphericPulse query');
  assert.ok(content.includes('useNearbyBubbles'), 'HomeScreen must wire useNearbyBubbles query');
  assert.ok(content.includes('darkMapStyle'), 'HomeScreen must apply darkMapStyle');
  assert.ok(content.includes('cosmicGridCanvas'), 'HomeScreen must render cosmic starlight canvas fallback');
});

test('Stage 6: Upgraded Create Bubble Modal Screen', async (t) => {
  const createPath = path.join(FRONTEND_DIR, 'src/screens/home/CreateBubbleScreen.tsx');
  assert.strictEqual(fs.existsSync(createPath), true);
  const content = fs.readFileSync(createPath, 'utf8');

  assert.ok(content.includes('detectedSentiment'), 'Must feature real-time sentiment detection');
  assert.ok(content.includes('INTENSITY_DESCRIPTORS'), 'Must describe intensity levels poetically');
  assert.ok(content.includes('atmosphereGlow'), 'Must render dynamic emotion background glow');
  assert.ok(content.includes('useMoodCheckin'), 'Must wire up useMoodCheckin mutation');
  assert.ok(content.includes('Incognito Spirit'), 'Must support incognito cloak selection');
  assert.ok(content.includes('contextPillRow'), 'Must capture location and weather context');
});

test('Stage 6: Upgraded Bubble Detail Screen', async (t) => {
  const detailPath = path.join(FRONTEND_DIR, 'src/screens/home/BubbleDetailScreen.tsx');
  assert.strictEqual(fs.existsSync(detailPath), true);
  const content = fs.readFileSync(detailPath, 'utf8');

  assert.ok(content.includes('ambientAura'), 'Must render dynamic ambient emotion glow');
  assert.ok(content.includes('BubbleDetailCard'), 'Must render BubbleDetailCard');
  assert.ok(content.includes('CommentCard'), 'Must render supportive echoes');
  assert.ok(content.includes('handleToggleLike'), 'Must support interactive likes/resonance');
  assert.ok(content.includes('handleSendComment'), 'Must support posting new supportive comments');
});

test('Stage 6: Mood Component Barrel Exports', async (t) => {
  const indexPath = path.join(FRONTEND_DIR, 'src/components/mood/index.ts');
  const content = fs.readFileSync(indexPath, 'utf8');

  assert.ok(content.includes('AtmosphericPulseRibbon'), 'Must export AtmosphericPulseRibbon');
  assert.ok(content.includes('LuminousMoodBubble'), 'Must export LuminousMoodBubble');
  assert.ok(content.includes('BubbleDetailSheet'), 'Must export BubbleDetailSheet');
});

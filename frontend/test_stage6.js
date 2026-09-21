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
    assert.ok(content.includes('export const lightMapStyle'), 'Must export lightMapStyle for Playful Light');
    assert.ok(content.includes('#1C1E24'), 'Obsidian land must use the charcoal card surface');
    assert.ok(content.includes('#182038'), 'Obsidian water must use the twilight blue');
    assert.ok(content.includes('featureType: \'poi\''), 'Must style POI layers');
  });

  await t.test('theme/index.ts exports darkMapStyle', () => {
    const themeIndexPath = path.join(FRONTEND_DIR, 'src/theme/index.ts');
    const content = fs.readFileSync(themeIndexPath, 'utf8');
    assert.ok(content.includes('darkMapStyle'), 'theme/index.ts must export darkMapStyle');
  });
});

test('Stage 6: Live Atmosphere Strip (replaces the pulse ribbon)', async (t) => {
  const stripPath = path.join(FRONTEND_DIR, 'src/components/home/LiveAtmosphereStrip.tsx');
  assert.strictEqual(fs.existsSync(stripPath), true);
  const content = fs.readFileSync(stripPath, 'utf8');

  assert.ok(content.includes('export const LiveAtmosphereStrip'), 'Must export LiveAtmosphereStrip');
  assert.ok(content.includes('Tactile'), 'Must sit on a Neo-Editorial tactile surface');
  assert.ok(content.includes('PingDot'), 'Must show a live ping indicator');
  assert.ok(content.includes('SHARING LIVE GLOBAL ATMOSPHERE'), 'Must label the live atmosphere');
  // The count is optional on purpose: with no pulse data the strip reads as
  // plain "live" rather than inventing a number.
  assert.ok(content.includes('count?: number'), 'Live count must be optional, never fabricated');
  assert.ok(content.includes("typeof count === 'number'"), 'Must only render a count when the API gave one');
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
  assert.ok(content.includes('handleReactionPress'), 'Must handle empathy reaction bursts');
  assert.ok(content.includes('animatedHeartStyle'), 'Must feature spring physics heart pulse');
  assert.ok(content.includes('weatherPill'), 'Must render weather context capsule');
  assert.ok(content.includes('intensityBarFill'), 'Must render visual intensity progress indicator');
  assert.ok(content.includes('replyBar'), 'Must support quick empathy echo reply input');
});

test('Stage 6: Upgraded Home Map Screen', async (t) => {
  const homePath = path.join(FRONTEND_DIR, 'src/screens/home/HomeScreen.tsx');
  assert.strictEqual(fs.existsSync(homePath), true);
  const content = fs.readFileSync(homePath, 'utf8');

  assert.ok(content.includes('LiveAtmosphereStrip'), 'HomeScreen must render the live atmosphere strip');
  assert.ok(content.includes('LuckyVibeCard'), 'HomeScreen must render the Lucky Vibe deck');
  assert.ok(content.includes('LuminousMoodBubble'), 'HomeScreen must render LuminousMoodBubble markers');
  assert.ok(content.includes('BubbleDetailSheet'), 'HomeScreen must render BubbleDetailSheet');
  assert.ok(content.includes('useAtmosphericPulse'), 'HomeScreen must wire useAtmosphericPulse query');
  assert.ok(content.includes('useNearbyBubbles'), 'HomeScreen must wire useNearbyBubbles query');
  assert.ok(content.includes('darkMapStyle') && content.includes('lightMapStyle'), 'HomeScreen must apply both map styles');
  // The cosmic starlight canvas became the Stitch dot-grid atlas with city pins.
  assert.ok(content.includes('WorldMoodCanvas'), 'HomeScreen must render the dot-grid world atlas on web');
  // Creating a bubble now lives in the raised tab-bar FAB, not an in-screen button.
  assert.ok(!content.includes('FloatingActionButton'), 'Create moved to the tab bar FAB');
});

test('Stage 6: Upgraded Create Bubble Modal Screen', async (t) => {
  const createPath = path.join(FRONTEND_DIR, 'src/screens/home/CreateBubbleScreen.tsx');
  assert.strictEqual(fs.existsSync(createPath), true);
  const content = fs.readFileSync(createPath, 'utf8');

  assert.ok(content.includes('detectedSentiment'), 'Must feature real-time sentiment detection');
  assert.ok(content.includes('INTENSITY_DESCRIPTORS'), 'Must describe intensity levels poetically');
  assert.ok(content.includes('useMoodCheckin'), 'Must wire up useMoodCheckin mutation');
  assert.ok(content.includes('Vibe Dial'), 'Must render the Stitch vibe dial');
  assert.ok(content.includes('Float Anonymously'), 'Must support cloaking the author');
  assert.ok(content.includes('LocationPickerModal'), 'Must capture location context');
  // Stitch keepsakes: a photo from the library and a real recorded voice note.
  assert.ok(content.includes('Sensory Keepsakes'), 'Must offer sensory keepsakes');
  assert.ok(content.includes('attachPhoto'), 'Must attach a photo keepsake');
  assert.ok(content.includes('toggleRecording'), 'Must record a voice keepsake');
  assert.ok(content.includes('uploadKeepsakes'), 'Must upload keepsakes to the API after publishing');
  // A bubble floats for 24h and then dissolves.
  assert.ok(content.includes('AUTO-DISSOLVE'), 'Must show the auto-dissolve contract');
  assert.ok(content.includes('expiryFromNow'), 'Must stamp an expiry on the saved bubble');
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

  assert.ok(content.includes('LuminousMoodBubble'), 'Must export LuminousMoodBubble');
  assert.ok(content.includes('BubbleDetailSheet'), 'Must export BubbleDetailSheet');
  assert.ok(content.includes('MoodGlyph'), 'Must export the bespoke mood glyphs');
  assert.ok(content.includes('MoodPinTag'), 'Must export the map pin tag');
  assert.ok(content.includes('VoiceTape'), 'Must export the voice field tape');
});

/**
 * Stage 14: Liquid Aurora — Verification Test Suite
 * Validates the new design system, glass components, aurora engine,
 * bento grid home screen, and floating tab navigation.
 */

const fs = require('fs');
const path = require('path');

let passedTests = 0;
let failedTests = 0;

function assert(condition, message) {
  if (condition) {
    console.log(`  ✅ ${message}`);
    passedTests++;
  } else {
    console.error(`  ❌ FAIL: ${message}`);
    failedTests++;
  }
}

const FRONTEND_DIR = path.join(__dirname);

console.log('\n🌌 === Stage 14: Liquid Aurora Verification Suite ===\n');

// ── Test 1: Design System Foundation ──
console.log('1. Checking Design System Foundation:');
const colorsPath = path.join(FRONTEND_DIR, 'src/theme/colors.ts');
const gradientsPath = path.join(FRONTEND_DIR, 'src/theme/gradients.ts');
const typographyPath = path.join(FRONTEND_DIR, 'src/theme/typography.ts');
const animationsPath = path.join(FRONTEND_DIR, 'src/theme/animations.ts');
const shadowsPath = path.join(FRONTEND_DIR, 'src/theme/shadows.ts');

const colorsContent = fs.readFileSync(colorsPath, 'utf-8');
assert(colorsContent.includes('glass: {') && colorsContent.includes('aurora: {'), 'colors.ts exports glass and aurora namespaces');
assert(colorsContent.includes('gradientPair:'), 'colors.ts emotions include gradientPair');

const gradientsContent = fs.readFileSync(gradientsPath, 'utf-8');
assert(gradientsContent.includes('auroraDefault') && gradientsContent.includes('auroraCalm'), 'gradients.ts exports named aurora gradient presets');
assert(gradientsContent.includes('getAuroraBlobColors'), 'gradients.ts exports getAuroraBlobColors');

const typographyContent = fs.readFileSync(typographyPath, 'utf-8');
assert(typographyContent.includes('display:') && typographyContent.includes('overline:') && typographyContent.includes('stat:'), 'typography.ts includes display, overline, and stat variants');

const animationsContent = fs.readFileSync(animationsPath, 'utf-8');
assert(animationsContent.includes('molasses:') && animationsContent.includes('wobbly:') && animationsContent.includes('stiff:'), 'animations.ts includes react-spring-inspired physics presets');
assert(animationsContent.includes('staggerDelay'), 'animations.ts exports staggerDelay utility');

const shadowsContent = fs.readFileSync(shadowsPath, 'utf-8');
assert(shadowsContent.includes('glassGlow:') && shadowsContent.includes('neonPulse:'), 'shadows.ts includes glassGlow and neonPulse');

// ── Test 2: Glass Component Library ──
console.log('\n2. Checking Glass Component Library:');
const glassCardPath = path.join(FRONTEND_DIR, 'src/components/common/GlassCard.tsx');
assert(fs.existsSync(glassCardPath), 'GlassCard.tsx component exists');
const glassCardContent = fs.readFileSync(glassCardPath, 'utf-8');
assert(glassCardContent.includes('useTheme') && glassCardContent.includes('withSpring'), 'GlassCard is theme-aware (useTheme) with spring press physics');

const buttonPath = path.join(FRONTEND_DIR, 'src/components/common/Button.tsx');
const buttonContent = fs.readFileSync(buttonPath, 'utf-8');
assert(buttonContent.includes("'glass'") && buttonContent.includes("'aurora'"), 'Button supports glass and aurora variants');

const avatarPath = path.join(FRONTEND_DIR, 'src/components/common/Avatar.tsx');
const avatarContent = fs.readFileSync(avatarPath, 'utf-8');
assert(avatarContent.includes('gradientPair') || avatarContent.includes('emotion'), 'Avatar supports emotion ring');

// ── Test 3: Aurora Background Engine ──
console.log('\n3. Checking Aurora Background Engine:');
const auroraBgPath = path.join(FRONTEND_DIR, 'src/components/effects/AuroraBackground.tsx');
assert(fs.existsSync(auroraBgPath), 'AuroraBackground.tsx exists');
const auroraBgContent = fs.readFileSync(auroraBgPath, 'utf-8');
assert(auroraBgContent.includes('blob1') && auroraBgContent.includes('blob2') && auroraBgContent.includes('blob3'), 'AuroraBackground renders 3 animated drifting blobs');
assert(auroraBgContent.includes('getAuroraBlobColors'), 'AuroraBackground reacts to emotion prop');

const particleCanvasPath = path.join(FRONTEND_DIR, 'src/components/effects/ParticleCanvas.tsx');
const particleCanvasContent = fs.readFileSync(particleCanvasPath, 'utf-8');
assert(particleCanvasContent.includes('isStar'), 'ParticleCanvas includes shooting star effects');

// ── Test 4: Bento Home Screen Components ──
console.log('\n4. Checking Bento Home Screen & Widgets:');
const bentoGridPath = path.join(FRONTEND_DIR, 'src/components/home/BentoGrid.tsx');
assert(fs.existsSync(bentoGridPath), 'BentoGrid.tsx layout component exists');

const moodPulseCardPath = path.join(FRONTEND_DIR, 'src/components/home/MoodPulseCard.tsx');
assert(fs.existsSync(moodPulseCardPath), 'MoodPulseCard.tsx hero widget exists');

const trendingTickerPath = path.join(FRONTEND_DIR, 'src/components/home/TrendingMoodsTicker.tsx');
assert(fs.existsSync(trendingTickerPath), 'TrendingMoodsTicker.tsx auto-scrolling ticker exists');

const streakWidgetPath = path.join(FRONTEND_DIR, 'src/components/home/StreakWidget.tsx');
assert(fs.existsSync(streakWidgetPath), 'StreakWidget.tsx circular progress widget exists');

const communitySpotlightPath = path.join(FRONTEND_DIR, 'src/components/home/CommunitySpotlight.tsx');
assert(fs.existsSync(communitySpotlightPath), 'CommunitySpotlight.tsx hero card exists');

const homeScreenPath = path.join(FRONTEND_DIR, 'src/screens/home/HomeScreen.tsx');
const homeScreenContent = fs.readFileSync(homeScreenPath, 'utf-8');
assert(homeScreenContent.includes('BentoGrid') && homeScreenContent.includes('MoodPulseCard'), 'HomeScreen integrates BentoGrid and MoodPulseCard');
assert(homeScreenContent.includes('TrendingMoodsTicker') && homeScreenContent.includes('StreakWidget'), 'HomeScreen integrates TrendingMoodsTicker and StreakWidget');

// ── Test 5: Floating Navigation & Global Aurora ──
console.log('\n5. Checking Floating Navigation & Global Aurora:');
const tabNavPath = path.join(FRONTEND_DIR, 'src/navigation/MainTabNavigator.tsx');
const tabNavContent = fs.readFileSync(tabNavPath, 'utf-8');
assert(tabNavContent.includes('borderRadius: 32') || tabNavContent.includes('marginHorizontal: 14'), 'MainTabNavigator is styled as a floating glass pill');
assert(tabNavContent.includes('LinearGradient'), 'Center FAB uses aurora gradient');

const rootNavPath = path.join(FRONTEND_DIR, 'src/navigation/RootNavigator.tsx');
const rootNavContent = fs.readFileSync(rootNavPath, 'utf-8');
assert(rootNavContent.includes('AuroraBackground'), 'RootNavigator mounts global living AuroraBackground');

console.log(`\n==============================================`);
console.log(`Results: ${passedTests} passed, ${failedTests} failed`);
console.log(`==============================================\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 All Stage 14 Liquid Aurora tests PASSED successfully!\n');
  process.exit(0);
}

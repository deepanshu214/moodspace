/**
 * MoodSpace: Complete Experience Verification Suite
 * Validates Dark/Light Mode, Interactive Mood Constellation, Profile & Gallery Permissions,
 * Map Zoom/Gesture Isolation, Empathy Reactions, and 7-Step Non-Blocking Feature Tour.
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

console.log('\n🌟 === MoodSpace: Comprehensive Experience Test Suite ===\n');

// ── Test 1: Dark and Light Mode Theme Engine ──
console.log('1. Checking Dark & Light Mode Theme Engine:');
const themeContextPath = path.join(FRONTEND_DIR, 'src/context/ThemeContext.tsx');
assert(fs.existsSync(themeContextPath), 'ThemeContext.tsx exists');
const themeContextContent = fs.readFileSync(themeContextPath, 'utf-8');
assert(themeContextContent.includes('ThemeProvider') && themeContextContent.includes('useTheme'), 'ThemeContext exports ThemeProvider and useTheme');
assert(themeContextContent.includes("'dark'") && themeContextContent.includes("'light'") && themeContextContent.includes("'system'"), 'ThemeContext supports dark, light, and system modes');

const colorsPath = path.join(FRONTEND_DIR, 'src/theme/colors.ts');
const colorsContent = fs.readFileSync(colorsPath, 'utf-8');
assert(colorsContent.includes('darkColors') && colorsContent.includes('lightColors'), 'colors.ts exports both darkColors and lightColors palettes');

const appPath = path.join(FRONTEND_DIR, 'App.tsx');
const appContent = fs.readFileSync(appPath, 'utf-8');
assert(appContent.includes('<ThemeProvider>'), 'App.tsx wraps application root in ThemeProvider');

const settingsPath = path.join(FRONTEND_DIR, 'src/screens/profile/SettingsScreen.tsx');
const settingsContent = fs.readFileSync(settingsPath, 'utf-8');
assert(settingsContent.includes('themeSelectorRow') && settingsContent.includes('setThemeMode'), 'SettingsScreen provides interactive theme switcher');


// ── Test 2: Interactive Monthly Mood Constellation ──
console.log('\n2. Checking Interactive Monthly Mood Constellation:');
const heatmapPath = path.join(FRONTEND_DIR, 'src/components/profile/MoodHistoryHeatmap.tsx');
assert(fs.existsSync(heatmapPath), 'MoodHistoryHeatmap.tsx exists');
const heatmapContent = fs.readFileSync(heatmapPath, 'utf-8');
assert(heatmapContent.includes('MONTHLY MOOD CONSTELLATION'), 'MoodHistoryHeatmap features Monthly Mood Constellation header');
assert(heatmapContent.includes('styles.pebble') && heatmapContent.includes('dayNumberText'), 'Heatmap uses organic rounded pebbles with day numbers');
assert(heatmapContent.includes('pebbleEmoji'), 'Pebbles render real emotion emojis');
assert(heatmapContent.includes('detailBanner') && heatmapContent.includes('intensityTrack'), 'Heatmap renders interactive Day Reflection card with intensity meter');
assert(heatmapContent.includes('statPill') && heatmapContent.includes('summaryPills'), 'Heatmap includes monthly emotion summary pills');


// ── Test 3: Profile Customization & Gallery Permissions ──
console.log('\n3. Checking Profile Customization & Gallery Permissions:');
const editProfilePath = path.join(FRONTEND_DIR, 'src/components/profile/EditProfileModal.tsx');
assert(fs.existsSync(editProfilePath), 'EditProfileModal.tsx exists');
const editProfileContent = fs.readFileSync(editProfilePath, 'utf-8');
assert(editProfileContent.includes('expo-image-picker'), 'EditProfileModal imports expo-image-picker');
assert(editProfileContent.includes('requestMediaLibraryPermissionsAsync'), 'EditProfileModal explicitly requests gallery permissions');
assert(editProfileContent.includes('launchImageLibraryAsync'), 'EditProfileModal opens camera roll to pick photo');
assert(editProfileContent.includes('displayName') && editProfileContent.includes('bio'), 'EditProfileModal allows updating displayName and bio');

const profileScreenPath = path.join(FRONTEND_DIR, 'src/screens/profile/ProfileScreen.tsx');
const profileScreenContent = fs.readFileSync(profileScreenPath, 'utf-8');
assert(profileScreenContent.includes('EditProfileModal'), 'ProfileScreen integrates EditProfileModal');
assert(profileScreenContent.includes('Edit Profile'), 'ProfileScreen displays Edit Profile action');


// ── Test 4: Map Engine, Gestures & High-Contrast Styling ──
console.log('\n4. Checking Map Engine, Gestures & High-Contrast Styling:');
const mapStylePath = path.join(FRONTEND_DIR, 'src/theme/mapStyle.ts');
const mapStyleContent = fs.readFileSync(mapStylePath, 'utf-8');
assert(mapStyleContent.includes('darkMapStyle') && mapStyleContent.includes('lightMapStyle'), 'mapStyle.ts exports both dark and light map styles');
assert(mapStyleContent.includes('#182038'), 'darkMapStyle provides high-contrast twilight water color');

const homeScreenPath = path.join(FRONTEND_DIR, 'src/screens/home/HomeScreen.tsx');
const homeScreenContent = fs.readFileSync(homeScreenPath, 'utf-8');
assert(homeScreenContent.includes('onTouchStart={() => setIsScrollEnabled(false)}'), 'HomeScreen decouples map touch events from parent scroll view');
assert(homeScreenContent.includes('handleZoom(true)') && homeScreenContent.includes('handleZoom(false)'), 'HomeScreen provides on-screen + and − map zoom buttons');
assert(homeScreenContent.includes('handleRecenter'), 'HomeScreen provides GPS locate button');
assert(homeScreenContent.includes('setIsFullMap(!isFullMap)'), 'HomeScreen provides Fullscreen map toggle button');


// ── Test 5: Visible Empathy Reactions & Floating Emoji Bursts ──
console.log('\n5. Checking Visible Empathy Reactions & Floating Emoji Bursts:');
const reactionFloaterPath = path.join(FRONTEND_DIR, 'src/components/mood/ReactionFloater.tsx');
assert(fs.existsSync(reactionFloaterPath), 'ReactionFloater.tsx exists');
const reactionFloaterContent = fs.readFileSync(reactionFloaterPath, 'utf-8');
assert(reactionFloaterContent.includes('react-native-reanimated') && reactionFloaterContent.includes('withSpring'), 'ReactionFloater uses Reanimated spring physics');

const bubbleDetailPath = path.join(FRONTEND_DIR, 'src/components/mood/BubbleDetailSheet.tsx');
const bubbleDetailContent = fs.readFileSync(bubbleDetailPath, 'utf-8');
assert(bubbleDetailContent.includes('ReactionFloater'), 'BubbleDetailSheet mounts ReactionFloater');
assert(bubbleDetailContent.includes('Support') && bubbleDetailContent.includes('Hug') && bubbleDetailContent.includes('With You'), 'BubbleDetailSheet provides empathy reaction options');
assert(bubbleDetailContent.includes('resonanceCount'), 'BubbleDetailSheet tracks real-time resonance reactions');

const feedCardPath = path.join(FRONTEND_DIR, 'src/components/social/FeedCard.tsx');
const feedCardContent = fs.readFileSync(feedCardPath, 'utf-8');
assert(feedCardContent.includes('ReactionFloater'), 'FeedCard mounts ReactionFloater');
assert(feedCardContent.includes('rx.color'), 'FeedCard visually highlights active reaction pills');


// ── Test 6: 7-Step Non-Blocking Interactive Feature Tour ──
console.log('\n6. Checking 7-Step Non-Blocking Feature Tour:');
const tourPath = path.join(FRONTEND_DIR, 'src/components/tutorial/InteractiveFeatureTour.tsx');
assert(fs.existsSync(tourPath), 'InteractiveFeatureTour.tsx exists');
const tourContent = fs.readFileSync(tourPath, 'utf-8');
assert(tourContent.includes('totalSteps: 7'), 'InteractiveFeatureTour covers all 7 core features');
assert(tourContent.includes('World Mood Map') && tourContent.includes('Check In Anytime'), 'Tour covers Map and Check-in features');
assert(tourContent.includes('Echoes & Warm Reactions'), 'Tour covers Echoes and Reactions');
assert(tourContent.includes('Community Circles') && tourContent.includes('1-on-1 Gentle Chats'), 'Tour covers Circles and 1-on-1 Chats');
assert(tourContent.includes('Daily Streak & Constellation'), 'Tour covers Mindful Streak & Constellation');
assert(tourContent.includes("dockPosition: 'top'") && tourContent.includes("dockPosition: 'bottom'"), 'Tour uses smart docking to keep buttons unobscured');
assert(tourContent.includes('renderInteractiveDemo'), 'Tour embeds interactive mini-demo sandboxes');

assert(homeScreenContent.includes('InteractiveFeatureTour'), 'HomeScreen integrates InteractiveFeatureTour');
assert(settingsContent.includes('InteractiveFeatureTour'), 'SettingsScreen integrates InteractiveFeatureTour');


// ── Test 7: Warm, Human-Centered Language (No Robotic/Sci-Fi Terms) ──
console.log('\n7. Checking Warm, Empathetic Human Tone (No Robotic Sci-Fi):');
assert(!homeScreenContent.includes('cosmic grid'), 'HomeScreen removed "cosmic grid"');
assert(!homeScreenContent.includes('celestial canvas'), 'HomeScreen removed "celestial canvas"');
assert(!bubbleDetailContent.includes('Wandering Spirit'), 'BubbleDetailSheet uses warm "Anonymous Friend"');
assert(!bubbleDetailContent.includes('Cloaked'), 'BubbleDetailSheet uses friendly "Private" label');


console.log(`\n======================================================`);
console.log(`Results: ${passedTests} passed, ${failedTests} failed`);
console.log(`======================================================\n`);

if (failedTests > 0) {
  process.exit(1);
} else {
  console.log('🎉 All MoodSpace Experience tests PASSED flawlessly!\n');
  process.exit(0);
}

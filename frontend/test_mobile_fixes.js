import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

test('Mobile Fix 1: Input.tsx touch responsiveness and keyboard access', () => {
  const inputContent = fs.readFileSync(path.resolve('src/components/common/Input.tsx'), 'utf8');
  assert.ok(inputContent.includes('Pressable'), 'Input.tsx should wrap input container with Pressable');
  assert.ok(inputContent.includes('focus()'), 'Pressable should trigger focus() on text input ref');
  assert.ok(inputContent.includes('pointerEvents="none"'), 'Icons should have pointerEvents="none" so they do not block taps');
  assert.ok(inputContent.includes('minHeight: 52'), 'Input should have generous minimum touch height');
});

test('Mobile Fix 2: Interactive App Walkthrough Tutorial Modal', () => {
  const tutorialContent = fs.readFileSync(path.resolve('src/components/tutorial/AppWalkthroughModal.tsx'), 'utf8');
  const homeContent = fs.readFileSync(path.resolve('src/screens/home/HomeScreen.tsx'), 'utf8');
  const settingsContent = fs.readFileSync(path.resolve('src/screens/profile/SettingsScreen.tsx'), 'utf8');

  assert.ok(tutorialContent.includes('Live Mood Map'), 'Walkthrough should explain the Live Mood Map');
  assert.ok(tutorialContent.includes('Share Your Mood'), 'Walkthrough should explain sharing mood');
  assert.ok(tutorialContent.includes('Community Circles'), 'Walkthrough should explain communities');
  assert.ok(tutorialContent.includes('1-on-1 Friendly Chats'), 'Walkthrough should explain direct chats');
  assert.ok(homeContent.includes('AppWalkthroughModal'), 'HomeScreen should integrate AppWalkthroughModal');
  assert.ok(homeContent.includes('hasSeenAppTour_v1'), 'HomeScreen should check persistent storage for first-time walkthrough');
  assert.ok(settingsContent.includes('View Feature Walkthrough'), 'SettingsScreen should allow re-opening the walkthrough');
  assert.ok(settingsContent.includes('AppWalkthroughModal'), 'SettingsScreen should mount AppWalkthroughModal');
});

test('Mobile Fix 3: Worldwide Location Posting & Detection', () => {
  const locationModal = fs.readFileSync(path.resolve('src/components/location/LocationPickerModal.tsx'), 'utf8');
  const createBubble = fs.readFileSync(path.resolve('src/screens/home/CreateBubbleScreen.tsx'), 'utf8');
  const home = fs.readFileSync(path.resolve('src/screens/home/HomeScreen.tsx'), 'utf8');

  assert.ok(locationModal.includes('expo-location'), 'LocationPickerModal should import expo-location');
  assert.ok(locationModal.includes('getCurrentPositionAsync'), 'LocationPickerModal should query GPS coordinates');
  assert.ok(locationModal.includes('reverseGeocodeAsync'), 'LocationPickerModal should reverse geocode city name');
  assert.ok(locationModal.includes('New Delhi'), 'LocationPickerModal should contain worldwide presets');
  assert.ok(createBubble.includes('LocationPickerModal'), 'CreateBubbleScreen should mount LocationPickerModal');
  assert.ok(createBubble.includes('locationName'), 'CreateBubbleScreen should maintain real location state');
  assert.ok(home.includes('London, UK'), 'HomeScreen default bubbles should span worldwide cities');
});

test('Mobile Fix 4: Plain-English Copy (Friendly & Accessible)', () => {
  const createBubble = fs.readFileSync(path.resolve('src/screens/home/CreateBubbleScreen.tsx'), 'utf8');
  const settings = fs.readFileSync(path.resolve('src/screens/profile/SettingsScreen.tsx'), 'utf8');
  const banner = fs.readFileSync(path.resolve('src/components/common/OfflineBanner.tsx'), 'utf8');

  // Should have clear, friendly plain-English labels
  assert.ok(createBubble.includes('Share Your Mood'), 'CreateBubble should use "Share Your Mood"');
  assert.ok(createBubble.includes('Very Mild (1/10)'), 'CreateBubble should use plain intensity labels');
  assert.ok(createBubble.includes('Overwhelming (10/10)'), 'CreateBubble should use plain intensity labels');
  assert.ok(settings.includes('Allow 1-on-1 Matching'), 'Settings should use plain-English "Allow 1-on-1 Matching"');
  assert.ok(banner.includes('Working Offline'), 'OfflineBanner should use clear "Working Offline"');

  // Should NOT contain archaic/fancy sci-fi jargon in user-facing text
  assert.ok(!createBubble.includes('Resonance Matching'), 'Should not use "Resonance Matching"');
  assert.ok(!settings.includes('Atmospheric Pulse'), 'Settings should not use "Atmospheric Pulse"');
  assert.ok(!banner.includes('Offline Whispers'), 'Banner should not use "Offline Whispers"');
});

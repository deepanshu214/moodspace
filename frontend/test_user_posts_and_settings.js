const fs = require('fs');
const path = require('path');
const assert = require('assert');

let passed = 0;
let total = 0;

function check(desc, condition) {
  total++;
  if (condition) {
    console.log(`  ✅ ${desc}`);
    passed++;
  } else {
    console.error(`  ❌ ${desc}`);
  }
}

console.log('\n📱 === MoodSpace: User Posts, Settings & Guide Verification Suite ===\n');

// 1. User Posts Storage Utility
console.log('1. Checking userPosts.ts utility:');
const userPostsPath = path.join(__dirname, 'src/utils/userPosts.ts');
check('userPosts.ts exists', fs.existsSync(userPostsPath));
const userPostsContent = fs.readFileSync(userPostsPath, 'utf8');
check('Exports getUserPostedBubbles', userPostsContent.includes('export const getUserPostedBubbles'));
check('Exports saveUserPostedBubble', userPostsContent.includes('export const saveUserPostedBubble'));
check('Exports deleteUserPostedBubble', userPostsContent.includes('export const deleteUserPostedBubble'));
check('Uses local storage key moodspace_my_posted_bubbles_v1', userPostsContent.includes('moodspace_my_posted_bubbles_v1'));

// 2. CreateBubbleScreen integration
console.log('\n2. Checking CreateBubbleScreen local persistence:');
const createBubblePath = path.join(__dirname, 'src/screens/home/CreateBubbleScreen.tsx');
const createBubbleContent = fs.readFileSync(createBubblePath, 'utf8');
check('Imports saveUserPostedBubble', createBubbleContent.includes('saveUserPostedBubble'));
check('Calls saveUserPostedBubble on publish', createBubbleContent.includes('await saveUserPostedBubble'));
check('Captures user display name and emotion metadata', createBubbleContent.includes('primary_emotion: selectedEmotion'));

// 3. HomeScreen settings button & post integration
console.log('\n3. Checking HomeScreen Settings button & user post integration:');
const homePath = path.join(__dirname, 'src/screens/home/HomeScreen.tsx');
const homeContent = fs.readFileSync(homePath, 'utf8');
check('HomeScreen has App Settings button', homeContent.includes('accessibilityLabel="App Settings"'));
check('HomeScreen navigates to ProfileTab -> Settings', homeContent.includes("navigate('ProfileTab', { screen: 'Settings' })"));
check('HomeScreen has Guide button', homeContent.includes('setShowTourModal(true)'));
check('HomeScreen loads local user posted bubbles', homeContent.includes('getUserPostedBubbles'));
check('HomeScreen merges user posts into allBubbles for map & feed display', homeContent.includes('myLocalBubbles'));

// 4. ProfileScreen Settings button & My Shared Echoes section
console.log('\n4. Checking ProfileScreen Settings button & My Shared Echoes:');
const profilePath = path.join(__dirname, 'src/screens/profile/ProfileScreen.tsx');
const profileContent = fs.readFileSync(profilePath, 'utf8');
check('ProfileScreen has prominent Settings pill button in top bar', profileContent.includes('styles.settingsPill'));
check('ProfileScreen has Settings button in quick action grid', profileContent.includes('title="Settings"'));
check('ProfileScreen has MY SHARED ECHOES & POSTS section', profileContent.includes('MY SHARED ECHOES & POSTS'));
check('ProfileScreen supports deleting a posted reflection', profileContent.includes('handleDeletePost'));
check('ProfileScreen has empty state with "+ Share Your First Mood" button', profileContent.includes('Share Your First Mood'));

// 5. InteractiveFeatureTour Android & iOS robustness
console.log('\n5. Checking InteractiveFeatureTour Guide robustness:');
const tourPath = path.join(__dirname, 'src/components/tutorial/InteractiveFeatureTour.tsx');
const tourContent = fs.readFileSync(tourPath, 'utf8');
check('InteractiveFeatureTour safe platform container for Android', tourContent.includes("Platform.OS === 'android' ? View : BlurView"));
check('InteractiveFeatureTour has backdrop touch dismiss handler', tourContent.includes('TouchableOpacity style={StyleSheet.absoluteFill}'));
check('InteractiveFeatureTour uses statusBarTranslucent on Android', tourContent.includes('statusBarTranslucent'));
check('InteractiveFeatureTour covers all 7 core steps', tourContent.includes('totalSteps: 7'));

console.log(`\n======================================================`);
console.log(`Results: ${passed} passed, ${total - passed} failed`);
console.log(`======================================================\n`);

if (passed === total) {
  console.log('🎉 All User Posts, Settings & Guide tests PASSED!\n');
  process.exit(0);
} else {
  console.error('⚠️ Some tests failed!\n');
  process.exit(1);
}

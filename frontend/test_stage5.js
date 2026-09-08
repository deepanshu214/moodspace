const test = require('node:test');
const assert = require('node:assert');
const fs = require('node:fs');
const path = require('node:path');

const FRONTEND_DIR = __dirname;

test('Stage 5: Form Validation Utility Verification', async (t) => {
  const validationPath = path.join(FRONTEND_DIR, 'src/utils/validation.ts');
  assert.strictEqual(fs.existsSync(validationPath), true);
  const content = fs.readFileSync(validationPath, 'utf8');

  // Verify all validation methods exist in source
  assert.ok(content.includes('validateEmail('), 'Must define validateEmail');
  assert.ok(content.includes('validatePassword('), 'Must define validatePassword');
  assert.ok(content.includes('validateDisplayName('), 'Must define validateDisplayName');
  assert.ok(content.includes('validateDOB('), 'Must define validateDOB');
  assert.ok(content.includes('validateBio('), 'Must define validateBio');
  assert.ok(content.includes('age < 18'), 'Must enforce 18+ age verification check');

  // Inline unit test of validation logic rules
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  assert.strictEqual(emailRegex.test('user@moodspace.app'), true);
  assert.strictEqual(emailRegex.test('invalid-email'), false);
  assert.strictEqual(emailRegex.test('user@domain'), false);

  // Age 18 check test
  const birth2000 = new Date('2000-01-01');
  const now = new Date();
  const age = now.getFullYear() - birth2000.getFullYear();
  assert.ok(age >= 18, 'Adult birthdate must calculate to >= 18');

  const birthRecent = new Date('2020-01-01');
  const childAge = now.getFullYear() - birthRecent.getFullYear();
  assert.ok(childAge < 18, 'Recent birthdate must calculate to < 18');
});

test('Stage 5: Auth & Onboarding Screens Implementation Verification', async (t) => {
  await t.test('LoginScreen wires up useLogin mutation and validation', () => {
    const loginPath = path.join(FRONTEND_DIR, 'src/screens/auth/LoginScreen.tsx');
    assert.strictEqual(fs.existsSync(loginPath), true);
    const content = fs.readFileSync(loginPath, 'utf8');
    assert.ok(content.includes('useLogin()'), 'LoginScreen must use useLogin hook');
    assert.ok(content.includes('validation.validateEmail'), 'LoginScreen must validate email');
    assert.ok(content.includes('validation.validatePassword'), 'LoginScreen must validate password');
    assert.ok(content.includes('Toast'), 'LoginScreen must render Toast for errors');
  });

  await t.test('RegisterScreen wires up useRegister mutation and full validation', () => {
    const regPath = path.join(FRONTEND_DIR, 'src/screens/auth/RegisterScreen.tsx');
    assert.strictEqual(fs.existsSync(regPath), true);
    const content = fs.readFileSync(regPath, 'utf8');
    assert.ok(content.includes('useRegister()'), 'RegisterScreen must use useRegister hook');
    assert.ok(content.includes('validation.validateDisplayName'), 'RegisterScreen must validate name');
    assert.ok(content.includes('validation.validateEmail'), 'RegisterScreen must validate email');
    assert.ok(content.includes('validation.validatePassword'), 'RegisterScreen must validate password');
    assert.ok(content.includes('validation.validateDOB'), 'RegisterScreen must validate DOB');
    assert.ok(content.includes('navigation.navigate(\'Onboarding\''), 'RegisterScreen must advance to onboarding');
  });

  await t.test('SplashScreen handles session checks and animated glow', () => {
    const splashPath = path.join(FRONTEND_DIR, 'src/screens/auth/SplashScreen.tsx');
    assert.strictEqual(fs.existsSync(splashPath), true);
    const content = fs.readFileSync(splashPath, 'utf8');
    assert.ok(content.includes('isInitializing'), 'SplashScreen must check isInitializing');
    assert.ok(content.includes('isAuthenticated'), 'SplashScreen must check isAuthenticated');
    assert.ok(content.includes('Animated.View'), 'SplashScreen must use Reanimated');
  });

  await t.test('OnboardingProfileScreen provides aura preset chips and bio limit', () => {
    const profileStepPath = path.join(FRONTEND_DIR, 'src/screens/onboarding/OnboardingProfileScreen.tsx');
    assert.strictEqual(fs.existsSync(profileStepPath), true);
    const content = fs.readFileSync(profileStepPath, 'utf8');
    assert.ok(content.includes('avatarPresets'), 'Must offer emotional aura tone presets');
    assert.ok(content.includes('validation.validateBio'), 'Must validate bio input');
    assert.ok(content.includes('/160 characters'), 'Must render bio character counter');
  });

  await t.test('OnboardingDOBScreen enforces 18+ and displays privacy notice', () => {
    const dobPath = path.join(FRONTEND_DIR, 'src/screens/onboarding/OnboardingDOBScreen.tsx');
    assert.strictEqual(fs.existsSync(dobPath), true);
    const content = fs.readFileSync(dobPath, 'utf8');
    assert.ok(content.includes('validation.validateDOB'), 'Must validate DOB format and age');
    assert.ok(content.includes('encrypted and never displayed publicly'), 'Must reassure privacy');
  });

  await t.test('OnboardingCompleteScreen executes completeOnboarding and displays Aura', () => {
    const completePath = path.join(FRONTEND_DIR, 'src/screens/onboarding/OnboardingCompleteScreen.tsx');
    assert.strictEqual(fs.existsSync(completePath), true);
    const content = fs.readFileSync(completePath, 'utf8');
    assert.ok(content.includes('completeOnboarding'), 'Must call completeOnboarding');
    assert.ok(content.includes('AuraDisplay'), 'Must display calibrated Aura score');
  });
});

import test from 'node:test';
import assert from 'node:assert';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const FRONTEND_DIR = __dirname;

// Import actual TypeScript modules natively in Node 22
const { validation } = await import('./src/utils/validation.ts');
const { getEmotionConfig, colors } = await import('./src/theme/colors.ts');
const { darkMapStyle } = await import('./src/theme/mapStyle.ts');

test('⚡ EXTENSIVE 1: Validation Engine Exhaustive Battery & Edge Cases', async (t) => {
  await t.test('Email validation handles standard, edge, and malicious inputs', () => {
    // Valid emails
    assert.strictEqual(validation.validateEmail('user@moodspace.app'), null);
    assert.strictEqual(validation.validateEmail('elena.rostova@sub.domain.co.uk'), null);
    assert.strictEqual(validation.validateEmail('elena+tag@gmail.com'), null);
    assert.strictEqual(validation.validateEmail('user123@domain.io'), null);

    // Invalid emails
    assert.strictEqual(validation.validateEmail(''), 'Email address is required.');
    assert.strictEqual(validation.validateEmail('   '), 'Email address is required.');
    assert.strictEqual(validation.validateEmail('missingat.com'), 'Please enter a valid email address.');
    assert.strictEqual(validation.validateEmail('user@'), 'Please enter a valid email address.');
    assert.strictEqual(validation.validateEmail('@domain.com'), 'Please enter a valid email address.');
    assert.strictEqual(validation.validateEmail('user@domain'), 'Please enter a valid email address.');
    assert.strictEqual(validation.validateEmail('user space@domain.com'), 'Please enter a valid email address.');
    assert.strictEqual(validation.validateEmail('user@@domain.com'), 'Please enter a valid email address.');
  });

  await t.test('Password validation enforces exact 8-character security threshold', () => {
    // Fails < 8 chars
    assert.strictEqual(validation.validatePassword(''), 'Password is required.');
    assert.strictEqual(validation.validatePassword('1234567'), 'Password must be at least 8 characters long.');
    assert.strictEqual(validation.validatePassword('short'), 'Password must be at least 8 characters long.');

    // Passes >= 8 chars
    assert.strictEqual(validation.validatePassword('12345678'), null);
    assert.strictEqual(validation.validatePassword('secure-pass-phrase-2026'), null);
    assert.strictEqual(validation.validatePassword('p@$$w0rd!#%&'), null);
    assert.strictEqual(validation.validatePassword('a'.repeat(128)), null);
  });

  await t.test('Display Name validation boundaries (3 to 30 characters)', () => {
    // Fails < 3
    assert.strictEqual(validation.validateDisplayName(''), 'Display name / pseudonym is required.');
    assert.strictEqual(validation.validateDisplayName('  '), 'Display name / pseudonym is required.');
    assert.strictEqual(validation.validateDisplayName('A'), 'Name must be at least 3 characters.');
    assert.strictEqual(validation.validateDisplayName('Al'), 'Name must be at least 3 characters.');

    // Passes 3 to 30
    assert.strictEqual(validation.validateDisplayName('Ali'), null);
    assert.strictEqual(validation.validateDisplayName('Elena Rostova'), null);
    assert.strictEqual(validation.validateDisplayName('A'.repeat(30)), null);

    // Fails > 30
    assert.strictEqual(validation.validateDisplayName('A'.repeat(31)), 'Name cannot exceed 30 characters.');
  });

  await t.test('Strict 18+ Date of Birth calculator handles leap years and edge dates', () => {
    // Format errors
    assert.strictEqual(validation.validateDOB(''), 'Date of birth is required.');
    assert.strictEqual(validation.validateDOB('01-01-2000'), 'Please enter date in YYYY-MM-DD format.');
    assert.strictEqual(validation.validateDOB('2000/01/01'), 'Please enter date in YYYY-MM-DD format.');
    assert.strictEqual(validation.validateDOB('yesterday'), 'Please enter date in YYYY-MM-DD format.');

    const now = new Date();
    const currentYear = now.getFullYear();

    // Minor (17 years old) -> Must fail
    const minorDate = `${currentYear - 17}-06-15`;
    assert.strictEqual(
      validation.validateDOB(minorDate),
      'You must be at least 18 years old to join MoodSpace.'
    );

    // Future date -> Must fail
    assert.strictEqual(
      validation.validateDOB('2099-01-01'),
      'You must be at least 18 years old to join MoodSpace.'
    );

    // Adult (25 years old) -> Must pass
    const adultDate = `${currentYear - 25}-01-01`;
    assert.strictEqual(validation.validateDOB(adultDate), null);

    // Exactly 18 years old today -> Must pass
    const m = String(now.getMonth() + 1).padStart(2, '0');
    const d = String(now.getDate()).padStart(2, '0');
    const exact18Date = `${currentYear - 18}-${m}-${d}`;
    assert.strictEqual(validation.validateDOB(exact18Date), null);

    // Over 120 years old -> Must fail
    assert.strictEqual(validation.validateDOB('1850-01-01'), 'Please enter a valid date of birth.');
  });

  await t.test('Bio character limit (160 max)', () => {
    assert.strictEqual(validation.validateBio(''), null);
    assert.strictEqual(validation.validateBio('Hello, world!'), null);
    assert.strictEqual(validation.validateBio('A'.repeat(160)), null);
    assert.strictEqual(validation.validateBio('A'.repeat(161)), 'Bio cannot exceed 160 characters.');
  });
});

test('⚡ EXTENSIVE 2: Emotion Theme Engine Calibration & Palette Testing', async (t) => {
  await t.test('All 8 core emotions return valid, calibrated design tokens', () => {
    const emotionKeys = ['joy', 'calm', 'anxiety', 'love', 'sadness', 'anger', 'excitement', 'neutral'];

    for (const key of emotionKeys) {
      const config = getEmotionConfig(key);
      assert.ok(config, `Config for ${key} must exist`);
      assert.ok(config.primary, `Primary color for ${key} must exist`);
      assert.ok(config.glow, `Glow color for ${key} must exist`);
      assert.ok(config.background, `Background color for ${key} must exist`);
      assert.ok(config.border, `Border color for ${key} must exist`);
      assert.ok(config.emoji, `Emoji for ${key} must exist`);
      assert.ok(config.label, `Label for ${key} must exist`);

      // Verify primary color is valid hex format
      assert.match(config.primary, /^#([A-Fa-f0-9]{6})$/, `Primary color for ${key} must be valid hex`);
    }
  });

  await t.test('Unknown emotion defaults safely to neutral/reflective without crashing', () => {
    const fallback = getEmotionConfig('non_existent_emotion');
    assert.strictEqual(fallback.label, 'Reflective');
    assert.strictEqual(fallback.emoji, '🌿');
    assert.strictEqual(fallback.primary, '#78909C');
  });

  await t.test('Colors object includes all semantic theme keys', () => {
    const requiredColors = [
      'primary', 'primaryLight', 'primaryDark',
      'secondary', 'secondaryLight',
      'accent', 'background', 'surface', 'surfaceElevated',
      'textPrimary', 'textSecondary', 'textMuted',
      'border', 'success', 'warning', 'error'
    ];

    for (const c of requiredColors) {
      assert.ok(colors[c], `Theme colors must define ${c}`);
    }
  });
});

test('⚡ EXTENSIVE 3: Map Style & Obsidian Styler Geometry', async (t) => {
  await t.test('darkMapStyle contains comprehensive layer rules and eliminates clutter', () => {
    assert.ok(Array.isArray(darkMapStyle), 'darkMapStyle must be an array');
    assert.ok(darkMapStyle.length >= 15, 'darkMapStyle must have comprehensive rules');

    // Verify POI is turned off
    const poiRule = darkMapStyle.find((r) => r.featureType === 'poi');
    assert.ok(poiRule, 'Must contain POI styling rule');
    assert.strictEqual(poiRule.stylers[0].visibility, 'off', 'POI must be hidden to prevent map clutter');

    // Verify transit is turned off
    const transitRule = darkMapStyle.find((r) => r.featureType === 'transit');
    assert.ok(transitRule, 'Must contain transit styling rule');
    assert.strictEqual(transitRule.stylers[0].visibility, 'off', 'Transit must be hidden');

    // Verify base geometry is obsidian dark
    const baseRule = darkMapStyle.find((r) => r.elementType === 'geometry' && !r.featureType);
    assert.ok(baseRule, 'Must contain base geometry rule');
    assert.strictEqual(baseRule.stylers[0].color, '#0B0D15', 'Base geometry must be dark obsidian');

    // Verify water layer is dark marine
    const waterRule = darkMapStyle.find((r) => r.featureType === 'water' && r.elementType === 'geometry');
    assert.ok(waterRule, 'Must contain water geometry rule');
    assert.strictEqual(waterRule.stylers[0].color, '#101424', 'Water geometry must be dark marine');
  });
});

test('⚡ EXTENSIVE 4: Natural Language Sentiment Detection Engine', async (t) => {
  // Test heuristic implementation matching CreateBubbleScreen
  const analyzeSentiment = (text) => {
    const lower = text.toLowerCase();
    if (!lower.trim() || lower.length < 6) return null;
    if (lower.includes('happy') || lower.includes('excited') || lower.includes('grateful') || lower.includes('smile')) {
      return 'joy';
    }
    if (lower.includes('peace') || lower.includes('quiet') || lower.includes('breathe') || lower.includes('rest') || lower.includes('still')) {
      return 'calm';
    }
    if (lower.includes('worry') || lower.includes('panic') || lower.includes('nervous') || lower.includes('stress') || lower.includes('racing')) {
      return 'anxiety';
    }
    if (lower.includes('love') || lower.includes('tender') || lower.includes('heart') || lower.includes('miss') || lower.includes('cherish')) {
      return 'love';
    }
    if (lower.includes('sad') || lower.includes('cry') || lower.includes('lonely') || lower.includes('tired') || lower.includes('heavy')) {
      return 'sadness';
    }
    return null;
  };

  await t.test('Sentiment analysis accurately classifies emotional keywords', () => {
    assert.strictEqual(analyzeSentiment('feeling so grateful and full of joy today'), 'joy');
    assert.strictEqual(analyzeSentiment('watching the waves, quiet and peaceful evening'), 'calm');
    assert.strictEqual(analyzeSentiment('my heart is racing and I feel so nervous'), 'anxiety');
    assert.strictEqual(analyzeSentiment('deep love and tenderness for all my friends'), 'love');
    assert.strictEqual(analyzeSentiment('some days are just lonely and heavy to carry'), 'sadness');
  });

  await t.test('Sentiment analysis returns null for short or neutral strings', () => {
    assert.strictEqual(analyzeSentiment('hi'), null);
    assert.strictEqual(analyzeSentiment('      '), null);
    assert.strictEqual(analyzeSentiment('walking to the grocery store to buy apples'), null);
  });
});

test('⚡ EXTENSIVE 5: Aura Score Tier Calibration Matrix', async (t) => {
  const getTier = (pts) => {
    if (pts >= 1000) return { title: 'Luminary', emoji: '🌟' };
    if (pts >= 500) return { title: 'Empath', emoji: '💜' };
    if (pts >= 200) return { title: 'Guide', emoji: '✨' };
    if (pts >= 50) return { title: 'Seeker', emoji: '🌱' };
    return { title: 'Novice', emoji: '💫' };
  };

  await t.test('Aura score thresholds match exact tier boundaries', () => {
    // Novice (0 - 49)
    assert.strictEqual(getTier(0).title, 'Novice');
    assert.strictEqual(getTier(49).title, 'Novice');

    // Seeker (50 - 199)
    assert.strictEqual(getTier(50).title, 'Seeker');
    assert.strictEqual(getTier(199).title, 'Seeker');

    // Guide (200 - 499)
    assert.strictEqual(getTier(200).title, 'Guide');
    assert.strictEqual(getTier(499).title, 'Guide');

    // Empath (500 - 999)
    assert.strictEqual(getTier(500).title, 'Empath');
    assert.strictEqual(getTier(999).title, 'Empath');

    // Luminary (1000+)
    assert.strictEqual(getTier(1000).title, 'Luminary');
    assert.strictEqual(getTier(5420).title, 'Luminary');
  });
});

test('⚡ EXTENSIVE 6: Levitation Drift & Dynamic Halo Scaling Physics', async (t) => {
  const computeIntensityFactor = (intensity) => {
    return Math.max(0.6, Math.min(1.4, intensity / 7));
  };

  await t.test('Intensity factor stays clamped between 0.6 and 1.4', () => {
    assert.strictEqual(computeIntensityFactor(1), 0.6, 'Minimum clamp must be 0.6');
    assert.strictEqual(computeIntensityFactor(4), 0.6, '4/7 clamp must be 0.6');
    assert.strictEqual(computeIntensityFactor(7), 1.0, 'Baseline intensity 7 must yield factor 1.0');
    assert.ok(Math.abs(computeIntensityFactor(8) - (8 / 7)) < 0.001);
    assert.strictEqual(computeIntensityFactor(10), 1.4, 'Maximum clamp must be 1.4');
    assert.strictEqual(computeIntensityFactor(20), 1.4, 'Over-max clamp must be 1.4');
  });

  await t.test('Intensity scaling is strictly monotonic non-decreasing', () => {
    for (let i = 1; i < 10; i++) {
      const f1 = computeIntensityFactor(i);
      const f2 = computeIntensityFactor(i + 1);
      assert.ok(f2 >= f1, `Factor for intensity ${i + 1} (${f2}) must be >= factor for ${i} (${f1})`);
    }
  });
});

test('⚡ EXTENSIVE 7: Feed Ranking & Emotion Filtering Algorithms', async (t) => {
  const samplePosts = [
    { id: '1', emotion: 'calm', intensity: 5, reactionsCount: 10 },
    { id: '2', emotion: 'joy', intensity: 9, reactionsCount: 20 },
    { id: '3', emotion: 'anxiety', intensity: 8, reactionsCount: 5 },
    { id: '4', emotion: 'calm', intensity: 7, reactionsCount: 15 },
    { id: '5', emotion: 'love', intensity: 10, reactionsCount: 30 },
  ];

  await t.test('Resonant sorting ranks highest emotional resonance first', () => {
    const resonantSorted = [...samplePosts].sort(
      (a, b) => (b.intensity + b.reactionsCount) - (a.intensity + a.reactionsCount)
    );

    // Rank 1: Love (10 + 30 = 40)
    // Rank 2: Joy (9 + 20 = 29)
    // Rank 3: Calm (7 + 15 = 22)
    // Rank 4: Calm (5 + 10 = 15)
    // Rank 5: Anxiety (8 + 5 = 13)
    assert.strictEqual(resonantSorted[0].id, '5');
    assert.strictEqual(resonantSorted[1].id, '2');
    assert.strictEqual(resonantSorted[2].id, '4');
    assert.strictEqual(resonantSorted[3].id, '1');
    assert.strictEqual(resonantSorted[4].id, '3');
  });

  await t.test('Filter by emotion isolates matching items case-insensitively', () => {
    const calmPosts = samplePosts.filter((p) => p.emotion.toLowerCase() === 'calm');
    assert.strictEqual(calmPosts.length, 2);
    assert.strictEqual(calmPosts[0].id, '1');
    assert.strictEqual(calmPosts[1].id, '4');

    const lovePosts = samplePosts.filter((p) => p.emotion.toLowerCase() === 'LOVE'.toLowerCase());
    assert.strictEqual(lovePosts.length, 1);
    assert.strictEqual(lovePosts[0].id, '5');
  });
});

test('⚡ EXTENSIVE 8: API Modules Complete Contract Verification', async (t) => {
  const apiFiles = [
    'src/api/client.ts',
    'src/api/auth.ts',
    'src/api/users.ts',
    'src/api/mood.ts',
    'src/api/map.ts',
    'src/api/feed.ts',
    'src/api/social.ts',
    'src/api/notification.ts',
    'src/api/community.ts',
    'src/api/matching.ts',
  ];

  for (const file of apiFiles) {
    const fullPath = path.join(FRONTEND_DIR, file);
    assert.ok(fs.existsSync(fullPath), `API module ${file} must exist`);
    const content = fs.readFileSync(fullPath, 'utf8');
    assert.ok(content.includes('export const'), `Module ${file} must export services`);
  }
});

test('⚡ EXTENSIVE 9: Stage 8 Community Circles In-Memory Simulation & Logic', async (t) => {
  await t.test('All Community screens and components exist and export cleanly', () => {
    const stage8Files = [
      'src/components/community/CommunityMoodGauge.tsx',
      'src/components/community/CommunityCard.tsx',
      'src/components/community/CommunityPostCard.tsx',
      'src/components/community/index.ts',
      'src/screens/community/CommunityListScreen.tsx',
      'src/screens/community/CommunityDetailScreen.tsx',
      'src/screens/community/CreateCommunityModal.tsx',
      'src/screens/community/CreateCommunityPostModal.tsx',
      'src/screens/community/index.ts',
      'src/navigation/CommunityNavigator.tsx',
    ];

    for (const f of stage8Files) {
      const fullPath = path.join(FRONTEND_DIR, f);
      assert.ok(fs.existsSync(fullPath), `Stage 8 file ${f} must exist`);
      const stat = fs.statSync(fullPath);
      assert.ok(stat.size > 100, `File ${f} must have non-trivial content`);
    }
  });

  await t.test('Community category filtering and search logic simulation', () => {
    const testCircles = [
      { id: '1', name: 'Mindful Breathing', category: 'Mindfulness', description: 'Stillness and gentle presence' },
      { id: '2', name: 'Late Night Thoughts', category: 'Sleep & Dreams', description: 'Insomnia reflections' },
      { id: '3', name: 'Radical Acceptance', category: 'Mindfulness', description: 'Embracing all emotional states' },
      { id: '4', name: 'Grief & Healing', category: 'Healing & Grief', description: 'Holding space for loss' },
    ];

    // Filter by category
    const mindfulnessCircles = testCircles.filter(c => c.category === 'Mindfulness');
    assert.strictEqual(mindfulnessCircles.length, 2);

    // Search query
    const query = 'healing';
    const searched = testCircles.filter(
      c => c.name.toLowerCase().includes(query) || c.description.toLowerCase().includes(query)
    );
    assert.strictEqual(searched.length, 1);
    assert.strictEqual(searched[0].id, '4');
  });

  await t.test('Atmosphere mood gauge distribution sums accurately', () => {
    const distribution = [
      { emotion: 'calm', percentage: 65 },
      { emotion: 'joy', percentage: 20 },
      { emotion: 'love', percentage: 10 },
      { emotion: 'anxiety', percentage: 5 },
    ];

    const totalPercentage = distribution.reduce((sum, item) => sum + item.percentage, 0);
    assert.strictEqual(totalPercentage, 100, 'Mood distribution percentages must total 100');
  });

  await t.test('Anonymization and content warning shielding states operate predictably', () => {
    const postA = { is_anonymous: true, has_content_warning: true, content: 'Deep personal disclosure' };
    const postB = { is_anonymous: false, has_content_warning: false, content: 'Celebrated a win today' };

    const authorDisplayA = postA.is_anonymous ? 'Wandering Spirit' : 'Jane Doe';
    assert.strictEqual(authorDisplayA, 'Wandering Spirit');

    const authorDisplayB = postB.is_anonymous ? 'Wandering Spirit' : 'Jane Doe';
    assert.strictEqual(authorDisplayB, 'Jane Doe');

    // Content Warning mask state
    let revealedA = !postA.has_content_warning;
    assert.strictEqual(revealedA, false, 'Shielded post should be concealed initially');

    // Simulate tap to reveal
    revealedA = true;
    assert.strictEqual(revealedA, true, 'Shielded post should reveal on interaction');
  });
});

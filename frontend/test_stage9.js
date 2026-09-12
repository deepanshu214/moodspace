import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';

const FRONTEND_DIR = process.cwd();

test('Stage 9: Messaging & Matching Types & API Verification', async (t) => {
  await t.test('types.ts defines comprehensive direct messaging and resonance schemas', () => {
    const typesPath = path.join(FRONTEND_DIR, 'src/api/types.ts');
    assert.ok(fs.existsSync(typesPath), 'types.ts must exist');
    const content = fs.readFileSync(typesPath, 'utf8');

    // Type declarations
    assert.ok(content.includes('export interface DirectMessage'), 'Must export DirectMessage');
    assert.ok(content.includes('export interface SendMessagePayload'), 'Must export SendMessagePayload');
    assert.ok(content.includes('export interface MessageReactionResponse'), 'Must export MessageReactionResponse');
    assert.ok(content.includes('export interface AddMessageReactionPayload'), 'Must export AddMessageReactionPayload');
    assert.ok(content.includes('export interface Conversation'), 'Must export Conversation');
    assert.ok(content.includes('export interface ConversationMessagesResponse'), 'Must export ConversationMessagesResponse');
    assert.ok(content.includes('export interface MarkReadPayload'), 'Must export MarkReadPayload');
    assert.ok(content.includes('export interface Icebreaker'), 'Must export Icebreaker');
    assert.ok(content.includes('export interface EchoMatchResponse'), 'Must export EchoMatchResponse');
    assert.ok(content.includes('export interface EchoMatchDecisionPayload'), 'Must export EchoMatchDecisionPayload');
    assert.ok(content.includes('export interface EchoMatchDecisionResponse'), 'Must export EchoMatchDecisionResponse');

    // Field checks
    assert.ok(content.includes('message_type: MessageType;'), 'DirectMessage includes message_type');
    assert.ok(content.includes('resonance_score: number;'), 'EchoMatchResponse includes resonance_score');
    assert.ok(content.includes('match_reasons: EchoMatchReason[];'), 'EchoMatchResponse includes match_reasons');
    assert.ok(content.includes('icebreaker?: Icebreaker;'), 'EchoMatchResponse includes optional icebreaker');
    assert.ok(content.includes('unread_count: number;'), 'Conversation includes unread_count');
    assert.ok(content.includes('is_echo_match?: boolean;'), 'Conversation includes is_echo_match');
  });

  await t.test('messaging.ts provides complete direct message API methods', () => {
    const apiPath = path.join(FRONTEND_DIR, 'src/api/messaging.ts');
    assert.ok(fs.existsSync(apiPath), 'messaging.ts must exist');
    const content = fs.readFileSync(apiPath, 'utf8');

    assert.ok(content.includes('getConversations('), 'Must provide getConversations');
    assert.ok(content.includes('getOrCreateConversation('), 'Must provide getOrCreateConversation');
    assert.ok(content.includes('getMessages('), 'Must provide getMessages');
    assert.ok(content.includes('sendMessage('), 'Must provide sendMessage');
    assert.ok(content.includes('deleteMessage('), 'Must provide deleteMessage');
    assert.ok(content.includes('reactToMessage('), 'Must provide reactToMessage');
    assert.ok(content.includes('removeReaction('), 'Must provide removeReaction');
    assert.ok(content.includes('markRead('), 'Must provide markRead');

    assert.ok(content.includes('/messages/conversations'), 'Targets conversations endpoint');
    assert.ok(content.includes('/messages/reactions'), 'Targets reactions endpoint');
    assert.ok(content.includes('/messages/read'), 'Targets read status endpoint');
  });

  await t.test('matching.ts provides Echoes resonance and icebreaker endpoints', () => {
    const apiPath = path.join(FRONTEND_DIR, 'src/api/matching.ts');
    assert.ok(fs.existsSync(apiPath), 'matching.ts must exist');
    const content = fs.readFileSync(apiPath, 'utf8');

    assert.ok(content.includes('getMatches('), 'Must provide getMatches');
    assert.ok(content.includes('getEchoMatches('), 'Must provide getEchoMatches');
    assert.ok(content.includes('decideOnEchoMatch('), 'Must provide decideOnEchoMatch');
    assert.ok(content.includes('getIcebreaker('), 'Must provide getIcebreaker');
    assert.ok(content.includes('getIcebreakers('), 'Must provide getIcebreakers');

    assert.ok(content.includes('/matching/echoes'), 'Queries /matching/echoes');
    assert.ok(content.includes('/matching/echoes/decide'), 'Posts to /matching/echoes/decide');
    assert.ok(content.includes('/matching/icebreakers'), 'Queries icebreaker bank');
  });

  await t.test('src/api/index.ts re-exports messaging and matching modules', () => {
    const indexPath = path.join(FRONTEND_DIR, 'src/api/index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');
    assert.ok(content.includes("export * from './messaging';"), 'Re-exports messaging');
    assert.ok(content.includes("export * from './matching';"), 'Re-exports matching');
  });
});

test('Stage 9: React Query Messaging & Matching Hooks Verification', async (t) => {
  await t.test('useMessaging.ts exports query and mutation hooks', () => {
    const hooksPath = path.join(FRONTEND_DIR, 'src/hooks/useMessaging.ts');
    assert.ok(fs.existsSync(hooksPath), 'useMessaging.ts must exist');
    const content = fs.readFileSync(hooksPath, 'utf8');

    const expectedHooks = [
      'useConversations',
      'useGetOrCreateConversation',
      'useMessages',
      'useSendMessage',
      'useDeleteMessage',
      'useReactToMessage',
      'useMarkRead',
    ];

    for (const h of expectedHooks) {
      assert.ok(content.includes(`export function ${h}`), `useMessaging must export ${h}`);
    }

    assert.ok(content.includes('messagingKeys'), 'Must export query keys');
    assert.ok(content.includes('useInfiniteQuery'), 'useMessages uses infinite query for pagination');
    assert.ok(content.includes('onMutate'), 'useSendMessage provides optimistic updates');
  });

  await t.test('useMatching.ts exports query and mutation hooks', () => {
    const hooksPath = path.join(FRONTEND_DIR, 'src/hooks/useMatching.ts');
    assert.ok(fs.existsSync(hooksPath), 'useMatching.ts must exist');
    const content = fs.readFileSync(hooksPath, 'utf8');

    const expectedHooks = [
      'useMoodMatches',
      'useEchoMatches',
      'useIcebreakers',
      'useRandomIcebreaker',
      'useDecideEchoMatch',
    ];

    for (const h of expectedHooks) {
      assert.ok(content.includes(`export function ${h}`), `useMatching must export ${h}`);
    }

    assert.ok(content.includes('matchingKeys'), 'Must export query keys');
    assert.ok(content.includes('onMutate'), 'useDecideEchoMatch uses optimistic updates');
  });

  await t.test('src/hooks/index.ts re-exports all messaging and matching hooks', () => {
    const indexPath = path.join(FRONTEND_DIR, 'src/hooks/index.ts');
    const content = fs.readFileSync(indexPath, 'utf8');
    assert.ok(content.includes("export * from './useMessaging';"), 'Re-exports useMessaging');
    assert.ok(content.includes("export * from './useMatching';"), 'Re-exports useMatching');
  });
});

test('Stage 9: Chat & Matching UI Components Verification', async (t) => {
  await t.test('ConversationTile renders presence, last message snippet, and resonance badge', () => {
    const tilePath = path.join(FRONTEND_DIR, 'src/components/chat/ConversationTile.tsx');
    assert.ok(fs.existsSync(tilePath), 'ConversationTile.tsx must exist');
    const content = fs.readFileSync(tilePath, 'utf8');

    assert.ok(content.includes('export const ConversationTile'), 'Must export ConversationTile');
    assert.ok(content.includes('showPresence'), 'Avatar displays presence indicator');
    assert.ok(content.includes('Badge'), 'Badge displays unread count');
    assert.ok(content.includes('is_echo_match'), 'Displays Echo resonance indicator');
    assert.ok(content.includes('formatTime'), 'Formats timestamp gracefully');
  });

  await t.test('MessageBubble handles icebreakers, mood tags, delivery states, and reactions', () => {
    const bubblePath = path.join(FRONTEND_DIR, 'src/components/chat/MessageBubble.tsx');
    assert.ok(fs.existsSync(bubblePath), 'MessageBubble.tsx must exist');
    const content = fs.readFileSync(bubblePath, 'utf8');

    assert.ok(content.includes('export const MessageBubble'), 'Must export MessageBubble');
    assert.ok(content.includes('icebreakerHeader') || content.includes('isIcebreaker'), 'Handles icebreaker styling');
    assert.ok(content.includes('isMoodShare') || content.includes('moodHeader'), 'Handles mood share messages');
    assert.ok(content.includes('groupReactions'), 'Groups emoji reactions by count');
    assert.ok(content.includes('onLongPress'), 'Supports long press for interaction modal');
  });

  await t.test('ResonanceMatchCard displays resonance score, reasons, and connect/pass actions', () => {
    const cardPath = path.join(FRONTEND_DIR, 'src/components/chat/ResonanceMatchCard.tsx');
    assert.ok(fs.existsSync(cardPath), 'ResonanceMatchCard.tsx must exist');
    const content = fs.readFileSync(cardPath, 'utf8');

    assert.ok(content.includes('export const ResonanceMatchCard'), 'Must export ResonanceMatchCard');
    assert.ok(content.includes('resonance_score'), 'Displays numerical resonance');
    assert.ok(content.includes('resonanceBar') || content.includes('resonanceFill'), 'Displays visual resonance progress');
    assert.ok(content.includes('onConnect'), 'Provides onConnect callback');
    assert.ok(content.includes('onPass'), 'Provides onPass callback');
  });

  await t.test('IcebreakerCard renders category pill, prompt, and selection states', () => {
    const cardPath = path.join(FRONTEND_DIR, 'src/components/chat/IcebreakerCard.tsx');
    assert.ok(fs.existsSync(cardPath), 'IcebreakerCard.tsx must exist');
    const content = fs.readFileSync(cardPath, 'utf8');

    assert.ok(content.includes('export const IcebreakerCard'), 'Must export IcebreakerCard');
    assert.ok(content.includes('CATEGORY_META') || content.includes('categoryPill'), 'Categorizes prompts');
    assert.ok(content.includes('isSelected'), 'Renders selection badge when active');
  });

  await t.test('src/components/chat/index.ts and global barrel re-export all chat components', () => {
    const chatBarrelPath = path.join(FRONTEND_DIR, 'src/components/chat/index.ts');
    assert.ok(fs.existsSync(chatBarrelPath), 'src/components/chat/index.ts must exist');
    const chatContent = fs.readFileSync(chatBarrelPath, 'utf8');
    assert.ok(chatContent.includes("export * from './ConversationTile';"), 'Exports ConversationTile');
    assert.ok(chatContent.includes("export * from './MessageBubble';"), 'Exports MessageBubble');
    assert.ok(chatContent.includes("export * from './ResonanceMatchCard';"), 'Exports ResonanceMatchCard');
    assert.ok(chatContent.includes("export * from './IcebreakerCard';"), 'Exports IcebreakerCard');

    const globalBarrelPath = path.join(FRONTEND_DIR, 'src/components/index.ts');
    const globalContent = fs.readFileSync(globalBarrelPath, 'utf8');
    assert.ok(globalContent.includes("export * from './chat';"), 'Global components barrel re-exports ./chat');
  });
});

test('Stage 9: Chat Screens & Navigation Verification', async (t) => {
  await t.test('ConversationsScreen wires conversations query, total unreads, and match CTA', () => {
    const screenPath = path.join(FRONTEND_DIR, 'src/screens/chats/ConversationsScreen.tsx');
    assert.ok(fs.existsSync(screenPath), 'ConversationsScreen.tsx must exist');
    const content = fs.readFileSync(screenPath, 'utf8');

    assert.ok(content.includes('export const ConversationsScreen'), 'Must export ConversationsScreen');
    assert.ok(content.includes('useConversations('), 'Uses useConversations hook');
    assert.ok(content.includes('totalUnread'), 'Calculates unread badge');
    assert.ok(content.includes("navigation.navigate('EchoMatch')"), 'Navigates to EchoMatch');
    assert.ok(content.includes("navigation.navigate('ChatDetail'"), 'Navigates to ChatDetail');
  });

  await t.test('ChatDetailScreen wires message feed, sending, reactions, and icebreaker spark', () => {
    const screenPath = path.join(FRONTEND_DIR, 'src/screens/chats/ChatDetailScreen.tsx');
    assert.ok(fs.existsSync(screenPath), 'ChatDetailScreen.tsx must exist');
    const content = fs.readFileSync(screenPath, 'utf8');

    assert.ok(content.includes('export const ChatDetailScreen'), 'Must export ChatDetailScreen');
    assert.ok(content.includes('useMessages('), 'Subscribes to message feed');
    assert.ok(content.includes('useSendMessage('), 'Uses useSendMessage mutation');
    assert.ok(content.includes('useReactToMessage('), 'Uses useReactToMessage mutation');
    assert.ok(content.includes('useMarkRead('), 'Marks messages as read on mount');
    assert.ok(content.includes('icebreakerPanel') || content.includes('IcebreakerPicker'), 'Provides icebreaker support');
  });

  await t.test('EchoMatchScreen supports signal filtering and mutual resonance connection', () => {
    const screenPath = path.join(FRONTEND_DIR, 'src/screens/chats/EchoMatchScreen.tsx');
    assert.ok(fs.existsSync(screenPath), 'EchoMatchScreen.tsx must exist');
    const content = fs.readFileSync(screenPath, 'utf8');

    assert.ok(content.includes('export const EchoMatchScreen'), 'Must export EchoMatchScreen');
    assert.ok(content.includes('useEchoMatches('), 'Queries resonance matches');
    assert.ok(content.includes('useDecideEchoMatch('), 'Decides on match connections');
    assert.ok(content.includes('handleConnect'), 'Handles connection logic');
    assert.ok(content.includes('handlePass'), 'Handles pass logic');
  });

  await t.test('IcebreakerPickerModal filters empathetic prompts by category and sends directly', () => {
    const screenPath = path.join(FRONTEND_DIR, 'src/screens/chats/IcebreakerPickerModal.tsx');
    assert.ok(fs.existsSync(screenPath), 'IcebreakerPickerModal.tsx must exist');
    const content = fs.readFileSync(screenPath, 'utf8');

    assert.ok(content.includes('export const IcebreakerPickerModal'), 'Must export IcebreakerPickerModal');
    assert.ok(content.includes('useIcebreakers('), 'Queries icebreaker prompts');
    assert.ok(content.includes('useSendMessage('), 'Allows sending selected icebreaker directly');
    assert.ok(content.includes('CATEGORIES'), 'Displays categorized spark tabs');
  });

  await t.test('ChatNavigator registers all 4 screens with proper modal presentations', () => {
    const navPath = path.join(FRONTEND_DIR, 'src/navigation/ChatNavigator.tsx');
    assert.ok(fs.existsSync(navPath), 'ChatNavigator.tsx must exist');
    const content = fs.readFileSync(navPath, 'utf8');

    assert.ok(content.includes('name="Conversations"'), 'Registers Conversations screen');
    assert.ok(content.includes('name="ChatDetail"'), 'Registers ChatDetail screen');
    assert.ok(content.includes('name="EchoMatch"'), 'Registers EchoMatch screen');
    assert.ok(content.includes('name="IcebreakerPicker"'), 'Registers IcebreakerPicker screen');
    assert.ok(content.includes("presentation: 'modal'"), 'Configures modal presentation for icebreaker picker');
  });
});

import React, { useState, useMemo } from 'react';
import { View, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { theme } from '@/theme';
// This card is an intentionally always-dark "constellation" surface regardless
// of the app's light/dark theme, so it pulls text colors from the dark palette.
import { darkColors as colors } from '@/theme/colors';
import { Typography } from '../common/Typography';
import { MoodHeatmapDay } from '@/api/types';
import { haptics } from '@/theme/haptics';

interface MoodHistoryHeatmapProps {
  days: MoodHeatmapDay[];
  onSelectDay?: (day: MoodHeatmapDay) => void;
}

export const MoodHistoryHeatmap: React.FC<MoodHistoryHeatmapProps> = ({
  days,
  onSelectDay,
}) => {
  const [selectedDay, setSelectedDay] = useState<MoodHeatmapDay | null>(null);

  // Group into weeks of 7 days
  const weeks: MoodHeatmapDay[][] = useMemo(() => {
    const res: MoodHeatmapDay[][] = [];
    let currentWeek: MoodHeatmapDay[] = [];

    days.forEach((day, index) => {
      currentWeek.push(day);
      if (currentWeek.length === 7 || index === days.length - 1) {
        res.push(currentWeek);
        currentWeek = [];
      }
    });
    return res;
  }, [days]);

  // Aggregate monthly emotion stats
  const monthlyStats = useMemo(() => {
    const counts: Record<string, number> = {};
    days.forEach((d) => {
      if (d.count > 0 && d.dominant_emotion) {
        counts[d.dominant_emotion] = (counts[d.dominant_emotion] || 0) + 1;
      }
    });
    return Object.entries(counts)
      .map(([emotion, count]) => ({
        emotion,
        count,
        cfg: theme.getEmotionConfig(emotion),
      }))
      .sort((a, b) => b.count - a.count);
  }, [days]);

  const handleDayPress = (day: MoodHeatmapDay) => {
    haptics.selection();
    setSelectedDay(day);
    onSelectDay?.(day);
  };

  const selectedEmotionCfg = selectedDay?.dominant_emotion
    ? theme.getEmotionConfig(selectedDay.dominant_emotion)
    : null;

  return (
    <View style={styles.card}>
      {/* ── Header: Title & Monthly Highlights ── */}
      <View style={styles.header}>
        <View>
          <Typography variant="caption" weight="bold" color={colors.accentInk} style={styles.headerLabel}>
            MONTHLY MOOD CONSTELLATION
          </Typography>
          <Typography variant="bodySmall" color={colors.textSecondary}>
            30 days of feelings, reflections & gentle rhythms
          </Typography>
        </View>

        {/* Emotion Distribution Pills */}
        <View style={styles.summaryPills}>
          {monthlyStats.slice(0, 3).map((item) => (
            <View key={item.emotion} style={[styles.statPill, { borderColor: `${item.cfg.primary}40` }]}>
              <Typography style={{ fontSize: 12 }}>{item.cfg.emoji}</Typography>
              <Typography variant="caption" weight="bold" color={colors.textPrimary} style={{ marginLeft: 3 }}>
                {item.count}
              </Typography>
            </View>
          ))}
        </View>
      </View>

      {/* ── Day of week labels ── */}
      <View style={styles.dayOfWeekRow}>
        {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((d, i) => (
          <View key={i} style={styles.dayOfWeekLabel}>
            <Typography variant="caption" color={colors.textMuted} style={{ fontSize: 11 }}>
              {d}
            </Typography>
          </View>
        ))}
      </View>

      {/* ── Organic Mood Pebble Constellation ── */}
      <View style={styles.grid}>
        {weeks.map((week, wIdx) => (
          <View key={wIdx} style={styles.weekRow}>
            {week.map((day) => {
              const hasCheckin = day.count > 0;
              const emotionCfg = day.dominant_emotion
                ? theme.getEmotionConfig(day.dominant_emotion)
                : null;
              const isSelected = selectedDay?.date === day.date;

              const cellBg = hasCheckin && emotionCfg
                ? `${emotionCfg.primary}25`
                : 'rgba(255, 255, 255, 0.03)';
              const cellBorder = isSelected
                ? colors.primaryLight
                : hasCheckin && emotionCfg
                ? `${emotionCfg.primary}60`
                : 'rgba(255, 255, 255, 0.06)';

              // Extract day of month number (1-31)
              const dayNumber = new Date(day.date + 'T00:00:00').getDate();

              return (
                <TouchableOpacity
                  key={day.date}
                  activeOpacity={0.7}
                  onPress={() => handleDayPress(day)}
                  style={[
                    styles.pebble,
                    {
                      backgroundColor: cellBg,
                      borderColor: cellBorder,
                      borderWidth: isSelected ? 2 : 1,
                    },
                    isSelected && styles.pebbleSelected,
                  ]}
                >
                  <Typography
                    variant="caption"
                    style={[
                      styles.dayNumberText,
                      { color: isSelected ? colors.primaryLight : colors.textMuted },
                    ]}
                  >
                    {dayNumber}
                  </Typography>

                  {hasCheckin && emotionCfg ? (
                    <Typography style={styles.pebbleEmoji}>{emotionCfg.emoji}</Typography>
                  ) : (
                    <Typography style={styles.emptyPebbleDot}>·</Typography>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        ))}
      </View>

      {/* ── Interactive Day Detail Card ── */}
      {selectedDay ? (
        <View style={styles.detailBanner}>
          <View style={styles.detailCardContent}>
            <View style={styles.detailDateRow}>
              <Typography variant="body" weight="bold" color={colors.textPrimary}>
                {new Date(selectedDay.date + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'short',
                  day: 'numeric',
                })}
              </Typography>

              {selectedDay.count > 0 ? (
                <View style={styles.checkinCountBadge}>
                  <Typography variant="caption" weight="bold" color={colors.accentInk}>
                    {selectedDay.count} check-in{selectedDay.count > 1 ? 's' : ''}
                  </Typography>
                </View>
              ) : null}
            </View>

            {selectedDay.count > 0 && selectedEmotionCfg ? (
              <View style={styles.reflectionBody}>
                <View style={styles.emotionPill}>
                  <Typography style={{ fontSize: 16, marginRight: 6 }}>
                    {selectedEmotionCfg.emoji}
                  </Typography>
                  <Typography variant="caption" color={selectedEmotionCfg.primary} weight="bold">
                    {selectedEmotionCfg.label}
                  </Typography>
                  {selectedDay.intensity_average != null && (
                    <Typography variant="caption" color={colors.textSecondary} style={styles.intensityText}>
                      • Intensity: {selectedDay.intensity_average}/10
                    </Typography>
                  )}
                </View>

                {/* Intensity meter bar */}
                <View style={styles.intensityTrack}>
                  <View
                    style={[
                      styles.intensityFill,
                      {
                        width: `${Math.min(100, ((selectedDay.intensity_average ?? 6) / 10) * 100)}%`,
                        backgroundColor: selectedEmotionCfg.primary,
                      },
                    ]}
                  />
                </View>
              </View>
            ) : (
              <Typography variant="caption" color={colors.textMuted} style={{ marginTop: 4 }}>
                A quiet day without recorded check-ins.
              </Typography>
            )}
          </View>
        </View>
      ) : (
        <Typography variant="caption" color={colors.textMuted} style={styles.tapPrompt}>
          Tap any day to see how your heart was feeling.
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    padding: 16,
    borderRadius: 24,
    backgroundColor: 'rgba(20, 24, 38, 0.75)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: 16,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  headerLabel: {
    letterSpacing: 1.2,
    marginBottom: 2,
  },
  summaryPills: {
    flexDirection: 'row',
    gap: 6,
  },
  statPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderWidth: 1,
  },
  dayOfWeekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 4,
    marginBottom: 8,
  },
  dayOfWeekLabel: {
    flex: 1,
    alignItems: 'center',
  },
  grid: {
    gap: 6,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  pebble: {
    flex: 1,
    height: 44,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 3,
  },
  pebbleSelected: {
    shadowColor: colors.primaryLight,
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.6,
    shadowRadius: 8,
    elevation: 6,
  },
  dayNumberText: {
    fontSize: 10,
    fontWeight: '600',
  },
  pebbleEmoji: {
    fontSize: 15,
    marginTop: 1,
  },
  emptyPebbleDot: {
    fontSize: 14,
    color: 'rgba(255, 255, 255, 0.2)',
    marginTop: -2,
  },
  detailBanner: {
    marginTop: 14,
    padding: 14,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.04)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  detailCardContent: {
    width: '100%',
  },
  detailDateRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  checkinCountBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: 'rgba(108, 92, 231, 0.15)',
  },
  reflectionBody: {
    marginTop: 8,
  },
  emotionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  intensityText: {
    marginLeft: 6,
  },
  intensityTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    overflow: 'hidden',
  },
  intensityFill: {
    height: '100%',
    borderRadius: 2,
  },
  tapPrompt: {
    textAlign: 'center',
    marginTop: 12,
    fontStyle: 'italic',
  },
});

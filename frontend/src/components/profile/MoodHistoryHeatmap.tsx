import React, { useState } from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { theme } from '@/theme';
import { Typography } from '../common/Typography';
import { MoodHeatmapDay } from '@/api/types';

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
  const weeks: MoodHeatmapDay[][] = [];
  let currentWeek: MoodHeatmapDay[] = [];

  days.forEach((day, index) => {
    currentWeek.push(day);
    if (currentWeek.length === 7 || index === days.length - 1) {
      weeks.push(currentWeek);
      currentWeek = [];
    }
  });

  const handleDayPress = (day: MoodHeatmapDay) => {
    setSelectedDay(day);
    onSelectDay?.(day);
  };

  const selectedEmotionCfg = selectedDay?.dominant_emotion
    ? theme.getEmotionConfig(selectedDay.dominant_emotion)
    : null;

  return (
    <View style={styles.card}>
      <View style={styles.header}>
        <View>
          <Typography variant="caption" weight="bold" color={theme.colors.primaryLight} style={styles.headerLabel}>
            EMOTIONAL HORIZON
          </Typography>
          <Typography variant="bodySmall" color={theme.colors.textSecondary}>
            Past {days.length} days of releases & reflections
          </Typography>
        </View>

        {/* Emotion mini-legend */}
        <View style={styles.legend}>
          <View style={[styles.legendDot, { backgroundColor: '#FFD166' }]} />
          <View style={[styles.legendDot, { backgroundColor: '#7FB5FF' }]} />
          <View style={[styles.legendDot, { backgroundColor: '#FF6B8A' }]} />
          <View style={[styles.legendDot, { backgroundColor: '#86EFAC' }]} />
          <View style={[styles.legendDot, { backgroundColor: '#9B8AFF' }]} />
        </View>
      </View>

      {/* ── Heatmap Grid ── */}
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
                ? emotionCfg.primary
                : theme.colors.surfaceElevated;
              const cellOpacity = hasCheckin
                ? Math.min(1, Math.max(0.4, (day.intensity_average ?? 6) / 10))
                : 0.3;

              return (
                <TouchableOpacity
                  key={day.date}
                  activeOpacity={0.7}
                  onPress={() => handleDayPress(day)}
                  style={[
                    styles.cell,
                    {
                      backgroundColor: cellBg,
                      opacity: cellOpacity,
                    },
                    isSelected && styles.cellSelected,
                  ]}
                />
              );
            })}
          </View>
        ))}
      </View>

      {/* ── Day Detail Banner (when selected) ── */}
      {selectedDay ? (
        <View style={styles.detailBanner}>
          <View style={styles.detailHeader}>
            <Typography variant="caption" weight="bold" color={theme.colors.textPrimary}>
              {new Date(selectedDay.date + 'T00:00:00').toLocaleDateString('en-US', {
                weekday: 'short',
                month: 'short',
                day: 'numeric',
              })}
            </Typography>

            {selectedDay.count > 0 ? (
              <View style={styles.emotionPill}>
                {selectedEmotionCfg && (
                  <Typography variant="caption" color={selectedEmotionCfg.primary} weight="bold">
                    {selectedEmotionCfg.emoji} {selectedEmotionCfg.label}
                  </Typography>
                )}
                {selectedDay.intensity_average && (
                  <Typography variant="caption" color={theme.colors.textMuted} style={styles.intensityText}>
                    (Intensity: {selectedDay.intensity_average}/10)
                  </Typography>
                )}
              </View>
            ) : (
              <Typography variant="caption" color={theme.colors.textMuted}>
                No releases recorded
              </Typography>
            )}
          </View>
        </View>
      ) : (
        <Typography variant="caption" color={theme.colors.textMuted} style={styles.tapPrompt}>
          Tap any cell to inspect that day’s emotional frequency.
        </Typography>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.surface,
    borderRadius: theme.radius.xl,
    padding: theme.spacing.lg,
    borderWidth: 1,
    borderColor: theme.colors.border,
    marginBottom: theme.spacing.lg,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: theme.spacing.md,
  },
  headerLabel: {
    letterSpacing: 0.5,
    marginBottom: 2,
  },
  legend: {
    flexDirection: 'row',
    gap: 4,
    marginTop: 4,
  },
  legendDot: {
    width: 8,
    height: 8,
    borderRadius: theme.radius.round,
  },
  grid: {
    gap: 6,
    marginBottom: theme.spacing.md,
  },
  weekRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 6,
  },
  cell: {
    flex: 1,
    aspectRatio: 1,
    borderRadius: theme.radius.xs,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.05)',
  },
  cellSelected: {
    borderColor: '#FFFFFF',
    borderWidth: 1.5,
    opacity: 1,
  },
  detailBanner: {
    backgroundColor: theme.colors.surfaceElevated,
    borderRadius: theme.radius.md,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderWidth: 1,
    borderColor: theme.colors.border,
  },
  detailHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  emotionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  intensityText: {
    marginLeft: 2,
  },
  tapPrompt: {
    textAlign: 'center',
    fontStyle: 'italic',
  },
});

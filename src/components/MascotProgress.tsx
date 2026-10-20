// src/components/MascotProgress.tsx
import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Animated } from 'react-native';

interface MascotProgressProps {
  postMealSteps: number;
  targetSteps: number;
  mascotMood: 'idle' | 'walking' | 'celebrating';
}

export const MascotProgress: React.FC<MascotProgressProps> = ({
  postMealSteps,
  targetSteps,
  mascotMood,
}) => {
  const bounceAnim = useRef(new Animated.Value(1)).current;
  const progressRatio = Math.min(postMealSteps / (targetSteps || 1500), 1.0);

  useEffect(() => {
    if (mascotMood === 'walking') {
      const loop = Animated.loop(
        Animated.sequence([
          Animated.timing(bounceAnim, { toValue: 1.08, duration: 400, useNativeDriver: true }),
          Animated.timing(bounceAnim, { toValue: 1.0, duration: 400, useNativeDriver: true }),
        ])
      );
      loop.start();
      return () => loop.stop();
    } else if (mascotMood === 'celebrating') {
      Animated.spring(bounceAnim, { toValue: 1.15, friction: 3, useNativeDriver: true }).start();
    } else {
      Animated.timing(bounceAnim, { toValue: 1.0, duration: 300, useNativeDriver: true }).start();
    }
  }, [mascotMood]);

  const getMascotData = () => {
    if (mascotMood === 'celebrating' || progressRatio >= 1.0) {
      return {
        emoji: '🐆',
        title: 'Cheetah Mode',
        status: 'Glucose Spike Flattened! ⚡',
        accentColor: '#10B981',
      };
    }
    if (mascotMood === 'walking' || postMealSteps > 0) {
      return {
        emoji: '🐾',
        title: 'Active Pedometer',
        status: 'Walking down the glucose wave...',
        accentColor: '#F59E0B',
      };
    }
    return {
      emoji: '🦥',
      title: 'Sleepy Sloth',
      status: 'Post-meal glucose rising. Time for a 15m walk!',
      accentColor: '#6B7280',
    };
  };

  const mascot = getMascotData();

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.mascotCircle, { transform: [{ scale: bounceAnim }] }]}>
        <Text style={styles.mascotEmoji}>{mascot.emoji}</Text>
      </Animated.View>

      <Text style={styles.mascotTitle}>{mascot.title}</Text>
      <Text style={[styles.mascotStatus, { color: mascot.accentColor }]}>{mascot.status}</Text>

      {/* Progress Bar Container */}
      <View style={styles.progressContainer}>
        <View style={[styles.progressBar, { width: `${Math.round(progressRatio * 100)}%`, backgroundColor: mascot.accentColor }]} />
      </View>

      <View style={styles.statsRow}>
        <Text style={styles.statLabel}>{postMealSteps.toLocaleString()} steps logged</Text>
        <Text style={styles.statLabel}>{targetSteps.toLocaleString()} goal</Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    paddingVertical: 24,
    paddingHorizontal: 20,
    backgroundColor: '#121216',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#24242A',
    marginVertical: 16,
  },
  mascotCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#1C1C24',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
    borderWidth: 2,
    borderColor: '#2E2E38',
  },
  mascotEmoji: {
    fontSize: 54,
  },
  mascotTitle: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  mascotStatus: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
    marginBottom: 20,
  },
  progressContainer: {
    width: '100%',
    height: 10,
    backgroundColor: '#1F1F28',
    borderRadius: 5,
    overflow: 'hidden',
    marginBottom: 8,
  },
  progressBar: {
    height: '100%',
    borderRadius: 5,
  },
  statsRow: {
    width: '100%',
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statLabel: {
    fontSize: 12,
    color: '#8E8E98',
    fontWeight: '500',
  },
});

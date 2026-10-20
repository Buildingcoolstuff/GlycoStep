// src/screens/DashboardScreen.tsx
import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { HabitStore, HabitSession } from '../services/storage';
import { LivePedometerService, WalkProgressUpdate } from '../services/pedometer';
import { MascotProgress } from '../components/MascotProgress';

export const DashboardScreen: React.FC = () => {
  const [session, setSession] = useState<HabitSession>(HabitStore.getSnapshot());
  const [isWalking, setIsWalking] = useState(false);
  const [activeWalkStats, setActiveWalkStats] = useState<WalkProgressUpdate | null>(null);

  useEffect(() => {
    // Reconcile with widget whenever app becomes active
    const unsubscribe = HabitStore.registerForegroundSync((updated) => {
      setSession(updated);
    });

    return () => {
      unsubscribe();
      LivePedometerService.stopActiveWalkWindow();
    };
  }, []);

  const handleQuickAdd = async (stepIncrement: number) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
    } catch {
      // Fallback
    }

    const updated = HabitStore.updateSteps(session.postMealSteps + stepIncrement);
    setSession(updated);
  };

  const handleStartMealWalk = async (meal: 'lunch' | 'dinner' | 'breakfast') => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Fallback
    }

    const nextSession = HabitStore.startMealWalkWindow(meal);
    setSession(nextSession);
    setIsWalking(true);

    LivePedometerService.startActiveWalkWindow(
      nextSession.targetSteps,
      30,
      (progress) => {
        setActiveWalkStats(progress);
        setSession(HabitStore.getSnapshot());
        if (progress.isComplete) {
          setIsWalking(false);
          HabitStore.completeWalk();
          setSession(HabitStore.getSnapshot());
        }
      }
    );
  };

  const handleStopWalk = async () => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Fallback
    }

    LivePedometerService.stopActiveWalkWindow();
    setIsWalking(false);
    const completed = HabitStore.completeWalk();
    setSession(completed);
  };

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent}>
        {/* Top Header */}
        <View style={styles.header}>
          <View>
            <Text style={styles.appName}>GLYCOSTEP 🐾</Text>
            <Text style={styles.tagline}>Metabolic Window Tracker</Text>
          </View>
          <View style={styles.streakBadge}>
            <Text style={styles.streakText}>🔥 {session.currentStreak} Days</Text>
          </View>
        </View>

        {/* Mascot & Progress Card */}
        <MascotProgress
          postMealSteps={session.postMealSteps}
          targetSteps={session.targetSteps}
          mascotMood={session.mascotMood}
        />

        {/* Active Walk Window HUD */}
        {isWalking && activeWalkStats ? (
          <View style={styles.activeWalkHud}>
            <View style={styles.activeWalkHeader}>
              <Text style={styles.activeWalkTitle}>⚡ Active Post-Meal Walk</Text>
              <Text style={styles.activeWalkTimer}>{formatTimer(activeWalkStats.remainingSeconds)}</Text>
            </View>
            <Text style={styles.activeWalkSubtitle}>
              Apple Silicon CoreMotion hub is tracking every step in real time.
            </Text>

            <TouchableOpacity style={styles.stopButton} onPress={handleStopWalk} activeOpacity={0.8}>
              <Text style={styles.stopButtonText}>Complete Walk Session</Text>
            </TouchableOpacity>
          </View>
        ) : (
          /* Meal Walk Starters */
          <View style={styles.sectionContainer}>
            <Text style={styles.sectionTitle}>Start a Post-Meal Walk</Text>
            <Text style={styles.sectionDesc}>
              Initiate a 15-minute window right after eating to blunt glucose spikes.
            </Text>

            <View style={styles.mealButtonsRow}>
              <TouchableOpacity
                style={styles.mealButton}
                onPress={() => handleStartMealWalk('lunch')}
                activeOpacity={0.8}
              >
                <Text style={styles.mealEmoji}>🥪</Text>
                <Text style={styles.mealLabel}>Lunch</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mealButton}
                onPress={() => handleStartMealWalk('dinner')}
                activeOpacity={0.8}
              >
                <Text style={styles.mealEmoji}>🍝</Text>
                <Text style={styles.mealLabel}>Dinner</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.mealButton}
                onPress={() => handleStartMealWalk('breakfast')}
                activeOpacity={0.8}
              >
                <Text style={styles.mealEmoji}>🥞</Text>
                <Text style={styles.mealLabel}>Breakfast</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Quick Log Increment (Simulating Widget Logging) */}
        <View style={styles.quickLogCard}>
          <View style={styles.quickLogHeader}>
            <Text style={styles.quickLogTitle}>Interactive Widget Simulator</Text>
            <Text style={styles.quickLogBadge}>ZERO-OPEN</Text>
          </View>
          <Text style={styles.quickLogDesc}>
            Test the exact logic executed when tapping the iOS 17 Home Screen widget button.
          </Text>

          <View style={styles.quickLogButtons}>
            <TouchableOpacity
              style={styles.incrementButton}
              onPress={() => handleQuickAdd(250)}
              activeOpacity={0.8}
            >
              <Text style={styles.incrementButtonText}>+250 Steps</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.incrementButton}
              onPress={() => handleQuickAdd(500)}
              activeOpacity={0.8}
            >
              <Text style={styles.incrementButtonText}>+500 Steps</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  appName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 1,
  },
  tagline: {
    fontSize: 13,
    color: '#8E8E98',
  },
  streakBadge: {
    backgroundColor: '#1E1810',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#78350F',
  },
  streakText: {
    color: '#F59E0B',
    fontWeight: '700',
    fontSize: 13,
  },
  activeWalkHud: {
    backgroundColor: '#0F291E',
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: '#059669',
    marginBottom: 20,
  },
  activeWalkHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  activeWalkTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#10B981',
  },
  activeWalkTimer: {
    fontSize: 22,
    fontWeight: '800',
    color: '#FFFFFF',
    fontVariant: ['tabular-nums'],
  },
  activeWalkSubtitle: {
    fontSize: 13,
    color: '#6EE7B7',
    marginBottom: 16,
  },
  stopButton: {
    backgroundColor: '#10B981',
    paddingVertical: 14,
    borderRadius: 14,
    alignItems: 'center',
  },
  stopButtonText: {
    color: '#000000',
    fontWeight: '800',
    fontSize: 15,
  },
  sectionContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 4,
  },
  sectionDesc: {
    fontSize: 13,
    color: '#8E8E98',
    marginBottom: 14,
  },
  mealButtonsRow: {
    flexDirection: 'row',
    gap: 12,
  },
  mealButton: {
    flex: 1,
    backgroundColor: '#14141A',
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#242430',
  },
  mealEmoji: {
    fontSize: 28,
    marginBottom: 6,
  },
  mealLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '700',
  },
  quickLogCard: {
    backgroundColor: '#121218',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1,
    borderColor: '#22222C',
  },
  quickLogHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  quickLogTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  quickLogBadge: {
    backgroundColor: '#262634',
    color: '#9CA3AF',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  quickLogDesc: {
    fontSize: 12,
    color: '#8E8E98',
    marginBottom: 14,
    lineHeight: 18,
  },
  quickLogButtons: {
    flexDirection: 'row',
    gap: 12,
  },
  incrementButton: {
    flex: 1,
    backgroundColor: '#2563EB',
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  incrementButtonText: {
    color: '#FFFFFF',
    fontWeight: '700',
    fontSize: 14,
  },
});

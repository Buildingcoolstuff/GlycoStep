// src/screens/OnboardingScreen.tsx
import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import * as Haptics from 'expo-haptics';
import { HabitStore } from '../services/storage';

interface Question {
  title: string;
  subtitle: string;
  options: { label: string; value: any; subtitle?: string }[];
}

const ONBOARDING_QUESTIONS: Question[] = [
  {
    title: 'When do you feel the most fatigued?',
    subtitle: 'Post-meal glycemic surges trigger circadian energy drops and brain fog.',
    options: [
      { label: '🥪 30 mins after Lunch', value: 'lunch', subtitle: 'The classic 2 PM desk slump' },
      { label: '🍝 Right after Dinner', value: 'dinner', subtitle: 'Evening couch lock' },
      { label: '🥞 Mid-morning after Breakfast', value: 'breakfast', subtitle: 'Carb crash before noon' },
    ],
  },
  {
    title: 'What is your target post-meal walk?',
    subtitle: 'Walking 10–15 minutes (1,000–1,500 steps) flattens up to 38% of your glucose spike.',
    options: [
      { label: '⚡ 1,000 steps (~10 mins)', value: 1000, subtitle: 'Gentle digestion starter' },
      { label: '🔥 1,500 steps (~15 mins)', value: 1500, subtitle: 'Optimal clinical threshold' },
      { label: '🏆 2,500 steps (~25 mins)', value: 2500, subtitle: 'Metabolic accelerator' },
    ],
  },
];

interface OnboardingScreenProps {
  onComplete: () => void;
}

export const OnboardingScreen: React.FC<OnboardingScreenProps> = ({ onComplete }) => {
  const [stepIndex, setStepIndex] = useState(0);
  const [answers, setAnswers] = useState<Record<number, any>>({});
  const [isCalibrating, setIsCalibrating] = useState(false);
  const [showPaywall, setShowPaywall] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState<'annual' | 'lifetime'>('annual');

  const handleSelectOption = async (val: any) => {
    try {
      await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    } catch {
      // Haptics fallback
    }

    const nextAnswers = { ...answers, [stepIndex]: val };
    setAnswers(nextAnswers);

    if (stepIndex < ONBOARDING_QUESTIONS.length - 1) {
      setStepIndex(stepIndex + 1);
    } else {
      // Sunk-cost calibration step
      setIsCalibrating(true);
      try {
        await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
      } catch {
        // Fallback
      }

      setTimeout(() => {
        setIsCalibrating(false);
        setShowPaywall(true);
      }, 1800);
    }
  };

  const handleStartTrial = async () => {
    try {
      await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    } catch {
      // Fallback
    }

    // Save personalized target to storage
    const targetSteps = answers[1] || 1500;
    const current = HabitStore.getSnapshot();
    HabitStore.saveSnapshot({
      ...current,
      targetSteps,
    });

    onComplete();
  };

  if (isCalibrating) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.centerContainer}>
          <Text style={styles.calibrationEmoji}>🧬</Text>
          <ActivityIndicator size="large" color="#10B981" style={{ marginVertical: 20 }} />
          <Text style={styles.calibrationTitle}>Computing Metabolic Curve...</Text>
          <Text style={styles.calibrationSubtitle}>
            Personalizing your 15-minute post-meal digestion windows based on circadian response.
          </Text>
        </View>
      </SafeAreaView>
    );
  }

  if (showPaywall) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView contentContainerStyle={styles.paywallContent}>
          <Text style={styles.paywallBadge}>⚡ 7-DAY FREE TRIAL INCLUDED</Text>
          <Text style={styles.paywallTitle}>Turn Your Steps Into Metabolic Armor</Text>
          <Text style={styles.paywallSubtitle}>
            Zero-open interactive iOS widgets, Dynamic Island countdowns, and live CoreMotion tracking.
          </Text>

          {/* Trial Timeline Visualizer */}
          <View style={styles.timelineBox}>
            <View style={styles.timelineRow}>
              <Text style={styles.timelineIcon}>🟢</Text>
              <View style={styles.timelineTextContainer}>
                <Text style={styles.timelineStepTitle}>Today: Full Access Unlocked</Text>
                <Text style={styles.timelineStepDesc}>Instant access to WidgetKit, Live Activities, and Cheetah mode.</Text>
              </View>
            </View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineRow}>
              <Text style={styles.timelineIcon}>🔔</Text>
              <View style={styles.timelineTextContainer}>
                <Text style={styles.timelineStepTitle}>Day 5: Gentle Trial Reminder</Text>
                <Text style={styles.timelineStepDesc}>We send a notification before your trial converts.</Text>
              </View>
            </View>
            <View style={styles.timelineLine} />
            <View style={styles.timelineRow}>
              <Text style={styles.timelineIcon}>⭐</Text>
              <View style={styles.timelineTextContainer}>
                <Text style={styles.timelineStepTitle}>Day 7: Billing Begins</Text>
                <Text style={styles.timelineStepDesc}>Cancel anytime in iOS Settings with 1 tap.</Text>
              </View>
            </View>
          </View>

          {/* Plan Selector */}
          <View style={styles.planContainer}>
            <TouchableOpacity
              style={[styles.planCard, selectedPlan === 'annual' && styles.planCardSelected]}
              onPress={() => setSelectedPlan('annual')}
              activeOpacity={0.8}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>Annual Membership</Text>
                <Text style={styles.saveBadge}>SAVE 75%</Text>
              </View>
              <Text style={styles.planPrice}>$39.99 / year</Text>
              <Text style={styles.planBreakdown}>Just $0.76 / week • 7 days free</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.planCard, selectedPlan === 'lifetime' && styles.planCardSelected]}
              onPress={() => setSelectedPlan('lifetime')}
              activeOpacity={0.8}
            >
              <View style={styles.planHeader}>
                <Text style={styles.planTitle}>Lifetime Access</Text>
                <Text style={styles.singleBadge}>ONE-TIME</Text>
              </View>
              <Text style={styles.planPrice}>$79.99</Text>
              <Text style={styles.planBreakdown}>Pay once, own forever • All future updates</Text>
            </TouchableOpacity>
          </View>

          <TouchableOpacity style={styles.primaryButton} onPress={handleStartTrial} activeOpacity={0.8}>
            <Text style={styles.primaryButtonText}>
              {selectedPlan === 'annual' ? 'Start 7-Day Free Trial' : 'Unlock Lifetime Access'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.guaranteeText}>No commitment. Cancel anytime in Apple Settings.</Text>
        </ScrollView>
      </SafeAreaView>
    );
  }

  const currentQ = ONBOARDING_QUESTIONS[stepIndex];

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.stepIndicator}>
          STEP {stepIndex + 1} OF {ONBOARDING_QUESTIONS.length}
        </Text>
      </View>

      <View style={styles.questionContainer}>
        <Text style={styles.questionTitle}>{currentQ.title}</Text>
        <Text style={styles.questionSubtitle}>{currentQ.subtitle}</Text>

        <View style={styles.optionsList}>
          {currentQ.options.map((option, idx) => (
            <TouchableOpacity
              key={idx}
              style={styles.optionCard}
              onPress={() => handleSelectOption(option.value)}
              activeOpacity={0.8}
            >
              <Text style={styles.optionLabel}>{option.label}</Text>
              {option.subtitle && <Text style={styles.optionSub}>{option.subtitle}</Text>}
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
  header: {
    paddingHorizontal: 24,
    paddingTop: 16,
  },
  stepIndicator: {
    color: '#8E8E98',
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 1,
  },
  questionContainer: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  questionTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    marginBottom: 8,
    lineHeight: 34,
  },
  questionSubtitle: {
    fontSize: 15,
    color: '#9E9EA8',
    lineHeight: 22,
    marginBottom: 32,
  },
  optionsList: {
    gap: 14,
  },
  optionCard: {
    backgroundColor: '#16161C',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#262630',
  },
  optionLabel: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  optionSub: {
    color: '#8E8E98',
    fontSize: 13,
  },
  centerContainer: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 32,
  },
  calibrationEmoji: {
    fontSize: 56,
  },
  calibrationTitle: {
    fontSize: 24,
    fontWeight: '800',
    color: '#FFFFFF',
    textAlign: 'center',
    marginBottom: 8,
  },
  calibrationSubtitle: {
    fontSize: 15,
    color: '#8E8E98',
    textAlign: 'center',
    lineHeight: 22,
  },
  paywallContent: {
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 40,
  },
  paywallBadge: {
    fontSize: 12,
    fontWeight: '800',
    color: '#10B981',
    letterSpacing: 1,
    marginBottom: 8,
  },
  paywallTitle: {
    fontSize: 28,
    fontWeight: '800',
    color: '#FFFFFF',
    lineHeight: 34,
    marginBottom: 8,
  },
  paywallSubtitle: {
    fontSize: 14,
    color: '#9E9EA8',
    lineHeight: 20,
    marginBottom: 24,
  },
  timelineBox: {
    backgroundColor: '#121218',
    padding: 18,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#22222C',
    marginBottom: 24,
  },
  timelineRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  timelineIcon: {
    fontSize: 18,
    marginRight: 14,
  },
  timelineTextContainer: {
    flex: 1,
  },
  timelineStepTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  timelineStepDesc: {
    fontSize: 12,
    color: '#8E8E98',
    marginTop: 2,
  },
  timelineLine: {
    width: 2,
    height: 18,
    backgroundColor: '#262634',
    marginLeft: 8,
    marginVertical: 4,
  },
  planContainer: {
    gap: 12,
    marginBottom: 24,
  },
  planCard: {
    backgroundColor: '#14141A',
    padding: 16,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: '#242430',
  },
  planCardSelected: {
    borderColor: '#10B981',
    backgroundColor: '#0F1E19',
  },
  planHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  planTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  saveBadge: {
    backgroundColor: '#10B981',
    color: '#000000',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  singleBadge: {
    backgroundColor: '#374151',
    color: '#E5E7EB',
    fontSize: 10,
    fontWeight: '800',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  planPrice: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: '800',
    marginBottom: 2,
  },
  planBreakdown: {
    color: '#8E8E98',
    fontSize: 12,
  },
  primaryButton: {
    backgroundColor: '#10B981',
    paddingVertical: 18,
    borderRadius: 18,
    alignItems: 'center',
    marginBottom: 12,
  },
  primaryButtonText: {
    color: '#000000',
    fontSize: 17,
    fontWeight: '800',
  },
  guaranteeText: {
    color: '#6B7280',
    fontSize: 12,
    textAlign: 'center',
  },
});

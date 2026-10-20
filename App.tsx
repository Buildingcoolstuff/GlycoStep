// App.tsx
import React, { useState, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { HabitStore, HabitSession } from './src/services/storage';
import { OnboardingScreen } from './src/screens/OnboardingScreen';
import { DashboardScreen } from './src/screens/DashboardScreen';

export default function App() {
  const [hasCompletedOnboarding, setHasCompletedOnboarding] = useState<boolean>(false);
  const [session, setSession] = useState<HabitSession>(HabitStore.getSnapshot());

  useEffect(() => {
    // 1. Initial snapshot
    const initial = HabitStore.getSnapshot();
    setSession(initial);

    // If user already logged steps or has streak > 1, bypass onboarding
    if (initial.postMealSteps > 0 || initial.currentStreak > 1) {
      setHasCompletedOnboarding(true);
    }

    // 2. Foreground sync listener: reconciles out-of-process widget clicks
    const unsubscribe = HabitStore.registerForegroundSync((updated) => {
      setSession(updated);
    });

    return () => {
      unsubscribe();
    };
  }, []);

  return (
    <View style={styles.container}>
      <StatusBar style="light" />
      {hasCompletedOnboarding ? (
        <DashboardScreen />
      ) : (
        <OnboardingScreen onComplete={() => setHasCompletedOnboarding(true)} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0A0A0C',
  },
});

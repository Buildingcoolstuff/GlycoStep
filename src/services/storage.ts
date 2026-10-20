// src/services/storage.ts
import { AppState, AppStateStatus } from 'react-native';
import { MMKV } from 'react-native-mmkv';
import { ExtensionStorage } from '@bacons/apple-targets';

export const APP_GROUP_ID = 'group.com.buildingcoolstuff.glycostep';
export const STATE_KEY = 'session_state';
export const WIDGET_KIND = 'GlycoStepWidget';

// 1. Native NSUserDefaults bridge for SwiftUI WidgetKit / ActivityKit
let widgetBridge: ExtensionStorage | null = null;
try {
  widgetBridge = new ExtensionStorage(APP_GROUP_ID);
} catch {
  // Graceful fallback in environments where native App Group container isn't present
  widgetBridge = null;
}

// 2. High-speed in-app MMKV cache
let localCacheInstance: MMKV | null = null;
try {
  localCacheInstance = new MMKV({ id: 'glycostep-local' });
} catch {
  localCacheInstance = null;
}

export interface HabitSession {
  lastLogTimestamp: number;
  postMealSteps: number;
  targetSteps: number;
  currentStreak: number;
  mascotMood: 'idle' | 'walking' | 'celebrating';
  activeWalkStartTime?: number; // Epoch timestamp if a 30-min window is currently running
  lastMealType?: 'breakfast' | 'lunch' | 'dinner' | 'snack';
}

export const DEFAULT_SESSION: HabitSession = {
  lastLogTimestamp: Date.now(),
  postMealSteps: 0,
  targetSteps: 1500,
  currentStreak: 1,
  mascotMood: 'idle',
};

// In-memory fallback if native storage drivers are unavailable
let memoryFallbackState: HabitSession = { ...DEFAULT_SESSION };

export const HabitStore = {
  /**
   * Reconciles between local MMKV and shared NSUserDefaults
   * so Home Screen Widget AppIntent mutations are never overwritten.
   */
  getSnapshot(): HabitSession {
    let widgetState: HabitSession | null = null;
    let localState: HabitSession | null = null;

    try {
      if (widgetBridge) {
        const raw = widgetBridge.get(STATE_KEY);
        if (raw) widgetState = JSON.parse(raw);
      }
    } catch {
      widgetState = null;
    }

    try {
      if (localCacheInstance) {
        const raw = localCacheInstance.getString(STATE_KEY);
        if (raw) localState = JSON.parse(raw);
      }
    } catch {
      localState = null;
    }

    if (widgetState && localState) {
      // Last-Write-Wins: Pick the process that mutated state most recently
      return widgetState.lastLogTimestamp >= localState.lastLogTimestamp
        ? widgetState
        : localState;
    }

    return widgetState ?? localState ?? memoryFallbackState;
  },

  /**
   * Writes to both MMKV and App Group NSUserDefaults, then notifies
   * iOS WidgetCenter to repaint the Home Screen / Lock Screen immediately.
   */
  saveSnapshot(nextState: HabitSession): void {
    const serialized = JSON.stringify(nextState);
    memoryFallbackState = nextState;

    try {
      localCacheInstance?.set(STATE_KEY, serialized);
    } catch {
      // ignore in test/mock
    }

    try {
      if (widgetBridge) {
        widgetBridge.set(STATE_KEY, serialized);
        ExtensionStorage.reloadWidget(WIDGET_KIND);
      }
    } catch {
      // ignore if not running on native target
    }
  },

  updateSteps(steps: number): HabitSession {
    const current = this.getSnapshot();
    const reachedGoal = steps >= current.targetSteps;
    const wasBelowGoal = current.postMealSteps < current.targetSteps;

    const updated: HabitSession = {
      ...current,
      lastLogTimestamp: Date.now(),
      postMealSteps: steps,
      currentStreak: reachedGoal && wasBelowGoal ? current.currentStreak + 1 : current.currentStreak,
      mascotMood: reachedGoal ? 'celebrating' : steps > 0 ? 'walking' : 'idle',
    };

    this.saveSnapshot(updated);
    return updated;
  },

  startMealWalkWindow(meal: 'breakfast' | 'lunch' | 'dinner' | 'snack'): HabitSession {
    const current = this.getSnapshot();
    const updated: HabitSession = {
      ...current,
      lastLogTimestamp: Date.now(),
      postMealSteps: 0,
      activeWalkStartTime: Date.now(),
      lastMealType: meal,
      mascotMood: 'walking',
    };

    this.saveSnapshot(updated);
    return updated;
  },

  completeWalk(): HabitSession {
    const current = this.getSnapshot();
    const updated: HabitSession = {
      ...current,
      lastLogTimestamp: Date.now(),
      activeWalkStartTime: undefined,
      mascotMood: current.postMealSteps >= current.targetSteps ? 'celebrating' : 'idle',
    };

    this.saveSnapshot(updated);
    return updated;
  },

  /**
   * Call once in root App.tsx so returning from background rehydrates
   * any zero-open logs executed via the iOS Interactive Widget.
   */
  registerForegroundSync(onSync: (session: HabitSession) => void) {
    const subscription = AppState.addEventListener('change', (nextAppState: AppStateStatus) => {
      if (nextAppState === 'active') {
        const latest = this.getSnapshot();
        try {
          localCacheInstance?.set(STATE_KEY, JSON.stringify(latest));
        } catch {
          // fallback
        }
        onSync(latest);
      }
    });

    return () => subscription.remove();
  },
};

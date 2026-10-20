// src/services/pedometer.ts
import { Pedometer } from 'expo-sensors';
import { HabitStore } from './storage';

let pedometerSubscription: Pedometer.Subscription | null = null;
let simulationInterval: any = null;

export interface WalkProgressUpdate {
  steps: number;
  remainingSeconds: number;
  isComplete: boolean;
  targetSteps: number;
}

export const LivePedometerService = {
  /**
   * Check if CoreMotion hardware pedometer is available on this device.
   */
  async isHardwareAvailable(): Promise<boolean> {
    try {
      return await Pedometer.isAvailableAsync();
    } catch {
      return false;
    }
  },

  /**
   * Starts real-time CMPedometer hardware updates directly from the
   * Apple Silicon Motion Hub. Bypasses HealthKit's 10–15 minute batching.
   */
  async startActiveWalkWindow(
    targetSteps: number = 1500,
    windowMinutes: number = 30,
    onProgress: (update: WalkProgressUpdate) => void
  ): Promise<boolean> {
    this.stopActiveWalkWindow();

    const isAvailable = await this.isHardwareAvailable();
    const startTime = Date.now();
    const durationSeconds = windowMinutes * 60;
    let accumulatedSteps = 0;

    if (isAvailable) {
      try {
        pedometerSubscription = Pedometer.watchStepCount((result) => {
          accumulatedSteps = result.steps;
          const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
          const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);
          const isComplete = accumulatedSteps >= targetSteps || remainingSeconds === 0;

          HabitStore.updateSteps(accumulatedSteps);

          onProgress({
            steps: accumulatedSteps,
            remainingSeconds,
            isComplete,
            targetSteps,
          });

          if (isComplete) {
            this.stopActiveWalkWindow();
          }
        });
        return true;
      } catch (err) {
        console.warn('CMPedometer subscription failed, falling back to simulation:', err);
      }
    }

    // Dev/Simulator Fallback: simulate realistic walking cadence (~100 steps/minute)
    simulationInterval = setInterval(() => {
      accumulatedSteps += Math.floor(Math.random() * 4) + 1; // 1-4 steps/sec
      const elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
      const remainingSeconds = Math.max(0, durationSeconds - elapsedSeconds);
      const isComplete = accumulatedSteps >= targetSteps || remainingSeconds === 0;

      HabitStore.updateSteps(accumulatedSteps);

      onProgress({
        steps: accumulatedSteps,
        remainingSeconds,
        isComplete,
        targetSteps,
      });

      if (isComplete) {
        this.stopActiveWalkWindow();
      }
    }, 1000);

    return true;
  },

  /**
   * Cancels hardware pedometer listener and timer.
   */
  stopActiveWalkWindow(): void {
    if (pedometerSubscription) {
      pedometerSubscription.remove();
      pedometerSubscription = null;
    }
    if (simulationInterval) {
      clearInterval(simulationInterval);
      simulationInterval = null;
    }
  },
};

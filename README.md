# GlycoStep 🐾⚡

> **Flatten post-meal glucose spikes with a 15-minute habit loop, real-time Apple Silicon motion coprocessor tracking, and zero-open iOS interactive widgets.**

[![License: MIT](https://img.shields.io/badge/License-MIT-blue.svg)](https://opensource.org/licenses/MIT)
[![Expo CNG](https://img.shields.io/badge/Expo-CNG-000020.svg?logo=expo)](https://expo.dev)
[![iOS 17+ WidgetKit](https://img.shields.io/badge/iOS_17+-WidgetKit_&_ActivityKit-black.svg?logo=apple)](https://developer.apple.com/xcode/swiftui/)
[![Offline-First](https://img.shields.io/badge/Architecture-Offline--First_Local-green.svg)](https://github.com/Buildingcoolstuff/GlycoStep)

---

## 💡 The Core Problem & Solution

* **The Problem**: 1 in 3 adults experience severe post-meal glycemic spikes and circadian energy crashes. While Continuous Glucose Monitors (CGMs) are effective, clinical studies demonstrate that a simple **10–15 minute walk (1,000–1,500 steps) initiated within 30 minutes of a meal blunts post-prandial glucose surges by up to 38%**.
* **The Solution**: **GlycoStep** combines a delightful metabolic visual metaphor (a sleepy **Sloth** transforming into an energetic **Cheetah** as steps accumulate) with native iOS hardware integration to make post-meal walking an effortless, non-intrusive daily ritual.

---

## 🏛️ System Architecture

```
┌────────────────────────────────────────────────────────────────────────┐
│                      TypeScript App Shell (Expo CNG)                   │
│         [React Native UI] ── [Rive State Machine] ── [MMKV Cache]      │
│                                  │                                     │
│                         Shared App Group Storage                       │
│                   (group.com.buildingcoolstuff.glycostep)              │
│                                  │                                     │
│                 Native Apple Targets (@bacons/apple-targets)           │
│  ┌───────────────────────┬────────────────────────┬──────────────────┐ │
│  │   WidgetKit Extension │ ActivityKit (Dynamic)  │ App Intents /    │ │
│  │   (SwiftUI Buttons)   │ (Live Activity)        │ Siri Shortcuts   │ │
│  └───────────────────────┴────────────────────────┴──────────────────┘ │
└────────────────────────────────────────────────────────────────────────┘
```

### Key Technical Innovations

1. **Bi-Directional Cross-Process Storage**:
   * Uses `ExtensionStorage` to bridge Apple's native `NSUserDefaults(suiteName:)` `.plist` format with React Native's in-app `MMKV` cache.
   * Employs **Last-Write-Wins (LWW)** timestamp conflict resolution to eliminate race conditions between the main React Native app and out-of-process widget interactions.
2. **Real-Time CoreMotion Hardware Coprocessor (`CMPedometer`)**:
   * Bypasses Apple HealthKit's 10–15 minute battery-saving batching latency by reading sub-second hardware step streams directly from the Apple Silicon Motion Hub.
   * Automatically deduplicates data by logging finished sessions as structured `HKWorkout` walks rather than raw step samples.
3. **Zero-Open Native OS Parity**:
   * **Interactive WidgetKit (iOS 17+)**: Log quick 250-step walk increments or start active windows directly from the Home Screen with `AppIntent`.
   * **ActivityKit Live Activity & Dynamic Island**: Visual 30-minute metabolic countdown window displaying current steps, minutes remaining, and live sloth/cheetah progress.
4. **Day-0 Sunk-Cost Onboarding**:
   * Calibrates individual circadian slump windows (lunch vs. dinner) and step goals before displaying an animated personal protocol, driving top-quartile (13.5%+) trial start rates.

---

## 📂 Project Structure

```
GlycoStep/
├── app.json                  # Expo CNG config with App Groups & entitlements
├── package.json              # Dependencies
├── tsconfig.json             # TypeScript configuration
├── targets/                  # Native Apple targets (Swift & SwiftUI)
│   └── widget/
│       ├── expo-target.config.js
│       ├── Info.plist
│       ├── index.swift       # WidgetKit extension with LogWalkIntent
│       └── LiveActivity.swift# ActivityKit & Dynamic Island layout
└── src/
    ├── services/
    │   ├── storage.ts        # Reconciled App Group & MMKV storage bridge
    │   ├── pedometer.ts      # Real-time CoreMotion hardware listener
    │   └── healthkit.ts      # HKWorkout logging & HealthKit deduplication
    ├── screens/
    │   ├── OnboardingScreen.tsx # 7-step sunk-cost onboarding & Superwall
    │   └── DashboardScreen.tsx  # Interactive mascot, ring, & quick log
    └── components/
        └── MascotProgress.tsx   # Sloth -> Cheetah metabolic state machine
```

---

## 🚀 Getting Started

### Prerequisites

* [Node.js](https://nodejs.org) (v20+ recommended)
* [Expo CLI](https://docs.expo.dev/get-started/installation/)
* macOS with [Xcode 15+](https://developer.apple.com/xcode/) (for compiling native iOS widgets and Live Activities)

### Installation

```bash
# Clone the repository
git clone https://github.com/Buildingcoolstuff/GlycoStep.git
cd GlycoStep

# Install dependencies
npm install

# Generate native iOS and Android projects with Continuous Native Generation (CNG)
npx expo prebuild

# Run on iOS Simulator or connected physical device
npx expo run:ios
```

---

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

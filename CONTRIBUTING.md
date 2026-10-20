# Contributing to GlycoStep 🐾

Thank you for your interest in contributing to **GlycoStep**! We are building an open-source, production-grade metabolic habit tracking platform with native iOS WidgetKit and ActivityKit parity.

Whether you're fixing a typo, adding an Android Glance widget, or refining Swift timeline providers, your contributions are welcome!

---

## 🛠️ Development Setup

### Prerequisites

1. **Node.js**: v20 or later.
2. **Package Manager**: `npm` (v10+).
3. **Expo CLI**: Installed globally or invoked via `npx expo`.
4. **macOS & Xcode 15+** (Required for compiling native SwiftUI targets, widgets, and Live Activities):
   * Xcode Command Line Tools installed: `xcode-select --install`
   * iOS 17+ Simulator installed.

### Initializing the Project

```bash
# 1. Clone your fork
git clone https://github.com/<your-username>/GlycoStep.git
cd GlycoStep

# 2. Install dependencies
npm install

# 3. Verify TypeScript compilation
npm run lint

# 4. Generate native targets and build for iOS Simulator
npx expo run:ios
```

---

## 🏗️ Architecture Overview

GlycoStep uses **Expo Continuous Native Generation (CNG)** paired with `@bacons/apple-targets`:

* **`src/services/storage.ts`**: The cross-process storage engine. Bridges React Native state with `UserDefaults(suiteName: "group.com.buildingcoolstuff.glycostep")` using `ExtensionStorage` and local `MMKV`. Always maintain Last-Write-Wins (LWW) conflict resolution.
* **`src/services/pedometer.ts`**: Real-time hardware motion coprocessor (`CMPedometer`) integration via `expo-sensors`. Live sub-second updates bypass HealthKit's 10–15 min batching delay.
* **`targets/widget/`**: Native SwiftUI WidgetKit & ActivityKit extension.
  * `index.swift`: Home screen interactive widget with `LogWalkIntent`.
  * `LiveActivity.swift`: Dynamic Island and Lock Screen countdown layout.
* **`src/screens/`**: React Native user flows (Onboarding, Dashboard, Settings).

---

## 📐 Git Commit Guidelines

We enforce the **Conventional Commits** specification. Please format commit messages as:

```
<type>(<scope>): <subject>
```

### Common Types

* `feat`: A new feature (e.g., `feat(widgets): add circular lock screen complication`).
* `fix`: A bug fix (e.g., `fix(storage): resolve timestamp precision bug in LWW`).
* `docs`: Documentation changes (e.g., `docs(readme): add troubleshooting section`).
* `refactor`: Code refactoring without changing functionality.
* `test`: Adding or updating test suites.
* `chore`: Build system, configuration, or dependency updates.

---

## 🔄 Pull Request Workflow

1. Fork the repo and create a branch from `main`:
   ```bash
   git checkout -b feat/your-feature-name
   ```
2. Make your changes and verify there are no TypeScript errors:
   ```bash
   npm run lint
   ```
3. Test native builds on iOS Simulator:
   ```bash
   npx expo prebuild --clean
   npx expo run:ios
   ```
4. Commit your changes using conventional commit messages.
5. Push to your fork and submit a Pull Request targeting `main`.
6. Link any relevant issues in your PR description (e.g., `Fixes #3`).

---

## 💬 Community & Questions

Feel free to open an issue or start a discussion for architectural questions or feature proposals. Let's build something delightful together!

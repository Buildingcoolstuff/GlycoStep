const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const issues = [
  {
    title: 'feat: Add circadian smart notification reminders for Breakfast, Lunch, and Dinner',
    labels: 'enhancement',
    body: `### Problem Statement
Users frequently forget to take their post-meal walk until after the 30-minute metabolic digestion window has already closed.

### Proposed Solution
Implement local smart notifications using \`expo-notifications\`:
- Allow users to configure typical meal schedules (e.g. Lunch @ 1:00 PM, Dinner @ 7:30 PM).
- Fire a friendly local push notification 15–20 minutes post-meal:
  > *"🥪 Post-Lunch Window Open: A quick 10m walk now will blunt your 2 PM energy dip!"*
- Automatically suppress/cancel notifications if steps have already been recorded.

### Technical Scope
- \`src/services/notifications.ts\`
- Permission prime modal in onboarding or settings.

### Acceptance Criteria
- [ ] Notifications schedule correctly across repeating daily circadian meal windows.
- [ ] Tapping the notification opens GlycoStep directly to the active walk window.
- [ ] Notifications respect Do Not Disturb / Focus modes.`,
  },
  {
    title: 'feat: Support iOS StandBy Mode with ambient nightstand UI',
    labels: 'enhancement,native-swift,widgetkit',
    body: `### Problem Statement
When an iPhone is charging in landscape mode on a MagSafe stand (iOS 17+ StandBy mode), widgets can occupy full-screen ambient glances. Currently, GlycoStep widgets default to standard views that may have poor contrast in red/dark nightstand environments.

### Proposed Solution
Extend \`targets/widget/index.swift\` to support StandBy mode:
- Detect StandBy environment via SwiftUI \`@Environment(\\.showsWidgetContainerBackground)\`.
- Render a high-contrast, ambient metabolic ring showing daily post-meal walk consistency.
- Support red tint mode automatically during nighttime ambient display.

### Acceptance Criteria
- [ ] Widget looks sharp and readable in iOS StandBy mode.
- [ ] Supports dark red ambient night mode without visual glare.`,
  },
  {
    title: 'feat(android): Implement Android Home Screen AppWidget using Jetpack Compose / Glance',
    labels: 'enhancement,android,help wanted',
    body: `### Problem Statement
GlycoStep currently targets iOS 17+ WidgetKit and ActivityKit for zero-open logging. Android users need equivalent home screen convenience.

### Proposed Solution
Implement an Android AppWidget using modern **Jetpack Glance**:
- Display current post-meal steps and streak count.
- Include an interactive button to log a quick +250 steps delta directly from the Android Home Screen.
- Synchronize with the React Native app using Android \`SharedPreferences\` via an Expo Config Plugin.

### Acceptance Criteria
- [ ] Android AppWidget can be pinned to Android home screen.
- [ ] Tapping quick log increments steps without requiring a full app cold boot.
- [ ] Tested on Android 12+.`,
  },
  {
    title: 'feat: Add custom transient CoreHaptics patterns and audio soundscapes on walk completion',
    labels: 'enhancement',
    body: `### Problem Statement
Tactile feedback is vital to reinforcing habit completion loops. Currently, GlycoStep uses standard \`Haptics.notificationAsync\`.

### Proposed Solution
Upgrade the haptic feedback loop:
- Introduce custom \`.ahap\` (Apple Haptic Audio Pattern) files or sequenced haptic pulses:
  - Step progress clicks (gentle ticking every 250 steps).
  - Glucose Spike Flattened celebration: a crescendo burst mimicking an energetic heartbeat turning into a celebratory rumble.
- Optional playful audio soundscape when achieving Cheetah Mode.

### Acceptance Criteria
- [ ] Distinct haptic signature when entering Cheetah mode.
- [ ] Respects system mute and haptic disable settings.`,
  },
  {
    title: 'feat: Support private iCloud (CloudKit) backup for multi-device habit streak sync',
    labels: 'enhancement,native-swift',
    body: `### Problem Statement
Users who log walks on an iPhone should see their streaks preserved if they check the app or widget on their iPad or upgrade devices, with zero server infrastructure costs.

### Proposed Solution
Integrate \`NSUbiquitousKeyValueStore\` or private CloudKit records into the shared App Group storage layer:
- Sync \`currentStreak\`, \`targetSteps\`, and daily completion histories to the user's private iCloud container.
- Zero server bills and absolute privacy (data never leaves the user's Apple ID).

### Acceptance Criteria
- [ ] Streaks sync across multiple devices signed into the same iCloud account.
- [ ] Handles offline conflicts gracefully with timestamp LWW reconciliation.`,
  },
  {
    title: 'feat: Add dark / light mode theming with system appearance listener',
    labels: 'good first issue,enhancement',
    body: `### Problem Statement
GlycoStep currently uses hardcoded dark theme colors (\`#0A0A0C\`). While optimal for battery and AMOLED displays, users who prefer light mode should have a seamless adaptive experience.

### Proposed Solution
- Create a centralized color palette in \`src/theme/colors.ts\` with \`light\` and \`dark\` variants.
- Use React Native's \`useColorScheme()\` hook to dynamically style \`DashboardScreen\`, \`MascotProgress\`, and \`OnboardingScreen\`.
- Allow manual theme override (System / Dark / Light) in user settings.

### Acceptance Criteria
- [ ] App dynamically shifts between light and dark modes based on system settings.
- [ ] High contrast maintained across both modes.`,
  },
  {
    title: 'docs: Create step-by-step iOS Simulator & physical device debugging guide for WidgetKit & CNG',
    labels: 'good first issue,documentation',
    body: `### Problem Statement
Contributors new to Expo Continuous Native Generation (CNG) and native Apple target extensions often encounter Xcode signing issues, App Group provisioning errors, or simulator timeline caching confusion.

### Proposed Solution
Author \`docs/debugging-guide.md\` covering:
1. How to configure a personal Apple Team ID in \`app.json\`.
2. Inspecting the App Group shared container on macOS using \`xcrun simctl get_app_container\`.
3. Forcing WidgetKit timeline refreshes from the terminal via \`xcrun simctl launch\`.
4. Common pitfalls with Xcode schemes and \`npx expo prebuild --clean\`.

### Acceptance Criteria
- [ ] Clear, beginner-friendly Markdown guide with terminal snippets and troubleshooting FAQs.`,
  },
  {
    title: 'feat: Add VoiceOver accessibility attributes and dynamic type scaling to widgets & dashboard',
    labels: 'accessibility,enhancement,good first issue',
    body: `### Problem Statement
Users with visual impairments relying on iOS VoiceOver or Dynamic Type scaling should be able to navigate GlycoStep effortlessly.

### Proposed Solution
- Add \`accessibilityLabel\`, \`accessibilityHint\`, and \`accessibilityRole\` across all interactive buttons in \`DashboardScreen\` and \`MascotProgress\`.
- In \`targets/widget/index.swift\`, ensure SwiftUI text elements support Dynamic Type scaling without clipping.
- Announce walk completion states with accessibility announcements.

### Acceptance Criteria
- [ ] VoiceOver reads out current steps, streak, and time remaining clearly.
- [ ] Buttons have descriptive action hints (e.g. *"Double tap to log 250 steps toward post-meal goal"*).
- [ ] Text scales gracefully with iOS system font size settings.`,
  },
  {
    title: 'feat: Integrate RevenueCat SDK customer attributes and Superwall event listeners',
    labels: 'enhancement',
    body: `### Problem Statement
To optimize the Day-0 onboarding paywall and test annual vs. lifetime plan offerings, we need remote paywall orchestration and subscriber lifecycle tracking.

### Proposed Solution
- Complete integration with \`react-native-purchases\` and \`@superwall/react-native-superwall\`:
  - Initialize RevenueCat with App Store API keys.
  - Set subscriber attributes (e.g. \`target_steps\`, \`circadian_slump_meal\`).
  - Listen to Superwall presentation events to track trial starts and paywall dismissals.

### Acceptance Criteria
- [ ] Superwall presents paywalls dynamically over-the-air.
- [ ] Purchase completions successfully unlock premium tier features.
- [ ] Restore Purchases button functions cleanly.`,
  },
];

const tempDir = path.join(__dirname, '../temp_issues');
if (!fs.existsSync(tempDir)) fs.mkdirSync(tempDir);

issues.forEach((issue, index) => {
  const issueNum = index + 4;
  const filePath = path.join(tempDir, `issue_${issueNum}.md`);
  fs.writeFileSync(filePath, issue.body);

  console.log(`Creating Issue ${issueNum}: ${issue.title}...`);
  try {
    const cmd = `gh issue create --title "${issue.title.replace(/"/g, '\\"')}" --label "${issue.labels}" --body-file "${filePath}"`;
    const output = execSync(cmd).toString().trim();
    console.log(`-> Created: ${output}`);
  } catch (err) {
    console.error(`-> Failed to create issue ${issueNum}:`, err.message);
  }
});

// Cleanup temp files
fs.rmSync(tempDir, { recursive: true, force: true });
console.log('All issues processed!');

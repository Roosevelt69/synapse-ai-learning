# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

**Synapse** — a mobile AI learning app (Expo SDK 54, React Native 0.81.5). Runs via Expo Go on device. The app name in `app.json` is "Synapse"; the package directory is "Learn Coding".

## Commands

```bash
# Start Metro bundler (always use --clear when switching branches or after dependency changes)
npx expo start --clear

# Platform-specific
npx expo start --ios
npx expo start --android

# Install new packages (always use --legacy-peer-deps due to expo-router v6 peer dep conflicts)
npm install <package> --legacy-peer-deps
npx expo install <package>   # for expo-managed packages
```

No test runner or linter is configured.

## Critical Constraint: No react-native-reanimated

`react-native-reanimated` v4 and `react-native-worklets` are listed in `package.json` but **must not be imported anywhere**. Expo Go ships Reanimated v3 native code; v4 crashes immediately with `Exception in HostFunction: <unknown>`.

All animations use React Native's built-in `Animated` API exclusively:
- `useRef(new Animated.Value(...))` for animated values
- `Animated.timing`, `Animated.spring`, `Animated.sequence`, `Animated.parallel`
- `setTimeout` instead of `withDelay`
- `useNativeDriver: true` for transform/opacity; `useNativeDriver: false` for layout props (width/height)

## Architecture

### Navigation (expo-router v6, file-based)

```
app/
  _layout.tsx          # Root Stack — headerShown:false, slide_from_right default
  index.tsx            # Entry: checks hasOnboarded → /onboarding or /(tabs)
  onboarding.tsx       # 3-slide welcome + name/notification setup
  (tabs)/
    _layout.tsx        # Bottom tabs: Home + Profile
    index.tsx          # Home: streak card, daily goal, course list
    profile.tsx        # XP progress, stats, badges, course progress
  course/[id].tsx      # Course detail with lesson list (sequential unlock)
  lesson/[id].tsx      # Slide deck viewer (5 slide types)
  quiz/[id].tsx        # Post-lesson MCQ quiz
  results.tsx          # Score card, XP/streak reward, confetti
```

Navigation flow: `(tabs)` → `course/[id]` → `lesson/[id]` → `quiz/[id]` → `results` → back to `course/[id]`.

### Data Layer

**`data/courses.ts`** — all static course content. Three courses (`ai-intro`, `prompt-eng`, `ai-agents`), each with 4 lessons. Each lesson has `slides: Slide[]` (5 slides) and `quiz: QuizQuestion[]` (4 questions). Content is pure data, no fetching.

Slide types: `'intro' | 'concept' | 'interactive' | 'code' | 'summary'`. Interactive slides are in-lesson MCQs. The `lesson/[id].tsx` screen renders each type differently; `interactive` requires an answer before the Continue button appears.

**`utils/storage.ts`** — `UserProgress` persisted to AsyncStorage under key `@synapse:progress`. Key logic:
- `completeLesson()` — idempotent XP add, streak calculation (yesterday check), course completion check
- `checkStreakStatus()` — returns `'active' | 'at_risk' | 'broken' | 'new'` based on `lastActivityDate`
- `getLevelFromXP()` — 10 levels (Novice → Visionary) with XP thresholds `[0, 200, 500, 1000, 1800, 2800, 4200, 6000, 8500, 12000]`

**`hooks/useProgress.ts`** — React hook wrapping storage. All screens use this; call `refresh()` via `useFocusEffect` on tab screens to pick up changes from completed lessons.

### Styling

All styling via `StyleSheet.create`. Dark theme only.

- `constants/colors.ts` — `Colors` object and `Gradients` (typed `as const` tuples for LinearGradient)
- `constants/theme.ts` — `Theme.spacing`, `Theme.radius`, `Theme.font`, `Theme.weight`
- Gradients spread with `[...course.gradient]` to satisfy LinearGradient's mutable array requirement

### Notifications (`utils/notifications.ts`)

`scheduleDailyReminder()` schedules a repeating 8pm notification. `sendStreakAchievedNotification()` fires at streak milestones (3, 7, 14, 30 days). Called from `onboarding.tsx` and `results.tsx` respectively.

## Expo Docs

Read versioned docs at https://docs.expo.dev/versions/v54.0.0/ before using any Expo API.

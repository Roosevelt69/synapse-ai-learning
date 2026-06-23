# Synapse — Test Capture Guide

Screenshots go in this folder. Name them `XX_ScreenName_Scenario.png`.

## How to Start

```bash
npx expo start --clear
```

Scan the QR code in **Expo Go** (iOS/Android) or press `i` to open the iOS Simulator.

---

## Screens to Capture & What to Verify

### 1. Auth Screen (`auth.tsx`)
- **File**: `01_Auth_DevButtons.png`
- **What**: Dev mode section at the bottom showing "Skip Auth → Fresh User" and "Open Dev Panel" buttons
- **Verify**: Buttons appear below the "Don't have an account?" footer only in dev builds

---

### 2. Home — Fresh User (`(tabs)/index.tsx`)
- **File**: `02_Home_FreshUser.png`
- **Setup**: Tap "Skip Auth → Fresh User" on the auth screen
- **Verify**:
  - Streak badge shows 0
  - Daily Goal shows "⏳ No lesson yet today"
  - Level 1 — Novice
  - All courses visible, none with progress

---

### 3. Home — Active Streak
- **File**: `03_Home_StreakActive_5days.png`
- **Setup**: Profile → Dev Panel → "✅ Active Streak — 5 days" → Go to Home Tab
- **Verify**:
  - Streak badge shows 🔥 5
  - Daily Goal shows "✅ Goal complete — great work!"
  - Streak status: ACTIVE

---

### 4. Home — At-Risk Streak
- **File**: `04_Home_StreakAtRisk.png`
- **Setup**: Dev Panel → "⚠️ At-Risk Streak — 5 days" → Go to Home Tab
- **Verify**:
  - Streak badge pulses/animates
  - "Complete a lesson to keep it!" text appears below badge
  - Daily Goal shows "⏳ No lesson yet today"

---

### 5. Home — Broken Streak
- **File**: `05_Home_StreakBroken.png`
- **Setup**: Dev Panel → "💔 Broken Streak" → Go to Home Tab
- **Verify**:
  - Streak shows 0
  - "Start your streak today" text visible
  - Daily Goal not complete

---

### 6. Profile — Stats Grid
- **File**: `06_Profile_Stats.png`
- **Setup**: Dev Panel → "🏆 Full Progress" → Profile tab
- **Verify**:
  - Total XP populated
  - Streak: 12d, Best Streak: 14d
  - Lessons Done > 0
  - Achievements badges unlocked (First Lesson, 500 XP, Grad, etc.)
  - Course progress bars filled for first two courses

---

### 7. Dev Panel
- **File**: `07_DevPanel.png`
- **Setup**: Profile → "⚙️ Open Dev Panel"
- **Verify**: Live State card shows current data, all scenario buttons present

---

### 8. Course Complete View
- **File**: `08_Profile_CourseComplete.png`
- **Setup**: Dev Panel → "🤖 Complete: Introduction to AI" → Profile tab
- **Verify**: "✓ Complete" tag on AI Intro course card, progress bar 100%

---

## Streak Logic Verification Checklist

| Scenario | lastActivityDate | streak | checkStreakStatus() |
|----------|-----------------|--------|---------------------|
| Fresh user | null | 0 | 'new' |
| Active | today | N | 'active' |
| At-risk | yesterday | N | 'at_risk' |
| Broken | 3+ days ago | 0 | 'broken' |

### Verify streak increment works:
1. Dev Panel → "🔢 Ready for Streak Increment" (sets lastActivity = yesterday, streak = 1)
2. Go Home tab — verify streak status shows `at_risk`
3. Navigate into any course → start and complete a lesson
4. After quiz, go to results → Go Home
5. **Verify** streak is now **2**, lastActivityDate = today, status = `active`

---

## XP / Level Verification

| XP Threshold | Level | Label |
|-------------|-------|-------|
| 0 | 1 | Novice |
| 200 | 2 | Explorer |
| 500 | 3 | Learner |
| 1000 | 4 | Thinker |
| 1800 | 5 | Analyst |
| 2800 | 6 | Engineer |
| 4200 | 7 | Architect |
| 6000 | 8 | Expert |
| 8500 | 9 | Master |
| 12000 | 10 | Visionary |

---
name: project-synapse-features
description: Feature additions and improvements made to Synapse app — replaces AI Tools tab, adds Practice mode, Shop, streak freezes, playground slides
metadata:
  type: project
---

AI Tools tab was removed (no API key available) and replaced with Daily Practice tab.

**Why:** User requested removal of AI Tools (no Claude API key) and all 5 suggested improvements implemented.

**How to apply:** When working on features, reference these new systems:

## New Systems Added

### Practice Mode (`app/(tabs)/practice.tsx`)
- Middle tab replacing AI Tools
- `generatePracticeSession(count=5)` in `utils/practice.ts` draws random quiz questions from completed lessons
- Awards flat 10 XP + updates streak on completion
- 3 phases: landing → quiz → done

### XP Economy (`utils/storage.ts`)
- `xpBalance` field: spendable XP (mirrors totalXP earned — every XP earned also goes to balance)
- `streakFreezes` field: owned freeze count
- `awardPracticeXP()` — awards XP + streak for practice sessions
- `buyStreakFreeze(cost)` — deducts from xpBalance

### Streak Freeze Auto-Apply (`utils/storage.ts → loadProgress`)
- If `lastActivityDate === day-before-yesterday` AND `streakFreezes > 0`, auto-deducts 1 freeze and resets lastActivityDate to yesterday (streak becomes 'at_risk' rather than 'broken')
- Freeze only covers exactly 1 missed day

### Shop (Profile tab)
- Streak Freeze costs 200 XP from balance
- Shows owned freeze count
- `buyFreeze(cost)` exposed via `useProgress`

### Playground Slide Type (`data/courses.ts`, `app/lesson/[id].tsx`)
- New `SlideType = 'playground'`
- Requires `code` with `____` placeholder, `options[]`, `correctIndex`
- Animated: options fade out → terminal window slides in showing simulated output
- `isInteractive` check in lesson player covers `playground` type too

## Removed
- `app/(tabs)/tools.tsx` — deleted
- AI Tools routes (`/sandbox`, `/coaching`, `/projects`, `/reflection`) still exist as orphaned files

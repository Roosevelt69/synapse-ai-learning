# Synapse — AI Learning App

A mobile learning app built with React Native + Expo. Learn AI concepts through interactive lessons, quizzes, and a daily streak system inspired by Duolingo.

## Stack

- **Expo SDK 54** + **React Native 0.81.5**
- **expo-router v6** — file-based navigation
- **AsyncStorage** — local progress persistence
- **expo-linear-gradient** — gradient UI
- **expo-haptics** — tactile feedback
- **expo-notifications** — daily streak reminders

## Courses

| Course | Lessons | XP |
|---|---|---|
| 🤖 Introduction to AI | 4 | 500 |
| ✍️ Prompt Engineering | 4 | 600 |
| 🤝 AI Agents | 4 | 700 |

Each lesson has 5 slides (intro, concept, interactive MCQ, code example, summary) followed by a 4-question quiz.

## Features

- **XP & Levels** — 10 levels from Novice to Visionary
- **Streak system** — daily activity tracking with at-risk/broken states
- **Sequential lesson unlock** — complete lessons in order per course
- **Haptic feedback** — throughout all interactions
- **Push notifications** — 8pm daily streak reminders

## Running Locally

```bash
npm install --legacy-peer-deps
npx expo start --clear
```

Scan the QR code with [Expo Go](https://expo.dev/go) on iOS or Android.

> **Note:** Do not import `react-native-reanimated` — v4 is incompatible with Expo Go. All animations use React Native's built-in `Animated` API.

## Screens

```
Onboarding → Home (tabs) → Course Detail → Lesson → Quiz → Results
                ↓
            Profile (tabs)
```

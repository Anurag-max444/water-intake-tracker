# 💧 HydroTrack — Premium Water Intake Tracker

> A world-class hydration tracking app built for the 8x Engineer Contest.  
> Dark premium UI · Animated SVG ring · Smart reminders · Streak system

---

## 📱 Screenshots

> *(See submission screenshots for full UI walkthrough)*

---

## ✨ Features

### Core
- **One-tap water logging** — Sip (100ml), Glass (250ml), Bottle (500ml), Custom
- **Animated SVG progress ring** — Smooth fill animation with blue→green gradient
- **Personalized daily goal** — Calculated from weight × 35ml + activity + climate bonus
- **Streak tracker** — Tracks consecutive days of hitting your goal 🔥

### Onboarding (3-step)
- Step 1: Name + Weight input with animated floating label
- Step 2: Activity level selector (Sedentary → Very Active)
- Step 3: Climate selector (Cool / Moderate / Hot) with auto goal preview

### History & Analytics
- **Weekly bar chart** — Animated bars, green when goal met
- **Monthly heatmap** — GitHub-style contribution calendar
- **Stats cards** — Best streak, total consumed, goals hit, weekly average
- **Achievement badges** — First Drop 🥉, 3-Day Streak 🥈, Week Warrior 🥇, Hydration Hero 💎

### Reminders
- Enable/disable smart notifications
- Custom interval (every 1–4 hours)
- Configurable start/end time (default: 8AM–10PM)

### Polish
- 🎉 Celebration popup when goal is reached
- 💥 Haptic feedback on every tap
- 🌊 Ripple + floating particle animations on splash screen
- 📱 Fully responsive — works on Android & Web
- 🌙 Dark premium theme throughout

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| Framework | React Native + Expo SDK 54 |
| Storage | AsyncStorage |
| Animations | Animated API + react-native-svg |
| Notifications | expo-notifications |
| Haptics | expo-haptics |
| UI | expo-linear-gradient, expo-blur |
| Icons | @expo/vector-icons (Ionicons) |

---

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- Expo CLI

### Installation

```bash
# Clone the repo
git clone https://github.com/Ayush-devlop/water-intake-tracker.git
cd water-intake-tracker/WaterTracker

# Install dependencies
npm install

# Start on web
npx expo start --web

# Start on Android
npx expo start --android
```

---

## 📁 Project Structure

```
water-intake-tracker/
├── WaterTracker/
│   ├── App.js              # Complete app (single file, 3500+ lines)
│   ├── assets/
│   │   ├── icon.png
│   │   ├── adaptive-icon.png
│   │   ├── splash-icon.png
│   │   └── favicon.png
│   ├── app.json
│   └── package.json
├── ai-logs/
│   └── claude-conversation-1.md
└── README.md
```

---

## 🏗 Architecture

The app uses a **single-file architecture** with screen-based navigation managed via React state. No external navigation library — pure React Native.

```
App() root
├── SplashScreen       — animated intro (2.5s)
├── OnboardingScreen   — 3-step profile setup
├── HomeScreen         — main dashboard
├── HistoryScreen      — charts + heatmap
├── RemindersScreen    — notification settings
└── SettingsScreen     — profile management
```

---

## 🤖 AI Development Process

This app was built using **Claude AI** as the primary development tool.

The AI assisted with:
- Architecture planning and component design
- Animated SVG progress ring implementation
- Complex multi-step onboarding flow
- Weekly bar chart and monthly heatmap logic
- Streak calculation algorithm
- Premium dark UI design system

Full AI conversation logs are available in `/ai-logs/`.

---

## 🏆 Contest Submission

**Challenge:** Build a Water Intake Tracker — Daily Hydration App  
**Platform:** 8x Engineer  
**Deadline:** May 13, 2026  

---

## 📝 Reflection

### What was easy
- Setting up Expo and the base project structure
- AsyncStorage integration for data persistence
- Designing the dark premium color system

### What was challenging
- Animated SVG progress ring with gradient — required careful Animated API usage
- Monthly heatmap calendar — complex date calculation logic
- Multi-step onboarding with smooth transitions
- Keeping the single App.js clean and organized at 3500+ lines

### What I'd change
- Split into multiple component files for better maintainability
- Add actual audio files for sound effects (currently haptics-only)
- Implement backend sync for cross-device data

---

## 👨‍💻 Developer

**Ayush** — [@Anurag-max444](https://github.com/Anurag-max444)

---

*Built with 💧 and Claude AI*

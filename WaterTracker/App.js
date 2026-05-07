// ============================================================
// HYDROTRACK — Complete App.js
// Premium Water Intake Tracker | React Native + Expo SDK 54
// ============================================================

// ─── React Core ──────────────────────────────────────────────
import React, {
  useState, useEffect, useRef, useCallback, useMemo,
} from 'react';

// ─── React Native ────────────────────────────────────────────
import {
  View, Text, StyleSheet, TouchableOpacity, ScrollView,
  TextInput, Modal, StatusBar, SafeAreaView, Platform,
  Dimensions, Animated, Easing, UIManager,
  KeyboardAvoidingView, ActivityIndicator, Alert, Switch,
  RefreshControl, Clipboard,
} from 'react-native';

// ─── Expo SDK ────────────────────────────────────────────────
import { LinearGradient }    from 'expo-linear-gradient';
import { BlurView }          from 'expo-blur';
import * as Haptics          from 'expo-haptics';
import { Ionicons }          from '@expo/vector-icons';
import AsyncStorage          from '@react-native-async-storage/async-storage';
import * as Notifications    from 'expo-notifications';
import { Audio }             from 'expo-av';
import { SafeAreaProvider, useSafeAreaInsets } from 'react-native-safe-area-context';

// ─── SVG ─────────────────────────────────────────────────────
import Svg, {
  Circle, Defs,
  LinearGradient as SvgLinearGradient,
  Stop, Path, RadialGradient, ClipPath,
} from 'react-native-svg';

// ============================================================
// NOTIFICATION HANDLER
// ============================================================
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge:  false,
  }),
});

// ============================================================
// DESIGN TOKENS
// ============================================================
const COLORS = {
  bg:            '#0a0a0f',
  bgDeep:        '#060609',
  card:          '#12121a',
  cardHover:     '#1a1a26',
  cardBorder:    '#1e1e3a',
  blue:          '#4f8ef7',
  blueDim:       '#2a4d99',
  blueGlow:      'rgba(79,142,247,0.25)',
  blueGlowSoft:  'rgba(79,142,247,0.10)',
  green:         '#00e676',
  greenDim:      '#00703a',
  greenGlow:     'rgba(0,230,118,0.25)',
  orange:        '#ff9800',
  orangeDim:     '#7a4800',
  cyan:          '#00d4ff',
  red:           '#ff4757',
  purple:        '#8b5cf6',
  text:          '#ffffff',
  textSoft:      '#ccccdd',
  subtext:       '#8888aa',
  subtextDim:    '#555577',
  placeholder:   '#444466',
  white:         '#ffffff',
  black:         '#000000',
  transparent:   'transparent',
  overlay:       'rgba(0,0,0,0.6)',
};

const SPACING = {
  xs: 4, sm: 8, md: 16, lg: 24, xl: 32, xxl: 48,
};

const RADIUS = {
  sm: 8, md: 14, lg: 20, xl: 28, round: 999,
};

const SHADOWS = {
  blue: {
    shadowColor: '#4f8ef7',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.45,
    shadowRadius: 16,
    elevation: 12,
  },
  green: {
    shadowColor: '#00e676',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 12,
    elevation: 8,
  },
  card: {
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.5,
    shadowRadius: 20,
    elevation: 16,
  },
};

const TYPOGRAPHY = {
  displayMD: { fontSize: 28, fontWeight: '700', letterSpacing: -0.5 },
  h1:        { fontSize: 24, fontWeight: '700', letterSpacing: -0.3 },
  h2:        { fontSize: 20, fontWeight: '600', letterSpacing: -0.2 },
  h3:        { fontSize: 17, fontWeight: '600' },
  bodyLG:    { fontSize: 16, fontWeight: '400', lineHeight: 24 },
  body:      { fontSize: 14, fontWeight: '400', lineHeight: 21 },
  label:     { fontSize: 12, fontWeight: '600', letterSpacing: 0.8, textTransform: 'uppercase' },
  labelSM:   { fontSize: 11, fontWeight: '600', letterSpacing: 0.6, textTransform: 'uppercase' },
  caption:   { fontSize: 11, fontWeight: '400', lineHeight: 15 },
};

const { width: SW, height: SH } = Dimensions.get('window');
const DEVICE = {
  width:     SW,
  height:    SH,
  isIOS:     Platform.OS === 'ios',
  isAndroid: Platform.OS === 'android',
  isWeb:     Platform.OS === 'web',
};

if (DEVICE.isAndroid && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ============================================================
// APP CONSTANTS
// ============================================================
const APP_CONFIG = {
  name:        'HydroTrack',
  version:     '1.0.0',
  defaultGoal: 2500,
  minGoal:     1000,
  maxGoal:     6000,
};

const STORAGE_KEYS = {
  USER_PROFILE:   '@hydrotrack:user_profile',
  DAILY_LOGS:     '@hydrotrack:daily_logs',
  REMINDER_PREFS: '@hydrotrack:reminder_prefs',
  STREAK_DATA:    '@hydrotrack:streak_data',
  ONBOARDED:      '@hydrotrack:onboarded',
};

const SCREENS = {
  SPLASH:     'Splash',
  ONBOARDING: 'Onboarding',
  HOME:       'Home',
  HISTORY:    'History',
  REMINDERS:  'Reminders',
  SETTINGS:   'Settings',
};

const PRESET_AMOUNTS = [
  { label: 'Sip',    ml: 100 },
  { label: 'Glass',  ml: 250 },
  { label: 'Bottle', ml: 500 },
  { label: 'Custom', ml: 0   },
];

const ONBOARD_ACTIVITIES = [
  { id: 'sedentary', emoji: '🛋️', label: 'Sedentary',      desc: 'Desk job, little exercise',    bonus: 0   },
  { id: 'light',     emoji: '🚶', label: 'Lightly Active', desc: 'Light walks, yoga',             bonus: 200 },
  { id: 'active',    emoji: '🏃', label: 'Active',         desc: 'Gym 3–5x per week',             bonus: 400 },
  { id: 'very',      emoji: '💪', label: 'Very Active',    desc: 'Intense daily training',        bonus: 600 },
];

const ONBOARD_CLIMATES = [
  { id: 'cool',     emoji: '❄️', label: 'Cool',     temp: 'Below 18°C', bonus: 0,   color: '#00d4ff' },
  { id: 'moderate', emoji: '🌤️', label: 'Moderate', temp: '18°C–28°C',  bonus: 150, color: '#4f8ef7' },
  { id: 'hot',      emoji: '🌞', label: 'Hot',      temp: 'Above 28°C', bonus: 300, color: '#ff9800' },
];
// ============================================================
// BADGE DEFINITIONS
// ============================================================
const BADGE_DEFS = [
  {
    id: 'first_drop', emoji: '🥉', name: 'First Drop',
    desc: 'Logged your very first drink',
    color: '#cd7f32', bgTop: '#1a1208', bgBot: '#100d06',
    check: (s) => s.totalLogs >= 1,
  },
  {
    id: 'streak_3', emoji: '🥈', name: '3-Day Streak',
    desc: '3 consecutive hydrated days',
    color: '#c0c0c0', bgTop: '#161616', bgBot: '#0e0e0e',
    check: (s) => s.bestStreak >= 3,
  },
  {
    id: 'week_warrior', emoji: '🥇', name: 'Week Warrior',
    desc: 'Hit your goal 7 days running',
    color: '#ffd700', bgTop: '#1a1600', bgBot: '#100e00',
    check: (s) => s.bestStreak >= 7,
  },
  {
    id: 'hydration_hero', emoji: '💎', name: 'Hydration Hero',
    desc: '30-day streak champion',
    color: '#00d4ff', bgTop: '#001a22', bgBot: '#001018',
    check: (s) => s.bestStreak >= 30,
  },
];

// ============================================================
// UTILITIES
// ============================================================
const getTodayKey = () => new Date().toISOString().split('T')[0];

const formatML = (ml) =>
  ml >= 1000
    ? `${(ml / 1000).toFixed(ml % 1000 === 0 ? 0 : 1)}L`
    : `${ml}ml`;

const getProgressPercent = (current, goal) =>
  Math.min(Math.round((current / goal) * 100), 100);

const getHydrationStatus = (percent) => {
  if (percent < 25)  return { label: 'Critical',       color: '#ff4757', emoji: '🚨' };
  if (percent < 50)  return { label: 'Low',            color: '#ff9800', emoji: '⚠️'  };
  if (percent < 75)  return { label: 'Getting There',  color: '#4f8ef7', emoji: '💧' };
  if (percent < 100) return { label: 'Almost There',   color: '#00d4ff', emoji: '💦' };
  return               { label: 'Goal Met!',    color: '#00e676', emoji: '🎉' };
};

const getLastNDays = (n) => {
  const days = [];
  for (let i = n - 1; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    days.push(d.toISOString().split('T')[0]);
  }
  return days;
};

const getDaysInCurrentMonth = () => {
  const now   = new Date();
  const count = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
  const days  = [];
  for (let d = 1; d <= count; d++) {
    days.push(
      new Date(now.getFullYear(), now.getMonth(), d)
        .toISOString().split('T')[0]
    );
  }
  return days;
};

const getMonthStartWeekday = () => {
  const now = new Date();
  return new Date(now.getFullYear(), now.getMonth(), 1).getDay();
};

const heatmapColor = (percent) => {
  if (!percent || percent === 0) return '#1e1e3a';
  if (percent < 50)              return '#1a3a7a';
  if (percent < 100)             return '#4f8ef7';
  return '#00e676';
};

const calcStreak = (logData, goal) => {
  let streak = 0;
  const days = getLastNDays(90);
  for (let i = days.length - 1; i >= 0; i--) {
    const dayTotal = logData[days[i]]?.total ?? 0;
    if (dayTotal >= goal) {
      streak++;
    } else if (days[i] < getTodayKey()) {
      break;
    }
  }
  return streak;
};

// ============================================================
// SOUND ENGINE  (haptics-first; audio asset path optional)
// ============================================================
const SoundEngine = {
  async init() {
    try {
      await Audio.setAudioModeAsync({
        playsInSilentModeIOS:   true,
        staysActiveInBackground: false,
      });
    } catch (_) {}
  },
  async play(type) {
    try {
      switch (type) {
        case 'drop':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium);
          break;
        case 'goal':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Heavy);
          break;
        case 'streak':
          await Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
          break;
        case 'milestone':
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
          break;
        default:
          await Haptics.selectionAsync();
      }
    } catch (_) {}
  },
};
// ============================================================
// PRESS-SCALE WRAPPER  (universal 0.95 scale on every press)
// ============================================================
const PressScale = ({
  children, onPress, style, disabled = false, scaleVal = 0.95,
}) => {
  const scale = useRef(new Animated.Value(1)).current;

  const handlePress = () => {
    Animated.sequence([
      Animated.timing(scale, {
        toValue: scaleVal, duration: 80, useNativeDriver: true,
      }),
      Animated.spring(scale, {
        toValue: 1, tension: 100, friction: 6, useNativeDriver: true,
      }),
    ]).start();
    if (onPress) onPress();
  };

  return (
    <Animated.View
      style={[style, { transform: [{ scale }], opacity: disabled ? 0.45 : 1 }]}
    >
      <TouchableOpacity
        onPress={disabled ? undefined : handlePress}
        activeOpacity={1}
      >
        {children}
      </TouchableOpacity>
    </Animated.View>
  );
};

// ============================================================
// TAB BAR
// ============================================================
const TabBar = ({ activeScreen, onNavigate }) => {
  const insets = useSafeAreaInsets();
  const tabs = [
    { screen: SCREENS.HOME,      icon: 'water',         iconOut: 'water-outline',         label: 'Home'      },
    { screen: SCREENS.HISTORY,   icon: 'bar-chart',     iconOut: 'bar-chart-outline',     label: 'History'   },
    { screen: SCREENS.REMINDERS, icon: 'notifications', iconOut: 'notifications-outline', label: 'Reminders' },
    { screen: SCREENS.SETTINGS,  icon: 'settings',      iconOut: 'settings-outline',      label: 'Settings'  },
  ];

  return (
    <View style={[tabSt.bar, { paddingBottom: insets.bottom || (DEVICE.isIOS ? 14 : 4) }]}>
      <BlurView intensity={60} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={tabSt.inner}>
        {tabs.map((tab) => {
          const active = activeScreen === tab.screen;
          return (
            <PressScale
              key={tab.screen}
              onPress={() => onNavigate(tab.screen)}
              style={{ flex: 1 }}
            >
              <View style={tabSt.item}>
                <View style={[tabSt.iconWrap, active && tabSt.iconActive]}>
                  {active && (
                    <LinearGradient
                      colors={['rgba(79,142,247,0.2)', 'rgba(79,142,247,0.07)']}
                      style={StyleSheet.absoluteFill}
                      borderRadius={12}
                    />
                  )}
                  <Ionicons
                    name={active ? tab.icon : tab.iconOut}
                    size={22}
                    color={active ? COLORS.blue : COLORS.subtextDim}
                  />
                </View>
                <Text style={[tabSt.label, active && { color: COLORS.blue }]}>
                  {tab.label}
                </Text>
              </View>
            </PressScale>
          );
        })}
      </View>
    </View>
  );
};

const tabSt = StyleSheet.create({
  bar: {
    position: 'absolute', bottom: 0, left: 0, right: 0,
    borderTopWidth: 1, borderTopColor: COLORS.cardBorder,
    overflow: 'hidden',
  },
  inner: {
    flexDirection: 'row', paddingTop: SPACING.xs,
  },
  item: {
    alignItems: 'center', gap: 3,
  },
  iconWrap: {
    width: 44, height: 36, borderRadius: 12,
    alignItems: 'center', justifyContent: 'center',
  },
  iconActive: {
    borderWidth: 1, borderColor: 'rgba(79,142,247,0.3)',
  },
  label: {
    fontSize: 10, fontWeight: '600',
    color: COLORS.subtextDim, letterSpacing: 0.2,
  },
});

// ============================================================
// MILESTONE BOTTOM SHEET
// ============================================================
const MilestoneSheet = ({ milestone, onDismiss }) => {
  const slideY  = useRef(new Animated.Value(200)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (!milestone) return;

    Animated.parallel([
      Animated.spring(slideY, {
        toValue: 0, tension: 60, friction: 9, useNativeDriver: true,
      }),
      Animated.timing(opacity, {
        toValue: 1, duration: 300, useNativeDriver: true,
      }),
    ]).start();

    const t = setTimeout(() => {
      Animated.parallel([
        Animated.timing(slideY,  { toValue: 200, duration: 300, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 0,   duration: 300, useNativeDriver: true }),
      ]).start(() => onDismiss());
    }, 2200);

    return () => clearTimeout(t);
  }, [milestone]);

  if (!milestone) return null;

  return (
    <Animated.View
      pointerEvents="none"
      style={[msSt.sheet, { transform: [{ translateY: slideY }], opacity }]}
    >
      <LinearGradient colors={[COLORS.card, '#0d0d1a']} style={msSt.grad}>
        <View style={msSt.handle} />
        <Text style={msSt.emoji}>{milestone.emoji}</Text>
        <Text style={msSt.title}>{milestone.title}</Text>
        <Text style={msSt.sub}>{milestone.sub}</Text>
      </LinearGradient>
    </Animated.View>
  );
};

const msSt = StyleSheet.create({
  sheet: {
    position: 'absolute',
    bottom: 90,
    left: SPACING.md,
    right: SPACING.md,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: 'rgba(79,142,247,0.4)',
    ...SHADOWS.blue,
  },
  grad: {
    padding: SPACING.lg, alignItems: 'center', gap: SPACING.xs,
  },
  handle: {
    width: 36, height: 4, borderRadius: 2,
    backgroundColor: COLORS.cardBorder, marginBottom: SPACING.sm,
  },
  emoji: { fontSize: 40 },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, textAlign: 'center' },
  sub:   { ...TYPOGRAPHY.body, color: COLORS.subtext, textAlign: 'center' },
});

// ============================================================
// CONFETTI PARTICLE
// ============================================================
const ConfettiParticle = ({ index }) => {
  const y   = useRef(new Animated.Value(-20)).current;
  const x   = useRef(new Animated.Value(0)).current;
  const op  = useRef(new Animated.Value(1)).current;
  const rot = useRef(new Animated.Value(0)).current;
  const sc  = useRef(new Animated.Value(0)).current;

  const colors = [
    COLORS.blue, COLORS.green, COLORS.orange,
    COLORS.cyan, COLORS.purple, '#ff4757', '#ffd700',
  ];
  const xDir  = (index % 2 === 0 ? 1 : -1) * (30 + (index % 5) * 22);
  const delay = (index % 8) * 55;

  useEffect(() => {
    Animated.sequence([
      Animated.delay(delay),
      Animated.parallel([
        Animated.timing(sc,  { toValue: 1, duration: 200, useNativeDriver: true }),
        Animated.timing(y,   { toValue: 160 + (index % 5) * 30, duration: 900, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        Animated.timing(x,   { toValue: xDir, duration: 900, easing: Easing.out(Easing.sin), useNativeDriver: true }),
        Animated.timing(rot, { toValue: 6, duration: 900, useNativeDriver: true }),
        Animated.sequence([
          Animated.delay(500),
          Animated.timing(op, { toValue: 0, duration: 400, useNativeDriver: true }),
        ]),
      ]),
    ]).start();
  }, []);

  const spin = rot.interpolate({
    inputRange: [0, 6], outputRange: ['0deg', '720deg'],
  });
  const shapes = ['■', '●', '▲', '◆', '★'];

  return (
    <Animated.Text style={{
      position: 'absolute',
      fontSize: 10 + (index % 4) * 4,
      color: colors[index % colors.length],
      transform: [{ translateY: y }, { translateX: x }, { rotate: spin }, { scale: sc }],
      opacity: op,
      zIndex: 999,
    }}>
      {shapes[index % shapes.length]}
    </Animated.Text>
  );
};

// ============================================================
// GOAL CELEBRATION MODAL  (full-screen blur, auto-close 4s)
// ============================================================
const GoalCelebrationModal = ({ visible, streak, onClose }) => {
  const sc     = useRef(new Animated.Value(0.5)).current;
  const op     = useRef(new Animated.Value(0)).current;
  const bounce = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (!visible) { sc.setValue(0.5); op.setValue(0); return; }

    Animated.parallel([
      Animated.spring(sc, { toValue: 1, tension: 80, friction: 6, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();

    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: 1.15, duration: 400, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 1,    duration: 400, useNativeDriver: true }),
      ])
    ).start();

    const t = setTimeout(() => onClose(), 4000);
    return () => clearTimeout(t);
  }, [visible]);

  if (!visible) return null;

  const handleShare = async () => {
    try {
      const txt = `🏆 I just crushed my daily hydration goal on HydroTrack! ${streak} day streak and counting! 💧 #HydroTrack #StayHydrated`;
      Clipboard.setString(txt);
      Alert.alert('Copied! 📋', 'Achievement text copied to clipboard — share it anywhere!');
    } catch (_) {}
  };

  return (
    <Modal transparent animationType="none" visible={visible}>
      <Animated.View style={[celSt.overlay, { opacity: op }]}>
        <BlurView intensity={40} tint="dark" style={StyleSheet.absoluteFill} />

        {/* confetti */}
        <View style={celSt.confettiWrap}>
          {Array.from({ length: 20 }).map((_, i) => (
            <ConfettiParticle key={i} index={i} />
          ))}
        </View>

        {/* card */}
        <Animated.View style={[celSt.card, { transform: [{ scale: sc }] }]}>
          <LinearGradient
            colors={['#1a2a1a', '#121a12', '#12121a']}
            style={celSt.cardGrad}
          >
            <Animated.Text style={[celSt.trophy, { transform: [{ scale: bounce }] }]}>
              🏆
            </Animated.Text>
            <Text style={celSt.title}>GOAL CRUSHED!</Text>
            <Text style={celSt.sub}>You're a hydration hero today</Text>

            {streak > 0 && (
              <View style={celSt.streakRow}>
                <Text style={{ fontSize: 18 }}>🔥</Text>
                <Text style={celSt.streakTxt}>{streak} Day Streak!</Text>
              </View>
            )}

            <LinearGradient
              colors={[COLORS.green, '#00a152']}
              style={celSt.badge}
            >
              <Text style={celSt.badgeTxt}>100% COMPLETE</Text>
            </LinearGradient>

            <PressScale onPress={handleShare} style={celSt.shareBtn}>
              <LinearGradient
                colors={[COLORS.blue, COLORS.blueDim]}
                style={celSt.shareBtnGrad}
              >
                <Ionicons name="share-outline" size={16} color={COLORS.white} />
                <Text style={celSt.shareTxt}>Share Achievement</Text>
              </LinearGradient>
            </PressScale>

            <PressScale onPress={onClose}>
              <Text style={celSt.dismiss}>Keep Hydrating 💧</Text>
            </PressScale>
            <Text style={celSt.autoClose}>Auto-closes in 4 seconds</Text>
          </LinearGradient>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
};

const celSt = StyleSheet.create({
  overlay: {
    flex: 1, alignItems: 'center', justifyContent: 'center',
  },
  confettiWrap: {
    position: 'absolute', top: '30%',
    alignItems: 'center', width: '100%',
  },
  card: {
    width: DEVICE.width - 60,
    borderRadius: RADIUS.xl,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: 'rgba(0,230,118,0.4)',
    ...SHADOWS.green,
  },
  cardGrad: {
    padding: SPACING.xl, alignItems: 'center', gap: SPACING.sm,
  },
  trophy:   { fontSize: 56, marginBottom: SPACING.xs },
  title:    { ...TYPOGRAPHY.displayMD, color: COLORS.green, letterSpacing: 1 },
  sub:      { ...TYPOGRAPHY.body, color: COLORS.subtext, textAlign: 'center' },
  streakRow: {
    flexDirection: 'row', alignItems: 'center', gap: SPACING.xs,
    backgroundColor: 'rgba(255,152,0,0.15)',
    paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs,
    borderRadius: RADIUS.round,
    borderWidth: 1, borderColor: 'rgba(255,152,0,0.3)',
  },
  streakTxt: { ...TYPOGRAPHY.body, fontWeight: '700', color: COLORS.orange },
  badge: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm,
    borderRadius: RADIUS.round,
  },
  badgeTxt:  { ...TYPOGRAPHY.label, color: COLORS.white, letterSpacing: 1.5 },
  shareBtn:  { width: '100%', borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.xs },
  shareBtnGrad: {
    flexDirection: 'row', alignItems: 'center', justifyContent: 'center',
    paddingVertical: SPACING.sm + 2, gap: SPACING.xs,
  },
  shareTxt:  { ...TYPOGRAPHY.body, fontWeight: '700', color: COLORS.white },
  dismiss:   { ...TYPOGRAPHY.body, color: COLORS.subtext, marginTop: SPACING.xs },
  autoClose: { ...TYPOGRAPHY.caption, color: COLORS.subtextDim, marginTop: 2 },
});

// ============================================================
// SKELETON LOADER
// ============================================================
const SkeletonBox = ({ width, height, style }) => {
  const shimmer = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(shimmer, { toValue: 1, duration: 900,  useNativeDriver: false }),
        Animated.timing(shimmer, { toValue: 0, duration: 900,  useNativeDriver: false }),
      ])
    ).start();
  }, []);

  const bg = shimmer.interpolate({
    inputRange:  [0, 1],
    outputRange: [COLORS.card, COLORS.cardHover],
  });

  return (
    <Animated.View
      style={[{ width, height, borderRadius: RADIUS.md, backgroundColor: bg }, style]}
    />
  );
};

const HistorySkeleton = () => (
  <View style={{ padding: SPACING.md, gap: SPACING.md }}>
    <SkeletonBox width="55%" height={28} />
    <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
      <SkeletonBox width="48%" height={100} />
      <SkeletonBox width="48%" height={100} />
    </View>
    <SkeletonBox width="100%" height={210} />
    <SkeletonBox width="100%" height={170} />
    <View style={{ flexDirection: 'row', gap: SPACING.sm }}>
      <SkeletonBox width="48%" height={170} />
      <SkeletonBox width="48%" height={170} />
    </View>
  </View>
);

// ============================================================
// EMPTY STATE
// ============================================================
const EmptyState = ({ emoji, title, sub, action, onAction }) => (
  <View style={emptySt.wrap}>
    <Text style={emptySt.emoji}>{emoji}</Text>
    <Text style={emptySt.title}>{title}</Text>
    <Text style={emptySt.sub}>{sub}</Text>
    {action && (
      <PressScale onPress={onAction} style={emptySt.btn}>
        <LinearGradient
          colors={[COLORS.blue, COLORS.blueDim]}
          style={emptySt.btnGrad}
        >
          <Text style={emptySt.btnTxt}>{action}</Text>
        </LinearGradient>
      </PressScale>
    )}
  </View>
);

const emptySt = StyleSheet.create({
  wrap: {
    alignItems: 'center', justifyContent: 'center',
    padding: SPACING.xxl, gap: SPACING.sm,
  },
  emoji: { fontSize: 52, marginBottom: SPACING.sm },
  title: { ...TYPOGRAPHY.h2, color: COLORS.text, textAlign: 'center' },
  sub:   { ...TYPOGRAPHY.body, color: COLORS.subtext, textAlign: 'center', lineHeight: 20 },
  btn:   { marginTop: SPACING.md, borderRadius: RADIUS.md, overflow: 'hidden' },
  btnGrad: {
    paddingHorizontal: SPACING.lg, paddingVertical: SPACING.sm + 2,
  },
  btnTxt: { ...TYPOGRAPHY.body, fontWeight: '700', color: COLORS.white },
});
// ============================================================
// RIPPLE RING  (reusable — used in Splash)
// ============================================================
const RippleRing = ({ delay = 0, size = 120, color = '#4f8ef7' }) => {
  const scale   = useRef(new Animated.Value(0.4)).current;
  const opacity = useRef(new Animated.Value(0.7)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 2.2, duration: 2000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0,   duration: 2000, easing: Easing.out(Easing.quad), useNativeDriver: true }),
        ]),
        Animated.parallel([
          Animated.timing(scale,   { toValue: 0.4, duration: 0, useNativeDriver: true }),
          Animated.timing(opacity, { toValue: 0.7, duration: 0, useNativeDriver: true }),
        ]),
      ])
    ).start();
  }, []);

  return (
    <Animated.View
      pointerEvents="none"
      style={{
        position: 'absolute',
        width: size, height: size,
        borderRadius: size / 2,
        borderWidth: 1.5, borderColor: color,
        transform: [{ scale }], opacity,
      }}
    />
  );
};

// ============================================================
// FLOATING PARTICLE  (reusable — used in Splash)
// ============================================================
const FloatingParticle = ({ index }) => {
  const y       = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const xOff    = useMemo(() => -60 + (index % 7) * 30, [index]);
  const size    = useMemo(() => 3 + (index % 4), [index]);
  const delay   = useMemo(() => index * 280, [index]);
  const dur     = useMemo(() => 2800 + (index % 5) * 400, [index]);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.delay(delay),
        Animated.parallel([
          Animated.timing(opacity, {
            toValue: 0.5 + (index % 3) * 0.15,
            duration: 400, useNativeDriver: true,
          }),
          Animated.timing(y, {
            toValue: -120 - (index % 4) * 30,
            duration: dur,
            easing: Easing.out(Easing.sin),
            useNativeDriver: true,
          }),
        ]),
        Animated.timing(opacity, { toValue: 0, duration: 400, useNativeDriver: true }),
        Animated.timing(y,       { toValue: 0, duration: 0,   useNativeDriver: true }),
      ])
    ).start();
  }, []);

  return (
    <Animated.View style={{
      position: 'absolute',
      left: DEVICE.width / 2 + xOff,
      top:  DEVICE.height / 2 + 10,
      width: size, height: size,
      borderRadius: size / 2,
      backgroundColor: COLORS.blue,
      opacity,
      transform: [{ translateY: y }],
    }} />
  );
};

// ============================================================
// SPLASH SCREEN
// ============================================================
const SplashScreen = ({ onFinish }) => {
  const dropletSc    = useRef(new Animated.Value(0)).current;
  const dropletOp    = useRef(new Animated.Value(0)).current;
  const dropletRot   = useRef(new Animated.Value(-15)).current;
  const glowSc       = useRef(new Animated.Value(0.3)).current;
  const glowOp       = useRef(new Animated.Value(0)).current;
  const titleOp      = useRef(new Animated.Value(0)).current;
  const titleSpacing = useRef(new Animated.Value(20)).current;
  const titleY       = useRef(new Animated.Value(12)).current;
  const subtitleOp   = useRef(new Animated.Value(0)).current;
  const subtitleY    = useRef(new Animated.Value(10)).current;
  const taglineOp    = useRef(new Animated.Value(0)).current;
  const barSc        = useRef(new Animated.Value(0)).current;
  const barOp        = useRef(new Animated.Value(0)).current;
  const screenFade   = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.sequence([
      // 1 — glow blooms
      Animated.parallel([
        Animated.timing(glowOp, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.spring(glowSc, { toValue: 1, tension: 40, friction: 8, useNativeDriver: true }),
      ]),
      // 2 — droplet springs in with tilt
      Animated.parallel([
        Animated.spring(dropletSc, { toValue: 1, tension: 55, friction: 6, useNativeDriver: true }),
        Animated.timing(dropletOp, { toValue: 1, duration: 300, useNativeDriver: true }),
        Animated.timing(dropletRot, {
          toValue: 0, duration: 600,
          easing: Easing.out(Easing.back(1.5)),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(120),
      // 3 — title letter-spacing sweep
      Animated.parallel([
        Animated.timing(titleOp, {
          toValue: 1, duration: 500, useNativeDriver: false,
        }),
        Animated.timing(titleSpacing, {
          toValue: 4, duration: 600,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
        Animated.timing(titleY, {
          toValue: 0, duration: 500,
          easing: Easing.out(Easing.cubic),
          useNativeDriver: false,
        }),
      ]),
      Animated.delay(100),
      // 4 — subtitle
      Animated.parallel([
        Animated.timing(subtitleOp, { toValue: 1, duration: 400, useNativeDriver: true }),
        Animated.timing(subtitleY,  { toValue: 0, duration: 400, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.delay(80),
      // 5 — tagline + accent bar
      Animated.parallel([
        Animated.timing(taglineOp, { toValue: 1, duration: 350, useNativeDriver: true }),
        Animated.timing(barSc, {
          toValue: 1, duration: 500,
          easing: Easing.out(Easing.back(1.2)),
          useNativeDriver: true,
        }),
        Animated.timing(barOp, { toValue: 1, duration: 350, useNativeDriver: true }),
      ]),
      Animated.delay(900),
      // 6 — fade out
      Animated.timing(screenFade, {
        toValue: 0, duration: 450,
        easing: Easing.in(Easing.quad),
        useNativeDriver: true,
      }),
    ]).start(() => onFinish());
  }, []);

  const dropletSpin = dropletRot.interpolate({
    inputRange:  [-15, 0],
    outputRange: ['-15deg', '0deg'],
  });

  return (
    <Animated.View style={[splSt.container, { opacity: screenFade }]}>
      <LinearGradient
        colors={['#060614', '#0a0a0f', '#060614']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }} end={{ x: 0.5, y: 1 }}
      />

      {Array.from({ length: 10 }).map((_, i) => (
        <FloatingParticle key={i} index={i} />
      ))}

      <View style={splSt.center}>
        {/* Blue glow blob */}
        <Animated.View style={[splSt.glow, { transform: [{ scale: glowSc }], opacity: glowOp }]}>
          <LinearGradient
            colors={['rgba(79,142,247,0.38)', 'rgba(79,142,247,0.08)', 'transparent']}
            style={{ flex: 1, borderRadius: 140 }}
          />
        </Animated.View>

        <RippleRing delay={0}    size={110} color={COLORS.blue} />
        <RippleRing delay={700}  size={110} color={COLORS.blue} />
        <RippleRing delay={1400} size={110} color={COLORS.cyan} />

        {/* Droplet */}
        <Animated.View style={[splSt.dropletWrap, {
          transform: [{ scale: dropletSc }, { rotate: dropletSpin }],
          opacity: dropletOp,
        }]}>
          <LinearGradient
            colors={['rgba(79,142,247,0.8)', 'rgba(42,77,153,0.8)']}
            style={splSt.dropletBg}
          >
            <Text style={splSt.dropletEmoji}>💧</Text>
          </LinearGradient>
        </Animated.View>

        {/* Title */}
        <Animated.Text style={[splSt.title, {
          opacity: titleOp,
          letterSpacing: titleSpacing,
          transform: [{ translateY: titleY }],
        }]}>
          HydroTrack
        </Animated.Text>

        {/* Accent bar */}
        <Animated.View style={[splSt.barWrap, { opacity: barOp, transform: [{ scaleX: barSc }] }]}>
          <LinearGradient
            colors={['transparent', COLORS.blue, COLORS.cyan, COLORS.blue, 'transparent']}
            style={{ flex: 1 }}
            start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
          />
        </Animated.View>

        {/* Subtitle */}
        <Animated.Text style={[splSt.subtitle, {
          opacity: subtitleOp,
          transform: [{ translateY: subtitleY }],
        }]}>
          PREMIUM HYDRATION
        </Animated.Text>

        {/* Tagline */}
        <Animated.Text style={[splSt.tagline, { opacity: taglineOp }]}>
          Your body. Your goals. Your water.
        </Animated.Text>
      </View>

      <Animated.Text style={[splSt.version, { opacity: taglineOp }]}>
        v{APP_CONFIG.version}
      </Animated.Text>
    </Animated.View>
  );
};

const splSt = StyleSheet.create({
  container: {
    flex: 1, backgroundColor: COLORS.bg,
    alignItems: 'center', justifyContent: 'center',
  },
  center: { alignItems: 'center' },
  glow: {
    position: 'absolute',
    width: 280, height: 280, borderRadius: 140,
    overflow: 'hidden',
  },
  dropletWrap: { marginBottom: SPACING.lg },
  dropletBg: {
    width: 96, height: 96, borderRadius: 48,
    alignItems: 'center', justifyContent: 'center',
    ...SHADOWS.blue,
  },
  dropletEmoji: { fontSize: 48 },
  title: {
    fontSize: 38, fontWeight: '800', color: COLORS.text,
    textAlign: 'center',
  },
  barWrap: {
    marginVertical: SPACING.sm,
    width: 160, height: 2, borderRadius: 1, overflow: 'hidden',
  },
  subtitle: {
    ...TYPOGRAPHY.label, fontSize: 13,
    color: COLORS.blue, letterSpacing: 5,
    textAlign: 'center', marginBottom: SPACING.sm,
  },
  tagline: {
    ...TYPOGRAPHY.caption, color: COLORS.subtext,
    letterSpacing: 0.5, textAlign: 'center', marginTop: SPACING.xs,
  },
  version: {
    position: 'absolute', bottom: 36,
    ...TYPOGRAPHY.caption, color: COLORS.subtextDim, letterSpacing: 1,
  },
});
// ============================================================
// ONBOARDING — PROGRESS DOTS
// ============================================================
const ProgressDots = ({ step, total = 3 }) => (
  <View style={obSt.dotsRow}>
    {Array.from({ length: total }).map((_, i) => {
      const isActive = i === step;
      const isDone   = i < step;
      return (
        <View
          key={i}
          style={[obSt.dot, isActive && obSt.dotActive, isDone && obSt.dotDone]}
        >
          {(isActive || isDone) && (
            <LinearGradient
              colors={isDone
                ? [COLORS.green, '#00a152']
                : [COLORS.blue, COLORS.cyan]}
              style={StyleSheet.absoluteFill}
              borderRadius={6}
            />
          )}
          {isDone && (
            <Ionicons name="checkmark" size={9} color={COLORS.white} />
          )}
        </View>
      );
    })}
  </View>
);

// ============================================================
// ONBOARDING — ANIMATED FLOATING-LABEL INPUT
// ============================================================
const AnimatedInput = ({
  value, onChangeText, placeholder, suffix, keyboardType = 'default',
}) => {
  const borderAnim = useRef(new Animated.Value(0)).current;
  const labelAnim  = useRef(new Animated.Value(value ? 1 : 0)).current;
  const [focused, setFocused] = useState(false);

  const handleFocus = () => {
    setFocused(true);
    Animated.parallel([
      Animated.timing(borderAnim, { toValue: 1, duration: 250, useNativeDriver: false }),
      Animated.timing(labelAnim,  { toValue: 1, duration: 200, useNativeDriver: false }),
    ]).start();
  };

  const handleBlur = () => {
    setFocused(false);
    Animated.timing(borderAnim, { toValue: 0, duration: 250, useNativeDriver: false }).start();
    if (!value) {
      Animated.timing(labelAnim, { toValue: 0, duration: 200, useNativeDriver: false }).start();
    }
  };

  const borderColor = borderAnim.interpolate({
    inputRange: [0, 1], outputRange: [COLORS.cardBorder, COLORS.blue],
  });
  const labelTop = labelAnim.interpolate({
    inputRange: [0, 1], outputRange: [16, -9],
  });
  const labelFontSize = labelAnim.interpolate({
    inputRange: [0, 1], outputRange: [15, 11],
  });
  const labelColor = labelAnim.interpolate({
    inputRange: [0, 1], outputRange: [COLORS.placeholder, COLORS.blue],
  });

  return (
    <Animated.View style={[obSt.inputWrap, { borderColor }]}>
      <Animated.Text style={[obSt.floatLabel, {
        top: labelTop, fontSize: labelFontSize, color: labelColor,
      }]}>
        {placeholder}
      </Animated.Text>
      <View style={obSt.inputRow}>
        <TextInput
          style={obSt.inputField}
          value={value}
          onChangeText={onChangeText}
          onFocus={handleFocus}
          onBlur={handleBlur}
          keyboardType={keyboardType}
          placeholderTextColor="transparent"
          placeholder={placeholder}
          selectionColor={COLORS.blue}
        />
        {suffix ? (
          <Text style={obSt.inputSuffix}>{suffix}</Text>
        ) : null}
      </View>
    </Animated.View>
  );
};

// ============================================================
// ONBOARDING — ACTIVITY CARD
// ============================================================
const ActivityCard = ({ item, selected, onSelect }) => {
  const sc   = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(sc, {
        toValue: selected ? 1.03 : 1, tension: 80, friction: 7, useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: selected ? 1 : 0, duration: 250, useNativeDriver: false,
      }),
    ]).start();
  }, [selected]);

  const bc  = glow.interpolate({ inputRange: [0, 1], outputRange: [COLORS.cardBorder, COLORS.blue] });
  const bgO = glow.interpolate({ inputRange: [0, 1], outputRange: [0, 1] });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => { Haptics.selectionAsync(); onSelect(item.id); }}
    >
      <Animated.View style={[obSt.actCard, { borderColor: bc, transform: [{ scale: sc }] }]}>
        <Animated.View style={[StyleSheet.absoluteFill, { borderRadius: RADIUS.lg, opacity: bgO }]}>
          <LinearGradient
            colors={['rgba(79,142,247,0.12)', 'rgba(79,142,247,0.04)']}
            style={{ flex: 1, borderRadius: RADIUS.lg }}
          />
        </Animated.View>

        <View style={obSt.actInner}>
          <Text style={obSt.actEmoji}>{item.emoji}</Text>
          <View style={{ flex: 1 }}>
            <Text style={[obSt.actLabel, selected && { color: COLORS.blue }]}>
              {item.label}
            </Text>
            <Text style={obSt.actDesc}>{item.desc}</Text>
          </View>
          <View style={[obSt.actBonus, {
            backgroundColor: selected ? 'rgba(79,142,247,0.18)' : COLORS.cardHover,
          }]}>
            <Text style={[obSt.actBonusTxt, { color: selected ? COLORS.blue : COLORS.subtext }]}>
              {item.bonus > 0 ? `+${item.bonus}ml` : 'Base'}
            </Text>
          </View>
        </View>

        {selected && (
          <View style={obSt.actCheck}>
            <LinearGradient
              colors={[COLORS.blue, COLORS.cyan]}
              style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}
            >
              <Ionicons name="checkmark" size={11} color={COLORS.white} />
            </LinearGradient>
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============================================================
// ONBOARDING — CLIMATE CARD
// ============================================================
const ClimateCard = ({ item, selected, onSelect }) => {
  const sc   = useRef(new Animated.Value(1)).current;
  const glow = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(sc, {
        toValue: selected ? 1.04 : 1, tension: 80, friction: 7, useNativeDriver: true,
      }),
      Animated.timing(glow, {
        toValue: selected ? 1 : 0, duration: 250, useNativeDriver: false,
      }),
    ]).start();
  }, [selected]);

  const bc = glow.interpolate({
    inputRange: [0, 1], outputRange: [COLORS.cardBorder, item.color],
  });

  return (
    <TouchableOpacity
      activeOpacity={0.85}
      onPress={() => { Haptics.selectionAsync(); onSelect(item.id); }}
      style={{ flex: 1 }}
    >
      <Animated.View style={[obSt.climCard, { borderColor: bc, transform: [{ scale: sc }] }]}>
        {selected && (
          <LinearGradient
            colors={[item.color + '18', item.color + '05']}
            style={[StyleSheet.absoluteFill, { borderRadius: RADIUS.lg }]}
          />
        )}
        <Text style={{ fontSize: 30, marginBottom: 2 }}>{item.emoji}</Text>
        <Text style={[obSt.climLabel, selected && { color: item.color }]}>{item.label}</Text>
        <Text style={obSt.climTemp}>{item.temp}</Text>
        <View style={[obSt.climBonus, {
          backgroundColor: selected ? item.color + '22' : COLORS.cardHover,
        }]}>
          <Text style={[obSt.climBonusTxt, { color: selected ? item.color : COLORS.subtext }]}>
            {item.bonus > 0 ? `+${item.bonus}ml` : 'Base'}
          </Text>
        </View>
        {selected && (
          <View style={[obSt.actCheck, { backgroundColor: item.color }]}>
            <Ionicons name="checkmark" size={11} color={COLORS.white} />
          </View>
        )}
      </Animated.View>
    </TouchableOpacity>
  );
};

// ============================================================
// ONBOARDING — GOAL PREVIEW CARD
// ============================================================
const GoalPreviewCard = ({ goalML, weight, activity, climate }) => {
  const sc = useRef(new Animated.Value(0.9)).current;
  const op = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(sc, { toValue: 1, tension: 60, friction: 7, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 400, useNativeDriver: true }),
    ]).start();
  }, [goalML]);

  const rows = [
    { emoji: '⚖️', label: `${weight}kg × 35`, val: `${weight * 35}ml`, color: COLORS.text },
    activity.bonus > 0 && {
      emoji: activity.emoji, label: 'Activity', val: `+${activity.bonus}ml`, color: COLORS.blue,
    },
    climate.bonus > 0 && {
      emoji: climate.emoji, label: 'Climate',  val: `+${climate.bonus}ml`, color: COLORS.cyan,
    },
    { emoji: '🎯', label: 'Daily Goal', val: `${goalML}ml`, color: COLORS.green, total: true },
  ].filter(Boolean);

  return (
    <Animated.View style={[obSt.goalCard, { transform: [{ scale: sc }], opacity: op }]}>
      <LinearGradient colors={['#0d1e3d', '#091226']} style={obSt.goalGrad}>
        <View style={obSt.goalTopLine} />
        <Text style={obSt.goalTitle}>Your Daily Goal</Text>

        <View style={{ flexDirection: 'row', alignItems: 'flex-end', gap: SPACING.xs }}>
          <Text style={obSt.goalNum}>{(goalML / 1000).toFixed(1)}</Text>
          <View style={{ paddingBottom: SPACING.sm }}>
            <Text style={obSt.goalUnit}>L</Text>
            <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.subtext }}>/ day</Text>
          </View>
        </View>

        <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.subtext, marginBottom: SPACING.md }}>
          {goalML}ml total
        </Text>

        <View style={obSt.formulaBox}>
          {rows.map((r, i) => (
            <View key={i} style={[obSt.formulaRow, r.total && obSt.formulaTotal]}>
              <Text style={{ fontSize: 13, width: 22, textAlign: 'center' }}>{r.emoji}</Text>
              <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.subtext, flex: 1 }}>{r.label}</Text>
              <Text style={{ ...TYPOGRAPHY.caption, fontWeight: '700', color: r.color }}>{r.val}</Text>
            </View>
          ))}
        </View>

        <LinearGradient
          colors={[COLORS.blue, COLORS.cyan, COLORS.green]}
          style={{ width: '100%', height: 4, borderRadius: 2, marginBottom: SPACING.xs }}
          start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
        />
        <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.subtext }}>
          Perfectly calibrated for you 💧
        </Text>
      </LinearGradient>
    </Animated.View>
  );
};

// ============================================================
// ONBOARDING SCREEN
// ============================================================
const OnboardingScreen = ({ onComplete }) => {
  const [step,       setStep]       = useState(0);
  const [name,       setName]       = useState('');
  const [weight,     setWeight]     = useState('');
  const [activityId, setActivityId] = useState('active');
  const [climateId,  setClimateId]  = useState('moderate');

  const slideX = useRef(new Animated.Value(0)).current;

  const selectedActivity = ONBOARD_ACTIVITIES.find(a => a.id === activityId) ?? ONBOARD_ACTIVITIES[2];
  const selectedClimate  = ONBOARD_CLIMATES.find(c => c.id === climateId)    ?? ONBOARD_CLIMATES[1];
  const weightNum        = parseFloat(weight) || 70;

  const goalML = useMemo(() => {
    const base = weightNum * 35;
    return Math.round(
      (base + selectedActivity.bonus + selectedClimate.bonus) / 50
    ) * 50;
  }, [weightNum, selectedActivity.bonus, selectedClimate.bonus]);

  const advance = useCallback(() => {
    Animated.timing(slideX, {
      toValue: -DEVICE.width, duration: 250,
      easing: Easing.in(Easing.quad), useNativeDriver: true,
    }).start(() => {
      setStep(s => Math.min(s + 1, 2));
      slideX.setValue(DEVICE.width);
      Animated.spring(slideX, {
        toValue: 0, tension: 55, friction: 9, useNativeDriver: true,
      }).start();
    });
  }, []);

  const handleComplete = useCallback(async () => {
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const profile = {
      name:          name.trim() || 'Friend',
      weight:        weightNum,
      weightUnit:    'kg',
      activityLevel: activityId,
      climate:       climateId,
      dailyGoal:     goalML,
    };
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(profile));
      await AsyncStorage.setItem(STORAGE_KEYS.ONBOARDED, 'true');
    } catch (_) {}
    onComplete(profile);
  }, [name, weightNum, activityId, climateId, goalML]);

  /* ── shared CTA button ── */
  const CTABtn = ({ label, onPress, disabled = false, icon = 'arrow-forward' }) => (
    <PressScale onPress={onPress} disabled={disabled} style={obSt.ctaWrap}>
      <LinearGradient
        colors={[COLORS.blue, '#2a6de0', COLORS.blueDim]}
        style={obSt.ctaGrad}
      >
        <Text style={obSt.ctaTxt}>{label}</Text>
        <View style={obSt.ctaIcon}>
          <Ionicons name={icon} size={20} color={COLORS.white} />
        </View>
      </LinearGradient>
    </PressScale>
  );

  const steps = [
    /* Step 1 – Personal Info */
    <View key="s1">
      <View style={obSt.stepIconWrap}>
        <LinearGradient
          colors={['rgba(79,142,247,0.25)', 'rgba(79,142,247,0.08)']}
          style={obSt.stepIconBg}
        >
          <Text style={{ fontSize: 34 }}>👋</Text>
        </LinearGradient>
      </View>
      <Text style={obSt.stepTitle}>Let's get to know you</Text>
      <Text style={obSt.stepDesc}>
        We'll personalise your daily water goal based on your body and lifestyle.
      </Text>
      <View style={{ gap: SPACING.md, marginBottom: SPACING.md }}>
        <AnimatedInput
          value={name}
          onChangeText={setName}
          placeholder="Your first name"
        />
        <AnimatedInput
          value={weight}
          onChangeText={v => { if (/^\d*\.?\d*$/.test(v)) setWeight(v); }}
          placeholder="Body weight"
          suffix="kg"
          keyboardType="decimal-pad"
        />
      </View>
      <View style={obSt.tipCard}>
        <Ionicons name="information-circle-outline" size={16} color={COLORS.blue} />
        <Text style={obSt.tipTxt}>
          We use your weight to calculate a precise hydration goal using the 35ml/kg formula.
        </Text>
      </View>
      <ProgressDots step={0} />
      <CTABtn label="Continue" onPress={advance} disabled={!name.trim() || !weight} />
    </View>,

    /* Step 2 – Activity */
    <View key="s2">
      <View style={obSt.stepIconWrap}>
        <LinearGradient
          colors={['rgba(79,142,247,0.25)', 'rgba(79,142,247,0.08)']}
          style={obSt.stepIconBg}
        >
          <Text style={{ fontSize: 34 }}>⚡</Text>
        </LinearGradient>
      </View>
      <Text style={obSt.stepTitle}>Activity Level</Text>
      <Text style={obSt.stepDesc}>
        How active are you on a typical day? More movement = more hydration needed.
      </Text>
      <View style={{ gap: SPACING.sm, marginBottom: SPACING.lg }}>
        {ONBOARD_ACTIVITIES.map(item => (
          <ActivityCard
            key={item.id}
            item={item}
            selected={activityId === item.id}
            onSelect={setActivityId}
          />
        ))}
      </View>
      <ProgressDots step={1} />
      <CTABtn label="Continue" onPress={advance} />
    </View>,

    /* Step 3 – Climate */
    <View key="s3">
      <View style={obSt.stepIconWrap}>
        <LinearGradient
          colors={['rgba(255,152,0,0.25)', 'rgba(255,152,0,0.08)']}
          style={obSt.stepIconBg}
        >
          <Text style={{ fontSize: 34 }}>🌍</Text>
        </LinearGradient>
      </View>
      <Text style={obSt.stepTitle}>Your Climate</Text>
      <Text style={obSt.stepDesc}>
        Warmer environments increase perspiration, so you need more water.
      </Text>
      <View style={{ flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.lg }}>
        {ONBOARD_CLIMATES.map(item => (
          <ClimateCard
            key={item.id}
            item={item}
            selected={climateId === item.id}
            onSelect={setClimateId}
          />
        ))}
      </View>
      <GoalPreviewCard
        goalML={goalML}
        weight={weightNum}
        activity={selectedActivity}
        climate={selectedClimate}
      />
      <ProgressDots step={2} />
      <CTABtn label="Start My Journey" onPress={handleComplete} icon="water" />
    </View>,
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <LinearGradient
        colors={['#06060f', COLORS.bg, '#06060f']}
        style={StyleSheet.absoluteFill}
      />
      <SafeAreaView>
        <View style={obSt.stepPill}>
          <LinearGradient
            colors={['rgba(79,142,247,0.18)', 'rgba(79,142,247,0.06)']}
            style={obSt.stepPillGrad}
          >
            <Text style={obSt.stepPillTxt}>Step {step + 1} of 3</Text>
          </LinearGradient>
        </View>
      </SafeAreaView>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={DEVICE.isIOS ? 'padding' : 'height'}
      >
        <ScrollView
          contentContainerStyle={obSt.scroll}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
        >
          <Animated.View style={{ transform: [{ translateX: slideX }] }}>
            {steps[step]}
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

const obSt = StyleSheet.create({
  scroll: { paddingHorizontal: SPACING.md, paddingBottom: SPACING.xxl },

  // pill
  stepPill: {
    alignSelf: 'center', marginTop: SPACING.md,
    borderRadius: RADIUS.round, overflow: 'hidden',
    borderWidth: 1, borderColor: 'rgba(79,142,247,0.3)',
  },
  stepPillGrad: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.xs },
  stepPillTxt:  { ...TYPOGRAPHY.label, fontSize: 11, color: COLORS.blue, letterSpacing: 1.5 },

  // step header
  stepIconWrap: { alignItems: 'center', marginTop: SPACING.lg, marginBottom: SPACING.md },
  stepIconBg: {
    width: 72, height: 72, borderRadius: 36,
    alignItems: 'center', justifyContent: 'center',
    borderWidth: 1, borderColor: 'rgba(79,142,247,0.3)',
  },
  stepTitle: { ...TYPOGRAPHY.h1, color: COLORS.text, textAlign: 'center', marginBottom: SPACING.sm },
  stepDesc:  {
    ...TYPOGRAPHY.body, color: COLORS.subtext, textAlign: 'center',
    lineHeight: 22, marginBottom: SPACING.lg, paddingHorizontal: SPACING.sm,
  },

  // dots
  dotsRow: {
    flexDirection: 'row', alignItems: 'center',
    justifyContent: 'center', gap: SPACING.sm, marginBottom: SPACING.lg,
  },
  dot:       { width: 10, height: 10, borderRadius: 5, backgroundColor: COLORS.cardBorder, alignItems: 'center', justifyContent: 'center', overflow: 'hidden' },
  dotActive: { width: 28, borderRadius: 5, overflow: 'hidden' },
  dotDone:   { width: 18, height: 18, borderRadius: 9, overflow: 'hidden' },

  // input
  inputWrap: { borderWidth: 1.5, borderRadius: RADIUS.md, backgroundColor: COLORS.card, position: 'relative' },
  floatLabel: { position: 'absolute', left: SPACING.md, backgroundColor: COLORS.card, paddingHorizontal: 4, zIndex: 1, fontWeight: '500' },
  inputRow:   { flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.md, paddingTop: SPACING.sm + 6, paddingBottom: SPACING.sm + 2 },
  inputField: { flex: 1, ...TYPOGRAPHY.bodyLG, color: COLORS.text, paddingVertical: 2 },
  inputSuffix:{ ...TYPOGRAPHY.label, color: COLORS.blue, marginLeft: SPACING.xs },

  // tip
  tipCard: {
    flexDirection: 'row', alignItems: 'flex-start', gap: SPACING.sm,
    backgroundColor: 'rgba(79,142,247,0.08)',
    borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(79,142,247,0.18)',
    padding: SPACING.sm + 2, marginBottom: SPACING.lg,
  },
  tipTxt: { ...TYPOGRAPHY.caption, color: COLORS.subtext, flex: 1, lineHeight: 17 },

  // activity card
  actCard:     { borderWidth: 1.5, borderRadius: RADIUS.lg, backgroundColor: COLORS.card, overflow: 'hidden' },
  actInner:    { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
  actEmoji:    { fontSize: 28 },
  actLabel:    { ...TYPOGRAPHY.body, fontWeight: '700', color: COLORS.text },
  actDesc:     { ...TYPOGRAPHY.caption, color: COLORS.subtext, marginTop: 2 },
  actBonus:    { paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.round },
  actBonusTxt: { ...TYPOGRAPHY.label, fontSize: 10 },
  actCheck:    { position: 'absolute', top: SPACING.sm, right: SPACING.sm, width: 20, height: 20, borderRadius: 10, overflow: 'hidden' },

  // climate card
  climCard:     { borderWidth: 1.5, borderRadius: RADIUS.lg, backgroundColor: COLORS.card, padding: SPACING.md, alignItems: 'center', gap: 4, overflow: 'hidden', position: 'relative' },
  climLabel:    { ...TYPOGRAPHY.body, fontWeight: '700', color: COLORS.text, textAlign: 'center' },
  climTemp:     { ...TYPOGRAPHY.caption, color: COLORS.subtext, textAlign: 'center' },
  climBonus:    { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.round, marginTop: 4 },
  climBonusTxt: { ...TYPOGRAPHY.label, fontSize: 10 },

  // goal preview
  goalCard: {
    borderRadius: RADIUS.xl, overflow: 'hidden',
    borderWidth: 1.5, borderColor: 'rgba(79,142,247,0.4)',
    marginBottom: SPACING.lg, ...SHADOWS.blue,
  },
  goalGrad:    { padding: SPACING.lg, alignItems: 'center' },
  goalTopLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: COLORS.blue, opacity: 0.6 },
  goalTitle:   { ...TYPOGRAPHY.label, color: COLORS.blue, letterSpacing: 2, marginBottom: SPACING.sm },
  goalNum:     { fontSize: 64, fontWeight: '800', color: COLORS.text, lineHeight: 70 },
  goalUnit:    { ...TYPOGRAPHY.h1, color: COLORS.blue },
  formulaBox:  {
    width: '100%', backgroundColor: 'rgba(10,10,15,0.8)',
    borderRadius: RADIUS.md, padding: SPACING.sm + 2,
    gap: SPACING.xs, marginBottom: SPACING.md,
    borderWidth: 1, borderColor: COLORS.cardBorder,
  },
  formulaRow:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  formulaTotal: { borderTopWidth: 1, borderTopColor: COLORS.cardBorder, paddingTop: SPACING.xs, marginTop: SPACING.xs },

  // CTA
  ctaWrap: { borderRadius: RADIUS.lg, overflow: 'hidden', ...SHADOWS.blue },
  ctaGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md + 2, paddingHorizontal: SPACING.lg, gap: SPACING.sm },
  ctaTxt:  { ...TYPOGRAPHY.body, fontWeight: '800', color: COLORS.white, fontSize: 16, letterSpacing: 0.3 },
  ctaIcon: { width: 30, height: 30, borderRadius: 15, backgroundColor: 'rgba(255,255,255,0.18)', alignItems: 'center', justifyContent: 'center' },
});
// ============================================================
// ANIMATED SVG PROGRESS RING
// ============================================================
const AnimatedCircle = Animated.createAnimatedComponent(Circle);

const ProgressRing = ({ percent, size = 220, strokeWidth = 14 }) => {
  const animPct      = useRef(new Animated.Value(0)).current;
  const radius       = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;

  useEffect(() => {
    Animated.timing(animPct, {
      toValue: percent, duration: 900,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
  }, [percent]);

  const strokeDashoffset = animPct.interpolate({
    inputRange:  [0, 100],
    outputRange: [circumference, 0],
    extrapolate: 'clamp',
  });

  return (
    <Svg width={size} height={size} style={{ transform: [{ rotate: '-90deg' }] }}>
      <Defs>
        <SvgLinearGradient id="rg" x1="0%" y1="0%" x2="100%" y2="100%">
          <Stop offset="0%"   stopColor={COLORS.blue}  stopOpacity="1" />
          <Stop offset="50%"  stopColor={COLORS.cyan}  stopOpacity="1" />
          <Stop offset="100%" stopColor={COLORS.green} stopOpacity="1" />
        </SvgLinearGradient>
        <RadialGradient id="rr" cx="50%" cy="50%" r="50%">
          <Stop offset="0%"   stopColor={COLORS.blue} stopOpacity="0.15" />
          <Stop offset="100%" stopColor={COLORS.blue} stopOpacity="0"   />
        </RadialGradient>
      </Defs>

      {/* ambient glow disc */}
      <Circle cx={size / 2} cy={size / 2} r={radius + 8} fill="url(#rr)" />

      {/* track */}
      <Circle
        cx={size / 2} cy={size / 2} r={radius}
        stroke={COLORS.cardBorder} strokeWidth={strokeWidth}
        fill="transparent" opacity={0.6}
      />

      {/* progress arc */}
      <AnimatedCircle
        cx={size / 2} cy={size / 2} r={radius}
        stroke="url(#rg)" strokeWidth={strokeWidth}
        fill="transparent"
        strokeDasharray={circumference}
        strokeDashoffset={strokeDashoffset}
        strokeLinecap="round"
      />

      {/* end-cap dot */}
      {percent > 2 && (
        <Circle
          cx={size / 2 + radius} cy={size / 2}
          r={strokeWidth / 2 + 1}
          fill={percent >= 100 ? COLORS.green : COLORS.blue}
        />
      )}
    </Svg>
  );
};

// ============================================================
// WATER WAVE
// ============================================================
const WaterWave = ({ percent, size = 220 }) => {
  const fillAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.timing(fillAnim, {
      toValue: percent, duration: 900,
      easing: Easing.out(Easing.cubic), useNativeDriver: false,
    }).start();
  }, [percent]);

  const waveColor  = percent >= 100 ? 'rgba(0,230,118,0.35)'  : 'rgba(79,142,247,0.30)';
  const waveColor2 = percent >= 100 ? 'rgba(0,230,118,0.20)'  : 'rgba(79,142,247,0.18)';
  const W          = size - 4;
  const H          = size - 4;
  const fillY      = H * (1 - Math.min(percent, 100) / 100);
  const amp = 6, freq = 2;

  let d1 = `M 0 ${fillY}`;
  let d2 = `M 0 ${fillY + 5}`;
  for (let x = 0; x <= W; x += 4) {
    d1 += ` L ${x} ${fillY      + amp * Math.sin((x / W) * freq * Math.PI * 2)}`;
    d2 += ` L ${x} ${fillY + 5  + amp * Math.sin((x / W) * freq * Math.PI * 2 + Math.PI)}`;
  }
  d1 += ` L ${W} ${H} L 0 ${H} Z`;
  d2 += ` L ${W} ${H} L 0 ${H} Z`;

  const inner = size - 30;

  return (
    <View style={{
      position: 'absolute',
      width: inner, height: inner,
      borderRadius: inner / 2,
      overflow: 'hidden',
    }}>
      <Svg width={inner} height={inner}>
        <Defs>
          <ClipPath id="cc">
            <Circle cx={inner / 2} cy={inner / 2} r={inner / 2} />
          </ClipPath>
        </Defs>
        <Path d={d1} fill={waveColor}  clipPath="url(#cc)" />
        <Path d={d2} fill={waveColor2} clipPath="url(#cc)" />
      </Svg>
    </View>
  );
};

// ============================================================
// ANIMATED COUNTER
// ============================================================
const AnimatedCounter = ({ value, style }) => {
  const animVal = useRef(new Animated.Value(value)).current;
  const [display, setDisplay] = useState(value);

  useEffect(() => {
    const id = animVal.addListener(({ value: v }) => setDisplay(Math.round(v)));
    Animated.timing(animVal, {
      toValue: value, duration: 700,
      easing: Easing.out(Easing.quad), useNativeDriver: false,
    }).start();
    return () => animVal.removeListener(id);
  }, [value]);

  return <Text style={style}>{display.toLocaleString()}</Text>;
};

// ============================================================
// HOME SCREEN
// ============================================================
const HomeScreen = ({
  profile, todayLog, onAddWater, onNavigate,
  streak, weeklyAvg,
}) => {
  const [customAmount, setCustomAmount]         = useState(300);
  const [showCustom,   setShowCustom]           = useState(false);
  const [showCelebration, setShowCelebration]   = useState(false);
  const [celebrationShown, setCelebrationShown] = useState(false);
  const [milestone, setMilestone]               = useState(null);
  const prevTotal                               = useRef(0);

  const goal       = profile?.dailyGoal ?? APP_CONFIG.defaultGoal;
  const totalML    = todayLog?.total     ?? 0;
  const percent    = getProgressPercent(totalML, goal);
  const status     = getHydrationStatus(percent);
  const remaining  = Math.max(goal - totalML, 0);
  const name       = profile?.name ?? 'Friend';

  // ── Animation refs ────────────────────────────────────────
  const headerSlide  = useRef(new Animated.Value(-30)).current;
  const headerOp     = useRef(new Animated.Value(0)).current;
  const ringScale    = useRef(new Animated.Value(0.85)).current;
  const ringOp       = useRef(new Animated.Value(0)).current;
  const pulseAnim    = useRef(new Animated.Value(1)).current;
  const msgSlide     = useRef(new Animated.Value(10)).current;
  const msgOp        = useRef(new Animated.Value(1)).current;
  const customSlide  = useRef(new Animated.Value(-20)).current;
  const customOp     = useRef(new Animated.Value(0)).current;
  const streakBounce = useRef(new Animated.Value(1)).current;

  // ── Mount ─────────────────────────────────────────────────
  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerSlide, { toValue: 0, duration: 600, delay: 100, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(headerOp,    { toValue: 1, duration: 600, delay: 100, useNativeDriver: true }),
      Animated.spring(ringScale,   { toValue: 1, tension: 60, friction: 8, delay: 200, useNativeDriver: true }),
      Animated.timing(ringOp,      { toValue: 1, duration: 500, delay: 200, useNativeDriver: true }),
    ]).start();
  }, []);

  // ── Streak bounce ─────────────────────────────────────────
  useEffect(() => {
    if ((streak ?? 0) > 0) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(streakBounce, { toValue: 1.3, duration: 600, easing: Easing.out(Easing.back(2)), useNativeDriver: true }),
          Animated.timing(streakBounce, { toValue: 1.0, duration: 600, easing: Easing.in(Easing.quad),    useNativeDriver: true }),
          Animated.delay(1800),
        ])
      ).start();
    }
  }, [streak]);

  // ── Motivational message ──────────────────────────────────
  const motivMsg = useMemo(() => {
    if (percent === 0)  return { text: "Start your hydration journey! 💧",         color: COLORS.subtext };
    if (percent <= 25)  return { text: "Start your hydration journey! 💧",         color: COLORS.blue   };
    if (percent <= 50)  return { text: "Keep going! You're doing great! 🌊",        color: COLORS.blue   };
    if (percent <= 75)  return { text: "More than halfway there! 💪",               color: COLORS.cyan   };
    if (percent < 100)  return { text: "Almost there! Push through! 🎯",            color: COLORS.orange };
    return                     { text: "GOAL CRUSHED! You're a hydration hero! 🏆", color: COLORS.green  };
  }, [percent]);

  useEffect(() => {
    Animated.sequence([
      Animated.parallel([
        Animated.timing(msgSlide, { toValue: -10, duration: 150, useNativeDriver: true }),
        Animated.timing(msgOp,    { toValue: 0,   duration: 150, useNativeDriver: true }),
      ]),
      Animated.parallel([
        Animated.timing(msgSlide, { toValue: 0, duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(msgOp,    { toValue: 1, duration: 300, useNativeDriver: true }),
      ]),
    ]).start();
  }, [motivMsg.text]);

  // ── Goal reached ──────────────────────────────────────────
  useEffect(() => {
    if (percent >= 100) {
      Animated.loop(
        Animated.sequence([
          Animated.timing(pulseAnim, { toValue: 1.15, duration: 500, useNativeDriver: true }),
          Animated.timing(pulseAnim, { toValue: 1,    duration: 500, useNativeDriver: true }),
        ])
      ).start();
      if (!celebrationShown) {
        setTimeout(() => {
          setShowCelebration(true);
          setCelebrationShown(true);
          SoundEngine.play('goal');
        }, 400);
      }
    } else {
      pulseAnim.setValue(1);
    }
  }, [percent >= 100]);

  // ── Milestone detection ───────────────────────────────────
  useEffect(() => {
    const milestones = [
      { ml: 500,  emoji: '💧', title: '500ml Reached!',  sub: 'Great start, keep it flowing'  },
      { ml: 1000, emoji: '🌊', title: '1 Litre Down!',   sub: 'Halfway to a healthy base'     },
      { ml: 1500, emoji: '💪', title: '1.5L Achieved!',  sub: "You're crushing it today!"     },
      { ml: goal, emoji: '🏆', title: 'Goal Reached!',   sub: 'Daily hydration complete!'     },
    ];
    const prev = prevTotal.current;
    for (const m of milestones) {
      if (prev < m.ml && totalML >= m.ml) {
        setMilestone(m);
        SoundEngine.play('milestone');
        break;
      }
    }
    prevTotal.current = totalML;
  }, [totalML]);

  // ── Custom panel ──────────────────────────────────────────
  useEffect(() => {
    if (showCustom) {
      Animated.parallel([
        Animated.timing(customSlide, { toValue: 0,   duration: 300, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(customOp,    { toValue: 1,   duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(customSlide, { toValue: -20, duration: 200, useNativeDriver: true }),
        Animated.timing(customOp,    { toValue: 0,   duration: 200, useNativeDriver: true }),
      ]).start();
    }
  }, [showCustom]);

  const handleAdd = useCallback((ml) => {
    if (ml === 0) { setShowCustom(p => !p); return; }
    Animated.sequence([
      Animated.timing(ringScale, { toValue: 1.04, duration: 120, useNativeDriver: true }),
      Animated.spring(ringScale, { toValue: 1,    tension: 80, friction: 6, useNativeDriver: true }),
    ]).start();
    SoundEngine.play('drop');
    onAddWater(ml);
  }, [onAddWater]);

  const greeting = useMemo(() => {
    const h = new Date().getHours();
    return h < 12 ? 'Good morning' : h < 17 ? 'Good afternoon' : 'Good evening';
  }, []);

  const accentColors = [COLORS.blue, COLORS.cyan, COLORS.green, COLORS.orange];

  return (
    <View style={homeSt.screen}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.bg} />

      {/* ambient glow */}
      <View style={homeSt.ambient} pointerEvents="none">
        <LinearGradient
          colors={[COLORS.blueGlow, 'transparent']}
          style={homeSt.ambientBlob}
        />
      </View>

      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={homeSt.scroll}
          showsVerticalScrollIndicator={false}
          bounces
        >
          {/* ── Header ─────────────────────────────────────── */}
          <Animated.View style={[homeSt.header, {
            transform: [{ translateY: headerSlide }], opacity: headerOp,
          }]}>
            <View>
              <Text style={homeSt.greeting}>{greeting},</Text>
              <Text style={homeSt.nameTxt}>{name} 👋</Text>
            </View>
            <PressScale onPress={() => onNavigate(SCREENS.SETTINGS)}>
              <LinearGradient
                colors={['rgba(79,142,247,0.35)', 'rgba(79,142,247,0.15)']}
                style={homeSt.avatar}
              >
                <Text style={homeSt.avatarInit}>
                  {name.charAt(0).toUpperCase() || '?'}
                </Text>
              </LinearGradient>
            </PressScale>
          </Animated.View>

          {/* ── Motivational message ────────────────────────── */}
          <Animated.Text style={[homeSt.motivMsg, {
            color: motivMsg.color,
            transform: [{ translateY: msgSlide }], opacity: msgOp,
          }]}>
            {motivMsg.text}
          </Animated.Text>

          {/* ── Progress ring ───────────────────────────────── */}
          <Animated.View style={[homeSt.ringSection, {
            transform: [{ scale: ringScale }], opacity: ringOp,
          }]}>
            <View style={homeSt.ringGlowOuter} />
            <ProgressRing percent={percent} size={220} strokeWidth={14} />
            <View style={homeSt.ringCenter}>
              <WaterWave percent={percent} size={220} />
              <View style={homeSt.ringContent}>
                <AnimatedCounter value={totalML} style={homeSt.intakeNum} />
                <Text style={homeSt.intakeUnit}>ml</Text>
                <Text style={homeSt.intakeGoal}>of {formatML(goal)}</Text>
                <Animated.View style={[homeSt.pctBadge, {
                  backgroundColor: status.color + '22',
                  borderColor:     status.color + '55',
                  transform: [{ scale: pulseAnim }],
                }]}>
                  <Text style={[homeSt.pctTxt, { color: status.color }]}>{percent}%</Text>
                </Animated.View>
              </View>
            </View>
          </Animated.View>

          {/* ── Remaining ───────────────────────────────────── */}
          <View style={homeSt.remainRow}>
            <Ionicons
              name={remaining > 0 ? 'water-outline' : 'checkmark-circle'}
              size={14}
              color={remaining > 0 ? COLORS.subtext : COLORS.green}
            />
            <Text style={[homeSt.remainTxt, remaining === 0 && { color: COLORS.green }]}>
              {remaining > 0
                ? ` ${formatML(remaining)} remaining to reach your goal`
                : ' Daily goal achieved! 🎉'}
            </Text>
          </View>

          {/* ── Quick-add ───────────────────────────────────── */}
          <View style={homeSt.sectionHdr}>
            <Text style={homeSt.sectionTitle}>Quick Add</Text>
            <View style={[homeSt.sectionLine, { backgroundColor: COLORS.blue + '40' }]} />
          </View>
          <View style={homeSt.quickRow}>
            {PRESET_AMOUNTS.map((p, i) => {
              const accent = accentColors[i];
              return (
                <PressScale key={p.label} onPress={() => handleAdd(p.ml)} style={{ flex: 1 }}>
                  <View style={homeSt.quickBtn}>
                    <LinearGradient
                      colors={p.ml === 0
                        ? [COLORS.card, COLORS.cardHover]
                        : [accent + '22', accent + '0a']}
                      style={homeSt.quickGrad}
                    >
                      <View style={[homeSt.quickIcon, { borderColor: accent + '44' }]}>
                        <Ionicons
                          name={p.ml === 0 ? 'add-circle-outline' : 'water-outline'}
                          size={20}
                          color={p.ml === 0 ? COLORS.subtext : accent}
                        />
                      </View>
                      <Text style={[homeSt.quickLabel, { color: p.ml === 0 ? COLORS.subtext : COLORS.text }]}>
                        {p.label}
                      </Text>
                      {p.ml > 0 && (
                        <Text style={[homeSt.quickML, { color: accent }]}>{p.ml}ml</Text>
                      )}
                    </LinearGradient>
                  </View>
                </PressScale>
              );
            })}
          </View>

          {/* ── Custom input ────────────────────────────────── */}
          {showCustom && (
            <Animated.View style={[homeSt.customCard, {
              transform: [{ translateY: customSlide }], opacity: customOp,
            }]}>
              <LinearGradient colors={[COLORS.card, COLORS.bg]} style={homeSt.customGrad}>
                <Text style={homeSt.customLabel}>Custom Amount</Text>
                <View style={homeSt.customRow}>
                  <PressScale onPress={() => setCustomAmount(p => Math.max(50, p - 50))}>
                    <View style={homeSt.stepBtn}>
                      <Ionicons name="remove" size={22} color={COLORS.blue} />
                    </View>
                  </PressScale>
                  <View style={homeSt.customInputWrap}>
                    <TextInput
                      style={homeSt.customInput}
                      value={String(customAmount)}
                      onChangeText={v => {
                        const n = parseInt(v, 10);
                        if (!isNaN(n) && n > 0 && n <= 3000) setCustomAmount(n);
                      }}
                      keyboardType="numeric"
                      selectTextOnFocus
                      selectionColor={COLORS.blue}
                    />
                    <Text style={homeSt.customUnit}>ml</Text>
                  </View>
                  <PressScale onPress={() => setCustomAmount(p => Math.min(3000, p + 50))}>
                    <View style={homeSt.stepBtn}>
                      <Ionicons name="add" size={22} color={COLORS.blue} />
                    </View>
                  </PressScale>
                </View>
                <PressScale
                  onPress={() => {
                    if (customAmount > 0) { handleAdd(customAmount); setShowCustom(false); }
                  }}
                  style={homeSt.customAddBtn}
                >
                  <LinearGradient colors={[COLORS.blue, COLORS.blueDim]} style={homeSt.customAddGrad}>
                    <Ionicons name="add-circle" size={18} color={COLORS.white} />
                    <Text style={homeSt.customAddTxt}>Add {customAmount}ml</Text>
                  </LinearGradient>
                </PressScale>
              </LinearGradient>
            </Animated.View>
          )}

          {/* ── Streak card ─────────────────────────────────── */}
          <View style={homeSt.streakCard}>
            <LinearGradient colors={['#1e1208', '#12120a']} style={homeSt.streakGrad}>
              <View style={homeSt.streakLeft}>
                <Animated.Text style={[homeSt.streakFire, { transform: [{ scale: streakBounce }] }]}>
                  🔥
                </Animated.Text>
                <View>
                  <Text style={homeSt.streakNum}>{streak ?? 0}</Text>
                  <Text style={homeSt.streakLbl}>Day Streak</Text>
                </View>
              </View>
              <View style={{ alignItems: 'flex-end', gap: SPACING.xs }}>
                {(streak ?? 0) >= 7  && (
                  <View style={homeSt.streakBadge}>
                    <Text style={[homeSt.streakBadgeTxt, { color: COLORS.orange }]}>🏅 Week</Text>
                  </View>
                )}
                {(streak ?? 0) >= 30 && (
                  <View style={[homeSt.streakBadge, { backgroundColor: 'rgba(255,215,0,0.15)' }]}>
                    <Text style={[homeSt.streakBadgeTxt, { color: '#ffd700' }]}>👑 Month</Text>
                  </View>
                )}
                {(streak ?? 0) === 0 && (
                  <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.subtextDim, fontStyle: 'italic' }}>
                    Log today to start!
                  </Text>
                )}
              </View>
            </LinearGradient>
          </View>

          {/* ── Stat cards ──────────────────────────────────── */}
          <View style={homeSt.sectionHdr}>
            <Text style={homeSt.sectionTitle}>Today's Stats</Text>
            <View style={[homeSt.sectionLine, { backgroundColor: COLORS.blue + '40' }]} />
          </View>
          <View style={homeSt.statsRow}>
            {[
              { label: 'Today',    value: `${percent}%`,        sub: formatML(totalML),               color: status.color, icon: 'today-outline'     },
              { label: 'Streak',   value: `${streak ?? 0}d`,    sub: streak > 0 ? 'Keep it up!' : 'Start today', color: COLORS.orange, icon: 'flame-outline' },
              { label: 'Wkly Avg', value: formatML(weeklyAvg ?? 0), sub: 'per day',                  color: COLORS.cyan,  icon: 'analytics-outline' },
            ].map(s => (
              <View key={s.label} style={homeSt.statCard}>
                <LinearGradient colors={[COLORS.card, COLORS.bg]} style={homeSt.statGrad}>
                  <View style={[homeSt.statIcon, { backgroundColor: s.color + '20' }]}>
                    <Ionicons name={s.icon} size={18} color={s.color} />
                  </View>
                  <Text style={[homeSt.statVal, { color: s.color }]}>{s.value}</Text>
                  <Text style={homeSt.statLbl}>{s.label}</Text>
                  <Text style={homeSt.statSub}>{s.sub}</Text>
                </LinearGradient>
              </View>
            ))}
          </View>

          {/* ── Today's log ─────────────────────────────────── */}
          {(todayLog?.entries?.length ?? 0) > 0 ? (
            <>
              <View style={homeSt.sectionHdr}>
                <Text style={homeSt.sectionTitle}>Today's Log</Text>
                <View style={[homeSt.sectionLine, { backgroundColor: COLORS.blue + '40' }]} />
                <PressScale onPress={() => onNavigate(SCREENS.HISTORY)}>
                  <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.blue }}>See all →</Text>
                </PressScale>
              </View>
              <View style={{ gap: SPACING.xs }}>
                {[...todayLog.entries].reverse().slice(0, 4).map((entry, i) => (
                  <View key={i} style={homeSt.logItem}>
                    <LinearGradient
                      colors={[COLORS.card, COLORS.bg]}
                      style={homeSt.logItemGrad}
                      start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
                    >
                      <View style={homeSt.logDot}>
                        <Ionicons name="water" size={13} color={COLORS.blue} />
                      </View>
                      <Text style={homeSt.logAmt}>{entry.ml}ml</Text>
                      <Text style={homeSt.logType}>{entry.type ?? 'Water'}</Text>
                      <Text style={homeSt.logTime}>
                        {new Date(entry.time).toLocaleTimeString([], {
                          hour: '2-digit', minute: '2-digit',
                        })}
                      </Text>
                    </LinearGradient>
                  </View>
                ))}
              </View>
            </>
          ) : (
            <EmptyState
              emoji="💧"
              title="No water logged yet"
              sub="Tap a quick-add button above to log your first drink today!"
            />
          )}

          <View style={{ height: 90 }} />
        </ScrollView>
      </SafeAreaView>

      <TabBar activeScreen={SCREENS.HOME} onNavigate={onNavigate} />
      <GoalCelebrationModal
        visible={showCelebration}
        streak={streak ?? 0}
        onClose={() => setShowCelebration(false)}
      />
      <MilestoneSheet milestone={milestone} onDismiss={() => setMilestone(null)} />
    </View>
  );
};

const homeSt = StyleSheet.create({
  screen:       { flex: 1, backgroundColor: COLORS.bg },
  ambient:      { ...StyleSheet.absoluteFillObject, overflow: 'hidden' },
  ambientBlob:  { position: 'absolute', top: -80, left: DEVICE.width / 2 - 150, width: 300, height: 300, borderRadius: 150 },
  scroll:       { paddingHorizontal: SPACING.md, paddingTop: SPACING.sm },
  header:       { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: SPACING.sm, paddingTop: SPACING.xs },
  greeting:     { ...TYPOGRAPHY.body, color: COLORS.subtext },
  nameTxt:      { ...TYPOGRAPHY.h2, color: COLORS.text },
  avatar:       { width: 42, height: 42, borderRadius: 21, alignItems: 'center', justifyContent: 'center', borderWidth: 1.5, borderColor: 'rgba(79,142,247,0.45)' },
  avatarInit:   { ...TYPOGRAPHY.h3, color: COLORS.blue },
  motivMsg:     { ...TYPOGRAPHY.body, textAlign: 'center', marginBottom: SPACING.md, fontWeight: '600' },
  ringSection:  { alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.sm, height: 240 },
  ringGlowOuter:{ position: 'absolute', width: 240, height: 240, borderRadius: 120, borderWidth: 1, borderColor: 'rgba(79,142,247,0.18)' },
  ringCenter:   { position: 'absolute', width: 192, height: 192, borderRadius: 96, alignItems: 'center', justifyContent: 'center', overflow: 'hidden', backgroundColor: COLORS.bg },
  ringContent:  { alignItems: 'center', zIndex: 2 },
  intakeNum:    { fontSize: 46, fontWeight: '800', color: COLORS.text, lineHeight: 52 },
  intakeUnit:   { ...TYPOGRAPHY.label, color: COLORS.subtext, marginTop: -2 },
  intakeGoal:   { ...TYPOGRAPHY.caption, color: COLORS.subtextDim, marginTop: 2 },
  pctBadge:     { marginTop: SPACING.xs, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.round, borderWidth: 1 },
  pctTxt:       { ...TYPOGRAPHY.label, fontSize: 11 },
  remainRow:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', marginBottom: SPACING.md },
  remainTxt:    { ...TYPOGRAPHY.caption, color: COLORS.subtext },
  sectionHdr:   { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.sm },
  sectionTitle: { ...TYPOGRAPHY.label, color: COLORS.subtext, flexShrink: 0 },
  sectionLine:  { flex: 1, height: 1 },
  quickRow:     { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  quickBtn:     { borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.cardBorder },
  quickGrad:    { paddingVertical: SPACING.sm + 4, paddingHorizontal: SPACING.xs, alignItems: 'center', gap: 4 },
  quickIcon:    { width: 36, height: 36, borderRadius: 18, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  quickLabel:   { ...TYPOGRAPHY.caption, fontWeight: '600' },
  quickML:      { ...TYPOGRAPHY.labelSM, fontSize: 10 },
  customCard:   { borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(79,142,247,0.3)', marginBottom: SPACING.md },
  customGrad:   { padding: SPACING.md, gap: SPACING.sm },
  customLabel:  { ...TYPOGRAPHY.label, color: COLORS.blue, textAlign: 'center' },
  customRow:    { flexDirection: 'row', alignItems: 'center', gap: SPACING.sm },
  stepBtn:      { width: 48, height: 48, alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.cardHover, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.cardBorder },
  customInputWrap: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', backgroundColor: COLORS.bg, borderRadius: RADIUS.md, borderWidth: 1, borderColor: 'rgba(79,142,247,0.4)', height: 48, paddingHorizontal: SPACING.sm },
  customInput:  { flex: 1, ...TYPOGRAPHY.h2, color: COLORS.text, textAlign: 'center' },
  customUnit:   { ...TYPOGRAPHY.label, color: COLORS.subtext },
  customAddBtn: { borderRadius: RADIUS.md, overflow: 'hidden', marginTop: SPACING.xs },
  customAddGrad:{ flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.sm + 2, gap: SPACING.xs },
  customAddTxt: { ...TYPOGRAPHY.body, fontWeight: '700', color: COLORS.white },
  streakCard:   { borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(255,152,0,0.3)', marginBottom: SPACING.md },
  streakGrad:   { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', padding: SPACING.md },
  streakLeft:   { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  streakFire:   { fontSize: 36 },
  streakNum:    { ...TYPOGRAPHY.displayMD, color: COLORS.orange, lineHeight: 32 },
  streakLbl:    { ...TYPOGRAPHY.caption, color: COLORS.subtext },
  streakBadge:  { backgroundColor: 'rgba(255,152,0,0.15)', borderRadius: RADIUS.round, paddingHorizontal: SPACING.sm, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(255,152,0,0.3)' },
  streakBadgeTxt: { ...TYPOGRAPHY.labelSM },
  statsRow:     { flexDirection: 'row', gap: SPACING.sm, marginBottom: SPACING.md },
  statCard:     { flex: 1, borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.cardBorder },
  statGrad:     { padding: SPACING.sm + 2, alignItems: 'center', gap: 3 },
  statIcon:     { width: 32, height: 32, borderRadius: 10, alignItems: 'center', justifyContent: 'center', marginBottom: 2 },
  statVal:      { fontSize: 18, fontWeight: '800' },
  statLbl:      { fontSize: 10, fontWeight: '600', color: COLORS.subtext, letterSpacing: 0.3 },
  statSub:      { ...TYPOGRAPHY.caption, color: COLORS.subtextDim, fontSize: 9 },
  logItem:      { borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.cardBorder },
  logItemGrad:  { flexDirection: 'row', alignItems: 'center', paddingVertical: SPACING.sm, paddingHorizontal: SPACING.md, gap: SPACING.sm },
  logDot:       { width: 28, height: 28, borderRadius: 14, alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(79,142,247,0.2)' },
  logAmt:       { ...TYPOGRAPHY.body, fontWeight: '700', color: COLORS.text, width: 54 },
  logType:      { ...TYPOGRAPHY.caption, color: COLORS.subtext, flex: 1 },
  logTime:      { ...TYPOGRAPHY.caption, color: COLORS.subtextDim },
});
// ============================================================
// WEEKLY BAR CHART
// ============================================================
const WeeklyBarChart = ({ logs, goal }) => {
  const BAR_MAX_H = 130;
  const last7     = getLastNDays(7);
  const today     = getTodayKey();
  const [selIdx, setSelIdx] = useState(null);

  const data = last7.map(dateKey => {
    const total   = logs[dateKey]?.total ?? 0;
    const percent = goal > 0 ? Math.min((total / goal) * 100, 100) : 0;
    return {
      dateKey, total, percent,
      goalMet: total >= goal && total > 0,
      isToday: dateKey === today,
      label: new Date(dateKey + 'T12:00:00')
        .toLocaleDateString('en', { weekday: 'short' }).slice(0, 2),
    };
  });

  const barAnims = useRef(data.map(() => new Animated.Value(0))).current;
  const barOps   = useRef(data.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    Animated.parallel(
      data.map((d, i) =>
        Animated.parallel([
          Animated.timing(barOps[i],   { toValue: 1,         duration: 300, delay: i * 60, useNativeDriver: true }),
          Animated.timing(barAnims[i], { toValue: d.percent, duration: 700, delay: i * 60, easing: Easing.out(Easing.back(1.1)), useNativeDriver: false }),
        ])
      )
    ).start();
  }, []);

  return (
    <View style={histSt.chartCard}>
      <LinearGradient colors={[COLORS.card, COLORS.bg]} style={histSt.chartGrad}>
        <View style={histSt.chartHdr}>
          <View>
            <Text style={histSt.chartTitle}>Weekly Overview</Text>
            <Text style={histSt.chartSub}>Last 7 days</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 5 }}>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.blue }} />
            <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.subtext, fontSize: 9 }}>Progress</Text>
            <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.green, marginLeft: 4 }} />
            <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.subtext, fontSize: 9 }}>Goal met</Text>
          </View>
        </View>

        <View style={[histSt.barsWrap, { height: 180 }]}>
          {[0.25, 0.5, 0.75, 1].map(f => (
            <View key={f} style={[histSt.gridLine, { bottom: f * BAR_MAX_H + 24 }]} />
          ))}

          {data.map((item, i) => {
            const barH = barAnims[i].interpolate({
              inputRange: [0, 100], outputRange: [4, BAR_MAX_H], extrapolate: 'clamp',
            });
            const isSel = selIdx === i;

            return (
              <Animated.View key={item.dateKey} style={[histSt.barCol, { opacity: barOps[i] }]}>
                {isSel && item.total > 0 && (
                  <View style={histSt.tooltip}>
                    <LinearGradient colors={[COLORS.card, '#0d0d1a']} style={histSt.tooltipGrad}>
                      <Text style={{ ...TYPOGRAPHY.caption, fontWeight: '700', fontSize: 11, color: item.goalMet ? COLORS.green : COLORS.blue }}>
                        {formatML(item.total)}
                      </Text>
                      <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.subtext, fontSize: 9 }}>
                        {Math.round(item.percent)}%
                      </Text>
                    </LinearGradient>
                    <View style={histSt.tooltipArrow} />
                  </View>
                )}

                <TouchableOpacity
                  activeOpacity={0.85}
                  onPress={() => setSelIdx(isSel ? null : i)}
                  style={{ alignItems: 'center', width: '100%' }}
                >
                  <View style={[histSt.barTrack, { height: BAR_MAX_H }]}>
                    {item.isToday && (
                      <View style={[histSt.todayRing, { height: BAR_MAX_H }]} />
                    )}
                    <Animated.View style={[histSt.barFill, { height: barH }]}>
                      <LinearGradient
                        colors={item.goalMet
                          ? [COLORS.green, '#00a152']
                          : [COLORS.blue, COLORS.blueDim]}
                        style={{ flex: 1, borderRadius: 8 }}
                        start={{ x: 0, y: 0 }} end={{ x: 0, y: 1 }}
                      />
                      <View style={histSt.barShine} />
                    </Animated.View>
                  </View>
                  <Text style={[histSt.barLbl, item.isToday && { color: COLORS.blue, fontWeight: '700' }]}>
                    {item.label}
                  </Text>
                  {item.isToday && <View style={histSt.todayDot} />}
                </TouchableOpacity>
              </Animated.View>
            );
          })}
        </View>
      </LinearGradient>
    </View>
  );
};

// ============================================================
// MONTHLY HEATMAP
// ============================================================
const MonthlyHeatmap = ({ logs, goal }) => {
  const monthDays = getDaysInCurrentMonth();
  const startDay  = getMonthStartWeekday();
  const today     = getTodayKey();
  const weekDays  = ['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'];
  const gridCells = [...Array(startDay).fill(null), ...monthDays];

  const cellAnims = useRef(
    gridCells.map(() => new Animated.Value(0))
  ).current;

  useEffect(() => {
    Animated.parallel(
      cellAnims.map((a, i) =>
        Animated.timing(a, {
          toValue: 1,
          duration: 280,
          delay: Math.min(i * 18, 500),
          easing: Easing.out(Easing.quad),
          useNativeDriver: true,
        })
      )
    ).start();
  }, []);

  const now       = new Date();
  const monthName = now.toLocaleDateString('en', { month: 'long', year: 'numeric' });

  return (
    <View style={histSt.chartCard}>
      <LinearGradient colors={[COLORS.card, COLORS.bg]} style={histSt.chartGrad}>
        <View style={histSt.chartHdr}>
          <View>
            <Text style={histSt.chartTitle}>Monthly Heatmap</Text>
            <Text style={histSt.chartSub}>{monthName}</Text>
          </View>
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 5, justifyContent: 'flex-end', maxWidth: 145 }}>
            {[
              { color: '#1e1e3a', label: '0%'   },
              { color: '#1a3a7a', label: '<50%' },
              { color: '#4f8ef7', label: '50%+' },
              { color: '#00e676', label: '100%' },
            ].map(({ color, label }) => (
              <View key={label} style={{ flexDirection: 'row', alignItems: 'center', gap: 3 }}>
                <View style={{ width: 10, height: 10, borderRadius: 2, backgroundColor: color }} />
                <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.subtext, fontSize: 9 }}>{label}</Text>
              </View>
            ))}
          </View>
        </View>

        {/* Weekday headers */}
        <View style={{ flexDirection: 'row', marginBottom: 4 }}>
          {weekDays.map(d => (
            <Text key={d} style={{ flex: 1, textAlign: 'center', ...TYPOGRAPHY.caption, color: COLORS.subtextDim, fontSize: 9 }}>
              {d}
            </Text>
          ))}
        </View>

        {/* Grid */}
        <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
          {gridCells.map((dateKey, i) => {
            if (!dateKey) {
              return <View key={`e${i}`} style={histSt.heatEmpty} />;
            }
            const total    = logs[dateKey]?.total ?? 0;
            const pct      = goal > 0 ? (total / goal) * 100 : 0;
            const isFuture = dateKey > today;
            const isToday  = dateKey === today;
            return (
              <Animated.View
                key={dateKey}
                style={[histSt.heatCell, {
                  backgroundColor: isFuture ? '#0d0d1a' : heatmapColor(pct),
                  opacity: cellAnims[i],
                  borderWidth: isToday ? 1.5 : 0,
                  borderColor: COLORS.blue,
                  transform: [{
                    scale: cellAnims[i].interpolate({
                      inputRange: [0, 1], outputRange: [0.6, 1],
                    }),
                  }],
                }]}
              >
                {pct >= 100 && !isFuture && (
                  <Text style={{ fontSize: 7, color: 'rgba(0,0,0,0.5)', fontWeight: '700' }}>✓</Text>
                )}
              </Animated.View>
            );
          })}
        </View>

        {/* Summary */}
        <View style={histSt.heatSumRow}>
          {[
            { label: 'Days logged', value: monthDays.filter(d => (logs[d]?.total ?? 0) > 0 && d <= today).length },
            { label: 'Goals hit',   value: monthDays.filter(d => (logs[d]?.total ?? 0) >= goal && d <= today).length },
            { label: 'Remaining',   value: monthDays.filter(d => d > today).length },
          ].map(({ label, value }) => (
            <View key={label} style={{ alignItems: 'center', gap: 2 }}>
              <Text style={{ ...TYPOGRAPHY.h2, color: COLORS.text }}>{value}</Text>
              <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.subtext, fontSize: 10 }}>{label}</Text>
            </View>
          ))}
        </View>
      </LinearGradient>
    </View>
  );
};

// ============================================================
// ACHIEVEMENT BADGE
// ============================================================
const AchievementBadge = ({ badge, unlocked, delay = 0 }) => {
  const sc      = useRef(new Animated.Value(0.7)).current;
  const op      = useRef(new Animated.Value(0)).current;
  const shimmer = useRef(new Animated.Value(-1)).current;
  const glow    = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(sc, { toValue: 1, tension: 65, friction: 7, delay, useNativeDriver: true }),
      Animated.timing(op, { toValue: 1, duration: 400, delay, useNativeDriver: true }),
    ]).start(() => {
      if (unlocked) {
        Animated.loop(
          Animated.sequence([
            Animated.timing(glow, { toValue: 1, duration: 1800, useNativeDriver: false }),
            Animated.timing(glow, { toValue: 0, duration: 1800, useNativeDriver: false }),
          ])
        ).start();
        Animated.loop(
          Animated.sequence([
            Animated.timing(shimmer, { toValue: 2, duration: 1600, easing: Easing.inOut(Easing.quad), useNativeDriver: true }),
            Animated.delay(2400),
            Animated.timing(shimmer, { toValue: -1, duration: 0, useNativeDriver: true }),
          ])
        ).start();
      }
    });
  }, [unlocked]);

  const shimTX = shimmer.interpolate({ inputRange: [-1, 2], outputRange: [-80, 80] });
  const glowBC = glow.interpolate({
    inputRange: [0, 1],
    outputRange: [badge.color + '22', badge.color + '55'],
  });

  return (
    <Animated.View style={[histSt.badgeWrap, { transform: [{ scale: sc }], opacity: op }]}>
      {unlocked && (
        <Animated.View style={[histSt.badgeGlowBorder, { borderColor: glowBC }]} />
      )}
      <LinearGradient
        colors={unlocked ? [badge.bgTop, badge.bgBot] : ['#0e0e1a', '#0a0a12']}
        style={histSt.badgeGrad}
      >
        {unlocked && (
          <Animated.View style={[StyleSheet.absoluteFill, { transform: [{ translateX: shimTX }] }]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.12)', 'transparent']}
              style={{ flex: 1 }}
              start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }}
            />
          </Animated.View>
        )}

        <View style={[histSt.badgeIconRing, {
          borderColor: unlocked ? badge.color + '55' : COLORS.cardBorder,
          backgroundColor: unlocked ? badge.color + '18' : COLORS.bg,
        }]}>
          <Text style={[{ fontSize: 30 }, !unlocked && { opacity: 0.4 }]}>
            {unlocked ? badge.emoji : '🔒'}
          </Text>
        </View>

        <Text style={[histSt.badgeName, { color: unlocked ? badge.color : COLORS.subtextDim }]}>
          {badge.name}
        </Text>
        <Text style={[histSt.badgeDesc, !unlocked && { color: COLORS.subtextDim + 'aa' }]}>
          {badge.desc}
        </Text>

        <View style={[histSt.badgePill, {
          backgroundColor: unlocked ? badge.color + '22' : COLORS.cardBorder + '44',
        }]}>
          <Text style={[histSt.badgePillTxt, { color: unlocked ? badge.color : COLORS.subtextDim }]}>
            {unlocked ? '✓ Earned' : 'Locked'}
          </Text>
        </View>

        {!unlocked && (
          <View style={[StyleSheet.absoluteFill, {
            borderRadius: RADIUS.lg, backgroundColor: 'rgba(6,6,15,0.45)',
          }]} />
        )}
      </LinearGradient>
    </Animated.View>
  );
};

// ============================================================
// HISTORY SCREEN
// ============================================================
const HistoryScreen = ({ logs = {}, goal, streak, onNavigate, onRefresh }) => {
  const insets = useSafeAreaInsets();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const headerY   = useRef(new Animated.Value(-20)).current;
  const headerOp  = useRef(new Animated.Value(0)).current;
  const contentOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const t = setTimeout(() => {
      setIsLoading(false);
      Animated.parallel([
        Animated.timing(headerY,   { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
        Animated.timing(headerOp,  { toValue: 1, duration: 500, useNativeDriver: true }),
        Animated.timing(contentOp, { toValue: 1, duration: 700, delay: 200, useNativeDriver: true }),
      ]).start();
    }, 600);
    return () => clearTimeout(t);
  }, []);

  const handleRefresh = useCallback(async () => {
    setRefreshing(true);
    await onRefresh?.();
    setTimeout(() => setRefreshing(false), 800);
  }, [onRefresh]);

  const stats = useMemo(() => {
    const keys    = Object.keys(logs).sort();
    const totalML = keys.reduce((s, k) => s + (logs[k]?.total ?? 0), 0);
    const totalLogs = keys.reduce((s, k) => s + (logs[k]?.entries?.length ?? 0), 0);
    const now     = new Date();
    const mp      = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const goalsThisMonth = keys.filter(
      k => k.startsWith(mp) && (logs[k]?.total ?? 0) >= goal
    ).length;
    const weeklyAvg = Math.round(
      getLastNDays(7).reduce((s, k) => s + (logs[k]?.total ?? 0), 0) / 7
    );
    let best = 0, cur = 0;
    for (const day of getLastNDays(90)) {
      (logs[day]?.total ?? 0) >= goal ? (cur++, best = Math.max(best, cur)) : (cur = 0);
    }
    return {
      totalML, totalLogs, goalsThisMonth, weeklyAvg,
      bestStreak: Math.max(best, streak ?? 0),
    };
  }, [logs, goal, streak]);

  if (isLoading) {
    return (
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        <SafeAreaView>
          <View style={{ padding: SPACING.md }}>
            <Text style={histSt.pageTitle}>Your History</Text>
          </View>
        </SafeAreaView>
        <HistorySkeleton />
        <TabBar activeScreen={SCREENS.HISTORY} onNavigate={onNavigate} />
      </View>
    );
  }

  const hasData = Object.values(logs).some(l => (l?.total ?? 0) > 0);

  const statCards = [
    { emoji: '🔥', label: 'Best Streak',    value: `${stats.bestStreak}d`,              sub: stats.bestStreak >= 7 ? 'Incredible!' : 'Keep going', color: COLORS.orange },
    { emoji: '💧', label: 'Total',          value: `${(stats.totalML / 1000).toFixed(1)}L`, sub: `${stats.totalLogs} logs`, color: COLORS.blue },
    { emoji: '🎯', label: 'Goals/Month',    value: `${stats.goalsThisMonth}`,            sub: 'days hit',   color: COLORS.green },
    { emoji: '📊', label: 'Weekly Avg',     value: formatML(stats.weeklyAvg),            sub: 'per day',    color: COLORS.cyan  },
  ];

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView
          contentContainerStyle={[histSt.scroll, { paddingBottom: 90 + insets.bottom }]}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={COLORS.blue}
              colors={[COLORS.blue]}
            />
          }
        >
          {/* Page header */}
          <Animated.View style={[histSt.pageHdr, {
            transform: [{ translateY: headerY }], opacity: headerOp,
          }]}>
            <View>
              <Text style={histSt.pageTitle}>Your History</Text>
              <Text style={histSt.pageSub}>Progress tracked, goals visualised</Text>
            </View>
            <View style={histSt.headerBadge}>
              <LinearGradient
                colors={['rgba(79,142,247,0.18)', 'rgba(79,142,247,0.06)']}
                style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}
              >
                <Ionicons name="analytics" size={18} color={COLORS.blue} />
              </LinearGradient>
            </View>
          </Animated.View>

          <Animated.View style={{ opacity: contentOp }}>
            {/* Stats */}
            <View style={histSt.sectionHdr}>
              <Text style={histSt.sectionTitle}>Overview</Text>
              <View style={histSt.sectionLine} />
            </View>
            <View style={histSt.statsGrid}>
              {statCards.map(s => (
                <View key={s.label} style={histSt.statCard}>
                  <LinearGradient colors={[COLORS.card, COLORS.bg]} style={histSt.statGrad}>
                    <View style={[histSt.statAccent, { backgroundColor: s.color }]} />
                    <Text style={{ fontSize: 22, marginBottom: 2, marginTop: 4 }}>{s.emoji}</Text>
                    <Text style={{ fontSize: 26, fontWeight: '800', color: s.color }}>{s.value}</Text>
                    <Text style={{ ...TYPOGRAPHY.label, fontSize: 10, color: COLORS.subtext }}>{s.label}</Text>
                    <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.subtextDim, fontSize: 10 }}>{s.sub}</Text>
                  </LinearGradient>
                </View>
              ))}
            </View>

            {/* Charts */}
            {hasData ? (
              <>
                <View style={histSt.sectionHdr}>
                  <Text style={histSt.sectionTitle}>7-Day Chart</Text>
                  <View style={histSt.sectionLine} />
                </View>
                <WeeklyBarChart logs={logs} goal={goal} />

                <View style={histSt.sectionHdr}>
                  <Text style={histSt.sectionTitle}>Monthly Activity</Text>
                  <View style={histSt.sectionLine} />
                </View>
                <MonthlyHeatmap logs={logs} goal={goal} />
              </>
            ) : (
              <EmptyState
                emoji="📊"
                title="No data yet"
                sub="Start logging water to see your charts and progress over time."
              />
            )}

            {/* Achievements */}
            <View style={histSt.sectionHdr}>
              <Text style={histSt.sectionTitle}>Achievements</Text>
              <View style={histSt.sectionLine} />
              <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.blue }}>
                {BADGE_DEFS.filter(b => b.check(stats)).length}/{BADGE_DEFS.length}
              </Text>
            </View>

            {/* Progress bar */}
            <View style={{ marginBottom: SPACING.md }}>
              <View style={histSt.achieveTrack}>
                <View style={[histSt.achieveFill, {
                  width: `${(BADGE_DEFS.filter(b => b.check(stats)).length / BADGE_DEFS.length) * 100}%`,
                }]}>
                  <LinearGradient
                    colors={[COLORS.blue, COLORS.green]}
                    style={{ flex: 1, borderRadius: 3 }}
                    start={{ x: 0, y: 0.5 }} end={{ x: 1, y: 0.5 }}
                  />
                </View>
              </View>
              <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.subtext, fontSize: 10, textAlign: 'right', marginTop: 4 }}>
                {BADGE_DEFS.filter(b => b.check(stats)).length} of {BADGE_DEFS.length} badges earned
              </Text>
            </View>

            <View style={histSt.badgesGrid}>
              {BADGE_DEFS.map((b, i) => (
                <AchievementBadge key={b.id} badge={b} unlocked={b.check(stats)} delay={i * 100} />
              ))}
            </View>

            {/* Recent days */}
            {hasData && (
              <>
                <View style={histSt.sectionHdr}>
                  <Text style={histSt.sectionTitle}>Recent Days</Text>
                  <View style={histSt.sectionLine} />
                </View>
                {getLastNDays(7).reverse().map(dateKey => {
                  const total   = logs[dateKey]?.total   ?? 0;
                  const entries = logs[dateKey]?.entries  ?? [];
                  if (total === 0) return null;
                  const pct     = goal > 0 ? Math.min((total / goal) * 100, 100) : 0;
                  const goalMet = total >= goal;
                  const isToday = dateKey === getTodayKey();
                  const label   = isToday
                    ? 'Today'
                    : new Date(dateKey + 'T12:00:00').toLocaleDateString('en', {
                        weekday: 'long', month: 'short', day: 'numeric',
                      });
                  return (
                    <View key={dateKey} style={histSt.dayCard}>
                      <LinearGradient colors={[COLORS.card, COLORS.bg]} style={histSt.dayCardGrad}>
                        <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                          <View>
                            <Text style={[histSt.dayDate, isToday && { color: COLORS.blue }]}>{label}</Text>
                            <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.subtext }}>
                              {formatML(total)} · {Math.round(pct)}%
                            </Text>
                          </View>
                          {goalMet && (
                            <View style={histSt.goalMetBadge}>
                              <LinearGradient
                                colors={['rgba(0,230,118,0.22)', 'rgba(0,230,118,0.07)']}
                                style={{ flexDirection: 'row', alignItems: 'center', paddingHorizontal: SPACING.sm, paddingVertical: 3, gap: 3 }}
                              >
                                <Ionicons name="checkmark-circle" size={13} color={COLORS.green} />
                                <Text style={{ ...TYPOGRAPHY.labelSM, color: COLORS.green, fontSize: 9 }}>Goal</Text>
                              </LinearGradient>
                            </View>
                          )}
                        </View>
                        <View style={histSt.dayBar}>
                          <View style={[histSt.dayBarFill, {
                            width: `${pct}%`,
                            backgroundColor: goalMet ? COLORS.green : COLORS.blue,
                          }]} />
                        </View>
                        <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 4, marginTop: SPACING.xs }}>
                          {entries.slice(0, 6).map((e, ei) => (
                            <View key={ei} style={histSt.entryPill}>
                              <Ionicons name="water-outline" size={10} color={COLORS.blue} />
                              <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.blue, fontSize: 10, fontWeight: '600' }}>
                                {e.ml}ml
                              </Text>
                            </View>
                          ))}
                          {entries.length > 6 && (
                            <View style={[histSt.entryPill, { backgroundColor: COLORS.cardHover }]}>
                              <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.subtext, fontSize: 10 }}>
                                +{entries.length - 6}
                              </Text>
                            </View>
                          )}
                        </View>
                      </LinearGradient>
                    </View>
                  );
                })}
              </>
            )}
          </Animated.View>
        </ScrollView>
      </SafeAreaView>
      <TabBar activeScreen={SCREENS.HISTORY} onNavigate={onNavigate} />
    </View>
  );
};

const histSt = StyleSheet.create({
  scroll:   { paddingHorizontal: SPACING.md, paddingTop: SPACING.xs },
  pageHdr:  { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: SPACING.sm, marginBottom: SPACING.md },
  pageTitle:{ ...TYPOGRAPHY.h1, color: COLORS.text },
  pageSub:  { ...TYPOGRAPHY.caption, color: COLORS.subtext, marginTop: 2 },
  headerBadge: { borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(79,142,247,0.3)' },
  sectionHdr:   { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.sm },
  sectionTitle: { ...TYPOGRAPHY.label, color: COLORS.subtext, flexShrink: 0 },
  sectionLine:  { flex: 1, height: 1, backgroundColor: 'rgba(79,142,247,0.25)' },
  statsGrid:  { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  statCard:   { width: (DEVICE.width - SPACING.md * 2 - SPACING.sm) / 2, borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.cardBorder },
  statGrad:   { padding: SPACING.md, alignItems: 'flex-start', gap: 3, position: 'relative' },
  statAccent: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, borderTopLeftRadius: RADIUS.lg, borderTopRightRadius: RADIUS.lg },
  chartCard:  { borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.lg },
  chartGrad:  { padding: SPACING.md },
  chartHdr:   { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: SPACING.sm },
  chartTitle: { ...TYPOGRAPHY.h3, color: COLORS.text },
  chartSub:   { ...TYPOGRAPHY.caption, color: COLORS.subtext, marginTop: 1 },
  barsWrap:   { flexDirection: 'row', alignItems: 'flex-end', justifyContent: 'space-between', paddingTop: SPACING.xs, position: 'relative' },
  gridLine:   { position: 'absolute', left: 0, right: 0, height: 1, backgroundColor: COLORS.cardBorder + '55' },
  barCol:     { flex: 1, alignItems: 'center', justifyContent: 'flex-end', paddingBottom: 24, position: 'relative' },
  barTrack:   { width: 28, borderRadius: 8, backgroundColor: COLORS.cardBorder + '44', justifyContent: 'flex-end', overflow: 'hidden', position: 'relative' },
  todayRing:  { position: 'absolute', left: -2, right: -2, top: 0, borderRadius: 10, borderWidth: 1.5, borderColor: 'rgba(79,142,247,0.5)', zIndex: 1 },
  barFill:    { width: '100%', borderRadius: 8, overflow: 'hidden', position: 'relative' },
  barShine:   { position: 'absolute', top: 4, left: 6, width: 4, borderRadius: 2, bottom: 4, backgroundColor: 'rgba(255,255,255,0.15)' },
  barLbl:     { ...TYPOGRAPHY.caption, color: COLORS.subtext, fontSize: 10, marginTop: 4 },
  todayDot:   { width: 4, height: 4, borderRadius: 2, backgroundColor: COLORS.blue, marginTop: 2 },
  tooltip:    { position: 'absolute', top: -60, alignItems: 'center', zIndex: 10 },
  tooltipGrad:{ paddingHorizontal: SPACING.sm, paddingVertical: 4, borderRadius: RADIUS.sm, alignItems: 'center', borderWidth: 1, borderColor: COLORS.cardBorder, minWidth: 60 },
  tooltipArrow: { width: 0, height: 0, borderLeftWidth: 6, borderRightWidth: 6, borderTopWidth: 6, borderLeftColor: 'transparent', borderRightColor: 'transparent', borderTopColor: COLORS.card },
  heatEmpty:  { width: `${100 / 7}%`, aspectRatio: 1, padding: 2 },
  heatCell:   { width: `${100 / 7}%`, aspectRatio: 1, padding: 2, alignItems: 'center', justifyContent: 'center', borderRadius: 3 },
  heatSumRow: { flexDirection: 'row', justifyContent: 'space-around', marginTop: SPACING.md, paddingTop: SPACING.sm, borderTopWidth: 1, borderTopColor: COLORS.cardBorder },
  achieveTrack: { height: 6, borderRadius: 3, backgroundColor: COLORS.cardBorder, overflow: 'hidden' },
  achieveFill:  { height: '100%', borderRadius: 3, overflow: 'hidden' },
  badgesGrid:   { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm, marginBottom: SPACING.lg },
  badgeWrap:    { width: (DEVICE.width - SPACING.md * 2 - SPACING.sm) / 2, borderRadius: RADIUS.lg, overflow: 'hidden', position: 'relative' },
  badgeGlowBorder: { ...StyleSheet.absoluteFillObject, borderRadius: RADIUS.lg, borderWidth: 1.5, zIndex: 2 },
  badgeGrad:    { padding: SPACING.md, alignItems: 'center', gap: SPACING.xs, borderWidth: 1, borderColor: COLORS.cardBorder, borderRadius: RADIUS.lg, overflow: 'hidden', minHeight: 170, justifyContent: 'center' },
  badgeIconRing:{ width: 60, height: 60, borderRadius: 30, borderWidth: 1.5, alignItems: 'center', justifyContent: 'center', marginBottom: 4 },
  badgeName:    { ...TYPOGRAPHY.body, fontWeight: '700', textAlign: 'center' },
  badgeDesc:    { ...TYPOGRAPHY.caption, color: COLORS.subtext, textAlign: 'center', lineHeight: 15 },
  badgePill:    { paddingHorizontal: SPACING.sm, paddingVertical: 3, borderRadius: RADIUS.round, marginTop: 4 },
  badgePillTxt: { ...TYPOGRAPHY.labelSM, fontSize: 9 },
  dayCard:      { borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.sm },
  dayCardGrad:  { padding: SPACING.md, gap: SPACING.xs },
  dayDate:      { ...TYPOGRAPHY.body, fontWeight: '600', color: COLORS.text },
  goalMetBadge: { borderRadius: RADIUS.round, overflow: 'hidden', borderWidth: 1, borderColor: 'rgba(0,230,118,0.3)' },
  dayBar:       { height: 4, borderRadius: 2, backgroundColor: COLORS.cardBorder, overflow: 'hidden', marginTop: 4 },
  dayBarFill:   { height: '100%', borderRadius: 2 },
  entryPill:    { flexDirection: 'row', alignItems: 'center', gap: 3, backgroundColor: 'rgba(79,142,247,0.12)', borderRadius: RADIUS.round, paddingHorizontal: 7, paddingVertical: 3, borderWidth: 1, borderColor: 'rgba(79,142,247,0.22)' },
});
const RemindersScreen = ({ reminderPrefs, onSave, onNavigate }) => {
  const insets = useSafeAreaInsets();
  const [enabled, setEnabled] = useState(reminderPrefs?.enabled ?? true);
  const [interval, setInterval] = useState(reminderPrefs?.intervalMins ?? 90);
  const [startHour, setStartHour] = useState(reminderPrefs?.startHour ?? 8);
  const [endHour, setEndHour] = useState(reminderPrefs?.endHour ?? 22);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const headerY = useRef(new Animated.Value(-20)).current;
  const headerOp = useRef(new Animated.Value(0)).current;
  const toggleScale = useRef(new Animated.Value(1)).current;
  const saveScale = useRef(new Animated.Value(1)).current;
  const savedOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerY, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(headerOp, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const INTERVALS = [
    { label: 'Every 1hr', mins: 60 }, { label: 'Every 2hr', mins: 120 },
    { label: 'Every 3hr', mins: 180 }, { label: 'Every 4hr', mins: 240 },
  ];

  const startHours = Array.from({ length: 12 }, (_, i) => i + 6);
  const endHours = Array.from({ length: 12 }, (_, i) => i + 14);

  const formatHour = (h) => {
    const ampm = h >= 12 ? 'PM' : 'AM';
    const h12 = h > 12 ? h - 12 : h === 0 ? 12 : h;
    return `${h12}:00 ${ampm}`;
  };

  const totalMins = endHour * 60 - startHour * 60;
  const remindersCount = Math.max(0, Math.floor(totalMins / interval));

  const handleToggle = (val) => {
    Animated.sequence([
      Animated.timing(toggleScale, { toValue: 0.9, duration: 80, useNativeDriver: true }),
      Animated.spring(toggleScale, { toValue: 1, tension: 100, friction: 5, useNativeDriver: true }),
    ]).start();
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
    setEnabled(val);
  };

  const handleSave = async () => {
    setSaving(true);
    Animated.sequence([
      Animated.timing(saveScale, { toValue: 0.95, duration: 80, useNativeDriver: true }),
      Animated.spring(saveScale, { toValue: 1, tension: 80, friction: 5, useNativeDriver: true }),
    ]).start();
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);

    const prefs = { enabled, intervalMins: interval, startHour, endHour, sound: true, vibration: true };
    try {
      await AsyncStorage.setItem(STORAGE_KEYS.REMINDER_PREFS, JSON.stringify(prefs));
      // Cancel existing, schedule new if enabled
      await Notifications.cancelAllScheduledNotificationsAsync();
      if (enabled && remindersCount > 0) {
        for (let i = 0; i < remindersCount; i++) {
          const triggerMin = startHour * 60 + interval * (i + 1);
          if (triggerMin < endHour * 60) {
            await Notifications.scheduleNotificationAsync({
              content: { title: '💧 HydroTrack', body: "Time to hydrate! Don't forget to drink some water.", sound: true },
              trigger: { hour: Math.floor(triggerMin / 60), minute: triggerMin % 60, repeats: true },
            });
          }
        }
      }
      onSave?.(prefs);
    } catch (_) {}

    setSaving(false);
    setSaved(true);
    Animated.timing(savedOp, { toValue: 1, duration: 300, useNativeDriver: true }).start();
    setTimeout(() => {
      Animated.timing(savedOp, { toValue: 0, duration: 300, useNativeDriver: true }).start(() => setSaved(false));
    }, 2000);
  };

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[remSt.scroll, { paddingBottom: 90 + insets.bottom }]} showsVerticalScrollIndicator={false}>

          <Animated.View style={[remSt.pageHdr, { transform: [{ translateY: headerY }], opacity: headerOp }]}>
            <View>
              <Text style={remSt.pageTitle}>Reminders</Text>
              <Text style={remSt.pageSub}>Stay hydrated with smart notifications</Text>
            </View>
            <View style={[remSt.headerIcon, { borderColor: COLORS.blue + '33' }]}>
              <LinearGradient colors={[COLORS.blue + '22', COLORS.blue + '0a']} style={{ width: 44, height: 44, alignItems: 'center', justifyContent: 'center' }}>
                <Ionicons name="notifications" size={18} color={COLORS.blue} />
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Master Toggle */}
          <View style={remSt.card}>
            <LinearGradient colors={[COLORS.card, COLORS.bg]} style={remSt.cardGrad}>
              <View style={remSt.toggleRow}>
                <View style={{ flex: 1 }}>
                  <Text style={remSt.settingTitle}>Enable Reminders</Text>
                  <Text style={remSt.settingDesc}>Receive hydration nudges throughout the day</Text>
                </View>
                <Animated.View style={{ transform: [{ scale: toggleScale }] }}>
                  <Switch
                    value={enabled}
                    onValueChange={handleToggle}
                    trackColor={{ false: COLORS.cardBorder, true: COLORS.blue + '88' }}
                    thumbColor={enabled ? COLORS.blue : COLORS.subtext}
                    ios_backgroundColor={COLORS.cardBorder}
                  />
                </Animated.View>
              </View>
            </LinearGradient>
          </View>

          {/* Content */}
          <Animated.View style={{ opacity: enabled ? 1 : 0.4 }} pointerEvents={enabled ? 'auto' : 'none'}>

            {/* Interval Selector */}
            <View style={remSt.sectionHdr}>
              <Text style={remSt.sectionTitle}>Reminder Interval</Text>
              <View style={remSt.sectionLine} />
            </View>
            <View style={remSt.card}>
              <LinearGradient colors={[COLORS.card, COLORS.bg]} style={remSt.cardGrad}>
                <View style={remSt.intervalGrid}>
                  {INTERVALS.map(iv => {
                    const sel = interval === iv.mins;
                    return (
                      <PressScale key={iv.mins} onPress={() => setInterval(iv.mins)} style={remSt.intervalBtn}>
                        <LinearGradient
                          colors={sel ? [COLORS.blue + '33', COLORS.blue + '15'] : [COLORS.cardHover, COLORS.card]}
                          style={[remSt.intervalBtnGrad, { borderColor: sel ? COLORS.blue : COLORS.cardBorder }]}
                        >
                          <Ionicons name="time-outline" size={18} color={sel ? COLORS.blue : COLORS.subtext} />
                          <Text style={[remSt.intervalLabel, { color: sel ? COLORS.blue : COLORS.subtext }]}>{iv.label}</Text>
                        </LinearGradient>
                      </PressScale>
                    );
                  })}
                </View>
              </LinearGradient>
            </View>

            {/* Time Range */}
            <View style={remSt.sectionHdr}>
              <Text style={remSt.sectionTitle}>Active Hours</Text>
              <View style={remSt.sectionLine} />
            </View>
            <View style={remSt.card}>
              <LinearGradient colors={[COLORS.card, COLORS.bg]} style={remSt.cardGrad}>
                {/* Start Time */}
                <View style={remSt.timeSection}>
                  <View style={remSt.timeLabelRow}>
                    <Ionicons name="sunny-outline" size={16} color={COLORS.orange} />
                    <Text style={remSt.timeLabel}>Start Time</Text>
                    <Text style={remSt.timeValue}>{formatHour(startHour)}</Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={remSt.timeScroll}>
                    {startHours.map(h => {
                      const sel = startHour === h;
                      return (
                        <PressScale key={h} onPress={() => setStartHour(h)}>
                          <LinearGradient
                            colors={sel ? [COLORS.orange + '33', COLORS.orange + '15'] : [COLORS.cardHover, COLORS.card]}
                            style={[remSt.timeChip, { borderColor: sel ? COLORS.orange : COLORS.cardBorder }]}
                          >
                            <Text style={[remSt.timeChipText, { color: sel ? COLORS.orange : COLORS.subtext }]}>{formatHour(h)}</Text>
                          </LinearGradient>
                        </PressScale>
                      );
                    })}
                  </ScrollView>
                </View>

                <View style={remSt.timeDivider} />

                {/* End Time */}
                <View style={remSt.timeSection}>
                  <View style={remSt.timeLabelRow}>
                    <Ionicons name="moon-outline" size={16} color={COLORS.blue} />
                    <Text style={remSt.timeLabel}>End Time</Text>
                    <Text style={remSt.timeValue}>{formatHour(endHour)}</Text>
                  </View>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={remSt.timeScroll}>
                    {endHours.map(h => {
                      const sel = endHour === h;
                      return (
                        <PressScale key={h} onPress={() => setEndHour(h)}>
                          <LinearGradient
                            colors={sel ? [COLORS.blue + '33', COLORS.blue + '15'] : [COLORS.cardHover, COLORS.card]}
                            style={[remSt.timeChip, { borderColor: sel ? COLORS.blue : COLORS.cardBorder }]}
                          >
                            <Text style={[remSt.timeChipText, { color: sel ? COLORS.blue : COLORS.subtext }]}>{formatHour(h)}</Text>
                          </LinearGradient>
                        </PressScale>
                      );
                    })}
                  </ScrollView>
                </View>
              </LinearGradient>
            </View>

            {/* Preview */}
            <View style={remSt.previewCard}>
              <LinearGradient colors={['#0d1e3d', '#091226']} style={remSt.previewGrad}>
                <View style={remSt.previewTopLine} />
                <View style={remSt.previewRow}>
                  <View style={remSt.previewIconBg}>
                    <Text style={{ fontSize: 24 }}>🔔</Text>
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={remSt.previewTitle}>
                      You'll get <Text style={{ color: COLORS.blue, fontWeight: '800' }}>{remindersCount}</Text> reminders today
                    </Text>
                    <Text style={remSt.previewSub}>
                      Between {formatHour(startHour)} and {formatHour(endHour)}, every {interval >= 60 ? `${interval / 60}h` : `${interval}m`}
                    </Text>
                  </View>
                </View>
                <View style={remSt.previewTimeline}>
                  {Array.from({ length: Math.min(remindersCount, 8) }).map((_, i) => (
                    <View key={i} style={remSt.previewDot}>
                      <LinearGradient colors={[COLORS.blue, COLORS.cyan]} style={remSt.previewDotInner} />
                    </View>
                  ))}
                  {remindersCount > 8 && (
                    <Text style={{ ...TYPOGRAPHY.caption, color: COLORS.subtext, marginLeft: 4 }}>+{remindersCount - 8} more</Text>
                  )}
                </View>
              </LinearGradient>
            </View>
          </Animated.View>

          {/* Save Button */}
          <Animated.View style={[remSt.saveWrap, { transform: [{ scale: saveScale }] }]}>
            <PressScale onPress={handleSave} style={remSt.saveBtn}>
              <LinearGradient colors={saving ? [COLORS.cardHover, COLORS.card] : [COLORS.blue, COLORS.blueDim]} style={remSt.saveBtnGrad}>
                {saving ? (
                  <ActivityIndicator color={COLORS.blue} size="small" />
                ) : (
                  <>
                    <Ionicons name="checkmark-circle" size={20} color={COLORS.white} />
                    <Text style={remSt.saveBtnText}>Save Reminders</Text>
                  </>
                )}
              </LinearGradient>
            </PressScale>
          </Animated.View>

          {/* Saved confirmation */}
          {saved && (
            <Animated.View style={[remSt.savedBanner, { opacity: savedOp }]}>
              <LinearGradient colors={[COLORS.green + '22', COLORS.green + '0a']} style={remSt.savedBannerGrad}>
                <Ionicons name="checkmark-circle" size={16} color={COLORS.green} />
                <Text style={remSt.savedBannerText}>Reminders saved successfully!</Text>
              </LinearGradient>
            </Animated.View>
          )}

        </ScrollView>
      </SafeAreaView>
      <TabBar activeScreen={SCREENS.REMINDERS} onNavigate={onNavigate} />
    </View>
  );
};

const remSt = StyleSheet.create({
  scroll: { paddingHorizontal: SPACING.md, paddingTop: SPACING.xs },
  pageHdr: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: SPACING.sm, marginBottom: SPACING.lg },
  pageTitle: { ...TYPOGRAPHY.h1, color: COLORS.text },
  pageSub: { ...TYPOGRAPHY.caption, color: COLORS.subtext, marginTop: 2 },
  headerIcon: { borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1 },
  card: { borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.md },
  cardGrad: { padding: SPACING.md },
  toggleRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  settingTitle: { ...TYPOGRAPHY.body, fontWeight: '600', color: COLORS.text },
  settingDesc: { ...TYPOGRAPHY.caption, color: COLORS.subtext, marginTop: 2 },
  sectionHdr: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.sm },
  sectionTitle: { ...TYPOGRAPHY.label, color: COLORS.subtext, flexShrink: 0 },
  sectionLine: { flex: 1, height: 1, backgroundColor: COLORS.blue + '30' },
  intervalGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: SPACING.sm },
  intervalBtn: { width: (DEVICE.width - SPACING.md * 2 - SPACING.md * 2 - SPACING.sm) / 2, borderRadius: RADIUS.md, overflow: 'hidden' },
  intervalBtnGrad: { paddingVertical: SPACING.md, paddingHorizontal: SPACING.sm, alignItems: 'center', gap: SPACING.xs, borderWidth: 1.5, borderRadius: RADIUS.md },
  intervalLabel: { ...TYPOGRAPHY.body, fontWeight: '600', fontSize: 13 },
  timeSection: { gap: SPACING.sm },
  timeLabelRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.xs },
  timeLabel: { ...TYPOGRAPHY.body, fontWeight: '600', color: COLORS.text, flex: 1 },
  timeValue: { ...TYPOGRAPHY.label, color: COLORS.blue, fontSize: 11 },
  timeScroll: { gap: SPACING.sm, paddingVertical: SPACING.xs },
  timeChip: { paddingHorizontal: SPACING.md, paddingVertical: SPACING.sm, borderRadius: RADIUS.round, borderWidth: 1.5 },
  timeChipText: { ...TYPOGRAPHY.body, fontWeight: '600', fontSize: 12 },
  timeDivider: { height: 1, backgroundColor: COLORS.cardBorder, marginVertical: SPACING.md },
  previewCard: { borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1.5, borderColor: COLORS.blue + '44', marginBottom: SPACING.md, ...SHADOWS.blue },
  previewGrad: { padding: SPACING.md, gap: SPACING.sm },
  previewTopLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: COLORS.blue, opacity: 0.6 },
  previewRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md },
  previewIconBg: { width: 48, height: 48, borderRadius: 24, backgroundColor: COLORS.blue + '18', alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.blue + '33' },
  previewTitle: { ...TYPOGRAPHY.body, fontWeight: '600', color: COLORS.text },
  previewSub: { ...TYPOGRAPHY.caption, color: COLORS.subtext, marginTop: 2 },
  previewTimeline: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 8, paddingTop: SPACING.xs },
  previewDot: { width: 12, height: 12, borderRadius: 6, overflow: 'hidden' },
  previewDotInner: { flex: 1 },
  saveWrap: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.md, ...SHADOWS.blue },
  saveBtn: { borderRadius: RADIUS.lg, overflow: 'hidden' },
  saveBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md + 2, gap: SPACING.sm },
  saveBtnText: { ...TYPOGRAPHY.body, fontWeight: '800', color: COLORS.white, fontSize: 16 },
  savedBanner: { borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.green + '33', marginBottom: SPACING.md },
  savedBannerGrad: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.sm },
  savedBannerText: { ...TYPOGRAPHY.body, color: COLORS.green, fontWeight: '600' },
});

// ============================================================
// SETTINGS SCREEN
// ============================================================
const SettingsScreen = ({ profile, onSaveProfile, onNavigate, onResetOnboarding }) => {
  const insets = useSafeAreaInsets();
  const [name, setName] = useState(profile?.name ?? '');
  const [weight, setWeight] = useState(String(profile?.weight ?? 70));
  const [goal, setGoal] = useState(profile?.dailyGoal ?? 2500);
  const [saving, setSaving] = useState(false);

  const headerY = useRef(new Animated.Value(-20)).current;
  const headerOp = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(headerY, { toValue: 0, duration: 500, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(headerOp, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();
  }, []);

  const handleSave = async () => {
    setSaving(true);
    Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
    const updated = { ...profile, name: name.trim() || 'Friend', weight: parseFloat(weight) || 70, dailyGoal: goal };
    try { await AsyncStorage.setItem(STORAGE_KEYS.USER_PROFILE, JSON.stringify(updated)); } catch (_) {}
    onSaveProfile?.(updated);
    setTimeout(() => setSaving(false), 800);
  };

  const SettingRow = ({ icon, label, value, color = COLORS.blue, onPress }) => (
    <PressScale onPress={onPress} style={settSt.settingRow}>
      <LinearGradient colors={[COLORS.card, COLORS.bg]} style={settSt.settingRowGrad}>
        <View style={[settSt.settingIcon, { backgroundColor: color + '18' }]}>
          <Ionicons name={icon} size={18} color={color} />
        </View>
        <Text style={settSt.settingLabel}>{label}</Text>
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: SPACING.xs }}>
          {value && <Text style={settSt.settingValue}>{value}</Text>}
          <Ionicons name="chevron-forward" size={16} color={COLORS.subtextDim} />
        </View>
      </LinearGradient>
    </PressScale>
  );

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
      <StatusBar barStyle="light-content" />
      <SafeAreaView style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={[settSt.scroll, { paddingBottom: 90 + insets.bottom }]} showsVerticalScrollIndicator={false}>

          <Animated.View style={[settSt.pageHdr, { transform: [{ translateY: headerY }], opacity: headerOp }]}>
            <View>
              <Text style={settSt.pageTitle}>Settings</Text>
              <Text style={settSt.pageSub}>Customise your HydroTrack experience</Text>
            </View>
          </Animated.View>

          {/* Profile Card */}
          <View style={settSt.profileCard}>
            <LinearGradient colors={['#0d1e3d', '#091226']} style={settSt.profileGrad}>
              <View style={settSt.profileTopLine} />
              <View style={settSt.avatarLarge}>
                <LinearGradient colors={[COLORS.blue + '44', COLORS.blue + '22']} style={settSt.avatarGrad}>
                  <Text style={{ fontSize: 32 }}>{name.charAt(0).toUpperCase() || '💧'}</Text>
                </LinearGradient>
              </View>
              <Text style={settSt.profileName}>{name || 'Hydration Hero'}</Text>
              <Text style={settSt.profileGoal}>Daily goal: {formatML(goal)}</Text>
            </LinearGradient>
          </View>

          {/* Profile Fields */}
          <View style={settSt.sectionHdr}><Text style={settSt.sectionTitle}>Profile</Text><View style={settSt.sectionLine} /></View>
          <View style={settSt.card}>
            <LinearGradient colors={[COLORS.card, COLORS.bg]} style={settSt.cardGrad}>
              <AnimatedInput value={name} onChangeText={setName} placeholder="Your name" />
              <View style={{ height: SPACING.md }} />
              <AnimatedInput value={weight} onChangeText={v => { if (/^\d*\.?\d*$/.test(v)) setWeight(v); }} placeholder="Body weight" suffix="kg" keyboardType="decimal-pad" />
            </LinearGradient>
          </View>

          {/* Daily Goal */}
          <View style={settSt.sectionHdr}><Text style={settSt.sectionTitle}>Daily Goal</Text><View style={settSt.sectionLine} /></View>
          <View style={settSt.card}>
            <LinearGradient colors={[COLORS.card, COLORS.bg]} style={settSt.cardGrad}>
              <Text style={settSt.goalLabel}>Target daily intake</Text>
              <View style={settSt.goalRow}>
                <PressScale onPress={() => setGoal(g => Math.max(1000, g - 250))}>
                  <View style={settSt.goalStepBtn}><Ionicons name="remove" size={22} color={COLORS.blue} /></View>
                </PressScale>
                <LinearGradient colors={[COLORS.blue + '18', COLORS.blue + '08']} style={settSt.goalDisplay}>
                  <Text style={settSt.goalNum}>{formatML(goal)}</Text>
                </LinearGradient>
                <PressScale onPress={() => setGoal(g => Math.min(6000, g + 250))}>
                  <View style={settSt.goalStepBtn}><Ionicons name="add" size={22} color={COLORS.blue} /></View>
                </PressScale>
              </View>
              <View style={settSt.goalPresets}>
                {[1500, 2000, 2500, 3000].map(g => (
                  <PressScale key={g} onPress={() => setGoal(g)}>
                    <View style={[settSt.goalPreset, { borderColor: goal === g ? COLORS.blue : COLORS.cardBorder, backgroundColor: goal === g ? COLORS.blue + '18' : COLORS.cardHover }]}>
                      <Text style={[settSt.goalPresetText, { color: goal === g ? COLORS.blue : COLORS.subtext }]}>{formatML(g)}</Text>
                    </View>
                  </PressScale>
                ))}
              </View>
            </LinearGradient>
          </View>

          {/* Save */}
          <PressScale onPress={handleSave} style={settSt.saveBtn}>
            <LinearGradient colors={[COLORS.blue, COLORS.blueDim]} style={settSt.saveBtnGrad}>
              {saving ? <ActivityIndicator color={COLORS.white} size="small" /> : (
                <><Ionicons name="save-outline" size={18} color={COLORS.white} /><Text style={settSt.saveBtnText}>Save Profile</Text></>
              )}
            </LinearGradient>
          </PressScale>

          {/* App info */}
          <View style={settSt.sectionHdr}><Text style={settSt.sectionTitle}>App Info</Text><View style={settSt.sectionLine} /></View>
          <View style={settSt.infoCard}>
            <LinearGradient colors={[COLORS.card, COLORS.bg]} style={settSt.cardGrad}>
              {[
                { icon: 'water', label: 'App Name', value: 'HydroTrack', color: COLORS.blue },
                { icon: 'code-slash', label: 'Version', value: APP_CONFIG.version, color: COLORS.purple },
                { icon: 'shield-checkmark', label: 'Privacy', value: 'All data stored locally', color: COLORS.green },
              ].map(item => (
                <View key={item.label} style={settSt.infoRow}>
                  <View style={[settSt.settingIcon, { backgroundColor: item.color + '18' }]}>
                    <Ionicons name={item.icon} size={16} color={item.color} />
                  </View>
                  <Text style={settSt.settingLabel}>{item.label}</Text>
                  <Text style={settSt.settingValue}>{item.value}</Text>
                </View>
              ))}
            </LinearGradient>
          </View>

          {/* Reset */}
          <PressScale onPress={() => {
            Alert.alert('Reset App', 'This will clear all data and restart onboarding. Are you sure?', [
              { text: 'Cancel', style: 'cancel' },
              { text: 'Reset', style: 'destructive', onPress: onResetOnboarding },
            ]);
          }} style={settSt.resetBtn}>
            <View style={settSt.resetBtnInner}>
              <Ionicons name="refresh-outline" size={16} color={COLORS.red} />
              <Text style={settSt.resetBtnText}>Reset & Restart Onboarding</Text>
            </View>
          </PressScale>

        </ScrollView>
      </SafeAreaView>
      <TabBar activeScreen={SCREENS.SETTINGS} onNavigate={onNavigate} />
    </View>
  );
};

const settSt = StyleSheet.create({
  scroll: { paddingHorizontal: SPACING.md, paddingTop: SPACING.xs },
  pageHdr: { paddingTop: SPACING.sm, marginBottom: SPACING.lg },
  pageTitle: { ...TYPOGRAPHY.h1, color: COLORS.text },
  pageSub: { ...TYPOGRAPHY.caption, color: COLORS.subtext, marginTop: 2 },
  profileCard: { borderRadius: RADIUS.xl, overflow: 'hidden', borderWidth: 1.5, borderColor: COLORS.blue + '44', marginBottom: SPACING.lg, ...SHADOWS.blue },
  profileGrad: { padding: SPACING.lg, alignItems: 'center', gap: SPACING.sm },
  profileTopLine: { position: 'absolute', top: 0, left: 0, right: 0, height: 2, backgroundColor: COLORS.blue, opacity: 0.6 },
  avatarLarge: { borderRadius: 50, overflow: 'hidden', borderWidth: 2, borderColor: COLORS.blue + '55' },
  avatarGrad: { width: 80, height: 80, alignItems: 'center', justifyContent: 'center' },
  profileName: { ...TYPOGRAPHY.h1, color: COLORS.text },
  profileGoal: { ...TYPOGRAPHY.body, color: COLORS.subtext },
  sectionHdr: { flexDirection: 'row', alignItems: 'center', marginBottom: SPACING.sm, gap: SPACING.sm },
  sectionTitle: { ...TYPOGRAPHY.label, color: COLORS.subtext, flexShrink: 0 },
  sectionLine: { flex: 1, height: 1, backgroundColor: COLORS.blue + '30' },
  card: { borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.md },
  infoCard: { borderRadius: RADIUS.lg, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.cardBorder, marginBottom: SPACING.md },
  cardGrad: { padding: SPACING.md },
  goalLabel: { ...TYPOGRAPHY.label, color: COLORS.blue, textAlign: 'center', marginBottom: SPACING.md },
  goalRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, marginBottom: SPACING.md },
  goalStepBtn: { width: 48, height: 48, borderRadius: RADIUS.md, backgroundColor: COLORS.cardHover, alignItems: 'center', justifyContent: 'center', borderWidth: 1, borderColor: COLORS.cardBorder },
  goalDisplay: { flex: 1, alignItems: 'center', paddingVertical: SPACING.md, borderRadius: RADIUS.md, borderWidth: 1, borderColor: COLORS.blue + '44' },
  goalNum: { ...TYPOGRAPHY.h1, color: COLORS.blue },
  goalPresets: { flexDirection: 'row', gap: SPACING.sm },
  goalPreset: { flex: 1, alignItems: 'center', paddingVertical: SPACING.sm, borderRadius: RADIUS.md, borderWidth: 1 },
  goalPresetText: { ...TYPOGRAPHY.caption, fontWeight: '700', fontSize: 11 },
  saveBtn: { borderRadius: RADIUS.lg, overflow: 'hidden', marginBottom: SPACING.lg, ...SHADOWS.blue },
  saveBtnGrad: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: SPACING.md + 2, gap: SPACING.sm },
  saveBtnText: { ...TYPOGRAPHY.body, fontWeight: '800', color: COLORS.white, fontSize: 16 },
  settingRow: { borderRadius: RADIUS.md, overflow: 'hidden', marginBottom: SPACING.sm },
  settingRowGrad: { flexDirection: 'row', alignItems: 'center', padding: SPACING.md, gap: SPACING.md },
  settingIcon: { width: 36, height: 36, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  settingLabel: { ...TYPOGRAPHY.body, color: COLORS.text, flex: 1 },
  settingValue: { ...TYPOGRAPHY.caption, color: COLORS.subtext },
  infoRow: { flexDirection: 'row', alignItems: 'center', gap: SPACING.md, paddingVertical: SPACING.sm, borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder + '55' },
  resetBtn: { borderRadius: RADIUS.md, overflow: 'hidden', borderWidth: 1, borderColor: COLORS.red + '33', marginBottom: SPACING.lg },
  resetBtnInner: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: SPACING.md, gap: SPACING.sm, backgroundColor: COLORS.red + '0a' },
  resetBtnText: { ...TYPOGRAPHY.body, color: COLORS.red, fontWeight: '600' },
});

// ============================================================
// ROOT APP
// ============================================================
export default function App() {
  const [screen, setScreen] = useState(SCREENS.SPLASH);
  const [profile, setProfile] = useState(null);
  const [logs, setLogs] = useState({});
  const [reminderPrefs, setReminderPrefs] = useState(null);
  const [streak, setStreak] = useState(0);

  // Load all data on mount
  useEffect(() => {
    SoundEngine.init();
    loadData();
  }, []);

  const loadData = async () => {
    try {
      const [profileStr, logsStr, onboarded, reminderStr] = await Promise.all([
        AsyncStorage.getItem(STORAGE_KEYS.USER_PROFILE),
        AsyncStorage.getItem(STORAGE_KEYS.DAILY_LOGS),
        AsyncStorage.getItem(STORAGE_KEYS.ONBOARDED),
        AsyncStorage.getItem(STORAGE_KEYS.REMINDER_PREFS),
      ]);
      if (profileStr) setProfile(JSON.parse(profileStr));
      if (logsStr) { const l = JSON.parse(logsStr); setLogs(l); setStreak(calcStreak(l, JSON.parse(profileStr)?.dailyGoal ?? 2500)); }
      if (reminderStr) setReminderPrefs(JSON.parse(reminderStr));
      // Note: splash always shows, then routes appropriately
    } catch (_) {}
  };

  const calcStreak = (logData, goal) => {
    let s = 0;
    const days = getLastNDays(90);
    for (let i = days.length - 1; i >= 0; i--) {
      if ((logData[days[i]]?.total ?? 0) >= goal) s++;
      else if (days[i] < getTodayKey()) break;
    }
    return s;
  };

  const handleSplashFinish = useCallback(() => {
    setScreen(profile ? SCREENS.HOME : SCREENS.ONBOARDING);
  }, [profile]);

  const handleOnboardingComplete = useCallback((p) => {
    setProfile(p);
    setScreen(SCREENS.HOME);
  }, []);

  const handleAddWater = useCallback(async (ml) => {
    const today = getTodayKey();
    const entry = { ml, type: 'Water', time: new Date().toISOString(), id: Date.now() };
    setLogs(prev => {
      const dayLog = prev[today] ?? { total: 0, entries: [] };
      const updated = { ...prev, [today]: { total: dayLog.total + ml, entries: [...dayLog.entries, entry] } };
      AsyncStorage.setItem(STORAGE_KEYS.DAILY_LOGS, JSON.stringify(updated)).catch(() => {});
      const newStreak = calcStreak(updated, profile?.dailyGoal ?? 2500);
      setStreak(newStreak);
      return updated;
    });
  }, [profile]);

  const handleNavigate = useCallback((s) => setScreen(s), []);

  const handleSaveProfile = useCallback((p) => setProfile(p), []);

  const handleSaveReminders = useCallback((prefs) => setReminderPrefs(prefs), []);

  const handleRefresh = useCallback(async () => {
    await loadData();
  }, []);

  const handleReset = useCallback(async () => {
    try {
      await AsyncStorage.multiRemove(Object.values(STORAGE_KEYS));
      setProfile(null); setLogs({}); setStreak(0); setReminderPrefs(null);
      setScreen(SCREENS.ONBOARDING);
    } catch (_) {}
  }, []);

  const todayLog = logs[getTodayKey()] ?? { total: 0, entries: [] };
  const weeklyAvg = useMemo(() => {
    const last7 = getLastNDays(7);
    return Math.round(last7.reduce((s, k) => s + (logs[k]?.total ?? 0), 0) / 7);
  }, [logs]);

  const renderScreen = () => {
    switch (screen) {
      case SCREENS.SPLASH:
        return <SplashScreen onFinish={handleSplashFinish} />;
      case SCREENS.ONBOARDING:
        return <OnboardingScreen onComplete={handleOnboardingComplete} />;
      case SCREENS.HOME:
        return <HomeScreen profile={profile} todayLog={todayLog} onAddWater={handleAddWater} onNavigate={handleNavigate} streak={streak} weeklyAvg={weeklyAvg} allLogs={logs} />;
      case SCREENS.HISTORY:
        return <HistoryScreen logs={logs} goal={profile?.dailyGoal ?? APP_CONFIG.defaultGoal} profile={profile} streak={streak} onNavigate={handleNavigate} onRefresh={handleRefresh} />;
      case SCREENS.REMINDERS:
        return <RemindersScreen reminderPrefs={reminderPrefs} onSave={handleSaveReminders} onNavigate={handleNavigate} />;
      case SCREENS.SETTINGS:
        return <SettingsScreen profile={profile} onSaveProfile={handleSaveProfile} onNavigate={handleNavigate} onResetOnboarding={handleReset} />;
      default:
        return null;
    }
  };

  return (
    <SafeAreaProvider>
      <View style={{ flex: 1, backgroundColor: COLORS.bg }}>
        {renderScreen()}
      </View>
    </SafeAreaProvider>
  );
}

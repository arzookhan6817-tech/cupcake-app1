export interface UserProfile {
  uid: string;
  name: string;
  email: string;
  photoURL: string;
  partnerId: string | null;
  trackerOrder: string[];
  enabledTrackers: string[];
  customTrackerName: string;
  currentStreak: number;
  lastActiveDate: string | null;
  goals: Record<string, number>;
  xp: number;
  darkMode: boolean;
}

export interface DailyLog {
  date: string;
  trackers: Record<string, number>;
}

export interface Alert {
  id: string;
  toUserId: string;
  fromUserName: string;
  message: string;
  timestamp: any;
  read: boolean;
}

export const DEFAULT_TRACKERS = ["sleep", "caloriesIntake", "protein", "leisure", "mood"];
export const OPTIONAL_TRACKERS = [
  "maths",
  "skillLearning",
  "work",
  "caloriesBurned",
  "swimming",
  "architecture",
];

export const DEFAULT_GOALS: Record<string, number> = {
  sleep: 8,
  caloriesIntake: 1500,
  protein: 100,
  leisure: 2,
  mood: 7,
  maths: 2,
  skillLearning: 2,
  work: 8,
  caloriesBurned: 400,
  swimming: 30,
  architecture: 2,
  partnerAnnoyance: 0, // lower is better — handled specially
};

export const XP_PER_GOAL = 20;

export const TRACKER_DEF: Record<
  string,
  {
    label: string;
    type: "number" | "slider";
    min?: number;
    max?: number;
    step?: number;
    unit?: string;
    icon: string;
    color: string;
    darkColor: string;
    emoji: string;
  }
> = {
  sleep: {
    label: "Sleep",
    type: "number",
    min: 0,
    max: 24,
    step: 0.5,
    unit: "hrs",
    icon: "Moon",
    color: "bg-indigo-100 text-indigo-600",
    darkColor: "bg-indigo-900/40 text-indigo-300",
    emoji: "🌙",
  },
  caloriesIntake: {
    label: "Calories In",
    type: "number",
    min: 0,
    step: 50,
    unit: "kcal",
    icon: "Utensils",
    color: "bg-emerald-100 text-emerald-600",
    darkColor: "bg-emerald-900/40 text-emerald-300",
    emoji: "🥗",
  },
  protein: {
    label: "Protein",
    type: "number",
    min: 0,
    step: 5,
    unit: "g",
    icon: "Drumstick",
    color: "bg-rose-100 text-rose-600",
    darkColor: "bg-rose-900/40 text-rose-300",
    emoji: "🥩",
  },
  leisure: {
    label: "Leisure",
    type: "number",
    min: 0,
    step: 0.5,
    unit: "hrs",
    icon: "Gamepad2",
    color: "bg-amber-100 text-amber-600",
    darkColor: "bg-amber-900/40 text-amber-300",
    emoji: "🎮",
  },
  mood: {
    label: "Mood",
    type: "slider",
    min: 1,
    max: 10,
    step: 1,
    icon: "Smile",
    color: "bg-fuchsia-100 text-fuchsia-600",
    darkColor: "bg-fuchsia-900/40 text-fuchsia-300",
    emoji: "😊",
  },
  maths: {
    label: "Maths",
    type: "number",
    min: 0,
    step: 0.5,
    unit: "hrs",
    icon: "Calculator",
    color: "bg-blue-100 text-blue-600",
    darkColor: "bg-blue-900/40 text-blue-300",
    emoji: "🧮",
  },
  skillLearning: {
    label: "Learning",
    type: "number",
    min: 0,
    step: 0.5,
    unit: "hrs",
    icon: "BookOpen",
    color: "bg-cyan-100 text-cyan-600",
    darkColor: "bg-cyan-900/40 text-cyan-300",
    emoji: "📚",
  },
  work: {
    label: "Work",
    type: "number",
    min: 0,
    step: 0.5,
    unit: "hrs",
    icon: "Briefcase",
    color: "bg-slate-100 text-slate-600",
    darkColor: "bg-slate-700/50 text-slate-300",
    emoji: "💼",
  },
  caloriesBurned: {
    label: "Calories Out",
    type: "number",
    min: 0,
    step: 50,
    unit: "kcal",
    icon: "Flame",
    color: "bg-orange-100 text-orange-600",
    darkColor: "bg-orange-900/40 text-orange-300",
    emoji: "🔥",
  },
  swimming: {
    label: "Swimming",
    type: "number",
    min: 0,
    step: 5,
    unit: "min",
    icon: "Waves",
    color: "bg-sky-100 text-sky-600",
    darkColor: "bg-sky-900/40 text-sky-300",
    emoji: "🏊",
  },
  architecture: {
    label: "Architecture",
    type: "number",
    min: 0,
    step: 0.5,
    unit: "hrs",
    icon: "Building2",
    color: "bg-stone-100 text-stone-600",
    darkColor: "bg-stone-700/50 text-stone-300",
    emoji: "🏛️",
  },
  partnerAnnoyance: {
    label: "Partner Annoyance",
    type: "slider",
    min: 0,
    max: 100,
    step: 1,
    icon: "HeartCrack",
    color: "bg-red-100 text-red-600",
    darkColor: "bg-red-900/40 text-red-300",
    emoji: "💢",
  },
};

export const QUOTES = [
  { text: "Even cupcakes need discipline.", type: "fun" },
  { text: "Small wins build strong lives.", type: "motivational" },
  { text: "Excuses don't burn calories.", type: "triggering" },
  { text: "The only bad workout is the one you skipped.", type: "motivational" },
  { text: "You don't have to be extreme, just consistent.", type: "motivational" },
  { text: "Your future self is watching. Don't disappoint them.", type: "triggering" },
  { text: "Sleep is a weapon. Use it.", type: "fun" },
  { text: "Progress, not perfection.", type: "motivational" },
  { text: "Discipline is choosing what you want most over what you want now.", type: "motivational" },
  { text: "Good things happen to those who hustle.", type: "motivational" },
  { text: "Your body hears everything your mind says.", type: "motivational" },
  { text: "Stop waiting for motivation. Motivation follows action.", type: "triggering" },
  { text: "Soft life? Sure. After your goals are done.", type: "fun" },
  { text: "The secret? You have to do the thing.", type: "triggering" },
  { text: "Rest. Then attack again.", type: "fun" },
];

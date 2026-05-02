export const APP_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type MoodKey = "tired" | "excited" | "love" | "productive" | "relaxed";

export type Habit = {
  id: string;
  name: string;
  order: number;
  color: string;
  thumbnail: string;
  quip: string;
  kind?: "clinic";
  createdAt: string;
  pausedAt?: string;
};

export type ClinicSession = "morning" | "afternoon" | "evening";

export type ClinicLog = {
  hours?: number;
  sessions: ClinicSession[];
};

export type DayRecord = {
  completedHabitIds: string[];
  habitMoods?: Partial<Record<string, MoodKey>>;
  clinicLogs?: Partial<Record<string, ClinicLog>>;
  note?: string;
};

export type TrackerState = {
  version: 1;
  habits: Habit[];
  days: Record<string, DayRecord>;
  createdAt: string;
  updatedAt: string;
};

export type TrackerProfile = {
  id: "shivani" | "navjot" | "neerisha";
  owner: string;
  relation: "girlfriend" | "mother" | "sister";
  title: string;
  eyebrow: string;
  description: string;
  metaDescription: string;
  portrait: string;
  storageKey: string;
  cookieKey: string;
  historyStateKey: string;
  fileSlug: string;
  shareKicker: string;
  shareTitleLines: [string, string];
  shareFooter: string;
  noteLabel: string;
  notePlaceholder: string;
  defaultHabits: Array<Omit<Habit, "createdAt">>;
};

export type ThumbnailOption = {
  slug: string;
  label: string;
  src: string;
};

export const moodOptions: Array<{
  key: MoodKey;
  label: string;
  shortLabel: string;
  tone: string;
  src: string;
}> = [
  { key: "tired", label: "Tired", shortLabel: "Zz", tone: "#b88cff", src: "/assets/moods/tired.png" },
  { key: "excited", label: "Excited", shortLabel: "Yay", tone: "#ff4fa3", src: "/assets/moods/excited.png" },
  { key: "love", label: "Love", shortLabel: "Love", tone: "#ff6f91", src: "/assets/moods/love.png" },
  {
    key: "productive",
    label: "Productive",
    shortLabel: "Done",
    tone: "#83d8bc",
    src: "/assets/moods/productive.png"
  },
  { key: "relaxed", label: "Relaxed", shortLabel: "Calm", tone: "#ffd76b", src: "/assets/moods/relaxed.png" }
];

export const thumbnailOptions: ThumbnailOption[] = [
  { slug: "daily-gym", label: "Crowned Dumbbell", src: "/assets/habits/daily-gym.png" },
  { slug: "steps", label: "Heart Steps", src: "/assets/habits/steps.png" },
  { slug: "eat-healthy", label: "Smug Salad", src: "/assets/habits/eat-healthy.png" },
  { slug: "read-article", label: "Article Detective", src: "/assets/habits/read-article.png" },
  { slug: "wake-early", label: "Sunrise Alarm", src: "/assets/habits/wake-early.png" },
  { slug: "thesis-physics", label: "Crystal Thesis", src: "/assets/habits/thesis-physics.png" },
  { slug: "neet-jee-videos", label: "Study Stream", src: "/assets/habits/neet-jee-videos.png" },
  { slug: "stretch-yoga", label: "Ribbon Mat", src: "/assets/habits/stretch-yoga.png" },
  { slug: "skincare", label: "Dewy Serum", src: "/assets/habits/skincare.png" },
  { slug: "journal", label: "Secret Diary", src: "/assets/habits/journal.png" },
  { slug: "read-pages", label: "Book Butterflies", src: "/assets/habits/read-pages.png" },
  { slug: "write-scripts", label: "Script Keys", src: "/assets/habits/write-scripts.png" },
  { slug: "solve-questions", label: "Heart Equation", src: "/assets/habits/solve-questions.png" },
  { slug: "write-pages", label: "Racing Pen", src: "/assets/habits/write-pages.png" }
];

const shivaniHabitSeeds: Array<Omit<Habit, "createdAt">> = [
  {
    id: "daily-gym",
    name: "Daily Gym",
    order: 0,
    color: "#ff4fa3",
    thumbnail: "/assets/habits/daily-gym.png",
    quip: "Tiny crown, big reps."
  },
  {
    id: "steps",
    name: "5k-9k Steps",
    order: 1,
    color: "#83d8bc",
    thumbnail: "/assets/habits/steps.png",
    quip: "A little parade for your sneakers."
  },
  {
    id: "eat-healthy",
    name: "Eat Healthy",
    order: 2,
    color: "#ffd76b",
    thumbnail: "/assets/habits/eat-healthy.png",
    quip: "The fork has opinions."
  },
  {
    id: "read-article",
    name: "Read Article Daily",
    order: 3,
    color: "#b88cff",
    thumbnail: "/assets/habits/read-article.png",
    quip: "A tiny detective for your brain."
  },
  {
    id: "wake-early",
    name: "Wake Up Early",
    order: 4,
    color: "#ff9bbd",
    thumbnail: "/assets/habits/wake-early.png",
    quip: "Sunrise, but make it cute."
  },
  {
    id: "thesis-physics",
    name: "Thesis / Material Physics",
    order: 5,
    color: "#9aa7ff",
    thumbnail: "/assets/habits/thesis-physics.png",
    quip: "Crystal lattice, main character energy."
  },
  {
    id: "neet-jee-videos",
    name: "NEET/JEE Videos",
    order: 6,
    color: "#73c7f4",
    thumbnail: "/assets/habits/neet-jee-videos.png",
    quip: "Headphones on, chaos off."
  },
  {
    id: "stretch-yoga",
    name: "Stretching/Yoga",
    order: 7,
    color: "#a6d88a",
    thumbnail: "/assets/habits/stretch-yoga.png",
    quip: "Mat tied itself into a bow."
  },
  {
    id: "skincare",
    name: "Skincare",
    order: 8,
    color: "#ffb1ce",
    thumbnail: "/assets/habits/skincare.png",
    quip: "Dewy and slightly dramatic."
  },
  {
    id: "journal",
    name: "Do Journal",
    order: 9,
    color: "#d08cff",
    thumbnail: "/assets/habits/journal.png",
    quip: "Secrets, but organized."
  },
  {
    id: "read-pages",
    name: "Read 2-3 Pages",
    order: 10,
    color: "#f6b15f",
    thumbnail: "/assets/habits/read-pages.png",
    quip: "Butterflies with bookmarks."
  },
  {
    id: "write-scripts",
    name: "Write Scripts",
    order: 11,
    color: "#ff6fb4",
    thumbnail: "/assets/habits/write-scripts.png",
    quip: "Keyboard cameo loading."
  },
  {
    id: "solve-questions",
    name: "Solve 2-3 Questions",
    order: 12,
    color: "#f3c745",
    thumbnail: "/assets/habits/solve-questions.png",
    quip: "Math, but flirtier."
  },
  {
    id: "write-pages",
    name: "Write 1-1.5 Pages",
    order: 13,
    color: "#df8cff",
    thumbnail: "/assets/habits/write-pages.png",
    quip: "Pen sprint, paper sparkle."
  }
];

const navjotHabitSeeds: Array<Omit<Habit, "createdAt">> = [
  {
    id: "morning-calm",
    name: "Morning Calm",
    order: 0,
    color: "#ff9bbd",
    thumbnail: "/assets/habits/wake-early.png",
    quip: "A quiet start before the house gets loud."
  },
  {
    id: "steps",
    name: "Walk / Steps",
    order: 1,
    color: "#83d8bc",
    thumbnail: "/assets/habits/steps.png",
    quip: "Little strolls, big queen energy."
  },
  {
    id: "water",
    name: "Drink Water",
    order: 2,
    color: "#73c7f4",
    thumbnail: "/assets/habits/skincare.png",
    quip: "Hydration glow, handled."
  },
  {
    id: "eat-fresh",
    name: "Eat Fresh",
    order: 3,
    color: "#ffd76b",
    thumbnail: "/assets/habits/eat-healthy.png",
    quip: "The smug fork approves this plate."
  },
  {
    id: "stretch-yoga",
    name: "Stretch / Yoga",
    order: 4,
    color: "#a6d88a",
    thumbnail: "/assets/habits/stretch-yoga.png",
    quip: "Soft movement, zero drama."
  },
  {
    id: "skincare",
    name: "Skincare",
    order: 5,
    color: "#ffb1ce",
    thumbnail: "/assets/habits/skincare.png",
    quip: "Dewy routine with main-character lighting."
  },
  {
    id: "tea-me-time",
    name: "Tea / Me-Time",
    order: 6,
    color: "#f6b15f",
    thumbnail: "/assets/habits/read-article.png",
    quip: "Ten quiet minutes, fully deserved."
  },
  {
    id: "journal",
    name: "Journal Note",
    order: 7,
    color: "#d08cff",
    thumbnail: "/assets/habits/journal.png",
    quip: "One soft thought saved properly."
  },
  {
    id: "home-reset",
    name: "Home Reset",
    order: 8,
    color: "#ff6fb4",
    thumbnail: "/assets/habits/write-pages.png",
    quip: "Five-minute tidy, instant mood upgrade."
  },
  {
    id: "relax",
    name: "Relax Time",
    order: 9,
    color: "#b88cff",
    thumbnail: "/assets/habits/read-article.png",
    quip: "Rest is also a checked box."
  }
];

const neerishaHabitSeeds: Array<Omit<Habit, "createdAt">> = [
  {
    id: "wake-early",
    name: "Wake Up Early",
    order: 0,
    color: "#ff9bbd",
    thumbnail: "/assets/habits/wake-early.png",
    quip: "Sunrise cameo, starring Neerisha."
  },
  {
    id: "skincare",
    name: "Skincare",
    order: 1,
    color: "#ffb1ce",
    thumbnail: "/assets/habits/skincare.png",
    quip: "Dewy and slightly unstoppable."
  },
  {
    id: "clinic-hours",
    name: "Clinic Hours",
    order: 2,
    color: "#b88cff",
    thumbnail: "/assets/habits/journal.png",
    quip: "Morning, afternoon, evening - clinic queen ledger.",
    kind: "clinic"
  },
  {
    id: "eat-properly",
    name: "Eat Properly",
    order: 3,
    color: "#ffd76b",
    thumbnail: "/assets/habits/eat-healthy.png",
    quip: "The smug fork is supervising."
  },
  {
    id: "drink-water",
    name: "Drink Water",
    order: 4,
    color: "#73c7f4",
    thumbnail: "/assets/habits/skincare.png",
    quip: "Hydration glow, no excuses."
  },
  {
    id: "room-reset",
    name: "Room Reset",
    order: 5,
    color: "#df8cff",
    thumbnail: "/assets/habits/write-pages.png",
    quip: "Tiny tidy, huge peace."
  },
  {
    id: "family-time",
    name: "Family Time",
    order: 6,
    color: "#f6b15f",
    thumbnail: "/assets/habits/read-pages.png",
    quip: "A little warmth logged properly."
  },
  {
    id: "steps",
    name: "Walk / Steps",
    order: 7,
    color: "#83d8bc",
    thumbnail: "/assets/habits/steps.png",
    quip: "Sneaker side quest accepted."
  },
  {
    id: "stretch-yoga",
    name: "Stretch / Yoga",
    order: 8,
    color: "#a6d88a",
    thumbnail: "/assets/habits/stretch-yoga.png",
    quip: "Ribbon mat says: bend, don't break."
  },
  {
    id: "journal",
    name: "Journal",
    order: 9,
    color: "#d08cff",
    thumbnail: "/assets/habits/journal.png",
    quip: "Secrets, thoughts, and plot development."
  }
];

export const profileConfigs: Record<TrackerProfile["id"], TrackerProfile> = {
  shivani: {
    id: "shivani",
    owner: "Shivani",
    relation: "girlfriend",
    title: "Shivani's Sparkle Streak",
    eyebrow: "Made with all my love",
    description: "A soft pink diary for study glow-ups, sweet routines, tiny moods, and wins worth saving.",
    metaDescription: "A sweet pink tracker for habits, moods, notes, and daily wins",
    portrait: "/assets/profiles/shivani.png",
    storageKey: "habit-tracker:v1",
    cookieKey: "habit_tracker_v1",
    historyStateKey: "habitTrackerStateV1",
    fileSlug: "shivani-sparkle-streak",
    shareKicker: "made with all my love",
    shareTitleLines: ["Shivani's", "Sparkle Streak"],
    shareFooter: "tiny progress, soft heart, full sparkle",
    noteLabel: "Journal note",
    notePlaceholder: "A tiny note from today...",
    defaultHabits: shivaniHabitSeeds
  },
  navjot: {
    id: "navjot",
    owner: "Navjot",
    relation: "mother",
    title: "Navjot's Glow Streak",
    eyebrow: "Made with maa-level love",
    description: "A soft pink routine diary for calm mornings, healthy little wins, rest, and everyday glow.",
    metaDescription: "A sweet pink tracker made for Navjot's routines, moods, notes, and daily wins",
    portrait: "/assets/profiles/navjot.png",
    storageKey: "habit-tracker:navjot:v1",
    cookieKey: "habit_tracker_navjot_v1",
    historyStateKey: "habitTrackerNavjotStateV1",
    fileSlug: "navjot-glow-streak",
    shareKicker: "made with maa-level love",
    shareTitleLines: ["Navjot's", "Glow Streak"],
    shareFooter: "soft routines, warm heart, glowing wins",
    noteLabel: "Glow note",
    notePlaceholder: "A small note from today's glow...",
    defaultHabits: navjotHabitSeeds
  },
  neerisha: {
    id: "neerisha",
    owner: "Neerisha",
    relation: "sister",
    title: "Neerisha's Sparkle Sprint",
    eyebrow: "Made with sibling-level love",
    description: "A cute pink tracker for clinic hours, self-care, tiny moods, and wins that deserve confetti.",
    metaDescription: "A sweet pink tracker made for Neerisha's habits, moods, notes, and daily wins",
    portrait: "/assets/profiles/neerisha.png",
    storageKey: "habit-tracker:neerisha:v1",
    cookieKey: "habit_tracker_neerisha_v1",
    historyStateKey: "habitTrackerNeerishaStateV1",
    fileSlug: "neerisha-sparkle-sprint",
    shareKicker: "made with sibling-level love",
    shareTitleLines: ["Neerisha's", "Sparkle Sprint"],
    shareFooter: "tiny wins, sister sparkle, full speed",
    noteLabel: "Sparkle note",
    notePlaceholder: "A tiny note from today's sprint...",
    defaultHabits: neerishaHabitSeeds
  }
};

export const defaultProfile = profileConfigs.shivani;

const retiredHabitIdsByProfile: Record<TrackerProfile["id"], Set<string>> = {
  shivani: new Set(),
  navjot: new Set(["study-session", "lesson-videos", "solve-questions", "write-notes", "read-pages"]),
  neerisha: new Set(["study-session", "lesson-videos", "solve-questions", "write-notes", "read-pages"])
};

export function createDefaultState(profile: TrackerProfile = defaultProfile, now = new Date().toISOString()): TrackerState {
  return {
    version: 1,
    habits: profile.defaultHabits.map((habit) => ({ ...habit, createdAt: now })),
    days: {},
    createdAt: now,
    updatedAt: now
  };
}

export function assetUrl(path: string) {
  if (!APP_BASE_PATH || path.startsWith("data:") || path.startsWith("http")) {
    return path;
  }

  return `${APP_BASE_PATH}${path.startsWith("/") ? path : `/${path}`}`;
}

export function isTrackerState(value: unknown): value is TrackerState {
  if (!value || typeof value !== "object") {
    return false;
  }

  const candidate = value as Partial<TrackerState>;
  return (
    candidate.version === 1 &&
    Array.isArray(candidate.habits) &&
    typeof candidate.days === "object" &&
    candidate.days !== null
  );
}

export function normalizeImportedState(value: TrackerState, profile: TrackerProfile = defaultProfile): TrackerState {
  const now = new Date().toISOString();
  const fallback = createDefaultState(profile, now);
  const retiredHabitIds = retiredHabitIdsByProfile[profile.id];
  const habits = value.habits
    .filter((habit) => habit && typeof habit.id === "string" && typeof habit.name === "string")
    .filter((habit) => !retiredHabitIds.has(habit.id))
    .map((habit, index) => ({
      id: habit.id,
      name: habit.name,
      order: Number.isFinite(habit.order) ? habit.order : index,
      color: typeof habit.color === "string" ? habit.color : fallback.habits[index % fallback.habits.length].color,
      thumbnail:
        typeof habit.thumbnail === "string"
          ? habit.thumbnail
          : fallback.habits[index % fallback.habits.length].thumbnail,
      quip: typeof habit.quip === "string" ? habit.quip : "Freshly added and already iconic.",
      kind: habit.kind === "clinic" ? ("clinic" as const) : undefined,
      createdAt: typeof habit.createdAt === "string" ? habit.createdAt : now,
      pausedAt: typeof habit.pausedAt === "string" ? habit.pausedAt : undefined
    }));
  const existingHabitIds = new Set(habits.map((habit) => habit.id));
  const missingDefaults = profile.defaultHabits
    .filter((habit) => !existingHabitIds.has(habit.id))
    .map((habit) => ({ ...habit, createdAt: now }));
  const normalizedHabits = (habits.length > 0 ? [...habits, ...missingDefaults] : fallback.habits)
    .sort((a, b) => a.order - b.order)
    .map((habit, index) => ({ ...habit, order: index }));
  const normalizedHabitIds = new Set(normalizedHabits.map((habit) => habit.id));

  const normalizedDays = Object.fromEntries(
    Object.entries(value.days && typeof value.days === "object" ? value.days : {}).map(([dateKey, record]) => {
      const legacyRecord = record as DayRecord & { mood?: MoodKey };
      const completedHabitIds = Array.isArray(record.completedHabitIds)
        ? record.completedHabitIds.filter((habitId) => normalizedHabitIds.has(habitId))
        : [];
      const legacyMoods =
        legacyRecord.mood && completedHabitIds.length > 0
          ? Object.fromEntries(completedHabitIds.map((habitId) => [habitId, legacyRecord.mood]))
          : {};

      return [
        dateKey,
        {
          completedHabitIds,
          habitMoods:
            record.habitMoods && typeof record.habitMoods === "object"
              ? { ...legacyMoods, ...record.habitMoods }
              : legacyMoods,
          clinicLogs: normalizeClinicLogs(record.clinicLogs),
          note: typeof record.note === "string" ? record.note : undefined
        }
      ];
    })
  );

  return {
    version: 1,
    habits: normalizedHabits,
    days: normalizedDays,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : now,
    updatedAt: now
  };
}

function normalizeClinicLogs(value: DayRecord["clinicLogs"]): DayRecord["clinicLogs"] {
  if (!value || typeof value !== "object") {
    return undefined;
  }

  const sessions = new Set<ClinicSession>(["morning", "afternoon", "evening"]);
  const normalized: Partial<Record<string, ClinicLog>> = {};

  for (const [habitId, log] of Object.entries(value)) {
    if (!log || typeof log !== "object") {
      continue;
    }

    const hours = Number(log.hours);
    const cleanSessions = Array.isArray(log.sessions)
      ? log.sessions.filter((session): session is ClinicSession => sessions.has(session as ClinicSession))
      : [];

    normalized[habitId] = {
      hours: Number.isFinite(hours) && hours > 0 ? hours : undefined,
      sessions: [...new Set(cleanSessions)]
    };
  }

  return Object.keys(normalized).length > 0 ? normalized : undefined;
}

export const STORAGE_KEY = "habit-tracker:v1";
export const APP_BASE_PATH = process.env.NEXT_PUBLIC_BASE_PATH ?? "";

export type MoodKey = "tired" | "excited" | "love" | "productive" | "relaxed";

export type Habit = {
  id: string;
  name: string;
  order: number;
  color: string;
  thumbnail: string;
  quip: string;
  createdAt: string;
  pausedAt?: string;
};

export type DayRecord = {
  completedHabitIds: string[];
  habitMoods?: Partial<Record<string, MoodKey>>;
  note?: string;
};

export type TrackerState = {
  version: 1;
  habits: Habit[];
  days: Record<string, DayRecord>;
  createdAt: string;
  updatedAt: string;
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

const habitSeeds: Array<Omit<Habit, "createdAt">> = [
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

export function createDefaultState(now = new Date().toISOString()): TrackerState {
  return {
    version: 1,
    habits: habitSeeds.map((habit) => ({ ...habit, createdAt: now })),
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

export function normalizeImportedState(value: TrackerState): TrackerState {
  const now = new Date().toISOString();
  const fallback = createDefaultState(now);
  const habits = value.habits
    .filter((habit) => habit && typeof habit.id === "string" && typeof habit.name === "string")
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
      createdAt: typeof habit.createdAt === "string" ? habit.createdAt : now,
      pausedAt: typeof habit.pausedAt === "string" ? habit.pausedAt : undefined
    }));

  const normalizedDays = Object.fromEntries(
    Object.entries(value.days && typeof value.days === "object" ? value.days : {}).map(([dateKey, record]) => {
      const legacyRecord = record as DayRecord & { mood?: MoodKey };
      const completedHabitIds = Array.isArray(record.completedHabitIds) ? record.completedHabitIds : [];
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
          note: typeof record.note === "string" ? record.note : undefined
        }
      ];
    })
  );

  return {
    version: 1,
    habits: habits.length > 0 ? habits : fallback.habits,
    days: normalizedDays,
    createdAt: typeof value.createdAt === "string" ? value.createdAt : now,
    updatedAt: now
  };
}

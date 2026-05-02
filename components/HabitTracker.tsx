"use client";

import {
  ArrowDown,
  ArrowLeft,
  ArrowRight,
  ArrowUp,
  CalendarDays,
  Check,
  Download,
  FileUp,
  Plus,
  RotateCcw,
  Settings2,
  Sparkles,
  Trash2,
  X
} from "lucide-react";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ChangeEvent,
  type CSSProperties
} from "react";
import {
  STORAGE_KEY,
  assetUrl,
  createDefaultState,
  isTrackerState,
  moodOptions,
  normalizeImportedState,
  thumbnailOptions,
  type DayRecord,
  type Habit,
  type MoodKey,
  type TrackerState
} from "../lib/habitData";

const colorPalette = ["#ff4fa3", "#b88cff", "#83d8bc", "#ffd76b", "#ff9bbd", "#73c7f4"];
const COOKIE_KEY = "habit_tracker_v1";
const HISTORY_STATE_KEY = "habitTrackerStateV1";
const emptyDay: DayRecord = { completedHabitIds: [], habitMoods: {} };

export function HabitTracker() {
  const [tracker, setTracker] = useState<TrackerState>(() => createDefaultState());
  const trackerRef = useRef(tracker);
  const [selectedDate, setSelectedDate] = useState(() => localDateKey(new Date()));
  const selectedDateRef = useRef(selectedDate);
  const noteRef = useRef<HTMLTextAreaElement | null>(null);
  const [visibleMonth, setVisibleMonth] = useState(() => startOfMonth(new Date()));
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [newHabitName, setNewHabitName] = useState("");
  const [newHabitThumbnail, setNewHabitThumbnail] = useState(thumbnailOptions[0].src);

  useEffect(() => {
    const stored = readSavedTrackerState();

    if (stored) {
      try {
        const parsed = JSON.parse(stored) as unknown;
        if (isTrackerState(parsed)) {
          const storedTracker = normalizeImportedState(parsed);
          trackerRef.current = storedTracker;
          setTracker(storedTracker);
        }
      } catch {
        window.localStorage.removeItem(STORAGE_KEY);
      }
    }

    const today = new Date();
    const todayKey = localDateKey(today);
    selectedDateRef.current = todayKey;
    setSelectedDate(todayKey);
    setVisibleMonth(startOfMonth(today));
  }, []);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
  }, [selectedDate]);

  useEffect(() => {
    const persistLatest = () => {
      const liveNote = noteRef.current?.value;

      if (typeof liveNote === "string") {
        const dateKey = selectedDateRef.current;
        const record = trackerRef.current.days[dateKey] ?? emptyDay;
        trackerRef.current = {
          ...trackerRef.current,
          days: {
            ...trackerRef.current.days,
            [dateKey]: { ...record, note: liveNote }
          },
          updatedAt: new Date().toISOString()
        };
      }

      saveTrackerState(trackerRef.current);
    };
    window.addEventListener("pagehide", persistLatest);
    window.addEventListener("beforeunload", persistLatest);
    document.addEventListener("visibilitychange", persistLatest);

    return () => {
      window.removeEventListener("pagehide", persistLatest);
      window.removeEventListener("beforeunload", persistLatest);
      document.removeEventListener("visibilitychange", persistLatest);
    };
  }, []);

  const commit = useCallback((recipe: (current: TrackerState) => TrackerState) => {
    const next = recipe(trackerRef.current);
    const stamped = { ...next, updatedAt: new Date().toISOString() };
    trackerRef.current = stamped;
    saveTrackerState(stamped);
    setTracker(stamped);
  }, []);

  const sortedHabits = useMemo(
    () => [...tracker.habits].sort((a, b) => a.order - b.order),
    [tracker.habits]
  );
  const activeHabits = useMemo(() => sortedHabits.filter((habit) => !habit.pausedAt), [sortedHabits]);
  const monthDays = useMemo(() => getMonthDays(visibleMonth), [visibleMonth]);
  const selectedRecord = tracker.days[selectedDate] ?? emptyDay;
  const completedSet = useMemo(
    () => new Set(selectedRecord.completedHabitIds),
    [selectedRecord.completedHabitIds]
  );
  const completedCount = activeHabits.filter((habit) => completedSet.has(habit.id)).length;
  const completionPercent =
    activeHabits.length > 0 ? Math.round((completedCount / activeHabits.length) * 100) : 0;
  const streak = useMemo(
    () => countStreakEndingAt(selectedDate, tracker, activeHabits),
    [selectedDate, tracker, activeHabits]
  );
  const monthProgress = useMemo(
    () => countMonthProgress(monthDays, activeHabits, tracker),
    [monthDays, activeHabits, tracker]
  );

  const toggleCompletion = useCallback(
    (habitId: string, dateKey = selectedDate) => {
      commit((current) => {
        const record = current.days[dateKey] ?? emptyDay;
        const isDone = record.completedHabitIds.includes(habitId);
        const completedHabitIds = isDone
          ? record.completedHabitIds.filter((id) => id !== habitId)
          : [...record.completedHabitIds, habitId];
        const habitMoods = { ...(record.habitMoods ?? {}) };

        if (isDone) {
          delete habitMoods[habitId];
        }

        return {
          ...current,
          days: {
            ...current.days,
            [dateKey]: { ...record, completedHabitIds, habitMoods }
          }
        };
      });
    },
    [commit, selectedDate]
  );

  const updateHabitMood = useCallback(
    (habitId: string, mood: MoodKey) => {
      commit((current) => {
        const record = current.days[selectedDate] ?? emptyDay;
        const habitMoods = { ...(record.habitMoods ?? {}) };

        if (habitMoods[habitId] === mood) {
          delete habitMoods[habitId];
        } else {
          habitMoods[habitId] = mood;
        }

        const completedHabitIds = record.completedHabitIds.includes(habitId)
          ? record.completedHabitIds
          : [...record.completedHabitIds, habitId];

        return {
          ...current,
          days: {
            ...current.days,
            [selectedDate]: { ...record, completedHabitIds, habitMoods }
          }
        };
      });
    },
    [commit, selectedDate]
  );

  const updateSelectedNote = useCallback(
    (note: string) => {
      commit((current) => {
        const record = current.days[selectedDate] ?? emptyDay;
        return {
          ...current,
          days: {
            ...current.days,
            [selectedDate]: { ...record, note }
          }
        };
      });
    },
    [commit, selectedDate]
  );

  const addHabit = useCallback(() => {
    const name = newHabitName.trim();
    if (!name) {
      return;
    }

    commit((current) => {
      const order = current.habits.reduce((max, habit) => Math.max(max, habit.order), -1) + 1;
      const color = colorPalette[order % colorPalette.length];
      const id = `custom-${Date.now().toString(36)}`;
      const habit: Habit = {
        id,
        name,
        order,
        color,
        thumbnail: newHabitThumbnail,
        quip: "Freshly added and already iconic.",
        createdAt: new Date().toISOString()
      };

      return { ...current, habits: [...current.habits, habit] };
    });

    setNewHabitName("");
  }, [commit, newHabitName, newHabitThumbnail]);

  const updateHabit = useCallback(
    (habitId: string, patch: Partial<Pick<Habit, "name" | "thumbnail" | "color" | "quip">>) => {
      commit((current) => ({
        ...current,
        habits: current.habits.map((habit) => (habit.id === habitId ? { ...habit, ...patch } : habit))
      }));
    },
    [commit]
  );

  const moveHabit = useCallback(
    (habitId: string, direction: -1 | 1) => {
      commit((current) => {
        const habits = [...current.habits].sort((a, b) => a.order - b.order);
        const index = habits.findIndex((habit) => habit.id === habitId);
        const targetIndex = index + direction;

        if (index < 0 || targetIndex < 0 || targetIndex >= habits.length) {
          return current;
        }

        const currentOrder = habits[index].order;
        habits[index] = { ...habits[index], order: habits[targetIndex].order };
        habits[targetIndex] = { ...habits[targetIndex], order: currentOrder };

        return { ...current, habits };
      });
    },
    [commit]
  );

  const togglePauseHabit = useCallback(
    (habitId: string) => {
      commit((current) => ({
        ...current,
        habits: current.habits.map((habit) =>
          habit.id === habitId
            ? { ...habit, pausedAt: habit.pausedAt ? undefined : new Date().toISOString() }
            : habit
        )
      }));
    },
    [commit]
  );

  const deleteHabit = useCallback(
    (habitId: string) => {
      const habit = tracker.habits.find((item) => item.id === habitId);
      const confirmed = window.confirm(`Delete "${habit?.name ?? "this habit"}" from the tracker?`);
      if (!confirmed) {
        return;
      }

      commit((current) => {
        const days = Object.fromEntries(
          Object.entries(current.days).map(([dateKey, record]) => [
            dateKey,
            {
              ...record,
              completedHabitIds: record.completedHabitIds.filter((id) => id !== habitId),
              habitMoods: removeHabitMood(record.habitMoods, habitId)
            }
          ])
        );

        return {
          ...current,
          habits: current.habits.filter((item) => item.id !== habitId),
          days
        };
      });
    },
    [commit, tracker.habits]
  );

  const exportBackup = useCallback(() => {
    const blob = new Blob([JSON.stringify(tracker, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `shivani-sparkle-streak-${selectedDate}.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }, [selectedDate, tracker]);

  const importBackup = useCallback(async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = "";

    if (!file) {
      return;
    }

    try {
      const parsed = JSON.parse(await file.text()) as unknown;
      if (!isTrackerState(parsed)) {
        window.alert("That file does not look like a Pink Habit Tracker backup.");
        return;
      }

      const imported = normalizeImportedState(parsed);
      trackerRef.current = imported;
      setTracker(imported);
      saveTrackerState(imported);
    } catch {
      window.alert("I could not read that backup file.");
    }
  }, []);

  const resetTracker = useCallback(() => {
    const confirmed = window.confirm("Reset all habits, marks, moods, and notes?");
    if (confirmed) {
      const next = createDefaultState();
      trackerRef.current = next;
      setTracker(next);
      saveTrackerState(next);
    }
  }, []);

  const selectToday = useCallback(() => {
    const today = new Date();
    setSelectedDate(localDateKey(today));
    setVisibleMonth(startOfMonth(today));
  }, []);

  return (
    <main className="tracker-shell">
      <section className="tracker-hero" aria-labelledby="tracker-title">
        <div className="hero-copy">
          <div className="eyebrow">
            <Sparkles size={16} aria-hidden="true" />
            Made with tiny love
          </div>
          <h1 id="tracker-title">Shivani's Sparkle Streak</h1>
          <p>
            A soft pink diary for study glow-ups, sweet routines, tiny moods, and wins worth saving.
          </p>
        </div>

        <div className="hero-actions" aria-label="Tracker actions">
          <button className="icon-text-button" type="button" onClick={selectToday}>
            <CalendarDays size={18} aria-hidden="true" />
            Today
          </button>
          <button className="icon-text-button" type="button" onClick={exportBackup}>
            <Download size={18} aria-hidden="true" />
            Export
          </button>
          <label className="icon-text-button file-button">
            <FileUp size={18} aria-hidden="true" />
            Import
            <input type="file" accept="application/json" onChange={importBackup} />
          </label>
          <button className="icon-text-button hot" type="button" onClick={() => setSettingsOpen(true)}>
            <Settings2 size={18} aria-hidden="true" />
            Habits
          </button>
        </div>
      </section>

      <section className="dashboard-grid" aria-label="Habit tracker dashboard">
        <section className="today-panel" aria-labelledby="today-title">
          <div className="section-header">
            <div>
              <span className="section-kicker">Selected day</span>
              <h2 id="today-title">{formatPrettyDate(selectedDate)}</h2>
            </div>
            <div className="progress-ring" style={{ "--progress": `${completionPercent}%` } as CSSProperties}>
              <span>{completionPercent}%</span>
            </div>
          </div>

          <div className="stat-strip" aria-label="Daily progress">
            <StatCard label="Done" value={`${completedCount}/${activeHabits.length}`} />
            <StatCard label="Streak" value={`${streak} day${streak === 1 ? "" : "s"}`} />
            <StatCard label="Month" value={`${monthProgress.completed}/${monthProgress.total}`} />
          </div>

          <div className="checklist" aria-label="Today's habits">
            {activeHabits.map((habit) => {
              const done = completedSet.has(habit.id);
              const habitMood = selectedRecord.habitMoods?.[habit.id];
              return (
                <article
                  className={`habit-card${done ? " done" : ""}`}
                  key={habit.id}
                  style={{ "--habit": habit.color } as CSSProperties}
                >
                  <div className="habit-card-main">
                    <img src={assetUrl(habit.thumbnail)} alt="" className="habit-thumb" />
                    <div className="habit-card-copy">
                      <h3>{habit.name}</h3>
                      <p>{habit.quip}</p>
                    </div>
                    <button
                      className="check-button"
                      style={{ "--habit": habit.color } as CSSProperties}
                      type="button"
                      onClick={() => toggleCompletion(habit.id)}
                      aria-label={`${done ? "Clear" : "Complete"} ${habit.name}`}
                    >
                      {done ? <Check size={21} aria-hidden="true" /> : null}
                    </button>
                  </div>
                  <div className="activity-mood-strip">
                    <span>Mood</span>
                    <div className="activity-moods">
                      {moodOptions.map((mood) => (
                        <button
                          className={`mood-sticker${habitMood === mood.key ? " selected" : ""}`}
                          key={mood.key}
                          style={{ "--mood": mood.tone } as CSSProperties}
                          type="button"
                          onClick={() => updateHabitMood(habit.id, mood.key)}
                          aria-label={`${mood.label} mood for ${habit.name}`}
                        >
                          <img src={assetUrl(mood.src)} alt="" />
                          <small>{mood.label}</small>
                        </button>
                      ))}
                    </div>
                  </div>
                </article>
              );
            })}
          </div>

          <label className="note-box">
            <span>Journal note</span>
            <textarea
              ref={noteRef}
              value={selectedRecord.note ?? ""}
              onChange={(event) => updateSelectedNote(event.target.value)}
              onInput={(event) => updateSelectedNote(event.currentTarget.value)}
              placeholder="A tiny note from today..."
            />
          </label>
        </section>

        <section className="month-panel" aria-labelledby="month-title">
          <div className="month-toolbar">
            <button
              className="round-button"
              type="button"
              onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
              aria-label="Previous month"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <div>
              <span className="section-kicker">Monthly matrix</span>
              <h2 id="month-title">{formatMonthLabel(visibleMonth)}</h2>
            </div>
            <button
              className="round-button"
              type="button"
              onClick={() => setVisibleMonth(addMonths(visibleMonth, 1))}
              aria-label="Next month"
            >
              <ArrowRight size={18} aria-hidden="true" />
            </button>
          </div>

          <div className="month-grid-wrap" role="region" aria-label="Monthly habit grid" tabIndex={0}>
            <div
              className="month-grid"
              style={{ "--day-count": monthDays.length } as CSSProperties}
            >
              <div className="grid-row header-row">
                <div className="habit-sticky header-habit">Habit</div>
                {monthDays.map((day) => {
                  const dayKey = localDateKey(day);
                  return (
                    <button
                      className={`day-header${selectedDate === dayKey ? " selected" : ""}`}
                      key={dayKey}
                      type="button"
                      onClick={() => setSelectedDate(dayKey)}
                    >
                      <span>{day.getDate()}</span>
                      <small>{weekdayLetter(day)}</small>
                    </button>
                  );
                })}
              </div>

              {activeHabits.map((habit) => (
                <div className="grid-row habit-row" key={habit.id}>
                  <div className="habit-sticky grid-habit-label">
                    <img src={assetUrl(habit.thumbnail)} alt="" />
                    <span>{habit.name}</span>
                  </div>
                  {monthDays.map((day) => {
                    const dayKey = localDateKey(day);
                    const record = tracker.days[dayKey];
                    const done = record?.completedHabitIds.includes(habit.id) ?? false;
                    const habitMood = record?.habitMoods?.[habit.id];
                    const moodOption = moodOptions.find((item) => item.key === habitMood);
                    return (
                      <button
                        className={`grid-cell${done ? " done" : ""}${moodOption ? " mooded" : ""}${
                          selectedDate === dayKey ? " selected" : ""
                        }`}
                        key={`${habit.id}-${dayKey}`}
                        style={
                          {
                            "--habit": habit.color,
                            "--mood": moodOption?.tone ?? habit.color
                          } as CSSProperties
                        }
                        type="button"
                        onClick={() => {
                          setSelectedDate(dayKey);
                          toggleCompletion(habit.id, dayKey);
                        }}
                        aria-label={
                          moodOption
                            ? `Clear ${habit.name} on ${dayKey}, ${moodOption.label} mood`
                            : `${done ? "Clear" : "Complete"} ${habit.name} on ${dayKey}`
                        }
                      >
                        {moodOption ? (
                          <img className="grid-mood-img" src={assetUrl(moodOption.src)} alt="" />
                        ) : done ? (
                          <Check size={16} aria-hidden="true" />
                        ) : null}
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </section>
      </section>

      {settingsOpen ? (
        <div className="settings-layer" role="dialog" aria-modal="true" aria-labelledby="settings-title">
          <button
            className="settings-backdrop"
            type="button"
            onClick={() => setSettingsOpen(false)}
            aria-label="Close habit settings"
          />
          <aside className="settings-drawer">
            <div className="drawer-header">
              <div>
                <span className="section-kicker">Tracker setup</span>
                <h2 id="settings-title">Habit thumbnails and list</h2>
              </div>
              <button className="round-button" type="button" onClick={() => setSettingsOpen(false)} aria-label="Close">
                <X size={18} aria-hidden="true" />
              </button>
            </div>

            <div className="add-habit-box">
              <label>
                <span>New habit</span>
                <input
                  value={newHabitName}
                  onChange={(event) => setNewHabitName(event.target.value)}
                  placeholder="Add a very specific little goal"
                />
              </label>
              <div className="thumbnail-picker compact" aria-label="Choose thumbnail for new habit">
                {thumbnailOptions.map((thumbnail) => (
                  <button
                    className={newHabitThumbnail === thumbnail.src ? "selected" : ""}
                    key={thumbnail.slug}
                    type="button"
                    onClick={() => setNewHabitThumbnail(thumbnail.src)}
                    title={thumbnail.label}
                  >
                    <img src={assetUrl(thumbnail.src)} alt="" />
                  </button>
                ))}
              </div>
              <button className="icon-text-button hot full" type="button" onClick={addHabit}>
                <Plus size={18} aria-hidden="true" />
                Add habit
              </button>
            </div>

            <div className="habit-editor-list">
              {sortedHabits.map((habit, index) => (
                <article className={`editor-card${habit.pausedAt ? " paused" : ""}`} key={habit.id}>
                  <img className="editor-thumb" src={assetUrl(habit.thumbnail)} alt="" />
                  <div className="editor-fields">
                    <input
                      value={habit.name}
                      onChange={(event) => updateHabit(habit.id, { name: event.target.value })}
                      aria-label={`Habit name for ${habit.name}`}
                    />
                    <input
                      value={habit.quip}
                      onChange={(event) => updateHabit(habit.id, { quip: event.target.value })}
                      aria-label={`Habit quip for ${habit.name}`}
                    />
                    <div className="thumbnail-picker" aria-label={`Choose thumbnail for ${habit.name}`}>
                      {thumbnailOptions.map((thumbnail) => (
                        <button
                          className={habit.thumbnail === thumbnail.src ? "selected" : ""}
                          key={thumbnail.slug}
                          type="button"
                          onClick={() => updateHabit(habit.id, { thumbnail: thumbnail.src })}
                          title={thumbnail.label}
                        >
                          <img src={assetUrl(thumbnail.src)} alt="" />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div className="editor-actions">
                    <button
                      className="round-button small"
                      type="button"
                      onClick={() => moveHabit(habit.id, -1)}
                      disabled={index === 0}
                      aria-label={`Move ${habit.name} up`}
                    >
                      <ArrowUp size={15} aria-hidden="true" />
                    </button>
                    <button
                      className="round-button small"
                      type="button"
                      onClick={() => moveHabit(habit.id, 1)}
                      disabled={index === sortedHabits.length - 1}
                      aria-label={`Move ${habit.name} down`}
                    >
                      <ArrowDown size={15} aria-hidden="true" />
                    </button>
                    <button className="tiny-text-button" type="button" onClick={() => togglePauseHabit(habit.id)}>
                      {habit.pausedAt ? "Resume" : "Pause"}
                    </button>
                    <button
                      className="round-button danger small"
                      type="button"
                      onClick={() => deleteHabit(habit.id)}
                      aria-label={`Delete ${habit.name}`}
                    >
                      <Trash2 size={15} aria-hidden="true" />
                    </button>
                  </div>
                </article>
              ))}
            </div>

            <button className="reset-button" type="button" onClick={resetTracker}>
              <RotateCcw size={17} aria-hidden="true" />
              Reset tracker
            </button>
          </aside>
        </div>
      ) : null}
    </main>
  );
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="stat-card">
      <span>{label}</span>
      <strong>{value}</strong>
    </div>
  );
}

function saveTrackerState(state: TrackerState) {
  if (typeof window !== "undefined") {
    const serialized = JSON.stringify(state);
    window.localStorage.setItem(STORAGE_KEY, serialized);
    saveCookieBackup(serialized);
    saveHistoryBackup(serialized);
  }
}

function readSavedTrackerState() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(STORAGE_KEY) ?? readCookieBackup() ?? readHistoryBackup();
}

function saveHistoryBackup(serialized: string) {
  const currentState = typeof window.history.state === "object" && window.history.state !== null ? window.history.state : {};
  window.history.replaceState({ ...currentState, [HISTORY_STATE_KEY]: serialized }, "", window.location.href);
}

function readHistoryBackup() {
  const currentState = window.history.state as Record<string, unknown> | null;
  const stored = currentState?.[HISTORY_STATE_KEY];
  return typeof stored === "string" ? stored : null;
}

function saveCookieBackup(serialized: string) {
  const encoded = encodeURIComponent(serialized);
  const chunkSize = 3400;
  const chunks = encoded.match(new RegExp(`.{1,${chunkSize}}`, "g")) ?? [""];
  const existingParts = Number(getCookie(`${COOKIE_KEY}_parts`) ?? 0);
  const maxParts = Math.max(existingParts, chunks.length);

  for (let index = 0; index < maxParts; index += 1) {
    const name = `${COOKIE_KEY}_${index}`;
    if (index < chunks.length) {
      document.cookie = `${name}=${chunks[index]}; Max-Age=31536000; path=/; SameSite=Lax`;
    } else {
      document.cookie = `${name}=; Max-Age=0; path=/; SameSite=Lax`;
    }
  }

  document.cookie = `${COOKIE_KEY}_parts=${chunks.length}; Max-Age=31536000; path=/; SameSite=Lax`;
}

function readCookieBackup() {
  const parts = Number(getCookie(`${COOKIE_KEY}_parts`) ?? 0);

  if (!Number.isFinite(parts) || parts <= 0) {
    return null;
  }

  const encoded = Array.from({ length: parts }, (_, index) => getCookie(`${COOKIE_KEY}_${index}`) ?? "").join("");

  try {
    return decodeURIComponent(encoded);
  } catch {
    return null;
  }
}

function getCookie(name: string) {
  const prefix = `${name}=`;
  return document.cookie
    .split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(prefix))
    ?.slice(prefix.length);
}

function removeHabitMood(moods: DayRecord["habitMoods"], habitId: string) {
  const next = { ...(moods ?? {}) };
  delete next[habitId];
  return next;
}

function localDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

function dateFromKey(key: string) {
  const [year, month, day] = key.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

function getMonthDays(date: Date) {
  const days: Date[] = [];
  const lastDay = new Date(date.getFullYear(), date.getMonth() + 1, 0).getDate();

  for (let day = 1; day <= lastDay; day += 1) {
    days.push(new Date(date.getFullYear(), date.getMonth(), day));
  }

  return days;
}

function formatMonthLabel(date: Date) {
  return new Intl.DateTimeFormat("en", { month: "long", year: "numeric" }).format(date);
}

function formatPrettyDate(key: string) {
  return new Intl.DateTimeFormat("en", {
    weekday: "short",
    month: "short",
    day: "numeric"
  }).format(dateFromKey(key));
}

function weekdayLetter(date: Date) {
  return new Intl.DateTimeFormat("en", { weekday: "short" }).format(date).slice(0, 1);
}

function countStreakEndingAt(dateKey: string, tracker: TrackerState, activeHabits: Habit[]) {
  if (activeHabits.length === 0) {
    return 0;
  }

  let count = 0;
  const cursor = dateFromKey(dateKey);

  while (count < 366) {
    const key = localDateKey(cursor);
    const record = tracker.days[key];
    const completed = activeHabits.some((habit) => record?.completedHabitIds.includes(habit.id));

    if (!completed) {
      break;
    }

    count += 1;
    cursor.setDate(cursor.getDate() - 1);
  }

  return count;
}

function countMonthProgress(days: Date[], activeHabits: Habit[], tracker: TrackerState) {
  const total = days.length * activeHabits.length;
  const completed = days.reduce((sum, day) => {
    const record = tracker.days[localDateKey(day)];
    if (!record) {
      return sum;
    }

    return (
      sum +
      activeHabits.filter((habit) => record.completedHabitIds.includes(habit.id)).length
    );
  }, 0);

  return { total, completed };
}

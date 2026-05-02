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
  useId,
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
  const [expandedHabitId, setExpandedHabitId] = useState<string | null>(null);
  const [monthOpen, setMonthOpen] = useState(true);

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
    const query = window.matchMedia("(max-width: 720px)");
    const syncMonthState = () => setMonthOpen(!query.matches);
    syncMonthState();
    query.addEventListener("change", syncMonthState);
    return () => query.removeEventListener("change", syncMonthState);
  }, []);

  useEffect(() => {
    selectedDateRef.current = selectedDate;
    setExpandedHabitId(null);
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

  const exportShareCard = useCallback(async () => {
    const canvas = document.createElement("canvas");
    canvas.width = 1080;
    canvas.height = 1620;

    const context = canvas.getContext("2d");
    if (!context) {
      window.alert("Could not create the image export.");
      return;
    }

    const dateLabel = formatPrettyDate(selectedDate);
    const habitRows = activeHabits.slice(0, 14);
    const completed = habitRows.filter((habit) => selectedRecord.completedHabitIds.includes(habit.id)).length;
    const gradient = context.createLinearGradient(0, 0, 1080, 1620);
    gradient.addColorStop(0, "#fffafd");
    gradient.addColorStop(0.52, "#ffe4f1");
    gradient.addColorStop(1, "#ffd8ea");

    context.fillStyle = gradient;
    context.fillRect(0, 0, 1080, 1620);
    drawShareGrid(context);
    drawShareSparkle(context, 90, 98, 34, "#ffd76b");
    drawShareSparkle(context, 965, 128, 28, "#ff4fa3");
    drawShareSparkle(context, 930, 1470, 38, "#ffd76b");
    drawShareSparkle(context, 118, 1492, 24, "#b88cff");

    roundRect(context, 62, 64, 956, 1492, 44);
    context.fillStyle = "rgba(255, 250, 253, 0.9)";
    context.fill();
    context.strokeStyle = "rgba(255, 79, 163, 0.28)";
    context.lineWidth = 3;
    context.stroke();

    drawShareLogo(context, 92, 96, 126);

    context.fillStyle = "#c02d7a";
    context.font = "900 30px Avenir Next, Trebuchet MS, Arial";
    context.fillText("made with tiny love", 246, 118);

    context.fillStyle = "#51223d";
    context.font = "950 68px Arial Rounded MT Bold, Trebuchet MS, Arial";
    context.fillText("Shivani's", 244, 188);
    context.fillText("Sparkle Streak", 244, 266);

    context.fillStyle = "#7b4564";
    context.font = "700 30px Avenir Next, Trebuchet MS, Arial";
    context.fillText(`${dateLabel}  |  ${completed}/${habitRows.length} little wins`, 94, 360);

    const progressWidth = Math.round((completed / Math.max(habitRows.length, 1)) * 780);
    roundRect(context, 94, 392, 780, 22, 999);
    context.fillStyle = "#ffe4f1";
    context.fill();
    roundRect(context, 94, 392, progressWidth, 22, 999);
    context.fillStyle = "#ff4fa3";
    context.fill();
    context.fillStyle = "#51223d";
    context.font = "950 34px Arial Rounded MT Bold, Trebuchet MS, Arial";
    context.fillText(`${Math.round((completed / Math.max(habitRows.length, 1)) * 100)}%`, 902, 416);

    let y = 470;
    for (const habit of habitRows) {
      const done = selectedRecord.completedHabitIds.includes(habit.id);
      const mood = selectedRecord.habitMoods?.[habit.id];
      const moodOption = moodOptions.find((item) => item.key === mood);

      roundRect(context, 94, y, 892, 70, 22);
      context.fillStyle = done ? colorWithAlpha(habit.color, 0.2) : "rgba(255, 250, 253, 0.82)";
      context.fill();
      context.strokeStyle = colorWithAlpha(habit.color, 0.42);
      context.lineWidth = 2;
      context.stroke();

      const habitImage = await loadCanvasImage(assetUrl(habit.thumbnail));
      if (habitImage) {
        drawRoundedImage(context, habitImage, 112, y + 9, 52, 52, 14);
      }

      context.fillStyle = "#51223d";
      context.font = "900 27px Arial Rounded MT Bold, Trebuchet MS, Arial";
      context.fillText(habit.name, 184, y + 32);
      context.fillStyle = "#8b5572";
      context.font = "700 20px Avenir Next, Trebuchet MS, Arial";
      context.fillText(done ? "done and dusted" : "waiting for sparkle", 184, y + 57);

      if (moodOption) {
        const moodImage = await loadCanvasImage(assetUrl(moodOption.src));
        if (moodImage) {
          drawRoundedImage(context, moodImage, 792, y + 10, 50, 50, 14);
        }
        context.fillStyle = "#51223d";
        context.font = "900 20px Avenir Next, Trebuchet MS, Arial";
        context.fillText(moodOption.label, 852, y + 42);
      } else {
        context.fillStyle = done ? "#ff4fa3" : "#d393b7";
        context.font = "900 24px Avenir Next, Trebuchet MS, Arial";
        context.fillText(done ? "checked" : "blank", 812, y + 42);
      }

      y += 82;
    }

    context.fillStyle = "#c02d7a";
    context.font = "900 26px Avenir Next, Trebuchet MS, Arial";
    context.fillText("tiny progress, soft heart, full sparkle", 94, 1512);

    const blob = await new Promise<Blob | null>((resolve) => canvas.toBlob(resolve, "image/png", 0.95));
    if (!blob) {
      window.alert("Could not finish the image export.");
      return;
    }

    downloadBlob(blob, `shivani-sparkle-streak-${selectedDate}.png`);
  }, [activeHabits, selectedDate, selectedRecord]);

  const exportBackup = useCallback(() => {
    const blob = new Blob([JSON.stringify(tracker, null, 2)], { type: "application/json" });
    downloadBlob(blob, `shivani-sparkle-streak-backup-${selectedDate}.json`);
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
        <div className="sparkle-field" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </div>

        <div className="brand-lockup">
          <LogoMark />
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
        </div>

        <div className="hero-actions" aria-label="Tracker actions">
          <button className="icon-text-button" type="button" onClick={selectToday}>
            <CalendarDays size={18} aria-hidden="true" />
            Today
          </button>
          <button className="icon-text-button" type="button" onClick={exportShareCard}>
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
          <LogoMark className="panel-watermark" decorative />
          <div className="section-header">
            <div className="section-title-lockup">
              <LogoMark className="section-logo" decorative />
              <div>
                <span className="section-kicker">Selected day</span>
                <h2 id="today-title">{formatPrettyDate(selectedDate)}</h2>
              </div>
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
              const moodOption = moodOptions.find((item) => item.key === habitMood);
              const moodMenuOpen = expandedHabitId === habit.id;
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
                    <button
                      className={`mood-pill${moodOption ? " selected" : ""}`}
                      style={{ "--mood": moodOption?.tone ?? habit.color } as CSSProperties}
                      type="button"
                      onClick={() => setExpandedHabitId(moodMenuOpen ? null : habit.id)}
                      aria-expanded={moodMenuOpen}
                      aria-label={`Choose mood for ${habit.name}`}
                    >
                      {moodOption ? (
                        <img src={assetUrl(moodOption.src)} alt="" />
                      ) : (
                        <Sparkles size={16} aria-hidden="true" />
                      )}
                      <span>{moodOption ? moodOption.label : "Pick mood"}</span>
                    </button>
                    {moodMenuOpen ? (
                      <div className="activity-mood-panel" aria-label={`Mood choices for ${habit.name}`}>
                        {moodOptions.map((mood) => (
                          <button
                            className={`mood-sticker${habitMood === mood.key ? " selected" : ""}`}
                            key={mood.key}
                            style={{ "--mood": mood.tone } as CSSProperties}
                            type="button"
                            onClick={() => {
                              updateHabitMood(habit.id, mood.key);
                              setExpandedHabitId(null);
                            }}
                            aria-label={`${mood.label} mood for ${habit.name}`}
                          >
                            <img src={assetUrl(mood.src)} alt="" />
                            <small>{mood.label}</small>
                          </button>
                        ))}
                      </div>
                    ) : null}
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

        <section className={`month-panel${monthOpen ? " open" : " collapsed"}`} aria-labelledby="month-title">
          <LogoMark className="panel-watermark month" decorative />
          <div className="month-toolbar">
            <button
              className="round-button"
              type="button"
              onClick={() => setVisibleMonth(addMonths(visibleMonth, -1))}
              aria-label="Previous month"
            >
              <ArrowLeft size={18} aria-hidden="true" />
            </button>
            <div className="month-title-lockup">
              <LogoMark className="section-logo" decorative />
              <div>
                <span className="section-kicker">Monthly matrix</span>
                <h2 id="month-title">{formatMonthLabel(visibleMonth)}</h2>
              </div>
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

          <button className="month-toggle" type="button" onClick={() => setMonthOpen((open) => !open)}>
            <CalendarDays size={17} aria-hidden="true" />
            {monthOpen ? "Hide monthly grid" : "Show monthly grid"}
          </button>

          <div className="month-panel-content">
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
            <LogoMark className="panel-watermark drawer" decorative />
            <div className="drawer-header">
              <div className="drawer-title-lockup">
                <LogoMark className="drawer-logo" />
                <div>
                  <span className="section-kicker">Tracker setup</span>
                  <h2 id="settings-title">Habit thumbnails and list</h2>
                </div>
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
            <button className="backup-button" type="button" onClick={exportBackup}>
              <Download size={17} aria-hidden="true" />
              Download data backup
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

function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = fileName;
  anchor.click();
  URL.revokeObjectURL(url);
}

async function loadCanvasImage(src: string) {
  return new Promise<HTMLImageElement | null>((resolve) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => resolve(null);
    image.src = src;
  });
}

function drawShareGrid(context: CanvasRenderingContext2D) {
  context.save();
  context.strokeStyle = "rgba(255, 79, 163, 0.08)";
  context.lineWidth = 2;

  for (let y = 0; y < 1620; y += 44) {
    context.beginPath();
    context.moveTo(0, y);
    context.lineTo(1080, y);
    context.stroke();
  }

  for (let x = 0; x < 1080; x += 44) {
    context.beginPath();
    context.moveTo(x, 0);
    context.lineTo(x, 1620);
    context.stroke();
  }

  context.restore();
}

function drawShareLogo(context: CanvasRenderingContext2D, x: number, y: number, size: number) {
  context.save();
  context.translate(x, y);
  const scale = size / 120;
  context.scale(scale, scale);

  const blush = context.createLinearGradient(18, 14, 104, 110);
  blush.addColorStop(0, "#fffafd");
  blush.addColorStop(0.46, "#ffe4f1");
  blush.addColorStop(1, "#ff8fc2");
  roundRect(context, 10, 10, 100, 100, 30);
  context.fillStyle = blush;
  context.fill();
  context.strokeStyle = "rgba(255, 79, 163, 0.35)";
  context.lineWidth = 2;
  context.stroke();

  const ribbon = context.createLinearGradient(30, 34, 90, 93);
  ribbon.addColorStop(0, "#ff4fa3");
  ribbon.addColorStop(1, "#b88cff");
  context.fillStyle = ribbon;
  context.beginPath();
  context.moveTo(37, 67);
  context.bezierCurveTo(46, 43, 68, 36, 87, 39);
  context.bezierCurveTo(80, 45, 75, 53, 73, 62);
  context.bezierCurveTo(81, 60, 88, 61, 94, 65);
  context.bezierCurveTo(77, 71, 66, 82, 60, 98);
  context.bezierCurveTo(54, 89, 46, 83, 36, 79);
  context.bezierCurveTo(44, 77, 51, 73, 57, 67);
  context.bezierCurveTo(49, 65, 42, 65, 37, 67);
  context.fill();

  context.strokeStyle = "#fffafd";
  context.lineWidth = 7;
  context.lineCap = "round";
  context.lineJoin = "round";
  context.beginPath();
  context.moveTo(36, 55);
  context.bezierCurveTo(45, 61, 54, 68, 63, 79);
  context.bezierCurveTo(73, 60, 84, 47, 99, 36);
  context.stroke();

  drawShareSparkle(context, 28, 43, 18, "#ffd76b");
  drawShareSparkle(context, 90, 28, 15, "#ff4fa3");
  drawShareSparkle(context, 91, 91, 17, "#ffd76b");
  context.fillStyle = "#83d8bc";
  context.beginPath();
  context.arc(31, 87, 5, 0, Math.PI * 2);
  context.fill();
  context.fillStyle = "#b88cff";
  context.beginPath();
  context.arc(76, 26, 4, 0, Math.PI * 2);
  context.fill();
  context.restore();
}

function drawShareSparkle(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  size: number,
  color: string
) {
  context.save();
  context.translate(x, y);
  context.fillStyle = color;
  context.beginPath();
  context.moveTo(0, -size);
  context.lineTo(size * 0.26, -size * 0.26);
  context.lineTo(size, 0);
  context.lineTo(size * 0.26, size * 0.26);
  context.lineTo(0, size);
  context.lineTo(-size * 0.26, size * 0.26);
  context.lineTo(-size, 0);
  context.lineTo(-size * 0.26, -size * 0.26);
  context.closePath();
  context.fill();
  context.restore();
}

function drawRoundedImage(
  context: CanvasRenderingContext2D,
  image: HTMLImageElement,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  context.save();
  roundRect(context, x, y, width, height, radius);
  context.clip();
  context.drawImage(image, x, y, width, height);
  context.restore();
}

function roundRect(
  context: CanvasRenderingContext2D,
  x: number,
  y: number,
  width: number,
  height: number,
  radius: number
) {
  if (width <= 0 || height <= 0) {
    return;
  }

  const safeRadius = Math.min(radius, width / 2, height / 2);
  context.beginPath();
  context.moveTo(x + safeRadius, y);
  context.arcTo(x + width, y, x + width, y + height, safeRadius);
  context.arcTo(x + width, y + height, x, y + height, safeRadius);
  context.arcTo(x, y + height, x, y, safeRadius);
  context.arcTo(x, y, x + width, y, safeRadius);
  context.closePath();
}

function colorWithAlpha(hex: string, alpha: number) {
  const fallback = `rgba(255, 79, 163, ${alpha})`;
  const match = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);

  if (!match) {
    return fallback;
  }

  const red = parseInt(match[1], 16);
  const green = parseInt(match[2], 16);
  const blue = parseInt(match[3], 16);
  return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
}

function LogoMark({ className = "sparkle-logo", decorative = false }: { className?: string; decorative?: boolean }) {
  const reactId = useId().replace(/:/g, "");
  const blushId = `${reactId}-logo-blush`;
  const ribbonId = `${reactId}-logo-ribbon`;

  return (
    <svg
      className={className}
      viewBox="0 0 120 120"
      role={decorative ? undefined : "img"}
      aria-label={decorative ? undefined : "Sparkle Streak logo"}
      aria-hidden={decorative ? true : undefined}
    >
      <defs>
        <linearGradient id={blushId} x1="18" x2="104" y1="14" y2="110" gradientUnits="userSpaceOnUse">
          <stop stopColor="#fffafd" />
          <stop offset="0.46" stopColor="#ffe4f1" />
          <stop offset="1" stopColor="#ff8fc2" />
        </linearGradient>
        <linearGradient id={ribbonId} x1="30" x2="90" y1="34" y2="93" gradientUnits="userSpaceOnUse">
          <stop stopColor="#ff4fa3" />
          <stop offset="1" stopColor="#b88cff" />
        </linearGradient>
      </defs>
      <rect x="10" y="10" width="100" height="100" rx="30" fill={`url(#${blushId})`} />
      <path
        d="M37 67c9-24 31-31 50-28-7 6-12 14-14 23 8-2 15-1 21 3-17 6-28 17-34 33-6-9-14-15-24-19 8-2 15-6 21-12-8-2-15-2-20 0Z"
        fill={`url(#${ribbonId})`}
      />
      <path
        d="M36 55c9 6 18 13 27 24 10-19 21-32 36-43"
        fill="none"
        stroke="#fffafd"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth="7"
      />
      <path d="M28 31 31 40 40 43 31 46 28 55 25 46 16 43 25 40Z" fill="#ffd76b" />
      <path d="M90 18 93 25 100 28 93 31 90 38 87 31 80 28 87 25Z" fill="#ff4fa3" />
      <path d="M91 80 94 88 102 91 94 94 91 102 88 94 80 91 88 88Z" fill="#ffd76b" />
      <circle cx="31" cy="87" r="5" fill="#83d8bc" />
      <circle cx="76" cy="26" r="4" fill="#b88cff" />
    </svg>
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

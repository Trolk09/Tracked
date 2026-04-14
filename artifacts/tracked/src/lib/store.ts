import { useCallback, useEffect, useState } from "react";

export type UserMode = "student" | "teacher";
export type RevisionKey = "d1" | "d3" | "d7" | "d14" | "d30";
export type ConfidenceRating = 1 | 2 | 3 | 4 | 5;

export interface ClassStudent {
  id: string;
  name: string;
  openTasks: number;
  chapters: number;
  studyMinutes: number;
  weakChapters: number;
  confidentChapters: number;
}

export interface UserSettings {
  mode: UserMode;
  name: string;
  email: string;
  className: string;
  syllabusName: string;
  students: ClassStudent[];
}

export interface Subject {
  id: string;
  name: string;
}

export interface Chapter {
  id: string;
  subjectId: string;
  name: string;
  studied: boolean;
  studiedDate?: string;
  sources: string;
  notesStatus: string;
  revisions: Record<RevisionKey, boolean>;
  weakness: string;
}

export interface Task {
  id: string;
  title: string;
  date: string;
  done: boolean;
  frequency: "once" | "daily" | "weekly";
}

export interface FocusSession {
  id: string;
  date: string;
  durationMinutes: number;
  chapterId: string;
  task: string;
  plannedVsCompleted: string;
  feedback: string;
  confidence: ConfidenceRating;
}

export interface Flashcard {
  id: string;
  chapterId: string;
  question: string;
  answer: string;
  mastered: boolean;
}

export interface Mistake {
  id: string;
  chapterId: string;
  question: string;
  correction: string;
  reason: string;
  date: string;
  status: "open" | "resolved";
  imageDataUrls: string[];
}

export interface WeeklyFeedback {
  id: string;
  weekStart: string;
  chapterId: string;
  confidence: ConfidenceRating;
  notes: string;
}

export interface ExamDate {
  id: string;
  title: string;
  date: string;
  subjectId?: string;
}

export interface StoreState {
  settings: UserSettings;
  subjects: Subject[];
  chapters: Chapter[];
  tasks: Task[];
  sessions: FocusSession[];
  flashcards: Flashcard[];
  mistakes: Mistake[];
  feedback: WeeklyFeedback[];
  exams: ExamDate[];
}

const defaultSettings: UserSettings = {
  mode: "student",
  name: "",
  email: "",
  className: "",
  syllabusName: "",
  students: [],
};

const defaultState: StoreState = {
  settings: defaultSettings,
  subjects: [],
  chapters: [],
  tasks: [],
  sessions: [],
  flashcards: [],
  mistakes: [],
  feedback: [],
  exams: [],
};

const storageKey = "tracked_store";
export const revisionOffsets: Record<RevisionKey, number> = { d1: 1, d3: 3, d7: 7, d14: 14, d30: 30 };
export const revisionLabels: Record<RevisionKey, string> = { d1: "D1", d3: "D3", d7: "D7", d14: "D14", d30: "D30" };

export function dateKey(date = new Date()) {
  return date.toISOString().slice(0, 10);
}

export function addDays(date: string, days: number) {
  const next = new Date(`${date}T12:00:00`);
  next.setDate(next.getDate() + days);
  return dateKey(next);
}

export function startOfWeek(date = new Date()) {
  const next = new Date(date);
  const day = next.getDay();
  next.setDate(next.getDate() - day + 1);
  return dateKey(next);
}

export function nextSaturday(from = new Date()) {
  const next = new Date(from);
  const distance = (6 - next.getDay() + 7) % 7 || 7;
  next.setDate(next.getDate() + distance);
  return dateKey(next);
}

export function revisionDate(chapter: Chapter, key: RevisionKey) {
  if (!chapter.studiedDate) return "";
  return addDays(chapter.studiedDate.slice(0, 10), revisionOffsets[key]);
}

export function getChapterName(state: StoreState, chapterId: string) {
  return state.chapters.find((chapter) => chapter.id === chapterId)?.name || "Unknown chapter";
}

export function getSubjectName(state: StoreState, subjectId?: string) {
  if (!subjectId) return "General";
  return state.subjects.find((subject) => subject.id === subjectId)?.name || "Deleted subject";
}

export function getLatestFeedback(state: StoreState, chapterId: string) {
  return state.feedback.filter((item) => item.chapterId === chapterId).slice().sort((a, b) => b.weekStart.localeCompare(a.weekStart))[0];
}

export function chapterStatus(state: StoreState, chapterId: string) {
  const chapter = state.chapters.find((item) => item.id === chapterId);
  const latest = getLatestFeedback(state, chapterId);
  if (latest?.confidence && latest.confidence <= 2) return "Weak";
  if (latest?.confidence && latest.confidence >= 4) return "Confident";
  if (chapter?.weakness.trim()) return "Weak";
  return "Improving";
}

function normalizeStudents(students: unknown): ClassStudent[] {
  if (!Array.isArray(students)) return [];
  return students.map((student) => {
    if (typeof student === "string") {
      return { id: createId(), name: student, openTasks: 0, chapters: 0, studyMinutes: 0, weakChapters: 0, confidentChapters: 0 };
    }
    const item = student as Partial<ClassStudent>;
    return {
      id: item.id || createId(),
      name: item.name || "Student",
      openTasks: item.openTasks || 0,
      chapters: item.chapters || 0,
      studyMinutes: item.studyMinutes || 0,
      weakChapters: item.weakChapters || 0,
      confidentChapters: item.confidentChapters || 0,
    };
  });
}

function normalizeState(value: unknown): StoreState {
  const stored = value as Partial<StoreState> | null;
  return {
    ...defaultState,
    ...(stored || {}),
    settings: { ...defaultSettings, ...(stored?.settings || {}), students: normalizeStudents(stored?.settings?.students) },
    subjects: stored?.subjects || [],
    chapters: (stored?.chapters || []).map((chapter) => ({
      ...chapter,
      sources: chapter.sources || "",
      notesStatus: chapter.notesStatus || "none",
      revisions: { d1: false, d3: false, d7: false, d14: false, d30: false, ...(chapter.revisions || {}) },
      weakness: chapter.weakness || "",
    })),
    tasks: stored?.tasks || [],
    sessions: (stored?.sessions || []).map((session) => ({ ...session, chapterId: session.chapterId || "", feedback: session.feedback || "", confidence: session.confidence || 3 })),
    flashcards: stored?.flashcards || [],
    mistakes: (stored?.mistakes || []).map((mistake) => ({ ...mistake, imageDataUrls: mistake.imageDataUrls || [] })),
    feedback: stored?.feedback || [],
    exams: stored?.exams || [],
  };
}

function createId() {
  return crypto.randomUUID ? crypto.randomUUID() : `${Date.now()}-${Math.random()}`;
}

export function useStore() {
  const [state, setState] = useState<StoreState>(() => {
    try {
      const stored = localStorage.getItem(storageKey);
      return stored ? normalizeState(JSON.parse(stored)) : defaultState;
    } catch {
      return defaultState;
    }
  });

  useEffect(() => {
    localStorage.setItem(storageKey, JSON.stringify(state));
  }, [state]);

  const updateSettings = useCallback((settings: Partial<UserSettings>) => {
    setState((current) => ({ ...current, settings: { ...current.settings, ...settings } }));
  }, []);

  const addStudent = useCallback((name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setState((current) => ({
      ...current,
      settings: {
        ...current.settings,
        students: [...current.settings.students, { id: createId(), name: clean, openTasks: 0, chapters: 0, studyMinutes: 0, weakChapters: 0, confidentChapters: 0 }],
      },
    }));
  }, []);

  const updateStudent = useCallback((id: string, updates: Partial<ClassStudent>) => {
    setState((current) => ({ ...current, settings: { ...current.settings, students: current.settings.students.map((student) => student.id === id ? { ...student, ...updates } : student) } }));
  }, []);

  const removeStudent = useCallback((id: string) => {
    setState((current) => ({ ...current, settings: { ...current.settings, students: current.settings.students.filter((student) => student.id !== id) } }));
  }, []);

  const addSubject = useCallback((name: string) => {
    const clean = name.trim();
    if (!clean) return;
    setState((current) => ({ ...current, subjects: [...current.subjects, { id: createId(), name: clean }] }));
  }, []);

  const updateSubject = useCallback((id: string, name: string) => {
    setState((current) => ({ ...current, subjects: current.subjects.map((subject) => subject.id === id ? { ...subject, name } : subject) }));
  }, []);

  const deleteSubject = useCallback((id: string) => {
    setState((current) => {
      const chapterIds = current.chapters.filter((chapter) => chapter.subjectId === id).map((chapter) => chapter.id);
      return {
        ...current,
        subjects: current.subjects.filter((subject) => subject.id !== id),
        chapters: current.chapters.filter((chapter) => chapter.subjectId !== id),
        flashcards: current.flashcards.filter((card) => !chapterIds.includes(card.chapterId)),
        mistakes: current.mistakes.filter((mistake) => !chapterIds.includes(mistake.chapterId)),
        feedback: current.feedback.filter((item) => !chapterIds.includes(item.chapterId)),
        sessions: current.sessions.filter((session) => !chapterIds.includes(session.chapterId)),
        exams: current.exams.filter((exam) => exam.subjectId !== id),
      };
    });
  }, []);

  const addChapter = useCallback((subjectId: string, name: string) => {
    const clean = name.trim();
    if (!subjectId || !clean) return;
    setState((current) => ({
      ...current,
      chapters: [...current.chapters, {
        id: createId(),
        subjectId,
        name: clean,
        studied: false,
        sources: "",
        notesStatus: "none",
        revisions: { d1: false, d3: false, d7: false, d14: false, d30: false },
        weakness: "",
      }],
    }));
  }, []);

  const updateChapter = useCallback((id: string, updates: Partial<Chapter>) => {
    setState((current) => ({
      ...current,
      chapters: current.chapters.map((chapter) => {
        if (chapter.id !== id) return chapter;
        const next = { ...chapter, ...updates };
        if (updates.studied && !chapter.studied) next.studiedDate = dateKey();
        if (updates.studied === false) next.studiedDate = undefined;
        return next;
      }),
    }));
  }, []);

  const deleteChapter = useCallback((id: string) => {
    setState((current) => ({
      ...current,
      chapters: current.chapters.filter((chapter) => chapter.id !== id),
      flashcards: current.flashcards.filter((card) => card.chapterId !== id),
      mistakes: current.mistakes.filter((mistake) => mistake.chapterId !== id),
      feedback: current.feedback.filter((item) => item.chapterId !== id),
      sessions: current.sessions.filter((session) => session.chapterId !== id),
    }));
  }, []);

  const addTask = useCallback((task: Omit<Task, "id" | "done">) => {
    const clean = task.title.trim();
    if (!clean || !task.date) return;
    setState((current) => ({ ...current, tasks: [...current.tasks, { ...task, title: clean, id: createId(), done: false }] }));
  }, []);

  const updateTask = useCallback((id: string, updates: Partial<Task>) => {
    setState((current) => ({ ...current, tasks: current.tasks.map((task) => task.id === id ? { ...task, ...updates } : task) }));
  }, []);

  const deleteTask = useCallback((id: string) => {
    setState((current) => ({ ...current, tasks: current.tasks.filter((task) => task.id !== id) }));
  }, []);

  const addSession = useCallback((session: Omit<FocusSession, "id">) => {
    if (!session.chapterId) return;
    setState((current) => ({ ...current, sessions: [...current.sessions, { ...session, id: createId() }] }));
  }, []);

  const addFlashcard = useCallback((card: Omit<Flashcard, "id" | "mastered">) => {
    if (!card.chapterId || !card.question.trim() || !card.answer.trim()) return;
    setState((current) => ({ ...current, flashcards: [...current.flashcards, { ...card, question: card.question.trim(), answer: card.answer.trim(), id: createId(), mastered: false }] }));
  }, []);

  const updateFlashcard = useCallback((id: string, updates: Partial<Flashcard>) => {
    setState((current) => ({ ...current, flashcards: current.flashcards.map((card) => card.id === id ? { ...card, ...updates } : card) }));
  }, []);

  const deleteFlashcard = useCallback((id: string) => {
    setState((current) => ({ ...current, flashcards: current.flashcards.filter((card) => card.id !== id) }));
  }, []);

  const addMistake = useCallback((mistake: Omit<Mistake, "id" | "status">) => {
    if (!mistake.chapterId || (!mistake.question.trim() && mistake.imageDataUrls.length === 0)) return;
    setState((current) => ({ ...current, mistakes: [...current.mistakes, { ...mistake, id: createId(), status: "open" }] }));
  }, []);

  const updateMistake = useCallback((id: string, updates: Partial<Mistake>) => {
    setState((current) => ({ ...current, mistakes: current.mistakes.map((mistake) => mistake.id === id ? { ...mistake, ...updates } : mistake) }));
  }, []);

  const deleteMistake = useCallback((id: string) => {
    setState((current) => ({ ...current, mistakes: current.mistakes.filter((mistake) => mistake.id !== id) }));
  }, []);

  const addFeedback = useCallback((feedback: Omit<WeeklyFeedback, "id">) => {
    if (!feedback.chapterId) return;
    setState((current) => {
      const nextTasks = [...current.tasks];
      if (feedback.confidence <= 2) {
        const chapter = current.chapters.find((item) => item.id === feedback.chapterId);
        nextTasks.push({
          id: createId(),
          title: `Weekend weak-chapter review: ${chapter?.name || "chapter"}`,
          date: nextSaturday(),
          done: false,
          frequency: "once",
        });
      }
      return { ...current, tasks: nextTasks, feedback: [...current.feedback, { ...feedback, id: createId() }] };
    });
  }, []);

  const setChapterConfidence = useCallback((chapterId: string, confidence: ConfidenceRating, notes = "Updated from subject table") => {
    if (!chapterId) return;
    setState((current) => {
      const chapter = current.chapters.find((item) => item.id === chapterId);
      const nextTasks = [...current.tasks];
      if (confidence <= 2) {
        nextTasks.push({ id: createId(), title: `Weekend weak-chapter review: ${chapter?.name || "chapter"}`, date: nextSaturday(), done: false, frequency: "once" });
      }
      return { ...current, tasks: nextTasks, feedback: [...current.feedback, { id: createId(), weekStart: startOfWeek(), chapterId, confidence, notes }] };
    });
  }, []);

  const addExam = useCallback((exam: Omit<ExamDate, "id">) => {
    if (!exam.title.trim() || !exam.date) return;
    setState((current) => ({ ...current, exams: [...current.exams, { ...exam, title: exam.title.trim(), id: createId() }] }));
  }, []);

  const deleteExam = useCallback((id: string) => {
    setState((current) => ({ ...current, exams: current.exams.filter((exam) => exam.id !== id) }));
  }, []);

  const resetAll = useCallback(() => setState(defaultState), []);

  return {
    state,
    updateSettings,
    addStudent,
    updateStudent,
    removeStudent,
    addSubject,
    updateSubject,
    deleteSubject,
    addChapter,
    updateChapter,
    deleteChapter,
    addTask,
    updateTask,
    deleteTask,
    addSession,
    addFlashcard,
    updateFlashcard,
    deleteFlashcard,
    addMistake,
    updateMistake,
    deleteMistake,
    addFeedback,
    setChapterConfidence,
    addExam,
    deleteExam,
    resetAll,
  };
}

export type FeedbackEntry = {
  id: string;
  createdAt: string;
  isStudent: string;
  message: string;
};

const STORAGE_KEY = 'cow_feedback_v1';

function createId() {
  return `fb_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`;
}

export function loadFeedbackEntries(): FeedbackEntry[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw) as FeedbackEntry[];
  } catch {
    return [];
  }
}

export function saveFeedbackEntries(items: FeedbackEntry[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
}

export function addFeedbackEntry(payload: {
  isStudent: string;
  message: string;
}) {
  const next: FeedbackEntry = {
    id: createId(),
    createdAt: new Date().toISOString(),
    isStudent: payload.isStudent,
    message: payload.message,
  };
  const items = loadFeedbackEntries();
  const updated = [next, ...items];
  saveFeedbackEntries(updated);
  return next;
}

export function removeFeedbackEntry(id: string) {
  const items = loadFeedbackEntries();
  const updated = items.filter((item) => item.id !== id);
  saveFeedbackEntries(updated);
  return updated;
}

const DB_NAME = "mdcat_quiz_db";
const DB_VERSION = 3;
const QUESTIONS_STORE = "questions";
const PROGRESS_STORE = "mock_progress";
const SUBSCRIPTION_STORE = "subscriptions";

function openDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(QUESTIONS_STORE)) {
        const store = db.createObjectStore(QUESTIONS_STORE, { keyPath: "id" });
        store.createIndex("subject", "subject", { unique: false });
        store.createIndex("difficulty", "difficulty", { unique: false });
        store.createIndex("subject_difficulty", ["subject", "difficulty"], { unique: false });
      }
      if (!db.objectStoreNames.contains(PROGRESS_STORE)) {
        db.createObjectStore(PROGRESS_STORE, { keyPath: "username" });
      }
      if (!db.objectStoreNames.contains(SUBSCRIPTION_STORE)) {
        db.createObjectStore(SUBSCRIPTION_STORE, { keyPath: "username" });
      }
    };
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => reject(request.error);
  });
}

// ─── Subscription store ───
export interface SubscriptionRecord {
  username: string;
  isPremium: boolean;
  plan: string;
  method: string;
  reference: string;
  amount: number;
  startDate: number;
  expiryDate: number;
  updatedAt: number;
}

export async function saveSubscription(rec: SubscriptionRecord): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SUBSCRIPTION_STORE, "readwrite");
    tx.objectStore(SUBSCRIPTION_STORE).put(rec);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getSubscription(username: string): Promise<SubscriptionRecord | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(SUBSCRIPTION_STORE, "readonly");
    const req = tx.objectStore(SUBSCRIPTION_STORE).get(username);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function isSubscriptionActive(username: string): Promise<boolean> {
  const sub = await getSubscription(username);
  if (!sub) return false;
  return sub.isPremium && sub.expiryDate > Date.now();
}

// ─── Question types & CRUD ───

export interface StoredQuestion {
  id: string;
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: "easy" | "intermediate" | "hard";
  createdAt: number;
  updatedAt: number;
}

export async function addQuestion(q: Omit<StoredQuestion, "id" | "createdAt" | "updatedAt">): Promise<StoredQuestion> {
  const db = await openDB();
  const now = Date.now();
  const record: StoredQuestion = { ...q, id: `q_${now}_${Math.random().toString(36).slice(2, 8)}`, createdAt: now, updatedAt: now };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUESTIONS_STORE, "readwrite");
    tx.objectStore(QUESTIONS_STORE).add(record);
    tx.oncomplete = () => resolve(record);
    tx.onerror = () => reject(tx.error);
  });
}

export async function updateQuestion(q: StoredQuestion): Promise<StoredQuestion> {
  const db = await openDB();
  const updated = { ...q, updatedAt: Date.now() };
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUESTIONS_STORE, "readwrite");
    tx.objectStore(QUESTIONS_STORE).put(updated);
    tx.oncomplete = () => resolve(updated);
    tx.onerror = () => reject(tx.error);
  });
}

export async function deleteQuestion(id: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUESTIONS_STORE, "readwrite");
    tx.objectStore(QUESTIONS_STORE).delete(id);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getAllQuestions(): Promise<StoredQuestion[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUESTIONS_STORE, "readonly");
    const req = tx.objectStore(QUESTIONS_STORE).getAll();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function getQuestionsBySubjectFromDB(subject: string): Promise<StoredQuestion[]> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUESTIONS_STORE, "readonly");
    const idx = tx.objectStore(QUESTIONS_STORE).index("subject");
    const req = idx.getAll(subject);
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

export async function importQuestions(questions: Omit<StoredQuestion, "createdAt" | "updatedAt">[]): Promise<void> {
  const db = await openDB();
  const now = Date.now();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUESTIONS_STORE, "readwrite");
    const store = tx.objectStore(QUESTIONS_STORE);
    questions.forEach((q) => {
      store.put({ ...q, createdAt: now, updatedAt: now });
    });
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getQuestionCount(): Promise<number> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(QUESTIONS_STORE, "readonly");
    const req = tx.objectStore(QUESTIONS_STORE).count();
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

/** Migrate localStorage questions to IndexedDB (run once) */
export async function migrateFromLocalStorage(): Promise<number> {
  const raw = localStorage.getItem("mdcat_custom_questions");
  if (!raw) return 0;
  try {
    const parsed = JSON.parse(raw) as any[];
    if (!parsed.length) return 0;
    await importQuestions(parsed.map((q) => ({
      id: q.id || `migrated_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      subject: q.subject,
      question: q.question,
      options: q.options,
      correctAnswer: q.correctAnswer,
      difficulty: q.difficulty,
    })));
    localStorage.removeItem("mdcat_custom_questions");
    return parsed.length;
  } catch {
    return 0;
  }
}

// ─── Mock Test Progress ───

export interface MockProgress {
  username: string;
  questions: any[]; // Question[]
  answers: (number | null)[];
  currentIndex: number;
  secondsLeft: number;
  savedAt: number;
}

export async function saveMockProgress(progress: MockProgress): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROGRESS_STORE, "readwrite");
    tx.objectStore(PROGRESS_STORE).put(progress);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

export async function getMockProgress(username: string): Promise<MockProgress | null> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROGRESS_STORE, "readonly");
    const req = tx.objectStore(PROGRESS_STORE).get(username);
    req.onsuccess = () => resolve(req.result || null);
    req.onerror = () => reject(req.error);
  });
}

export async function deleteMockProgress(username: string): Promise<void> {
  const db = await openDB();
  return new Promise((resolve, reject) => {
    const tx = db.transaction(PROGRESS_STORE, "readwrite");
    tx.objectStore(PROGRESS_STORE).delete(username);
    tx.oncomplete = () => resolve();
    tx.onerror = () => reject(tx.error);
  });
}

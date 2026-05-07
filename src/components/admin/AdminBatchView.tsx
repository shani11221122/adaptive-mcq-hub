import { ArrowLeft, Check } from "lucide-react";
import { subjects, type Difficulty } from "@/lib/quiz-data";

export interface BatchEntry {
  subject: string;
  question: string;
  options: string[];
  correctAnswer: number;
  difficulty: Difficulty;
}

interface Props {
  batchSubject: string;
  batchDifficulty: Difficulty;
  batchEntries: BatchEntry[];
  currentBatchIdx: number;
  setCurrentBatchIdx: (i: number) => void;
  updateBatchEntry: (idx: number, update: Partial<BatchEntry>) => void;
  onSave: () => void;
  onBack: () => void;
}

const AdminBatchView = ({
  batchSubject, batchDifficulty, batchEntries,
  currentBatchIdx, setCurrentBatchIdx, updateBatchEntry, onSave, onBack,
}: Props) => {
  const entry = batchEntries[currentBatchIdx];
  const filledCount = batchEntries.filter(e => e.question.trim() && e.options.every(o => o.trim())).length;

  if (!entry) return null;

  return (
    <div className="h-dvh flex flex-col bg-background">
      <div className="bg-primary px-4 pt-8 pb-4 shrink-0" style={{ paddingTop: "max(2rem, env(safe-area-inset-top))" }}>
        <div className="flex items-center gap-3">
          <button onClick={onBack} className="text-primary-foreground">
            <ArrowLeft size={22} />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-lg font-extrabold text-primary-foreground">Batch Insert</h1>
            <p className="text-primary-foreground/60 text-xs">
              {subjects.find(s => s.id === batchSubject)?.name} · {batchDifficulty} · {filledCount}/10 filled
            </p>
          </div>
          <button
            onClick={onSave}
            disabled={filledCount === 0}
            className="bg-primary-foreground/20 text-primary-foreground px-4 py-2 rounded-xl text-xs font-bold disabled:opacity-40"
          >
            Save All ({filledCount})
          </button>
        </div>
      </div>

      <div className="shrink-0 px-4 py-3 flex gap-1.5 overflow-x-auto scrollbar-none border-b border-border">
        {batchEntries.map((e, i) => {
          const filled = e.question.trim() && e.options.every(o => o.trim());
          return (
            <button
              key={i}
              onClick={() => setCurrentBatchIdx(i)}
              className={`w-9 h-9 rounded-xl text-xs font-bold shrink-0 transition-all duration-100 ${
                i === currentBatchIdx
                  ? "bg-primary text-primary-foreground shadow-md scale-110"
                  : filled
                  ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400"
                  : "bg-muted text-muted-foreground"
              }`}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto overscroll-contain px-4 py-4">
        <div className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-muted-foreground mb-1 block">
              Question {currentBatchIdx + 1} of 10
            </label>
            <textarea
              placeholder="Enter your question..."
              value={entry.question}
              onChange={e => updateBatchEntry(currentBatchIdx, { question: e.target.value })}
              className="w-full min-h-[80px] rounded-xl border border-input bg-background px-3 py-2.5 text-sm resize-none text-foreground placeholder:text-muted-foreground"
            />
          </div>

          <div className="space-y-2">
            <p className="text-xs font-semibold text-muted-foreground">Options (tap letter to mark correct)</p>
            {entry.options.map((opt, i) => (
              <div key={i} className="flex gap-2 items-center">
                <button
                  type="button"
                  onClick={() => updateBatchEntry(currentBatchIdx, { correctAnswer: i })}
                  className={`w-8 h-8 rounded-lg flex items-center justify-center text-xs font-bold shrink-0 transition-colors duration-100 ${
                    entry.correctAnswer === i
                      ? "bg-primary text-primary-foreground"
                      : "bg-secondary text-secondary-foreground"
                  }`}
                >
                  {entry.correctAnswer === i ? <Check size={14} /> : String.fromCharCode(65 + i)}
                </button>
                <input
                  placeholder={`Option ${String.fromCharCode(65 + i)}`}
                  value={opt}
                  onChange={e => {
                    const opts = [...entry.options];
                    opts[i] = e.target.value;
                    updateBatchEntry(currentBatchIdx, { options: opts });
                  }}
                  className="flex-1 h-10 rounded-xl border border-input bg-background px-3 text-sm text-foreground placeholder:text-muted-foreground"
                />
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="shrink-0 px-4 py-3 border-t border-border flex gap-2" style={{ paddingBottom: "max(0.75rem, env(safe-area-inset-bottom))" }}>
        <button
          onClick={() => setCurrentBatchIdx(Math.max(0, currentBatchIdx - 1))}
          disabled={currentBatchIdx === 0}
          className="flex-1 h-11 rounded-xl border border-border text-sm font-semibold text-foreground disabled:opacity-30"
        >
          Previous
        </button>
        <button
          onClick={() => setCurrentBatchIdx(Math.min(9, currentBatchIdx + 1))}
          disabled={currentBatchIdx === 9}
          className="flex-1 h-11 rounded-xl bg-primary text-primary-foreground text-sm font-semibold disabled:opacity-30"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminBatchView;

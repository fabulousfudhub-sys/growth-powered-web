import { useEffect } from 'react';
import type { Question } from '@/lib/types';

interface UseExamKeyboardProps {
  questions: Question[];
  currentQ: number;
  setCurrentQ: (fn: (prev: number) => number) => void;
  setAnswer: (qId: string, val: string) => void;
  answers: Record<string, string>;
  enabled: boolean;
}

export function useExamKeyboard({
  questions,
  currentQ,
  setCurrentQ,
  setAnswer,
  answers,
  enabled,
}: UseExamKeyboardProps) {
  useEffect(() => {
    if (!enabled || questions.length === 0) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is typing in an input/textarea
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA') return;

      const q = questions[currentQ];
      if (!q) return;

      // Arrow keys for navigation
      if (e.key === 'ArrowRight' || e.key === 'ArrowDown') {
        e.preventDefault();
        if (currentQ < questions.length - 1) {
          setCurrentQ((prev) => prev + 1);
        }
        return;
      }
      if (e.key === 'ArrowLeft' || e.key === 'ArrowUp') {
        e.preventDefault();
        if (currentQ > 0) {
          setCurrentQ((prev) => prev - 1);
        }
        return;
      }

      // Number keys to jump to question (1-9 for Q1-Q9, 0 for Q10)
      const num = parseInt(e.key);
      if (!isNaN(num) && !e.ctrlKey && !e.altKey && !e.metaKey) {
        const targetIdx = num === 0 ? 9 : num - 1;
        if (targetIdx < questions.length) {
          e.preventDefault();
          setCurrentQ(() => targetIdx);
        }
        return;
      }

      // A-E keys for MCQ / True-False selection
      const letterMap: Record<string, number> = { a: 0, b: 1, c: 2, d: 3, e: 4 };
      const key = e.key.toLowerCase();

      if (key in letterMap) {
        if (q.type === 'mcq' && q.options) {
          const idx = letterMap[key];
          if (idx < q.options.length) {
            e.preventDefault();
            setAnswer(q.id, q.options[idx]);
          }
        } else if (q.type === 'true_false') {
          if (key === 'a') {
            e.preventDefault();
            setAnswer(q.id, 'True');
          } else if (key === 'b') {
            e.preventDefault();
            setAnswer(q.id, 'False');
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [enabled, questions, currentQ, setCurrentQ, setAnswer, answers]);
}

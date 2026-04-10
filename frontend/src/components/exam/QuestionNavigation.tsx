import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import type { Question } from '@/lib/types';

interface QuestionNavigationProps {
  questions: Question[];
  answers: Record<string, string>;
  currentQ: number;
  onNavigate: (index: number) => void;
  answeredCount: number;
}

export default function QuestionNavigation({ questions, answers, currentQ, onNavigate, answeredCount }: QuestionNavigationProps) {
  return (
    <Card className="sticky top-20">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm">Navigation</CardTitle>
        <p className="text-[10px] text-muted-foreground mt-1">Press 1-9/0 keys to jump</p>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-5 gap-2">
          {questions.map((qu, i) => {
            const isAnswered = !!answers[qu.id] && answers[qu.id].trim() !== '';
            const isCurrent = i === currentQ;
            let cls = 'question-nav-btn unanswered';
            if (isAnswered) cls = 'question-nav-btn answered';
            if (isCurrent) cls = 'question-nav-btn current-active';
            return (
              <button key={qu.id} className={cls} onClick={() => onNavigate(i)}>
                {i + 1}
              </button>
            );
          })}
        </div>
        <div className="mt-4 space-y-1.5 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-accent inline-block" /> Answered
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-muted inline-block border" /> Unanswered
          </div>
          <div className="flex items-center gap-2">
            <span className="w-3 h-3 rounded-sm bg-primary inline-block" /> Current
          </div>
        </div>
        <div className="mt-4 pt-4 border-t">
          <p className="text-xs text-muted-foreground">{answeredCount}/{questions.length} answered</p>
          <p className="text-[10px] text-muted-foreground mt-1">← → arrow keys to navigate</p>
        </div>
      </CardContent>
    </Card>
  );
}

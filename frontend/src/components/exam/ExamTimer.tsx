import { Clock } from 'lucide-react';

interface ExamTimerProps {
  timeLeft: number;
  totalDuration: number; // in seconds
}

export default function ExamTimer({ timeLeft, totalDuration }: ExamTimerProps) {
  const twoThirdsThreshold = totalDuration / 3; // remaining 1/3 means 2/3 elapsed
  const isWarning = timeLeft <= twoThirdsThreshold && timeLeft > 300;
  const isCritical = timeLeft <= 300;

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`;
  };

  let timerClass = 'bg-muted text-foreground';
  if (isCritical) {
    timerClass = 'bg-destructive/15 text-destructive animate-pulse';
  } else if (isWarning) {
    timerClass = 'bg-warning/15 text-warning';
  }

  return (
    <div className={`exam-timer px-4 py-1.5 rounded-lg transition-colors duration-500 ${timerClass}`}>
      <Clock className="w-4 h-4 inline mr-1.5" />
      {formatTime(timeLeft)}
    </div>
  );
}

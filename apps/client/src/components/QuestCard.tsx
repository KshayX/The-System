import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import './QuestCard.css';
import { ProgressBar } from './ProgressBar';

dayjs.extend(duration);

type Props = {
  title: string;
  description: string;
  status: string;
  expiresAt?: string | null;
  remainingSeconds?: number | null;
  xpReward: number;
  difficulty: string;
  onComplete?: () => void;
  onFail?: () => void;
  actions?: React.ReactNode;
};

export function QuestCard(props: Props) {
  const {
    title,
    description,
    status,
    expiresAt,
    remainingSeconds,
    xpReward,
    difficulty,
    onComplete,
    onFail,
    actions,
  } = props;

  const remainingLabel = (() => {
    if (!expiresAt && !remainingSeconds) return 'No timer';
    const seconds = remainingSeconds ?? dayjs(expiresAt!).diff(dayjs(), 'second');
    const clamped = Math.max(0, seconds);
    const duration = dayjs.duration(clamped, 'second');
    return `${duration.hours().toString().padStart(2, '0')}:${duration
      .minutes()
      .toString()
      .padStart(2, '0')}:${duration.seconds().toString().padStart(2, '0')}`;
  })();

  return (
    <article className={`quest-card quest-${status.toLowerCase()}`}>
      <header>
        <div>
          <h3>{title}</h3>
          <span className="quest-difficulty">{difficulty}-Rank</span>
        </div>
        <span className={`quest-status quest-status-${status.toLowerCase()}`}>{status}</span>
      </header>
      <p>{description}</p>
      <div className="quest-meta">
        <ProgressBar label={`XP Reward ${xpReward}`} percentage={Math.min(100, (xpReward / 500) * 100)} />
        <div className="quest-timer">Timer: {remainingLabel}</div>
      </div>
      <footer>
        <div className="quest-actions">
          {onComplete ? (
            <button onClick={onComplete} className="quest-btn success">
              Complete
            </button>
          ) : null}
          {onFail ? (
            <button onClick={onFail} className="quest-btn danger">
              Fail Quest
            </button>
          ) : null}
          {actions}
        </div>
      </footer>
    </article>
  );
}

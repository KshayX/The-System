import './ProgressBar.css';

type Props = {
  percentage: number;
  label?: string;
};

export function ProgressBar({ percentage, label }: Props) {
  const clamped = Math.min(100, Math.max(0, percentage));
  return (
    <div className="progress">
      {label ? <span className="progress-label">{label}</span> : null}
      <div className="progress-track">
        <div className="progress-fill" style={{ width: `${clamped}%` }} />
      </div>
    </div>
  );
}

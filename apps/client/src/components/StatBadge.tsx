import classNames from 'classnames';
import './StatBadge.css';

type Props = {
  label: string;
  value: number | string;
  highlight?: boolean;
};

export function StatBadge({ label, value, highlight }: Props) {
  return (
    <div className={classNames('stat-badge', { highlight })}>
      <span className="stat-label">{label}</span>
      <span className="stat-value">{value}</span>
    </div>
  );
}

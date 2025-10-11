import './RewardChoice.css';

type Props = {
  title: string;
  description: string;
  onSelect: () => void;
};

export function RewardChoice({ title, description, onSelect }: Props) {
  return (
    <button className="reward-choice" onClick={onSelect}>
      <h4>{title}</h4>
      <p>{description}</p>
    </button>
  );
}

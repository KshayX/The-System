import './SkillTree.css';

type SkillNode = {
  id: string;
  name: string;
  description: string;
  tier: number;
  unlocked: boolean;
};

type Props = {
  skills: SkillNode[];
};

export function SkillTree({ skills }: Props) {
  const tiers = Array.from(new Set(skills.map((skill) => skill.tier))).sort((a, b) => a - b);
  return (
    <div className="skill-tree">
      {tiers.map((tier) => (
        <div key={tier} className="skill-tier">
          <h4>Tier {tier}</h4>
          <div className="skill-tier-grid">
            {skills
              .filter((skill) => skill.tier === tier)
              .map((skill) => (
                <div key={skill.id} className={`skill-node ${skill.unlocked ? 'unlocked' : ''}`}>
                  <span className="skill-name">{skill.name}</span>
                  <p>{skill.description}</p>
                </div>
              ))}
          </div>
        </div>
      ))}
    </div>
  );
}

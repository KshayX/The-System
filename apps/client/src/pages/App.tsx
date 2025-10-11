import { useEffect, useMemo, useState } from 'react';
import dayjs from 'dayjs';
import duration from 'dayjs/plugin/duration';
import { useAuthToken } from '../hooks/useAuth';
import { useApi } from '../hooks/useApi';
import { Panel } from '../components/Panel';
import { StatBadge } from '../components/StatBadge';
import { QuestCard } from '../components/QuestCard';
import { RewardChoice } from '../components/RewardChoice';
import { ProgressBar } from '../components/ProgressBar';
import { SkillTree } from '../components/SkillTree';
import './App.css';

dayjs.extend(duration);

type Quest = {
  id: string;
  title: string;
  description: string;
  status: string;
  xpReward: number;
  difficulty: string;
  expiresAt?: string | null;
  remainingSeconds?: number | null;
  type: string;
};

type ProfileResponse = {
  profile: {
    level: number;
    xp: number;
    strength: number;
    agility: number;
    intelligence: number;
    vitality: number;
    sense: number;
    unallocatedStatPoints: number;
    rank: string;
    mana: number;
    jobClass: string | null;
    streakCount: number;
    longestStreak: number;
  };
  xpNext: number;
  power: number;
  activeDailyQuests: Quest[];
  streak: number;
  achievements: Array<{ achievement: { title: string; description: string }; currentValue: number }>;
};

export function App() {
  const { token, setToken } = useAuthToken();
  const api = useApi(token);
  const [profile, setProfile] = useState<ProfileResponse | null>(null);
  const [quests, setQuests] = useState<Quest[]>([]);
  const [inventory, setInventory] = useState<any[]>([]);
  const [shopItems, setShopItems] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any | null>(null);
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({ email: '', password: '', displayName: '' });

  useEffect(() => {
    if (!token) return;
    const load = async () => {
      const [profileRes, questRes, inventoryRes, shopRes, analyticsRes] = await Promise.all([
        api.get<ProfileResponse>('/player/me'),
        api.get<Quest[]>('/quests'),
        api.get('/inventory'),
        api.get('/shop/items'),
        api.get('/analytics'),
      ]);
      setProfile(profileRes.data);
      setQuests(questRes.data);
      setInventory(inventoryRes.data);
      setShopItems(shopRes.data);
      setAnalytics(analyticsRes.data);
    };
    load().catch(console.error);
  }, [api, token]);

  const handleAuth = async (event: React.FormEvent) => {
    event.preventDefault();
    setLoading(true);
    try {
      if (authMode === 'login') {
        const { data } = await api.post('/auth/login', {
          email: form.email,
          password: form.password,
        });
        setToken(data.token);
      } else {
        const { data } = await api.post('/auth/register', form);
        setToken(data.token);
      }
    } catch (error) {
      alert('Authentication failed. Check your credentials.');
    } finally {
      setLoading(false);
    }
  };

  const handleDailyQuest = async () => {
    const { data } = await api.post('/quests/daily');
    setQuests((prev) => {
      const existing = prev.filter((quest) => quest.id !== data.id);
      return [data, ...existing];
    });
  };

  const handleCompleteQuest = async (questId: string) => {
    await api.post(`/quests/${questId}/complete`);
    const [profileRes, questRes] = await Promise.all([
      api.get<ProfileResponse>('/player/me'),
      api.get<Quest[]>('/quests'),
    ]);
    setProfile(profileRes.data);
    setQuests(questRes.data);
  };

  const handleFailQuest = async (questId: string) => {
    await api.post(`/quests/${questId}/fail`);
    const questRes = await api.get<Quest[]>('/quests');
    setQuests(questRes.data);
  };

  const handlePurchase = async (itemId: string) => {
    const { data } = await api.post('/shop/purchase', { itemId });
    setInventory((prev) => [data, ...prev]);
  };

  const powerLevelBadge = useMemo(() => profile?.power ?? 0, [profile]);

  if (!token) {
    return (
      <main className="auth-screen">
        <form className="auth-panel" onSubmit={handleAuth}>
          <h1>Real Life Solo Leveling</h1>
          <p>Replicate the Player System mechanics and transform your habits.</p>
          <div className="auth-toggle">
            <button
              type="button"
              className={authMode === 'login' ? 'active' : ''}
              onClick={() => setAuthMode('login')}
            >
              Login
            </button>
            <button
              type="button"
              className={authMode === 'register' ? 'active' : ''}
              onClick={() => setAuthMode('register')}
            >
              Register
            </button>
          </div>
          <label>
            Email
            <input
              type="email"
              value={form.email}
              onChange={(event) => setForm((prev) => ({ ...prev, email: event.target.value }))}
              required
            />
          </label>
          <label>
            Password
            <input
              type="password"
              value={form.password}
              onChange={(event) => setForm((prev) => ({ ...prev, password: event.target.value }))}
              required
            />
          </label>
          {authMode === 'register' ? (
            <label>
              Display Name
              <input
                type="text"
                value={form.displayName}
                onChange={(event) => setForm((prev) => ({ ...prev, displayName: event.target.value }))}
                required
              />
            </label>
          ) : null}
          <button type="submit" disabled={loading}>
            {loading ? 'Processing...' : authMode === 'login' ? 'Login' : 'Register'}
          </button>
        </form>
      </main>
    );
  }

  if (!profile) {
    return (
      <main className="loading-screen">
        <p>Loading Player System...</p>
      </main>
    );
  }

  const jobUnlocked = profile.profile.level >= 40 && !profile.profile.jobClass;

  return (
    <main className="dashboard">
      <header className="dashboard-header">
        <div>
          <h1>{profile.profile.jobClass ?? 'Solo Leveler'}</h1>
          <p>
            Rank {profile.profile.rank} | Level {profile.profile.level} | Power Level {powerLevelBadge}
          </p>
        </div>
        <div className="header-actions">
          <button onClick={() => setToken(null)}>Log Out</button>
          <button onClick={handleDailyQuest}>Summon Daily Quest</button>
        </div>
      </header>

      <section className="grid-two">
        <Panel title="Hunter Statistics" subtitle="Allocate points to specialize your build">
          <div className="stats-grid">
            <StatBadge label="Level" value={profile.profile.level} highlight />
            <StatBadge label="XP" value={`${profile.profile.xp}/${profile.xpNext}`} />
            <StatBadge label="Strength" value={profile.profile.strength} />
            <StatBadge label="Agility" value={profile.profile.agility} />
            <StatBadge label="Intelligence" value={profile.profile.intelligence} />
            <StatBadge label="Vitality" value={profile.profile.vitality} />
            <StatBadge label="Sense" value={profile.profile.sense} />
            <StatBadge label="Mana" value={profile.profile.mana} />
            <StatBadge label="Unallocated" value={profile.profile.unallocatedStatPoints} />
          </div>
          <ProgressBar
            percentage={(profile.profile.xp / profile.xpNext) * 100}
            label={`Progress to Level ${profile.profile.level + 1}`}
          />
          <p className="streak">Daily Streak: {profile.profile.streakCount} | Longest: {profile.profile.longestStreak}</p>
        </Panel>

        <Panel
          title="Rank Progression"
          subtitle="Climb from E-rank to National Level"
          actions={<span className="rank-badge">{profile.profile.rank}</span>}
        >
          <p>
            Power level measures your combined stats. Maintain streaks and complete higher tier quests to
            ascend faster.
          </p>
          <ul className="rank-list">
            {['E', 'D', 'C', 'B', 'A', 'S', 'NATIONAL'].map((rank) => (
              <li key={rank} className={rank === profile.profile.rank ? 'active' : ''}>
                <span>{rank}</span>
                <small>
                  {rank === 'NATIONAL'
                    ? 'World-Class Hunter'
                    : `Reach level ${
                        { E: 1, D: 10, C: 20, B: 30, A: 45, S: 60, NATIONAL: 80 }[rank as keyof any]
                      }`}
                </small>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="grid-two">
        <Panel title="Active Quests" subtitle="Failure triggers the Penalty Zone">
          <div className="quest-list">
            {quests
              .filter((quest) => quest.status !== 'COMPLETED')
              .map((quest) => (
                <QuestCard
                  key={quest.id}
                  {...quest}
                  onComplete={() => handleCompleteQuest(quest.id)}
                  onFail={() => handleFailQuest(quest.id)}
                />
              ))}
          </div>
        </Panel>
        <Panel title="Completed Quests" subtitle="Claimed rewards and achievements">
          <div className="quest-history">
            {quests
              .filter((quest) => quest.status === 'COMPLETED')
              .slice(0, 5)
              .map((quest) => (
                <QuestCard key={quest.id} {...quest} />
              ))}
          </div>
        </Panel>
      </section>

      <section className="grid-two">
        <Panel title="Rewards" subtitle="Choose how to grow after every quest">
          <div className="reward-grid">
            <RewardChoice title="Full Recovery" description="Reset vitality and mana instantly." onSelect={() => alert('Recovery triggered!')} />
            <RewardChoice title="Loot Box" description="Receive a randomized piece of equipment." onSelect={() => alert('Loot box opened!')} />
            <RewardChoice title="Stat Points" description="Gain additional allocation points for core stats." onSelect={() => alert('Stat points awarded!')} />
          </div>
        </Panel>

        <Panel title="Inventory" subtitle="Manage equipment and consumables">
          <ul className="inventory-list">
            {inventory.slice(0, 6).map((item) => (
              <li key={item.id}>
                <strong>{item.name}</strong>
                <span>{item.category}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </section>

      <section className="grid-two">
        <Panel title="Skill Tree" subtitle="Unlock new abilities and passive bonuses">
          <SkillTree
            skills={[
              { id: 'shadow-step', name: 'Shadow Step', description: 'Teleport behind enemies instantly.', tier: 1, unlocked: true },
              { id: 'mana-burst', name: 'Mana Burst', description: '+20% damage output for 30s.', tier: 2, unlocked: profile.profile.level >= 20 },
              { id: 'stealth-cloak', name: 'Stealth Cloak', description: 'Become invisible for 10 seconds.', tier: 3, unlocked: profile.profile.level >= 30 },
              { id: 'shadow-army', name: 'Shadow Army', description: 'Summon loyal shadows to assist you.', tier: 4, unlocked: profile.profile.level >= 45 },
            ]}
          />
          {jobUnlocked ? <div className="job-change">Job Change available! Specialize into Assassin, Berserker, or Mage.</div> : null}
        </Panel>

        <Panel title="Hunter Shop" subtitle="Spend currency on power boosts">
          <div className="shop-grid">
            {shopItems.map((item) => (
              <div key={item.id} className="shop-item">
                <h4>{item.name}</h4>
                <p>{item.description}</p>
                <span>{item.price} {item.currency}</span>
                <button onClick={() => handlePurchase(item.id)}>Purchase</button>
              </div>
            ))}
          </div>
        </Panel>
      </section>

      <section className="grid-two">
        <Panel title="Analytics" subtitle="Monitor progress and streaks">
          {analytics ? (
            <ul className="analytics">
              <li>Quests Completed: {analytics.questsCompleted}</li>
              <li>Quests Failed: {analytics.questsFailed}</li>
              <li>Completion Rate: {(analytics.questCompletionRate * 100).toFixed(0)}%</li>
              <li>Total Rewards: {analytics.rewardsEarned}</li>
            </ul>
          ) : (
            <p>No analytics data yet.</p>
          )}
        </Panel>

        <Panel title="Achievements" subtitle="Milestones of your hunter career">
          <ul className="achievement-list">
            {profile.achievements.map((entry, index) => (
              <li key={index}>
                <strong>{entry.achievement.title}</strong>
                <span>{entry.achievement.description}</span>
                <span className="progress-value">{entry.currentValue}</span>
              </li>
            ))}
          </ul>
        </Panel>
      </section>
    </main>
  );
}

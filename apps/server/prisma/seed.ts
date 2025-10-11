import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  const skills = [
    { name: 'Shadow Step', description: 'Teleport behind enemies instantly.', tier: 1, type: 'ACTIVE' },
    { name: 'Mana Burst', description: 'Overload your mana for bonus damage.', tier: 2, type: 'ACTIVE' },
    { name: 'Iron Will', description: 'Passive vitality increase by 15%.', tier: 1, type: 'PASSIVE' },
  ];

  for (const skill of skills) {
    await prisma.skill.upsert({
      where: { name: skill.name },
      update: skill,
      create: skill,
    });
  }

  const achievements = [
    { code: 'FIRST_BLOOD', title: 'First Blood', description: 'Complete your first quest', threshold: 1 },
    { code: 'STREAK_MASTER', title: 'Streak Master', description: 'Reach a 7-day streak', threshold: 7 },
    { code: 'SHADOW_COMMANDER', title: 'Shadow Commander', description: 'Unlock the Shadow Army skill', threshold: 1 },
  ];

  for (const achievement of achievements) {
    await prisma.achievement.upsert({
      where: { code: achievement.code },
      update: achievement,
      create: achievement,
    });
  }
}

main()
  .then(() => console.log('Seed data loaded'))
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

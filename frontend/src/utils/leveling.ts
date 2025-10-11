const BASE_XP = 500;
const XP_SCALE = 1.25;

export const xpRequiredForLevel = (level: number) => {
  let xp = BASE_XP;
  for (let i = 1; i < level; i += 1) {
    xp = Math.floor(xp * XP_SCALE);
  }
  return xp;
};

import { prisma } from '../instrumentation';

export const SHOP_ITEMS = [
  {
    id: 'potion-full-recovery',
    name: 'Full Recovery Elixir',
    description: 'Fully restores vitality and mana. Recommended after penalty zones.',
    price: 200,
    currency: 'GOLD',
    category: 'POTION',
  },
  {
    id: 'stat-boost',
    name: 'Stat Booster Capsule',
    description: '+2 to all stats temporarily (24h).',
    price: 500,
    currency: 'GOLD',
    category: 'CONSUMABLE',
  },
  {
    id: 'shadow-armor',
    name: 'Shadow Armor Set',
    description: 'Legendary armor harnessing shadow energy.',
    price: 1200,
    currency: 'DIAMOND',
    category: 'ARMOR',
  },
];

export async function purchaseItem(userId: string, itemId: string) {
  const shopItem = SHOP_ITEMS.find((item) => item.id === itemId);
  if (!shopItem) {
    throw new Error('Item not available');
  }

  await prisma.transaction.create({
    data: {
      userId,
      type: 'PURCHASE',
      amount: shopItem.price,
      currency: shopItem.currency,
      metadata: { itemId },
    },
  });

  return prisma.inventoryItem.create({
    data: {
      userId,
      name: shopItem.name,
      description: shopItem.description,
      category: shopItem.category as any,
      rarity: shopItem.category === 'ARMOR' ? 'LEGENDARY' : 'RARE',
      quantity: 1,
    },
  });
}

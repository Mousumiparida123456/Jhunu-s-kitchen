import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const menu = [
  {
    category: 'Street Food & Snacks',
    items: [
      { name: 'Pani Puri', priceRupees: 30, description: 'Crispy hollow puris filled with spicy tangy water and potato mash.', imagePath: '/img/panipuri.png' },
      { name: 'Mix Chaat', priceRupees: 30, description: 'A delightful mix of crispy papdi, boiled potatoes, chickpeas, yogurt and chutneys.', imagePath: '/img/mix_chaat.png' },
      { name: 'Veg Momos', priceRupees: 50, description: 'Steamed dumplings filled with savory mixed vegetable filling, served with fiery red chutney.', imagePath: '/img/momo.png' },
      { name: 'Chicken Momos', priceRupees: 60, description: 'Steamed dumplings filled with savory minced chicken filling, served with fiery red chutney.', imagePath: '/img/momo.png' },
      { name: 'French Fries', priceRupees: 70, description: 'Crispy golden potato fries seasoned with salt and spices.', imagePath: '/img/french_fries.png' },
    ],
  },
  {
    category: 'Mains',
    items: [
      { name: 'Chicken Biryani', priceRupees: 120, description: 'Aromatic basmati rice cooked with tender meat, spices, and herbs.', imagePath: '/img/biryani.png' },
      { name: 'Veg Biryani', priceRupees: 100, description: 'Aromatic basmati rice cooked with mixed vegetables, spices, and herbs.', imagePath: '/img/biryani.png' },
      { name: 'Masala Dosa', priceRupees: 60, description: 'Crispy, golden-brown fermented rice crepe served with savory sambar and fresh coconut chutney.', imagePath: '/img/dosa.png' },
      { name: 'Margherita Pizza', priceRupees: 120, description: 'Classic pizza with fresh tomato sauce, mozzarella cheese, and basil.', imagePath: '/img/margherita_pizza.png' },
      { name: 'Gourmet Burger', priceRupees: 90, description: 'Juicy patty inside a toasted bun with fresh lettuce, tomatoes, and cheese.', imagePath: '/img/gourmet_burger.png' },
    ],
  },
  {
    category: 'Drinks & Beverages',
    items: [
      { name: 'Masala Cola', priceRupees: 50, description: 'Chilled cola infused with roasted cumin, black salt, and spices.', imagePath: '/img/masala_cola.png' },
      { name: 'Sweet Lassi', priceRupees: 60, description: 'Thick, creamy yogurt drink sweetened and garnished with dry fruits.', imagePath: '/img/sweet_lassi.png' },
      { name: 'Nimbu Pani', priceRupees: 30, description: 'Refreshing Indian lemonade made with fresh lemon juice and a hint of salt and sugar.', imagePath: '/img/nimbu_pani.png' },
      { name: 'Cold Drink', priceRupees: 30, description: 'Chilled carbonated beverage of your choice.', imagePath: '/img/colddrink.png' },
    ],
  },
  {
    category: 'Desserts',
    items: [
      { name: 'Rose Falooda', priceRupees: 100, description: 'A rich dessert drink with rose syrup, vermicelli, sweet basil seeds, and ice cream.', imagePath: '/img/rose_falooda.png' },
      { name: 'Ice Cream', priceRupees: 50, description: 'A couple scoops of delicious frozen dessert.', imagePath: '/img/icecream.png' },
    ],
  },
];

async function main() {
  for (const category of menu) {
    for (const item of category.items) {
      await prisma.menuItem.upsert({
        where: { category_name: { category: category.category, name: item.name } },
        update: {
          description: item.description,
          priceRupees: item.priceRupees,
          imagePath: item.imagePath,
        },
        create: {
          category: category.category,
          name: item.name,
          description: item.description,
          priceRupees: item.priceRupees,
          imagePath: item.imagePath,
        },
      });
    }
  }
}

main()
  .finally(async () => {
    await prisma.$disconnect();
  });


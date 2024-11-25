import { PrismaClient } from '@prisma/client';
import dotenv from 'dotenv';

dotenv.config();

const prisma = new PrismaClient();

async function main() {
  try {
    await prisma.$connect();

    // Seed default preset values
    await prisma.presetValues.create({
      data: {
        defaultHeight: 30,
        defaultWidth: 24,
        defaultDepth: 24,
        laborRate: 75,
        materialMarkup: 30,
        taxRate: 13,
        deliveryFee: 150,
        installationFee: 500,
        storageFee: 25,
        minimumOrder: 1000,
        rushOrderFee: 15,
        shippingRate: 2.5,
        importTaxRate: 5,
        exchangeRate: 1,
      },
    });

    // Seed default categories
    const category = await prisma.category.create({
      data: {
        name: 'Kitchen Cabinets',
        description: 'Standard kitchen cabinet collection',
      },
    });

    // Seed default products
    await prisma.product.create({
      data: {
        name: 'Base Cabinet',
        categoryId: category.id,
        type: 'base',
        materials: ['solid_wood', 'mdf'],
        unitCost: 299.99,
        description: 'Standard base cabinet',
      },
    });

    console.log('Database seeded successfully');
  } catch (error) {
    console.error('Error seeding database:', error);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
}

main();
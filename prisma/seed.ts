import { PrismaClient, Role } from '../generated/prisma/client';
import { PrismaPg } from '@prisma/adapter-pg';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import 'dotenv/config';

const connectionString = `${process.env.DATABASE_URL}`;
const adapter = new PrismaPg({ connectionString } as any);
const prisma = new PrismaClient({ adapter });

// Helper to generate a random number within a range
const getRandomInt = (min: number, max: number) => Math.floor(Math.random() * (max - min + 1)) + min;
// Helper to get a random element from an array
const getRandomElement = <T>(arr: T[]): T => arr[getRandomInt(0, arr.length - 1)]!;

async function main() {
  console.log('Clearing existing data...');
  await prisma.review.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.rental.deleteMany();
  await prisma.gear.deleteMany();
  await prisma.category.deleteMany();
  await prisma.provider.deleteMany();
  await prisma.user.deleteMany();

  const hashedPassword = await bcrypt.hash('password123', 10);
  
  console.log('Generating bulk data...');

  // --- 1. ADMIN ---
  const adminId = crypto.randomUUID();
  const adminUser = {
    id: adminId,
    name: 'Super Admin',
    email: 'admin@gearup.com',
    password: hashedPassword,
    phone: '+10000000000',
    role: Role.ADMIN,
  };

  // --- 2. CUSTOMERS (40 Users) ---
  const customerUsers = Array.from({ length: 40 }).map((_, i) => ({
    id: crypto.randomUUID(),
    name: `Customer User ${i + 1}`,
    email: `customer${i + 1}@example.com`,
    password: hashedPassword,
    phone: `+1555000${i.toString().padStart(4, '0')}`,
    role: Role.CUSTOMER,
  }));

  // --- 3. PROVIDERS (10 Users + 10 Provider Profiles) ---
  const providerUsers = Array.from({ length: 10 }).map((_, i) => ({
    id: crypto.randomUUID(),
    name: `Provider User ${i + 1}`,
    email: `provider${i + 1}@example.com`,
    password: hashedPassword,
    phone: `+1444000${i.toString().padStart(4, '0')}`,
    role: Role.PROVIDER,
  }));

  const providerProfiles = providerUsers.map((user, i) => ({
    id: crypto.randomUUID(),
    userId: user.id,
    businessName: `Outdoor Gear Hub ${i + 1}`,
    description: `The best outdoor and adventure gear from provider ${i + 1}.`,
    address: `${getRandomInt(100, 999)} Adventure Way, City ${i + 1}`,
    approved: true, // All approved for dummy data
  }));

  // --- 4. CATEGORIES (10 Categories) ---
  const categoryNames = [
    'Camping & Hiking', 'Winter Sports', 'Water Sports', 'Climbing', 
    'Cycling', 'Fishing', 'Running', 'Fitness', 'Hunting', 'Photography'
  ];
  const categories = categoryNames.map((name) => ({
    id: crypto.randomUUID(),
    name,
    description: `Top quality equipment for ${name}.`,
  }));

  // --- 5. GEARS (150 Gears) ---
  const gearAdjectives = ['Pro', 'Lite', 'Ultra', 'Heavy Duty', 'Premium', 'Basic', 'Elite'];
  const gearNouns = ['Tent', 'Backpack', 'Snowboard', 'Kayak', 'Climbing Harness', 'Mountain Bike', 'Fishing Rod', 'Headlamp', 'Sleeping Bag', 'Camera Lens'];
  
  const gears = Array.from({ length: 150 }).map((_, i) => {
    const provider = getRandomElement(providerProfiles);
    const category = getRandomElement(categories);
    const price = getRandomInt(10, 100);
    return {
      id: crypto.randomUUID(),
      name: `${getRandomElement(gearAdjectives)} ${getRandomElement(gearNouns)} ${i + 1}`,
      description: `High performance gear perfect for your next adventure. Maintained perfectly by ${provider.businessName}.`,
      images: ['https://res.cloudinary.com/demo/image/upload/sample.jpg'], // Dummy image
      dailyRentalPrice: price,
      quantity: getRandomInt(1, 20),
      status: 'AVAILABLE',
      providerId: provider.id,
      categoryId: category.id,
    };
  });

  // --- 6. RENTALS (200 Rentals) ---
  const statuses = ['PENDING', 'APPROVED', 'COMPLETED', 'CANCELLED'];
  const rentals = Array.from({ length: 200 }).map(() => {
    const customer = getRandomElement(customerUsers);
    const gear = getRandomElement(gears);
    const days = getRandomInt(1, 14);
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - getRandomInt(0, 30)); // Sometime in the last 30 days
    const endDate = new Date(startDate);
    endDate.setDate(endDate.getDate() + days);

    return {
      id: crypto.randomUUID(),
      customerId: customer.id,
      gearId: gear.id,
      startDate,
      endDate,
      totalDays: days,
      totalAmount: gear.dailyRentalPrice * days,
      status: getRandomElement(statuses),
    };
  });

  // --- 7. PAYMENTS (For Approved/Completed Rentals) ---
  const payments = rentals
    .filter(r => r.status === 'APPROVED' || r.status === 'COMPLETED')
    .map(rental => ({
      id: crypto.randomUUID(),
      rentalId: rental.id,
      transactionId: `txn_${crypto.randomBytes(8).toString('hex')}`,
      amount: rental.totalAmount,
      paymentStatus: 'PAID',
      paymentMethod: 'STRIPE',
    }));

  // --- 8. REVIEWS (150 Reviews) ---
  const reviewComments = [
    'Amazing gear, worked perfectly!', 'Decent condition, would rent again.', 
    'A bit worn out but did the job.', 'Absolutely fantastic experience.', 
    'Provider was great, gear was top notch.'
  ];
  
  const reviews = Array.from({ length: 150 }).map(() => {
    const customer = getRandomElement(customerUsers);
    const gear = getRandomElement(gears);
    return {
      id: crypto.randomUUID(),
      userId: customer.id,
      gearId: gear.id,
      rating: getRandomInt(3, 5), // Mostly positive reviews
      comment: getRandomElement(reviewComments),
    };
  });

  // ==============================================
  // BULK INSERTION (Executing createMany)
  // ==============================================
  console.log('Uploading data in bulk...');

  await prisma.user.createMany({ data: [adminUser, ...customerUsers, ...providerUsers] });
  console.log(`✅ Seeded ${1 + customerUsers.length + providerUsers.length} Users`);

  await prisma.provider.createMany({ data: providerProfiles });
  console.log(`✅ Seeded ${providerProfiles.length} Providers`);

  await prisma.category.createMany({ data: categories });
  console.log(`✅ Seeded ${categories.length} Categories`);

  await prisma.gear.createMany({ data: gears });
  console.log(`✅ Seeded ${gears.length} Gears`);

  await prisma.rental.createMany({ data: rentals });
  console.log(`✅ Seeded ${rentals.length} Rentals`);

  await prisma.payment.createMany({ data: payments });
  console.log(`✅ Seeded ${payments.length} Payments`);

  await prisma.review.createMany({ data: reviews });
  console.log(`✅ Seeded ${reviews.length} Reviews`);

  console.log('🎉 Bulk seeding completed successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

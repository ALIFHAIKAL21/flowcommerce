import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DataSource } from 'typeorm';
import { Users } from './users/users.entity';
import { Categories } from './categories/categories.entity';
import { Products } from './products/products.entity';
import { Carts } from './carts/carts.entity';
import { Orders } from './orders/orders.entity';
import * as bcrypt from 'bcrypt';

function randomBetween(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const dataSource = app.get(DataSource);

  console.log('🧩 Starting seed process...');

  // 💣 Bersihkan tabel agar FK tidak bentrok
  await dataSource.query(`
    TRUNCATE TABLE 
      order_items,
      orders,
      carts,
      products,
      categories,
      users
    RESTART IDENTITY CASCADE;
  `);
  console.log('🧹 Cleared all tables (CASCADE)');

  // 🧱 Repositories
  const usersRepo = dataSource.getRepository(Users);
  const catRepo = dataSource.getRepository(Categories);
  const prodRepo = dataSource.getRepository(Products);
  const cartRepo = dataSource.getRepository(Carts);
  const orderRepo = dataSource.getRepository(Orders);

  // 👥 USERS
  const admin = usersRepo.create({
    username: 'admin',
    password: await bcrypt.hash('admin123', 10),
    role: 'admin',
  });

  const customers = ['john', 'jane', 'alex', 'sarah', 'michael', 'lisa'].map(
    async (username) =>
      usersRepo.create({
        username,
        password: await bcrypt.hash('123456', 10),
        role: 'customer',
      }),
  );

  const allUsers = [admin, ...(await Promise.all(customers))];
  await usersRepo.save(allUsers);
  console.log('✅ Users created:', allUsers.length);

  // 🏷️ CATEGORIES
  const categoryData = [
    { name: 'Electronics', description: 'Gadgets and devices' },
    { name: 'Fashion', description: 'Clothes, shoes, and accessories' },
    { name: 'Home & Kitchen', description: 'Appliances and utensils' },
    { name: 'Beauty & Health', description: 'Cosmetics and skincare' },
    { name: 'Sports & Outdoors', description: 'Gear and equipment' },
  ];
  const categories = categoryData.map((c) => catRepo.create(c));
  await catRepo.save(categories);
  console.log('✅ Categories created:', categories.length);

  // 🛍️ PRODUCTS (Cloudinary-ready)
  const productTemplates = [
    {
      name: 'Wireless Headphones',
      category: 'Electronics',
      price: [80, 150],
      image_url:
        'https://res.cloudinary.com/<cloud_name>/image/upload/v1/seed/products/headphones.jpg',
    },
    {
      name: 'Smart Watch',
      category: 'Electronics',
      price: [100, 250],
      image_url:
        'https://res.cloudinary.com/<cloud_name>/image/upload/v1/seed/products/smartwatch.jpg',
    },
    {
      name: 'Running Shoes',
      category: 'Fashion',
      price: [60, 120],
      image_url:
        'https://res.cloudinary.com/<cloud_name>/image/upload/v1/seed/products/running_shoes.jpg',
    },
    {
      name: 'Jeans',
      category: 'Fashion',
      price: [40, 90],
      image_url:
        'https://res.cloudinary.com/<cloud_name>/image/upload/v1/seed/products/jeans.jpg',
    },
    {
      name: 'Air Fryer',
      category: 'Home & Kitchen',
      price: [70, 200],
      image_url:
        'https://res.cloudinary.com/<cloud_name>/image/upload/v1/seed/products/airfryer.jpg',
    },
    {
      name: 'Blender',
      category: 'Home & Kitchen',
      price: [40, 100],
      image_url:
        'https://res.cloudinary.com/<cloud_name>/image/upload/v1/seed/products/blender.jpg',
    },
    {
      name: 'Face Serum',
      category: 'Beauty & Health',
      price: [15, 50],
      image_url:
        'https://res.cloudinary.com/<cloud_name>/image/upload/v1/seed/products/face_serum.jpg',
    },
    {
      name: 'Shampoo',
      category: 'Beauty & Health',
      price: [10, 25],
      image_url:
        'https://res.cloudinary.com/<cloud_name>/image/upload/v1/seed/products/shampoo.jpg',
    },
    {
      name: 'Yoga Mat',
      category: 'Sports & Outdoors',
      price: [20, 60],
      image_url:
        'https://res.cloudinary.com/<cloud_name>/image/upload/v1/seed/products/yoga_mat.jpg',
    },
    {
      name: 'Dumbbell Set',
      category: 'Sports & Outdoors',
      price: [40, 150],
      image_url:
        'https://res.cloudinary.com/<cloud_name>/image/upload/v1/seed/products/dumbbell.jpg',
    },
  ];

  const products = productTemplates.map((p) => {
    const category = categories.find((c) => c.name === p.category)!;
    const price = randomBetween(p.price[0], p.price[1]);
    const stock = randomBetween(10, 50);
    return prodRepo.create({
      name: p.name,
      price,
      stock,
      image_url: p.image_url,
      categories: category,
    });
  });
  await prodRepo.save(products);
  console.log('✅ Products created:', products.length);

  // 🛒 CARTS
  const randomUser = (users: Users[]) =>
    users[randomBetween(1, users.length - 1)]; // skip admin
  const randomProduct = () =>
    products[randomBetween(0, products.length - 1)];

  const cartItems: Carts[] = []; // ✅ fix typing
  for (let i = 0; i < 10; i++) {
    const user = randomUser(allUsers);
    const product = randomProduct();
    const quantity = randomBetween(1, 3);
    const total_price = Number(product.price) * quantity;

    cartItems.push(
      cartRepo.create({
        user,
        product,
        quantity,
        total_price,
      }),
    );
  }
  await cartRepo.save(cartItems);
  console.log('✅ Cart items created:', cartItems.length);

  // 📦 ORDERS
  const randomOrders: Orders[] = []; // ✅ fix typing
  for (let i = 0; i < 5; i++) {
    const user = randomUser(allUsers);
    const total = randomBetween(50, 500);
    randomOrders.push(
      orderRepo.create({
        user,
        status: 'pending',
        total_price: total,
      }),
    );
  }
  await orderRepo.save(randomOrders);
  console.log('✅ Orders created:', randomOrders.length);

  console.log('🎉 Database seeding completed successfully!');
  await app.close();
}

bootstrap().catch((err) => {
  console.error('❌ Seeding failed:', err);
});

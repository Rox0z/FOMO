import * as dotenv from 'dotenv';
dotenv.config();

import * as bcrypt from 'bcryptjs';
import { db } from '../drizzle';
import { users } from '../db/schema';
import { eq } from 'drizzle-orm';


async function seed() {
  const existingAdmin = await db.query.users.findFirst({
    where: eq(users.email, 'admin@test.com'),
  });

  if (existingAdmin) {
    console.log('Admin já existe');
    return;
  }

  const hash = await bcrypt.hash('admin2026', 10);

  await db.insert(users).values({
    email: 'admin@test.com',
    password: hash,
    name: 'Admin',
    phone: null,
    countryCode: null,

    role: 'admin',    
    active: true,     

  });

  console.log('Admin criado com sucesso!');
}

seed();
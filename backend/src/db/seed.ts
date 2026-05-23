import * as dotenv from 'dotenv';
dotenv.config();

import * as bcrypt from 'bcryptjs';
import { db } from '../drizzle';
import { users, vendorProfiles, events } from '../db/schema'; // Importamos as tabelas necessárias
import { eq } from 'drizzle-orm';

async function seed() {
  console.log('🌱 A iniciar o Seed...');

  // 1. VERIFICAR OU CRIAR ADMIN
  let adminUser = await db.query.users.findFirst({
    where: eq(users.email, 'admin@test.com'),
  });

  if (!adminUser) {
    const hash = await bcrypt.hash('admin2026', 10);
    const newAdmins = await db.insert(users).values({
      email: 'admin@test.com',
      password: hash,
      name: 'Admin FOMO',
      role: 'admin',    
      active: true,     
    }).returning();
    
    adminUser = newAdmins[0];
    console.log('✅ Admin criado!');
  } else {
    console.log('⚡ Admin já existia.');
  }

  // 2. VERIFICAR OU CRIAR VENDOR FALSO (Para contornar o bloqueio)
  let dummyVendor = await db.query.vendorProfiles.findFirst({
    where: eq(vendorProfiles.userId, adminUser.id),
  });

  if (!dummyVendor) {
    const newVendors = await db.insert(vendorProfiles).values({
      userId: adminUser.id,
      businessName: 'Vendor de Testes FOMO',
      businessDescription: 'Criado pelo Seed para testar eventos.',
      status: 'approved',
    }).returning();

    dummyVendor = newVendors[0];
    console.log('✅ Vendor de testes criado!');
  } else {
    console.log('⚡ Vendor já existia.');
  }

  // 3. VERIFICAR OU CRIAR EVENTO DE TESTE
  const existingEvent = await db.query.events.findFirst({
    where: eq(events.vendorId, dummyVendor.id),
  });

  if (!existingEvent) {
    await db.insert(events).values({
      vendorId: dummyVendor.id,
      name: 'Festa de Teste FOMO',
      description: 'Evento espetacular para testar a compra de bilhetes.',
      location: 'Estádio de Testes, Lisboa',
      date: new Date('2026-12-31T22:00:00Z'), // Fim do ano de 2026
    });
    console.log('✅ Evento de teste criado!');
  } else {
    console.log('⚡ Evento já existia.');
  }

  console.log('🎉 Seed terminado com sucesso!');
}

seed().catch(console.error);
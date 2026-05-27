import * as dotenv from 'dotenv';
dotenv.config();

import * as bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import { db } from '../drizzle';
import { users, vendorProfiles, events, orders, tickets, auditLogs} from '../db/schema'; 

async function resetDatabase() {
  console.log('🧹 A limpar a base de dados...');
  await db.execute(sql`
    TRUNCATE TABLE 
      audit_logs,
      tickets, 
      orders, 
      events, 
      vendor_profiles, 
      users 
    RESTART IDENTITY CASCADE;
  `);
  console.log('🧼 Base de dados limpa (IDs reiniciados)!');
}

async function seed() {
  console.log('🌱 A iniciar o Seed...');
  await resetDatabase();

  const defaultPassword = await bcrypt.hash('fomo2026', 10);

  // ==========================================
  // 1. CRIAR UTILIZADORES (Com os Roles Corretos!)
  // ==========================================
  console.log('👤 A criar utilizadores de sistema...');
  
  // 1 Admin
  await db.insert(users).values({ 
    email: 'admin@test.com', 
    password: defaultPassword, 
    name: 'Admin FOMO', 
    role: 'admin' 
  });
  
  // 3 Users Normais (Clientes)
  const normalUsers = await db.insert(users).values([
    { email: 'joao.silva@test.com', password: defaultPassword, name: 'João Silva', role: 'user' },
    { email: 'maria.santos@test.com', password: defaultPassword, name: 'Maria Santos', role: 'user' },
    { email: 'pedro.costa@test.com', password: defaultPassword, name: 'Pedro Costa', role: 'user' },
  ]).returning();

  // 5 Contas de Acesso para Vendedores (Role alterado para 'vendor'!)
  const vendorUsers = await db.insert(users).values([
    { email: 'geral@ritmos.pt', password: defaultPassword, name: 'Carlos (Ritmos)', role: 'vendor', phone: '912345678', countryCode: '+351' },
    { email: 'info@sonsurbanos.com', password: defaultPassword, name: 'Ana (Sons Urbanos)', role: 'vendor', phone: '934567890', countryCode: '+351' },
    { email: 'booking@sunsetevents.pt', password: defaultPassword, name: 'Ricardo (Sunset)', role: 'vendor', phone: '967890123', countryCode: '+351' },
    { email: 'candidatura@novopromotor.com', password: defaultPassword, name: 'Mariana (Pendente 1)', role: 'vendor', phone: '921112233', countryCode: '+351' },
    { email: 'contacto@festaslocais.pt', password: defaultPassword, name: 'Vítor (Pendente 2)', role: 'vendor', phone: '919998877', countryCode: '+351' },
  ]).returning();


  // ==========================================
  // 2. CRIAR PERFIS DE VENDEDOR
  // ==========================================
  console.log('🏢 A criar perfis detalhados de Vendor...');

  const vendors = await db.insert(vendorProfiles).values([
    // 3 Vendedores já Aprovados pelo Admin
    { userId: vendorUsers[0].id, businessName: 'Ritmos e Batidas Lda', businessDescription: 'Promotora focada em grandes concertos de rock e festivais de verão.', status: 'approved' },
    { userId: vendorUsers[1].id, businessName: 'Sons Urbanos Produções', businessDescription: 'Especialistas em cultura Hip-Hop, showcases de Rap e festas R&B.', status: 'approved' },
    { userId: vendorUsers[2].id, businessName: 'Sunset Concept Events', businessDescription: 'Eventos premium em rooftops, praias e festas eletrónicas ao pôr do sol.', status: 'approved' },
    // 2 Vendedores Pendentes de Aprovação (Para testares os botões de aprovar no teu painel Admin!)
    { userId: vendorUsers[3].id, businessName: 'Urbano Beats Festival', businessDescription: 'Nova promotora a tentar lançar um festival de música eletrónica de 3 dias.', status: 'pending' },
    { userId: vendorUsers[4].id, businessName: 'Associação Festas de Braga', businessDescription: 'Comissão organizadora de eventos tradicionais e concertos académicos.', status: 'pending' },
  ]).returning();

  const approvedVendors = vendors.slice(0, 3);


  // ==========================================
  // 3. CRIAR EVENTOS (4 por cada vendor aprovado = 12 Eventos)
  // ==========================================
  console.log('🎸 A criar concertos e eventos...');
  
  const eventSeeds = [
    // Ritmos e Batidas Lda (Rock / Pop)
    { vendorId: approvedVendors[0].id, name: 'Rock in Winter 2026', description: 'O maior festival indoor de rock.', location: 'MEO Arena, Lisboa', date: new Date('2026-11-15T21:00:00Z'), status: 'approved', ticketPrice: '35.00', maxCapacity: 20000, ticketsSold: 0 },
    { vendorId: approvedVendors[0].id, name: 'Pop Fest Summer', description: 'Os maiores artistas da rádio ao vivo.', location: 'Estádio Cidade de Coimbra', date: new Date('2026-07-20T18:00:00Z'), status: 'approved', ticketPrice: '45.00', maxCapacity: 30000, ticketsSold: 0 },
    { vendorId: approvedVendors[0].id, name: 'Tributo Histórico: Queen & Pink Floyd', description: 'Duas bandas de tributo lendárias.', location: 'Coliseu do Porto', date: new Date('2026-10-05T21:30:00Z'), status: 'approved', ticketPrice: '25.00', maxCapacity: 3500, ticketsSold: 0 },
    { vendorId: approvedVendors[0].id, name: 'Indie Rock Sessions', description: 'Bandas independentes emergentes.', location: 'Hard Club, Porto', date: new Date('2026-09-12T22:00:00Z'), status: 'approved', ticketPrice: '15.00', maxCapacity: 1000, ticketsSold: 0 },

    // Sons Urbanos (Hip-Hop / R&B)
    { vendorId: approvedVendors[1].id, name: 'Hip-Hop National Summit', description: 'Reunião dos maiores nomes do rap português.', location: 'Pavilhão Rosa Mota, Porto', date: new Date('2026-08-25T20:00:00Z'), status: 'approved', ticketPrice: '20.00', maxCapacity: 4500, ticketsSold: 0 },
    { vendorId: approvedVendors[1].id, name: 'Trap & Drill Night', description: 'Subgéneros urbanos com graves pesados.', location: 'Lisboa Ao Vivo (LAV)', date: new Date('2026-06-18T23:00:00Z'), status: 'approved', ticketPrice: '18.00', maxCapacity: 1500, ticketsSold: 0 },
    { vendorId: approvedVendors[1].id, name: 'R&B Classics & Soul Vibes', description: 'Uma noite dedicada às vozes melódicas.', location: 'Capitólio, Lisboa', date: new Date('2026-09-30T21:00:00Z'), status: 'approved', ticketPrice: '22.50', maxCapacity: 1000, ticketsSold: 0 },
    { vendorId: approvedVendors[1].id, name: 'Cypher Live Portugal', description: 'Batalhas de improviso e breakdance.', location: 'Musicbox, Lisboa', date: new Date('2026-07-08T22:30:00Z'), status: 'approved', ticketPrice: '12.00', maxCapacity: 300, ticketsSold: 0 },

    // Sunset Concept Events (Eletrónica / Premium)
    { vendorId: approvedVendors[2].id, name: 'Deep House Rooftop Session', description: 'Música eletrónica com vista de 360º sobre a cidade.', location: 'Vip Grand Rooftop, Lisboa', date: new Date('2026-06-05T17:00:00Z'), status: 'approved', ticketPrice: '30.00', maxCapacity: 400, ticketsSold: 0 },
    { vendorId: approvedVendors[2].id, name: 'Techno Beach Opening 2026', description: 'Abertura oficial da época de praia com DJs internacionais.', location: 'Praia da Comporta', date: new Date('2026-06-28T15:00:00Z'), status: 'approved', ticketPrice: '40.00', maxCapacity: 2000, ticketsSold: 0 },
    { vendorId: approvedVendors[2].id, name: 'Afro House Sunset', description: 'Ritmos quentes e percussivos ao final do dia.', location: 'NoSoloAgua, Vilamoura', date: new Date('2026-08-02T16:30:00Z'), status: 'approved', ticketPrice: '35.00', maxCapacity: 800, ticketsSold: 0 },
    { vendorId: approvedVendors[2].id, name: 'Premium Electronic Gala', description: 'Evento exclusivo com dress code elegante.', location: 'Pousada de Évora', date: new Date('2026-09-19T19:00:00Z'), status: 'approved', ticketPrice: '75.00', maxCapacity: 300, ticketsSold: 0 },
  ];

  const createdEvents = await db.insert(events).values(eventSeeds as any).returning();


  // ==========================================
  // 4. CRIAR COMPRAS E BILHETES
  // ==========================================
  console.log('🎟️ A simular vendas de bilhetes...');

  async function buyTickets(userId: number, eventId: number, quantity: number) {
    const eventRecord = await db.query.events.findFirst({
      where: eq(events.id, eventId)
    });

    if (!eventRecord) return;
    const price = Number(eventRecord.ticketPrice);

    const order = await db.insert(orders).values({
      userId: userId,
      eventId: eventId,
      quantity: quantity,
      totalPrice: (quantity * price) as any,
      status: 'paid',
    }).returning();

    const ticketsToInsert = Array.from({ length: quantity }).map(() => ({
      userId: userId,
      eventId: eventId,
      orderId: order[0].id,
      status: 'active',
    }));

    await db.insert(tickets).values(ticketsToInsert);

    await db.update(events)
      .set({ 
        ticketsSold: sql`${events.ticketsSold} + ${quantity}` 
      })
      .where(eq(events.id, eventId));
  }

  // Compras do User 1 (6 bilhetes espalhados)
  await buyTickets(normalUsers[0].id, createdEvents[0].id, 1);
  await buyTickets(normalUsers[0].id, createdEvents[4].id, 2);
  await buyTickets(normalUsers[0].id, createdEvents[8].id, 3);

  // Compras do User 2 (4 bilhetes espalhados)
  await buyTickets(normalUsers[1].id, createdEvents[1].id, 1);
  await buyTickets(normalUsers[1].id, createdEvents[2].id, 1);
  await buyTickets(normalUsers[1].id, createdEvents[5].id, 2);

  // Compras do User 3 (1 bilhete quádruplo)
  await buyTickets(normalUsers[2].id, createdEvents[9].id, 4);

  console.log('🎉 Seed terminado com sucesso! Executa o start.bat e atualiza o painel Admin.');
}

seed().catch(console.error);
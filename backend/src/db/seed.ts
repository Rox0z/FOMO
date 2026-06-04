import * as dotenv from 'dotenv';
dotenv.config();

import * as bcrypt from 'bcryptjs';
import { eq, sql } from 'drizzle-orm';
import { db } from '../drizzle';
import * as schema from '../db/schema/index';
import { Roles } from '../common/enums/roles.enum';

// ============================================================
// HELPERS
// ============================================================

function futureDate(daysFromNow: number): Date {
  const d = new Date();
  d.setDate(d.getDate() + daysFromNow);
  d.setHours(22, 0, 0, 0);
  return d;
}

function pastDate(daysAgo: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - daysAgo);
  d.setHours(22, 0, 0, 0);
  return d;
}

// Unsplash IDs que funcionam bem para banners de eventos/música
const BANNER_IDS = [
  '1516450360452-9312f5e86fc7',
  '1470229722913-7c0e2dbbafd3',
  '1540575467063-ba5dfaa01f5b',
  '1493676540958-d2d4f7fc5d41',
  '1501386761578-eee0abd6bab8',
  '1574154894072-16736a30c6df',
  '1571624436279-b272aff752b5',
  '1504674900247-0877df9cc836',
  '1492684223066-81342ee5ff30',
  '1429962814453-6bfd81f9f9a4',
  '1459749411175-04bf5292ceea',
  '1514525253161-7a46d19cd819',
  '1502920917128-1aa500764b20',
  '1467269204594-9661b134dd2b',
  '1500252185289-645f31a73f0f',
];

function bannerUrl(index: number): string {
  const id = BANNER_IDS[index % BANNER_IDS.length];
  return `https://images.unsplash.com/photo-${id}?q=80&w=1200&auto=format&fit=crop`;
}

// ============================================================
// RESET
// ============================================================

async function resetDatabase() {
  console.log('A limpar a base de dados...');
  await db.execute(sql`
    TRUNCATE TABLE
      audit_logs,
      tickets,
      order_items,
      orders,
      events,
      vendor_profiles,
      users
    RESTART IDENTITY CASCADE;
  `);
  console.log('Base de dados limpa (IDs reiniciados)!');
}

// ============================================================
// SEED PRINCIPAL
// ============================================================

async function seed() {
  console.log('A iniciar o Seed...');
  await resetDatabase();

  const defaultPassword = await bcrypt.hash('fomo2026', 10);

  // ==========================================
  // 1. ADMIN
  // ==========================================
  console.log('A criar administrador...');
  await db.insert(schema.users).values({
    email: 'admin@fomo.pt',
    password: defaultPassword,
    name: 'Admin FOMO',
    role: Roles.ADMIN,
    phone: '912000000',
    countryCode: '+351',
  });

  // ==========================================
  // 2. VENDORS (promotores)
  // ==========================================
  console.log('A criar promotores...');

  const vendorsRaw = [
    {
      email: 'lx@fomo.pt',
      name: 'Rita Carvalho',
      businessName: 'LX Productions',
      businessDescription:
        'A maior produtora de eventos underground de Lisboa. Especialistas em warehouse parties, rooftops e experiências imersivas na capital.',
      phone: '913111111',
      countryCode: '+351',
      status: 'approved' as const,
    },
    {
      email: 'braga@fomo.pt',
      name: 'Tiago Melo',
      businessName: 'Braga Music Group',
      businessDescription:
        'Promotor do norte com ADN académico. Do pop ao techno, passando por festivais ao ar livre e noites estudantis no coração do Minho.',
      phone: '913222222',
      countryCode: '+351',
      status: 'approved' as const,
    },
    {
      email: 'porto@fomo.pt',
      name: 'Joana Ferreira',
      businessName: 'Porto Techno Hub',
      businessDescription:
        'Referência do techno industrial no Porto. Ocupamos espaços esquecidos da cidade e transformamo-los em templos de som e luz.',
      phone: '913333333',
      countryCode: '+351',
      status: 'approved' as const,
    },
    {
      email: 'algarve@fomo.pt',
      name: 'Diogo Costa',
      businessName: 'Algarve Summer Events',
      businessDescription:
        'Eventos de verão no Algarve com as melhores vistas para o Atlântico. House, afrobeats e pop para quem quer viver a noite do sul.',
      phone: '913444444',
      countryCode: '+351',
      status: 'approved' as const,
    },
    {
      email: 'coimbra@fomo.pt',
      name: 'Margarida Lopes',
      businessName: 'Coimbra Underground',
      businessDescription:
        'Colectivo de Coimbra dedicado à música experimental e electrónica de vanguarda. Sónica, espaços alternativos e arte performativa.',
      phone: '913555555',
      countryCode: '+351',
      status: 'pending' as const, // ainda não aprovado - bom para testes
    },
  ];

  const createdVendors: (typeof schema.vendorProfiles.$inferSelect)[] = [];
  for (const v of vendorsRaw) {
    const [user] = await db
      .insert(schema.users)
      .values({
        email: v.email,
        password: defaultPassword,
        name: v.name,
        role: Roles.VENDOR,
        active: v.status === 'approved',
        phone: v.phone,
        countryCode: v.countryCode,
      })
      .returning();

    const [profile] = await db
      .insert(schema.vendorProfiles)
      .values({
        userId: user.id,
        businessName: v.businessName,
        businessDescription: v.businessDescription,
        status: v.status,
      })
      .returning();

    createdVendors.push(profile);
  }

  // ==========================================
  // 3. UTILIZADORES NORMAIS (compradores)
  // ==========================================
  console.log('A criar utilizadores...');

  const buyersRaw = [
    { email: 'john@fomo.pt', name: 'John Doe', phone: '916100001', countryCode: '+351' },
    { email: 'maria@fomo.pt', name: 'Maria Silva', phone: '916100002', countryCode: '+351' },
    { email: 'pedro@fomo.pt', name: 'Pedro Santos', phone: '916100003', countryCode: '+351' },
    { email: 'ana@fomo.pt', name: 'Ana Martins', phone: '916100004', countryCode: '+351' },
    { email: 'rui@fomo.pt', name: 'Rui Pinto', phone: '916100005', countryCode: '+351' },
    { email: 'beatriz@fomo.pt', name: 'Beatriz Nunes', phone: '916100006', countryCode: '+351' },
    { email: 'carlos@fomo.pt', name: 'Carlos Mendes', phone: '916100007', countryCode: '+351' },
    { email: 'sofia@fomo.pt', name: 'Sofia Rodrigues', phone: '916100008', countryCode: '+351' },
    // Utilizador inactivo (conta bloqueada) - útil para testar login bloqueado
    { email: 'blocked@fomo.pt', name: 'Utilizador Bloqueado', phone: '916100009', countryCode: '+351', active: false },
  ];

  const normalUsers: any[] = [];
  for (const b of buyersRaw) {
    const [user] = await db
      .insert(schema.users)
      .values({
        email: b.email,
        password: defaultPassword,
        name: b.name,
        role: Roles.USER,
        active: b.active ?? true,
        phone: b.phone,
        countryCode: b.countryCode,
      })
      .returning();
    normalUsers.push(user);
  }

  // ==========================================
  // 4. EVENTOS
  // ==========================================
  console.log('A criar eventos...');

  // [vendorIndex, name, price, cap, date fn, status, location]
  const eventsRaw: Array<{
    vendorIdx: number;
    name: string;
    price: string;
    cap: number;
    date: Date;
    status: 'approved' | 'pending' | 'rejected';
    location: string;
    description: string;
  }> = [
    // ---- LX Productions (idx 0) ----
    {
      vendorIdx: 0,
      name: 'LX Summer Warehouse',
      price: '25.50',
      cap: 500,
      date: futureDate(7),
      status: 'approved',
      location: 'Armazém 7, Alcântara, Lisboa',
      description:
        'A warehouse party do verão lisboeta está de volta! Sound system Meyer Sound, quatro rooms com line-up nacional e internacional. Portas abrem às 23h.',
    },
    {
      vendorIdx: 0,
      name: 'Rooftop Sunset Grooves',
      price: '15.00',
      cap: 150,
      date: futureDate(14),
      status: 'approved',
      location: 'Rooftop LX Factory, Lisboa',
      description:
        'Por do sol com deep house e nu-disco acima da cidade. Vista panorâmica sobre o Tejo, cocktails e ambiente intimista. Capacidade limitada a 150 pessoas.',
    },
    {
      vendorIdx: 0,
      name: 'Boiler Room Vibes Lisbon',
      price: '40.00',
      cap: 300,
      date: futureDate(21),
      status: 'approved',
      location: 'Lx Factory Hall, Lisboa',
      description:
        'Formato ao estilo Boiler Room - câmeras, DJs a 360° e energia crua. Uma noite que ficará na memória. Lineup revelado 48h antes do evento.',
    },
    {
      vendorIdx: 0,
      name: 'FOMO Closing Party 2025',
      price: '30.00',
      cap: 800,
      date: pastDate(10),
      status: 'approved',
      location: 'Pavilhão Carlos Lopes, Lisboa',
      description:
        'A festa de encerramento da temporada 2025 com um mega lineup surpresa. Já aconteceu - consulta o próximo evento LX Productions.',
    },
    // ---- Braga Music Group (idx 1) ----
    {
      vendorIdx: 1,
      name: 'Minho Electronic Festival',
      price: '55.00',
      cap: 1500,
      date: futureDate(30),
      status: 'approved',
      location: 'Parque da Ponte, Braga',
      description:
        'O maior festival electrónico do Minho regressa com três palcos, instalações artísticas e um lineup de 30 artistas ao longo de dois dias. Campismo disponível.',
    },
    {
      vendorIdx: 1,
      name: 'Braga Student Night',
      price: '8.00',
      cap: 800,
      date: futureDate(5),
      status: 'approved',
      location: 'Theatro Circo, Braga',
      description:
        'A noite dos estudantes da Universidade do Minho. Open bar das 23h à meia-noite, hits nacionais e internacionais. Bilhete especial para estudantes com cartão UMinho.',
    },
    {
      vendorIdx: 1,
      name: 'Acoustic Sessions Garden',
      price: '12.50',
      cap: 100,
      date: futureDate(10),
      status: 'approved',
      location: 'Jardim de Santa Bárbara, Braga',
      description:
        'Uma tarde de música acústica no jardim barroco mais bonito de Braga. Artistas emergentes do norte, vinho do Minho e petiscos regionais.',
    },
    {
      vendorIdx: 1,
      name: 'Noite Celta - Braga Antiga',
      price: '20.00',
      cap: 400,
      date: futureDate(45),
      status: 'pending', // aguarda aprovação - bom para testes de admin
      location: 'Museu Pio XII, Braga',
      description:
        'Música tradicional celta fusionada com electrónica moderna. Uma viagem sonora às raízes galegas e bracarenses. Em pedido de aprovação.',
    },
    // ---- Porto Techno Hub (idx 2) ----
    {
      vendorIdx: 2,
      name: 'Porto Industrial Techno',
      price: '20.00',
      cap: 600,
      date: futureDate(9),
      status: 'approved',
      location: 'Antiga Fábrica Têxtil, Matosinhos',
      description:
        'Techno pesado numa fábrica abandonada com história. Quatro sistemas de som dedicados, iluminação industrial e line-up de headliners europeus.',
    },
    {
      vendorIdx: 2,
      name: 'Hardcore Beats Rave',
      price: '18.00',
      cap: 400,
      date: futureDate(17),
      status: 'approved',
      location: 'Maus Hábitos, Porto',
      description:
        'Hardcore, gabber e industrial. Não é para os fracos de coração. Recomendado para os verdadeiros aficionados do sound design extremo.',
    },
    {
      vendorIdx: 2,
      name: 'Underground Club Night',
      price: '10.00',
      cap: 250,
      date: futureDate(3),
      status: 'approved',
      location: 'Plano B, Porto',
      description:
        'A noite de clubbing underground mais popular do Porto. Minimal, acid e techno nas caves do Plano B. Sempre sold out - compra já o teu bilhete.',
    },
    {
      vendorIdx: 2,
      name: 'Porto Waterfront Rave',
      price: '35.00',
      cap: 1000,
      date: futureDate(60),
      status: 'approved',
      location: 'Cais de Gaia, Vila Nova de Gaia',
      description:
        'Rave à beira-rio com vista para a Ribeira. Line-up de 12 artistas, sunset set sobre o Douro e after-party até às 10h. O evento do ano no Porto.',
    },
    // ---- Algarve Summer Events (idx 3) ----
    {
      vendorIdx: 3,
      name: 'Sagres Sunset Festival',
      price: '45.00',
      cap: 2000,
      date: futureDate(25),
      status: 'approved',
      location: 'Praia do Martinhal, Sagres',
      description:
        'Festival de três dias na praia mais selvagem de Portugal. House, afrobeats e pop numa vila piscatória com o melhor pôr do sol da Europa.',
    },
    {
      vendorIdx: 3,
      name: 'Albufeira Beach Party',
      price: '22.00',
      cap: 500,
      date: futureDate(12),
      status: 'approved',
      location: 'Praia dos Pescadores, Albufeira',
      description:
        'A beach party mais animada do Algarve. DJs internacionais, palco na areia e bar aberto toda a noite. Começa ao pôr do sol e vai até ao amanhecer.',
    },
    {
      vendorIdx: 3,
      name: 'Faro Secret Pool Party',
      price: '28.00',
      cap: 200,
      date: futureDate(19),
      status: 'approved',
      location: 'Localização revelada 24h antes, Faro',
      description:
        'Pool party secreta num herdade privada nos arredores de Faro. Música, piscina, brunch e lineup surpresa. Localização enviada 24h antes.',
    },
    // ---- Coimbra Underground (idx 4) - promotor ainda pending ----
    {
      vendorIdx: 4,
      name: 'Coimbra Noise Session',
      price: '5.00',
      cap: 80,
      date: futureDate(8),
      status: 'pending',
      location: 'À Capella, Coimbra',
      description:
        'Música experimental e noise numa antiga cappella do século XII. Arte sonora, performance e electrónica de vanguarda. Evento aguarda aprovação.',
    },
  ];

  const createdEvents: any[] = [];
  for (let i = 0; i < eventsRaw.length; i++) {
    const ed = eventsRaw[i];
    const [event] = await db
      .insert(schema.events)
      .values({
        vendorId: createdVendors[ed.vendorIdx].id,
        name: ed.name,
        description: ed.description,
        location: ed.location,
        date: ed.date,
        bannerUrl: bannerUrl(i),
        ticketPrice: ed.price,
        maxCapacity: ed.cap,
        ticketsSold: 0,
        status: ed.status,
      })
      .returning();
    createdEvents.push(event);
  }

  // ==========================================
  // 5. COMPRAS DE BILHETES
  // ==========================================
  console.log('A simular histórico de compras...');

  async function buyTickets(
    userId: number,
    eventId: number,
    quantity: number,
    status: 'paid' | 'completed' = 'completed',
  ) {
    const eventRecord = await db.query.events.findFirst({
      where: eq(schema.events.id, eventId),
    });
    if (!eventRecord) return null;

    const unitPrice = Number(eventRecord.ticketPrice);
    const baseTotal = (quantity * unitPrice).toFixed(2);
    const serviceFee = (quantity * 1.5 + Number(baseTotal) * 0.025).toFixed(2);
    const grandTotal = (Number(baseTotal) + Number(serviceFee)).toFixed(2);

    const [order] = await db
      .insert(schema.orders)
      .values({
        userId,
        totalPrice: grandTotal,
        status,
        paymentReference: `REF${Date.now()}${Math.floor(Math.random() * 1000)}`,
      })
      .returning();

    await db.insert(schema.orderItems).values({
      orderId: order.id,
      eventId,
      quantity,
      unitPrice: unitPrice.toFixed(2),
      subtotal: baseTotal,
    });

    const ticketsToInsert = Array.from({ length: quantity }).map(() => ({
      userId,
      eventId,
      orderId: order.id,
      status: 'active' as const,
    }));
    await db.insert(schema.tickets).values(ticketsToInsert);

    await db
      .update(schema.events)
      .set({ ticketsSold: sql`${schema.events.ticketsSold} + ${quantity}` })
      .where(eq(schema.events.id, eventId));

    return order;
  }

  // Eventos por índice em createdEvents:
  // 0  = LX Summer Warehouse (500 cap, aprovado, futuro)
  // 1  = Rooftop Sunset Grooves (150 cap, aprovado, futuro)
  // 2  = Boiler Room Vibes Lisbon (300 cap, aprovado, futuro)
  // 3  = FOMO Closing Party 2025 (800 cap, aprovado, passado)
  // 4  = Minho Electronic Festival (1500 cap, aprovado, futuro)
  // 5  = Braga Student Night (800 cap, aprovado, futuro)
  // 6  = Acoustic Sessions Garden (100 cap, aprovado, futuro) - fica quase cheio
  // 7  = Noite Celta (400 cap, pending)
  // 8  = Porto Industrial Techno (600 cap, aprovado, futuro)
  // 9  = Hardcore Beats Rave (400 cap, aprovado, futuro)
  // 10 = Underground Club Night (250 cap, aprovado, futuro)
  // 11 = Porto Waterfront Rave (1000 cap, aprovado, futuro)
  // 12 = Sagres Sunset Festival (2000 cap, aprovado, futuro)
  // 13 = Albufeira Beach Party (500 cap, aprovado, futuro)
  // 14 = Faro Secret Pool Party (200 cap, aprovado, futuro)
  // 15 = Coimbra Noise Session (80 cap, pending)

  // John (users[0]) - fã de techno em Lisboa e Porto
  await buyTickets(normalUsers[0].id, createdEvents[0].id, 2);
  await buyTickets(normalUsers[0].id, createdEvents[2].id, 1);
  await buyTickets(normalUsers[0].id, createdEvents[8].id, 2);
  await buyTickets(normalUsers[0].id, createdEvents[3].id, 1); // evento passado

  // Maria (users[1]) - adora festas no Algarve e Braga
  await buyTickets(normalUsers[1].id, createdEvents[12].id, 3);
  await buyTickets(normalUsers[1].id, createdEvents[13].id, 2);
  await buyTickets(normalUsers[1].id, createdEvents[5].id, 2);

  // Pedro (users[2]) - consome tudo no Porto
  await buyTickets(normalUsers[2].id, createdEvents[9].id, 4);
  await buyTickets(normalUsers[2].id, createdEvents[10].id, 2);
  await buyTickets(normalUsers[2].id, createdEvents[11].id, 1);

  // Ana (users[3]) - prefere eventos mais íntimos
  await buyTickets(normalUsers[3].id, createdEvents[1].id, 2);
  await buyTickets(normalUsers[3].id, createdEvents[6].id, 1);
  await buyTickets(normalUsers[3].id, createdEvents[14].id, 1);

  // Rui (users[4]) - mega fan do festival de Braga
  await buyTickets(normalUsers[4].id, createdEvents[4].id, 4);
  await buyTickets(normalUsers[4].id, createdEvents[5].id, 3);

  // Beatriz (users[5])
  await buyTickets(normalUsers[5].id, createdEvents[0].id, 1);
  await buyTickets(normalUsers[5].id, createdEvents[13].id, 2);

  // Carlos (users[6])
  await buyTickets(normalUsers[6].id, createdEvents[8].id, 2);
  await buyTickets(normalUsers[6].id, createdEvents[2].id, 1);

  // Sofia (users[7]) - lota quase por completo o Acoustic Sessions (cap=100)
  // Já temos: Ana comprou 1 = 1 vendido. Sofia compra 96 -> total 97/100
  await buyTickets(normalUsers[7].id, createdEvents[6].id, 96);

  // ==========================================
  // 6. LOGS DE AUDITORIA
  // ==========================================
  console.log('A escrever logs de auditoria...');

  await db.insert(schema.auditLogs).values([
    { action: 'Sistema inicializado e migração da base de dados verificada com sucesso.' },
    { action: 'Perfis de vendor aprovados: LX Productions, Braga Music Group, Porto Techno Hub, Algarve Summer Events.', admin: 'Admin FOMO' },
    { action: 'Perfil de vendor Coimbra Underground mantido em estado pending para revisão manual.', admin: 'Admin FOMO' },
    { action: 'Aprovação em massa de 12 eventos de produção executada.', admin: 'Admin FOMO' },
    { action: 'Evento "Noite Celta - Braga Antiga" aguarda aprovação - verificar licenças de utilização do espaço.', admin: 'Admin FOMO' },
    { action: 'Evento "Coimbra Noise Session" aguarda aprovação do promotor associado.', admin: 'Admin FOMO' },
    { action: 'Simulação de compras históricas concluída - 8 utilizadores, 19 ordens geradas.', admin: 'Admin FOMO' },
    { action: 'Evento "Acoustic Sessions Garden" próximo da lotação máxima (97/100 bilhetes vendidos). Monitorizar.', admin: 'Admin FOMO' },
  ]);

  console.log('\nSeed concluído com sucesso!');
  console.log('\nResumo:');
  console.log('  - 1 admin  |  5 vendors (4 aprovados, 1 pending)  |  9 utilizadores (8 ativos, 1 bloqueado)');
  console.log('  - 16 eventos (12 aprovados, 3 pending, 1 passado)');
  console.log('  - Acoustic Sessions Garden: 97/100 bilhetes - quase esgotado!');
  console.log('\nCredenciais de acesso (password: fomo2026):');
  console.log('  admin@fomo.pt           -> ADMIN');
  console.log('  lx@fomo.pt              -> VENDOR (aprovado)');
  console.log('  braga@fomo.pt           -> VENDOR (aprovado)');
  console.log('  porto@fomo.pt           -> VENDOR (aprovado)');
  console.log('  algarve@fomo.pt         -> VENDOR (aprovado)');
  console.log('  coimbra@fomo.pt         -> VENDOR (pending)');
  console.log('  john@fomo.pt            -> USER');
  console.log('  blocked@fomo.pt         -> USER (bloqueado - testa login bloqueado)');

  process.exit(0);
}

seed().catch((err) => {
  console.error('Erro crítico ao executar o seed:', err);
  process.exit(1);
});
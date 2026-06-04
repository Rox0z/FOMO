import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication, CanActivate, ExecutionContext } from '@nestjs/common';
import request from 'supertest';
import { App } from 'supertest/types';

import { AppController } from '../src/app.controller';
import { AuthController } from '../src/auth/auth.controller';
import { UsersController } from '../src/users/users.controller';
import { VendorsController } from '../src/vendors/vendors.controller';
import { EventsController } from '../src/events/events.controller';
import { OrdersController } from '../src/orders/orders.controller';
import { TicketsController } from '../src/tickets/tickets.controller';
import { AdminController } from '../src/admin/admin.controller';

import { AuthService } from '../src/auth/auth.service';
import { UsersService } from '../src/users/users.service';
import { VendorsService } from '../src/vendors/vendors.service';
import { EventsService } from '../src/events/events.service';
import { OrdersService } from '../src/orders/orders.service';
import { TicketsService } from '../src/tickets/tickets.service';
import { AdminService } from '../src/admin/admin.service';
import { EventEditsService } from '../src/event-edits/event-edits.service';
import { ImagesService } from '../src/services/images/images.service';

import { JwtGuard } from '../src/auth/jwt/jwt.guard';
import { RolesGuard } from '../src/common/guards/role.guard';
import { EventOwnerGuard } from '../src/common/guards/event-owner.guard';
import { VendorApprovedGuard } from '../src/common/guards/vendor-approved.guard';

const authenticatedUser = {
  id: 1,
  email: 'buyer@test.com',
  role: 'user',
  name: 'Buyer Test',
};

class MockAuthGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const req = context.switchToHttp().getRequest();
    req.user = authenticatedUser;
    return true;
  }
}

class AllowGuard implements CanActivate {
  canActivate(): boolean {
    return true;
  }
}

describe('FOMO API e2e (mocked service layer)', () => {
  let app: INestApplication<App>;

  const authService = {
    register: jest.fn().mockResolvedValue({ id: 10, email: 'new@test.com', role: 'user' }),
    login: jest.fn().mockResolvedValue({ access_token: 'jwt-token', user: authenticatedUser }),
  };

  const usersService = {
    findAll: jest.fn().mockResolvedValue([authenticatedUser]),
    findOne: jest.fn().mockResolvedValue(authenticatedUser),
    update: jest.fn().mockResolvedValue({ ...authenticatedUser, name: 'Updated User' }),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  };

  const vendorsService = {
    findAll: jest.fn().mockResolvedValue([{ id: 1, companyName: 'Ritmos Algarve', status: 'approved' }]),
    findByUserId: jest.fn().mockResolvedValue({ id: 1, userId: 1, companyName: 'Ritmos Algarve' }),
    findOneProfile: jest.fn().mockResolvedValue({ id: 1, companyName: 'Ritmos Algarve' }),
    updateByUserId: jest.fn().mockResolvedValue({ id: 1, companyName: 'Updated Vendor' }),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  };

  const eventsService = {
    findAll: jest.fn().mockResolvedValue([{ id: 1, name: 'FOMO Rooftop', status: 'approved' }]),
    findOne: jest.fn().mockResolvedValue({ id: 1, name: 'FOMO Rooftop', status: 'approved' }),
    getMyStats: jest.fn().mockResolvedValue({ totalEvents: 1, ticketsSold: 25, revenue: 450 }),
    findMyEvents: jest.fn().mockResolvedValue([{ id: 1, name: 'FOMO Rooftop' }]),
    create: jest.fn().mockResolvedValue({ id: 2, name: 'New Event', status: 'pending' }),
    update: jest.fn().mockResolvedValue({ id: 1, name: 'Updated Event' }),
    remove: jest.fn().mockResolvedValue({ deleted: true }),
  };

  const ordersService = {
    simulateCheckout: jest.fn().mockResolvedValue({
      order: { id: 1, userId: 1, total: 36, status: 'paid' },
      tickets: [{ id: 1, eventId: 1, qrCode: 'data:image/png;base64,test' }],
    }),
  };

  const ticketsService = {
    findMyTickets: jest.fn().mockResolvedValue([{ id: 1, eventId: 1, status: 'active' }]),
  };

  const adminService = {
    overview: jest.fn().mockResolvedValue({ users: 3, vendors: 2, events: 4, orders: 1 }),
    requests: jest.fn().mockResolvedValue({ pendingVendors: 1, pendingEvents: 1, pendingEdits: 1 }),
    approveVendor: jest.fn().mockResolvedValue({ id: 1, status: 'approved' }),
    rejectVendor: jest.fn().mockResolvedValue({ id: 1, status: 'rejected' }),
    banUser: jest.fn().mockResolvedValue({ id: 2, isBanned: true }),
    unbanUser: jest.fn().mockResolvedValue({ id: 2, isBanned: false }),
    approveEvent: jest.fn().mockResolvedValue({ id: 1, status: 'approved' }),
    rejectEvent: jest.fn().mockResolvedValue({ id: 1, status: 'rejected' }),
  };

  const eventEditsService = {
    createEditRequest: jest.fn().mockResolvedValue({ id: 1, status: 'pending' }),
    approveEditRequest: jest.fn().mockResolvedValue({ id: 1, status: 'approved' }),
    rejectEditRequest: jest.fn().mockResolvedValue({ id: 1, status: 'rejected' }),
  };

  const imagesService = {
    uploadImage: jest.fn().mockResolvedValue('https://images.example/fomo-banner.png'),
  };

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      controllers: [
        AppController,
        AuthController,
        UsersController,
        VendorsController,
        EventsController,
        OrdersController,
        TicketsController,
        AdminController,
      ],
      providers: [
        { provide: 'DRIZZLE', useValue: { execute: jest.fn().mockResolvedValue([{ result: 1 }]) } },
        { provide: AuthService, useValue: authService },
        { provide: UsersService, useValue: usersService },
        { provide: VendorsService, useValue: vendorsService },
        { provide: EventsService, useValue: eventsService },
        { provide: OrdersService, useValue: ordersService },
        { provide: TicketsService, useValue: ticketsService },
        { provide: AdminService, useValue: adminService },
        { provide: EventEditsService, useValue: eventEditsService },
        { provide: ImagesService, useValue: imagesService },
      ],
    })
      .overrideGuard(JwtGuard)
      .useClass(MockAuthGuard)
      .overrideGuard(RolesGuard)
      .useClass(AllowGuard)
      .overrideGuard(EventOwnerGuard)
      .useClass(AllowGuard)
      .overrideGuard(VendorApprovedGuard)
      .useClass(AllowGuard)
      .compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  describe('health', () => {
    it('GET /api/health returns ok', () => request(app.getHttpServer()).get('/api/health').expect(200).expect({ status: 'ok' }));

    it('GET /api/db-health returns ok when database ping succeeds', () => request(app.getHttpServer()).get('/api/db-health').expect(200).expect({ status: 'ok' }));
  });

  describe('authentication', () => {
    it('POST /auth/register creates a regular user', async () => {
      const body = { name: 'New User', email: 'new@test.com', password: 'fomo2026' };
      await request(app.getHttpServer()).post('/auth/register').send(body).expect(201).expect({ id: 10, email: 'new@test.com', role: 'user' });
      expect(authService.register).toHaveBeenCalledWith(body);
    });

    it('POST /auth/login returns an access token', async () => {
      await request(app.getHttpServer()).post('/auth/login').send({ email: 'buyer@test.com', password: 'fomo2026' }).expect(201).expect(({ body }) => {
        expect(body.access_token).toBe('jwt-token');
        expect(body.user.email).toBe('buyer@test.com');
      });
    });

    it('GET /auth/profile returns authenticated user data', () => request(app.getHttpServer()).get('/auth/profile').expect(200).expect(authenticatedUser));
  });

  describe('users', () => {
    it('GET /users/me returns the current user', () => request(app.getHttpServer()).get('/users/me').expect(200).expect(authenticatedUser));
    it('GET /users lists users', () => request(app.getHttpServer()).get('/users').expect(200).expect([authenticatedUser]));
    it('GET /users/:id returns one user', () => request(app.getHttpServer()).get('/users/1').expect(200).expect(authenticatedUser));
    it('PATCH /users/me updates profile', () => request(app.getHttpServer()).patch('/users/me').send({ name: 'Updated User' }).expect(200).expect(({ body }) => expect(body.name).toBe('Updated User')));
    it('DELETE /users/:id deletes a user', () => request(app.getHttpServer()).delete('/users/2').expect(200).expect({ deleted: true }));
  });

  describe('vendors', () => {
    it('GET /vendors lists vendor profiles', () => request(app.getHttpServer()).get('/vendors').expect(200).expect([{ id: 1, companyName: 'Ritmos Algarve', status: 'approved' }]));
    it('GET /vendors/me returns own vendor profile', () => request(app.getHttpServer()).get('/vendors/me').expect(200).expect(({ body }) => expect(body.companyName).toBe('Ritmos Algarve')));
    it('PATCH /vendors/me updates own vendor profile', () => request(app.getHttpServer()).patch('/vendors/me').send({ companyName: 'Updated Vendor' }).expect(200).expect(({ body }) => expect(body.companyName).toBe('Updated Vendor')));
    it('DELETE /vendors/:id removes a vendor profile', () => request(app.getHttpServer()).delete('/vendors/1').expect(200).expect({ deleted: true }));
  });

  describe('events', () => {
    it('GET /events lists public events', () => request(app.getHttpServer()).get('/events').expect(200).expect([{ id: 1, name: 'FOMO Rooftop', status: 'approved' }]));
    it('GET /events/:id returns event details', () => request(app.getHttpServer()).get('/events/1').expect(200).expect(({ body }) => expect(body.name).toBe('FOMO Rooftop')));
    it('GET /events/my-stats returns vendor statistics', () => request(app.getHttpServer()).get('/events/my-stats').expect(200).expect({ totalEvents: 1, ticketsSold: 25, revenue: 450 }));
    it('GET /events/my-events returns vendor events', () => request(app.getHttpServer()).get('/events/my-events').expect(200).expect([{ id: 1, name: 'FOMO Rooftop' }]));
    it('POST /events creates a pending event', () => request(app.getHttpServer()).post('/events').field('name', 'New Event').field('description', 'A test event').field('location', 'Faro').field('date', '2026-06-20').field('time', '22:00').field('price', '18').field('maxCapacity', '200').expect(201).expect(({ body }) => expect(body.status).toBe('pending')));
    it('PUT /events/:id/request-edit creates an edit request', () => request(app.getHttpServer()).put('/events/1/request-edit').field('name', 'Updated Event').expect(200).expect({ id: 1, status: 'pending' }));
    it('PATCH /events/:id updates an event directly', () => request(app.getHttpServer()).patch('/events/1').send({ name: 'Updated Event' }).expect(200).expect(({ body }) => expect(body.name).toBe('Updated Event')));
    it('DELETE /events/:id removes an event', () => request(app.getHttpServer()).delete('/events/1').expect(200).expect({ deleted: true }));
  });

  describe('orders and tickets', () => {
    it('POST /orders/checkout creates an order and tickets', () => request(app.getHttpServer()).post('/orders/checkout').send({ items: [{ eventId: 1, quantity: 2 }] }).expect(201).expect(({ body }) => {
      expect(body.order.total).toBe(36);
      expect(body.tickets).toHaveLength(1);
    }));

    it('GET /tickets/me returns current user tickets', () => request(app.getHttpServer()).get('/tickets/me').expect(200).expect([{ id: 1, eventId: 1, status: 'active' }]));
  });

  describe('admin', () => {
    it('GET /admin/overview returns dashboard metrics', () => request(app.getHttpServer()).get('/admin/overview').expect(200).expect({ users: 3, vendors: 2, events: 4, orders: 1 }));
    it('GET /admin/requests returns pending requests', () => request(app.getHttpServer()).get('/admin/requests').expect(200).expect({ pendingVendors: 1, pendingEvents: 1, pendingEdits: 1 }));
    it('PATCH /admin/vendors/:id/approve approves vendor', () => request(app.getHttpServer()).patch('/admin/vendors/1/approve').expect(200).expect({ id: 1, status: 'approved' }));
    it('PATCH /admin/vendors/:id/reject rejects vendor', () => request(app.getHttpServer()).patch('/admin/vendors/1/reject').expect(200).expect({ id: 1, status: 'rejected' }));
    it('PATCH /admin/users/:id/ban bans user', () => request(app.getHttpServer()).patch('/admin/users/2/ban').expect(200).expect({ id: 2, isBanned: true }));
    it('PATCH /admin/users/:id/unban unbans user', () => request(app.getHttpServer()).patch('/admin/users/2/unban').expect(200).expect({ id: 2, isBanned: false }));
    it('PATCH /admin/events/:id/approve approves event', () => request(app.getHttpServer()).patch('/admin/events/1/approve').expect(200).expect({ id: 1, status: 'approved' }));
    it('PATCH /admin/events/:id/reject rejects event', () => request(app.getHttpServer()).patch('/admin/events/1/reject').expect(200).expect({ id: 1, status: 'rejected' }));
    it('PATCH /admin/events/edits/:editId/approve approves event edit', () => request(app.getHttpServer()).patch('/admin/events/edits/1/approve').expect(200).expect({ id: 1, status: 'approved' }));
    it('PATCH /admin/events/edits/:editId/reject rejects event edit', () => request(app.getHttpServer()).patch('/admin/events/edits/1/reject').expect(200).expect({ id: 1, status: 'rejected' }));
  });
});

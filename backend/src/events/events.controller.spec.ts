import { EventsController } from './events.controller';

describe('EventsController', () => {
  let controller: EventsController;
  let eventsService: any;
  let imagesService: any;
  let eventEditsService: any;

  beforeEach(() => {
    eventsService = { findAll: jest.fn(), create: jest.fn(), getMyStats: jest.fn(), findMyEvents: jest.fn(), findOne: jest.fn(), update: jest.fn(), remove: jest.fn() };
    imagesService = { uploadImage: jest.fn() };
    eventEditsService = { createEditRequest: jest.fn() };
    controller = new EventsController(eventsService, imagesService, eventEditsService);
  });

  it('lists public events', () => {
    eventsService.findAll.mockReturnValue([{ id: 1 }]);
    expect(controller.findAll()).toEqual([{ id: 1 }]);
  });

  it('uploads a banner when creating an event', async () => {
    imagesService.uploadImage.mockResolvedValue('/uploads/banner.jpg');
    eventsService.create.mockResolvedValue({ id: 1 });

    await expect(controller.create({ name: 'Event' } as any, { id: 7 }, { buffer: Buffer.from('x') } as any)).resolves.toEqual({ id: 1 });
    expect(eventsService.create).toHaveBeenCalledWith({ name: 'Event' }, 7, '/uploads/banner.jpg');
  });
});

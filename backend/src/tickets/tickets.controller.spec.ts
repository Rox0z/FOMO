import { TicketsController } from './tickets.controller';

describe('TicketsController', () => {
  it('delegates ticket listing to TicketsService with current user id', () => {
    const service = { findMyTickets: jest.fn().mockReturnValue([{ id: 1 }]) };
    const controller = new TicketsController(service as any);

    expect(controller.findMyTickets({ id: 7 })).toEqual([{ id: 1 }]);
    expect(service.findMyTickets).toHaveBeenCalledWith(7);
  });
});

import { OrdersController } from './orders.controller';

describe('OrdersController', () => {
  it('delegates checkout to OrdersService with current user id', () => {
    const service = { simulateCheckout: jest.fn().mockReturnValue({ success: true }) };
    const controller = new OrdersController(service as any);
    const dto = { items: [{ eventId: 1, quantity: 2 }] };

    expect(controller.checkout({ id: 7 }, dto)).toEqual({ success: true });
    expect(service.simulateCheckout).toHaveBeenCalledWith(7, dto);
  });
});

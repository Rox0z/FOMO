import { LogsController } from './logs.controller';

describe('LogsController', () => {
  it('delegates listing logs to the service', async () => {
    const service = { findAll: jest.fn().mockResolvedValue([{ id: 1 }]) };
    const controller = new LogsController(service as any);

    await expect(controller.findAll()).resolves.toEqual([{ id: 1 }]);
    expect(service.findAll).toHaveBeenCalled();
  });
});

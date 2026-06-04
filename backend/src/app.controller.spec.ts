import { AppController } from './app.controller';

describe('AppController', () => {
  let controller: AppController;
  let db: { execute: jest.Mock };

  beforeEach(() => {
    db = { execute: jest.fn() };
    controller = new AppController(db as any);
  });

  it('returns API health status', () => {
    expect(controller.health()).toEqual({ status: 'ok' });
  });

  it('returns database health status when the query succeeds', async () => {
    db.execute.mockResolvedValue([{ ok: 1 }]);
    await expect(controller.dbHealth()).resolves.toEqual({ status: 'ok' });
  });

  it('returns error status when the database query fails', async () => {
    jest.spyOn(console, 'trace').mockImplementation(() => undefined);
    db.execute.mockRejectedValue(new Error('db unavailable'));
    await expect(controller.dbHealth()).resolves.toEqual({ status: 'error' });
  });
});

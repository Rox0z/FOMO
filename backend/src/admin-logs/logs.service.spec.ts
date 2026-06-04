import { LogsService } from './logs.service';

describe('LogsService', () => {
  let db: any;
  let service: LogsService;

  beforeEach(() => {
    db = {
      select: jest.fn(),
      insert: jest.fn(),
    };
    service = new LogsService(db);
  });

  it('orders audit logs by creation date descending', async () => {
    const orderBy = jest.fn().mockResolvedValue([{ id: 1 }]);
    const from = jest.fn().mockReturnValue({ orderBy });
    db.select.mockReturnValue({ from });

    await expect(service.findAll()).resolves.toEqual([{ id: 1 }]);
    expect(db.select).toHaveBeenCalled();
    expect(from).toHaveBeenCalled();
    expect(orderBy).toHaveBeenCalled();
  });

  it('creates an audit log entry', async () => {
    const returning = jest.fn().mockResolvedValue([{ id: 1, action: 'approved vendor' }]);
    const values = jest.fn().mockReturnValue({ returning });
    db.insert.mockReturnValue({ values });

    await expect(service.createLog('approved vendor', 'Admin')).resolves.toEqual([
      { id: 1, action: 'approved vendor' },
    ]);
    expect(values).toHaveBeenCalledWith({ action: 'approved vendor', admin: 'Admin' });
  });
});

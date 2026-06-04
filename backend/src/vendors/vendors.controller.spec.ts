import { VendorsController } from './vendors.controller';

describe('VendorsController', () => {
  let service: any;
  let controller: VendorsController;

  beforeEach(() => {
    service = {
      findAll: jest.fn(),
      findByUserId: jest.fn(),
      findOneProfile: jest.fn(),
      updateByUserId: jest.fn(),
      remove: jest.fn(),
    };
    controller = new VendorsController(service);
  });

  it('lists all vendor profiles for admins', () => {
    service.findAll.mockReturnValue([{ id: 1 }]);
    expect(controller.findAll()).toEqual([{ id: 1 }]);
  });

  it('returns the current vendor profile', async () => {
    service.findByUserId.mockResolvedValue({ id: 1, userId: 7 });
    await expect(controller.me({ id: 7 })).resolves.toEqual({ id: 1, userId: 7 });
    expect(service.findByUserId).toHaveBeenCalledWith(7);
  });

  it('gets a vendor profile by numeric profile id', () => {
    service.findOneProfile.mockReturnValue({ id: 3 });
    expect(controller.findOne('3')).toEqual({ id: 3 });
    expect(service.findOneProfile).toHaveBeenCalledWith(3);
  });

  it('updates the current vendor profile', () => {
    const dto = { businessName: 'Updated Business' };
    service.updateByUserId.mockReturnValue({ id: 1, ...dto });
    expect(controller.updateMe({ id: 7 }, dto)).toEqual({ id: 1, ...dto });
    expect(service.updateByUserId).toHaveBeenCalledWith(7, dto);
  });

  it('removes a vendor by numeric user id', () => {
    service.remove.mockReturnValue({ message: 'Vendor 8 removed' });
    expect(controller.remove('8')).toEqual({ message: 'Vendor 8 removed' });
    expect(service.remove).toHaveBeenCalledWith(8);
  });
});

import { UsersController } from './users.controller';

describe('UsersController', () => {
  let service: any;
  let controller: UsersController;

  beforeEach(() => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      update: jest.fn(),
      remove: jest.fn(),
    };
    controller = new UsersController(service);
  });

  it('returns current user profile from token payload', () => {
    const user = { id: 1, email: 'user@fomo.pt' };
    expect(controller.me(user)).toEqual(user);
  });

  it('lists users through the service', () => {
    service.findAll.mockReturnValue([{ id: 1 }]);
    expect(controller.findAll()).toEqual([{ id: 1 }]);
  });

  it('gets a user by numeric id', () => {
    service.findOne.mockReturnValue({ id: 2 });
    expect(controller.findOne('2')).toEqual({ id: 2 });
    expect(service.findOne).toHaveBeenCalledWith(2);
  });

  it('updates the current user profile', () => {
    service.update.mockReturnValue({ id: 3, name: 'Updated' });
    expect(controller.updateMe({ id: 3 }, { name: 'Updated' })).toEqual({ id: 3, name: 'Updated' });
    expect(service.update).toHaveBeenCalledWith(3, { name: 'Updated' });
  });

  it('removes a user by numeric id', () => {
    service.remove.mockReturnValue({ message: 'User 4 deleted' });
    expect(controller.remove('4')).toEqual({ message: 'User 4 deleted' });
    expect(service.remove).toHaveBeenCalledWith(4);
  });
});

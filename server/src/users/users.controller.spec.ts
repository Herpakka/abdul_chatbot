import { Test, TestingModule } from '@nestjs/testing';
import { UsersController } from './users.controller';
import { AuthService } from 'src/auth/auth.service';

describe('UsersController', () => {
  let controller: UsersController;
  let authService: AuthService;

  const mockAuthService = {
    getUserById: jest.fn().mockResolvedValue({
      id: 'uuid-1',
      email: 'john@example.com',
      username: 'john',
      createdAt: new Date(),
      updatedAt: new Date(),
    }),
    updateUser: jest.fn().mockImplementation(async (id: string, dto: any) => ({
      id,
      email: 'john@example.com',
      username: dto.username ?? 'john',
      createdAt: new Date('2024-01-01T00:00:00.000Z'),
      updatedAt: new Date(),
    })),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UsersController],
      providers: [AuthService],
    })
      .overrideProvider(AuthService)
      .useValue(mockAuthService)
      .compile();

    controller = module.get<UsersController>(UsersController);
    authService = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('getUserById should return user from service', async () => {
    const user = await controller.getUserById('uuid-1' as any);
    expect(user.id).toBe('uuid-1');
    expect(authService.getUserById).toHaveBeenCalledWith('uuid-1');
  });

  it('updateUser should call service and return updated user', async () => {
    const result = await controller.updateUser('uuid-1' as any, { username: 'newname' } as any);
    expect(result.username).toBe('newname');
    expect(authService.updateUser).toHaveBeenCalledWith('uuid-1', { username: 'newname' });
  });
});


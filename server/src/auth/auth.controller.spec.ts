import { Test, TestingModule } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: AuthService;

  const mockAuthService = {
    register: jest.fn(),
    login: jest.fn(),
    getUserById: jest.fn(),
    updateUser: jest.fn(),
    getPasswordById: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        {
          provide: AuthService,
          useValue: mockAuthService,
        },
      ],
    }).compile();

    controller = module.get<AuthController>(AuthController);
    authService = module.get<AuthService>(AuthService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('register', () => {
    it('should call authService.register with correct data', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const expectedResult = {
        id: '1',
        email: createUserDto.email,
        username: createUserDto.username,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.register.mockResolvedValue(expectedResult);

      const result = await controller.register(createUserDto);

      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
      expect(mockAuthService.register).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle registration errors', async () => {
      const createUserDto: CreateUserDto = {
        email: 'test@example.com',
        username: 'testuser',
        password: 'password123',
      };

      const error = new Error('Email already exists');
      mockAuthService.register.mockRejectedValue(error);

      await expect(controller.register(createUserDto)).rejects.toThrow(error);
      expect(mockAuthService.register).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('login', () => {
    it('should call authService.login with correct credentials', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'password123',
      };

      const expectedResult = {
        access_token: 'jwt-token-123',
      };

      mockAuthService.login.mockResolvedValue(expectedResult);

      const result = await controller.login(loginDto);

      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
      expect(mockAuthService.login).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle login errors', async () => {
      const loginDto: LoginDto = {
        email: 'test@example.com',
        password: 'wrongpassword',
      };

      const error = new Error('Invalid credentials');
      mockAuthService.login.mockRejectedValue(error);

      await expect(controller.login(loginDto)).rejects.toThrow(error);
      expect(mockAuthService.login).toHaveBeenCalledWith(loginDto);
    });
  });

  describe('getProfile', () => {
    it('should return user profile for authenticated user', async () => {
      const userId = '1';
      const mockRequest = {
        user: { id: userId },
      };

      const expectedProfile = {
        id: userId,
        email: 'test@example.com',
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.getUserById.mockResolvedValue(expectedProfile);

      const result = await controller.getProfile(mockRequest);

      expect(mockAuthService.getUserById).toHaveBeenCalledWith(userId);
      expect(mockAuthService.getUserById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedProfile);
    });

    it('should handle profile retrieval errors', async () => {
      const userId = '1';
      const mockRequest = {
        user: { id: userId },
      };

      const error = new Error('User not found');
      mockAuthService.getUserById.mockRejectedValue(error);

      await expect(controller.getProfile(mockRequest)).rejects.toThrow(error);
      expect(mockAuthService.getUserById).toHaveBeenCalledWith(userId);
    });
  });

  describe('updateProfile', () => {
    it('should update user profile successfully', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        username: 'newusername',
        password: 'newpassword123',
      };

      const mockRequest = {
        user: { id: userId },
      };

      const expectedResult = {
        id: userId,
        email: 'test@example.com',
        username: updateUserDto.username,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.updateUser.mockResolvedValue(expectedResult);

      const result = await controller.updateProfile(mockRequest, updateUserDto);

      expect(mockAuthService.updateUser).toHaveBeenCalledWith(userId, updateUserDto);
      expect(mockAuthService.updateUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should update only username', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        username: 'newusername',
      };

      const mockRequest = {
        user: { id: userId },
      };

      const expectedResult = {
        id: userId,
        email: 'test@example.com',
        username: updateUserDto.username,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockAuthService.updateUser.mockResolvedValue(expectedResult);

      const result = await controller.updateProfile(mockRequest, updateUserDto);

      expect(mockAuthService.updateUser).toHaveBeenCalledWith(userId, updateUserDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle profile update errors', async () => {
      const userId = '1';
      const updateUserDto: UpdateUserDto = {
        username: 'existingusername',
      };

      const mockRequest = {
        user: { id: userId },
      };

      const error = new Error('Username already exists');
      mockAuthService.updateUser.mockRejectedValue(error);

      await expect(controller.updateProfile(mockRequest, updateUserDto)).rejects.toThrow(error);
      expect(mockAuthService.updateUser).toHaveBeenCalledWith(userId, updateUserDto);
    });
  });

  describe('getPasswordById', () => {
    it('should validate password successfully', async () => {
      const userId = '1';
      const passwordDto = { password: 'correctpassword' };
      const mockRequest = {
        user: { id: userId },
      };

      const expectedResult = {
        checking: 'ok',
      };

      mockAuthService.getPasswordById.mockResolvedValue(expectedResult);

      const result = await controller.getPasswordById(mockRequest, passwordDto);

      expect(mockAuthService.getPasswordById).toHaveBeenCalledWith(userId, passwordDto.password);
      expect(mockAuthService.getPasswordById).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should return error for invalid password', async () => {
      const userId = '1';
      const passwordDto = { password: 'wrongpassword' };
      const mockRequest = {
        user: { id: userId },
      };

      const expectedResult = {
        checking: 'error',
      };

      mockAuthService.getPasswordById.mockResolvedValue(expectedResult);

      const result = await controller.getPasswordById(mockRequest, passwordDto);

      expect(mockAuthService.getPasswordById).toHaveBeenCalledWith(userId, passwordDto.password);
      expect(result).toEqual(expectedResult);
    });

    it('should handle password validation errors', async () => {
      const userId = '1';
      const passwordDto = { password: 'password123' };
      const mockRequest = {
        user: { id: userId },
      };

      const error = new Error('User not found');
      mockAuthService.getPasswordById.mockRejectedValue(error);

      await expect(controller.getPasswordById(mockRequest, passwordDto)).rejects.toThrow(error);
      expect(mockAuthService.getPasswordById).toHaveBeenCalledWith(userId, passwordDto.password);
    });
  });

  describe('dependency injection', () => {
    it('should inject AuthService correctly', () => {
      expect(authService).toBeDefined();
      expect(authService).toBe(mockAuthService);
    });
  });

  describe('controller methods existence', () => {
    it('should have all required methods', () => {
      expect(typeof controller.register).toBe('function');
      expect(typeof controller.login).toBe('function');
      expect(typeof controller.getProfile).toBe('function');
      expect(typeof controller.updateProfile).toBe('function');
      expect(typeof controller.getPasswordById).toBe('function');
    });
  });
});

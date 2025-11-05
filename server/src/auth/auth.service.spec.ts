import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';

import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';

jest.mock('bcrypt', () => ({
  hash: jest.fn(),
  compare: jest.fn(),
}));

const mockedBcrypt = bcrypt as jest.Mocked<typeof bcrypt>;

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: PrismaService;
  let jwtService: JwtService;

  const mockPrismaService = {
    user: {
      findFirst: jest.fn(),
      findUnique: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
    },
  };

  const mockJwtService = {
    sign: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
        {
          provide: JwtService,
          useValue: mockJwtService,
        },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    prismaService = module.get<PrismaService>(PrismaService);
    jwtService = module.get<JwtService>(JwtService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    const createUserDto: CreateUserDto = {
      email: 'test@example.com',
      username: 'testuser',
      password: 'password123',
    };

    it('should successfully register a new user', async () => {
      const hashedPassword = 'hashedPassword123';
      const createdUser = {
        id: '1',
        email: createUserDto.email,
        username: createUserDto.username,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.create.mockResolvedValue(createdUser);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await service.register(createUserDto);

      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: createUserDto.email },
            { username: createUserDto.username },
          ],
        },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(createUserDto.password, 10);
      expect(mockPrismaService.user.create).toHaveBeenCalledWith({
        data: {
          email: createUserDto.email,
          username: createUserDto.username,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(createdUser);
    });

    it('should throw ConflictException if email already exists', async () => {
      const existingUser = {
        id: '1',
        email: createUserDto.email,
        username: 'differentuser',
      };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);

      await expect(service.register(createUserDto)).rejects.toThrow(
        new ConflictException('Email already in use')
      );
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: {
          OR: [
            { email: createUserDto.email },
            { username: createUserDto.username },
          ],
        },
      });
    });

    it('should throw ConflictException if username already exists', async () => {
      const existingUser = {
        id: '1',
        email: 'different@example.com',
        username: createUserDto.username,
      };

      mockPrismaService.user.findFirst.mockResolvedValue(existingUser);

      await expect(service.register(createUserDto)).rejects.toThrow(
        new ConflictException('Username already in use')
      );
    });
  });

  describe('validateUser', () => {
    const email = 'test@example.com';
    const password = 'password123';
    const hashedPassword = 'hashedPassword123';

    it('should return user without password if validation is successful', async () => {
      const user = {
        id: '1',
        email,
        username: 'testuser',
        password: hashedPassword,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.validateUser(email, password);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toEqual({
        id: '1',
        email,
        username: 'testuser',
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      });
      expect(result).not.toHaveProperty('password');
    });

    it('should return null if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateUser(email, password);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email },
      });
      expect(result).toBeNull();
    });

    it('should return null if password is invalid', async () => {
      const user = {
        id: '1',
        email,
        username: 'testuser',
        password: hashedPassword,
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.validateUser(email, password);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, hashedPassword);
      expect(result).toBeNull();
    });
  });

  describe('login', () => {
    const loginDto: LoginDto = {
      email: 'test@example.com',
      password: 'password123',
    };

    beforeEach(() => {
      // Mock environment variable
      process.env.JWT_EXPIRES = '15m';
    });

    it('should return access token on successful login', async () => {
      const user = {
        id: '1',
        email: loginDto.email,
        username: 'testuser',
        password: 'hashedPassword123',
      };
      const accessToken = 'mock-jwt-token';

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);
      mockJwtService.sign.mockReturnValue(accessToken);

      const result = await service.login(loginDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
      expect(mockJwtService.sign).toHaveBeenCalledWith(
        {
          sub: user.id,
          email: user.email,
          username: user.username,
        },
        { expiresIn: '15m' }
      );
      expect(result).toEqual({ access_token: accessToken });
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.login(loginDto)).rejects.toThrow(
        new NotFoundException('User not found')
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: loginDto.email },
      });
    });

    it('should throw UnauthorizedException if password is invalid', async () => {
      const user = {
        id: '1',
        email: loginDto.email,
        username: 'testuser',
        password: 'hashedPassword123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      await expect(service.login(loginDto)).rejects.toThrow(
        new UnauthorizedException('Invalid credentials')
      );
      expect(bcrypt.compare).toHaveBeenCalledWith(loginDto.password, user.password);
    });
  });

  describe('updateUser', () => {
    const userId = '1';
    const updateUserDto: UpdateUserDto = {
      username: 'newusername',
      password: 'newpassword123',
    };

    it('should successfully update user with username and password', async () => {
      const existingUser = {
        id: userId,
        email: 'test@example.com',
        username: 'oldusername',
      };
      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        username: updateUserDto.username,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      const hashedPassword = 'newHashedPassword123';

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);
      mockedBcrypt.hash.mockResolvedValue(hashedPassword as never);

      const result = await service.updateUser(userId, updateUserDto);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { username: updateUserDto.username, NOT: { id: userId } },
      });
      expect(bcrypt.hash).toHaveBeenCalledWith(updateUserDto.password, 10);
      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: {
          username: updateUserDto.username,
          password: hashedPassword,
        },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should successfully update only username', async () => {
      const updateDto = { username: 'newusername' };
      const existingUser = { id: userId, email: 'test@example.com' };
      const updatedUser = {
        id: userId,
        email: 'test@example.com',
        username: updateDto.username,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.findFirst.mockResolvedValue(null);
      mockPrismaService.user.update.mockResolvedValue(updatedUser);

      const result = await service.updateUser(userId, updateDto);

      expect(mockPrismaService.user.update).toHaveBeenCalledWith({
        where: { id: userId },
        data: { username: updateDto.username },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(updatedUser);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.updateUser(userId, updateUserDto)).rejects.toThrow(
        new NotFoundException('User not found')
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
      });
    });

    it('should throw ConflictException if username already exists', async () => {
      const existingUser = { id: userId, email: 'test@example.com' };
      const usernameConflict = { id: '2', username: updateUserDto.username };

      mockPrismaService.user.findUnique.mockResolvedValue(existingUser);
      mockPrismaService.user.findFirst.mockResolvedValue(usernameConflict);

      await expect(service.updateUser(userId, updateUserDto)).rejects.toThrow(
        new ConflictException('Username already in use')
      );
      expect(mockPrismaService.user.findFirst).toHaveBeenCalledWith({
        where: { username: updateUserDto.username, NOT: { id: userId } },
      });
    });
  });

  describe('getUserById', () => {
    const userId = '1';

    it('should return user by id successfully', async () => {
      const user = {
        id: userId,
        email: 'test@example.com',
        username: 'testuser',
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);

      const result = await service.getUserById(userId);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual(user);
    });

    it('should throw NotFoundException if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      await expect(service.getUserById(userId)).rejects.toThrow(
        new NotFoundException('User not found')
      );
      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          id: true,
          email: true,
          username: true,
          createdAt: true,
          updatedAt: true,
        },
      });
    });
  });

  describe('getPasswordById', () => {
    const userId = '1';
    const password = 'password123';

    it('should return ok if password is valid', async () => {
      const user = {
        password: 'hashedPassword123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(true as never);

      const result = await service.getPasswordById(userId, password);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          password: true,
        },
      });
      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(result).toEqual({ checking: 'ok' });
    });

    it('should return error if user does not exist', async () => {
      mockPrismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.getPasswordById(userId, password);

      expect(mockPrismaService.user.findUnique).toHaveBeenCalledWith({
        where: { id: userId },
        select: {
          password: true,
        },
      });
      expect(result).toEqual({ checking: 'error' });
    });

    it('should return error if password is invalid', async () => {
      const user = {
        password: 'hashedPassword123',
      };

      mockPrismaService.user.findUnique.mockResolvedValue(user);
      jest.spyOn(bcrypt, 'compare').mockResolvedValue(false as never);

      const result = await service.getPasswordById(userId, password);

      expect(bcrypt.compare).toHaveBeenCalledWith(password, user.password);
      expect(result).toEqual({ checking: 'error' });
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { ChatsService } from './chats.service';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

describe('ChatsService', () => {
  let service: ChatsService;
  let prismaService: PrismaService;

  const mockPrismaService = {
    chats: {
      create: jest.fn(),
      findMany: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    },
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChatsService,
        {
          provide: PrismaService,
          useValue: mockPrismaService,
        },
      ],
    }).compile();

    service = module.get<ChatsService>(ChatsService);
    prismaService = module.get<PrismaService>(PrismaService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createChatDto: CreateChatDto = {
      userId: 'user-123',
      chatTitle: 'My New Chat',
    };

    it('should create a new chat successfully', async () => {
      const mockCreatedChat = {
        id: 'chat-123',
        userId: createChatDto.userId,
        chatTitle: createChatDto.chatTitle,
        createdAt: new Date('2025-09-15T08:00:00.000Z'),
        updatedAt: new Date('2025-09-15T08:00:00.000Z'),
      };

      mockPrismaService.chats.create.mockResolvedValue(mockCreatedChat);

      const result = await service.create(createChatDto);

      expect(mockPrismaService.chats.create).toHaveBeenCalledWith({
        data: {
          userId: createChatDto.userId,
          chatTitle: createChatDto.chatTitle,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
      expect(mockPrismaService.chats.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockCreatedChat);
    });

    it('should handle database errors during chat creation', async () => {
      const error = new Error('Database connection failed');
      mockPrismaService.chats.create.mockRejectedValue(error);

      await expect(service.create(createChatDto)).rejects.toThrow(error);
      expect(mockPrismaService.chats.create).toHaveBeenCalledWith({
        data: {
          userId: createChatDto.userId,
          chatTitle: createChatDto.chatTitle,
          createdAt: expect.any(Date),
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should create chat with current timestamp', async () => {
      const mockCreatedChat = {
        id: 'chat-123',
        userId: createChatDto.userId,
        chatTitle: createChatDto.chatTitle,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockPrismaService.chats.create.mockResolvedValue(mockCreatedChat);

      const beforeCall = new Date();
      await service.create(createChatDto);
      const afterCall = new Date();

      const callArgs = mockPrismaService.chats.create.mock.calls[0][0];
      const createdAt = callArgs.data.createdAt;
      const updatedAt = callArgs.data.updatedAt;

      expect(createdAt).toBeInstanceOf(Date);
      expect(updatedAt).toBeInstanceOf(Date);
      expect(createdAt.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(createdAt.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });
  });

  describe('findByUser', () => {
    const userId = 'user-123';

    it('should find all chats for a specific user', async () => {
      const mockChats = [
        {
          id: 'chat-1',
          chatTitle: 'Chat 1',
          updatedAt: new Date('2025-09-15T08:00:00.000Z'),
        },
        {
          id: 'chat-2',
          chatTitle: 'Chat 2',
          updatedAt: new Date('2025-09-15T09:00:00.000Z'),
        },
      ];

      mockPrismaService.chats.findMany.mockResolvedValue(mockChats);

      const result = await service.findByUser(userId);

      expect(mockPrismaService.chats.findMany).toHaveBeenCalledWith({
        where: { userId: userId },
        select: {
          id: true,
          chatTitle: true,
          updatedAt: true,
        },
      });
      expect(mockPrismaService.chats.findMany).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockChats);
    });

    it('should return empty array when user has no chats', async () => {
      mockPrismaService.chats.findMany.mockResolvedValue([]);

      const result = await service.findByUser(userId);

      expect(mockPrismaService.chats.findMany).toHaveBeenCalledWith({
        where: { userId: userId },
        select: {
          id: true,
          chatTitle: true,
          updatedAt: true,
        },
      });
      expect(result).toEqual([]);
    });

    it('should handle database errors during chat retrieval', async () => {
      const error = new Error('Database query failed');
      mockPrismaService.chats.findMany.mockRejectedValue(error);

      await expect(service.findByUser(userId)).rejects.toThrow(error);
      expect(mockPrismaService.chats.findMany).toHaveBeenCalledWith({
        where: { userId: userId },
        select: {
          id: true,
          chatTitle: true,
          updatedAt: true,
        },
      });
    });

    it('should only select specific fields (id, chatTitle, updatedAt)', async () => {
      const mockChats = [
        {
          id: 'chat-1',
          chatTitle: 'Chat 1',
          updatedAt: new Date(),
        },
      ];

      mockPrismaService.chats.findMany.mockResolvedValue(mockChats);

      await service.findByUser(userId);

      const callArgs = mockPrismaService.chats.findMany.mock.calls[0][0];
      expect(callArgs.select).toEqual({
        id: true,
        chatTitle: true,
        updatedAt: true,
      });
      // Ensure other fields like userId, createdAt are not selected
      expect(callArgs.select.userId).toBeUndefined();
      expect(callArgs.select.createdAt).toBeUndefined();
    });
  });

  describe('update', () => {
    const chatId = 'chat-123';
    const updateChatDto: UpdateChatDto = {
      chatTitle: 'Updated Chat Title',
    };

    it('should update chat successfully', async () => {
      const mockUpdatedChat = {
        id: chatId,
        userId: 'user-123',
        chatTitle: updateChatDto.chatTitle,
        createdAt: new Date('2025-09-15T08:00:00.000Z'),
        updatedAt: new Date('2025-09-15T10:00:00.000Z'),
      };

      mockPrismaService.chats.update.mockResolvedValue(mockUpdatedChat);

      const result = await service.update(chatId, updateChatDto);

      expect(mockPrismaService.chats.update).toHaveBeenCalledWith({
        where: { id: chatId },
        data: {
          chatTitle: updateChatDto.chatTitle,
          updatedAt: expect.any(Date),
        },
      });
      expect(mockPrismaService.chats.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockUpdatedChat);
    });

    it('should update with current timestamp', async () => {
      const mockUpdatedChat = {
        id: chatId,
        chatTitle: updateChatDto.chatTitle,
        updatedAt: new Date(),
      };

      mockPrismaService.chats.update.mockResolvedValue(mockUpdatedChat);

      const beforeCall = new Date();
      await service.update(chatId, updateChatDto);
      const afterCall = new Date();

      const callArgs = mockPrismaService.chats.update.mock.calls[0][0];
      const updatedAt = callArgs.data.updatedAt;

      expect(updatedAt).toBeInstanceOf(Date);
      expect(updatedAt.getTime()).toBeGreaterThanOrEqual(beforeCall.getTime());
      expect(updatedAt.getTime()).toBeLessThanOrEqual(afterCall.getTime());
    });

    it('should handle database errors during chat update', async () => {
      const error = new Error('Chat not found');
      mockPrismaService.chats.update.mockRejectedValue(error);

      await expect(service.update(chatId, updateChatDto)).rejects.toThrow(error);
      expect(mockPrismaService.chats.update).toHaveBeenCalledWith({
        where: { id: chatId },
        data: {
          chatTitle: updateChatDto.chatTitle,
          updatedAt: expect.any(Date),
        },
      });
    });

    it('should only update allowed fields', async () => {
      const mockUpdatedChat = {
        id: chatId,
        chatTitle: updateChatDto.chatTitle,
        updatedAt: new Date(),
      };

      mockPrismaService.chats.update.mockResolvedValue(mockUpdatedChat);

      await service.update(chatId, updateChatDto);

      const callArgs = mockPrismaService.chats.update.mock.calls[0][0];
      expect(callArgs.data).toEqual({
        chatTitle: updateChatDto.chatTitle,
        updatedAt: expect.any(Date),
      });
      // Ensure other fields like userId, createdAt are not updated
      expect(callArgs.data.userId).toBeUndefined();
      expect(callArgs.data.createdAt).toBeUndefined();
    });
  });

  describe('remove', () => {
    const chatId = 'chat-123';

    it('should delete chat successfully', async () => {
      const mockDeletedChat = {
        id: chatId,
        userId: 'user-123',
        chatTitle: 'Deleted Chat',
        createdAt: new Date('2025-09-15T08:00:00.000Z'),
        updatedAt: new Date('2025-09-15T09:00:00.000Z'),
      };

      mockPrismaService.chats.delete.mockResolvedValue(mockDeletedChat);

      const result = await service.remove(chatId);

      expect(mockPrismaService.chats.delete).toHaveBeenCalledWith({
        where: { id: chatId },
      });
      expect(mockPrismaService.chats.delete).toHaveBeenCalledTimes(1);
      expect(result).toEqual(mockDeletedChat);
    });

    it('should handle database errors during chat deletion', async () => {
      const error = new Error('Chat not found for deletion');
      mockPrismaService.chats.delete.mockRejectedValue(error);

      await expect(service.remove(chatId)).rejects.toThrow(error);
      expect(mockPrismaService.chats.delete).toHaveBeenCalledWith({
        where: { id: chatId },
      });
    });

    it('should use correct where clause for deletion', async () => {
      const mockDeletedChat = {
        id: chatId,
        chatTitle: 'Deleted Chat',
      };

      mockPrismaService.chats.delete.mockResolvedValue(mockDeletedChat);

      await service.remove(chatId);

      const callArgs = mockPrismaService.chats.delete.mock.calls[0][0];
      expect(callArgs.where).toEqual({ id: chatId });
    });
  });

  describe('dependency injection', () => {
    it('should inject PrismaService correctly', () => {
      expect(prismaService).toBeDefined();
      expect(prismaService).toBe(mockPrismaService);
    });
  });

  describe('service methods existence', () => {
    it('should have all required methods', () => {
      expect(typeof service.create).toBe('function');
      expect(typeof service.findByUser).toBe('function');
      expect(typeof service.update).toBe('function');
      expect(typeof service.remove).toBe('function');
    });
  });
});

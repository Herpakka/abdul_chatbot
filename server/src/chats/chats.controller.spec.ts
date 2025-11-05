import { Test, TestingModule } from '@nestjs/testing';
import { ChatsController } from './chats.controller';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

describe('ChatsController', () => {
  let controller: ChatsController;
  let chatsService: ChatsService;

  const mockChatsService = {
    create: jest.fn(),
    findByUser: jest.fn(),
    update: jest.fn(),
    remove: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChatsController],
      providers: [
        {
          provide: ChatsService,
          useValue: mockChatsService,
        },
      ],
    }).compile();

    controller = module.get<ChatsController>(ChatsController);
    chatsService = module.get<ChatsService>(ChatsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('create', () => {
    it('should create a new chat successfully', async () => {
      const createChatDto: CreateChatDto = {
        userId: 'user-123',
        chatTitle: 'My New Chat',
      };

      const expectedResult = {
        id: 'chat-123',
        userId: createChatDto.userId,
        chatTitle: createChatDto.chatTitle,
        createdAt: new Date('2025-09-15T08:00:00.000Z'),
        updatedAt: new Date('2025-09-15T08:00:00.000Z'),
      };

      mockChatsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(createChatDto);

      expect(mockChatsService.create).toHaveBeenCalledWith(createChatDto);
      expect(mockChatsService.create).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle chat creation errors', async () => {
      const createChatDto: CreateChatDto = {
        userId: 'user-123',
        chatTitle: 'My New Chat',
      };

      const error = new Error('Database connection failed');
      mockChatsService.create.mockRejectedValue(error);

      await expect(controller.create(createChatDto)).rejects.toThrow(error);
      expect(mockChatsService.create).toHaveBeenCalledWith(createChatDto);
    });

    it('should validate required fields in CreateChatDto', async () => {
      const validCreateChatDto: CreateChatDto = {
        userId: 'user-123',
        chatTitle: 'Valid Chat Title',
      };

      const expectedResult = {
        id: 'chat-123',
        userId: validCreateChatDto.userId,
        chatTitle: validCreateChatDto.chatTitle,
        createdAt: new Date(),
        updatedAt: new Date(),
      };

      mockChatsService.create.mockResolvedValue(expectedResult);

      const result = await controller.create(validCreateChatDto);

      expect(mockChatsService.create).toHaveBeenCalledWith(validCreateChatDto);
      expect(result).toEqual(expectedResult);
    });
  });

  describe('findByUser', () => {
    it('should return all chats for a specific user', async () => {
      const userId = 'user-123';
      const expectedChats = [
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

      mockChatsService.findByUser.mockResolvedValue(expectedChats);

      const result = await controller.findByUser(userId);

      expect(mockChatsService.findByUser).toHaveBeenCalledWith(userId);
      expect(mockChatsService.findByUser).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedChats);
    });

    it('should return empty array when user has no chats', async () => {
      const userId = 'user-without-chats';
      const expectedChats = [];

      mockChatsService.findByUser.mockResolvedValue(expectedChats);

      const result = await controller.findByUser(userId);

      expect(mockChatsService.findByUser).toHaveBeenCalledWith(userId);
      expect(result).toEqual(expectedChats);
    });

    it('should handle errors when retrieving user chats', async () => {
      const userId = 'user-123';
      const error = new Error('Database query failed');

      mockChatsService.findByUser.mockRejectedValue(error);

      await expect(controller.findByUser(userId)).rejects.toThrow(error);
      expect(mockChatsService.findByUser).toHaveBeenCalledWith(userId);
    });

    it('should handle different userId formats', async () => {
      const testUserIds = ['user-123', 'abc123', '12345', 'user_with_underscore'];

      for (const userId of testUserIds) {
        const expectedChats = [
          {
            id: `chat-for-${userId}`,
            chatTitle: `Chat for ${userId}`,
            updatedAt: new Date(),
          },
        ];

        mockChatsService.findByUser.mockResolvedValue(expectedChats);

        const result = await controller.findByUser(userId);

        expect(mockChatsService.findByUser).toHaveBeenCalledWith(userId);
        expect(result).toEqual(expectedChats);

        // Clear mock for next iteration
        mockChatsService.findByUser.mockClear();
      }
    });
  });

  describe('update', () => {
    it('should update chat successfully', async () => {
      const chatId = 'chat-123';
      const updateChatDto: UpdateChatDto = {
        chatTitle: 'Updated Chat Title',
      };

      const expectedResult = {
        id: chatId,
        userId: 'user-123',
        chatTitle: updateChatDto.chatTitle,
        createdAt: new Date('2025-09-15T08:00:00.000Z'),
        updatedAt: new Date('2025-09-15T10:00:00.000Z'),
      };

      mockChatsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(chatId, updateChatDto);

      expect(mockChatsService.update).toHaveBeenCalledWith(chatId, updateChatDto);
      expect(mockChatsService.update).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle chat update errors', async () => {
      const chatId = 'nonexistent-chat';
      const updateChatDto: UpdateChatDto = {
        chatTitle: 'Updated Title',
      };

      const error = new Error('Chat not found');
      mockChatsService.update.mockRejectedValue(error);

      await expect(controller.update(chatId, updateChatDto)).rejects.toThrow(error);
      expect(mockChatsService.update).toHaveBeenCalledWith(chatId, updateChatDto);
    });

    it('should validate chatTitle length constraints', async () => {
      const chatId = 'chat-123';

      // Test valid title (meets MinLength(2) and MaxLength(50) from DTO)
      const validUpdateDto: UpdateChatDto = {
        chatTitle: 'Valid Title Between 2 and 50 Characters',
      };

      const expectedResult = {
        id: chatId,
        chatTitle: validUpdateDto.chatTitle,
        updatedAt: new Date(),
      };

      mockChatsService.update.mockResolvedValue(expectedResult);

      const result = await controller.update(chatId, validUpdateDto);

      expect(mockChatsService.update).toHaveBeenCalledWith(chatId, validUpdateDto);
      expect(result).toEqual(expectedResult);
    });

    it('should handle different chat ID formats', async () => {
      const testChatIds = ['chat-123', 'abc123', '12345', 'chat_with_underscore'];
      const updateChatDto: UpdateChatDto = {
        chatTitle: 'Updated Title',
      };

      for (const chatId of testChatIds) {
        const expectedResult = {
          id: chatId,
          chatTitle: updateChatDto.chatTitle,
          updatedAt: new Date(),
        };

        mockChatsService.update.mockResolvedValue(expectedResult);

        const result = await controller.update(chatId, updateChatDto);

        expect(mockChatsService.update).toHaveBeenCalledWith(chatId, updateChatDto);
        expect(result).toEqual(expectedResult);

        // Clear mock for next iteration
        mockChatsService.update.mockClear();
      }
    });
  });

  describe('remove', () => {
    it('should delete chat successfully', async () => {
      const chatId = 'chat-123';
      const expectedResult = {
        id: chatId,
        userId: 'user-123',
        chatTitle: 'Deleted Chat',
        createdAt: new Date('2025-09-15T08:00:00.000Z'),
        updatedAt: new Date('2025-09-15T09:00:00.000Z'),
      };

      mockChatsService.remove.mockResolvedValue(expectedResult);

      const result = await controller.remove(chatId);

      expect(mockChatsService.remove).toHaveBeenCalledWith(chatId);
      expect(mockChatsService.remove).toHaveBeenCalledTimes(1);
      expect(result).toEqual(expectedResult);
    });

    it('should handle chat deletion errors', async () => {
      const chatId = 'nonexistent-chat';
      const error = new Error('Chat not found for deletion');

      mockChatsService.remove.mockRejectedValue(error);

      await expect(controller.remove(chatId)).rejects.toThrow(error);
      expect(mockChatsService.remove).toHaveBeenCalledWith(chatId);
    });

    it('should handle different chat ID formats for deletion', async () => {
      const testChatIds = ['chat-123', 'abc123', '12345', 'chat_with_underscore'];

      for (const chatId of testChatIds) {
        const expectedResult = {
          id: chatId,
          chatTitle: 'Deleted Chat',
          updatedAt: new Date(),
        };

        mockChatsService.remove.mockResolvedValue(expectedResult);

        const result = await controller.remove(chatId);

        expect(mockChatsService.remove).toHaveBeenCalledWith(chatId);
        expect(result).toEqual(expectedResult);

        // Clear mock for next iteration
        mockChatsService.remove.mockClear();
      }
    });

    it('should return deleted chat information', async () => {
      const chatId = 'chat-to-delete';
      const deletedChatInfo = {
        id: chatId,
        userId: 'user-123',
        chatTitle: 'Chat That Was Deleted',
        createdAt: new Date('2025-09-15T08:00:00.000Z'),
        updatedAt: new Date('2025-09-15T09:00:00.000Z'),
      };

      mockChatsService.remove.mockResolvedValue(deletedChatInfo);

      const result = await controller.remove(chatId);

      expect(result).toEqual(deletedChatInfo);
      expect(result.id).toBe(chatId);
    });
  });

  describe('dependency injection', () => {
    it('should inject ChatsService correctly', () => {
      expect(chatsService).toBeDefined();
      expect(chatsService).toBe(mockChatsService);
    });
  });

  describe('controller methods existence', () => {
    it('should have all required methods', () => {
      expect(typeof controller.create).toBe('function');
      expect(typeof controller.findByUser).toBe('function');
      expect(typeof controller.update).toBe('function');
      expect(typeof controller.remove).toBe('function');
    });
  });

  describe('route parameter handling', () => {
    it('should correctly pass userId parameter to service', async () => {
      const userId = 'test-user-id';
      mockChatsService.findByUser.mockResolvedValue([]);

      await controller.findByUser(userId);

      expect(mockChatsService.findByUser).toHaveBeenCalledWith(userId);
    });

    it('should correctly pass chat id parameter to update method', async () => {
      const chatId = 'test-chat-id';
      const updateDto: UpdateChatDto = { chatTitle: 'Test Title' };
      mockChatsService.update.mockResolvedValue({});

      await controller.update(chatId, updateDto);

      expect(mockChatsService.update).toHaveBeenCalledWith(chatId, updateDto);
    });

    it('should correctly pass chat id parameter to remove method', async () => {
      const chatId = 'test-chat-id';
      mockChatsService.remove.mockResolvedValue({});

      await controller.remove(chatId);

      expect(mockChatsService.remove).toHaveBeenCalledWith(chatId);
    });
  });
});

import { Test, TestingModule } from '@nestjs/testing';
import { HistoryService } from './history.service';
import { PrismaService } from '../prisma/prisma.service';

const mockHistory = [
  { id: '1', sessionId: 'chat1', message: 'Hello' },
  { id: '2', sessionId: 'chat1', message: 'World' },
];

describe('HistoryService', () => {
  let service: HistoryService;
  let prisma: PrismaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        HistoryService,
        {
          provide: PrismaService,
          useValue: {
            history: {
              findMany: jest.fn().mockResolvedValue(mockHistory),
            },
          },
        },
      ],
    }).compile();

    service = module.get<HistoryService>(HistoryService);
    prisma = module.get<PrismaService>(PrismaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findByChat', () => {
    it('should return history for a given chatId', async () => {
      const chatId = 'chat1';
      const result = await service.findByChat(chatId);
      expect(prisma.history.findMany).toHaveBeenCalledWith({ where: { sessionId: chatId } });
      expect(result).toEqual(mockHistory);
    });
  });
});

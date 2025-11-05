import { Test, TestingModule } from '@nestjs/testing';
import { HistoryController } from './history.controller';
import { HistoryService } from './history.service';

describe('HistoryController', () => {
  let controller: HistoryController;
  let historyService: HistoryService;

  const mockHistory = [
    { id: '1', sessionId: 'chat1', message: 'Hello' },
    { id: '2', sessionId: 'chat1', message: 'World' },
  ];

  const mockHistoryService = {
    findByChat: jest.fn().mockResolvedValue(mockHistory),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HistoryController],
      providers: [
        {
          provide: HistoryService,
          useValue: mockHistoryService,
        },
      ],
    }).compile();

    controller = module.get<HistoryController>(HistoryController);
    historyService = module.get<HistoryService>(HistoryService);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  describe('findByChat', () => {
    it('should return history for a given chatId', async () => {
      const chatId = 'chat1';
      const result = await controller.findByChat(chatId);
      expect(historyService.findByChat).toHaveBeenCalledWith(chatId);
      expect(result).toEqual(mockHistory);
    });
  });
});

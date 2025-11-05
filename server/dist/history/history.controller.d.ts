import { HistoryService } from './history.service';
export declare class HistoryController {
    private historyService;
    constructor(historyService: HistoryService);
    findByChat(chatId: string): Promise<{
        id: number;
        createdAt: Date;
        sessionId: string;
        message: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
}

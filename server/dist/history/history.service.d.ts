import { PrismaService } from 'src/prisma/prisma.service';
export declare class HistoryService {
    private prisma;
    constructor(prisma: PrismaService);
    findByChat(chatId: string): Promise<{
        id: number;
        createdAt: Date;
        sessionId: string;
        message: import("@prisma/client/runtime/library").JsonValue;
    }[]>;
}

import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
export declare class ChatsController {
    private chatsService;
    constructor(chatsService: ChatsService);
    create(createChatDto: CreateChatDto): Promise<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        chatTitle: string;
    }>;
    findByUser(userId: string): Promise<{
        id: string;
        updatedAt: Date;
        chatTitle: string;
    }[]>;
    update(id: string, updateChatDto: UpdateChatDto): import("@prisma/client").Prisma.Prisma__ChatsClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        chatTitle: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
    remove(id: string): import("@prisma/client").Prisma.Prisma__ChatsClient<{
        id: string;
        createdAt: Date;
        updatedAt: Date;
        userId: string;
        chatTitle: string;
    }, never, import("@prisma/client/runtime/library").DefaultArgs, import("@prisma/client").Prisma.PrismaClientOptions>;
}

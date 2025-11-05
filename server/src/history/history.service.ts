import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class HistoryService {
  constructor(private prisma: PrismaService) {}

  async findByChat(chatId: string) {
    const history = await this.prisma.history.findMany({
      where: { sessionId: chatId },
    });
    return history;
  }
}
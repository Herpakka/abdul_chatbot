import { Injectable } from '@nestjs/common';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';
import { PrismaService } from 'src/prisma/prisma.service';

@Injectable()
export class ChatsService {
  constructor(private prisma: PrismaService) {}

  // create a new chat
  async create(createChatDto: CreateChatDto) {
    const chat = await this.prisma.chats.create({
      data: {
        userId: createChatDto.userId,
        chatTitle: createChatDto.chatTitle,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
    });
    return chat;
  }

  async findByUser(userId: string) {
    const chats = await this.prisma.chats.findMany({
      where: { userId: userId },
      select: {
      id: true,
      chatTitle: true,
      updatedAt: true,
      },
    });
    return chats;
  }

  update(id: string, updateChatDto: UpdateChatDto) {
    return this.prisma.chats.update({
      where: { id: id },
      data: {
        chatTitle: updateChatDto.chatTitle,
        updatedAt: new Date(),
      },
    });
  }

  remove(id: string) {
    return this.prisma.chats.delete({
      where: { id: id },
    });
  }
}

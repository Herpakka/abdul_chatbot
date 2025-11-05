import { Controller, Get, Post, Body, Patch, Put, Param, Delete } from '@nestjs/common';
import { ChatsService } from './chats.service';
import { CreateChatDto } from './dto/create-chat.dto';
import { UpdateChatDto } from './dto/update-chat.dto';

@Controller('chats')
export class ChatsController {
  constructor(private chatsService: ChatsService) {}
  @Post('create')
  create(@Body() createChatDto: CreateChatDto) {
    return this.chatsService.create(createChatDto);
  }

  @Get('list/:userId')
  findByUser(@Param('userId') userId: string) {
    return this.chatsService.findByUser(userId);
  }

  @Put('update/:id')
  update(@Param('id') id: string, @Body() updateChatDto: UpdateChatDto) {
    return this.chatsService.update(id, updateChatDto);
  }

  @Delete('delete/:id')
  remove(@Param('id') id: string) {
    return this.chatsService.remove(id);
  }
}

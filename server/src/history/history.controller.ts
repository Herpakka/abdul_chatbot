import { Controller, Get, Param } from '@nestjs/common';
import { HistoryService } from './history.service';

@Controller('history')
export class HistoryController {
    constructor(private historyService: HistoryService) { }

    @Get(':chatId')
    findByChat(@Param('chatId') chatId: string) {
        return this.historyService.findByChat(chatId);
    }
}

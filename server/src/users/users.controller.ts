import { 
    Controller,
    Get,
    Put,
    Param,
    Body,
    ValidationPipe,
    ParseUUIDPipe
} from '@nestjs/common';
import { AuthService } from 'src/auth/auth.service';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';

@Controller('users')
export class UsersController {
    constructor(private authService: AuthService) {}

    @Get(':id')
    async getUserById(@Param('id', ParseUUIDPipe) id: string) {
        return this.authService.getUserById(id);
    }

    @Put(':id')
    async updateUser(
        @Param('id', ParseUUIDPipe) id: string,
        @Body(ValidationPipe) dto: UpdateUserDto
    ) {
        return this.authService.updateUser(id, dto);
    }
}

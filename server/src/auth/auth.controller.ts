import { Body, Controller, Post, UseGuards, Request, ValidationPipe, Get, Put } from '@nestjs/common';
import { AuthService } from './auth.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
import { Public } from 'src/common/decorators/public.decorator';
import { LocalAuthGuard } from './guards/local-auth.guard';

@Controller('auth')
export class AuthController {
    constructor(private authService: AuthService) {}

    @Public()
    @Post('register')
    async register(@Body(ValidationPipe) dto: CreateUserDto) {
        return this.authService.register(dto);
    }

    @Public()
    @UseGuards(LocalAuthGuard)
    @Post('login')
    async login(@Body() dto: LoginDto) {
        return this.authService.login(dto);
    }

    @Get('profile')
    async getProfile(@Request() req) {
        return this.authService.getUserById(req.user.id);
    }

    @Put('update')
    async updateProfile(@Request() req, @Body(ValidationPipe) dto: UpdateUserDto){
        return this.authService.updateUser(req.user.id, dto);
    }

    @Post('validate')
    async getPasswordById(@Request() req, @Body(ValidationPipe) dto: { password: string }) {
        return this.authService.getPasswordById(req.user.id, dto.password);
    }
}

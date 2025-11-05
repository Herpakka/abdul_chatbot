import { JwtService } from '@nestjs/jwt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';
export declare class AuthService {
    private prisma;
    private jwt;
    private readonly saltRounds;
    constructor(prisma: PrismaService, jwt: JwtService);
    register(dto: CreateUserDto): Promise<{
        email: string;
        username: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    validateUser(email: string, password: string): Promise<any>;
    login(dto: LoginDto): Promise<{
        access_token: string;
    }>;
    updateUser(userId: string, dto: UpdateUserDto): Promise<{
        email: string;
        username: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getUserById(userId: string): Promise<{
        email: string;
        username: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    getPasswordById(userId: string, password: string): Promise<{
        checking: string;
    }>;
}

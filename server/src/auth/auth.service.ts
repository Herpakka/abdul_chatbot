import { ConflictException, Injectable, NotFoundException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateUserDto } from './dto/create-user.dto';
import { LoginDto } from './dto/login.dto';
import { UpdateUserDto } from './dto/update-user.dto';

@Injectable()
export class AuthService {
    private readonly saltRounds = 10;

    constructor(
        private prisma: PrismaService,
        private jwt: JwtService
    ) {}

    async register(dto: CreateUserDto) {
        // check if user exist
        const existUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    {email: dto.email},
                    {username: dto.username}
                ]
            }
        });

        if (existUser) {
            if (existUser.email === dto.email){
                throw new ConflictException('Email already in use');
            }
            if (existUser.username === dto.username) {
                throw new ConflictException('Username already in use');
            }
        }

        // hash password
        const hashedPassword = await bcrypt.hash(dto.password, this.saltRounds);

        // crete user
        const user = await this.prisma.user.create({
            data:{
                email: dto.email,
                username: dto.username,
                password: hashedPassword
            },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
                updatedAt: true
            }
        });
        return user;
    }

    async validateUser(email: string, password: string): Promise<any> {
        const user = await this.prisma.user.findUnique({
            where: {email}
        })

        if (user && await bcrypt.compare(password, user.password)) {
            const {password, ...result} = user;
            return result;
        }
        return null;
    }

    async login(dto: LoginDto){
        const user = await this.prisma.user.findUnique({
            where: {email: dto.email}
        })

        if (!user){
            throw new NotFoundException('User not found');
        }

        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid){
            throw new UnauthorizedException('Invalid credentials');
        }

        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username
        }

        const m = 15;
        const expiresInMs = m * 60 * 1000; // 15 minutes
        const expireDate = new Date(Date.now() + expiresInMs);
        // Convert to Thai timezone (Asia/Bangkok) and ISO format
        const expireAt = expireDate.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }).replace(' ', 'T');

        return {
            access_token: this.jwt.sign(payload, { expiresIn: process.env.JWT_EXPIRES }),
            // expireAt // format: hh.mm.ss
        }
    }

    async updateUser(userId: string, dto: UpdateUserDto){
        // check if user exist
        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId }
        })

        if (!existingUser) throw new NotFoundException('User not found');

        // prepare update data
        const updateData: any = {};

        // handle username update
        if (dto.username){
            const usernameExist = await this.prisma.user.findFirst({
                where: { username: dto.username, NOT: {id: userId} },
            })
            if (usernameExist) throw new ConflictException('Username already in use');
            updateData.username = dto.username;
        }

        // handle password update
        if (dto.password){
            updateData.password = await bcrypt.hash(dto.password, this.saltRounds);
        }

        const updatedUser = await this.prisma.user.update({
            where: { id: userId },
            data: updateData,
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
                updatedAt: true
            }
        })

        return updatedUser;
    }

    async getUserById(userId: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                id: true,
                email: true,
                username: true,
                createdAt: true,
                updatedAt: true
            }
        });

        if (!user) throw new NotFoundException('User not found');
        return user;
    }

    async getPasswordById(userId: string, password: string) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                password: true
            }
        });

        if (!user) return {"checking": "error"};
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) return {"checking": "error"};
        return {
            "checking": "ok",
        };
    }
}

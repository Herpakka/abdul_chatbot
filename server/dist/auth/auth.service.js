"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthService = void 0;
const common_1 = require("@nestjs/common");
const jwt_1 = require("@nestjs/jwt");
const bcrypt = __importStar(require("bcrypt"));
const prisma_service_1 = require("../prisma/prisma.service");
let AuthService = class AuthService {
    prisma;
    jwt;
    saltRounds = 10;
    constructor(prisma, jwt) {
        this.prisma = prisma;
        this.jwt = jwt;
    }
    async register(dto) {
        const existUser = await this.prisma.user.findFirst({
            where: {
                OR: [
                    { email: dto.email },
                    { username: dto.username }
                ]
            }
        });
        if (existUser) {
            if (existUser.email === dto.email) {
                throw new common_1.ConflictException('Email already in use');
            }
            if (existUser.username === dto.username) {
                throw new common_1.ConflictException('Username already in use');
            }
        }
        const hashedPassword = await bcrypt.hash(dto.password, this.saltRounds);
        const user = await this.prisma.user.create({
            data: {
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
    async validateUser(email, password) {
        const user = await this.prisma.user.findUnique({
            where: { email }
        });
        if (user && await bcrypt.compare(password, user.password)) {
            const { password, ...result } = user;
            return result;
        }
        return null;
    }
    async login(dto) {
        const user = await this.prisma.user.findUnique({
            where: { email: dto.email }
        });
        if (!user) {
            throw new common_1.NotFoundException('User not found');
        }
        const isPasswordValid = await bcrypt.compare(dto.password, user.password);
        if (!isPasswordValid) {
            throw new common_1.UnauthorizedException('Invalid credentials');
        }
        const payload = {
            sub: user.id,
            email: user.email,
            username: user.username
        };
        const m = 15;
        const expiresInMs = m * 60 * 1000;
        const expireDate = new Date(Date.now() + expiresInMs);
        const expireAt = expireDate.toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' }).replace(' ', 'T');
        return {
            access_token: this.jwt.sign(payload, { expiresIn: process.env.JWT_EXPIRES }),
        };
    }
    async updateUser(userId, dto) {
        const existingUser = await this.prisma.user.findUnique({
            where: { id: userId }
        });
        if (!existingUser)
            throw new common_1.NotFoundException('User not found');
        const updateData = {};
        if (dto.username) {
            const usernameExist = await this.prisma.user.findFirst({
                where: { username: dto.username, NOT: { id: userId } },
            });
            if (usernameExist)
                throw new common_1.ConflictException('Username already in use');
            updateData.username = dto.username;
        }
        if (dto.password) {
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
        });
        return updatedUser;
    }
    async getUserById(userId) {
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
        if (!user)
            throw new common_1.NotFoundException('User not found');
        return user;
    }
    async getPasswordById(userId, password) {
        const user = await this.prisma.user.findUnique({
            where: { id: userId },
            select: {
                password: true
            }
        });
        if (!user)
            return { "checking": "error" };
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid)
            return { "checking": "error" };
        return {
            "checking": "ok",
        };
    }
};
exports.AuthService = AuthService;
exports.AuthService = AuthService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [prisma_service_1.PrismaService,
        jwt_1.JwtService])
], AuthService);
//# sourceMappingURL=auth.service.js.map
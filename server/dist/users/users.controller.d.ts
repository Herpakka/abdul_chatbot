import { AuthService } from 'src/auth/auth.service';
import { UpdateUserDto } from 'src/auth/dto/update-user.dto';
export declare class UsersController {
    private authService;
    constructor(authService: AuthService);
    getUserById(id: string): Promise<{
        email: string;
        username: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
    updateUser(id: string, dto: UpdateUserDto): Promise<{
        email: string;
        username: string;
        id: string;
        createdAt: Date;
        updatedAt: Date;
    }>;
}

import { IsString, IsNotEmpty, MaxLength, MinLength } from 'class-validator';

export class CreateChatDto {
    @IsString()
    @IsNotEmpty()
    userId: string;

    @IsString()
    @IsNotEmpty()
    @MinLength(2)
    chatTitle: string;
}